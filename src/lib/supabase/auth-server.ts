import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";
import { getSupabaseAuthPublicConfig } from "./auth-config";

export async function getSupabaseAuthServerClient() {
  const config = getSupabaseAuthPublicConfig();

  if (!config.configured) {
    throw new Error(`Supabase Auth is missing: ${config.missing.join(", ")}.`);
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(config.supabaseUrl, config.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies. The admin proxy refreshes
          // sessions before protected pages render, so this is safe there.
        }
      },
    },
  });
}
