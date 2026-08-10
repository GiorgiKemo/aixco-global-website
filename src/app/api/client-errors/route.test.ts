import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetRateLimitStore } from "@/lib/security/rate-limit";

const mocks = vi.hoisted(() => ({
  guard: vi.fn(),
  origin: vi.fn(),
  store: vi.fn(),
}));

vi.mock("@/lib/backend/lead-capture-abuse", () => ({
  checkDistributedLeadCaptureLimit: mocks.guard,
}));
vi.mock("@/lib/backend/lead-capture-route", () => ({
  isTrustedLeadCaptureOrigin: mocks.origin,
}));
vi.mock("@/lib/backend/site-telemetry", () => ({
  storeSiteTelemetryEvent: mocks.store,
}));

import { POST } from "./route";

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://www.aixco.global/api/client-errors", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://www.aixco.global", ...headers },
    body: JSON.stringify(body),
  });
}

describe("client error telemetry route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimitStore();
    mocks.origin.mockReturnValue(true);
    mocks.guard.mockResolvedValue({ allowed: true });
    mocks.store.mockResolvedValue(undefined);
  });

  it.each([
    ["route-render", "error_boundary"],
    ["root-render", "global_error"],
  ])("accepts the %s boundary payload without raw error text", async (kind, eventName) => {
    const response = await POST(request({ kind, digest: "safe-digest", locale: "en" }));
    expect(response.status).toBe(202);
    expect(mocks.store).toHaveBeenCalledWith({
      eventKind: "client_error",
      eventName,
      eventId: "safe-digest",
      pagePath: null,
      metadata: { digest: "safe-digest", source: kind },
    });
    expect(mocks.guard).toHaveBeenCalledWith("telemetry", null, expect.any(Headers));
  });

  it("rejects unknown fields so stack traces and messages cannot be persisted", async () => {
    const response = await POST(request({ kind: "route-render", digest: "abc", message: "private@example.com" }));
    expect(response.status).toBe(400);
    expect(mocks.store).not.toHaveBeenCalled();
  });

  it.each(["sec-gpc", "dnt"])("drops telemetry when %s is active", async (header) => {
    const response = await POST(request(
      { kind: "route-render", digest: "safe-digest", locale: "en" },
      { [header]: "1" },
    ));
    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      stored: false,
      droppedReason: "browser_privacy_signal",
    });
    expect(mocks.guard).not.toHaveBeenCalled();
    expect(mocks.store).not.toHaveBeenCalled();
  });

  it("stops a local flood before it can create unbounded distributed guard writes", async () => {
    for (let index = 0; index < 30; index += 1) {
      expect((await POST(request({ kind: "route-render", digest: `digest-${index}` }))).status).toBe(202);
    }

    const blocked = await POST(request({ kind: "route-render", digest: "digest-blocked" }));
    expect(blocked.status).toBe(202);
    await expect(blocked.json()).resolves.toEqual({
      ok: true,
      stored: false,
      droppedReason: "local_rate_limit",
    });
    expect(mocks.guard).toHaveBeenCalledTimes(30);
    expect(mocks.store).toHaveBeenCalledTimes(30);
  });
});
