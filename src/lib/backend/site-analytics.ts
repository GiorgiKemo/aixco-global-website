import "server-only";

import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { analyticsBatchSchema, type AnalyticsBatchInput } from "@/lib/analytics/contracts";
import { hashLeadCaptureIdentity } from "@/lib/backend/lead-capture-abuse";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const allowedMetadataKeys = new Set([
  "downloadExtension",
  "elementRole",
  "formId",
  "language",
  "linkHost",
  "linkPath",
  "portalMode",
  "portalRole",
  "previousLanguage",
  "reason",
  "routeKind",
  "source",
  "status",
  "validationFieldCount",
]);

type AnalyticsWriteClient = {
  rpc: (
    fn: "store_site_analytics_batch",
    args: {
      p_session: Record<string, unknown>;
      p_network: Record<string, unknown>;
      p_events: Record<string, unknown>[];
    },
  ) => PromiseLike<{
    data: number | null;
    error: { message: string; code?: string } | null;
  }>;
};

type RequestNetworkContext = {
  ipAddress: string | null;
  ipHash: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
  userAgent: string | null;
};

function cleanHeader(value: string | null, maxLength: number) {
  const cleaned = value?.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  return cleaned ? cleaned.slice(0, maxLength) : null;
}

function cleanIpCandidate(value: string | null) {
  let candidate = value?.split(",", 1)[0]?.trim() ?? "";
  if (candidate.startsWith("[")) candidate = candidate.slice(1, candidate.indexOf("]"));
  if (candidate.includes(":") && candidate.split(":").length === 2) {
    const [host, port] = candidate.split(":");
    if (/^\d{1,5}$/.test(port ?? "")) candidate = host ?? "";
  }
  return isIP(candidate) ? candidate : null;
}

export function getAnalyticsRequestContext(headers: Headers): RequestNetworkContext {
  const ipAddress = cleanIpCandidate(
    headers.get("x-vercel-forwarded-for")
      ?? headers.get("cf-connecting-ip")
      ?? headers.get("x-forwarded-for")
      ?? headers.get("x-real-ip"),
  );
  const encodedCity = cleanHeader(headers.get("x-vercel-ip-city"), 120);
  let city = encodedCity;
  if (encodedCity) {
    try {
      city = decodeURIComponent(encodedCity).slice(0, 120);
    } catch {
      city = encodedCity;
    }
  }

  const countryCandidate = cleanHeader(
    headers.get("x-vercel-ip-country") ?? headers.get("cf-ipcountry"),
    2,
  )?.toUpperCase() ?? null;

  return {
    ipAddress,
    ipHash: ipAddress ? hashLeadCaptureIdentity(`analytics-ip:${ipAddress}`) : null,
    countryCode: countryCandidate && /^[A-Z]{2}$/.test(countryCandidate)
      ? countryCandidate
      : null,
    region: cleanHeader(headers.get("x-vercel-ip-country-region"), 120),
    city,
    userAgent: cleanHeader(headers.get("user-agent"), 512),
  };
}

function safePath(value: string) {
  try {
    const url = new URL(value, "https://aixco.invalid");
    const hash = /^#[a-z0-9][a-z0-9_-]{0,119}$/i.test(url.hash) ? url.hash : "";
    return `${url.pathname}${hash}`.slice(0, 800);
  } catch {
    return "/";
  }
}

function safeReferrer(value: string | null | undefined) {
  if (!value) return { host: null, path: null };
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return { host: null, path: null };
    }
    return {
      host: url.hostname.toLowerCase().slice(0, 255),
      path: url.pathname.slice(0, 800),
    };
  } catch {
    return { host: null, path: null };
  }
}

function parseUserAgent(value: string | null) {
  const ua = value ?? "";
  const deviceType = /bot|crawler|spider|crawling/i.test(ua)
    ? "bot"
    : /ipad|tablet|kindle|silk|playbook/i.test(ua)
      ? "tablet"
      : /mobi|iphone|ipod|android/i.test(ua)
        ? "mobile"
        : "desktop";
  const browserName = /edg\//i.test(ua)
    ? "Edge"
    : /opr\//i.test(ua)
      ? "Opera"
      : /firefox\//i.test(ua)
        ? "Firefox"
        : /crios\//i.test(ua)
          ? "Chrome iOS"
          : /chrome\//i.test(ua)
            ? "Chrome"
            : /safari\//i.test(ua)
              ? "Safari"
              : "Other";
  const osName = /windows nt/i.test(ua)
    ? "Windows"
    : /iphone|ipad|ipod/i.test(ua)
      ? "iOS"
      : /android/i.test(ua)
        ? "Android"
        : /mac os x/i.test(ua)
          ? "macOS"
          : /linux/i.test(ua)
            ? "Linux"
            : "Other";
  return { deviceType, browserName, osName };
}

function safeMetadata(value: Record<string, unknown> | undefined) {
  const output: Record<string, string | number | boolean | null> = {};
  for (const [key, item] of Object.entries(value ?? {})) {
    if (!allowedMetadataKeys.has(key)) continue;
    if (typeof item === "string") output[key] = item.slice(0, 255);
    else if (typeof item === "number" && Number.isFinite(item)) output[key] = item;
    else if (typeof item === "boolean" || item === null) output[key] = item;
  }
  return output;
}

