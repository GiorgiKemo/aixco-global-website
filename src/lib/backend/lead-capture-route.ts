import { NextResponse } from "next/server";
import {
  captureChatTranscript,
  captureContactSubmission,
  capturePortalEvent,
} from "@/lib/backend/lead-capture-service";
import type { CaptureResult } from "@/lib/backend/lead-capture-contracts";
import { checkRateLimit, getRateLimitClientId } from "@/lib/security/rate-limit";

type LeadCaptureResource = "contact" | "chat" | "portal-event";
type LeadCaptureRequestBody = {
  payload?: unknown;
  context?: unknown;
};
type CaptureFailure = Extract<CaptureResult, { ok: false }>;

const LEAD_CAPTURE_RATE_LIMIT = {
  limit: 30,
  windowMs: 60_000,
};

function getStatus(result: CaptureResult) {
  if (result.ok === true) return 201;
  const failure: CaptureFailure = result;

  if (failure.skipped) return failure.reason.includes("configuration") ? 503 : 400;
  if (failure.reason.startsWith("Invalid") || failure.reason.includes("not allowed")) return 400;
  return 500;
}

async function readJsonBody(request: Request): Promise<LeadCaptureRequestBody | CaptureFailure> {
  try {
    const body = (await request.json()) as unknown;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return { ok: false, reason: "Invalid JSON body." };
    }

    return body as LeadCaptureRequestBody;
  } catch {
    return { ok: false, reason: "Invalid JSON body." };
  }
}

export function createLeadCaptureRoute(resource: LeadCaptureResource) {
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
