import "server-only";

import { getSupabaseAdminClient, getSupabaseAdminConfig } from "@/lib/supabase/admin";

export const ANALYTICS_RANGE_OPTIONS = [
  { value: "24h", label: "Last 24 hours", hours: 24 },
  { value: "7d", label: "Last 7 days", hours: 24 * 7 },
  { value: "30d", label: "Last 30 days", hours: 24 * 30 },
  { value: "90d", label: "Last 90 days", hours: 24 * 90 },
] as const;

export type AnalyticsRange = (typeof ANALYTICS_RANGE_OPTIONS)[number]["value"];

export type AnalyticsWindow = {
  range: AnalyticsRange;
  label: string;
  from: string;
  to: string;
};

export type AnalyticsSummary = {
  sessions: number;
  visitors: number;
  returningSessions: number;
  engagedSessions: number;
  convertedSessions: number;
  pageViews: number;
  events: number;
  telemetryEvents: number;
  webVitalEvents: number;
  interactions: number;
  totalActiveSeconds: number;
  averageActiveSeconds: number;
  bounceRatePercent: number;
  errorEvents: number;
  formSubmissions: number;
  portalHandoffs: number;
  uniqueCountries: number;
  latestEventAt: string | null;
};

export type AnalyticsDailyPoint = {
  date: string;
  sessions: number;
  visitors: number;
  engagedSessions: number;
  pageViews: number;
  events: number;
  webVitals: number;
  interactions: number;
  conversions: number;
  errorEvents: number;
  activeSeconds: number;
};

export type AnalyticsBreakdownItem = {
  label: string;
  count: number;
};

export type AnalyticsCountryBreakdownItem = {
  countryCode: string;
  countryName: string;
  sessions: number;
  visitors: number;
  engagedSessions: number;
  engagedVisitors: number;
  briefSessions: number;
  localOrQaSessions: number;
};

export type AnalyticsFunnelStep = AnalyticsBreakdownItem & {
  ratePercent: number | null;
};

export type AnalyticsBreakdowns = {
  topPages: AnalyticsBreakdownItem[];
  topReferrers: AnalyticsBreakdownItem[];
  countries: AnalyticsCountryBreakdownItem[];
  devices: AnalyticsBreakdownItem[];
  funnel: AnalyticsFunnelStep[];
};

export type AnalyticsIntentCount = {
  name: string;
  clicks: number;
  sessions: number;
  visitors: number;
};

export type AnalyticsPortalActivity = {
  id: string;
  occurredAt: string;
  mode: string;
  roleTitle: string;
  action: string;
  portalUrl: string;
  locale: string | null;
  pagePath: string | null;
  sessionId: string | null;
  visitorId: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
  ipAddress: string | null;
  ipHash: string | null;
  userAgent: string | null;
};

export type AnalyticsWhatsAppActivity = {
  id: string;
  occurredAt: string;
  name: string;
  targetLabel: string | null;
  pagePath: string | null;
  sectionId: string | null;
  linkHost: string | null;
  linkPath: string | null;
  sessionId: string;
  visitorId: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
  ipAddress: string | null;
  ipHash: string | null;
};

export type AnalyticsIntentActivity = {
  summary: {
    totalIntentClicks: number;
    portalHandoffs: number;
    whatsappClicks: number;
    phoneClicks: number;
    emailClicks: number;
    downloadRequests: number;
    socialClicks: number;
    outboundLinks: number;
  };
  counts: AnalyticsIntentCount[];
  portalHandoffs: AnalyticsPortalActivity[];
  whatsappClicks: AnalyticsWhatsAppActivity[];
};

export type RecentSessionJourneyEvent = {
  id: string;
  occurredAt: string;
  type: string;
  name: string;
  pagePath: string | null;
  sectionId: string | null;
  targetLabel: string | null;
  value: number | null;
  durationMs: number | null;
  scrollDepth: number | null;
};

export type RecentAnalyticsSession = {
  id: string;
  visitorId: string | null;
  startedAt: string;
  lastSeenAt: string;
  endedAt: string | null;
  activeSeconds: number;
  pageViews: number;
  events: number;
  landingPage: string;
  exitPage: string | null;
  referrer: string | null;
  referrerPath?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  device: string | null;
  browser: string | null;
  operatingSystem: string | null;
  userAgent: string | null;
  locale: string | null;
  timezone: string | null;
  isReturning: boolean;
  viewportWidth: number | null;
  viewportHeight: number | null;
  screenWidth?: number | null;
  screenHeight?: number | null;
  ipAddress: string | null;
  ipHash: string | null;
  journey: RecentSessionJourneyEvent[];
};

export type AdminAuditRecord = {
  id: string;
  occurredAt: string;
  actorId: string;
  actorEmailHash: string | null;
  authentication: string;
  action: string;
  outcome: "success" | "failure" | "denied";
  targetType: string | null;
  targetId: string | null;
  requestId: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  ipHash: string | null;
  provenance: "server-verified" | "client-reported-unverified";
  details: Record<string, string | number | boolean | null>;
};

export type RecentAnalyticsError = {
  id: string;
  occurredAt: string;
  name: string;
  pagePath: string | null;
  sessionId: string | null;
  message: string | null;
  eventType: string | null;
  sectionId: string | null;
  targetLabel: string | null;
  fingerprint: string | null;
  count: number;
};

export type AdminAnalyticsDashboard = {
  window: AnalyticsWindow;
  generatedAt: string;
  summary: AnalyticsSummary;
  intentActivity: AnalyticsIntentActivity | null;
  daily: AnalyticsDailyPoint[] | null;
  breakdowns: AnalyticsBreakdowns | null;
  recentSessions: RecentAnalyticsSession[] | null;
  recentErrors: RecentAnalyticsError[] | null;
  auditEvents: AdminAuditRecord[] | null;
  warnings: string[];
};

export type AdminAnalyticsDashboardResult =
  | { ok: true; data: AdminAnalyticsDashboard }
  | { ok: false; reason: string; missing?: string[] };

export type AdminOperationsSnapshot = {
  totalContacts: number;
  totalChats: number;
  newContacts: number;
  newChats: number;
  qualifiedContacts: number;
  qualifiedChats: number;
  totalPortalHandoffs: number;
};

