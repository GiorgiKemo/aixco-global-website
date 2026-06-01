import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const ADMIN_CLIENT_KEY = "__AIXCO_SUPABASE_ADMIN_CLIENT__";

type AdminClientGlobal = typeof globalThis & {
  [ADMIN_CLIENT_KEY]?: SupabaseClient<Database>;
};

let adminClient: SupabaseClient<Database> | null = null;

function getEnvValue(value: string | undefined) {
  return value?.trim() || "";
}

export function getSupabaseAdminConfig() {
  const supabaseUrl = getEnvValue(process.env.SUPABASE_URL) || getEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const secretKey = getEnvValue(process.env.SUPABASE_SECRET_KEY) || getEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const missing: string[] = [];

  if (!supabaseUrl) missing.push("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL");
  if (!secretKey) missing.push("SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY");

  return {
    configured: missing.length === 0,
    supabaseUrl,
    secretKey,
    missing,
  };
}

export async function getSupabaseAdminClient() {
  const config = getSupabaseAdminConfig();

  if (!config.configured) {
    throw new Error(`Supabase admin configuration is missing: ${config.missing.join(", ")}.`);
  }

  const globalClient = (globalThis as AdminClientGlobal)[ADMIN_CLIENT_KEY];
  if (globalClient) {
    adminClient = globalClient;
  }

  if (!adminClient) {
    const { createClient } = await import("@supabase/supabase-js");

    adminClient = createClient<Database>(config.supabaseUrl, config.secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    (globalThis as AdminClientGlobal)[ADMIN_CLIENT_KEY] = adminClient;
  }

  return adminClient;
}
