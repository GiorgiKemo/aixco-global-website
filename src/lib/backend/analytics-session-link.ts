import "server-only";

import { timingSafeEqual } from "node:crypto";
import { hashLeadCaptureIdentity } from "@/lib/backend/lead-capture-abuse";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TOKEN_PATTERN = /^[a-f0-9]{64}$/;

export function createAnalyticsSessionLinkToken(
  sessionId: string,
  env: Record<string, string | undefined> = process.env,
) {
  if (!UUID_PATTERN.test(sessionId)) return null;
  return hashLeadCaptureIdentity(
    `analytics-session-link:${sessionId.toLowerCase()}`,
    env,
  );
}

export function verifyAnalyticsSessionLink(
  sessionId: string | null | undefined,
  token: string | null | undefined,
  env: Record<string, string | undefined> = process.env,
) {
  if (!sessionId || !UUID_PATTERN.test(sessionId) || !token || !TOKEN_PATTERN.test(token)) {
    return false;
  }

  const expected = createAnalyticsSessionLinkToken(sessionId, env);
  if (!expected || expected.length !== token.length) return false;
  return timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(token, "utf8"));
}
