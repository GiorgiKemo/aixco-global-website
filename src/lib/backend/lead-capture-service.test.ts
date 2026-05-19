import { describe, expect, it } from "vitest";
import {
  captureChatTranscript,
  captureContactSubmission,
  capturePortalEvent,
} from "./lead-capture-service";

type InsertRecord = {
  table: string;
  payload: Record<string, unknown>;
};

function createCaptureClient(error: { message: string } | null = null) {
  const inserts: InsertRecord[] = [];
  const upserts: InsertRecord[] = [];

  return {
    inserts,
    upserts,
    client: {
      from: (table: string) => ({
        insert: async (payload: Record<string, unknown>) => {
          inserts.push({ table, payload });
          return { error };
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
    const { client, inserts } = createCaptureClient();

    await expect(
      captureContactSubmission(
        {
          name: " Audit User ",
          email: "AUDIT@EXAMPLE.COM",
          interest: " Batumi apartments ",
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
    ).resolves.toEqual({ ok: true });

    expect(inserts).toHaveLength(1);
    expect(inserts[0]).toMatchObject({
      table: "contact_submissions",
      payload: {
        source: "contact_form",
        name: "Audit User",
        email: "audit@example.com",
        interest: "Batumi apartments",
        locale: "en",
        page_path: "/#contact",
        user_agent: "Vitest",
      },
    });
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
        transcript: "AIXCO: Welcome\nVisitor: I am interested in the broker route.",
      },
    });
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
            { role: "visitor", text: "I want to discuss Batumi apartments." },
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
        interest: "Batumi apartments",
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
          portalUrl: "https://workw.com.evil.example/realestate/broker/signup",
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
          portalUrl: "https://workw.com/realestate/customer/login",
        },
        {},
        { hasServerConfig: false },
      ),
    ).resolves.toMatchObject({ ok: false, skipped: true });
  });
});
