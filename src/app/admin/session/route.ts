import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_COOKIE_PATH,
  type AdminPrincipal,
  createAdminSessionCookieValue,
  getAdminAuthConfig,
} from "@/lib/admin/auth";
import { auditAdminAction } from "@/lib/admin/audit";
import { DEFAULT_ADMIN_SESSION_TTL_SECONDS, verifyAdminPassword } from "@/lib/admin/session-token";
import { checkRateLimit, getRateLimitClientId } from "@/lib/security/rate-limit";

const ADMIN_LOGIN_RATE_LIMIT = {
  limit: 8,
  windowMs: 15 * 60_000,
};

function getSecureCookieSetting() {
  return process.env.VERCEL === "1" || process.env.ADMIN_COOKIE_SECURE === "true";
}

function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}

export async function POST(request: Request) {
  const config = getAdminAuthConfig();
  if (!config.configured || !config.legacy.enabled || !config.legacy.configured) {
    return redirectTo(request, "/admin/login?error=config");
  }

  const requestOrigin = request.headers.get("origin");
  if (requestOrigin && requestOrigin !== new URL(request.url).origin) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const rateLimit = checkRateLimit({
    key: `admin-login:${getRateLimitClientId(request.headers)}`,
    ...ADMIN_LOGIN_RATE_LIMIT,
  });

  if (!rateLimit.allowed) {
    return redirectTo(request, "/admin/login?error=rate-limited");
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return redirectTo(request, "/admin/login?error=invalid");
  }

  const password = String(formData.get("password") ?? "");

  if (!verifyAdminPassword(password, config.legacy.password, config.legacy.sessionSecret)) {
    return redirectTo(request, "/admin/login?error=invalid");
  }

  const response = redirectTo(request, "/admin/leads");
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE_NAME,
    value: createAdminSessionCookieValue(),
    httpOnly: true,
    sameSite: "strict",
    secure: getSecureCookieSetting(),
    path: ADMIN_SESSION_COOKIE_PATH,
    maxAge: DEFAULT_ADMIN_SESSION_TTL_SECONDS,
  });

  const principal: AdminPrincipal = {
    id: "legacy-shared-password",
    email: null,
    authentication: "legacy-shared-password",
    aal: null,
  };
  auditAdminAction({
    action: "admin.login",
    actor: principal,
    outcome: "success",
    details: { migrationMode: true },
  });

  return response;
}
