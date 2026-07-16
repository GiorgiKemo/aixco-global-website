import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const DATA_RETENTION_WINDOWS = {
  contacts: 730,
  chats: 365,
  portalEvents: 180,
  abuseAttempts: 7,
  unmatchedEmailEvents: 30,
  telemetry: 30,
} as const;

export type DataRetentionSummary = {
  contactsDeleted: number;
  chatsDeleted: number;
  portalEventsDeleted: number;
  abuseAttemptsDeleted: number;
  unmatchedEmailEventsDeleted: number;
  telemetryEventsDeleted: number;
};

type RetentionRow = {
  contacts_deleted: number;
  chats_deleted: number;
  portal_events_deleted: number;
  abuse_attempts_deleted: number;
  orphan_email_events_deleted: number;
  telemetry_events_deleted: number;
};

type RetentionClient = {
  rpc: (
    fn: "purge_expired_operational_data",
    args: {
      p_contact_days: number;
      p_chat_days: number;
      p_portal_days: number;
      p_abuse_attempt_days: number;
      p_email_event_days: number;
      p_telemetry_days: number;
    },
  ) => Promise<{ data: RetentionRow[] | null; error: { message: string; code?: string } | null }>;
};

export async function purgeExpiredOperationalData(client?: RetentionClient): Promise<DataRetentionSummary> {
  const supabase = client ?? ((await getSupabaseAdminClient()) as unknown as RetentionClient);
  const { data, error } = await supabase.rpc("purge_expired_operational_data", {
    p_contact_days: DATA_RETENTION_WINDOWS.contacts,
    p_chat_days: DATA_RETENTION_WINDOWS.chats,
    p_portal_days: DATA_RETENTION_WINDOWS.portalEvents,
    p_abuse_attempt_days: DATA_RETENTION_WINDOWS.abuseAttempts,
    p_email_event_days: DATA_RETENTION_WINDOWS.unmatchedEmailEvents,
    p_telemetry_days: DATA_RETENTION_WINDOWS.telemetry,
  });

  if (error) {
    throw new Error(`Operational data retention failed (${error.code ?? "database_error"}).`);
  }

  const summary = data?.[0];
  if (!summary) throw new Error("Operational data retention did not return a summary.");

  return {
    contactsDeleted: summary.contacts_deleted,
    chatsDeleted: summary.chats_deleted,
    portalEventsDeleted: summary.portal_events_deleted,
    abuseAttemptsDeleted: summary.abuse_attempts_deleted,
    unmatchedEmailEventsDeleted: summary.orphan_email_events_deleted,
    telemetryEventsDeleted: summary.telemetry_events_deleted,
  };
}
import "server-only";
