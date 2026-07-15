import { afterEach, describe, expect, it, vi } from "vitest";
import { getSupabaseServerConfig, hasSupabaseServerConfig } from "./server";

describe("Supabase server config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts a server-only publishable key for public content reads", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_example");

    expect(hasSupabaseServerConfig()).toBe(true);
    expect(getSupabaseServerConfig()).toMatchObject({
      supabaseKey: "sb_publishable_example",
      supabaseUrl: "https://example.supabase.co",
    });
  });

  it("keeps the public environment names as a fallback", () => {
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://public.example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_example");

    expect(hasSupabaseServerConfig()).toBe(true);
    expect(getSupabaseServerConfig()).toMatchObject({
      supabaseKey: "sb_publishable_example",
      supabaseUrl: "https://public.example.supabase.co",
    });
  });

  it("does not use the service-role key for published content", () => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_example");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-example");

    expect(hasSupabaseServerConfig()).toBe(false);
    expect(getSupabaseServerConfig()).toBeNull();
  });
});
