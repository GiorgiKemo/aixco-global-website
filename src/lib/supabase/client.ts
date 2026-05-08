import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

let browserClient: SupabaseClient<Database> | null = null;

function getEnvValue(value: string | undefined) {
  return value?.trim() || "";
}

export function hasSupabaseBrowserConfig() {
  if (import.meta.env.MODE === "test") return false;

  return Boolean(
    getEnvValue(import.meta.env.VITE_SUPABASE_URL) &&
      getEnvValue(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY),
  );
}

export async function getSupabaseBrowserClient() {
  const supabaseUrl = getEnvValue(import.meta.env.VITE_SUPABASE_URL);
  const publishableKey = getEnvValue(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

  if (!supabaseUrl || !publishableKey) {
    throw new Error("Supabase browser configuration is missing.");
  }

  if (!browserClient) {
    const { createClient } = await import("@supabase/supabase-js");

    browserClient = createClient<Database>(supabaseUrl, publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return browserClient;
}
