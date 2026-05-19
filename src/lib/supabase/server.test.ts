import { afterEach, describe, expect, it, vi } from "vitest";
import { getSupabaseServerConfig, hasSupabaseServerConfig } from "./server";

describe("Supabase server config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts server-only Supabase environment variables for API routes", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_example");

    expect(hasSupabaseServerConfig()).toBe(true);
    expect(getSupabaseServerConfig()).toMatchObject({
      supabaseKey: "sb_secret_example",
      supabaseUrl: "https://example.supabase.co",
    });
  });

  it("keeps the public environment names as a fallback", () => {
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://public.example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_example");

    expect(hasSupabaseServerConfig()).toBe(true);
    expect(getSupabaseServerConfig()).toMatchObject({
      supabaseKey: "sb_publishable_example",
      supabaseUrl: "https://public.example.supabase.co",
    });
  });
});