export type AdminOperationsSnapshotResult =
  | { ok: true; data: AdminOperationsSnapshot }
  | { ok: false; reason: string; missing?: string[] };

type DatabaseError = { message: string; code?: string } | null;
type QueryResult = { data: unknown; error: DatabaseError };
type AnalyticsRpcClient = {
  rpc: (name: string, args: Record<string, unknown>) => PromiseLike<QueryResult>;
};
type AnalyticsTableQuery = PromiseLike<{ data: unknown; error: DatabaseError; count?: number | null }> & {
  eq: (column: string, value: string) => AnalyticsTableQuery;
  gte: (column: string, value: string) => AnalyticsTableQuery;
  lt: (column: string, value: string) => AnalyticsTableQuery;
  in: (column: string, values: string[]) => AnalyticsTableQuery;
  order: (column: string, options: { ascending: boolean }) => AnalyticsTableQuery;
  limit: (count: number) => AnalyticsTableQuery;
};
type AnalyticsTableClient = {
  from: (table: string) => {
    select: (columns: string, options?: { count?: "exact"; head?: boolean }) => AnalyticsTableQuery;
  };
};
type OperationsCountTable = "contact_submissions" | "chat_transcripts" | "portal_click_events";
type OperationsCountResult = { count: number | null; error: DatabaseError };
type OperationsCountQuery = PromiseLike<OperationsCountResult> & {
  eq: (column: "status", value: "new" | "qualified") => PromiseLike<OperationsCountResult>;
  neq: (column: "status", value: "archived") => PromiseLike<OperationsCountResult>;
};
type OperationsCountClient = {
  from: (table: OperationsCountTable) => {
    select: (
      columns: "id",
      options: { count: "exact"; head: true },
    ) => OperationsCountQuery;
  };
};

