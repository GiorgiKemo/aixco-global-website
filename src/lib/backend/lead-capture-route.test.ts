import { afterEach, describe, expect, it } from "vitest";
import { resetRateLimitStore } from "@/lib/security/rate-limit";
import {
  createLeadCaptureRoute,
  isTrustedLeadCaptureOrigin,
  processImmediateContactEmailDelivery,
  validateLeadCaptureAntiAbuse,
} from "./lead-capture-route";

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
    expect(validateLeadCaptureAntiAbuse({ website: "", startedAt: 9_800 }, 10_000)).toEqual({
      ok: false,
      reason: "The form was submitted too quickly. Please try again.",
    });
    expect(validateLeadCaptureAntiAbuse({ website: "", startedAt: 9_500 }, 10_000)).toBeNull();
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

  it("accepts a production same-origin beacon without Origin only with browser provenance", () => {
    const request = new Request("https://www.aixco.global/api/web-vitals", {
      headers: {
        "sec-fetch-site": "same-origin",
        referer: "https://www.aixco.global/aixco-global-op2/current-project",
      },
    });
    expect(isTrustedLeadCaptureOrigin(request, { NODE_ENV: "production" })).toBe(true);
  });

  it("accepts a same-origin beacon whose browser omits Sec-Fetch-Site", () => {
    const request = new Request("http://next-internal:3000/api/web-vitals", {
      headers: {
        host: "127.0.0.1:8081",
        referer: "http://127.0.0.1:8081/",
      },
    });
    expect(isTrustedLeadCaptureOrigin(request, { NODE_ENV: "production" })).toBe(true);
  });

  it("accepts the public browser origin when a trusted proxy rewrites the internal request URL", () => {
    const request = new Request("http://next-internal:3000/api/web-vitals", {
      headers: {
        origin: "https://www.aixco.global",
        host: "next-internal:3000",
        "x-forwarded-host": "www.aixco.global",
        "x-forwarded-proto": "https",
      },
    });
    expect(isTrustedLeadCaptureOrigin(request, { NODE_ENV: "production" })).toBe(true);

    const forged = new Request("http://next-internal:3000/api/web-vitals", {
      headers: {
        origin: "https://evil.example",
        host: "next-internal:3000",
        "x-forwarded-host": "www.aixco.global",
        "x-forwarded-proto": "https",
      },
    });
    expect(isTrustedLeadCaptureOrigin(forged, { NODE_ENV: "production" })).toBe(false);
  });

  it("rejects missing or forged production provenance when Origin is absent", () => {
    const missing = new Request("https://www.aixco.global/api/web-vitals");
    const crossSite = new Request("https://www.aixco.global/api/web-vitals", {
      headers: { "sec-fetch-site": "cross-site", referer: "https://www.aixco.global/" },
    });
    const forgedReferrer = new Request("https://www.aixco.global/api/web-vitals", {
      headers: { "sec-fetch-site": "same-origin", referer: "https://evil.example/" },
    });

    expect(isTrustedLeadCaptureOrigin(missing, { NODE_ENV: "production" })).toBe(false);
    expect(isTrustedLeadCaptureOrigin(crossSite, { NODE_ENV: "production" })).toBe(false);
    expect(isTrustedLeadCaptureOrigin(forgedReferrer, { NODE_ENV: "production" })).toBe(false);
  });

  it("leaves durable email rows queued when delivery/webhook readiness is incomplete", async () => {
    const processor = vi.fn();
    const readiness = vi.fn(async () => ({ ready: false })) as unknown as NonNullable<Parameters<
      typeof processImmediateContactEmailDelivery
    >[1]>["readiness"];

    await expect(processImmediateContactEmailDelivery("AIX-2026-000001", {
      readiness,
      processor,
    })).resolves.toEqual({ processed: false, reason: "pipeline_not_ready" });
    expect(readiness).toHaveBeenCalledWith({ operational: false });
    expect(processor).not.toHaveBeenCalled();
  });
});
