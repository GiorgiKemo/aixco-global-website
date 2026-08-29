import { after, NextResponse } from "next/server";
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
import { processContactEmailOutbox } from "@/lib/backend/contact-email-outbox";
import { getContactPipelineReadiness } from "@/lib/backend/contact-pipeline-readiness";

type LeadCaptureRequestBody = {
  payload?: unknown;
  context?: unknown;
  antiAbuse?: unknown;
};
type CaptureFailure = Extract<CaptureResult, { ok: false }>;

type LeadCaptureRouteOptions = {
  distributedGuard?: typeof checkDistributedLeadCaptureLimit;
  now?: () => number;
  env?: Record<string, string | undefined>;
  scheduleAfter?: (task: () => Promise<void>) => void;
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
  if (input === undefined) return { ok: false, reason: "Invalid form verification data." };

  const parsed = leadCaptureAntiAbuseSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "Invalid form verification data." };
  if (parsed.data.website.trim()) return { ok: false, reason: "Invalid form verification data." };

  if (parsed.data.startedAt === undefined) return { ok: false, reason: "Invalid form verification data." };

  const elapsed = now - parsed.data.startedAt;
  // Autofill and mobile browser contact data can make a legitimate form
  // submission very quick. The honeypot and distributed rate limits remain
  // the primary abuse controls; this only rejects effectively instant posts.
  if (elapsed < 300) {
    return { ok: false, reason: "The form was submitted too quickly. Please try again." };
  }

  return null;
}

export function isTrustedLeadCaptureOrigin(
  request: Request,
  env: Record<string, string | undefined>,
) {
  const production = env.NODE_ENV === "production" || env.VERCEL === "1";
  const origin = request.headers.get("origin")?.trim();
  const allowedOrigins = new Set<string>();
  let requestProtocol = "";
  try {
    const requestUrl = new URL(request.url);
    requestProtocol = requestUrl.protocol;
    allowedOrigins.add(requestUrl.origin);
  } catch {
    return false;
  }

  const forwardedProtocol = request.headers.get("x-forwarded-proto")
    ?.split(",", 1)[0]
    ?.trim()
    .toLowerCase();
  const protocols = new Set(
    [forwardedProtocol ? `${forwardedProtocol}:` : "", requestProtocol]
      .filter((protocol) => protocol === "https:" || (!production && protocol === "http:")),
  );
  // x-forwarded-host is client-supplied on any deployment without a trusted
  // proxy stripping it, so production allowlist entries only derive from the
  // server-observed host header and require the https scheme.
  const hostHeaders = production ? ["host"] : ["x-forwarded-host", "host"];
  for (const headerName of hostHeaders) {
    const host = request.headers.get(headerName)?.split(",", 1)[0]?.trim() ?? "";
    if (!/^([a-z0-9.-]+|\[[0-9a-f:.]+\])(?::[0-9]{1,5})?$/i.test(host)) continue;
    for (const protocol of protocols) {
      try {
        allowedOrigins.add(new URL(`${protocol}//${host}`).origin);
      } catch {
        // Invalid proxy metadata never broadens the origin allowlist.
      }
    }
  }

  for (const name of ["SITE_URL", "NEXT_PUBLIC_SITE_URL", "VERCEL_PROJECT_PRODUCTION_URL"]) {
    const configured = env[name]?.trim();
    if (!configured) continue;
    try {
      allowedOrigins.add(new URL(configured.startsWith("http") ? configured : `https://${configured}`).origin);
    } catch {
      // An invalid optional alias never broadens the allowlist.
    }
  }

  if (!origin) {
    if (env.NODE_ENV !== "production") return true;
    const fetchSite = request.headers.get("sec-fetch-site")?.trim().toLowerCase();
    if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "same-site") return false;
    const referrer = request.headers.get("referer")?.trim();
    if (!referrer) return false;
    try {
      return allowedOrigins.has(new URL(referrer).origin);
    } catch {
      return false;
    }
  }

  return allowedOrigins.has(origin);
}

export async function processImmediateContactEmailDelivery(
  requestReference: string,
  options: {
    readiness?: typeof getContactPipelineReadiness;
    processor?: typeof processContactEmailOutbox;
  } = {},
) {
  const readiness = await (options.readiness ?? getContactPipelineReadiness)({ operational: false });
  if (!readiness.ready) return { processed: false as const, reason: "pipeline_not_ready" as const };

  const summary = await (options.processor ?? processContactEmailOutbox)({
    batchSize: 2,
    requestReference,
    pruneAbuseAttempts: false,
  });
  return { processed: true as const, summary };
}

export function createLeadCaptureRoute(
  resource: LeadCaptureResource,
  routeOptions: LeadCaptureRouteOptions = {},
) {
  return async function POST(request: Request) {
    const env = routeOptions.env ?? process.env;
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
      return NextResponse.json(
        { ok: false, reason: "Content-Type must be application/json." },
        { status: 415, headers: { "Cache-Control": "no-store" } },
      );
    }
    if (!isTrustedLeadCaptureOrigin(request, env)) {
      return NextResponse.json(
        { ok: false, reason: "Request origin is not allowed." },
        { status: 403, headers: { "Cache-Control": "no-store" } },
      );
    }

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
      { env },
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

    if (resource === "contact" && result.ok && result.reference) {
      const requestReference = result.reference;
      const deliver = async () => {
        try {
          const delivery = await processImmediateContactEmailDelivery(requestReference);
          if (!delivery.processed) {
            console.error(`Immediate contact email processing deferred for ${requestReference}: pipeline not ready.`);
          }
        } catch (error) {
          // The durable rows are already committed. Supabase Cron is the
          // reliable recovery path if this post-response optimization fails.
          console.error(`Immediate contact email processing failed for ${requestReference}.`, error);
        }
      };
      if (routeOptions.scheduleAfter) routeOptions.scheduleAfter(deliver);
      else after(deliver);
    }

    return NextResponse.json(result, { status: getStatus(result) });
  };
}
