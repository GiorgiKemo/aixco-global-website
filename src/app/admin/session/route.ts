import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_COOKIE_PATH,
  type AdminPrincipal,
  createAdminSessionCookieValue,
  getAdminAuthConfig,
} from "@/lib/admin/auth";
import { auditAdminAction } from "@/lib/admin/audit";
import {
  ADMIN_LOGIN_RATE_LIMIT,
  checkDistributedAdminLoginRateLimit,
} from "@/lib/admin/login-rate-limit";
import { DEFAULT_ADMIN_SESSION_TTL_SECONDS, verifyAdminPassword } from "@/lib/admin/session-token";
import { checkRateLimit, getRateLimitClientId } from "@/lib/security/rate-limit";

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
    limit: ADMIN_LOGIN_RATE_LIMIT.limit,
    windowMs: ADMIN_LOGIN_RATE_LIMIT.windowSeconds * 1_000,
  });

  if (!rateLimit.allowed) {
    return redirectTo(request, "/admin/login?error=rate-limited");
  }

  const distributedRateLimit = await checkDistributedAdminLoginRateLimit(request.headers);
  if (!distributedRateLimit.allowed) {
    if (distributedRateLimit.reason === "rate_limit") {
      return redirectTo(request, "/admin/login?error=rate-limited");
    }

    return new NextResponse("Admin sign-in is temporarily unavailable.", {
      status: 503,
      headers: { "Retry-After": String(distributedRateLimit.retryAfterSeconds) },
    });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return redirectTo(request, "/admin/login?error=invalid");
  }

  const password = String(formData.get("password") ?? "");
  const principal: AdminPrincipal = {
    id: "legacy-shared-password",
    email: null,
    authentication: "legacy-shared-password",
    aal: null,
  };

  if (!verifyAdminPassword(password, config.legacy.password, config.legacy.sessionSecret)) {
    await auditAdminAction({
      action: "admin.login",
      actor: principal,
      outcome: "failure",
      details: { migrationMode: true, reason: "invalid_credentials" },
      headers: request.headers,
    });
    return redirectTo(request, "/admin/login?error=invalid");
  }

  // Legacy shared-password access exists only to complete the identity rollout.
  // Analytics itself requires a verified Supabase AAL2 principal.
  const response = redirectTo(request, "/admin/identity-migration");
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE_NAME,
    value: createAdminSessionCookieValue(),
    httpOnly: true,
    sameSite: "strict",
    secure: getSecureCookieSetting(),
    path: ADMIN_SESSION_COOKIE_PATH,
    maxAge: DEFAULT_ADMIN_SESSION_TTL_SECONDS,
  });

  await auditAdminAction({
    action: "admin.login",
    actor: principal,
    outcome: "success",
    details: { migrationMode: true },
    headers: request.headers,
  });

  return response;
}
