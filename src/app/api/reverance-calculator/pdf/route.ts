import { NextResponse } from "next/server";
import { z } from "zod";
import { checkDistributedLeadCaptureLimit } from "@/lib/backend/lead-capture-abuse";
import { isTrustedLeadCaptureOrigin } from "@/lib/backend/lead-capture-route";
import { getRateLimitClientId, checkRateLimit } from "@/lib/security/rate-limit";
import { readBoundedJson } from "@/lib/security/request-body";
import { calculateReveranceInvestment } from "@/lib/reverance-investment-calculator";
import { generateReveranceInvestmentPdf } from "@/lib/reverance-investment-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  lang: z.enum(["en", "de", "pl", "sl", "ru"]).default("en"),
  clientName: z.string().trim().max(100).optional(),
  inputs: z.object({
    unitCode: z.string().trim().min(1).max(10),
    pricePerSquareMetre: z.number().finite(),
    financingPercent: z.number().finite(),
    grossYieldPercent: z.number().finite(),
    annualGrowthPercent: z.number().finite(),
    holdingYears: z.number().finite(),
  }).strict(),
}).strict();

const responseHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ ok: false, reason: "invalid_content_type" }, { status: 415, headers: responseHeaders });
  }
  if (!isTrustedLeadCaptureOrigin(request, process.env)) {
    return NextResponse.json({ ok: false, reason: "untrusted_origin" }, { status: 403, headers: responseHeaders });
  }

  const rateLimit = checkRateLimit({
    key: `reverance-calculator-pdf:${getRateLimitClientId(request.headers)}`,
    limit: 12,
    windowMs: 10 * 60_000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429, headers: responseHeaders });
  }

  const body = await readBoundedJson(request, 12 * 1024);
  const parsed = body.ok ? requestSchema.safeParse(body.value) : null;
  if (!parsed?.success) {
    return NextResponse.json({ ok: false, reason: "invalid_payload" }, { status: 400, headers: responseHeaders });
  }

  // PDF generation is CPU-heavy and the in-memory limiter is per-instance on
  // serverless, so the distributed telemetry guard (120 requests / 10 minutes)
  // is the real cross-instance protection. Like lead capture, it fails closed:
  // a missing guard configuration or database rejects the expensive work.
  const guard = await checkDistributedLeadCaptureLimit(
    "telemetry",
    null,
    request.headers,
  );
  if (!guard.allowed) {
    const unavailable = guard.reason === "configuration" || guard.reason === "database";
    if (unavailable) console.error("PDF generation abuse protection is unavailable; request rejected.");
    return NextResponse.json(
      { ok: false, reason: unavailable ? "protection_unavailable" : "rate_limited" },
      {
        status: unavailable ? 503 : 429,
        headers: { ...responseHeaders, "Retry-After": String(guard.retryAfterSeconds) },
      },
    );
  }

  try {
    const calculation = calculateReveranceInvestment(parsed.data.inputs);
    const pdf = await generateReveranceInvestmentPdf({
      calculation,
      lang: parsed.data.lang,
      clientName: parsed.data.clientName,
    });
    const filename = `aixco-reverance-investment-brief-${parsed.data.lang}.pdf`;
    return new NextResponse(Buffer.from(pdf), {
      status: 200,
      headers: {
        ...responseHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, reason: "pdf_generation_failed" }, { status: 500, headers: responseHeaders });
  }
}
