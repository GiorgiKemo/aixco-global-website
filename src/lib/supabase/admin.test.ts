import { afterEach, describe, expect, it, vi } from "vitest";
import { getSupabaseAdminConfig } from "./admin";

describe("Supabase admin config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts the preferred server-only secret key", () => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_example");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    expect(getSupabaseAdminConfig()).toMatchObject({
      configured: true,
      secretKey: "sb_secret_example",
      supabaseUrl: "https://example.supabase.co",
    });
  });

  it("accepts the service role key alias used by existing Supabase projects", () => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service_role_example");

    expect(getSupabaseAdminConfig()).toMatchObject({
      configured: true,
      secretKey: "service_role_example",
    });
  });

  it("reports the supported key names when admin credentials are missing", () => {
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    expect(getSupabaseAdminConfig()).toMatchObject({
      configured: false,
      missing: ["SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY"],
    });
  });
});
