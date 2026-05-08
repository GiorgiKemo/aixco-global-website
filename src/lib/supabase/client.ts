import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const BROWSER_CLIENT_KEY = "__AIXCO_SUPABASE_BROWSER_CLIENT__";

type BrowserClientGlobal = typeof globalThis & {
  [BROWSER_CLIENT_KEY]?: SupabaseClient<Database>;
};

let browserClient: SupabaseClient<Database> | null = null;

function getEnvValue(value: string | undefined) {
  return value?.trim() || "";
}

export function hasSupabaseBrowserConfig() {
  if (process.env.NODE_ENV === "test" || process.env.VITEST === "true") return false;

  return Boolean(
    getEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      getEnvValue(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  );
}

export async function getSupabaseBrowserClient() {
  const supabaseUrl = getEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey = getEnvValue(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  if (!supabaseUrl || !publishableKey) {
    throw new Error("Supabase browser configuration is missing.");
  }

  const globalClient = (globalThis as BrowserClientGlobal)[BROWSER_CLIENT_KEY];
  if (globalClient) {
    browserClient = globalClient;
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
    (globalThis as BrowserClientGlobal)[BROWSER_CLIENT_KEY] = browserClient;
  }

  return browserClient;
}
