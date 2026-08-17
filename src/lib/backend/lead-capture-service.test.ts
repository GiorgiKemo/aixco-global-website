import { describe, expect, it, vi } from "vitest";
import {
  captureChatTranscript,
  captureContactSubmission,
  capturePortalEvent,
} from "./lead-capture-service";
import { createAnalyticsSessionLinkToken } from "./analytics-session-link";

type InsertRecord = {
  table: string;
  payload: Record<string, unknown>;
};

function createCaptureClient(error: { message: string } | null = null) {
  const inserts: InsertRecord[] = [];
  const upserts: InsertRecord[] = [];
  const rpcCalls: { fn: string; args: Record<string, unknown> }[] = [];

  return {
    inserts,
    upserts,
    rpcCalls,
    client: {
      rpc: (fn: string, args: Record<string, unknown>) => {
        rpcCalls.push({ fn, args });
        return {
          single: async () => ({
            data: error
              ? null
              : { request_reference: "AIX-2026-000001", delivery_status: "queued" },
            error,
          }),
        };
      },
      from: (table: string) => ({
        insert: (payload: Record<string, unknown>) => {
          inserts.push({ table, payload });
          return Promise.resolve({ error });
        },
        upsert: async (payload: Record<string, unknown>) => {
          upserts.push({ table, payload });
          return { error };
        },
      }),
    },
  };
}

function createLegacyChatClient() {
  const inserts: InsertRecord[] = [];
  const upserts: InsertRecord[] = [];

  return {
    inserts,
    upserts,
    client: {
      from: (table: string) => ({
        insert: async (payload: Record<string, unknown>) => {
          inserts.push({ table, payload });
          return { error: null };
        },
        upsert: async (payload: Record<string, unknown>) => {
          upserts.push({ table, payload });
          return { error: { message: "Could not find the 'session_id' column of 'chat_transcripts'" } };
        },
      }),
    },
  };
}

const headers = new Headers({
  "accept-language": "en-US,en;q=0.9",
  referer: "https://www.aixco.global/",
  "user-agent": "Vitest",
});

