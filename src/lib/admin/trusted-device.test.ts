import { describe, expect, it } from "vitest";
import {
  ADMIN_TRUSTED_DEVICE_TTL_SECONDS,
  createTrustedDeviceToken,
  verifyTrustedDeviceToken,
} from "./trusted-device";

const secret = "trusted-device-test-secret-01234567890123456789";
const userId = "4427dba7-3040-40fe-b965-9b278610f7b7";
const now = Date.parse("2026-08-18T10:00:00.000Z");

describe("trusted admin devices", () => {
  it("creates a token valid for exactly thirty days and binds it to the user", () => {
    const token = createTrustedDeviceToken(userId, secret, now);

    expect(verifyTrustedDeviceToken(token, userId, secret, now + 1)).toBe(true);
    expect(verifyTrustedDeviceToken(token, userId, secret, now + ADMIN_TRUSTED_DEVICE_TTL_SECONDS * 1000)).toBe(false);
    expect(verifyTrustedDeviceToken(token, "different-user", secret, now + 1)).toBe(false);
  });

  it("rejects tampered, malformed, and incorrectly signed tokens", () => {
    const token = createTrustedDeviceToken(userId, secret, now);
    const parts = token.split(".");

    expect(verifyTrustedDeviceToken(`${token}x`, userId, secret, now)).toBe(false);
    expect(verifyTrustedDeviceToken(`${parts.slice(0, 4).join(".")}.bad`, userId, secret, now)).toBe(false);
    expect(verifyTrustedDeviceToken(token, userId, "another-secret-that-is-long-enough-012345", now)).toBe(false);
    expect(verifyTrustedDeviceToken(undefined, userId, secret, now)).toBe(false);
  });

  it("does not create a token without a server secret", () => {
    expect(() => createTrustedDeviceToken(userId, "", now)).toThrow(/not configured/i);
  });
});
