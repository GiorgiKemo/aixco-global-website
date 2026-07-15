import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";
import { getSupabaseAuthPublicConfig } from "./auth-config";

/** Refreshes the cookie-backed Supabase session for admin requests. */
export async function refreshSupabaseAuthSession(request: NextRequest) {
  const config = getSupabaseAuthPublicConfig();
  if (!config.configured) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient<Database>(config.supabaseUrl, config.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // getClaims validates the access token and refreshes it when necessary.
  await supabase.auth.getClaims();
  return response;
}
