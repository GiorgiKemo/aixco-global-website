import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const SERVER_CLIENT_KEY = "__AIXCO_SUPABASE_SERVER_CLIENT__";

type ServerClientGlobal = typeof globalThis & {
  [SERVER_CLIENT_KEY]?: SupabaseClient<Database>;
};

let serverClient: SupabaseClient<Database> | null = null;

function getEnvValue(value: string | undefined) {
  return value?.trim() || "";
}

export function hasSupabaseServerConfig() {
  return Boolean(
    getEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      getEnvValue(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  );
}

export async function getSupabaseServerClient() {
  const supabaseUrl = getEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey = getEnvValue(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  if (!supabaseUrl || !publishableKey) {
    throw new Error("Supabase server configuration is missing.");
  }

  const globalClient = (globalThis as ServerClientGlobal)[SERVER_CLIENT_KEY];
  if (globalClient) {
    serverClient = globalClient;
  }

  if (!serverClient) {
    const { createClient } = await import("@supabase/supabase-js");

    serverClient = createClient<Database>(supabaseUrl, publishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    (globalThis as ServerClientGlobal)[SERVER_CLIENT_KEY] = serverClient;
  }

  return serverClient;
}
