import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { hashLeadCaptureIdentity } from "@/lib/backend/lead-capture-abuse";

export const privacyEmailSchema = z.string().trim().email().max(255).transform((value) => value.toLowerCase());

const PRIVACY_EXPORT_COLUMNS = [
  "id",
  "request_reference",
  "created_at",
  "updated_at",
  "source",
  "name",
  "email",
  "interest",
  "message",
  "request_type",
  "phone",
  "preferred_call_at",
  "preferred_call_timezone",
  "locale",
  "page_path",
  "status",
  "metadata",
  "user_agent",
].join(", ");

const PRIVACY_DELIVERY_COLUMNS = [
  "id",
  "created_at",
  "updated_at",
  "contact_submission_id",
  "request_reference",
  "channel",
  "status",
  "attempts",
  "max_attempts",
  "idempotency_key",
  "payload",
  "next_attempt_at",
  "last_attempt_at",
  "locked_at",
  "provider_message_id",
  "provider_accepted_at",
  "provider_event_type",
  "provider_event_at",
  "last_error",
  "requeue_count",
].join(", ");

const PRIVACY_EVENT_COLUMNS = [
  "event_id",
  "received_at",
  "occurred_at",
  "provider_message_id",
  "event_type",
  "contact_email_delivery_id",
  "detail",
].join(", ");

const PRIVACY_CHAT_COLUMNS = [
  "id",
  "session_id",
  "created_at",
  "updated_at",
  "source",
  "interest",
  "transcript",
  "messages",
  "message_count",
  "locale",
  "page_path",
  "status",
  "metadata",
  "user_agent",
].join(", ");

const PRIVACY_ABUSE_COLUMNS = [
  "id",
  "created_at",
  "resource",
  "client_hash",
  "recipient_hash",
  "allowed",
  "reason",
].join(", ");

const PRIVACY_ANALYTICS_SESSION_COLUMNS = [
  "id",
  "visitor_id",
  "consent_version",
  "created_at",
  "updated_at",
  "started_at",
  "last_seen_at",
  "ended_at",
  "active_seconds",
  "landing_path",
  "exit_path",
  "referrer_host",
  "referrer_path",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "locale",
  "timezone",
  "screen_width",
  "screen_height",
  "viewport_width",
  "viewport_height",
  "device_type",
  "browser_name",
  "os_name",
  "user_agent",
  "is_returning",
].join(", ");

const PRIVACY_ANALYTICS_NETWORK_COLUMNS = [
  "session_id",
  "ip_address",
  "ip_hash",
  "country_code",
  "region",
  "city",
  "first_seen_at",
  "last_seen_at",
  "raw_ip_expires_at",
  "raw_ip_purged_at",
].join(", ");

const PRIVACY_ANALYTICS_EVENT_COLUMNS = [
  "id",
  "session_id",
  "received_at",
  "occurred_at",
  "event_type",
  "name",
  "page_path",
  "section_id",
  "target_label",
  "value",
  "duration_ms",
  "scroll_depth",
  "metadata",
].join(", ");

const PRIVACY_PAGE_SIZE = 500;
const PRIVACY_ID_CHUNK_SIZE = 100;
const analyticsSessionIdSchema = z.string().uuid();

function linkedAnalyticsSessionIds(rows: readonly Record<string, unknown>[]) {
  const ids = new Set<string>();

  for (const row of rows) {
    const metadata = row.metadata;
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) continue;

    const parsed = analyticsSessionIdSchema.safeParse(
      (metadata as Record<string, unknown>).analytics_session_id,
    );
    if (parsed.success) ids.add(parsed.data.toLowerCase());
  }

  return [...ids];
}

