import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetRateLimitStore } from "@/lib/security/rate-limit";

const mocks = vi.hoisted(() => ({
  origin: vi.fn(),
  generatePdf: vi.fn(),
}));

vi.mock("@/lib/backend/lead-capture-route", () => ({
  isTrustedLeadCaptureOrigin: mocks.origin,
}));
vi.mock("@/lib/reverance-investment-pdf", () => ({
  generateReveranceInvestmentPdf: mocks.generatePdf,
}));

import { POST } from "./route";

const validInputs = {
  unitCode: "A0203",
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
    mocks.origin.mockReturnValue(true);
    mocks.generatePdf.mockResolvedValue(new Uint8Array([37, 80, 68, 70, 45]));
  });

  it("returns a localized PDF attachment for a valid scenario", async () => {
    const response = await POST(request({ lang: "ru", clientName: "Client", inputs: validInputs }));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("content-disposition")).toContain("aixco-reverance-investment-brief-ru.pdf");
    expect(Array.from(new Uint8Array(await response.arrayBuffer()))).toEqual([37, 80, 68, 70, 45]);
    expect(mocks.generatePdf).toHaveBeenCalledWith(expect.objectContaining({ lang: "ru", clientName: "Client" }));
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
});
