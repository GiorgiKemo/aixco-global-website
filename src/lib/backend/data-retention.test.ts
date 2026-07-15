import { describe, expect, it, vi } from "vitest";
import { DATA_RETENTION_WINDOWS, purgeExpiredOperationalData } from "./data-retention";

describe("operational data retention", () => {
  it("uses approved windows and returns exact deletion counts", async () => {
    const client = {
      rpc: vi.fn(async () => ({
        data: [{
          contacts_deleted: 2,
          chats_deleted: 3,
          portal_events_deleted: 4,
          abuse_attempts_deleted: 5,
        }],
        error: null,
      })),
    };

    await expect(purgeExpiredOperationalData(client)).resolves.toEqual({
      contactsDeleted: 2,
      chatsDeleted: 3,
      portalEventsDeleted: 4,
      abuseAttemptsDeleted: 5,
    });
    expect(client.rpc).toHaveBeenCalledWith("purge_expired_operational_data", {
      p_contact_days: DATA_RETENTION_WINDOWS.contacts,
      p_chat_days: DATA_RETENTION_WINDOWS.chats,
      p_portal_days: DATA_RETENTION_WINDOWS.portalEvents,
      p_abuse_attempt_days: DATA_RETENTION_WINDOWS.abuseAttempts,
    });
  });

  it("does not expose database errors", async () => {
    const client = {
      rpc: vi.fn(async () => ({ data: null, error: { message: "sensitive database details", code: "XX001" } })),
    };

    await expect(purgeExpiredOperationalData(client)).rejects.toThrow("Operational data retention failed (XX001).");
  });
});
