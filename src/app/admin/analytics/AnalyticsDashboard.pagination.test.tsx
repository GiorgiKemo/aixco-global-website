import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type {
  AdminAnalyticsDashboard,
  AdminAuditRecord,
  RecentAnalyticsError,
  RecentAnalyticsSession,
} from "@/lib/admin/analytics";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { createAnalyticsPaginationState } from "./pagination";

const timestamp = "2026-08-11T12:00:00.000Z";

function createSession(index: number): RecentAnalyticsSession {
  return {
    id: `session-${index}`,
    visitorId: `visitor-${index}`,
    startedAt: timestamp,
    lastSeenAt: timestamp,
    endedAt: null,
    activeSeconds: index,
    pageViews: index,
    events: index,
    landingPage: `/page/${index}`,
    exitPage: null,
    referrer: null,
    country: "AT",
    region: "Vienna",
    city: "Vienna",
    device: "desktop",
    browser: "Chrome",
    operatingSystem: "Windows",
    userAgent: null,
    locale: "en",
    timezone: "Europe/Vienna",
    isReturning: false,
    viewportWidth: 1280,
    viewportHeight: 800,
    ipAddress: null,
    ipHash: null,
    journey: [],
  };
}

function createError(index: number): RecentAnalyticsError {
  return {
    id: `error-${index}`,
    occurredAt: timestamp,
    name: `Error ${index}`,
    pagePath: `/error/${index}`,
    sessionId: null,
    message: null,
    eventType: "client_error",
    sectionId: null,
    targetLabel: null,
    fingerprint: null,
    count: 1,
  };
}

function createAuditEvent(index: number): AdminAuditRecord {
  return {
    id: `audit-${index}`,
    occurredAt: timestamp,
    actorId: "admin-id",
    actorEmailHash: null,
    authentication: "supabase-password",
    action: `admin.action.${index}`,
    outcome: "success",
    targetType: null,
    targetId: null,
    requestId: null,
    userAgent: null,
    ipAddress: null,
    ipHash: null,
    provenance: "server-verified",
    details: {},
  };
}

function createDashboard(overrides: Partial<AdminAnalyticsDashboard> = {}): AdminAnalyticsDashboard {
  return {
    window: { range: "7d", label: "Last 7 days", from: timestamp, to: timestamp },
    generatedAt: timestamp,
    summary: {
      sessions: 0,
      visitors: 0,
      returningSessions: 0,
      engagedSessions: 0,
      convertedSessions: 0,
      pageViews: 0,
      events: 0,
      telemetryEvents: 0,
      webVitalEvents: 0,
      interactions: 0,
      totalActiveSeconds: 0,
      averageActiveSeconds: 0,
      bounceRatePercent: 0,
      errorEvents: 0,
      formSubmissions: 0,
      portalHandoffs: 0,
      uniqueCountries: 0,
      latestEventAt: null,
    },
    daily: null,
    breakdowns: null,
    recentSessions: [],
    recentErrors: [],
    auditEvents: [],
    warnings: [],
    ...overrides,
  };
}

const unavailableOperations = { ok: false as const, reason: "Not needed for this focused view." };

