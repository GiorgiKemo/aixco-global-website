import { NextResponse } from "next/server";
import { purgeExpiredOperationalData } from "@/lib/backend/data-retention";
import { isAuthorizedCronRequest } from "@/lib/security/cron-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function runDataRetention(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json(
      { ok: false, reason: "Unauthorized." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const summary = await purgeExpiredOperationalData();
    return NextResponse.json(
      { ok: true, ...summary },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Operational data retention failed.", error);
    return NextResponse.json(
      { ok: false, reason: "Operational data retention failed." },
      { status: 500, headers: { "Cache-Control": "no-store", "Retry-After": "3600" } },
    );
  }
}

export const GET = runDataRetention;
export const POST = runDataRetention;
