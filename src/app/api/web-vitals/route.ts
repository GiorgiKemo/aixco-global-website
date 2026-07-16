import { NextResponse } from "next/server";
import { z } from "zod";
import { checkDistributedLeadCaptureLimit } from "@/lib/backend/lead-capture-abuse";
import { isTrustedLeadCaptureOrigin } from "@/lib/backend/lead-capture-route";
import { storeSiteTelemetryEvent } from "@/lib/backend/site-telemetry";

export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_EVENTS = 60;
const RATE_LIMIT_MAX_KEYS = 5_000;
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

const webVitalSchema = z.object({
  id: z.string().min(1).max(160),
  name: z.enum(["TTFB", "FCP", "LCP", "FID", "CLS", "INP"]),
  value: z.number().finite().min(0),
  delta: z.number().finite(),
  rating: z.enum(["good", "needs-improvement", "poor"]),
  navigationType: z.string().max(40),
  pathname: z.string().startsWith("/").max(800),
}).strict();

function noStoreHeaders(additional: Record<string, string> = {}) {
  return {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...additional,
  };
}

function getRateLimitKey(request: Request) {
  const forwarded = request.headers.get("x-vercel-forwarded-for")
    ?? request.headers.get("x-forwarded-for")
    ?? "unknown";
  return forwarded.split(",", 1)[0]?.trim().slice(0, 80) || "unknown";
}

function hasRateLimitCapacity(request: Request, now = Date.now()) {
  const key = getRateLimitKey(request);
  const bucket = rateLimitBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    if (rateLimitBuckets.size >= RATE_LIMIT_MAX_KEYS) {
      for (const [candidate, value] of rateLimitBuckets) {
        if (value.resetAt <= now) rateLimitBuckets.delete(candidate);
      }
      if (rateLimitBuckets.size >= RATE_LIMIT_MAX_KEYS) {
        rateLimitBuckets.delete(rateLimitBuckets.keys().next().value as string);
      }
    }
    rateLimitBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (bucket.count >= RATE_LIMIT_MAX_EVENTS) return false;
  bucket.count += 1;
  return true;
}

export function resetWebVitalsRateLimitForTests() {
  if (process.env.NODE_ENV === "test") rateLimitBuckets.clear();
}

export async function POST(request: Request) {
  if (!isTrustedLeadCaptureOrigin(request, process.env)) {
    return NextResponse.json({ ok: false }, { status: 403, headers: noStoreHeaders() });
  }

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    return NextResponse.json({ ok: false }, { status: 415, headers: noStoreHeaders() });
  }

  if (!hasRateLimitCapacity(request)) {
    return NextResponse.json(
      { ok: true, stored: false, droppedReason: "local_rate_limit" },
      { status: 202, headers: noStoreHeaders() },
    );
  }

  const declaredLength = Number.parseInt(request.headers.get("content-length") ?? "0", 10);
  if (Number.isFinite(declaredLength) && declaredLength > 4096) {
    return NextResponse.json({ ok: false }, { status: 413, headers: noStoreHeaders() });
  }

  const rawBody = await request.text();
  if (rawBody.length > 4096) {
    return NextResponse.json({ ok: false }, { status: 413, headers: noStoreHeaders() });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody || "null");
  } catch {
    payload = null;
  }

  const parsed = webVitalSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400, headers: noStoreHeaders() });
  }

  const distributedGuard = await checkDistributedLeadCaptureLimit(
    "telemetry",
    null,
    request.headers,
  );
  if (!distributedGuard.allowed) {
    const unavailable = distributedGuard.reason === "configuration"
      || distributedGuard.reason === "database";
    if (unavailable) console.warn("Web Vital distributed protection is unavailable; event dropped.");
    return NextResponse.json(
      {
        ok: true,
        stored: false,
        droppedReason: unavailable ? "telemetry_unavailable" : "distributed_rate_limit",
      },
      {
        status: 202,
        headers: noStoreHeaders(),
      },
    );
  }

  try {
    await storeSiteTelemetryEvent({
      eventKind: "web_vital",
      eventName: parsed.data.name,
      eventId: parsed.data.id,
      pagePath: parsed.data.pathname,
      value: parsed.data.value,
      rating: parsed.data.rating,
      metadata: {
        delta: parsed.data.delta,
        metricId: parsed.data.id,
        navigationType: parsed.data.navigationType,
        source: "next_web_vitals",
      },
    });
  } catch {
    console.warn("Web Vital persistence is unavailable; event dropped.");
    return NextResponse.json(
      { ok: true, stored: false, droppedReason: "telemetry_unavailable" },
      { status: 202, headers: noStoreHeaders() },
    );
  }

  console.info("[aixco-web-vital]", JSON.stringify({
    event: "web_vital_received",
    schemaVersion: 1,
    timestamp: new Date().toISOString(),
    ...parsed.data,
  }));
  return NextResponse.json({ ok: true, stored: true }, { status: 202, headers: noStoreHeaders() });
}