async function loadLinkedAnalyticsSessionIds(
  supabase: Awaited<ReturnType<typeof getSupabaseAdminClient>>,
  normalizedEmail: string,
) {
  const linkedMetadata: Record<string, unknown>[] = [];

  for (let from = 0; ; from += PRIVACY_PAGE_SIZE) {
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("metadata")
      .eq("email_normalized", normalizedEmail)
      .order("created_at", { ascending: true })
      .range(from, from + PRIVACY_PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Contact analytics linkage lookup failed (${error.code ?? "database_error"}).`);
    }
    linkedMetadata.push(...(data ?? []));
    if (!data || data.length < PRIVACY_PAGE_SIZE) break;
  }

  // A visitor can also provide an email address inside chat. Those rows are
  // part of the subject export/deletion contract, so preserve their explicit
  // analytics session linkage as well.
  for (let from = 0; ; from += PRIVACY_PAGE_SIZE) {
    const { data, error } = await supabase
      .from("chat_transcripts")
      .select("metadata")
      .ilike("transcript", `%${normalizedEmail.replace(/[\\%_]/g, "\\$&")}%`)
      .order("created_at", { ascending: true })
      .range(from, from + PRIVACY_PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Chat analytics linkage lookup failed (${error.code ?? "database_error"}).`);
    }
    linkedMetadata.push(...(data ?? []));
    if (!data || data.length < PRIVACY_PAGE_SIZE) break;
  }

  return linkedAnalyticsSessionIds(linkedMetadata);
}

export function privacySubjectAuditTarget(email: string) {
  const normalizedEmail = privacyEmailSchema.parse(email);
  const digest = hashLeadCaptureIdentity(`privacy-subject:${normalizedEmail}`);
  return digest ? `email-hmac:${digest.slice(0, 24)}` : "email-hmac:unavailable";
}

