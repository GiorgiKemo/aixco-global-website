import { describe, expect, it, vi } from "vitest";
import {
  fetchAdminAnalyticsDashboard,
  fetchAdminOperationsSnapshot,
  getAnalyticsWindow,
  parseAdminAuditEvents,
  parseAnalyticsBreakdowns,
  parseAnalyticsCountries,
  parseAnalyticsDaily,
  parseAnalyticsRange,
  parseAnalyticsSummary,
  parseRecentErrors,
  parseRecentSessions,
  type OperationsCountClient,
} from "./analytics";

describe("admin analytics range helpers", () => {
  it("accepts only the bounded reporting ranges", () => {
    expect(parseAnalyticsRange("24h")).toBe("24h");
    expect(parseAnalyticsRange("90d")).toBe("90d");
    expect(parseAnalyticsRange("365d")).toBe("30d");
    expect(parseAnalyticsRange(["7d"])).toBe("30d");
  });

  it("builds an exact UTC window for the selected range", () => {
    const window = getAnalyticsWindow("7d", new Date("2026-08-07T12:00:00.000Z"));

    expect(window).toEqual({
      range: "7d",
      label: "Last 7 days",
      from: "2026-07-31T12:00:00.000Z",
      to: "2026-08-07T12:00:00.000Z",
    });
  });
});