const DASHBOARD_RPC = "get_site_analytics_dashboard";
const COUNTRY_BREAKDOWN_RPC = "get_site_analytics_country_breakdown";
const INTENT_ACTIVITY_RPC = "get_site_analytics_intent_activity";
const DASHBOARD_SCHEMA_VERSION = "20260807130642";
const COUNTRY_BREAKDOWN_SCHEMA_VERSIONS = new Set(["20260813094605", "20260813112500"]);
const INTENT_ACTIVITY_SCHEMA_VERSION = "20260817150000";
const RECENT_SESSION_LIMIT = 24;
const BREAKDOWN_LIMIT = 8;
const COUNTRY_BREAKDOWN_LIMIT = 100;
const INTENT_ACTIVITY_LIMIT = 200;
const MAX_AUDIT_DETAIL_FIELDS = 12;
const SENSITIVE_AUDIT_DETAIL_KEY = /password|passcode|secret|token|cookie|authorization|api[_-]?key|message|transcript/i;
const countryDisplayNames = new Intl.DisplayNames(["en"], { type: "region" });

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function firstRow(value: unknown) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function finiteNumber(value: unknown, fallback = 0) {
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function cleanString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function identifierString(value: unknown, fallback = "") {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return cleanString(value, fallback);
}

function optionalString(value: unknown) {
  const cleaned = cleanString(value);
  return cleaned || null;
}

function timestampsMatch(left: unknown, right: unknown) {
  const leftTimestamp = safeTimestamp(left);
  const rightTimestamp = safeTimestamp(right);
  return leftTimestamp !== null
    && rightTimestamp !== null
    && Date.parse(leftTimestamp) === Date.parse(rightTimestamp);
}

function optionalIdentifier(value: unknown) {
  const cleaned = identifierString(value);
  return cleaned || null;
}

function optionalFiniteNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = finiteNumber(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
}

function booleanValue(value: unknown) {
  return value === true || value === "true" || value === 1 || value === "1";
}

function safeTimestamp(value: unknown) {
  const text = optionalString(value);
  return text && Number.isFinite(Date.parse(text)) ? text : null;
}

function hasAnyOwn(row: Record<string, unknown>, keys: readonly string[]) {
  return keys.some((key) => Object.prototype.hasOwnProperty.call(row, key));
}

export function parseAnalyticsRange(value: unknown): AnalyticsRange {
  return ANALYTICS_RANGE_OPTIONS.some((option) => option.value === value)
    ? (value as AnalyticsRange)
    : "30d";
}

export function getAnalyticsWindow(value: unknown, now = new Date()): AnalyticsWindow {
  const range = parseAnalyticsRange(value);
  const option = ANALYTICS_RANGE_OPTIONS.find((candidate) => candidate.value === range) ?? ANALYTICS_RANGE_OPTIONS[2];
  const to = new Date(now);
  const from = new Date(to.getTime() - option.hours * 60 * 60 * 1000);

  return {
    range,
    label: option.label,
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

export function parseAnalyticsSummary(value: unknown): AnalyticsSummary | null {
  const row = firstRow(value);
  if (!isRecord(row)) return null;
  const requiredAliases = [
    ["totalSessions", "total_sessions", "sessions"],
    ["totalVisitors", "total_visitors", "visitors"],
    ["returningSessions", "returning_sessions"],
    ["engagedSessions", "engaged_sessions"],
    ["conversions", "convertedSessions", "converted_sessions"],
    ["totalPageViews", "total_page_views", "pageViews", "page_views"],
    ["totalEvents", "total_events", "events"],
    ["telemetryEvents", "telemetry_events"],
    ["webVitalEvents", "web_vital_events"],
    ["totalInteractions", "total_interactions", "interactions"],
    ["totalActiveSeconds", "total_active_seconds"],
    ["averageActiveSeconds", "average_active_seconds"],
    ["bounceRatePercent", "bounce_rate_percent", "bounceRate"],
    ["errorEvents", "error_events", "errors"],
    ["formSubmissions", "form_submissions"],
    ["portalHandoffs", "portal_handoffs"],
    ["uniqueCountries", "unique_countries"],
    ["latestEventAt", "latest_event_at"],
  ] as const;
  if (!requiredAliases.every((aliases) => hasAnyOwn(row, aliases))) return null;

  return {
    sessions: finiteNumber(row.totalSessions ?? row.total_sessions ?? row.sessions),
    visitors: finiteNumber(row.totalVisitors ?? row.total_visitors ?? row.visitors),
    returningSessions: finiteNumber(row.returningSessions ?? row.returning_sessions),
    engagedSessions: finiteNumber(row.engagedSessions ?? row.engaged_sessions),
    convertedSessions: finiteNumber(row.convertedSessions ?? row.converted_sessions ?? row.conversions),
    pageViews: finiteNumber(row.totalPageViews ?? row.total_page_views ?? row.pageViews ?? row.page_views),
    events: finiteNumber(row.totalEvents ?? row.total_events ?? row.events),
    telemetryEvents: finiteNumber(row.telemetryEvents ?? row.telemetry_events),
    webVitalEvents: finiteNumber(row.webVitalEvents ?? row.web_vital_events),
    interactions: finiteNumber(row.totalInteractions ?? row.total_interactions ?? row.interactions),
    totalActiveSeconds: finiteNumber(row.totalActiveSeconds ?? row.total_active_seconds),
    averageActiveSeconds: finiteNumber(row.averageActiveSeconds ?? row.average_active_seconds),
    bounceRatePercent: Math.min(100, finiteNumber(row.bounceRatePercent ?? row.bounce_rate_percent ?? row.bounceRate)),
    errorEvents: finiteNumber(row.errorEvents ?? row.error_events ?? row.errors),
    formSubmissions: finiteNumber(row.formSubmissions ?? row.form_submissions),
    portalHandoffs: finiteNumber(row.portalHandoffs ?? row.portal_handoffs),
    uniqueCountries: finiteNumber(row.uniqueCountries ?? row.unique_countries),
    latestEventAt: safeTimestamp(row.latestEventAt ?? row.latest_event_at),
  };
}

export function parseAnalyticsDaily(value: unknown): AnalyticsDailyPoint[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((candidate) => {
    if (!isRecord(candidate)) return [];
    const date = cleanString(candidate.date ?? candidate.periodDate ?? candidate.period_date);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];

    return [{
      date,
      sessions: finiteNumber(candidate.sessions),
      visitors: finiteNumber(candidate.visitors),
      engagedSessions: finiteNumber(candidate.engagedSessions ?? candidate.engaged_sessions),
      pageViews: finiteNumber(candidate.pageViews ?? candidate.page_views),
      events: finiteNumber(candidate.events),
      webVitals: finiteNumber(candidate.webVitals ?? candidate.web_vitals),
      interactions: finiteNumber(candidate.interactions),
      conversions: finiteNumber(candidate.conversions),
      errorEvents: finiteNumber(candidate.errorEvents ?? candidate.error_events ?? candidate.errors),
      activeSeconds: finiteNumber(candidate.activeSeconds ?? candidate.active_seconds),
    }];
  });
}

function parseBreakdownList(
  value: unknown,
  getLabel: (row: Record<string, unknown>) => string,
  getCount: (row: Record<string, unknown>) => unknown,
): AnalyticsBreakdownItem[] {
  if (!Array.isArray(value)) return [];

  return value.slice(0, BREAKDOWN_LIMIT).flatMap((candidate) => {
    if (!isRecord(candidate)) return [];
    return [{ label: getLabel(candidate) || "Unknown", count: finiteNumber(getCount(candidate)) }];
  });
}

function countryName(countryCode: string) {
  try {
    return countryDisplayNames.of(countryCode) ?? countryCode;
  } catch {
    return countryCode;
  }
}

export function parseAnalyticsCountries(value: unknown): AnalyticsCountryBreakdownItem[] {
  if (!Array.isArray(value)) return [];

  return value.slice(0, COUNTRY_BREAKDOWN_LIMIT).flatMap((candidate) => {
    if (!isRecord(candidate)) return [];
    const code = cleanString(candidate.countryCode ?? candidate.country_code).toUpperCase();
    if (!/^[A-Z]{2}$/.test(code)) return [];
    return [{
      countryCode: code,
      countryName: countryName(code),
      sessions: finiteNumber(candidate.sessions ?? candidate.count),
      visitors: finiteNumber(candidate.visitors),
      engagedSessions: finiteNumber(candidate.engagedSessions ?? candidate.engaged_sessions),
      engagedVisitors: finiteNumber(candidate.engagedVisitors ?? candidate.engaged_visitors),
      briefSessions: finiteNumber(candidate.briefSessions ?? candidate.brief_sessions),
      localOrQaSessions: finiteNumber(candidate.localOrQaSessions ?? candidate.local_or_qa_sessions),
    }];
  });
}

export function parseAnalyticsBreakdowns(value: unknown): AnalyticsBreakdowns | null {
  const row = firstRow(value);
  const payload = isRecord(row) && isRecord(row.breakdowns) ? row.breakdowns : row;
  if (!isRecord(payload)) return null;
  const hasBreakdownData = ["topPages", "top_pages", "topReferrers", "top_referrers", "countries", "devices", "funnel"]
    .some((key) => Array.isArray(payload[key]));
  if (!hasBreakdownData) return null;

  const funnelRows = Array.isArray(payload.funnel) ? payload.funnel : [];
  const parsedFunnel = funnelRows.slice(0, 8).flatMap((candidate) => {
    if (!isRecord(candidate)) return [];
    const rateValue = candidate.ratePercent ?? candidate.rate_percent ?? candidate.rate;
    const rate = rateValue === null || rateValue === undefined ? null : Math.min(100, finiteNumber(rateValue));
    return [{
      label: cleanString(candidate.label ?? candidate.name ?? candidate.step, "Unknown step"),
      count: finiteNumber(candidate.count ?? candidate.value ?? candidate.sessions),
      ratePercent: rate,
    }];
  });
  const funnelBaseline = parsedFunnel[0]?.count ?? 0;
  const funnel = parsedFunnel.map((step) => ({
    ...step,
    ratePercent: step.ratePercent ?? (funnelBaseline > 0 ? Math.min(100, (step.count / funnelBaseline) * 100) : null),
  }));

  return {
    topPages: parseBreakdownList(
      payload.topPages ?? payload.top_pages ?? payload.pages,
      (candidate) => cleanString(candidate.pagePath ?? candidate.page_path ?? candidate.label, "Unknown page"),
      (candidate) => candidate.pageViews ?? candidate.page_views ?? candidate.count,
    ),
    topReferrers: parseBreakdownList(
      payload.topReferrers ?? payload.top_referrers ?? payload.referrers,
      (candidate) => {
        const host = cleanString(candidate.host ?? candidate.referrerHost ?? candidate.referrer_host, "Direct / unknown");
        const path = optionalString(candidate.path ?? candidate.referrerPath ?? candidate.referrer_path);
        return path && path !== "/" ? `${host}${path}` : host;
      },
      (candidate) => candidate.sessions ?? candidate.count,
    ),
    countries: parseAnalyticsCountries(payload.countries),
    devices: parseBreakdownList(
      payload.devices,
      (candidate) => [candidate.deviceType ?? candidate.device_type, candidate.browserName ?? candidate.browser_name, candidate.osName ?? candidate.os_name]
        .map(optionalString)
        .filter(Boolean)
        .join(" · ") || "Unknown device",
      (candidate) => candidate.sessions ?? candidate.count,
    ),
    funnel,
  };
}

function parseCountryCode(value: unknown) {
  const code = cleanString(value).toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : null;
}

export function parseAnalyticsIntentActivity(value: unknown): AnalyticsIntentActivity | null {
  const row = firstRow(value);
  if (!isRecord(row)) return null;
  const summaryRow = isRecord(row.summary) ? row.summary : null;
  if (!summaryRow) return null;

  const parseCount = (name: string, aliases: string[] = []) => finiteNumber(
    aliases.reduce<unknown>((candidate, alias) => (
      candidate === undefined ? summaryRow[alias] : candidate
    ), summaryRow[name]),
  );
  const summary = {
    totalIntentClicks: parseCount("totalIntentClicks", ["total_intent_clicks"]),
    portalHandoffs: parseCount("portalHandoffs", ["portal_handoffs"]),
    whatsappClicks: parseCount("whatsappClicks", ["whatsapp_clicks"]),
    phoneClicks: parseCount("phoneClicks", ["phone_clicks"]),
    emailClicks: parseCount("emailClicks", ["email_clicks"]),
    downloadRequests: parseCount("downloadRequests", ["download_requests"]),
    socialClicks: parseCount("socialClicks", ["social_clicks"]),
    outboundLinks: parseCount("outboundLinks", ["outbound_links"]),
  };

  const counts = Array.isArray(row.counts)
    ? row.counts.slice(0, 20).flatMap((candidate) => {
        if (!isRecord(candidate)) return [];
        const name = cleanString(candidate.name);
        if (!name) return [];
        return [{
          name,
          clicks: finiteNumber(candidate.clicks ?? candidate.count),
          sessions: finiteNumber(candidate.sessions),
          visitors: finiteNumber(candidate.visitors),
        }];
      })
    : [];

  const portalHandoffs = Array.isArray(row.portalHandoffs ?? row.portal_handoffs)
    ? ((row.portalHandoffs ?? row.portal_handoffs) as unknown[]).slice(0, INTENT_ACTIVITY_LIMIT).flatMap((candidate) => {
        if (!isRecord(candidate)) return [];
        const id = identifierString(candidate.id);
        const occurredAt = safeTimestamp(candidate.occurredAt ?? candidate.occurred_at);
        if (!id || !occurredAt) return [];
        return [{
          id,
          occurredAt,
          mode: cleanString(candidate.mode, "unknown"),
          roleTitle: cleanString(candidate.roleTitle ?? candidate.role_title, "Unknown role"),
          action: cleanString(candidate.action, "Unknown action"),
          portalUrl: cleanString(candidate.portalUrl ?? candidate.portal_url, "Unknown portal"),
          locale: optionalString(candidate.locale),
          pagePath: optionalString(candidate.pagePath ?? candidate.page_path),
          sessionId: optionalIdentifier(candidate.sessionId ?? candidate.session_id),
          visitorId: optionalIdentifier(candidate.visitorId ?? candidate.visitor_id),
          countryCode: parseCountryCode(candidate.countryCode ?? candidate.country_code),
          region: optionalString(candidate.region),
          city: optionalString(candidate.city),
          ipAddress: optionalString(candidate.ipAddress ?? candidate.ip_address),
          ipHash: optionalString(candidate.ipHash ?? candidate.ip_hash),
          userAgent: optionalString(candidate.userAgent ?? candidate.user_agent),
        }];
      })
    : [];

  const whatsappClicks = Array.isArray(row.whatsappClicks ?? row.whatsapp_clicks)
    ? ((row.whatsappClicks ?? row.whatsapp_clicks) as unknown[]).slice(0, INTENT_ACTIVITY_LIMIT).flatMap((candidate) => {
        if (!isRecord(candidate)) return [];
        const id = identifierString(candidate.id);
        const occurredAt = safeTimestamp(candidate.occurredAt ?? candidate.occurred_at);
        const sessionId = identifierString(candidate.sessionId ?? candidate.session_id);
        if (!id || !occurredAt || !sessionId) return [];
        return [{
          id,
          occurredAt,
          name: cleanString(candidate.name, "whatsapp_click"),
          targetLabel: optionalString(candidate.targetLabel ?? candidate.target_label),
          pagePath: optionalString(candidate.pagePath ?? candidate.page_path),
          sectionId: optionalString(candidate.sectionId ?? candidate.section_id),
          linkHost: optionalString(candidate.linkHost ?? candidate.link_host),
          linkPath: optionalString(candidate.linkPath ?? candidate.link_path),
          sessionId,
          visitorId: optionalIdentifier(candidate.visitorId ?? candidate.visitor_id),
          countryCode: parseCountryCode(candidate.countryCode ?? candidate.country_code),
          region: optionalString(candidate.region),
          city: optionalString(candidate.city),
          ipAddress: optionalString(candidate.ipAddress ?? candidate.ip_address),
          ipHash: optionalString(candidate.ipHash ?? candidate.ip_hash),
        }];
      })
    : [];

  return { summary, counts, portalHandoffs, whatsappClicks };
}

export function parseRecentSessions(value: unknown): RecentAnalyticsSession[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((candidate) => {
    if (!isRecord(candidate)) return [];
    const id = identifierString(candidate.id);
    const startedAt = safeTimestamp(candidate.startedAt ?? candidate.started_at);
    const lastSeenAt = safeTimestamp(candidate.lastSeenAt ?? candidate.last_seen_at);
    if (!id || !startedAt || !lastSeenAt) return [];

    const journey = Array.isArray(candidate.journey)
      ? candidate.journey.slice(0, 40).flatMap((event, index) => {
          if (!isRecord(event)) return [];
          const occurredAt = safeTimestamp(event.occurredAt ?? event.occurred_at);
          const name = cleanString(event.name ?? event.eventName ?? event.event_name);
          if (!occurredAt || !name) return [];
          return [{
            id: identifierString(event.id, `journey-${index}`),
            occurredAt,
            type: cleanString(event.type ?? event.eventType ?? event.event_type, "event"),
            name,
            pagePath: optionalString(event.pagePath ?? event.page_path),
            sectionId: optionalString(event.sectionId ?? event.section_id),
            targetLabel: optionalString(event.targetLabel ?? event.target_label),
            value: optionalFiniteNumber(event.value),
            durationMs: optionalFiniteNumber(event.durationMs ?? event.duration_ms),
            scrollDepth: optionalFiniteNumber(event.scrollDepth ?? event.scroll_depth),
          }];
        })
      : [];

    return [{
      id,
      visitorId: optionalString(candidate.visitorId ?? candidate.visitor_id),
      startedAt,
      lastSeenAt,
      endedAt: safeTimestamp(candidate.endedAt ?? candidate.ended_at),
      activeSeconds: finiteNumber(candidate.activeSeconds ?? candidate.active_seconds),
      pageViews: finiteNumber(candidate.pageViews ?? candidate.pageViewCount ?? candidate.page_view_count),
      events: finiteNumber(candidate.events ?? candidate.eventCount ?? candidate.event_count),
      landingPage: cleanString(candidate.landingPage ?? candidate.landingPath ?? candidate.landing_page_path, "/"),
      exitPage: optionalString(candidate.exitPage ?? candidate.exitPath ?? candidate.exit_page_path),
      referrer: optionalString(candidate.referrer ?? candidate.referrerHost ?? candidate.referrer_host),
      referrerPath: optionalString(candidate.referrerPath ?? candidate.referrer_path),
      utmSource: optionalString(candidate.utmSource ?? candidate.utm_source),
      utmMedium: optionalString(candidate.utmMedium ?? candidate.utm_medium),
      utmCampaign: optionalString(candidate.utmCampaign ?? candidate.utm_campaign),
      utmContent: optionalString(candidate.utmContent ?? candidate.utm_content),
      utmTerm: optionalString(candidate.utmTerm ?? candidate.utm_term),
      country: optionalString(candidate.country ?? candidate.countryCode ?? candidate.country_code),
      region: optionalString(candidate.region),
      city: optionalString(candidate.city),
      device: optionalString(candidate.device ?? candidate.deviceType ?? candidate.device_type),
      browser: optionalString(candidate.browser ?? candidate.browserName ?? candidate.browser_name),
      operatingSystem: optionalString(candidate.operatingSystem ?? candidate.osName ?? candidate.os_name),
      userAgent: optionalString(candidate.userAgent ?? candidate.user_agent),
      locale: optionalString(candidate.locale),
      timezone: optionalString(candidate.timezone),
      isReturning: booleanValue(candidate.isReturning ?? candidate.is_returning),
      viewportWidth: optionalFiniteNumber(candidate.viewportWidth ?? candidate.viewport_width),
      viewportHeight: optionalFiniteNumber(candidate.viewportHeight ?? candidate.viewport_height),
      screenWidth: optionalFiniteNumber(candidate.screenWidth ?? candidate.screen_width),
      screenHeight: optionalFiniteNumber(candidate.screenHeight ?? candidate.screen_height),
      ipAddress: optionalString(candidate.ipAddress ?? candidate.ip_address),
      ipHash: optionalString(candidate.ipHash ?? candidate.ip_hash),
      journey,
    }];
  });
}

export function parseAdminAuditEvents(value: unknown): AdminAuditRecord[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((candidate) => {
    if (!isRecord(candidate)) return [];
    const id = identifierString(candidate.id);
    const occurredAt = safeTimestamp(candidate.occurredAt ?? candidate.occurred_at ?? candidate.receivedAt ?? candidate.received_at);
    const rawDetails = isRecord(candidate.details) ? candidate.details : null;
    const details = Object.fromEntries(
      Object.entries(rawDetails ?? {})
        .filter(([key, item]) => (
          /^[a-zA-Z][a-zA-Z0-9_]{0,59}$/.test(key)
          && (
            typeof item === "string"
            || (typeof item === "number" && Number.isFinite(item))
            || typeof item === "boolean"
            || item === null
          )
        ))
        .slice(0, MAX_AUDIT_DETAIL_FIELDS)
        .map(([key, item]) => [
          key,
          SENSITIVE_AUDIT_DETAIL_KEY.test(key)
            ? "[redacted]"
            : typeof item === "string"
              ? item.slice(0, 255)
              : item,
        ]),
    ) as Record<string, string | number | boolean | null>;
    const actorId = cleanString(
      candidate.actorId ?? candidate.actor_id ?? details.actorReference,
      "unknown",
    );
    const action = cleanString(candidate.action);
    const outcome = candidate.outcome === "failure"
      ? "failure" as const
      : candidate.outcome === "denied"
        ? "denied" as const
        : candidate.outcome === "success"
          ? "success" as const
          : null;
    if (!id || !occurredAt || !action || !outcome) return [];

    return [{
      id,
      occurredAt,
      actorId,
      actorEmailHash: optionalString(candidate.actorEmailHash ?? candidate.actor_email_hash),
      authentication: cleanString(candidate.authMethod ?? candidate.auth_method ?? candidate.authentication, "unknown"),
      action,
      outcome,
      targetType: optionalString(candidate.targetType ?? candidate.target_type),
      targetId: optionalIdentifier(candidate.targetId ?? candidate.target_id ?? candidate.target),
      requestId: optionalString(candidate.requestId ?? candidate.request_id),
      userAgent: optionalString(candidate.userAgent ?? candidate.user_agent),
      ipAddress: optionalString(candidate.ipAddress ?? candidate.ip_address),
      ipHash: optionalString(candidate.ipHash ?? candidate.ip_hash),
      provenance: details.clientReported === true && details.principalVerified !== true
        ? "client-reported-unverified"
        : "server-verified",
      details,
    }];
  });
}

export function parseRecentErrors(value: unknown): RecentAnalyticsError[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((candidate, index) => {
    if (!isRecord(candidate)) return [];
    const occurredAt = safeTimestamp(candidate.occurredAt ?? candidate.occurred_at ?? candidate.receivedAt ?? candidate.received_at);
    const name = cleanString(candidate.name ?? candidate.eventName ?? candidate.event_name, "Unknown error");
    if (!occurredAt) return [];

    return [{
      id: identifierString(candidate.id, `error-${index}`),
      occurredAt,
      name,
      pagePath: optionalString(candidate.pagePath ?? candidate.page_path),
      sessionId: optionalString(candidate.sessionId ?? candidate.session_id),
      message: optionalString(candidate.message) ?? (isRecord(candidate.metadata) ? optionalString(candidate.metadata.message) : null),
      eventType: optionalString(candidate.eventType ?? candidate.event_type),
      sectionId: optionalString(candidate.sectionId ?? candidate.section_id),
      targetLabel: optionalString(candidate.targetLabel ?? candidate.target_label),
      fingerprint: optionalString(candidate.fingerprint)
        ?? (isRecord(candidate.metadata) ? optionalString(candidate.metadata.fingerprint) : null),
      count: finiteNumber(candidate.count, 1),
    }];
  });
}

function readPayloadArray(payload: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key];
  }
  return null;
}

