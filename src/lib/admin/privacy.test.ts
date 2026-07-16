import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getClient: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ getSupabaseAdminClient: mocks.getClient }));

import {
  deleteContactSubjectData,
  exportContactSubjectData,
  privacySubjectAuditTarget,
} from "./privacy";

function createPagedClient(dataByTable: Record<string, Record<string, unknown>[]>) {
  const ranges: { table: string; from: number; to: number }[] = [];
  return {
    ranges,
    from(table: string) {
      const builder = {
        select: () => builder,
        eq: () => builder,
        ilike: () => builder,
        in: () => builder,
        order: () => builder,
        async range(from: number, to: number) {
          ranges.push({ table, from, to });
          return { data: (dataByTable[table] ?? []).slice(from, to + 1), error: null };
        },
      };
      return builder;
    },
  };
}

describe("admin subject privacy operations", () => {
  beforeEach(() => vi.clearAllMocks());

  it("paginates forms and every linked delivery/event query beyond the PostgREST row cap", async () => {
    const contacts = Array.from({ length: 501 }, (_, index) => ({ id: `contact-${index}` }));
    const deliveries = [
      { id: "delivery-1", contact_submission_id: "contact-0", payload: { email: "subject@example.com" } },
      { id: "delivery-2", contact_submission_id: "contact-0", payload: {} },
    ];
    const events = Array.from({ length: 1001 }, (_, index) => ({
      event_id: `event-${index}`,
      contact_email_delivery_id: index % 2 ? "delivery-1" : "delivery-2",
    }));
    const client = createPagedClient({
      contact_submissions: contacts,
      chat_transcripts: [],
      contact_email_deliveries: deliveries,
      contact_email_events: events,
      lead_capture_attempts: [{ id: "attempt-1", resource: "contact" }],
    });
    mocks.getClient.mockResolvedValue(client);

    const result = await exportContactSubjectData("Subject@Example.com");
    expect(result.contactSubmissions).toHaveLength(501);
    expect(result.emailDeliveries).toHaveLength(12); // six 100-id chunks, two mocked rows each
    expect(result.emailEvents).toHaveLength(1001);
    expect(result.leadCaptureAttempts).toHaveLength(1);
    expect(client.ranges.filter((range) => range.table === "contact_submissions")).toHaveLength(2);
    expect(client.ranges.filter((range) => range.table === "contact_email_events").length).toBeGreaterThan(2);
  });

  it("uses an atomic deletion summary and never exposes the raw subject in audit targets", async () => {
    const rpc = vi.fn(async () => ({
      data: [{ contacts_deleted: 2, chats_deleted: 1, abuse_attempts_deleted: 4 }],
      error: null,
    }));
    mocks.getClient.mockResolvedValue({
      rpc,
    });

    await expect(deleteContactSubjectData("Subject@Example.com")).resolves.toEqual({
      subject: "subject@example.com",
      contactsDeleted: 2,
      chatsDeleted: 1,
      abuseAttemptsDeleted: 4,
      deleted: 7,
    });
    expect(rpc).toHaveBeenCalledWith("delete_contact_subject_data", {
      p_email: "subject@example.com",
      p_recipient_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
    });
    expect(privacySubjectAuditTarget("Subject@Example.com")).toMatch(/^email-sha256:[a-f0-9]{24}$/);
    expect(privacySubjectAuditTarget("Subject@Example.com")).not.toContain("subject@example.com");
  });
});
