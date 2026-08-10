import { NextResponse } from "next/server";
import { z } from "zod";
import { checkDistributedLeadCaptureLimit } from "@/lib/backend/lead-capture-abuse";
import { isTrustedLeadCaptureOrigin } from "@/lib/backend/lead-capture-route";
import { storeSiteTelemetryEvent } from "@/lib/backend/site-telemetry";
import { readBoundedJson } from "@/lib/security/request-body";
import { checkRateLimit, getRateLimitClientId } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const structuredClientErrorSchema = z.object({
  eventName: z.enum(["error_boundary", "global_error", "window_error", "unhandled_rejection"]),
  eventId: z.string().trim().min(1).max(255).nullable().optional(),
  pagePath: z.string().trim().max(800).nullable().optional(),
  metadata: z.object({
    boundary: z.string().trim().max(120).optional(),
    buildId: z.string().trim().max(120).optional(),
    component: z.string().trim().max(120).optional(),
    digest: z.string().trim().max(255).optional(),
    routeKind: z.string().trim().max(80).optional(),
    sessionId: z.string().uuid().optional(),
    source: z.string().trim().max(80).optional(),
  }).strict().optional(),
}).strict();

const boundaryClientErrorSchema = z.object({
  kind: z.enum(["route-render", "root-render"]),
  digest: z.string().trim().min(1).max(255).nullable().optional(),
  locale: z.string().trim().min(1).max(35).nullable().optional(),
}).strict();

const clientErrorSchema = z.union([structuredClientErrorSchema, boundaryClientErrorSchema]);

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
  if (request.headers.get("sec-gpc") === "1" || request.headers.get("dnt") === "1") {
    return NextResponse.json(
      { ok: true, stored: false, droppedReason: "browser_privacy_signal" },
      { status: 202, headers: noStoreHeaders },
    );
  }

  const localGuard = checkRateLimit({
    key: `client-error:${getRateLimitClientId(request.headers)}`,
    limit: 30,
    windowMs: 60_000,
  });
  if (!localGuard.allowed) {
    return NextResponse.json(
      { ok: true, stored: false, droppedReason: "local_rate_limit" },
      {
        status: 202,
        headers: noStoreHeaders,
      },
    );
  }

  const body = await readBoundedJson(request, 8 * 1024);
  const parsed = body.ok ? clientErrorSchema.safeParse(body.value) : null;
  if (!parsed?.success) {
    return NextResponse.json({ ok: false }, { status: 400, headers: noStoreHeaders });
  }

  const guard = await checkDistributedLeadCaptureLimit(
    "telemetry",
    null,
    request.headers,
  );
  if (!guard.allowed) {
    const unavailable = guard.reason === "configuration" || guard.reason === "database";
    if (unavailable) console.warn("Client error telemetry protection is unavailable; event dropped.");
    return NextResponse.json(
      {
        ok: true,
        stored: false,
        droppedReason: unavailable ? "telemetry_unavailable" : "distributed_rate_limit",
      },
      {
        status: 202,
        headers: noStoreHeaders,
      },
    );
  }

  try {
    const telemetry = "kind" in parsed.data
      ? {
          eventName: parsed.data.kind === "root-render" ? "global_error" as const : "error_boundary" as const,
          eventId: parsed.data.digest ?? null,
          pagePath: null,
          metadata: {
            digest: parsed.data.digest ?? undefined,
            source: parsed.data.kind,
          },
        }
      : parsed.data;
    await storeSiteTelemetryEvent({
      eventKind: "client_error",
      eventName: telemetry.eventName,
      eventId: telemetry.eventId,
      pagePath: telemetry.pagePath,
      metadata: telemetry.metadata,
    });
    return NextResponse.json({ ok: true, stored: true }, { status: 202, headers: noStoreHeaders });
  } catch {
    console.warn("Client error telemetry persistence is unavailable; event dropped.");
    return NextResponse.json(
      { ok: true, stored: false, droppedReason: "telemetry_unavailable" },
      { status: 202, headers: noStoreHeaders },
    );
  }
}
