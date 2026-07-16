import { NextResponse } from "next/server";
import { getContactPipelineReadiness } from "@/lib/backend/contact-pipeline-readiness";
import { isAuthorizedCronRequest } from "@/lib/security/cron-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json(
      { ok: false, reason: "Unauthorized." },
      { status: 401, headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  }

  const readiness = await getContactPipelineReadiness();

  return NextResponse.json(
    {
      ok: readiness.ready,
      environment: readiness.environment,
      schema: readiness.schema,
      operations: readiness.operations,
    },
    {
      status: readiness.ready ? 200 : 503,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
        "X-Content-Type-Options": "nosniff",
        ...(readiness.ready ? {} : { "Retry-After": "60" }),
      },
    },
  );
}
