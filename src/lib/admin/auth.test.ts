import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createAdminSessionToken } from "./session-token";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  getAssurance: vi.fn(),
  cookieGet: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: mocks.cookieGet })),
}));

vi.mock("@/lib/supabase/auth-server", () => ({
  getSupabaseAuthServerClient: vi.fn(async () => ({
    auth: {
      getUser: mocks.getUser,
      mfa: { getAuthenticatorAssuranceLevel: mocks.getAssurance },
    },
  })),
}));

import { getAdminAuthConfig, getAdminAuthDecision } from "./auth";

const ENV_KEYS = [
  "ADMIN_AUTH_MODE",
  "ADMIN_AUTH_ROLE",
  "ADMIN_DASHBOARD_PASSWORD",
  "ADMIN_SESSION_SECRET",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

const originalEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

function setIdentityEnvironment() {
  process.env.ADMIN_AUTH_MODE = "identity";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_example";
}

beforeEach(() => {
  ENV_KEYS.forEach((key) => delete process.env[key]);
  mocks.getUser.mockReset();
  mocks.getAssurance.mockReset();
  mocks.cookieGet.mockReset();
});

afterAll(() => {
  ENV_KEYS.forEach((key) => {
    const value = originalEnv[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  });
});

describe("admin auth rollout configuration", () => {
  it("fails closed when ADMIN_AUTH_MODE is not explicitly set", () => {
    process.env.ADMIN_DASHBOARD_PASSWORD = "a-long-temporary-password";
    process.env.ADMIN_SESSION_SECRET = "0123456789abcdef0123456789abcdef";

    const config = getAdminAuthConfig();

    expect(config.configured).toBe(false);
    expect(config.mode).toBe("identity");
    expect(config.legacy.enabled).toBe(false);
    expect(config.missing).toContain("ADMIN_AUTH_MODE must be identity or migration");
  });

  it("configures identity-only mode without legacy credentials", () => {
    setIdentityEnvironment();

    const config = getAdminAuthConfig();

    expect(config.configured).toBe(true);
    expect(config.identity.configured).toBe(true);
    expect(config.legacy.enabled).toBe(false);
  });

  it("only enables shared-password access in explicit migration mode", () => {
    process.env.ADMIN_AUTH_MODE = "migration";
    process.env.ADMIN_DASHBOARD_PASSWORD = "a-long-temporary-password";
    process.env.ADMIN_SESSION_SECRET = "0123456789abcdef0123456789abcdef";

    const config = getAdminAuthConfig();

    expect(config.configured).toBe(true);
    expect(config.legacy.enabled).toBe(true);
    expect(config.legacy.configured).toBe(true);
  });

  it("rejects weak migration credentials", () => {
    process.env.ADMIN_AUTH_MODE = "migration";
    process.env.ADMIN_DASHBOARD_PASSWORD = "short";
    process.env.ADMIN_SESSION_SECRET = "also-short";

    const config = getAdminAuthConfig();

    expect(config.configured).toBe(false);
    expect(config.legacy.configured).toBe(false);
    expect(config.missing.join(" ")).toContain("at least 16 characters");
    expect(config.missing.join(" ")).toContain("at least 32 characters");
  });
});

describe("admin identity authorization", () => {
  it("requires a signed-in admin role at AAL2", async () => {
    setIdentityEnvironment();
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "admin-id", email: "admin@aixco.global", app_metadata: { role: "admin" } } },
      error: null,
    });
    mocks.getAssurance.mockResolvedValue({
      data: { currentLevel: "aal2", nextLevel: "aal2" },
      error: null,
    });

    await expect(getAdminAuthDecision()).resolves.toEqual({
      ok: true,
      principal: {
        id: "admin-id",
        email: "admin@aixco.global",
        authentication: "supabase-mfa",
        aal: "aal2",
      },
    });
  });

  it("does not authorize a role stored only in user-editable metadata", async () => {
    setIdentityEnvironment();
    mocks.getUser.mockResolvedValue({
      data: {
        user: {
          id: "visitor-id",
          email: "visitor@example.com",
          app_metadata: {},
          user_metadata: { role: "admin" },
        },
      },
      error: null,
    });

    await expect(getAdminAuthDecision()).resolves.toEqual({ ok: false, reason: "not-authorized" });
    expect(mocks.getAssurance).not.toHaveBeenCalled();
  });

  it("rejects an admin identity until TOTP upgrades the session to AAL2", async () => {
    setIdentityEnvironment();
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "admin-id", email: "admin@aixco.global", app_metadata: { roles: ["admin"] } } },
      error: null,
    });
    mocks.getAssurance.mockResolvedValue({
      data: { currentLevel: "aal1", nextLevel: "aal2" },
      error: null,
    });

    await expect(getAdminAuthDecision()).resolves.toEqual({ ok: false, reason: "mfa-required" });
  });

  it("accepts a valid legacy token only during migration mode", async () => {
    const sessionSecret = "0123456789abcdef0123456789abcdef";
    process.env.ADMIN_AUTH_MODE = "migration";
    process.env.ADMIN_DASHBOARD_PASSWORD = "a-long-temporary-password";
    process.env.ADMIN_SESSION_SECRET = sessionSecret;
    mocks.cookieGet.mockReturnValue({
      value: createAdminSessionToken({ secret: sessionSecret, ttlSeconds: 60 }),
    });

    await expect(getAdminAuthDecision()).resolves.toMatchObject({
      ok: true,
      principal: { authentication: "legacy-shared-password" },
    });
  });
});