export async function exportContactSubjectData(email: string) {
  const normalizedEmail = privacyEmailSchema.parse(email);
  const recipientHash = hashLeadCaptureIdentity(`recipient:${normalizedEmail}`);
  if (!recipientHash) throw new Error("Contact subject export is not configured.");
  const supabase = await getSupabaseAdminClient();
  const contactSubmissions: Record<string, unknown>[] = [];
  const chatTranscripts: Record<string, unknown>[] = [];
  const leadCaptureAttempts: Record<string, unknown>[] = [];

  for (let from = 0; ; from += PRIVACY_PAGE_SIZE) {
    const { data, error } = await supabase
      .from("contact_submissions")
      .select(PRIVACY_EXPORT_COLUMNS)
      .eq("email_normalized", normalizedEmail)
      .order("created_at", { ascending: true })
      .range(from, from + PRIVACY_PAGE_SIZE - 1);

    if (error) throw new Error(`Contact subject export failed (${error.code ?? "database_error"}).`);
    contactSubmissions.push(...(data ?? []));
    if (!data || data.length < PRIVACY_PAGE_SIZE) break;
  }

  for (let from = 0; ; from += PRIVACY_PAGE_SIZE) {
    const { data, error } = await supabase
      .from("lead_capture_attempts")
      .select(PRIVACY_ABUSE_COLUMNS)
      .eq("resource", "contact")
      .eq("recipient_hash", recipientHash)
      .order("created_at", { ascending: true })
      .range(from, from + PRIVACY_PAGE_SIZE - 1);
    if (error) throw new Error(`Contact abuse-control export failed (${error.code ?? "database_error"}).`);
    leadCaptureAttempts.push(...(data ?? []));
    if (!data || data.length < PRIVACY_PAGE_SIZE) break;
  }

  // Chat has no dedicated email column. Include transcripts in which the
  // normalized address appears verbatim so a subject export does not silently
  // omit data the visitor typed into the chat itself.
  for (let from = 0; ; from += PRIVACY_PAGE_SIZE) {
    const { data, error } = await supabase
      .from("chat_transcripts")
      .select(PRIVACY_CHAT_COLUMNS)
      .ilike("transcript", `%${normalizedEmail.replace(/[\\%_]/g, "\\$&")}%`)
      .order("created_at", { ascending: true })
      .range(from, from + PRIVACY_PAGE_SIZE - 1);

    if (error) throw new Error(`Chat subject export failed (${error.code ?? "database_error"}).`);
    chatTranscripts.push(...(data ?? []));
    if (!data || data.length < PRIVACY_PAGE_SIZE) break;
  }

  const submissionIds = contactSubmissions.map((row) => String(row.id));
  const emailDeliveries: Record<string, unknown>[] = [];
  for (let offset = 0; offset < submissionIds.length; offset += PRIVACY_ID_CHUNK_SIZE) {
    const ids = submissionIds.slice(offset, offset + PRIVACY_ID_CHUNK_SIZE);
    for (let from = 0; ; from += PRIVACY_PAGE_SIZE) {
      const { data, error } = await supabase
        .from("contact_email_deliveries")
        .select(PRIVACY_DELIVERY_COLUMNS)
        .in("contact_submission_id", ids)
        .order("created_at", { ascending: true })
        .range(from, from + PRIVACY_PAGE_SIZE - 1);
      if (error) throw new Error(`Contact delivery export failed (${error.code ?? "database_error"}).`);
      emailDeliveries.push(...(data ?? []));
      if (!data || data.length < PRIVACY_PAGE_SIZE) break;
    }
  }

  const deliveryIds = emailDeliveries.map((row) => String(row.id));
  const emailEvents: Record<string, unknown>[] = [];
  for (let offset = 0; offset < deliveryIds.length; offset += PRIVACY_ID_CHUNK_SIZE) {
    const ids = deliveryIds.slice(offset, offset + PRIVACY_ID_CHUNK_SIZE);
    for (let from = 0; ; from += PRIVACY_PAGE_SIZE) {
      const { data, error } = await supabase
        .from("contact_email_events")
        .select(PRIVACY_EVENT_COLUMNS)
        .in("contact_email_delivery_id", ids)
        .order("occurred_at", { ascending: true })
        .range(from, from + PRIVACY_PAGE_SIZE - 1);
      if (error) throw new Error(`Contact delivery event export failed (${error.code ?? "database_error"}).`);
      emailEvents.push(...(data ?? []));
      if (!data || data.length < PRIVACY_PAGE_SIZE) break;
    }
  }

  const analyticsSessionIds = linkedAnalyticsSessionIds([
    ...contactSubmissions,
    ...chatTranscripts,
  ]);
  const analyticsSessions: Record<string, unknown>[] = [];
  const analyticsSessionNetwork: Record<string, unknown>[] = [];
  const analyticsEvents: Record<string, unknown>[] = [];

  for (let offset = 0; offset < analyticsSessionIds.length; offset += PRIVACY_ID_CHUNK_SIZE) {
    const ids = analyticsSessionIds.slice(offset, offset + PRIVACY_ID_CHUNK_SIZE);

    for (let from = 0; ; from += PRIVACY_PAGE_SIZE) {
      const { data, error } = await supabase
        .from("site_analytics_sessions")
        .select(PRIVACY_ANALYTICS_SESSION_COLUMNS)
        .in("id", ids)
        .order("started_at", { ascending: true })
        .range(from, from + PRIVACY_PAGE_SIZE - 1);
      if (error) throw new Error(`Analytics session export failed (${error.code ?? "database_error"}).`);
      analyticsSessions.push(...(data ?? []));
      if (!data || data.length < PRIVACY_PAGE_SIZE) break;
    }

    for (let from = 0; ; from += PRIVACY_PAGE_SIZE) {
      const { data, error } = await supabase
        .from("site_analytics_session_network")
        .select(PRIVACY_ANALYTICS_NETWORK_COLUMNS)
        .in("session_id", ids)
        .order("first_seen_at", { ascending: true })
        .range(from, from + PRIVACY_PAGE_SIZE - 1);
      if (error) throw new Error(`Analytics network export failed (${error.code ?? "database_error"}).`);
      analyticsSessionNetwork.push(...(data ?? []));
      if (!data || data.length < PRIVACY_PAGE_SIZE) break;
    }

    for (let from = 0; ; from += PRIVACY_PAGE_SIZE) {
      const { data, error } = await supabase
        .from("site_analytics_events")
        .select(PRIVACY_ANALYTICS_EVENT_COLUMNS)
        .in("session_id", ids)
        .order("occurred_at", { ascending: true })
        .range(from, from + PRIVACY_PAGE_SIZE - 1);
      if (error) throw new Error(`Analytics event export failed (${error.code ?? "database_error"}).`);
      analyticsEvents.push(...(data ?? []));
      if (!data || data.length < PRIVACY_PAGE_SIZE) break;
    }
  }

  return {
    subject: normalizedEmail,
    exportedAt: new Date().toISOString(),
    contactSubmissions,
    chatTranscripts,
    emailDeliveries,
    emailEvents,
    leadCaptureAttempts,
    analyticsSessions,
    analyticsSessionNetwork,
    analyticsEvents,
  };
}

