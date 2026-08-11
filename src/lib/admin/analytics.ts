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

export type AnalyticsFunnelStep = AnalyticsBreakdownItem & {
  ratePercent: number | null;
};

export type AnalyticsBreakdowns = {
  topPages: AnalyticsBreakdownItem[];
  topReferrers: AnalyticsBreakdownItem[];
  countries: AnalyticsBreakdownItem[];
  devices: AnalyticsBreakdownItem[];
  funnel: AnalyticsFunnelStep[];
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
const DASHBOARD_SCHEMA_VERSION = "20260807130642";
const RECENT_SESSION_LIMIT = 24;
const BREAKDOWN_LIMIT = 8;
const MAX_AUDIT_DETAIL_FIELDS = 12;
const SENSITIVE_AUDIT_DETAIL_KEY = /password|passcode|secret|token|cookie|authorization|api[_-]?key|message|transcript/i;

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
    countries: parseBreakdownList(
      payload.countries,
      (candidate) => [candidate.city, candidate.region, candidate.countryCode ?? candidate.country_code]
        .map(optionalString)
        .filter(Boolean)
        .join(", ") || "Unknown country",
      (candidate) => candidate.sessions ?? candidate.count,
    ),
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
  const client = options.client ?? ((await getSupabaseAdminClient()) as unknown as AnalyticsRpcClient);

  try {
    const result = await client.rpc(DASHBOARD_RPC, {
      p_start: window.from,
      p_end: window.to,
      p_limit: RECENT_SESSION_LIMIT,
    });
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
    const breakdowns = parseAnalyticsBreakdowns(payload);
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
    if (!recentSessions) warnings.push("Recent sessions are unavailable or did not match the supported schema.");
    if (!recentErrors) warnings.push("Recent error details are unavailable or did not match the supported schema.");
    if (!auditEvents) warnings.push("Admin audit history is unavailable or did not match the supported schema.");

    return {
      ok: true,
      data: {
        window,
        generatedAt: now.toISOString(),
        summary,
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
