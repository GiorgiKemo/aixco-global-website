import { describe, expect, it } from "vitest";
import {
  createPrivacyPreviewToken,
  PRIVACY_PREVIEW_TOKEN_TTL_MS,
  verifyPrivacyPreviewToken,
} from "./privacy-preview-token";

const env = {
  NODE_ENV: "production",
  LEAD_CAPTURE_HASH_SECRET: "0123456789abcdef0123456789abcdef",
};
const now = Date.parse("2026-08-17T12:00:00.000Z");

describe("privacy preview token", () => {
  it("binds a short-lived proof to the exact subject and AAL2 actor", () => {
    const token = createPrivacyPreviewToken("subject@example.com", "admin-1", { now, env });

    expect(token).toMatch(/^v1\.\d{13}\.\d{13}\.[a-f0-9]{64}$/);
    expect(verifyPrivacyPreviewToken(token, "subject@example.com", "admin-1", { now, env }))
      .toBe(true);
    expect(verifyPrivacyPreviewToken(token, "other@example.com", "admin-1", { now, env }))
      .toBe(false);
    expect(verifyPrivacyPreviewToken(token, "subject@example.com", "admin-2", { now, env }))
      .toBe(false);
  });

  it("rejects expired, future-issued, malformed, tampered, and unconfigured proofs", () => {
    const token = createPrivacyPreviewToken("subject@example.com", "admin-1", { now, env });
    expect(verifyPrivacyPreviewToken(
      token,
      "subject@example.com",
      "admin-1",
      { now: now + PRIVACY_PREVIEW_TOKEN_TTL_MS + 1, env },
    )).toBe(false);
    expect(verifyPrivacyPreviewToken(
      token,
      "subject@example.com",
      "admin-1",
      { now: now - 31_000, env },
    )).toBe(false);
    expect(verifyPrivacyPreviewToken(`${token}x`, "subject@example.com", "admin-1", { now, env }))
      .toBe(false);
    expect(verifyPrivacyPreviewToken("malformed", "subject@example.com", "admin-1", { now, env }))
      .toBe(false);
    expect(createPrivacyPreviewToken("subject@example.com", "admin-1", {
      now,
      env: { NODE_ENV: "production" },
    })).toBeNull();
  });
});
