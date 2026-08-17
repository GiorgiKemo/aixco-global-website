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
  const inCalls: { table: string; column: string; values: unknown[] }[] = [];
  const eqCalls: { table: string; column: string; value: unknown }[] = [];
  const ilikeCalls: { table: string; column: string; value: unknown }[] = [];
  return {
    ranges,
    inCalls,
    eqCalls,
    ilikeCalls,
    from(table: string) {
      const builder = {
        select: () => builder,
        eq(column: string, value: unknown) {
          eqCalls.push({ table, column, value });
          return builder;
        },
        ilike(column: string, value: unknown) {
          ilikeCalls.push({ table, column, value });
          return builder;
        },
        in(column: string, values: unknown[]) {
          inCalls.push({ table, column, values });
          return builder;
        },
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

const linkedSessionId = "2e62b77e-cc8c-4e04-b26c-809b5813f455";
const secondLinkedSessionId = "a8756294-bbea-4b07-a657-986641ff49b2";

function createDeletionClient(options?: {
  rpcError?: { code?: string; message: string } | null;
  analyticsSessionsDeleted?: number;
}) {
  const actions: string[] = [];
  const rpc = vi.fn(async () => {
    actions.push("rpc");
    return {
      data: options?.rpcError
        ? null
        : [{
            contacts_deleted: 2,
            chats_deleted: 0,
            abuse_attempts_deleted: 4,
            analytics_sessions_deleted: options?.analyticsSessionsDeleted ?? 2,
          }],
      error: options?.rpcError ?? null,
    };
  });

  return {
    actions,
    rpc,
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

  it("never treats an anonymous analytics session as exclusively attributable to an email", async () => {
    const client = createPagedClient({
      contact_submissions: [
        { id: "contact-1", metadata: { analytics_session_id: linkedSessionId, analytics_session_verified: true } },
        { id: "contact-2", metadata: { analytics_session_id: linkedSessionId.toUpperCase(), analytics_session_verified: true } },
        { id: "contact-3", metadata: { analytics_session_id: secondLinkedSessionId, analytics_session_verified: true } },
        { id: "contact-4", metadata: { analytics_session_id: "not-a-uuid", analytics_session_verified: true } },
        { id: "contact-5", metadata: { analytics_session_id: 123, analytics_session_verified: true } },
        { id: "contact-6", metadata: [linkedSessionId] },
        { id: "contact-7", metadata: { unrelated: linkedSessionId } },
        { id: "contact-8", metadata: { analytics_session_id: "6527dba7-3040-40fe-b965-9b278610f7b7" } },
      ],
      chat_transcripts: [
        { id: "chat-1", metadata: { analytics_session_id: secondLinkedSessionId, analytics_session_verified: true } },
      ],
      contact_email_deliveries: [],
      contact_email_events: [],
      lead_capture_attempts: [],
      site_analytics_sessions: [
        { id: linkedSessionId, visitor_id: "visitor-1" },
        { id: secondLinkedSessionId, visitor_id: "visitor-2" },
      ],
      site_analytics_session_network: [
        { session_id: linkedSessionId, country_code: "AT" },
        { session_id: secondLinkedSessionId, country_code: "CH" },
      ],
      site_analytics_events: [
        { id: "event-1", session_id: linkedSessionId },
        { id: "event-2", session_id: secondLinkedSessionId },
      ],
    });
    mocks.getClient.mockResolvedValue(client);

    const result = await exportContactSubjectData("Subject@Example.com");

    expect(result).not.toHaveProperty("analyticsSessions");
    expect(result).not.toHaveProperty("analyticsSessionNetwork");
    expect(result).not.toHaveProperty("analyticsEvents");
    const analyticsInCalls = client.inCalls.filter(({ table }) => table.startsWith("site_analytics_"));
    expect(analyticsInCalls).toHaveLength(0);
    expect(result.chatTranscripts).toEqual([]);
    expect(client.ranges.some(({ table }) => table === "chat_transcripts")).toBe(false);
    expect(client.ilikeCalls).toEqual([]);
  });

  it("delegates the complete subject deletion to one transactional RPC", async () => {
    const client = createDeletionClient({ analyticsSessionsDeleted: 0 });
    mocks.getClient.mockResolvedValue(client);

    await expect(deleteContactSubjectData("Subject@Example.com")).resolves.toEqual({
      subject: "subject@example.com",
      contactsDeleted: 2,
      chatsDeleted: 0,
      abuseAttemptsDeleted: 4,
      analyticsSessionsDeleted: 0,
      deleted: 6,
    });
    expect(client.rpc).toHaveBeenCalledWith("delete_contact_subject_data", {
      p_email: "subject@example.com",
      p_recipient_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
    });
    expect(client.actions).toEqual(["rpc"]);
    expect(privacySubjectAuditTarget("Subject@Example.com")).toMatch(/^email-hmac:[a-f0-9]{24}$/);
    expect(privacySubjectAuditTarget("Subject@Example.com")).not.toContain("subject@example.com");
  });

  it("returns the atomic RPC summary when there are no linked analytics sessions", async () => {
    const client = createDeletionClient({ analyticsSessionsDeleted: 0 });
    mocks.getClient.mockResolvedValue(client);

    await expect(deleteContactSubjectData("subject@example.com")).resolves.toMatchObject({
      analyticsSessionsDeleted: 0,
      chatsDeleted: 0,
      deleted: 6,
    });
    expect(client.actions).toEqual(["rpc"]);
  });

  it("fails closed when the transactional deletion RPC fails", async () => {
    const client = createDeletionClient({
      rpcError: { code: "42501", message: "denied" },
    });
    mocks.getClient.mockResolvedValue(client);

    await expect(deleteContactSubjectData("subject@example.com")).rejects.toThrow(
      "Contact subject deletion failed (42501).",
    );
    expect(client.actions).toEqual(["rpc"]);
  });
});
