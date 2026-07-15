import { afterEach, describe, expect, it } from "vitest";
import { resetRateLimitStore } from "@/lib/security/rate-limit";
import { createLeadCaptureRoute, validateLeadCaptureAntiAbuse } from "./lead-capture-route";

describe("lead capture route", () => {
  afterEach(() => {
    resetRateLimitStore();
  });

  it("rate limits noisy public capture requests before backend work", async () => {
    const post = createLeadCaptureRoute("contact");
    const headers = {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.23",
    };

    for (let index = 0; index < 30; index += 1) {
      const response = await post(new Request("https://aixco.global/api/lead-capture/contact", {
        method: "POST",
        headers,
        body: "{",
      }));

      expect(response.status).toBe(400);
    }

    const limited = await post(new Request("https://aixco.global/api/lead-capture/contact", {
      method: "POST",
      headers,
      body: "{",
    }));

    expect(limited.status).toBe(429);
    expect(limited.headers.get("Retry-After")).toBe("60");
    await expect(limited.json()).resolves.toMatchObject({
      ok: false,
      skipped: true,
      reason: "Too many lead capture requests. Please try again shortly.",
    });
  });

  it("rejects honeypot and implausibly fast contact forms", () => {
    expect(validateLeadCaptureAntiAbuse({ website: "spam.example", startedAt: 1 }, 10_000)).toEqual({
      ok: false,
      reason: "Invalid form verification data.",
    });
    expect(validateLeadCaptureAntiAbuse({ website: "", startedAt: 9_500 }, 10_000)).toEqual({
      ok: false,
      reason: "The form was submitted too quickly. Please try again.",
    });
    expect(validateLeadCaptureAntiAbuse({ website: "", startedAt: 8_000 }, 10_000)).toBeNull();
  });

  it("returns a shared recipient cooldown before storage or email work", async () => {
    const distributedGuard = async () => ({
      allowed: false as const,
      retryAfterSeconds: 120,
      reason: "recipient_cooldown" as const,
    });
    const post = createLeadCaptureRoute("contact", { distributedGuard, now: () => 10_000 });
    const response = await post(new Request("https://www.aixco.global/api/lead-capture/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "203.0.113.23",
      },
      body: JSON.stringify({
        payload: {
          name: "Cooldown User",
          email: "cooldown@example.com",
          interest: "Send an Email",
          message: "Please send more information about this project.",
        },
        antiAbuse: { website: "", startedAt: 8_000 },
      }),
    }));

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("120");
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      skipped: true,
      reason: "Too many lead capture requests. Please try again shortly.",
    });
  });

  it("rejects oversized request bodies", async () => {
    const post = createLeadCaptureRoute("contact");
    const response = await post(new Request("https://www.aixco.global/api/lead-capture/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "content-length": "40000",
        "x-forwarded-for": "203.0.113.99",
      },
      body: "{}",
    }));

    expect(response.status).toBe(413);
  });
});