export async function deleteContactSubjectData(email: string) {
  const normalizedEmail = privacyEmailSchema.parse(email);
  const recipientHash = hashLeadCaptureIdentity(`recipient:${normalizedEmail}`);
  if (!recipientHash) throw new Error("Contact subject deletion is not configured.");
  const supabase = await getSupabaseAdminClient();
  const analyticsSessionIds = await loadLinkedAnalyticsSessionIds(supabase, normalizedEmail);
  // Keep this explicit until the generated Supabase client RPC generic no
  // longer collapses known function arguments to `undefined` in this build.
  const privacyRpcClient = supabase as unknown as {
    rpc: (
      fn: "delete_contact_subject_data",
      args: { p_email: string; p_recipient_hash: string },
    ) => Promise<{
      data: { contacts_deleted: number; chats_deleted: number; abuse_attempts_deleted: number }[] | null;
      error: { message: string; code?: string } | null;
    }>;
  };
  // Delete linked analytics first while the contact metadata still preserves
  // the relationship. If the subject RPC then fails, a retry can safely find
  // the same IDs and complete the remaining deletion. Doing this in the
  // opposite order could orphan analytics rows after a transient failure.
  let analyticsSessionsDeleted = 0;
  for (let offset = 0; offset < analyticsSessionIds.length; offset += PRIVACY_ID_CHUNK_SIZE) {
    const ids = analyticsSessionIds.slice(offset, offset + PRIVACY_ID_CHUNK_SIZE);
    const { data: deletedSessions, error: analyticsError } = await supabase
      .from("site_analytics_sessions")
      .delete()
      .in("id", ids)
      .select("id");
    if (analyticsError) {
      throw new Error(`Contact analytics deletion failed (${analyticsError.code ?? "database_error"}).`);
    }
    if (!deletedSessions) throw new Error("Contact analytics deletion did not return a summary.");
    analyticsSessionsDeleted += deletedSessions.length;
  }

  const { data, error } = await privacyRpcClient.rpc("delete_contact_subject_data", {
    p_email: normalizedEmail,
    p_recipient_hash: recipientHash,
  });

  if (error) throw new Error(`Contact subject deletion failed (${error.code ?? "database_error"}).`);
  const result = data?.[0];
  if (!result) throw new Error("Contact subject deletion did not return a summary.");

  return {
    subject: normalizedEmail,
    contactsDeleted: result.contacts_deleted,
    chatsDeleted: result.chats_deleted,
    abuseAttemptsDeleted: result.abuse_attempts_deleted,
    analyticsSessionsDeleted,
    deleted:
      result.contacts_deleted +
      result.chats_deleted +
      result.abuse_attempts_deleted +
      analyticsSessionsDeleted,
  };
}