const INTENT_EVENT_NAMES = [
  "whatsapp_click",
  "phone_click",
  "email_click",
  "download_requested",
  "social_click",
  "outbound_link",
] as const;

function getIntentNetwork(
  networkBySession: Map<string, Record<string, unknown>>,
  sessionId: string | null,
) {
  return sessionId ? networkBySession.get(sessionId) : undefined;
}

async function loadIntentActivityFromTables(
  client: AnalyticsTableClient,
  window: AnalyticsWindow,
): Promise<AnalyticsIntentActivity | null> {
  const portalQuery = client.from("portal_click_events").select(
    "id,created_at,mode,role_title,action,portal_url,locale,page_path,user_agent,metadata",
    { count: "exact" },
  );
  const eventQuery = client.from("site_analytics_events").select(
    "id,session_id,occurred_at,name,page_path,section_id,target_label,metadata",
    { count: "exact" },
  );
  const [portalResult, eventResult, ...eventCountResults] = await Promise.all([
    portalQuery.gte("created_at", window.from).lt("created_at", window.to).order("created_at", { ascending: false }).limit(INTENT_ACTIVITY_LIMIT),
    eventQuery.gte("received_at", window.from).lt("received_at", window.to).in("name", [...INTENT_EVENT_NAMES]).order("occurred_at", { ascending: false }).limit(INTENT_ACTIVITY_LIMIT),
    ...INTENT_EVENT_NAMES.map((name) => client.from("site_analytics_events").select("id", { count: "exact", head: true })
      .gte("received_at", window.from)
      .lt("received_at", window.to)
      .eq("name", name)),
  ]);
  if (portalResult.error || eventResult.error || eventCountResults.some((result) => result.error)) return null;

  const portalRows = Array.isArray(portalResult.data) ? portalResult.data.filter(isRecord) : [];
  const eventRows = Array.isArray(eventResult.data) ? eventResult.data.filter(isRecord) : [];
  const sessionIds = [...new Set([
    ...eventRows.map((event) => identifierString(event.session_id)).filter(Boolean),
    ...portalRows.map((event) => {
      const metadata = isRecord(event.metadata) ? event.metadata : {};
      return metadata.analytics_session_verified === true || metadata.analytics_session_verified === "true"
        ? identifierString(metadata.analytics_session_id)
        : "";
    }).filter(Boolean),
  ])];

  const sessionResult = sessionIds.length
    ? await client.from("site_analytics_sessions").select("id,visitor_id").in("id", sessionIds)
    : { data: [], error: null };
  const networkResult = sessionIds.length
    ? await client.from("site_analytics_session_network").select("session_id,ip_address,ip_hash,country_code,region,city").in("session_id", sessionIds)
    : { data: [], error: null };
  if (sessionResult.error || networkResult.error) return null;

  const sessionsById = new Map(
    (Array.isArray(sessionResult.data) ? sessionResult.data.filter(isRecord) : [])
      .map((session) => [identifierString(session.id), session] as const),
  );
  const networkBySession = new Map(
    (Array.isArray(networkResult.data) ? networkResult.data.filter(isRecord) : [])
      .map((network) => [identifierString(network.session_id), network] as const),
  );
  const eventsByName = new Map<string, number>(INTENT_EVENT_NAMES.map((name, index) => [name, eventCountResults[index]?.count ?? 0]));
  const eventSessionIdsByName = new Map<string, Set<string>>();
  for (const event of eventRows) {
    const name = cleanString(event.name);
    const sessionId = identifierString(event.session_id);
    if (!name || !sessionId) continue;
    const ids = eventSessionIdsByName.get(name) ?? new Set<string>();
    ids.add(sessionId);
    eventSessionIdsByName.set(name, ids);
  }
  const counts = INTENT_EVENT_NAMES.map((name) => {
    const sessionIdsForName = eventSessionIdsByName.get(name) ?? new Set<string>();
    const visitors = new Set(
      [...sessionIdsForName]
        .map((sessionId) => identifierString(sessionsById.get(sessionId)?.visitor_id))
        .filter(Boolean),
    );
    return {
      name,
      clicks: eventsByName.get(name) ?? 0,
      sessions: sessionIdsForName.size,
      visitors: visitors.size,
    };
  });

  const rawPortalHandoffs = portalRows.flatMap((event) => {
    const metadata = isRecord(event.metadata) ? event.metadata : {};
    const sessionId = metadata.analytics_session_verified === true || metadata.analytics_session_verified === "true"
      ? optionalIdentifier(metadata.analytics_session_id)
      : null;
    const session = sessionId ? sessionsById.get(sessionId) : undefined;
    const network = getIntentNetwork(networkBySession, sessionId);
    const occurredAt = safeTimestamp(event.created_at);
    const id = identifierString(event.id);
    if (!occurredAt || !id) return [];
    return [{
      id,
      occurredAt,
      name: "portal_handoff",
      mode: cleanString(event.mode, "unknown"),
      roleTitle: cleanString(event.role_title, "Unknown role"),
      action: cleanString(event.action, "Unknown action"),
      portalUrl: cleanString(event.portal_url, "Unknown portal"),
      locale: optionalString(event.locale),
      pagePath: optionalString(event.page_path),
      sessionId,
      visitorId: optionalIdentifier(session?.visitor_id),
      countryCode: parseCountryCode(network?.country_code),
      region: optionalString(network?.region),
      city: optionalString(network?.city),
      ipAddress: optionalString(network?.ip_address),
      ipHash: optionalString(network?.ip_hash),
      userAgent: optionalString(event.user_agent),
    }];
  });

  const rawWhatsAppClicks = eventRows.flatMap((event) => {
    if (event.name !== "whatsapp_click") return [];
    const sessionId = identifierString(event.session_id);
    const occurredAt = safeTimestamp(event.occurred_at);
    const id = identifierString(event.id);
    if (!sessionId || !occurredAt || !id) return [];
    const metadata = isRecord(event.metadata) ? event.metadata : {};
    const session = sessionsById.get(sessionId);
    const network = getIntentNetwork(networkBySession, sessionId);
    return [{
      id,
      occurredAt,
      name: "whatsapp_click",
      targetLabel: optionalString(event.target_label),
      pagePath: optionalString(event.page_path),
      sectionId: optionalString(event.section_id),
      linkHost: optionalString(metadata.linkHost),
      linkPath: optionalString(metadata.linkPath),
      sessionId,
      visitorId: optionalIdentifier(session?.visitor_id),
      countryCode: parseCountryCode(network?.country_code),
      region: optionalString(network?.region),
      city: optionalString(network?.city),
      ipAddress: optionalString(network?.ip_address),
      ipHash: optionalString(network?.ip_hash),
    }];
  });
  const portalCount = portalRows.length < (portalResult.count ?? 0) ? portalResult.count ?? portalRows.length : portalRows.length;
  const whatsappCount = eventsByName.get("whatsapp_click") ?? 0;

  return parseAnalyticsIntentActivity({
    summary: {
      totalIntentClicks: counts.reduce((total, item) => total + item.clicks, 0) + portalCount,
      portalHandoffs: portalCount,
      whatsappClicks: whatsappCount,
      phoneClicks: eventsByName.get("phone_click") ?? 0,
      emailClicks: eventsByName.get("email_click") ?? 0,
      downloadRequests: eventsByName.get("download_requested") ?? 0,
      socialClicks: eventsByName.get("social_click") ?? 0,
      outboundLinks: eventsByName.get("outbound_link") ?? 0,
    },
    counts: [
      ...counts,
      { name: "portal_handoff", clicks: portalCount, sessions: new Set(rawPortalHandoffs.map((item) => item.sessionId).filter(Boolean)).size, visitors: new Set(rawPortalHandoffs.map((item) => item.visitorId).filter(Boolean)).size },
    ],
    portalHandoffs: rawPortalHandoffs,
    whatsappClicks: rawWhatsAppClicks,
  });
}