describe("lead capture service", () => {
  it("normalizes and stores contact submissions through the server client", async () => {
    const { client, inserts, rpcCalls } = createCaptureClient();

    await expect(
      captureContactSubmission(
        {
          name: " Audit User ",
          email: "AUDIT@EXAMPLE.COM",
          interest: " Emerging market opportunities ",
          message: "I want more details about availability.",
        },
        {
          locale: "en",
          page_path: "/#contact",
          metadata: {
            viewport_width: 1365,
            viewport_height: 768,
            timezone: "Asia/Tbilisi",
          },
        },
        { client, headers },
      ),
    ).resolves.toEqual({
      ok: true,
      reference: "AIX-2026-000001",
      emailDelivery: { status: "queued", internal: "queued", confirmation: "queued" },
    });

    expect(inserts).toHaveLength(0);
    expect(rpcCalls).toHaveLength(1);
    expect(rpcCalls[0]).toMatchObject({
      fn: "create_contact_submission",
      args: {
        p_submission: {
        source: "contact_form",
        name: "Audit User",
        email: "audit@example.com",
        interest: "Emerging market opportunities",
        locale: "en",
        page_path: "/#contact",
        user_agent: "Vitest",
        },
      },
    });
  });

  it("stores analytics linkage only when the server-issued session proof is valid", async () => {
    const sessionId = "4427dba7-3040-40fe-b965-9b278610f7b7";
    const linkToken = createAnalyticsSessionLinkToken(sessionId);
    if (!linkToken) throw new Error("Missing test analytics link token.");
    const valid = createCaptureClient();

    await captureContactSubmission(
      {
        name: "Verified Link",
        email: "verified@example.com",
        message: "Please send the full project availability details.",
      },
      {
        metadata: {
          analytics_session_id: sessionId,
          analytics_session_token: linkToken,
        },
      },
      { client: valid.client, headers },
    );

    expect(valid.rpcCalls[0]?.args.p_submission).toMatchObject({
      metadata: {
        analytics_session_id: sessionId,
        analytics_session_verified: true,
      },
    });

    const forged = createCaptureClient();
    await captureContactSubmission(
      {
        name: "Forged Link",
        email: "forged@example.com",
        message: "Please send the full project availability details.",
      },
      {
        metadata: {
          analytics_session_id: sessionId,
          analytics_session_token: "a".repeat(64),
        },
      },
      { client: forged.client, headers },
    );

    expect(forged.rpcCalls[0]?.args.p_submission).toMatchObject({
      metadata: {
        analytics_session_id: null,
        analytics_session_verified: false,
      },
    });
  });

  it("returns a truthful queued state without sending email inside the form request", async () => {
    const { client, inserts, rpcCalls } = createCaptureClient();

    await expect(
      captureContactSubmission(
        {
          name: "Email User",
          email: "EMAIL@EXAMPLE.COM",
          interest: "Schedule a Call",
          message: "Schedule a call request. Phone number: +995555555555. Preferred time for a call: Jul 8, 2026, 3:00 PM",
        },
        { page_path: "/#contact" },
        { client, headers },
      ),
    ).resolves.toEqual({
      ok: true,
      reference: "AIX-2026-000001",
      emailDelivery: { status: "queued", internal: "queued", confirmation: "queued" },
    });

    expect(inserts).toHaveLength(0);
    expect(rpcCalls).toHaveLength(1);
  });

  it("stores call details as structured fields", async () => {
    const { client, rpcCalls } = createCaptureClient();
    const preferredCallAt = new Date(Date.now() + 86_400_000).toISOString();

    await expect(
      captureContactSubmission(
        {
          name: "Call User",
          email: "call@example.com",
          interest: "Schedule a Call",
          message: "Please call me about the current project.",
          requestType: "call",
          phone: "+995 555 123 456",
          preferredCallAt,
          preferredCallTimezone: "Asia/Tbilisi",
        },
        { locale: "ka", page_path: "/#contact" },
        { client, headers },
      ),
    ).resolves.toMatchObject({ ok: true, reference: "AIX-2026-000001" });

    expect(rpcCalls[0]?.args.p_submission).toMatchObject({
      request_type: "call",
      phone: "+995 555 123 456",
      preferred_call_at: preferredCallAt,
      preferred_call_timezone: "Asia/Tbilisi",
      locale: "ka",
    });
  });

  it("sanitizes database failures from the public contact result", async () => {
    const { client } = createCaptureClient({ message: "database unavailable" });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    try {
      await expect(
        captureContactSubmission(
          {
            name: "Fail User",
            email: "fail@example.com",
            interest: "Send an Email",
            message: "Please send more information about AIXCO.",
          },
          {},
          { client, headers },
        ),
      ).resolves.toEqual({
        ok: false,
        reason: "The contact request could not be stored right now.",
      });
    } finally {
      consoleError.mockRestore();
    }
  });

  it("derives a chat interest and stores the normalized transcript", async () => {
    const { client, inserts } = createCaptureClient();

    await expect(
      captureChatTranscript(
        {
          messages: [
            { role: "aixco", text: "Welcome" },
            { role: "visitor", text: "I am interested in the broker route." },
          ],
        },
        { page_path: "/#dubai" },
        { client, headers },
      ),
    ).resolves.toEqual({ ok: true });

    expect(inserts[0]).toMatchObject({
      table: "chat_transcripts",
      payload: {
        source: "live_chat",
        interest: "Broker partnership",
        message_count: 2,
        visitor_message_count: 1,
        transcript: "AIXCO: Welcome\nVisitor: I am interested in the broker route.",
      },
    });
  });

  it("does not create a lead for an assistant-only greeting", async () => {
    const { client, inserts, upserts } = createCaptureClient();

    await expect(
      captureChatTranscript(
        { sessionId: "greeting-only", messages: [{ role: "aixco", text: "Welcome" }] },
        {},
        { client, headers },
      ),
    ).resolves.toEqual({ ok: true });

    expect(inserts).toEqual([]);
    expect(upserts).toEqual([]);
  });

  it("never promotes a free-text email mention into a verified chat subject", async () => {
    const first = createCaptureClient();
    await captureChatTranscript(
      {
        messages: [
          { role: "visitor", text: "Please contact Subject@Example.com." },
          { role: "aixco", text: "We can also be reached at support@aixco.global." },
        ],
      },
      {},
      { client: first.client, headers },
    );
    expect(first.inserts[0]?.payload).toMatchObject({ visitor_message_count: 1 });
    expect(first.inserts[0]?.payload).not.toHaveProperty("subject_email_normalized");

    const second = createCaptureClient();
    await captureChatTranscript(
      {
        messages: [
          { role: "visitor", text: "Use first@example.com or second@example.com." },
        ],
      },
      {},
      { client: second.client, headers },
    );
    expect(second.inserts[0]?.payload).toMatchObject({ visitor_message_count: 1 });
    expect(second.inserts[0]?.payload).not.toHaveProperty("subject_email_normalized");
  });

  it("sanitizes database failures from public chat results", async () => {
    const { client } = createCaptureClient({ message: "sensitive database connection details" });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    try {
      await expect(
        captureChatTranscript(
          { messages: [{ role: "visitor", text: "Please save this message." }] },
          {},
          { client, headers },
        ),
      ).resolves.toEqual({ ok: false, reason: "The chat transcript could not be stored right now." });
    } finally {
      consoleError.mockRestore();
    }
  });

  it("upserts live chat transcripts by session id", async () => {
    const { client, inserts, upserts } = createCaptureClient();

    await expect(
      captureChatTranscript(
        {
          sessionId: "chat-session-123",
          reason: "auto_sync",
          messages: [
            { role: "aixco", text: "Welcome" },
            { role: "visitor", text: "I want to discuss apartment opportunities." },
          ],
        },
        { page_path: "/#contact" },
        { client, headers },
      ),
    ).resolves.toEqual({ ok: true });

    expect(inserts).toHaveLength(0);
    expect(upserts).toHaveLength(1);
    expect(upserts[0]).toMatchObject({
      table: "chat_transcripts",
      payload: {
        session_id: "chat-session-123",
        interest: "Emerging market opportunities",
        message_count: 2,
      },
    });
    expect(upserts[0]?.payload.metadata).toMatchObject({
      chat_session_id: "chat-session-123",
      capture_reason: "auto_sync",
    });
  });

  it("falls back to the existing insert path when the session id migration is not deployed yet", async () => {
    const { client, inserts, upserts } = createLegacyChatClient();

    await expect(
      captureChatTranscript(
        {
          sessionId: "chat-session-123",
          reason: "auto_sync",
          messages: [
            { role: "aixco", text: "Welcome" },
            { role: "visitor", text: "Please save this chat." },
          ],
        },
        {},
        { client, headers },
      ),
    ).resolves.toEqual({ ok: true });

    expect(upserts).toHaveLength(1);
    expect(inserts).toHaveLength(1);
    expect(inserts[0]?.payload).not.toHaveProperty("session_id");
    expect(inserts[0]?.payload.metadata).toMatchObject({
      chat_session_id: "chat-session-123",
      capture_reason: "auto_sync",
    });
  });

  it("rejects unsafe portal URLs before writing analytics", async () => {
    const { client, inserts } = createCaptureClient();

    await expect(
      capturePortalEvent(
        {
          mode: "register",
          roleTitle: "Why become a broker?",
          action: "Start broker registration",
          portalUrl: "https://broker.aixco.global.evil.example/",
        },
        {},
        { client, headers },
      ),
    ).resolves.toEqual({ ok: false, skipped: true, reason: "Portal URL is not allowed." });
    expect(inserts).toHaveLength(0);
  });

  it("reports missing Supabase configuration as a skipped backend write", async () => {
    await expect(
      capturePortalEvent(
        {
          mode: "login",
          roleTitle: "Customer",
          action: "Customer Login",
          portalUrl: "https://customer.aixco.global/",
        },
        {},
        { hasServerConfig: false },
      ),
    ).resolves.toMatchObject({ ok: false, skipped: true });
  });
});
