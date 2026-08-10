import { describe, expect, it, vi } from "vitest";
import { DATA_RETENTION_WINDOWS, purgeExpiredOperationalData } from "./data-retention";

describe("operational data retention", () => {
  it("uses approved windows and returns exact deletion counts", async () => {
    const client = {
      rpc: vi.fn(async (fn: string) => fn === "purge_expired_operational_data"
        ? {
            data: [{
              contacts_deleted: 2,
              chats_deleted: 3,
              portal_events_deleted: 4,
              abuse_attempts_deleted: 5,
              orphan_email_events_deleted: 6,
              telemetry_events_deleted: 7,
            }],
            error: null,
          }
        : {
            data: {
              eventsDeleted: 8,
              sessionsDeleted: 9,
              adminAuditEventsDeleted: 10,
              adminLoginRateLimitsDeleted: 11,
              networkIpsScrubbed: 12,
              adminIpsScrubbed: 13,
            },
            error: null,
          }),
    };

    await expect(purgeExpiredOperationalData(client)).resolves.toEqual({
      contactsDeleted: 2,
      chatsDeleted: 3,
      portalEventsDeleted: 4,
      abuseAttemptsDeleted: 5,
      unmatchedEmailEventsDeleted: 6,
      telemetryEventsDeleted: 7,
      analyticsEventsDeleted: 8,
      analyticsSessionsDeleted: 9,
      adminAuditEventsDeleted: 10,
      adminLoginRateLimitsDeleted: 11,
      analyticsNetworkIpsScrubbed: 12,
      adminAuditIpsScrubbed: 13,
    });
    expect(client.rpc).toHaveBeenCalledWith("purge_expired_operational_data", {
      p_contact_days: DATA_RETENTION_WINDOWS.contacts,
      p_chat_days: DATA_RETENTION_WINDOWS.chats,
      p_portal_days: DATA_RETENTION_WINDOWS.portalEvents,
      p_abuse_attempt_days: DATA_RETENTION_WINDOWS.abuseAttempts,
      p_email_event_days: DATA_RETENTION_WINDOWS.unmatchedEmailEvents,
      p_telemetry_days: DATA_RETENTION_WINDOWS.telemetry,
    });
    expect(client.rpc).toHaveBeenCalledWith("purge_site_analytics_data", {
      p_event_days: DATA_RETENTION_WINDOWS.analyticsEvents,
      p_session_days: DATA_RETENTION_WINDOWS.analyticsSessions,
      p_raw_ip_days: DATA_RETENTION_WINDOWS.analyticsRawIps,
      p_audit_days: DATA_RETENTION_WINDOWS.adminAuditEvents,
      p_admin_login_limit_days: DATA_RETENTION_WINDOWS.adminLoginRateLimits,
    });
    expect(client.rpc).toHaveBeenCalledTimes(2);
  });

  it("does not expose database errors", async () => {
    const client = {
      rpc: vi.fn(async () => ({ data: null, error: { message: "sensitive database details", code: "XX001" } })),
    };

    await expect(purgeExpiredOperationalData(client)).rejects.toThrow("Operational data retention failed (XX001).");
  });

  it("reports a bounded analytics retention error after operational cleanup", async () => {
    const client = {
      rpc: vi.fn(async (fn: string) => fn === "purge_expired_operational_data"
        ? {
            data: [{
              contacts_deleted: 0,
              chats_deleted: 0,
              portal_events_deleted: 0,
              abuse_attempts_deleted: 0,
              orphan_email_events_deleted: 0,
              telemetry_events_deleted: 0,
            }],
            error: null,
          }
        : {
            data: null,
            error: { message: "sensitive analytics details", code: "42501" },
          }),
    };

    await expect(purgeExpiredOperationalData(client)).rejects.toThrow(
      "Analytics data retention failed (42501).",
    );
    expect(client.rpc).toHaveBeenCalledTimes(2);
  });
});
