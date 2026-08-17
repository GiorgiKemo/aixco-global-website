import "server-only";

import { timingSafeEqual } from "node:crypto";
import { hashLeadCaptureIdentity } from "@/lib/backend/lead-capture-abuse";

const PREVIEW_TOKEN_VERSION = "v1";
const PREVIEW_TOKEN_TTL_MS = 5 * 60_000;
const ALLOWED_CLOCK_SKEW_MS = 30_000;
const SIGNATURE_PATTERN = /^[a-f0-9]{64}$/;

function previewSignature(
  email: string,
  actorId: string,
  issuedAt: number,
  expiresAt: number,
  env: Record<string, string | undefined>,
) {
  return hashLeadCaptureIdentity(
    `admin-privacy-preview:${PREVIEW_TOKEN_VERSION}:${actorId}:${email}:${issuedAt}:${expiresAt}`,
    env,
  );
}

export function createPrivacyPreviewToken(
  email: string,
  actorId: string,
  options: {
    now?: number;
    env?: Record<string, string | undefined>;
  } = {},
) {
  const issuedAt = options.now ?? Date.now();
  const expiresAt = issuedAt + PREVIEW_TOKEN_TTL_MS;
  const signature = previewSignature(
    email,
    actorId,
    issuedAt,
    expiresAt,
    options.env ?? process.env,
  );
  return signature
    ? `${PREVIEW_TOKEN_VERSION}.${issuedAt}.${expiresAt}.${signature}`
    : null;
}

export function verifyPrivacyPreviewToken(
  token: string | null | undefined,
  email: string,
  actorId: string,
  options: {
    now?: number;
    env?: Record<string, string | undefined>;
  } = {},
) {
  if (!token || token.length > 160) return false;
  const [version, issuedValue, expiresValue, signature, ...extra] = token.split(".");
  if (
    extra.length
    || version !== PREVIEW_TOKEN_VERSION
    || !/^\d{13}$/.test(issuedValue ?? "")
    || !/^\d{13}$/.test(expiresValue ?? "")
    || !signature
    || !SIGNATURE_PATTERN.test(signature)
  ) {
    return false;
  }

  const issuedAt = Number(issuedValue);
  const expiresAt = Number(expiresValue);
  const now = options.now ?? Date.now();
  if (
    !Number.isSafeInteger(issuedAt)
    || !Number.isSafeInteger(expiresAt)
    || expiresAt - issuedAt !== PREVIEW_TOKEN_TTL_MS
    || issuedAt > now + ALLOWED_CLOCK_SKEW_MS
    || expiresAt < now
  ) {
    return false;
  }

  const expected = previewSignature(
    email,
    actorId,
    issuedAt,
    expiresAt,
    options.env ?? process.env,
  );
  if (!expected || expected.length !== signature.length) return false;
  return timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(signature, "utf8"));
}

export const PRIVACY_PREVIEW_TOKEN_TTL_MS = PREVIEW_TOKEN_TTL_MS;
