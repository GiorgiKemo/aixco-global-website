export type SupabaseAuthPublicConfig = {
  configured: boolean;
  supabaseUrl: string;
  publishableKey: string;
  missing: string[];
};

function clean(value: string | undefined) {
  return value?.trim() ?? "";
}

/**
 * Browser-safe Supabase Auth configuration.
 *
 * Admin identity sessions must use the publishable key. A secret/service-role
 * key is intentionally never accepted here because this config is consumed by
 * browser code and by the cookie-based SSR client.
 */
export function getSupabaseAuthPublicConfig(): SupabaseAuthPublicConfig {
  const supabaseUrl = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey = clean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  const missing: string[] = [];

  if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!publishableKey) missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  return {
    configured: missing.length === 0,
    supabaseUrl,
    publishableKey,
    missing,
  };
}
