import { NextResponse } from "next/server";
import { processContactEmailOutbox } from "@/lib/backend/contact-email-outbox";
import { getContactPipelineReadiness } from "@/lib/backend/contact-pipeline-readiness";
import { isAuthorizedCronRequest } from "@/lib/security/cron-auth";
import {
  markContactEmailWorkerFailed,
  markContactEmailWorkerStarted,
  markContactEmailWorkerSucceeded,
} from "@/lib/backend/contact-email-worker-runtime";

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

  try {
    await markContactEmailWorkerStarted();
    // A stale heartbeat or existing backlog must never prevent the worker that
    // repairs it from running. The worker preflight checks configuration and
    // the exact schema contract; the health endpoint performs the operational
    // threshold checks.
    const readiness = await getContactPipelineReadiness({ operational: false });
    if (!readiness.ready) {
      throw new Error("The contact email pipeline is not ready.");
    }

    // pg_net cancels the HTTP call after 25 seconds. Two sequential Resend
    // attempts have a bounded 20-second provider timeout, leaving response and
    // database-update headroom. The recovery workflow drains additional pages.
    const summary = await processContactEmailOutbox({ batchSize: 2 });
    await markContactEmailWorkerSucceeded(summary);
    return NextResponse.json(
      { ok: true, ...summary },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Contact email worker failed.", error);
    try {
      await markContactEmailWorkerFailed(
        error instanceof Error ? error.message : "Unknown contact email worker failure.",
      );
    } catch (runtimeError) {
      console.error("Contact email worker failure heartbeat could not be persisted.", runtimeError);
    }
    return NextResponse.json(
      { ok: false, reason: "The contact email worker failed." },
      { status: 500, headers: { "Cache-Control": "no-store", "Retry-After": "60" } },
    );
  }
}

export const GET = runContactEmailWorker;
export const POST = runContactEmailWorker;