export async function fetchAdminAnalyticsDashboard(
  rangeInput: unknown,
  options: { now?: Date; client?: AnalyticsRpcClient } = {},
): Promise<AdminAnalyticsDashboardResult> {
  const config = getSupabaseAdminConfig();
  if (!options.client && !config.configured) {
    return {
      ok: false,
      reason: "Supabase admin access is not configured.",
      missing: config.missing,
    };
  }

  const now = options.now ?? new Date();
  const window = getAnalyticsWindow(rangeInput, now);
  const rawClient = options.client ?? await getSupabaseAdminClient();
  const client = rawClient as unknown as AnalyticsRpcClient;

  try {
    const [result, countryResult, intentResult] = await Promise.all([
      client.rpc(DASHBOARD_RPC, {
        p_start: window.from,
        p_end: window.to,
        p_limit: RECENT_SESSION_LIMIT,
      }),
      client.rpc(COUNTRY_BREAKDOWN_RPC, {
        p_start: window.from,
        p_end: window.to,
        p_limit: COUNTRY_BREAKDOWN_LIMIT,
      }),
      client.rpc(INTENT_ACTIVITY_RPC, {
        p_start: window.from,
        p_end: window.to,
        p_limit: INTENT_ACTIVITY_LIMIT,
      }),
    ]);
    if (result.error) {
      return { ok: false, reason: `Analytics data is unavailable (${result.error.code ?? "database_error"}).` };
    }

    const row = firstRow(result.data);
    const payload = isRecord(row) && isRecord(row.dashboard) ? row.dashboard : row;
    if (!isRecord(payload)) return { ok: false, reason: "Analytics RPC returned an unsupported payload." };

    const schemaVersion = cleanString(payload.schemaVersion ?? payload.schema_version);
    if (schemaVersion !== DASHBOARD_SCHEMA_VERSION) {
      return { ok: false, reason: "Analytics RPC returned an unsupported schema version." };
    }
    const sourceWindow = isRecord(payload.window) ? payload.window : null;
    const sourceStart = safeTimestamp(sourceWindow?.start ?? sourceWindow?.from);
    const sourceEnd = safeTimestamp(sourceWindow?.end ?? sourceWindow?.to);
    if (
      !sourceStart
      || !sourceEnd
      || Date.parse(sourceStart) !== Date.parse(window.from)
      || Date.parse(sourceEnd) !== Date.parse(window.to)
    ) {
      return { ok: false, reason: "Analytics RPC returned a mismatched reporting window." };
    }

    const summary = parseAnalyticsSummary(payload.summary);
    if (!summary) return { ok: false, reason: "Analytics summary returned an unsupported payload." };

    const dailyRows = readPayloadArray(payload, "daily", "trend");
    const sessionRows = readPayloadArray(payload, "recentSessions", "recent_sessions");
    const errorRows = readPayloadArray(payload, "recentErrors", "recent_errors");
    const auditRows = readPayloadArray(payload, "recentAdminAudit", "recent_admin_audit", "auditEvents");
    const parsedCountryPayload = firstRow(countryResult.data);
    const countryPayload = isRecord(parsedCountryPayload) ? parsedCountryPayload : null;
    const countrySchemaVersion = cleanString(countryPayload?.schemaVersion ?? countryPayload?.schema_version);
    const countryWindow = countryPayload && isRecord(countryPayload.window) ? countryPayload.window : null;
    const countryWindowMatches = timestampsMatch(countryWindow?.start, window.from)
      && timestampsMatch(countryWindow?.end, window.to);
    const countryRows = countryPayload
      && COUNTRY_BREAKDOWN_SCHEMA_VERSIONS.has(countrySchemaVersion)
      && countryWindowMatches
      ? readPayloadArray(countryPayload, "countries")
      : null;
    const intentPayload = firstRow(intentResult.data);
    const intentSchemaVersion = isRecord(intentPayload)
      ? cleanString(intentPayload.schemaVersion ?? intentPayload.schema_version)
      : "";
    const intentWindow = isRecord(intentPayload) && isRecord(intentPayload.window) ? intentPayload.window : null;
    const intentWindowMatches = timestampsMatch(intentWindow?.start, window.from)
      && timestampsMatch(intentWindow?.end, window.to);
    let intentActivity = !intentResult.error
      && isRecord(intentPayload)
      && intentSchemaVersion === INTENT_ACTIVITY_SCHEMA_VERSION
      && intentWindowMatches
      ? parseAnalyticsIntentActivity(intentPayload)
      : null;
    const canQueryIntentTables = typeof (rawClient as unknown as { from?: unknown }).from === "function";
    if (!intentActivity && canQueryIntentTables) {
      try {
        intentActivity = await loadIntentActivityFromTables(rawClient as unknown as AnalyticsTableClient, window);
      } catch {
        intentActivity = null;
      }
    }
    const parsedBaseBreakdowns = parseAnalyticsBreakdowns(payload);
    const breakdowns = parsedBaseBreakdowns
      ? {
          ...parsedBaseBreakdowns,
          countries: countryRows && !countryResult.error ? parseAnalyticsCountries(countryRows) : [],
        }
      : null;
    const parsedDaily = dailyRows ? parseAnalyticsDaily(dailyRows) : null;
    const parsedSessions = sessionRows ? parseRecentSessions(sessionRows) : null;
    const parsedErrors = errorRows ? parseRecentErrors(errorRows) : null;
    const parsedAudit = auditRows ? parseAdminAuditEvents(auditRows) : null;
    const daily = dailyRows && (dailyRows.length === 0 || (parsedDaily?.length ?? 0) > 0) ? parsedDaily : null;
    const recentSessions = sessionRows && (sessionRows.length === 0 || (parsedSessions?.length ?? 0) > 0) ? parsedSessions : null;
    const recentErrors = errorRows && (errorRows.length === 0 || (parsedErrors?.length ?? 0) > 0) ? parsedErrors : null;
    const auditEvents = auditRows && (auditRows.length === 0 || (parsedAudit?.length ?? 0) > 0) ? parsedAudit : null;
    const warnings: string[] = [];
    if (!daily) warnings.push("Trend data is unavailable or did not match the supported schema.");
    if (!breakdowns) warnings.push("Traffic breakdowns and funnel data are unavailable.");
    if (countryResult.error || !countryRows) warnings.push("Country quality metrics are temporarily unavailable; session totals remain visible.");
    if (!intentActivity) warnings.push("Portal and WhatsApp activity details are temporarily unavailable; core analytics remain visible.");
    if (!recentSessions) warnings.push("Recent sessions are unavailable or did not match the supported schema.");
    if (!recentErrors) warnings.push("Recent error details are unavailable or did not match the supported schema.");
    if (!auditEvents) warnings.push("Admin audit history is unavailable or did not match the supported schema.");

    return {
      ok: true,
      data: {
        window,
        generatedAt: now.toISOString(),
        summary,
        intentActivity,
        daily,
        breakdowns,
        recentSessions,
        recentErrors,
        auditEvents,
        warnings,
      },
    };
  } catch {
    return { ok: false, reason: "The analytics dashboard could not reach its production data source." };
  }
}

