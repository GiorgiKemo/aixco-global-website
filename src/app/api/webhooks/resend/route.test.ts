import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ verify: vi.fn(), record: vi.fn() }));
vi.mock("@/lib/backend/resend-webhook", () => ({
  verifyResendWebhook: mocks.verify,
  recordResendWebhookEvent: mocks.record,
}));

import { POST } from "./route";

function request() {
  return new Request("https://www.aixco.global/api/webhooks/resend", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
}

describe("Resend webhook route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.verify.mockReturnValue({ eventId: "event-1", event: { type: "email.delivered" } });
  });

  it("returns 400 only for invalid signatures or payloads", async () => {
    mocks.verify.mockImplementation(() => { throw new Error("bad signature"); });
    const response = await POST(request());
    expect(response.status).toBe(400);
    expect(mocks.record).not.toHaveBeenCalled();
  });

  it("returns 503 so Resend retries transient database failures", async () => {
    mocks.record.mockRejectedValue(new Error("database unavailable"));
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(response.headers.get("Retry-After")).toBe("60");
  });

  it("asks Resend to retry an event that raced provider id persistence", async () => {
    mocks.record.mockResolvedValue({ matched: false, duplicate: false, applied: false });
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(response.headers.get("Retry-After")).toBe("5");
  });

  it("acknowledges a matched idempotent delivery event", async () => {
    mocks.record.mockResolvedValue({ matched: true, duplicate: true, applied: false });
    const response = await POST(request());
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, duplicate: true, applied: false });
  });
});