describe("admin analytics payload parsing", () => {
  it("parses the versioned camelCase summary without inventing missing values", () => {
    expect(parseAnalyticsSummary({
      totalSessions: 42,
      totalVisitors: 31,
      returningSessions: 11,
      engagedSessions: 30,
      totalPageViews: 101,
      totalEvents: 165,
      telemetryEvents: 12,
      webVitalEvents: 7,
      totalInteractions: 77,
      totalActiveSeconds: 3_600,
      averageActiveSeconds: "85.7",
      bounceRatePercent: 19.25,
      conversions: 6,
      formSubmissions: 4,
      portalHandoffs: 2,
      errorEvents: 1,
      uniqueCountries: 5,
      latestEventAt: "2026-08-07T11:59:00.000Z",
    })).toMatchObject({
      sessions: 42,
      visitors: 31,
      returningSessions: 11,
      convertedSessions: 6,
      pageViews: 101,
      totalActiveSeconds: 3_600,
      averageActiveSeconds: 85.7,
      bounceRatePercent: 19.25,
    });

    expect(parseAnalyticsSummary({ totalSessions: 1 })).toBeNull();
    expect(parseAnalyticsSummary({ totalPageViews: 1 })).toBeNull();
  });

  it("filters malformed trend rows and clamps invalid counts", () => {
    expect(parseAnalyticsDaily([
      { date: "2026-08-06", sessions: 4, visitors: 3, pageViews: 9, events: 12, interactions: 7, conversions: 1, errors: 0, activeSeconds: 180 },
      { date: "not-a-date", sessions: 99 },
      { date: "2026-08-07", sessions: -5, pageViews: "6", errors: "2" },
    ])).toEqual([
      expect.objectContaining({ date: "2026-08-06", sessions: 4, visitors: 3, pageViews: 9, events: 12, errorEvents: 0 }),
      expect.objectContaining({ date: "2026-08-07", sessions: 0, pageViews: 6, errorEvents: 2 }),
    ]);
  });

  it("maps each production breakdown shape to a labeled count", () => {
    const result = parseAnalyticsBreakdowns({
      topPages: [{ pagePath: "/about", pageViews: 20, sessions: 12 }],
      topReferrers: [{ host: "google.com", path: "/search", sessions: 8 }],
      countries: [{ countryCode: "CH", sessions: 6, visitors: 4, engagedSessions: 3, engagedVisitors: 2, briefSessions: 3, localOrQaSessions: 0 }],
      devices: [{ deviceType: "mobile", browserName: "Safari", osName: "iOS", sessions: 10 }],
      funnel: [
        { step: 1, label: "Sessions", sessions: 20 },
        { step: 2, label: "Contact started", sessions: 5 },
      ],
    });

    expect(result).toEqual({
      topPages: [{ label: "/about", count: 20 }],
      topReferrers: [{ label: "google.com/search", count: 8 }],
      countries: [{ countryCode: "CH", countryName: "Switzerland", sessions: 6, visitors: 4, engagedSessions: 3, engagedVisitors: 2, briefSessions: 3, localOrQaSessions: 0 }],
      devices: [{ label: "mobile · Safari · iOS", count: 10 }],
      funnel: [
        { label: "Sessions", count: 20, ratePercent: 100 },
        { label: "Contact started", count: 5, ratePercent: 25 },
      ],
    });
    expect(parseAnalyticsBreakdowns({ summary: {} })).toBeNull();
  });

  it("keeps country metrics at country grain, rejects invalid codes, and does not truncate the first ten countries", () => {
    const countries = [
      { countryCode: "at", sessions: 21, visitors: 3, engagedSessions: 5, engagedVisitors: 2, briefSessions: 16, localOrQaSessions: 1 },
      ...Array.from({ length: 9 }, (_, index) => ({
        countryCode: ["DE", "CH", "SI", "ES", "GB", "IT", "MT", "US", "GE"][index],
        sessions: index + 1,
        visitors: 1,
        engagedSessions: 1,
        engagedVisitors: 1,
        briefSessions: 0,
        localOrQaSessions: 0,
      })),
      { countryCode: "Austria", sessions: 99 },
    ];

    const result = parseAnalyticsCountries(countries);

    expect(result).toHaveLength(10);
    expect(result[0]).toEqual({
      countryCode: "AT",
      countryName: "Austria",
      sessions: 21,
      visitors: 3,
      engagedSessions: 5,
      engagedVisitors: 2,
      briefSessions: 16,
      localOrQaSessions: 1,
    });
    expect(result.at(-1)).toMatchObject({ countryCode: "GE", countryName: "Georgia" });
  });

  it("drops incomplete operational rows and retains admin-only detail", () => {
    expect(parseRecentSessions([{
      id: "session-1",
      visitorId: "visitor-hash",
      startedAt: "2026-08-07T11:00:00.000Z",
      lastSeenAt: "2026-08-07T11:05:00.000Z",
      landingPath: "/",
      pageViewCount: 3,
      eventCount: 8,
      isReturning: true,
      viewportWidth: 390,
      viewportHeight: 844,
      ipAddress: "192.0.2.1",
    }, { id: "missing-timestamps" }])).toEqual([
      expect.objectContaining({
        id: "session-1",
        visitorId: "visitor-hash",
        pageViews: 3,
        events: 8,
        isReturning: true,
        viewportWidth: 390,
        ipAddress: "192.0.2.1",
      }),
    ]);

    expect(parseRecentErrors([{
      id: 9,
      occurredAt: "2026-08-07T11:10:00.000Z",
      eventType: "client_error",
      name: "TypeError",
      metadata: { message: "Failed to render" },
    }])).toEqual([
      expect.objectContaining({ id: "9", eventType: "client_error", message: "Failed to render" }),
    ]);

    expect(parseAdminAuditEvents([{
      id: 12,
      occurredAt: "2026-08-07T11:15:00.000Z",
      actorId: "admin-1",
      authMethod: "supabase-mfa",
      action: "analytics.view",
      outcome: "success",
      targetType: "dashboard",
      targetId: "site",
    }])).toEqual([
      expect.objectContaining({
        id: "12",
        actorId: "admin-1",
        authentication: "supabase-mfa",
        targetType: "dashboard",
        targetId: "site",
      }),
    ]);

    expect(parseAdminAuditEvents([{
      id: 13,
      occurredAt: "2026-08-07T11:16:00.000Z",
      actorId: "admin-2",
      action: "analytics.view",
      outcome: "denied",
    }])).toEqual([expect.objectContaining({ id: "13", outcome: "denied" })]);

    expect(parseAdminAuditEvents([{
      id: 14,
      occurredAt: "2026-08-07T11:17:00.000Z",
      actorId: null,
      action: "analytics.view",
      outcome: "success",
      details: { actorReference: "legacy-admin-reference" },
    }])).toEqual([
      expect.objectContaining({
        id: "14",
        actorId: "legacy-admin-reference",
        action: "analytics.view",
        provenance: "server-verified",
        details: { actorReference: "legacy-admin-reference" },
      }),
    ]);

    const unverified = parseAdminAuditEvents([{
      id: 15,
      occurredAt: "2026-08-07T11:18:00.000Z",
      action: "admin.login",
      outcome: "failure",
      details: {
        phase: "credentials",
        reason: "x".repeat(400),
        clientReported: true,
        principalVerified: false,
        accessToken: "must never be displayed",
        nested: { must: "not escape" },
        "invalid-key": "discarded",
      },
    }]);

    expect(unverified).toEqual([
      expect.objectContaining({
        id: "15",
        provenance: "client-reported-unverified",
        details: {
          phase: "credentials",
          reason: "x".repeat(255),
          clientReported: true,
          principalVerified: false,
          accessToken: "[redacted]",
        },
      }),
    ]);
  });
});

