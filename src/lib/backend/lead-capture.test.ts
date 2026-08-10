import { afterEach, describe, expect, it, vi } from "vitest";

const analyticsMocks = vi.hoisted(() => ({ allowed: vi.fn(() => false), record: vi.fn() }));

vi.mock("@/lib/analytics/client", () => ({
  analyticsCollectionAllowed: analyticsMocks.allowed,
  recordAnalyticsEvent: analyticsMocks.record,
}));

import { recordChatTranscript, recordContactSubmission, recordPortalEvent } from "./lead-capture";
import { ANALYTICS_SESSION_STORAGE_KEY } from "@/lib/analytics/contracts";

afterEach(() => {
  window.sessionStorage.clear();
  analyticsMocks.allowed.mockReset().mockReturnValue(false);
  analyticsMocks.record.mockReset();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("lead capture backend helpers", () => {
  it("keeps contact, chat, and portal event capture callable without browser secrets in test mode", async () => {
    await expect(
      recordContactSubmission({
        name: "Jane Client",
        email: "jane@example.com",
        interest: "Schedule a Call",
        message: "Schedule a call request. Phone number: +995 555 010101",
      }),
    ).resolves.toMatchObject({ ok: false, skipped: true });

    await expect(
      recordChatTranscript([
        { role: "aixco", text: "Welcome" },
        { role: "visitor", text: "I am interested in broker partnership." },
      ], { sessionId: "chat-session-123", reason: "auto_sync" }),
    ).resolves.toMatchObject({ ok: false, skipped: true });

    await expect(
      recordPortalEvent({
        mode: "register",
        roleTitle: "Why become a broker?",
        action: "Start broker registration",
        portalUrl: "https://broker.aixco.global/",
      }),
    ).resolves.toMatchObject({ ok: false, skipped: true });
  });

  it("rejects portal event capture for URLs outside the approved portal", async () => {
    await expect(
      recordPortalEvent({
        mode: "register",
        roleTitle: "Why become a broker?",
        action: "Start broker registration",
        portalUrl: "https://broker.aixco.global.evil.example/",
      }),
    ).resolves.toMatchObject({ ok: false, skipped: true, reason: "Portal URL is not allowed." });
  });

  it("emits an acknowledgement only after the contact API confirms durable success", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VITEST", "false");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      ok: true,
      reference: "AIX-2026-000123",
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })));

    await expect(recordContactSubmission({
      name: "Jane Client",
      email: "jane@example.com",
      interest: "Current project",
      message: "Please send me current availability and payment terms.",
    })).resolves.toMatchObject({ ok: true, reference: "AIX-2026-000123" });

    expect(analyticsMocks.record).toHaveBeenCalledExactlyOnceWith({
      type: "form_submit",
      name: "contact_request_acknowledged",
      targetLabel: "contact",
      metadata: { source: "lead_capture", status: "stored" },
    });
    expect(analyticsMocks.record).not.toHaveBeenCalledWith(
      expect.objectContaining({ name: "form_submit_attempted" }),
    );
  });

  it("attaches a consented analytics session to the durable contact context", async () => {
    const sessionId = "4427dba7-3040-40fe-b965-9b278610f7b7";
    analyticsMocks.allowed.mockReturnValue(true);
    window.sessionStorage.setItem(ANALYTICS_SESSION_STORAGE_KEY, JSON.stringify({ id: sessionId }));
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VITEST", "false");
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({
      ok: true,
      reference: "AIX-2026-000124",
    }), { status: 201, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    await recordContactSubmission({
      name: "Jane Client",
      email: "jane@example.com",
      interest: "Current project",
      message: "Please send me current availability and payment terms.",
    });

    const requestBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as {
      context?: { metadata?: { analytics_session_id?: unknown } };
    };
    expect(requestBody.context?.metadata?.analytics_session_id).toBe(sessionId);
  });

  it("does not count a rejected contact capture as a conversion", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VITEST", "false");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      ok: false,
      reason: "Validation failed.",
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })));

    await expect(recordContactSubmission({
      name: "Jane Client",
      email: "jane@example.com",
      interest: "Current project",
      message: "Please send me current availability and payment terms.",
    })).resolves.toMatchObject({ ok: false, reason: "Validation failed." });

    expect(analyticsMocks.record).toHaveBeenCalledExactlyOnceWith({
      type: "form_error",
      name: "form_failed",
      targetLabel: "contact",
      metadata: { source: "lead_capture", status: "http_400" },
    });
    expect(analyticsMocks.record).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: "conversion" }),
    );
  });
});
