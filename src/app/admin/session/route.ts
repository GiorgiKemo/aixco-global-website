import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_COOKIE_PATH,
  createAdminSessionCookieValue,
  getAdminAuthConfig,
} from "@/lib/admin/auth";
import { DEFAULT_ADMIN_SESSION_TTL_SECONDS, verifyAdminPassword } from "@/lib/admin/session-token";

function getSecureCookieSetting() {
  return process.env.VERCEL === "1" || process.env.ADMIN_COOKIE_SECURE === "true";
}

function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}

export async function POST(request: Request) {
  const config = getAdminAuthConfig();
  if (!config.configured) {
    return redirectTo(request, "/admin/login?error=config");
  }

  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");

  if (!verifyAdminPassword(password, config.password, config.sessionSecret)) {
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

  return response;
}
