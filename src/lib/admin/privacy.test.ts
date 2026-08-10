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
  return {
    ranges,
    inCalls,
    from(table: string) {
      const builder = {
        select: () => builder,
        eq: () => builder,
        ilike: () => builder,
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
  contacts?: Record<string, unknown>[];
  chats?: Record<string, unknown>[];
  lookupError?: { code?: string; message: string } | null;
  rpcError?: { code?: string; message: string } | null;
  analyticsDeleteError?: { code?: string; message: string } | null;
}) {
  const actions: string[] = [];
  const deleteIds: unknown[][] = [];
  const rpc = vi.fn(async () => {
    actions.push("rpc");
    return {
      data: options?.rpcError
        ? null
        : [{ contacts_deleted: 2, chats_deleted: 1, abuse_attempts_deleted: 4 }],
      error: options?.rpcError ?? null,
    };
  });

  return {
    actions,
    deleteIds,
    rpc,
    from(table: string) {
      if (table === "contact_submissions" || table === "chat_transcripts") {
        const builder = {
          select: () => builder,
          eq: () => builder,
          ilike: () => builder,
          order: () => builder,
          async range() {
            actions.push(`lookup:${table}`);
            return options?.lookupError
              ? { data: null, error: options.lookupError }
              : {
                  data: table === "contact_submissions"
                    ? options?.contacts ?? []
                    : options?.chats ?? [],
                  error: null,
                };
          },
        };
        return builder;
      }

      if (table !== "site_analytics_sessions") throw new Error(`Unexpected table: ${table}`);
      const builder = {
        delete() {
          return builder;
        },
        in(_column: string, ids: unknown[]) {
          deleteIds.push(ids);
          return builder;
        },
        async select() {
          actions.push("delete");
          return options?.analyticsDeleteError
            ? { data: null, error: options.analyticsDeleteError }
            : { data: deleteIds.at(-1)?.map((id) => ({ id })) ?? [], error: null };
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

  it("exports analytics only for unique, validated session IDs linked by subject records", async () => {
    const client = createPagedClient({
      contact_submissions: [
        { id: "contact-1", metadata: { analytics_session_id: linkedSessionId } },
        { id: "contact-2", metadata: { analytics_session_id: linkedSessionId.toUpperCase() } },
        { id: "contact-3", metadata: { analytics_session_id: secondLinkedSessionId } },
        { id: "contact-4", metadata: { analytics_session_id: "not-a-uuid" } },
        { id: "contact-5", metadata: { analytics_session_id: 123 } },
        { id: "contact-6", metadata: [linkedSessionId] },
        { id: "contact-7", metadata: { unrelated: linkedSessionId } },
      ],
      chat_transcripts: [
        { id: "chat-1", metadata: { analytics_session_id: secondLinkedSessionId } },
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

    expect(result.analyticsSessions).toHaveLength(2);
    expect(result.analyticsSessionNetwork).toHaveLength(2);
    expect(result.analyticsEvents).toHaveLength(2);
    const analyticsInCalls = client.inCalls.filter(({ table }) => table.startsWith("site_analytics_"));
    expect(analyticsInCalls).toHaveLength(3);
    for (const call of analyticsInCalls) {
      expect(call.values).toEqual([linkedSessionId, secondLinkedSessionId]);
    }
  });

  it("does not query analytics tables when contact metadata has no valid linked session", async () => {
    const client = createPagedClient({
      contact_submissions: [
        { id: "contact-1", metadata: null },
        { id: "contact-2", metadata: { analytics_session_id: "invalid" } },
        { id: "contact-3", metadata: { analytics_session_id: { nested: linkedSessionId } } },
      ],
      chat_transcripts: [],
      contact_email_deliveries: [],
      contact_email_events: [],
      lead_capture_attempts: [],
    });
    mocks.getClient.mockResolvedValue(client);

    const result = await exportContactSubjectData("Subject@Example.com");

    expect(result.analyticsSessions).toEqual([]);
    expect(result.analyticsSessionNetwork).toEqual([]);
    expect(result.analyticsEvents).toEqual([]);
    expect(client.ranges.some(({ table }) => table.startsWith("site_analytics_"))).toBe(false);
  });

  it("captures analytics links and removes linked sessions before deleting contact metadata", async () => {
    const client = createDeletionClient({
      contacts: [
        { metadata: { analytics_session_id: linkedSessionId } },
        { metadata: { analytics_session_id: linkedSessionId } },
        { metadata: { analytics_session_id: "invalid" } },
      ],
      chats: [
        { metadata: { analytics_session_id: secondLinkedSessionId } },
      ],
    });
    mocks.getClient.mockResolvedValue(client);

    await expect(deleteContactSubjectData("Subject@Example.com")).resolves.toEqual({
      subject: "subject@example.com",
      contactsDeleted: 2,
      chatsDeleted: 1,
      abuseAttemptsDeleted: 4,
      analyticsSessionsDeleted: 2,
      deleted: 9,
    });
    expect(client.rpc).toHaveBeenCalledWith("delete_contact_subject_data", {
      p_email: "subject@example.com",
      p_recipient_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
    });
    expect(client.deleteIds).toEqual([[linkedSessionId, secondLinkedSessionId]]);
    expect(client.actions).toEqual([
      "lookup:contact_submissions",
      "lookup:chat_transcripts",
      "delete",
      "rpc",
    ]);
    expect(privacySubjectAuditTarget("Subject@Example.com")).toMatch(/^email-hmac:[a-f0-9]{24}$/);
    expect(privacySubjectAuditTarget("Subject@Example.com")).not.toContain("subject@example.com");
  });

  it("returns zero analytics deletions and never issues an unfiltered delete for malformed links", async () => {
    const client = createDeletionClient({
      contacts: [
        { metadata: { analytics_session_id: "invalid" } },
        { metadata: {} },
        { metadata: null },
      ],
    });
    mocks.getClient.mockResolvedValue(client);

    await expect(deleteContactSubjectData("subject@example.com")).resolves.toMatchObject({
      analyticsSessionsDeleted: 0,
      deleted: 7,
    });
    expect(client.deleteIds).toEqual([]);
    expect(client.actions).toEqual([
      "lookup:contact_submissions",
      "lookup:chat_transcripts",
      "rpc",
    ]);
  });

  it("fails closed when deleting a linked analytics session returns a database error", async () => {
    const client = createDeletionClient({
      contacts: [{ metadata: { analytics_session_id: linkedSessionId } }],
      analyticsDeleteError: { code: "42501", message: "denied" },
    });
    mocks.getClient.mockResolvedValue(client);

    await expect(deleteContactSubjectData("subject@example.com")).rejects.toThrow(
      "Contact analytics deletion failed (42501).",
    );
    expect(client.actions).toEqual([
      "lookup:contact_submissions",
      "lookup:chat_transcripts",
      "delete",
    ]);
    expect(client.rpc).not.toHaveBeenCalled();
  });

  it("fails before the destructive RPC when analytics linkage lookup fails", async () => {
    const client = createDeletionClient({
      lookupError: { code: "08006", message: "connection failure" },
    });
    mocks.getClient.mockResolvedValue(client);

    await expect(deleteContactSubjectData("subject@example.com")).rejects.toThrow(
      "Contact analytics linkage lookup failed (08006).",
    );
    expect(client.rpc).not.toHaveBeenCalled();
    expect(client.deleteIds).toEqual([]);
    expect(client.actions).toEqual(["lookup:contact_submissions"]);
  });
});