describe("analytics dashboard list pagination", () => {
  it("shows every country at country grain with visitor, engagement, session, and QA metrics", () => {
    const countryCodes = ["AT", "DE", "CH", "SI", "ES", "GB", "IT", "MT", "US", "GE"];
    const data = createDashboard({
      breakdowns: {
        topPages: [],
        topReferrers: [],
        devices: [],
        funnel: [],
        countries: countryCodes.map((countryCode, index) => ({
          countryCode,
          countryName: new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode) ?? countryCode,
          sessions: index + 1,
          visitors: index + 1,
          engagedSessions: index === 0 ? 5 : 1,
          engagedVisitors: index === 0 ? 2 : 1,
          briefSessions: 0,
          localOrQaSessions: index === 0 ? 1 : 0,
        })),
      },
    });
    const pagination = createAnalyticsPaginationState({
      totals: { sessions: 0, errors: 0, audit: 0 },
      requestedPages: { sessions: 1, errors: 1, audit: 1 },
    });

    render(<AnalyticsDashboard data={data} operations={unavailableOperations} focus="traffic" range="7d" pagination={pagination} />);

    const countryTable = screen.getByRole("table");
    const austriaRow = within(countryTable).getByRole("row", { name: /AustriaAT 1 2\(5 sessions\) 1 1 local \/ automated QA session/i });
    expect(austriaRow).toBeInTheDocument();
    expect(within(countryTable).getByText("Georgia")).toBeInTheDocument();
    expect(within(countryTable).getAllByRole("row")).toHaveLength(11);
    expect(screen.getByText(/does not claim to identify VPN usage/i)).toBeInTheDocument();
  });

  it("renders only the selected six-item session page with accessible links", () => {
    const data = createDashboard({ recentSessions: Array.from({ length: 8 }, (_, index) => createSession(index + 1)) });
    const pagination = createAnalyticsPaginationState({
      totals: { sessions: 8, errors: 0, audit: 0 },
      requestedPages: { sessions: 2, errors: 1, audit: 1 },
    });

    render(<AnalyticsDashboard data={data} operations={unavailableOperations} focus="sessions" range="7d" pagination={pagination} />);

    expect(screen.getAllByText("/page/7").length).toBeGreaterThan(0);
    expect(screen.getAllByText("/page/8").length).toBeGreaterThan(0);
    expect(screen.queryByText("/page/1")).not.toBeInTheDocument();
    expect(screen.getByText("Showing 7-8 of 8")).toBeInTheDocument();

    const paginationNav = screen.getByRole("navigation", { name: "Visitor sessions pagination" });
    expect(within(paginationNav).getByRole("link", { name: "Visitor sessions, page 2" })).toHaveAttribute("aria-current", "page");
    expect(within(paginationNav).getByRole("link", { name: "Previous visitor sessions page" })).toHaveAttribute(
      "href",
      "/admin/analytics?range=7d&focus=sessions",
    );
  });

  it("uses a compact responsive disclosure with human-readable timeline and private details", () => {
    const session = createSession(1);
    session.landingPage = "/#materials";
    session.exitPage = "/#contact";
    session.referrer = "google.com";
    session.referrerPath = "/search";
    session.utmSource = "google";
    session.utmMedium = "cpc";
    session.utmCampaign = "swiss-investors";
    session.screenWidth = 1440;
    session.screenHeight = 900;
    session.ipAddress = "185.99.26.69/32";
    session.journey = [
      {
        id: "event-1",
        occurredAt: "2026-08-11T12:00:05.000Z",
        type: "page",
        name: "page_view",
        pagePath: "/#materials",
        sectionId: null,
        targetLabel: null,
        value: null,
        durationMs: null,
        scrollDepth: null,
      },
      {
        id: "event-2",
        occurredAt: "2026-08-11T12:00:18.000Z",
        type: "interaction",
        name: "whatsapp_click",
        pagePath: "/#contact",
        sectionId: "contact",
        targetLabel: "WhatsApp",
        value: null,
        durationMs: null,
        scrollDepth: 75,
      },
    ];
    session.events = session.journey.length;

    const data = createDashboard({ recentSessions: [session] });
    const pagination = createAnalyticsPaginationState({
      totals: { sessions: 1, errors: 0, audit: 0 },
      requestedPages: { sessions: 1, errors: 1, audit: 1 },
    });

    const { container } = render(<AnalyticsDashboard data={data} operations={unavailableOperations} focus="sessions" range="7d" pagination={pagination} />);

    expect(screen.getByLabelText("Sessions on this page")).toBeInTheDocument();
    expect(screen.getByText("Visitor path")).toBeInTheDocument();
    expect(screen.getByText("Activity timeline")).toBeInTheDocument();
    expect(screen.getByText("Opened WhatsApp")).toBeInTheDocument();
    expect(screen.getByText(/Campaign: google · cpc · swiss-investors/)).toBeInTheDocument();
    expect(screen.getByText("Last page: /#contact")).toBeInTheDocument();
    expect(screen.getByText(/1440×900 screen/)).toBeInTheDocument();
    expect(screen.getByText("Technical & privacy details")).toBeInTheDocument();
    expect(screen.getByText("185.99.x.x")).toBeInTheDocument();
    expect(container.querySelector("table[style*='1120px']")).not.toBeInTheDocument();
    expect(container.textContent).not.toMatch(/Â·|Ã—/u);
  });

  it("paginates errors and audit events independently while preserving both page positions", () => {
    const data = createDashboard({
      recentErrors: Array.from({ length: 7 }, (_, index) => createError(index + 1)),
      auditEvents: Array.from({ length: 13 }, (_, index) => createAuditEvent(index + 1)),
    });
    const pagination = createAnalyticsPaginationState({
      totals: { sessions: 0, errors: 7, audit: 13 },
      requestedPages: { sessions: 1, errors: 2, audit: 3 },
    });

    render(<AnalyticsDashboard data={data} operations={unavailableOperations} focus="reliability" range="30d" pagination={pagination} />);

    expect(screen.getByText("Error 7")).toBeInTheDocument();
    expect(screen.queryByText("Error 1")).not.toBeInTheDocument();
    expect(screen.getByText("admin.action.13")).toBeInTheDocument();
    expect(screen.getByText("Showing 7-7 of 7")).toBeInTheDocument();
    expect(screen.getByText("Showing 13-13 of 13")).toBeInTheDocument();

    const errorPagination = screen.getByRole("navigation", { name: "Application errors pagination" });
    expect(within(errorPagination).getByRole("link", { name: "Application errors, page 1" })).toHaveAttribute(
      "href",
      "/admin/analytics?range=30d&focus=reliability&auditPage=3",
    );
    const auditPagination = screen.getByRole("navigation", { name: "Admin audit trail pagination" });
    expect(within(auditPagination).getByRole("link", { name: "Previous admin audit trail page" })).toHaveAttribute(
      "href",
      "/admin/analytics?range=30d&focus=reliability&errorsPage=2&auditPage=2",
    );
  });
});
