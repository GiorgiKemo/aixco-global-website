import { afterEach, describe, expect, it } from "vitest";
import { resetRateLimitStore } from "@/lib/security/rate-limit";
import { createLeadCaptureRoute } from "./lead-capture-route";

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
});
