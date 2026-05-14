import { describe, expect, it } from "vitest";
import { createAdminSessionToken, verifyAdminPassword, verifyAdminSessionToken } from "./session-token";

describe("admin session token", () => {
  const secret = "0123456789abcdef0123456789abcdef";

  it("creates and verifies a signed admin session token", () => {
    const token = createAdminSessionToken({ secret, ttlSeconds: 60 }, 1_000);

    expect(verifyAdminSessionToken(token, secret, 30_000)).toBe(true);
    expect(verifyAdminSessionToken(token, "different-secret", 30_000)).toBe(false);
  });

  it("rejects expired or tampered tokens", () => {
    const token = createAdminSessionToken({ secret, ttlSeconds: 1 }, 1_000);
    const tampered = token.replace("v1", "v2");

    expect(verifyAdminSessionToken(token, secret, 3_000)).toBe(false);
    expect(verifyAdminSessionToken(tampered, secret, 1_500)).toBe(false);
  });

  it("compares admin passwords without exposing plaintext comparison behavior", () => {
    expect(verifyAdminPassword("correct horse battery staple", "correct horse battery staple", secret)).toBe(true);
    expect(verifyAdminPassword("wrong", "correct horse battery staple", secret)).toBe(false);
  });
});
