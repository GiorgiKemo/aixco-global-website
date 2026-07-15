import { NextResponse } from "next/server";
import { getContactPipelineReadiness } from "@/lib/backend/contact-pipeline-readiness";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const readiness = await getContactPipelineReadiness();

  return NextResponse.json(
    readiness.ready
      ? {
          ok: true,
          schemaVersion: readiness.schema.version,
        }
      : { ok: false },
    {
      status: readiness.ready ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
        ...(readiness.ready ? {} : { "Retry-After": "60" }),
      },
    },
  );
}