function errorWithCode(scope: string, error: { message: string; code?: string } | null) {
  return new Error(`${scope} failed (${error?.code ?? "database_error"}).`);
}

const MAX_ACCEPTED_EVENT_AGE_MS = 30 * 60_000;
const MAX_ACCEPTED_CLOCK_SKEW_MS = 5 * 60_000;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function normalizeAnalyticsTimeline(
  session: AnalyticsBatchInput["session"],
  events: AnalyticsBatchInput["events"],
  now = new Date(),
) {
  const nowMs = now.getTime();
  const upperBound = nowMs + MAX_ACCEPTED_CLOCK_SKEW_MS;
  const lowerBound = nowMs - MAX_ACCEPTED_EVENT_AGE_MS;
  const startedAtMs = clamp(Date.parse(session.startedAt), lowerBound, upperBound);
  const lastSeenAtMs = clamp(Date.parse(session.lastSeenAt), startedAtMs, upperBound);
  const endedAtMs = session.endedAt
    ? clamp(Date.parse(session.endedAt), startedAtMs, lastSeenAtMs)
    : null;
  const maximumActiveSeconds = Math.max(0, Math.floor((lastSeenAtMs - startedAtMs) / 1_000));

  return {
    startedAt: new Date(startedAtMs).toISOString(),
    lastSeenAt: new Date(lastSeenAtMs).toISOString(),
    endedAt: endedAtMs === null ? null : new Date(endedAtMs).toISOString(),
    activeSeconds: Math.min(session.activeSeconds, maximumActiveSeconds),
    events: events.map((event) => ({
      ...event,
      occurredAt: new Date(
        clamp(Date.parse(event.occurredAt), startedAtMs, lastSeenAtMs),
      ).toISOString(),
    })),
  };
}

export async function storeAnalyticsBatch(
  input: AnalyticsBatchInput,
  headers: Headers,
  options: { client?: AnalyticsWriteClient; now?: Date } = {},
) {
  const parsed = analyticsBatchSchema.parse(input);
  const client = options.client
    ?? ((await getSupabaseAdminClient()) as unknown as AnalyticsWriteClient);
  const network = getAnalyticsRequestContext(headers);
  const userAgent = parseUserAgent(network.userAgent);
  const referrer = safeReferrer(parsed.session.referrer);
  const campaign = parsed.session.campaign ?? {};
  const timeline = normalizeAnalyticsTimeline(parsed.session, parsed.events, options.now);

  const sessionRow = {
    id: parsed.session.id,
    visitor_id: parsed.session.visitorId,
    consent_version: parsed.consent.version,
    started_at: timeline.startedAt,
    last_seen_at: timeline.lastSeenAt,
    ended_at: timeline.endedAt,
    active_seconds: timeline.activeSeconds,
    landing_path: safePath(parsed.session.landingPath),
    exit_path: safePath(parsed.session.exitPath),
    referrer_host: referrer.host,
    referrer_path: referrer.path,
    utm_source: campaign.source ?? null,
    utm_medium: campaign.medium ?? null,
    utm_campaign: campaign.campaign ?? null,
    utm_term: campaign.term ?? null,
    utm_content: campaign.content ?? null,
    locale: parsed.session.locale,
    timezone: parsed.session.timezone ?? null,
    screen_width: parsed.session.screenWidth ?? null,
    screen_height: parsed.session.screenHeight ?? null,
    viewport_width: parsed.session.viewportWidth ?? null,
    viewport_height: parsed.session.viewportHeight ?? null,
    device_type: userAgent.deviceType,
    browser_name: userAgent.browserName,
    os_name: userAgent.osName,
    user_agent: network.userAgent,
    is_returning: parsed.session.isReturning,
  };

  const networkRow = {
    session_id: parsed.session.id,
    ip_address: network.ipAddress,
    ip_hash: network.ipHash,
    country_code: network.countryCode,
    region: network.region,
    city: network.city,
    first_seen_at: timeline.startedAt,
    last_seen_at: timeline.lastSeenAt,
  };

  const eventRows = timeline.events.map((event) => ({
    id: event.id,
    session_id: parsed.session.id,
    occurred_at: event.occurredAt,
    event_type: event.type,
    name: event.name,
    page_path: safePath(event.pagePath),
    section_id: event.sectionId ?? null,
    target_label: event.targetLabel ?? null,
    value: event.value ?? null,
    duration_ms: event.durationMs ?? null,
    scroll_depth: event.scrollDepth ?? null,
    metadata: safeMetadata(event.metadata),
  }));
  const { error } = await client.rpc("store_site_analytics_batch", {
    p_session: sessionRow,
    p_network: networkRow,
    p_events: eventRows,
  });
  if (error) throw errorWithCode("Analytics batch storage", error);

  return {
    sessionId: parsed.session.id,
    eventCount: eventRows.length,
    receipt: createHash("sha256")
      .update(`${parsed.session.id}:${eventRows.map((event) => event.id).join(":")}`)
      .digest("hex")
      .slice(0, 16),
  };
}

export type { AnalyticsWriteClient, RequestNetworkContext };