async function countOperationalRows(
  client: OperationsCountClient,
  table: OperationsCountTable,
  status?: "new" | "qualified",
) {
  const query = client.from(table).select("id", { count: "exact", head: true });
  const result = status
    ? await query.eq("status", status)
    : table === "portal_click_events"
      ? await query
      : await query.neq("status", "archived");
  if (result.error) throw new Error(result.error.code ?? "database_error");
  return result.count ?? 0;
}

export async function fetchAdminOperationsSnapshot(
  options: { client?: OperationsCountClient } = {},
): Promise<AdminOperationsSnapshotResult> {
  const config = getSupabaseAdminConfig();
  if (!options.client && !config.configured) {
    return {
      ok: false,
      reason: "Supabase admin access is not configured.",
      missing: config.missing,
    };
  }

  try {
    const client = options.client
      ?? ((await getSupabaseAdminClient()) as unknown as OperationsCountClient);
    const [
      totalContacts,
      totalChats,
      newContacts,
      newChats,
      qualifiedContacts,
      qualifiedChats,
      totalPortalHandoffs,
    ] = await Promise.all([
      countOperationalRows(client, "contact_submissions"),
      countOperationalRows(client, "chat_transcripts"),
      countOperationalRows(client, "contact_submissions", "new"),
      countOperationalRows(client, "chat_transcripts", "new"),
      countOperationalRows(client, "contact_submissions", "qualified"),
      countOperationalRows(client, "chat_transcripts", "qualified"),
      countOperationalRows(client, "portal_click_events"),
    ]);

    return {
      ok: true,
      data: {
        totalContacts,
        totalChats,
        newContacts,
        newChats,
        qualifiedContacts,
        qualifiedChats,
        totalPortalHandoffs,
      },
    };
  } catch {
    return { ok: false, reason: "Operational lead totals could not be loaded from the production data source." };
  }
}

export type { OperationsCountClient };
