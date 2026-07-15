import { NextResponse } from "next/server";
import {
  captureChatTranscript,
  captureContactSubmission,
  capturePortalEvent,
} from "@/lib/backend/lead-capture-service";
import type { CaptureResult } from "@/lib/backend/lead-capture-contracts";
import { leadCaptureAntiAbuseSchema } from "@/lib/backend/lead-capture-contracts";
import {
  checkDistributedLeadCaptureLimit,
  type LeadCaptureResource,
} from "@/lib/backend/lead-capture-abuse";
import { checkRateLimit, getRateLimitClientId } from "@/lib/security/rate-limit";

type LeadCaptureRequestBody = {
  payload?: unknown;
  context?: unknown;
  antiAbuse?: unknown;
};
type CaptureFailure = Extract<CaptureResult, { ok: false }>;

type LeadCaptureRouteOptions = {
  distributedGuard?: typeof checkDistributedLeadCaptureLimit;
  now?: () => number;
};

const LEAD_CAPTURE_RATE_LIMIT = {
  limit: 30,
  windowMs: 60_000,
};

function getStatus(result: CaptureResult) {
  if (result.ok === true) return 201;
  const failure: CaptureFailure = result;

  if (failure.skipped) return failure.reason.includes("configuration") ? 503 : 400;
  if (failure.reason.includes("too large")) return 413;
  if (failure.reason.includes("too quickly")) return 429;
  if (failure.reason.startsWith("Invalid") || failure.reason.includes("not allowed")) return 400;
  return 500;
}

async function readJsonBody(request: Request): Promise<LeadCaptureRequestBody | CaptureFailure> {
  try {
    const declaredLength = Number(request.headers.get("content-length") ?? 0);
    if (Number.isFinite(declaredLength) && declaredLength > 32_768) {
      return { ok: false, reason: "The request body is too large." };
    }

    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > 32_768) {
      return { ok: false, reason: "The request body is too large." };
    }

    const body = JSON.parse(rawBody) as unknown;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return { ok: false, reason: "Invalid JSON body." };
    }

    return body as LeadCaptureRequestBody;
  } catch {
    return { ok: false, reason: "Invalid JSON body." };
  }
}

export function validateLeadCaptureAntiAbuse(input: unknown, now = Date.now()): CaptureFailure | null {
  if (input === undefined) return null;

  const parsed = leadCaptureAntiAbuseSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "Invalid form verification data." };
  if (parsed.data.website.trim()) return { ok: false, reason: "Invalid form verification data." };

  if (parsed.data.startedAt !== undefined) {
    const elapsed = now - parsed.data.startedAt;
    if (elapsed < 1_200) {
      return { ok: false, reason: "The form was submitted too quickly. Please try again." };
    }
  }

  return null;
}

export function createLeadCaptureRoute(
  resource: LeadCaptureResource,
  routeOptions: LeadCaptureRouteOptions = {},
) {
  return async function POST(request: Request) {
    const rateLimit = checkRateLimit({
      key: `lead-capture:${resource}:${getRateLimitClientId(request.headers)}`,
      ...LEAD_CAPTURE_RATE_LIMIT,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { ok: false, skipped: true, reason: "Too many lead capture requests. Please try again shortly." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    const body = await readJsonBody(request);
    if ("ok" in body) {
      return NextResponse.json(body, { status: getStatus(body) });
    }

    if (resource === "contact") {
      const antiAbuseFailure = validateLeadCaptureAntiAbuse(body.antiAbuse, routeOptions.now?.());
      if (antiAbuseFailure) {
        return NextResponse.json(antiAbuseFailure, { status: getStatus(antiAbuseFailure) });
      }
    }

    const guard = await (routeOptions.distributedGuard ?? checkDistributedLeadCaptureLimit)(
      resource,
      body.payload,
      request.headers,
    );
    if (!guard.allowed) {
      const unavailable = guard.reason === "configuration" || guard.reason === "database";
      return NextResponse.json(
        {
          ok: false,
          skipped: true,
          reason: unavailable
            ? "Lead capture is temporarily unavailable. Please try again shortly."
            : "Too many lead capture requests. Please try again shortly.",
        },
        {
          status: unavailable ? 503 : 429,
          headers: { "Retry-After": String(guard.retryAfterSeconds) },
        },
      );
    }

    const options = { headers: request.headers };
    const result =
      resource === "contact"
        ? await captureContactSubmission(body.payload, body.context, options)
        : resource === "chat"
          ? await captureChatTranscript(body.payload, body.context, options)
          : await capturePortalEvent(body.payload, body.context, options);

    return NextResponse.json(result, { status: getStatus(result) });
  };
}