describe("admin analytics data access", () => {
  it("calls the bounded dashboard and country RPCs and parses their results", async () => {
    const rpc = vi.fn().mockImplementation(async (name: string) => name === "get_site_analytics_country_breakdown"
      ? {
          data: {
            schemaVersion: "20260813112500",
            window: {
              start: "2026-08-06T12:00:00.000Z",
              end: "2026-08-07T12:00:00.000Z",
            },
            countries: [{ countryCode: "AT", sessions: 2, visitors: 2, engagedSessions: 1, engagedVisitors: 1, briefSessions: 1, localOrQaSessions: 0 }],
          },
          error: null,
        }
      : ({
      data: {
        schemaVersion: "20260807130642",
        window: {
          start: "2026-08-06T12:00:00.000Z",
          end: "2026-08-07T12:00:00.000Z",
        },
        summary: {
          totalSessions: 2,
          totalVisitors: 2,
          returningSessions: 0,
          engagedSessions: 1,
          totalPageViews: 5,
          totalEvents: 8,
          telemetryEvents: 2,
          webVitalEvents: 1,
          totalInteractions: 3,
          totalActiveSeconds: 120,
          averageActiveSeconds: 60,
          bounceRatePercent: 50,
          conversions: 1,
          formSubmissions: 1,
          portalHandoffs: 0,
          errorEvents: 0,
          uniqueCountries: 1,
          latestEventAt: "2026-08-07T11:59:00.000Z",
        },
        daily: [],
        topPages: [],
        topReferrers: [],
        countries: [],
        devices: [],
        funnel: [],
        recentSessions: [],
        recentErrors: [],
        recentAdminAudit: [],
      },
      error: null,
    }));

    const result = await fetchAdminAnalyticsDashboard("24h", {
      now: new Date("2026-08-07T12:00:00.000Z"),
      client: { rpc },
    });

    expect(rpc).toHaveBeenNthCalledWith(1, "get_site_analytics_dashboard", {
      p_start: "2026-08-06T12:00:00.000Z",
      p_end: "2026-08-07T12:00:00.000Z",
      p_limit: 24,
    });
    expect(rpc).toHaveBeenNthCalledWith(2, "get_site_analytics_country_breakdown", {
      p_start: "2026-08-06T12:00:00.000Z",
      p_end: "2026-08-07T12:00:00.000Z",
      p_limit: 100,
    });
    expect(result).toMatchObject({
      ok: true,
      data: {
        summary: { sessions: 2, visitors: 2, pageViews: 5 },
        breakdowns: { countries: [{ countryCode: "AT", countryName: "Austria" }] },
        warnings: [],
      },
    });
  });

  it("does not display the legacy city-grain country list when the country RPC is unavailable", async () => {
    const from = "2026-08-06T12:00:00.000Z";
    const to = "2026-08-07T12:00:00.000Z";
    const rpc = vi.fn().mockImplementation(async (name: string) => name === "get_site_analytics_country_breakdown"
      ? { data: null, error: { code: "PGRST202", message: "missing function" } }
      : {
          data: {
            schemaVersion: "20260807130642",
            window: { start: from, end: to },
            summary: {
              totalSessions: 2,
              totalVisitors: 2,
              returningSessions: 0,
              engagedSessions: 1,
              conversions: 0,
              totalPageViews: 2,
              totalEvents: 2,
              telemetryEvents: 0,
              webVitalEvents: 0,
              totalInteractions: 0,
              totalActiveSeconds: 12,
              averageActiveSeconds: 6,
              bounceRatePercent: 50,
              errorEvents: 0,
              formSubmissions: 0,
              portalHandoffs: 0,
              uniqueCountries: 1,
              latestEventAt: to,
            },
            daily: [],
            topPages: [],
            topReferrers: [],
            countries: [{ countryCode: "AT", region: "9", city: "Vienna", sessions: 8 }],
            devices: [],
            funnel: [],
            recentSessions: [],
            recentErrors: [],
            recentAdminAudit: [],
          },
          error: null,
        });

    const result = await fetchAdminAnalyticsDashboard("24h", {
      now: new Date(to),
      client: { rpc },
    });

    expect(result).toMatchObject({
      ok: true,
      data: {
        breakdowns: { countries: [] },
        warnings: ["Country quality metrics are temporarily unavailable; session totals remain visible."],
      },
    });
  });

  it("rejects a country payload for a different reporting window", async () => {
    const from = "2026-08-06T12:00:00.000Z";
    const to = "2026-08-07T12:00:00.000Z";
    const dashboard = {
      schemaVersion: "20260807130642",
      window: { start: from, end: to },
      summary: {
        totalSessions: 1, totalVisitors: 1, returningSessions: 0, engagedSessions: 1,
        conversions: 0, totalPageViews: 1, totalEvents: 1, telemetryEvents: 0,
        webVitalEvents: 0, totalInteractions: 0, totalActiveSeconds: 12,
        averageActiveSeconds: 12, bounceRatePercent: 0, errorEvents: 0,
        formSubmissions: 0, portalHandoffs: 0, uniqueCountries: 1, latestEventAt: to,
      },
      daily: [], topPages: [], topReferrers: [], countries: [], devices: [], funnel: [],
      recentSessions: [], recentErrors: [], recentAdminAudit: [],
    };
    const rpc = vi.fn().mockImplementation(async (name: string) => name === "get_site_analytics_country_breakdown"
      ? {
          data: {
            schemaVersion: "20260813112500",
            window: { start: "2026-08-01T00:00:00.000Z", end: "2026-08-02T00:00:00.000Z" },
            countries: [{ countryCode: "ES", sessions: 2, visitors: 1, engagedSessions: 2, engagedVisitors: 1, briefSessions: 0, localOrQaSessions: 0 }],
          },
          error: null,
        }
      : { data: dashboard, error: null });

    const result = await fetchAdminAnalyticsDashboard("24h", {
      now: new Date(to),
      client: { rpc },
    });

    expect(result).toMatchObject({
      ok: true,
      data: {
        breakdowns: { countries: [] },
        warnings: ["Country quality metrics are temporarily unavailable; session totals remain visible."],
      },
    });
  });

  it("returns an explicit unavailable result for RPC and schema failures", async () => {
    const databaseFailure = await fetchAdminAnalyticsDashboard("30d", {
      client: { rpc: async () => ({ data: null, error: { code: "42501", message: "denied" } }) },
    });
    const schemaFailure = await fetchAdminAnalyticsDashboard("30d", {
      client: { rpc: async () => ({ data: { summary: { totalSessions: 2 } }, error: null }) },
    });
    const windowFailure = await fetchAdminAnalyticsDashboard("24h", {
      now: new Date("2026-08-07T12:00:00.000Z"),
      client: {
        rpc: async () => ({
          data: {
            schemaVersion: "20260807130642",
            window: {
              start: "2026-08-01T00:00:00.000Z",
              end: "2026-08-02T00:00:00.000Z",
            },
          },
          error: null,
        }),
      },
    });

    expect(databaseFailure).toEqual({ ok: false, reason: "Analytics data is unavailable (42501)." });
    expect(schemaFailure).toEqual({ ok: false, reason: "Analytics RPC returned an unsupported schema version." });
    expect(windowFailure).toEqual({ ok: false, reason: "Analytics RPC returned a mismatched reporting window." });
  });

  it("loads operations totals with head-only count queries and never fetches lead rows", async () => {
    const values = {
      contact_submissions: { total: 15, new: 4, qualified: 6 },
      chat_transcripts: { total: 9, new: 2, qualified: 3 },
      portal_click_events: { total: 21, new: 0, qualified: 0 },
    } as const;
    const select = vi.fn((table: keyof typeof values) => {
      const result = (status?: "new" | "qualified") => Promise.resolve({
        count: status ? values[table][status] : values[table].total,
        error: null,
      });
      return {
        eq: vi.fn((_column: "status", status: "new" | "qualified") => result(status)),
        neq: vi.fn(() => result()),
        then: <TResult1 = { count: number; error: null }, TResult2 = never>(
          onfulfilled?: ((value: { count: number; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
          onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
        ) => result().then(onfulfilled, onrejected),
      };
    });
    const client = {
      from: vi.fn((table: keyof typeof values) => ({
        select: vi.fn((columns: string, options: unknown) => {
          expect(columns).toBe("id");
          expect(options).toEqual({ count: "exact", head: true });
          return select(table);
        }),
      })),
    } as unknown as OperationsCountClient;

    await expect(fetchAdminOperationsSnapshot({ client })).resolves.toEqual({
      ok: true,
      data: {
        totalContacts: 15,
        totalChats: 9,
        newContacts: 4,
        newChats: 2,
        qualifiedContacts: 6,
        qualifiedChats: 3,
        totalPortalHandoffs: 21,
      },
    });
    expect(client.from).toHaveBeenCalledTimes(7);
    expect(select).toHaveBeenCalledTimes(7);
  });

  it("marks operations totals unavailable when a count query fails", async () => {
    const failedQuery = {
      eq: vi.fn(async () => ({ count: null, error: { code: "XX001", message: "failure" } })),
      neq: vi.fn(async () => ({ count: null, error: { code: "XX001", message: "failure" } })),
      then: <TResult1 = { count: null; error: { code: string; message: string } }, TResult2 = never>(
        onfulfilled?: ((value: { count: null; error: { code: string; message: string } }) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
      ) => Promise.resolve({ count: null, error: { code: "XX001", message: "failure" } }).then(onfulfilled, onrejected),
    };
    const client = {
      from: vi.fn(() => ({ select: vi.fn(() => failedQuery) })),
    } as unknown as OperationsCountClient;

    await expect(fetchAdminOperationsSnapshot({ client })).resolves.toEqual({
      ok: false,
      reason: "Operational lead totals could not be loaded from the production data source.",
    });
  });
});
