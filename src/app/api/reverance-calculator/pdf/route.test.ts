import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetRateLimitStore } from "@/lib/security/rate-limit";

const mocks = vi.hoisted(() => ({
  guard: vi.fn(),
  origin: vi.fn(),
  generatePdf: vi.fn(),
}));

vi.mock("@/lib/backend/lead-capture-abuse", () => ({
  checkDistributedLeadCaptureLimit: mocks.guard,
}));
vi.mock("@/lib/backend/lead-capture-route", () => ({
  isTrustedLeadCaptureOrigin: mocks.origin,
}));
vi.mock("@/lib/reverance-investment-pdf", () => ({
  generateReveranceInvestmentPdf: mocks.generatePdf,
}));

import { POST } from "./route";

const validInputs = {
  unitCode: "A1305",
  pricePerSquareMetre: 1_600,
  financingPercent: 60,
  grossYieldPercent: 12,
  annualGrowthPercent: 5,
  holdingYears: 10,
};

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://www.aixco.global/api/reverance-calculator/pdf", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://www.aixco.global", ...headers },
    body: JSON.stringify(body),
  });
}

describe("Reverance PDF API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimitStore();
    mocks.guard.mockResolvedValue({ allowed: true });
    mocks.origin.mockReturnValue(true);
    mocks.generatePdf.mockResolvedValue(new Uint8Array([37, 80, 68, 70, 45]));
  });

  it("returns a localized PDF attachment for a valid scenario", async () => {
    const response = await POST(request({ lang: "ru", clientName: "Client", clientAddress: "  Musterstraße 12\n8001 Zürich, Schweiz  ", inputs: validInputs }));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("content-disposition")).toContain("aixco-reverance-investment-brief-ru.pdf");
    expect(Array.from(new Uint8Array(await response.arrayBuffer()))).toEqual([37, 80, 68, 70, 45]);
    expect(mocks.generatePdf).toHaveBeenCalledWith(expect.objectContaining({ lang: "ru", clientName: "Client", clientAddress: "Musterstraße 12\n8001 Zürich, Schweiz" }));
  });

  it("rejects oversized addresses and retired apartments without substituting a different unit", async () => {
    expect((await POST(request({ inputs: validInputs, clientAddress: "x".repeat(301) }))).status).toBe(400);
    expect((await POST(request({ inputs: { ...validInputs, unitCode: "A0203" } }))).status).toBe(400);
    expect(mocks.generatePdf).not.toHaveBeenCalled();
  });

  it("accepts a 300-character address and the one-bedroom apartment", async () => {
    expect((await POST(request({ inputs: { ...validInputs, unitCode: "A1401" }, clientAddress: "Ж".repeat(300) }))).status).toBe(200);
    expect(mocks.generatePdf).toHaveBeenCalledWith(expect.objectContaining({
      clientAddress: "Ж".repeat(300),
      calculation: expect.objectContaining({ unit: expect.objectContaining({ code: "A1401", area: 46.4 }) }),
    }));
  });

  it("rejects forged origins, non-JSON requests, and malformed payloads", async () => {
    mocks.origin.mockReturnValueOnce(false);
    expect((await POST(request({ lang: "en", inputs: validInputs }))).status).toBe(403);

    const textRequest = new Request("https://www.aixco.global/api/reverance-calculator/pdf", {
      method: "POST",
      headers: { "content-type": "text/plain", origin: "https://www.aixco.global" },
      body: "not-json",
    });
    expect((await POST(textRequest)).status).toBe(415);
    expect((await POST(request({ lang: "xx", inputs: validInputs }))).status).toBe(400);
    expect(mocks.generatePdf).not.toHaveBeenCalled();
  });

  it("consumes the distributed telemetry guard before generating a PDF", async () => {
    const response = await POST(request({ lang: "en", inputs: validInputs }));

    expect(response.status).toBe(200);
    expect(mocks.guard).toHaveBeenCalledWith("telemetry", null, expect.any(Headers));
  });

  it("rejects generation when the distributed guard rate limits the client", async () => {
    mocks.guard.mockResolvedValueOnce({
      allowed: false,
      retryAfterSeconds: 120,
      reason: "client_rate_limit",
    });

    const response = await POST(request({ lang: "en", inputs: validInputs }));

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("120");
    await expect(response.json()).resolves.toEqual({ ok: false, reason: "rate_limited" });
    expect(mocks.generatePdf).not.toHaveBeenCalled();
  });

  it.each(["configuration", "database"])("fails closed when the distributed guard is unavailable (%s)", async (reason) => {
    mocks.guard.mockResolvedValueOnce({
      allowed: false,
      retryAfterSeconds: 60,
      reason,
    });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    try {
      const response = await POST(request({ lang: "en", inputs: validInputs }));

      expect(response.status).toBe(503);
      expect(response.headers.get("retry-after")).toBe("60");
      await expect(response.json()).resolves.toEqual({ ok: false, reason: "protection_unavailable" });
      expect(mocks.generatePdf).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });
});
