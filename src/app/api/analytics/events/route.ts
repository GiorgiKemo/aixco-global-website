import { NextResponse } from "next/server";
import { analyticsBatchSchema } from "@/lib/analytics/contracts";
import { createAnalyticsSessionLinkToken } from "@/lib/backend/analytics-session-link";
import { checkDistributedLeadCaptureLimit } from "@/lib/backend/lead-capture-abuse";
import { isTrustedLeadCaptureOrigin } from "@/lib/backend/lead-capture-route";
import { storeAnalyticsBatch } from "@/lib/backend/site-analytics";
import { readBoundedJson } from "@/lib/security/request-body";
import { checkRateLimit, getRateLimitClientId } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noStoreHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ ok: false }, { status: 415, headers: noStoreHeaders });
  }
  if (!isTrustedLeadCaptureOrigin(request, process.env)) {
    return NextResponse.json({ ok: false }, { status: 403, headers: noStoreHeaders });
  }

  if (
    request.headers.get("sec-gpc") === "1"
    || request.headers.get("dnt") === "1"
  ) {
    return NextResponse.json(
      { ok: true, stored: false, droppedReason: "browser_privacy_signal" },
      { status: 202, headers: noStoreHeaders },
    );
  }

  const localGuard = checkRateLimit({
    key: `site-analytics:${getRateLimitClientId(request.headers)}`,
    limit: 30,
    windowMs: 60_000,
  });
  if (!localGuard.allowed) {
    return NextResponse.json(
      { ok: true, stored: false, droppedReason: "local_rate_limit" },
      { status: 202, headers: noStoreHeaders },
    );
  }

  const body = await readBoundedJson(request, 64 * 1024);
  const parsed = body.ok ? analyticsBatchSchema.safeParse(body.value) : null;
  if (!parsed?.success) {
    return NextResponse.json({ ok: false }, { status: 400, headers: noStoreHeaders });
  }

  const distributedGuard = await checkDistributedLeadCaptureLimit(
    "telemetry",
    null,
    request.headers,
  );
  if (!distributedGuard.allowed) {
    const unavailable = distributedGuard.reason === "configuration"
      || distributedGuard.reason === "database";
    if (unavailable) console.warn("Analytics distributed protection is unavailable; batch dropped.");
    return NextResponse.json(
      {
        ok: true,
        stored: false,
        droppedReason: unavailable ? "analytics_unavailable" : "distributed_rate_limit",
      },
      { status: 202, headers: noStoreHeaders },
    );
  }

  try {
    const result = await storeAnalyticsBatch(parsed.data, request.headers);
    const sessionId = parsed.data.session.id.toLowerCase();
    const linkToken = createAnalyticsSessionLinkToken(sessionId);
    return NextResponse.json(
      {
        ok: true,
        stored: true,
        accepted: result.eventCount,
        receipt: result.receipt,
        sessionId,
        ...(linkToken ? { linkToken } : {}),
      },
      { status: 202, headers: noStoreHeaders },
    );
  } catch (error) {
    console.error("Analytics persistence is unavailable; batch dropped.", error);
    return NextResponse.json(
      { ok: true, stored: false, droppedReason: "analytics_unavailable" },
      { status: 202, headers: noStoreHeaders },
    );
  }
}
