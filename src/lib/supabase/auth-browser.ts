"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { getSupabaseAuthPublicConfig } from "./auth-config";

let authBrowserClient: SupabaseClient<Database> | null = null;

export function getSupabaseAuthBrowserClient() {
  const config = getSupabaseAuthPublicConfig();

  if (!config.configured) {
    throw new Error(`Supabase Auth is missing: ${config.missing.join(", ")}.`);
  }

  if (!authBrowserClient) {
    authBrowserClient = createBrowserClient<Database>(config.supabaseUrl, config.publishableKey);
  }

  return authBrowserClient;
}
