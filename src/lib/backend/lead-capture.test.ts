import { describe, expect, it } from "vitest";
import { recordChatTranscript, recordPortalEvent, submitContactSubmission } from "./lead-capture";

describe("lead capture backend helpers", () => {
  it("skips network writes during tests", async () => {
    await expect(
      submitContactSubmission({
        name: "Audit User",
        email: "audit@example.com",
        interest: "Batumi apartments",
        message: "I want more details about availability.",
      }),
    ).resolves.toMatchObject({ ok: false, skipped: true });
  });

  it("keeps chat and portal event capture callable without browser secrets in test mode", async () => {
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
