import { describe, expect, it } from "vitest";
import {
  createAnalyticsSessionLinkToken,
  verifyAnalyticsSessionLink,
} from "./analytics-session-link";

const env = {
  NODE_ENV: "production",
  LEAD_CAPTURE_HASH_SECRET: "0123456789abcdef0123456789abcdef",
};
const sessionId = "4427dba7-3040-40fe-b965-9b278610f7b7";

describe("analytics session lead linkage", () => {
  it("creates a stable opaque proof bound to one session id", () => {
    const token = createAnalyticsSessionLinkToken(sessionId, env);

    expect(token).toMatch(/^[a-f0-9]{64}$/);
    expect(verifyAnalyticsSessionLink(sessionId, token, env)).toBe(true);
    expect(verifyAnalyticsSessionLink(
      "5527dba7-3040-40fe-b965-9b278610f7b7",
      token,
      env,
    )).toBe(false);
  });

  it("fails closed for malformed inputs and missing production secrets", () => {
    expect(verifyAnalyticsSessionLink(sessionId, "not-a-token", env)).toBe(false);
    expect(createAnalyticsSessionLinkToken("not-a-uuid", env)).toBeNull();
    expect(createAnalyticsSessionLinkToken(sessionId, { NODE_ENV: "production" })).toBeNull();
  });
});
