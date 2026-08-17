import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseAuthPublicConfig } from "@/lib/supabase/auth-config";
import { getSupabaseAuthServerClient } from "@/lib/supabase/auth-server";
import { DEFAULT_ADMIN_AUTH_ROLE, hasAdminRole } from "./policy";
import {
  DEFAULT_ADMIN_SESSION_TTL_SECONDS,
  createAdminSessionToken,
  verifyAdminSessionToken,
} from "./session-token";

export const ADMIN_SESSION_COOKIE_NAME = "aixco_admin_session";
export const ADMIN_SESSION_COOKIE_PATH = "/admin";

const MINIMUM_MIGRATION_PASSWORD_LENGTH = 16;
const MINIMUM_SESSION_SECRET_LENGTH = 32;

export type AdminAuthMode = "identity" | "migration";
export type AdminAuthentication = "supabase-password" | "supabase-mfa" | "legacy-shared-password";

export type AdminPrincipal = {
  id: string;
  email: string | null;
  authentication: AdminAuthentication;
  aal: "aal1" | "aal2" | null;
};

export type AdminAuthFailureReason =
  | "config"
  | "not-authenticated"
  | "not-authorized"
  | "mfa-required";

export type AdminAuthDecision =
  | { ok: true; principal: AdminPrincipal }
  | { ok: false; reason: AdminAuthFailureReason };

type AdminAuthConfig = {
  configured: boolean;
  mode: AdminAuthMode;
  role: string;
  identity: {
    configured: boolean;
    missing: string[];
  };
  legacy: {
    enabled: boolean;
    configured: boolean;
    password: string;
    sessionSecret: string;
    missing: string[];
  };
  missing: string[];
};

function readEnv(name: string) {
  return process.env[name]?.trim() ?? "";
}

function readAdminAuthMode(): { mode: AdminAuthMode; valid: boolean } {
  const value = readEnv("ADMIN_AUTH_MODE");
  if (value === "identity" || value === "migration") return { mode: value, valid: true };

  // Identity is the safe default: an omitted or invalid rollout flag never
  // silently enables the shared-password fallback.
  return { mode: "identity", valid: false };
}

export function getAdminAuthConfig(): AdminAuthConfig {
  const modeResult = readAdminAuthMode();
  const role = readEnv("ADMIN_AUTH_ROLE") || DEFAULT_ADMIN_AUTH_ROLE;
  const supabaseAuth = getSupabaseAuthPublicConfig();
  const password = readEnv("ADMIN_DASHBOARD_PASSWORD");
  const sessionSecret = readEnv("ADMIN_SESSION_SECRET");
  const legacyMissing: string[] = [];

  if (!password) legacyMissing.push("ADMIN_DASHBOARD_PASSWORD");
  if (password && password.length < MINIMUM_MIGRATION_PASSWORD_LENGTH) {
    legacyMissing.push(`ADMIN_DASHBOARD_PASSWORD must be at least ${MINIMUM_MIGRATION_PASSWORD_LENGTH} characters`);
  }
  if (!sessionSecret) legacyMissing.push("ADMIN_SESSION_SECRET");
  if (sessionSecret && sessionSecret.length < MINIMUM_SESSION_SECRET_LENGTH) {
    legacyMissing.push(`ADMIN_SESSION_SECRET must be at least ${MINIMUM_SESSION_SECRET_LENGTH} characters`);
  }

  const legacyConfigured = legacyMissing.length === 0;
  const identityConfigured = supabaseAuth.configured;
  const missing: string[] = [];

  if (!modeResult.valid) missing.push("ADMIN_AUTH_MODE must be identity or migration");
  if (modeResult.mode === "identity") missing.push(...supabaseAuth.missing);
  if (modeResult.mode === "migration" && !identityConfigured && !legacyConfigured) {
    missing.push(...supabaseAuth.missing, ...legacyMissing);
  }

  return {
    configured: modeResult.valid && missing.length === 0,
    mode: modeResult.mode,
    role,
    identity: {
      configured: identityConfigured,
      missing: supabaseAuth.missing,
    },
    legacy: {
      enabled: modeResult.valid && modeResult.mode === "migration",
      configured: legacyConfigured,
      password,
      sessionSecret,
      missing: legacyMissing,
    },
    missing: [...new Set(missing)],
  };
}

export function createAdminSessionCookieValue() {
  const config = getAdminAuthConfig();

  if (!config.configured || !config.legacy.enabled || !config.legacy.configured) {
    throw new Error("Legacy admin migration access is not configured or enabled.");
  }

  return createAdminSessionToken({
    secret: config.legacy.sessionSecret,
    ttlSeconds: DEFAULT_ADMIN_SESSION_TTL_SECONDS,
  });
}

async function getIdentityDecision(config: AdminAuthConfig): Promise<AdminAuthDecision> {
  if (!config.identity.configured) return { ok: false, reason: "not-authenticated" };

  try {
    const supabase = await getSupabaseAuthServerClient();
    const { data, error } = await supabase.auth.getUser();
    const user = data.user;

    if (error || !user) return { ok: false, reason: "not-authenticated" };
    if (!hasAdminRole(user.app_metadata, config.role)) return { ok: false, reason: "not-authorized" };

    const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (
      assurance.error
      || assurance.data.currentLevel !== "aal2"
      || assurance.data.nextLevel !== "aal2"
    ) {
      return { ok: false, reason: "mfa-required" };
    }

    return {
      ok: true,
      principal: {
        id: user.id,
        email: user.email ?? null,
        authentication: "supabase-mfa",
        aal: "aal2",
      },
    };
  } catch {
    return { ok: false, reason: "not-authenticated" };
  }
}

async function getLegacyDecision(config: AdminAuthConfig): Promise<AdminAuthDecision> {
  if (!config.legacy.enabled || !config.legacy.configured) {
    return { ok: false, reason: "not-authenticated" };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!verifyAdminSessionToken(token, config.legacy.sessionSecret)) {
    return { ok: false, reason: "not-authenticated" };
  }

  return {
    ok: true,
    principal: {
      id: "legacy-shared-password",
      email: null,
      authentication: "legacy-shared-password",
      aal: null,
    },
  };
}

export async function getAdminAuthDecision(): Promise<AdminAuthDecision> {
  const config = getAdminAuthConfig();
  if (!config.configured) return { ok: false, reason: "config" };

  const identity = await getIdentityDecision(config);
  if (identity.ok) return identity;

  if (config.mode === "migration") {
    const legacy = await getLegacyDecision(config);
    if (legacy.ok) return legacy;
  }

  return identity;
}

export async function getAal2AdminAuthDecision(): Promise<AdminAuthDecision> {
  const decision = await getAdminAuthDecision();
  if (!decision.ok) return decision;

  if (
    decision.principal.authentication !== "supabase-mfa"
    || decision.principal.aal !== "aal2"
  ) {
    return { ok: false, reason: "mfa-required" };
  }

  return decision;
}

export async function getAdminPrincipal() {
  const decision = await getAdminAuthDecision();
  return decision.ok ? decision.principal : null;
}

export async function hasAdminSession() {
  return (await getAdminAuthDecision()).ok;
}

export async function requireAdminSession() {
  const decision = await getAdminAuthDecision();
  if (!decision.ok) {
    redirect(`/admin/login?error=${decision.reason}`);
  }

  return decision.principal;
}

export async function requireAal2AdminSession() {
  const decision = await getAal2AdminAuthDecision();
  if (!decision.ok) {
    redirect(`/admin/login?error=${decision.reason}`);
  }

  return decision.principal;
}
import "server-only";
