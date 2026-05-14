import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  DEFAULT_ADMIN_SESSION_TTL_SECONDS,
  createAdminSessionToken,
  verifyAdminSessionToken,
} from "@/lib/admin/session-token";

export const ADMIN_SESSION_COOKIE_NAME = "aixco_admin_session";
export const ADMIN_SESSION_COOKIE_PATH = "/admin";

type AdminAuthConfig = {
  configured: boolean;
  password: string;
  sessionSecret: string;
  missing: string[];
};

function readEnv(name: string) {
  return process.env[name]?.trim() ?? "";
}

export function getAdminAuthConfig(): AdminAuthConfig {
  const password = readEnv("ADMIN_DASHBOARD_PASSWORD");
  const sessionSecret = readEnv("ADMIN_SESSION_SECRET");
  const missing: string[] = [];

  if (!password) missing.push("ADMIN_DASHBOARD_PASSWORD");
  if (!sessionSecret) missing.push("ADMIN_SESSION_SECRET");
  if (sessionSecret && sessionSecret.length < 32) missing.push("ADMIN_SESSION_SECRET must be at least 32 characters");

  return {
    configured: missing.length === 0,
    password,
    sessionSecret,
    missing,
  };
}

export function createAdminSessionCookieValue() {
  const config = getAdminAuthConfig();

  if (!config.configured) {
    throw new Error("Admin dashboard authentication is not configured.");
  }

  return createAdminSessionToken({
    secret: config.sessionSecret,
    ttlSeconds: DEFAULT_ADMIN_SESSION_TTL_SECONDS,
  });
}

export async function hasAdminSession() {
  const config = getAdminAuthConfig();
  if (!config.configured) return false;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  return verifyAdminSessionToken(token, config.sessionSecret);
}

export async function requireAdminSession() {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }
}
