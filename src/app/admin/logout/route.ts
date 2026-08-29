import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_COOKIE_PATH,
  getAdminAuthDecision,
} from "@/lib/admin/auth";
import { auditAdminAction } from "@/lib/admin/audit";
import { getSupabaseAuthPublicConfig } from "@/lib/supabase/auth-config";
import { getSupabaseAuthServerClient } from "@/lib/supabase/auth-server";

function getSecureCookieSetting() {
  return (
    process.env.VERCEL === "1"
    || process.env.NODE_ENV === "production"
    || process.env.ADMIN_COOKIE_SECURE === "true"
  );
}

function clearLegacySession(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure: getSecureCookieSetting(),
    path: ADMIN_SESSION_COOKIE_PATH,
    maxAge: 0,
  });
  return response;
}

export function GET() {
  return NextResponse.json({ ok: false, error: "method-not-allowed" }, { status: 405, headers: { Allow: "POST" } });
}

export async function POST(request: Request) {
  const requestOrigin = request.headers.get("origin");
  if (requestOrigin && requestOrigin !== new URL(request.url).origin) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const decision = await getAdminAuthDecision();
  if (getSupabaseAuthPublicConfig().configured) {
    try {
      const supabase = await getSupabaseAuthServerClient();
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      // The legacy cookie is still cleared below. Expired or unavailable
      // Supabase sessions do not need to block local sign-out.
    }
  }

  if (decision.ok) {
    await auditAdminAction({
      action: "admin.logout",
      actor: decision.principal,
      outcome: "success",
      headers: request.headers,
    });
  }

  return clearLegacySession(request);
}
