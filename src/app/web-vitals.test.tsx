import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/web-vitals", () => ({
  useReportWebVitals: vi.fn(),
}));

import { reportWebVitals } from "./web-vitals";

const metric = {
  id: "v4-test",
  name: "LCP",
  value: 2_100,
  delta: 2_100,
  rating: "good",
  navigationType: "navigate",
  entries: [],
};

describe("web vitals client reporting", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => vi.unstubAllGlobals());

  it("falls back to keepalive fetch when sendBeacon declines the payload", async () => {
    const sendBeacon = vi.fn(() => false);
    const fetchMock = vi.fn(() => Promise.resolve(new Response(null, { status: 202 })));
    Object.defineProperty(navigator, "sendBeacon", { configurable: true, value: sendBeacon });
    vi.stubGlobal("fetch", fetchMock);

    reportWebVitals(metric as Parameters<typeof reportWebVitals>[0]);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());

    expect(sendBeacon).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith("/api/web-vitals", expect.objectContaining({
      method: "POST",
      keepalive: true,
    }));
  });

  it("does not duplicate an accepted beacon with fetch", () => {
    const sendBeacon = vi.fn(() => true);
    const fetchMock = vi.fn();
    Object.defineProperty(navigator, "sendBeacon", { configurable: true, value: sendBeacon });
    vi.stubGlobal("fetch", fetchMock);

    reportWebVitals(metric as Parameters<typeof reportWebVitals>[0]);

    expect(sendBeacon).toHaveBeenCalledOnce();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
