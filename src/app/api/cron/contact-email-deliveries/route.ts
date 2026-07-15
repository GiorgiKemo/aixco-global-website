import { NextResponse } from "next/server";
import { processContactEmailOutbox } from "@/lib/backend/contact-email-outbox";
import { getContactPipelineReadiness } from "@/lib/backend/contact-pipeline-readiness";
import { isAuthorizedCronRequest } from "@/lib/security/cron-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function isAuthorizedContactEmailWorker(
  request: Request,
  env: Record<string, string | undefined> = process.env,
) {
  return isAuthorizedCronRequest(request, env);
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
