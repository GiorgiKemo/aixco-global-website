import { afterEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit, getRateLimitClientId, RATE_LIMIT_MAX_KEYS, resetRateLimitStore } from "./rate-limit";

describe("rate limit utilities", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
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

  it("bounds unique in-memory keys and evicts the oldest bucket", () => {
    expect(checkRateLimit({ key: "oldest", limit: 1, windowMs: 10_000, now: 0 }).allowed).toBe(true);
    for (let index = 1; index < RATE_LIMIT_MAX_KEYS; index += 1) {
      checkRateLimit({ key: `unique-${index}`, limit: 1, windowMs: 20_000, now: 0 });
    }
    checkRateLimit({ key: "overflow", limit: 1, windowMs: 30_000, now: 0 });

    expect(checkRateLimit({ key: "oldest", limit: 1, windowMs: 10_000, now: 1 }).allowed).toBe(true);
  });

  it("uses the first forwarded IP address as the client id outside production", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.10, 10.0.0.1",
      "x-real-ip": "198.51.100.4",
    });

    expect(getRateLimitClientId(headers)).toBe("203.0.113.10");
  });

  it("ignores a spoofed x-forwarded-for when a trusted edge header exists", () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("NODE_ENV", "production");
    const headers = new Headers({
      "x-vercel-forwarded-for": "203.0.113.44, 10.0.0.1",
      "x-forwarded-for": "198.51.100.123",
      "cf-connecting-ip": "198.51.100.200",
    });

    expect(getRateLimitClientId(headers)).toBe("203.0.113.44");
  });

  it("trusts the Cloudflare edge identity over spoofable headers", () => {
    const headers = new Headers({
      "cf-connecting-ip": "203.0.113.45",
      "x-forwarded-for": "198.51.100.123",
      "x-real-ip": "198.51.100.124",
    });

    expect(getRateLimitClientId(headers)).toBe("203.0.113.45");
  });

  it.each([
    { VERCEL: "1", NODE_ENV: "test" },
    { VERCEL: undefined, NODE_ENV: "production" },
  ])("shares one fail-safe production bucket when no trusted edge header exists", (env) => {
    if (env.VERCEL) vi.stubEnv("VERCEL", env.VERCEL);
    vi.stubEnv("NODE_ENV", env.NODE_ENV);
    const first = new Headers({
      "x-forwarded-for": "198.51.100.1",
      "x-real-ip": "198.51.100.2",
    });
    const second = new Headers({ "x-forwarded-for": "198.51.100.250" });

    expect(getRateLimitClientId(first)).toBe("trusted-edge:unavailable");
    expect(getRateLimitClientId(second)).toBe("trusted-edge:unavailable");
  });
});
