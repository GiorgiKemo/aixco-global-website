import { describe, expect, it, vi } from "vitest";
import { POST } from "./route";

describe("web vitals endpoint", () => {
  it("accepts a bounded anonymous Core Web Vital", async () => {
    const consoleInfo = vi.spyOn(console, "info").mockImplementation(() => undefined);
    try {
      const response = await POST(new Request("https://www.aixco.global/api/web-vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "v4-123",
          name: "LCP",
          value: 2430.4,
          delta: 2430.4,
          rating: "good",
          navigationType: "navigate",
          pathname: "/",
        }),
      }));

      expect(response.status).toBe(202);
      await expect(response.json()).resolves.toEqual({ ok: true });
      expect(consoleInfo).toHaveBeenCalledWith("[aixco-web-vital]", expect.stringContaining('"name":"LCP"'));
    } finally {
      consoleInfo.mockRestore();
    }
  });

  it("rejects malformed or oversized payloads", async () => {
    const malformed = await POST(new Request("https://www.aixco.global/api/web-vitals", {
      method: "POST",
      body: "not-json",
    }));
    const oversized = await POST(new Request("https://www.aixco.global/api/web-vitals", {
      method: "POST",
      body: "x".repeat(4097),
    }));

    expect(malformed.status).toBe(400);
    expect(oversized.status).toBe(413);
  });
});
