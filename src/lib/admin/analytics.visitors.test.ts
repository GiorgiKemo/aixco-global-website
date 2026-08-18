import { describe, expect, it } from "vitest";
import {
  fetchAdminAnalyticsCountryVisitors,
  fetchAdminAnalyticsVisitorActivity,
} from "./analytics";

const visitorId = "11111111-1111-4111-8111-111111111111";
const sessionId = "33333333-3333-4333-8333-333333333333";

function queryFor(table: string, rows: Record<string, unknown>[]) {
  const result = { data: rows, error: null };
  const query: Record<string, unknown> = {
    select: () => query,
    eq: () => query,
    gte: () => query,
    lt: () => query,
    in: () => query,
    order: () => query,
    limit: () => query,
    then: (resolve: (value: typeof result) => unknown, reject?: (reason: unknown) => unknown) => Promise.resolve(result).then(resolve, reject),
  };
  void table;
  return query;
}

function client() {
  const networkRows = [{ session_id: sessionId, country_code: "CH", region: "Zurich", city: "Zurich" }];
  const sessionRows = [{
    id: sessionId,
    visitor_id: visitorId,
    created_at: "2026-08-17T10:00:00.000Z",
    started_at: "2026-08-17T10:00:00.000Z",
    last_seen_at: "2026-08-17T10:02:00.000Z",
    ended_at: null,
    active_seconds: 120,
    landing_path: "/",
    exit_path: "/contact",
    device_type: "desktop",
    browser_name: "Safari",
    os_name: "macOS",
  }];
  const eventRows = [{
    id: "44444444-4444-4444-8444-444444444444",
    session_id: sessionId,
    received_at: "2026-08-17T10:01:00.000Z",
    occurred_at: "2026-08-17T10:01:00.000Z",
    event_type: "page_view",
    name: "page_view",
    page_path: "/contact",
    section_id: null,
    target_label: null,
    value: null,
    duration_ms: null,
    scroll_depth: null,
  }];
  return {
    from(table: string) {
      if (table === "site_analytics_session_network") return queryFor(table, networkRows);
      if (table === "site_analytics_sessions") return queryFor(table, sessionRows);
      return queryFor(table, eventRows);
    },
  };
}

describe("analytics visitor drill-down data access", () => {
  it("groups a country into pseudonymous visitor summaries", async () => {
    const result = await fetchAdminAnalyticsCountryVisitors("7d", "ch", {
      now: new Date("2026-08-18T12:00:00.000Z"),
      client: client() as never,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.countryCode).toBe("CH");
    expect(result.data.visitors).toHaveLength(1);
    expect(result.data).toMatchObject({
      page: 1,
      pageSize: 20,
      totalVisitors: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });
    expect(result.data.visitors[0]).toMatchObject({
      visitorId,
      sessions: 1,
      pageViews: 1,
      activeSeconds: 120,
      lastPath: "/contact",
    });
    expect(JSON.stringify(result.data)).not.toContain("target_label");
  });

  it("returns only the selected visitor's bounded timeline", async () => {
    const result = await fetchAdminAnalyticsVisitorActivity("7d", "CH", visitorId, {
      now: new Date("2026-08-18T12:00:00.000Z"),
      client: client() as never,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.activity.visitorId).toBe(visitorId);
    expect(result.data.activity.sessions[0]?.eventsTimeline[0]).toMatchObject({
      name: "page_view",
      pagePath: "/contact",
    });
    expect(result.data.activity.sessions[0]).not.toHaveProperty("userAgent");
    expect(result.data.activity.sessions[0]).not.toHaveProperty("ipAddress");
  });

  it("rejects invalid visitor identifiers before querying", async () => {
    const result = await fetchAdminAnalyticsVisitorActivity("7d", "CH", "not-a-uuid", { client: client() as never });
    expect(result).toMatchObject({ ok: false, status: 400 });
  });
});
