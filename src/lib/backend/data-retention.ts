import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const DATA_RETENTION_WINDOWS = {
  contacts: 730,
  chats: 365,
  portalEvents: 180,
  abuseAttempts: 7,
  unmatchedEmailEvents: 30,
  telemetry: 180,
  analyticsEvents: 180,
  analyticsSessions: 395,
  analyticsRawIps: 30,
  adminAuditEvents: 730,
  adminLoginRateLimits: 1,
} as const;

export type DataRetentionSummary = {
  contactsDeleted: number;
  chatsDeleted: number;
  portalEventsDeleted: number;
  abuseAttemptsDeleted: number;
  unmatchedEmailEventsDeleted: number;
  telemetryEventsDeleted: number;
  analyticsEventsDeleted: number;
  analyticsSessionsDeleted: number;
  adminAuditEventsDeleted: number;
  adminLoginRateLimitsDeleted: number;
  analyticsNetworkIpsScrubbed: number;
  adminAuditIpsScrubbed: number;
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
    fn: string,
    args: Record<string, number>,
  ) => Promise<{ data: unknown; error: { message: string; code?: string } | null }>;
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

  const summary = (data as RetentionRow[] | null)?.[0];
  if (!summary) throw new Error("Operational data retention did not return a summary.");

  const analyticsResult = await supabase.rpc("purge_site_analytics_data", {
    p_event_days: DATA_RETENTION_WINDOWS.analyticsEvents,
    p_session_days: DATA_RETENTION_WINDOWS.analyticsSessions,
    p_raw_ip_days: DATA_RETENTION_WINDOWS.analyticsRawIps,
    p_audit_days: DATA_RETENTION_WINDOWS.adminAuditEvents,
    p_admin_login_limit_days: DATA_RETENTION_WINDOWS.adminLoginRateLimits,
  });
  if (analyticsResult.error) {
    throw new Error(`Analytics data retention failed (${analyticsResult.error.code ?? "database_error"}).`);
  }
  const analytics = analyticsResult.data as Partial<{
    eventsDeleted: number;
    sessionsDeleted: number;
    adminAuditEventsDeleted: number;
    adminLoginRateLimitsDeleted: number;
    networkIpsScrubbed: number;
    adminIpsScrubbed: number;
  }> | null;
  if (!analytics) throw new Error("Analytics data retention did not return a summary.");

  return {
    contactsDeleted: summary.contacts_deleted,
    chatsDeleted: summary.chats_deleted,
    portalEventsDeleted: summary.portal_events_deleted,
    abuseAttemptsDeleted: summary.abuse_attempts_deleted,
    unmatchedEmailEventsDeleted: summary.orphan_email_events_deleted,
    telemetryEventsDeleted: summary.telemetry_events_deleted,
    analyticsEventsDeleted: analytics.eventsDeleted ?? 0,
    analyticsSessionsDeleted: analytics.sessionsDeleted ?? 0,
    adminAuditEventsDeleted: analytics.adminAuditEventsDeleted ?? 0,
    adminLoginRateLimitsDeleted: analytics.adminLoginRateLimitsDeleted ?? 0,
    analyticsNetworkIpsScrubbed: analytics.networkIpsScrubbed ?? 0,
    adminAuditIpsScrubbed: analytics.adminIpsScrubbed ?? 0,
  };
}
