import { describe, expect, it, vi } from "vitest";
import { ANALYTICS_CONSENT_VERSION, type AnalyticsBatchInput } from "@/lib/analytics/contracts";
import {
  getAnalyticsRequestContext,
  normalizeAnalyticsTimeline,
  storeAnalyticsBatch,
  type AnalyticsWriteClient,
} from "./site-analytics";

const sessionId = "fd90fc90-b588-491f-8e1d-f1f69d738d4f";

function batch(): AnalyticsBatchInput {
  return {
    consent: { status: "granted", version: ANALYTICS_CONSENT_VERSION },
    session: {
      id: sessionId,
      visitorId: "5f7b5d5a-902b-4383-99df-b44f78f85212",
      startedAt: "2026-08-07T10:00:00.000Z",
      lastSeenAt: "2026-08-07T10:02:00.000Z",
      activeSeconds: 90,
      landingPath: "/landing?private=secret#about",
      exitPath: "/contact?token=private#contact",
      referrer: "https://www.google.com/search?q=private-value",
      campaign: { source: "google", medium: "organic", campaign: "summer" },
      locale: "de-AT",
      timezone: "Europe/Vienna",
      screenWidth: 390,
      screenHeight: 844,
      viewportWidth: 390,
      viewportHeight: 700,
      isReturning: true,
    },
    events: [{
      id: "b2945578-a1fa-4d7f-9ee7-4210d9ca7a5b",
      type: "download",
      name: "download_requested",
      pagePath: "/downloads?token=private#materials",
      occurredAt: "2026-08-07T10:01:00.000Z",
      targetLabel: "Reverance brochure",
      metadata: {
        downloadExtension: "pdf",
        linkHost: "aixco.global",
        message: "must not be stored",
        email: "private@example.com",
      },
    }],
  };
}

function recordingClient(error: { message: string; code?: string } | null = null) {
  const calls: Array<{
    fn: string;
    args: {
      p_session: Record<string, unknown>;
      p_network: Record<string, unknown>;
      p_events: Record<string, unknown>[];
    };
  }> = [];
  const client: AnalyticsWriteClient = {
    rpc: async (fn, args) => {
      calls.push({ fn, args });
      return { data: args.p_events.length, error };
    },
  };
  return { client, calls };
}

describe("site analytics storage", () => {
  it("derives a bounded network context from trusted proxy headers", () => {
    const context = getAnalyticsRequestContext(new Headers({
      "x-vercel-forwarded-for": "203.0.113.9:443, 10.0.0.1",
      "x-forwarded-for": "198.51.100.1",
      "x-vercel-ip-country": "at",
      "x-vercel-ip-country-region": " Vienna ",
      "x-vercel-ip-city": "Wien%20Innere%20Stadt",
      "user-agent": "Mozilla/5.0 test",
    }));

    expect(context).toMatchObject({
      ipAddress: "203.0.113.9",
      countryCode: "AT",
      region: "Vienna",
      city: "Wien Innere Stadt",
      userAgent: "Mozilla/5.0 test",
    });
    expect(context.ipHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("rejects unparseable client IP values instead of storing arbitrary header text", () => {
    const context = getAnalyticsRequestContext(new Headers({
      "x-forwarded-for": "private@example.com, 203.0.113.10",
    }));
    expect(context.ipAddress).toBeNull();
    expect(context.ipHash).toBeNull();
  });

  it("stores normalized sessions, network data, and allowlisted event metadata", async () => {
    const { client, calls } = recordingClient();
    const result = await storeAnalyticsBatch(batch(), new Headers({
      "x-vercel-forwarded-for": "2001:db8::1",
      "x-vercel-ip-country": "AT",
      "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile Safari/604.1",
    }), { client, now: new Date("2026-08-07T10:03:00.000Z") });

    expect(result).toMatchObject({ sessionId, eventCount: 1 });
    expect(result.receipt).toMatch(/^[a-f0-9]{16}$/);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.fn).toBe("store_site_analytics_batch");

    expect(calls[0]?.args.p_session).toMatchObject({
      landing_path: "/landing#about",
      exit_path: "/contact#contact",
      referrer_host: "www.google.com",
      referrer_path: "/search",
      device_type: "mobile",
      browser_name: "Safari",
      os_name: "iOS",
      is_returning: true,
    });
    expect(calls[0]?.args.p_network).toMatchObject({
      session_id: sessionId,
      ip_address: "2001:db8::1",
      country_code: "AT",
    });
    expect(calls[0]?.args.p_events).toEqual([expect.objectContaining({
      name: "download_requested",
      page_path: "/downloads#materials",
      metadata: {
        downloadExtension: "pdf",
        linkHost: "aixco.global",
      },
    })]);
  });

  it("clamps forged timestamps and active time to a bounded server-relative timeline", () => {
    const input = batch();
    input.session.startedAt = "2000-01-01T00:00:00.000Z";
    input.session.lastSeenAt = "2099-01-01T00:00:00.000Z";
    input.session.endedAt = "2099-01-02T00:00:00.000Z";
    input.session.activeSeconds = 604_800;
    input.events[0]!.occurredAt = "1999-01-01T00:00:00.000Z";

    const timeline = normalizeAnalyticsTimeline(
      input.session,
      input.events,
      new Date("2026-08-07T12:00:00.000Z"),
    );
    expect(timeline.startedAt).toBe("2026-08-07T11:30:00.000Z");
    expect(timeline.lastSeenAt).toBe("2026-08-07T12:05:00.000Z");
    expect(timeline.endedAt).toBe("2026-08-07T12:05:00.000Z");
    expect(timeline.activeSeconds).toBe(2_100);
    expect(timeline.events[0]?.occurredAt).toBe(timeline.startedAt);
  });

  it("fails with a bounded database code and never leaks the database message", async () => {
    const { client } = recordingClient({
      code: "42501",
      message: "sensitive row policy details",
    });

    const operation = storeAnalyticsBatch(batch(), new Headers(), {
      client,
      now: new Date("2026-08-07T10:03:00.000Z"),
    });
    await expect(operation).rejects.toThrow("Analytics batch storage failed (42501).");
    await expect(operation).rejects.not.toThrow("sensitive row policy details");
  });
});
