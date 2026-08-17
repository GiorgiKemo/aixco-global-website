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
  "next_attempt_at",
  "last_attempt_at",
  "provider_accepted_at",
  "provider_event_type",
  "provider_event_at",
  "requeue_count",
].join(", ");

const PRIVACY_EVENT_COLUMNS = [
  "received_at",
  "occurred_at",
  "event_type",
  "contact_email_delivery_id",
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

const PRIVACY_PAGE_SIZE = 500;
const PRIVACY_ID_CHUNK_SIZE = 100;

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
      .order("id", { ascending: true })
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
      .order("id", { ascending: true })
      .range(from, from + PRIVACY_PAGE_SIZE - 1);
    if (error) throw new Error(`Contact abuse-control export failed (${error.code ?? "database_error"}).`);
    leadCaptureAttempts.push(...(data ?? []));
    if (!data || data.length < PRIVACY_PAGE_SIZE) break;
  }

  // A free-text email mention does not prove who the chat belongs to. Chats
  // remain unattributed until the product captures a structured, verified
  // subject address; automated email-based export/deletion must skip them.

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
        .order("id", { ascending: true })
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
        .order("event_id", { ascending: true })
        .range(from, from + PRIVACY_PAGE_SIZE - 1);
      if (error) throw new Error(`Contact delivery event export failed (${error.code ?? "database_error"}).`);
      emailEvents.push(...(data ?? []));
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
  };
}

export async function previewContactSubjectData(email: string) {
  const data = await exportContactSubjectData(email);

  return {
    subject: data.subject,
    contactSubmissions: data.contactSubmissions.length,
    chatTranscripts: data.chatTranscripts.length,
    emailDeliveries: data.emailDeliveries.length,
    emailEvents: data.emailEvents.length,
    abuseAttempts: data.leadCaptureAttempts.length,
    total:
      data.contactSubmissions.length
      + data.chatTranscripts.length
      + data.emailDeliveries.length
      + data.emailEvents.length
      + data.leadCaptureAttempts.length,
  };
}

export async function deleteContactSubjectData(email: string) {
  const normalizedEmail = privacyEmailSchema.parse(email);
  const recipientHash = hashLeadCaptureIdentity(`recipient:${normalizedEmail}`);
  if (!recipientHash) throw new Error("Contact subject deletion is not configured.");
  const supabase = await getSupabaseAdminClient();
  // Keep this explicit until the generated Supabase client RPC generic no
  // longer collapses known function arguments to `undefined` in this build.
  const privacyRpcClient = supabase as unknown as {
    rpc: (
      fn: "delete_contact_subject_data",
      args: { p_email: string; p_recipient_hash: string },
    ) => Promise<{
      data: {
        contacts_deleted: number;
        chats_deleted: number;
        abuse_attempts_deleted: number;
        analytics_sessions_deleted: number;
      }[] | null;
      error: { message: string; code?: string } | null;
    }>;
  };
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
    analyticsSessionsDeleted: result.analytics_sessions_deleted,
    deleted:
      result.contacts_deleted +
      result.chats_deleted +
      result.abuse_attempts_deleted +
      result.analytics_sessions_deleted,
  };
}
