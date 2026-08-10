import { beforeEach, describe, expect, it, vi } from "vitest";
import { ANALYTICS_CONSENT_VERSION } from "@/lib/analytics/contracts";
import { resetRateLimitStore } from "@/lib/security/rate-limit";

const mocks = vi.hoisted(() => ({
  distributedGuard: vi.fn(),
  origin: vi.fn(),
  store: vi.fn(),
}));

vi.mock("@/lib/backend/lead-capture-abuse", () => ({
  checkDistributedLeadCaptureLimit: mocks.distributedGuard,
}));
vi.mock("@/lib/backend/lead-capture-route", () => ({
  isTrustedLeadCaptureOrigin: mocks.origin,
}));
vi.mock("@/lib/backend/site-analytics", () => ({
  storeAnalyticsBatch: mocks.store,
}));

import { POST } from "./route";

function validBatch() {
  return {
    consent: { status: "granted", version: ANALYTICS_CONSENT_VERSION },
    session: {
      id: "fd90fc90-b588-491f-8e1d-f1f69d738d4f",
      visitorId: "5f7b5d5a-902b-4383-99df-b44f78f85212",
      startedAt: "2026-08-07T10:00:00.000Z",
      lastSeenAt: "2026-08-07T10:01:00.000Z",
      activeSeconds: 60,
      landingPath: "/",
      exitPath: "/#contact",
      locale: "en-US",
      isReturning: false,
    },
    events: [{
      id: "b2945578-a1fa-4d7f-9ee7-4210d9ca7a5b",
      type: "page_view",
      name: "page_view",
      pagePath: "/#contact",
      occurredAt: "2026-08-07T10:00:01.000Z",
    }],
  };
}

function request(
  body: unknown,
  headers: Record<string, string> = {},
) {
  return new Request("https://www.aixco.global/api/analytics/events", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://www.aixco.global",
      "x-vercel-forwarded-for": "203.0.113.25",
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("analytics ingestion route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimitStore();
    mocks.origin.mockReturnValue(true);
    mocks.distributedGuard.mockResolvedValue({ allowed: true });
    mocks.store.mockResolvedValue({ eventCount: 1, receipt: "receipt-123" });
  });

  it("accepts a consented batch behind both abuse guards", async () => {
    const payload = validBatch();
    const response = await POST(request(payload));

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      stored: true,
      accepted: 1,
      receipt: "receipt-123",
    });
    expect(mocks.distributedGuard).toHaveBeenCalledWith("telemetry", null, expect.any(Headers));
    expect(mocks.store).toHaveBeenCalledWith(payload, expect.any(Headers));
    expect(response.headers.get("cache-control")).toContain("no-store");
  });

  it("rejects non-JSON, forged origins, and malformed consent payloads", async () => {
    const wrongContentType = await POST(request(validBatch(), { "content-type": "text/plain" }));
    expect(wrongContentType.status).toBe(415);

    mocks.origin.mockReturnValueOnce(false);
    const forgedOrigin = await POST(request(validBatch(), {
      origin: "https://attacker.example",
      "x-vercel-forwarded-for": "203.0.113.26",
    }));
    expect(forgedOrigin.status).toBe(403);

    const malformed = await POST(request({
      ...validBatch(),
      consent: { status: "denied", version: ANALYTICS_CONSENT_VERSION },
    }, { "x-vercel-forwarded-for": "203.0.113.27" }));
    expect(malformed.status).toBe(400);
    expect(mocks.store).not.toHaveBeenCalled();
  });

  it.each([
    ["sec-gpc", "1"],
    ["dnt", "1"],
  ])("drops a batch when the browser sends %s", async (header, value) => {
    const response = await POST(request(validBatch(), {
      [header]: value,
      "x-vercel-forwarded-for": `203.0.113.${header === "dnt" ? "28" : "29"}`,
    }));

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      stored: false,
      droppedReason: "browser_privacy_signal",
    });
    expect(mocks.distributedGuard).not.toHaveBeenCalled();
    expect(mocks.store).not.toHaveBeenCalled();
  });

  it("fails closed when distributed protection is unavailable", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    mocks.distributedGuard.mockResolvedValueOnce({ allowed: false, reason: "database" });
    try {
      const response = await POST(request(validBatch()));
      expect(response.status).toBe(202);
      await expect(response.json()).resolves.toEqual({
        ok: true,
        stored: false,
        droppedReason: "analytics_unavailable",
      });
      expect(mocks.store).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });

  it("does not break the visitor response when optional persistence is unavailable", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.store.mockRejectedValueOnce(new Error("database unavailable"));
    try {
      const response = await POST(request(validBatch()));
      expect(response.status).toBe(202);
      await expect(response.json()).resolves.toEqual({
        ok: true,
        stored: false,
        droppedReason: "analytics_unavailable",
      });
    } finally {
      error.mockRestore();
    }
  });

  it("stops a local flood before distributed database work", async () => {
    for (let index = 0; index < 30; index += 1) {
      const response = await POST(request(validBatch()));
      expect(response.status).toBe(202);
    }
    const blocked = await POST(request(validBatch()));

    await expect(blocked.json()).resolves.toEqual({
      ok: true,
      stored: false,
      droppedReason: "local_rate_limit",
    });
    expect(mocks.distributedGuard).toHaveBeenCalledTimes(30);
    expect(mocks.store).toHaveBeenCalledTimes(30);
  });
});
