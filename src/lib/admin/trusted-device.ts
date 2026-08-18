import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "crypto";

export const ADMIN_TRUSTED_DEVICE_COOKIE_NAME = "aixco_admin_trusted_device";
export const ADMIN_TRUSTED_DEVICE_TTL_SECONDS = 30 * 24 * 60 * 60;

const TOKEN_VERSION = "v1";
const TOKEN_PARTS = 5;
const MINIMUM_SECRET_LENGTH = 32;

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function getTrustedDeviceSecret() {
  const secret = process.env.ADMIN_TRUSTED_DEVICE_SECRET?.trim() ?? "";
  return secret.length >= MINIMUM_SECRET_LENGTH ? secret : "";
}

export function createTrustedDeviceToken(
  userId: string,
  secret = getTrustedDeviceSecret(),
  now = Date.now(),
) {
  if (!userId || !secret) throw new Error("Trusted-device signing is not configured.");

  const expiresAt = now + ADMIN_TRUSTED_DEVICE_TTL_SECONDS * 1000;
  const nonce = randomBytes(18).toString("base64url");
  const payload = `${TOKEN_VERSION}.${expiresAt}.${userId}.${nonce}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyTrustedDeviceToken(
  token: string | undefined,
  userId: string,
  secret = getTrustedDeviceSecret(),
  now = Date.now(),
) {
  if (!token || !userId || !secret) return false;

  const parts = token.split(".");
  if (parts.length !== TOKEN_PARTS || parts[0] !== TOKEN_VERSION) return false;

  const expiresAt = Number(parts[1]);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now) return false;
  if (parts[2] !== userId || !/^[A-Za-z0-9_-]{20,}$/.test(parts[3] ?? "")) return false;

  const payload = parts.slice(0, TOKEN_PARTS - 1).join(".");
  const expectedSignature = sign(payload, secret);
  return safeEqual(parts[4] ?? "", expectedSignature);
}
