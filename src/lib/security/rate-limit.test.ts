import { afterEach, describe, expect, it } from "vitest";
import { checkRateLimit, getRateLimitClientId, resetRateLimitStore } from "./rate-limit";

describe("rate limit utilities", () => {
  afterEach(() => {
    resetRateLimitStore();
  });

  it("allows requests up to the configured limit", () => {
    expect(checkRateLimit({ key: "contact:1", limit: 2, windowMs: 1000, now: 100 }).allowed).toBe(true);
    expect(checkRateLimit({ key: "contact:1", limit: 2, windowMs: 1000, now: 200 }).allowed).toBe(true);
    expect(checkRateLimit({ key: "contact:1", limit: 2, windowMs: 1000, now: 300 })).toMatchObject({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 1,
    });
  });

  it("resets the counter after the window expires", () => {
    expect(checkRateLimit({ key: "admin:1", limit: 1, windowMs: 1000, now: 100 }).allowed).toBe(true);
    expect(checkRateLimit({ key: "admin:1", limit: 1, windowMs: 1000, now: 200 }).allowed).toBe(false);
    expect(checkRateLimit({ key: "admin:1", limit: 1, windowMs: 1000, now: 1200 }).allowed).toBe(true);
  });

  it("uses the first forwarded IP address as the client id", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.10, 10.0.0.1",
      "x-real-ip": "198.51.100.4",
    });

    expect(getRateLimitClientId(headers)).toBe("203.0.113.10");
  });
});
