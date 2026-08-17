import { NextResponse } from "next/server";
import { z } from "zod";
import { auditAdminLoginAttempt } from "@/lib/admin/audit";
import { getAal2AdminAuthDecision } from "@/lib/admin/auth";
import { checkDistributedLeadCaptureLimit } from "@/lib/backend/lead-capture-abuse";
import { readBoundedJson } from "@/lib/security/request-body";
import { checkRateLimit, getRateLimitClientId } from "@/lib/security/rate-limit";
import { getSupabaseAuthServerClient } from "@/lib/supabase/auth-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const loginAuditSchema = z.object({
  email: z.string().trim().email().max(255).nullable(),
  outcome: z.enum(["success", "failure"]),
  phase: z.enum(["credentials", "authorization", "mfa", "session"]),
  reason: z.string().trim().max(120).optional(),
}).strict();

const headers = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ ok: false }, { status: 415, headers });
  }
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return NextResponse.json({ ok: false }, { status: 403, headers });
  }
  const body = await readBoundedJson(request, 4 * 1024);
  const parsed = body.ok ? loginAuditSchema.safeParse(body.value) : null;
  if (!parsed?.success) {
    return NextResponse.json({ ok: false }, { status: 400, headers });
  }

  let principal;
  if (parsed.data.outcome === "success") {
    if (parsed.data.phase !== "mfa" && parsed.data.phase !== "session") {
      return NextResponse.json({ ok: false }, { status: 400, headers });
    }
    const auth = await getAal2AdminAuthDecision();
    if (!auth.ok) {
      return NextResponse.json({ ok: false }, { status: 401, headers });
    }
    if (auth.principal.authentication === "legacy-shared-password") {
      return NextResponse.json({ ok: false }, { status: 403, headers });
    }
    principal = auth.principal;
  } else {
    // Failed sign-in reports are anonymous and therefore use the shared abuse
    // controls. A verified success is authenticated first and deliberately
    // bypasses these public telemetry buckets so traffic from the same office,
    // VPN, or NAT cannot lock a real administrator out of the dashboard.
    const limit = checkRateLimit({
      key: `admin-login-audit:${getRateLimitClientId(request.headers)}`,
      limit: 20,
      windowMs: 15 * 60_000,
    });
    if (!limit.allowed) {
      return NextResponse.json({ ok: true, stored: false }, { status: 202, headers });
    }

    const distributedGuard = await checkDistributedLeadCaptureLimit(
      "telemetry",
      null,
      request.headers,
    );
    if (!distributedGuard.allowed) {
      return NextResponse.json(
        { ok: true, stored: false },
        { status: 202, headers },
      );
    }
  }

  let stored = false;
  try {
    stored = await auditAdminLoginAttempt({
      ...parsed.data,
      headers: request.headers,
      ...(principal ? { principal } : {}),
    });
  } catch {
    stored = false;
  }

  if (!stored && parsed.data.outcome === "success") {
    try {
      const supabase = await getSupabaseAuthServerClient();
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      // The browser also clears its local Supabase session after this response.
      // Keep the audit failure response fail-closed even if server sign-out is
      // temporarily unavailable.
    }
    return NextResponse.json(
      { ok: false, stored: false, error: "audit_unavailable" },
      { status: 503, headers: { ...headers, "Retry-After": "3" } },
    );
  }

  return NextResponse.json({ ok: true, stored }, { status: 202, headers });
}
