import { describe, expect, it } from "vitest";
import { recordChatTranscript, recordContactSubmission, recordPortalEvent } from "./lead-capture";

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
        portalUrl: "https://workw.com/realestate/broker/signup",
      }),
    ).resolves.toMatchObject({ ok: false, skipped: true });
  });

  it("rejects portal event capture for URLs outside the approved portal", async () => {
    await expect(
      recordPortalEvent({
        mode: "register",
        roleTitle: "Why become a broker?",
        action: "Start broker registration",
        portalUrl: "https://workw.com.evil.example/realestate/broker/signup",
      }),
    ).resolves.toMatchObject({ ok: false, skipped: true, reason: "Portal URL is not allowed." });
  });
});
