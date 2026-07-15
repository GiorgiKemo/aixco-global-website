import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_VERSION = "v1";
const TOKEN_PARTS = 3;

export const DEFAULT_ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;

export type AdminSessionTokenConfig = {
  secret: string;
  ttlSeconds?: number;
};

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyAdminPassword(candidate: string, expected: string, secret: string) {
  const cleanedCandidate = candidate.trim();
  const cleanedExpected = expected.trim();

  if (!cleanedCandidate || !cleanedExpected || !secret.trim()) return false;

  return safeEqual(sign(cleanedCandidate, secret), sign(cleanedExpected, secret));
}

export function createAdminSessionToken(config: AdminSessionTokenConfig, now = Date.now()) {
  const ttlSeconds = config.ttlSeconds ?? DEFAULT_ADMIN_SESSION_TTL_SECONDS;
  const expiresAt = now + ttlSeconds * 1000;
  const payload = `${TOKEN_VERSION}.${expiresAt}`;

  return `${payload}.${sign(payload, config.secret)}`;
}

export function verifyAdminSessionToken(token: string | undefined, secret: string, now = Date.now()) {
  if (!token || !secret.trim()) return false;

  const parts = token.split(".");
  if (parts.length !== TOKEN_PARTS || parts[0] !== TOKEN_VERSION) return false;

  const expiresAt = Number(parts[1]);
  if (!Number.isFinite(expiresAt) || expiresAt <= now) return false;

  const payload = `${parts[0]}.${parts[1]}`;
  const expectedSignature = sign(payload, secret);

  return safeEqual(parts[2], expectedSignature);
}
import "server-only";
