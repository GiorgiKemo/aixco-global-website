import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { processContactEmailOutbox } from "@/lib/backend/contact-email-outbox";
import { getContactPipelineReadiness } from "@/lib/backend/contact-pipeline-readiness";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function isAuthorizedContactEmailWorker(
  request: Request,
  env: Record<string, string | undefined> = process.env,
) {
  const secret = env.CRON_SECRET?.trim() ?? "";
  const authorization = request.headers.get("authorization") ?? "";
  const provided = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";

  if (secret.length < 32 || provided.length !== secret.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(secret));
}

async function runContactEmailWorker(request: Request) {
  if (!isAuthorizedContactEmailWorker(request)) {
    return NextResponse.json(
      { ok: false, reason: "Unauthorized." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const readiness = await getContactPipelineReadiness();
  if (!readiness.ready) {
    return NextResponse.json(
      { ok: false, reason: "The contact email pipeline is not ready." },
      { status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "60" } },
    );
  }

  try {
    const summary = await processContactEmailOutbox();
    return NextResponse.json(
      { ok: true, ...summary },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Contact email worker failed.", error);
    return NextResponse.json(
      { ok: false, reason: "The contact email worker failed." },
      { status: 500, headers: { "Cache-Control": "no-store", "Retry-After": "60" } },
    );
  }
}

export const GET = runContactEmailWorker;
export const POST = runContactEmailWorker;
