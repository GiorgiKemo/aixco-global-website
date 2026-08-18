import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createAdminSessionToken } from "./session-token";
import { createTrustedDeviceToken } from "./trusted-device";

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

import { getAal2AdminAuthDecision, getAdminAuthConfig, getAdminAuthDecision } from "./auth";

const ENV_KEYS = [
  "ADMIN_AUTH_MODE",
  "ADMIN_AUTH_ROLE",
  "ADMIN_REQUIRE_MFA",
  "ADMIN_DASHBOARD_PASSWORD",
  "ADMIN_SESSION_SECRET",
  "ADMIN_TRUSTED_DEVICE_SECRET",
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
  it("authorizes a signed-in admin role and preserves AAL2 when available", async () => {
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

  it("authorizes an admin identity at AAL1 when MFA is not enabled", async () => {
    setIdentityEnvironment();
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "admin-id", email: "admin@aixco.global", app_metadata: { roles: ["admin"] } } },
      error: null,
    });
    mocks.getAssurance.mockResolvedValue({
      data: { currentLevel: "aal1", nextLevel: "aal2" },
      error: null,
    });

    await expect(getAdminAuthDecision()).resolves.toEqual({
      ok: true,
      principal: {
        id: "admin-id",
        email: "admin@aixco.global",
        authentication: "supabase-password",
        aal: "aal1",
      },
    });
  });

  it("keeps a named admin authorized when a previous AAL2 session falls back to AAL1", async () => {
    setIdentityEnvironment();
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "admin-id", email: "admin@aixco.global", app_metadata: { role: "admin" } } },
      error: null,
    });
    mocks.getAssurance.mockResolvedValue({
      data: { currentLevel: "aal2", nextLevel: "aal1" },
      error: null,
    });

    await expect(getAdminAuthDecision()).resolves.toMatchObject({
      ok: true,
      principal: { authentication: "supabase-password", aal: "aal1" },
    });
  });

  it.each([
    ["is absent", undefined],
    ["is false", "false"],
  ])("does not make MFA mandatory when ADMIN_REQUIRE_MFA %s", async (_label, flag) => {
    setIdentityEnvironment();
    if (flag === undefined) delete process.env.ADMIN_REQUIRE_MFA;
    else process.env.ADMIN_REQUIRE_MFA = flag;
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "admin-id", email: "admin@aixco.global", app_metadata: { role: "admin" } } },
      error: null,
    });
    mocks.getAssurance.mockResolvedValue({
      data: { currentLevel: "aal1", nextLevel: "aal1" },
      error: null,
    });

    await expect(getAdminAuthDecision()).resolves.toMatchObject({
      ok: true,
      principal: { authentication: "supabase-password", aal: "aal1" },
    });
    await expect(getAal2AdminAuthDecision()).resolves.toMatchObject({
      ok: true,
      principal: { authentication: "supabase-password", aal: "aal1" },
    });
    expect(mocks.getAssurance).toHaveBeenCalledTimes(2);
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

  it("keeps the legacy migration session out of protected admin tools", async () => {
    const sessionSecret = "0123456789abcdef0123456789abcdef";
    process.env.ADMIN_AUTH_MODE = "migration";
    process.env.ADMIN_DASHBOARD_PASSWORD = "a-long-temporary-password";
    process.env.ADMIN_SESSION_SECRET = sessionSecret;
    mocks.cookieGet.mockReturnValue({
      value: createAdminSessionToken({ secret: sessionSecret, ttlSeconds: 60 }),
    });

    await expect(getAal2AdminAuthDecision()).resolves.toEqual({ ok: false, reason: "not-authorized" });
  });

  it("accepts a verified admin identity through the compatibility helper", async () => {
    setIdentityEnvironment();
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "admin-id", email: "admin@aixco.global", app_metadata: { role: "admin" } } },
      error: null,
    });
    mocks.getAssurance.mockResolvedValue({
      data: { currentLevel: "aal2", nextLevel: "aal2" },
      error: null,
    });

    await expect(getAal2AdminAuthDecision()).resolves.toMatchObject({
      ok: true,
      principal: {
        id: "admin-id",
        authentication: "supabase-mfa",
        aal: "aal2",
      },
    });
  });

  it("accepts a named admin at AAL1 without relying on a trusted-device cookie", async () => {
    const trustedSecret = "trusted-device-auth-test-secret-01234567890123456789";
    setIdentityEnvironment();
    process.env.ADMIN_TRUSTED_DEVICE_SECRET = trustedSecret;
    const token = createTrustedDeviceToken("admin-id", trustedSecret);
    mocks.cookieGet.mockReturnValue({ value: token });
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "admin-id", email: "admin@aixco.global", app_metadata: { role: "admin" } } },
      error: null,
    });
    mocks.getAssurance.mockResolvedValue({
      data: { currentLevel: "aal1", nextLevel: "aal2" },
      error: null,
    });

    await expect(getAdminAuthDecision()).resolves.toMatchObject({
      ok: true,
      principal: { id: "admin-id", authentication: "supabase-password", aal: "aal1" },
    });
    await expect(getAal2AdminAuthDecision()).resolves.toMatchObject({
      ok: true,
      principal: { authentication: "supabase-password", aal: "aal1" },
    });
  });
});
