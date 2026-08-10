import { beforeEach, describe, expect, it, vi } from "vitest";

const telemetryMocks = vi.hoisted(() => ({
  store: vi.fn(),
  guard: vi.fn(),
}));

vi.mock("@/lib/backend/site-telemetry", () => ({
  storeSiteTelemetryEvent: telemetryMocks.store,
}));

vi.mock("@/lib/backend/lead-capture-abuse", () => ({
  checkDistributedLeadCaptureLimit: telemetryMocks.guard,
}));

import { POST, resetWebVitalsRateLimitForTests } from "./route";

const validPayload = {
  id: "v4-123",
  name: "LCP",
  value: 2430.4,
  delta: 2430.4,
  rating: "good",
  navigationType: "navigate",
  pathname: "/",
};

function request(body: string, headers: Record<string, string> = {}) {
  return new Request("https://www.aixco.global/api/web-vitals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://www.aixco.global",
      "X-Vercel-Forwarded-For": "203.0.113.10",
      ...headers,
    },
    body,
  });
}

describe("web vitals endpoint", () => {
  beforeEach(() => {
    resetWebVitalsRateLimitForTests();
    telemetryMocks.store.mockReset().mockResolvedValue(undefined);
    telemetryMocks.guard.mockReset().mockResolvedValue({ allowed: true });
  });

  it("accepts a bounded anonymous Core Web Vital", async () => {
    const consoleInfo = vi.spyOn(console, "info").mockImplementation(() => undefined);
    try {
      const response = await POST(request(JSON.stringify(validPayload)));

      expect(response.status).toBe(202);
      await expect(response.json()).resolves.toEqual({ ok: true, stored: true });
      expect(telemetryMocks.store).toHaveBeenCalledWith(expect.objectContaining({
        eventKind: "web_vital",
        eventName: "LCP",
        eventId: "v4-123",
        pagePath: "/",
        value: 2430.4,
        rating: "good",
      }));
      expect(telemetryMocks.guard).toHaveBeenCalledWith(
        "telemetry",
        null,
        expect.any(Headers),
      );
      expect(consoleInfo).toHaveBeenCalledWith("[aixco-web-vital]", expect.stringContaining('"name":"LCP"'));
    } finally {
      consoleInfo.mockRestore();
    }
  });

  it("rejects malformed or oversized payloads", async () => {
    const malformed = await POST(request("not-json"));
    const oversized = await POST(request("x".repeat(4097), {
      "X-Vercel-Forwarded-For": "203.0.113.11",
    }));

    expect(malformed.status).toBe(400);
    expect(oversized.status).toBe(413);
  });

  it("rejects cross-site and non-JSON submissions", async () => {
    const crossSite = await POST(request(JSON.stringify(validPayload), {
      Origin: "https://malicious.example",
    }));
    const wrongContentType = await POST(request(JSON.stringify(validPayload), {
      "Content-Type": "text/plain",
    }));

    expect(crossSite.status).toBe(403);
    expect(wrongContentType.status).toBe(415);
  });

  it.each(["Sec-GPC", "DNT"])("drops telemetry when %s is active", async (header) => {
    const response = await POST(request(JSON.stringify(validPayload), {
      [header]: "1",
      "X-Vercel-Forwarded-For": header === "DNT" ? "203.0.113.16" : "203.0.113.17",
    }));

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      stored: false,
      droppedReason: "browser_privacy_signal",
    });
    expect(telemetryMocks.guard).not.toHaveBeenCalled();
    expect(telemetryMocks.store).not.toHaveBeenCalled();
  });

  it("bounds repeated telemetry from one client", async () => {
    const consoleInfo = vi.spyOn(console, "info").mockImplementation(() => undefined);
    try {
      for (let attempt = 0; attempt < 60; attempt += 1) {
        const response = await POST(request(JSON.stringify({
          ...validPayload,
          id: `v4-${attempt}`,
        }), {
          "X-Vercel-Forwarded-For": "203.0.113.12",
        }));
        expect(response.status).toBe(202);
      }

      const limited = await POST(request(JSON.stringify(validPayload), {
        "X-Vercel-Forwarded-For": "203.0.113.12",
      }));
      expect(limited.status).toBe(202);
      await expect(limited.json()).resolves.toEqual({
        ok: true,
        stored: false,
        droppedReason: "local_rate_limit",
      });
    } finally {
      consoleInfo.mockRestore();
    }
  });

  it("drops unavailable optional telemetry without failing the visitor page", async () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    telemetryMocks.store.mockRejectedValueOnce(new Error("database unavailable"));
    try {
      const response = await POST(request(JSON.stringify(validPayload), {
        "X-Vercel-Forwarded-For": "203.0.113.13",
      }));

      expect(response.status).toBe(202);
      await expect(response.json()).resolves.toEqual({
        ok: true,
        stored: false,
        droppedReason: "telemetry_unavailable",
      });
    } finally {
      consoleWarn.mockRestore();
    }
  });

  it("enforces the distributed telemetry guard", async () => {
    telemetryMocks.guard.mockResolvedValueOnce({
      allowed: false,
      reason: "client_rate_limit",
      retryAfterSeconds: 321,
    });
    const response = await POST(request(JSON.stringify(validPayload), {
      "X-Vercel-Forwarded-For": "203.0.113.14",
    }));

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      stored: false,
      droppedReason: "distributed_rate_limit",
    });
    expect(telemetryMocks.store).not.toHaveBeenCalled();
  });

  it("fails closed when distributed telemetry protection is unavailable", async () => {
    telemetryMocks.guard.mockResolvedValueOnce({
      allowed: false,
      reason: "database",
      retryAfterSeconds: 60,
    });
    const response = await POST(request(JSON.stringify(validPayload), {
      "X-Vercel-Forwarded-For": "203.0.113.15",
    }));

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      stored: false,
      droppedReason: "telemetry_unavailable",
    });
    expect(telemetryMocks.store).not.toHaveBeenCalled();
  });
});
