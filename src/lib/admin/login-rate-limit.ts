import "server-only";

import { hashLeadCaptureIdentity } from "@/lib/backend/lead-capture-abuse";
import { getRateLimitClientId } from "@/lib/security/rate-limit";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const ADMIN_LOGIN_RATE_LIMIT = {
  limit: 8,
  windowSeconds: 15 * 60,
} as const;

type DistributedAdminLoginRateLimitResult =
  | { allowed: true }
  | {
      allowed: false;
      retryAfterSeconds: number;
      reason: "rate_limit" | "configuration" | "database";
    };

type AdminLoginRateLimitClient = {
  rpc: (
    fn: "consume_admin_login_rate_limit",
    args: {
      p_client_hash: string;
      p_limit: number;
      p_window_seconds: number;
    },
  ) => PromiseLike<{
    data: { allowed: boolean; retry_after_seconds: number }[] | null;
    error: { message: string; code?: string } | null;
  }>;
};

type AdminLoginRateLimitOptions = {
  client?: AdminLoginRateLimitClient;
  env?: Record<string, string | undefined>;
};

function normalizeForwardedIdentity(value: string | null) {
  return value?.split(",", 1)[0]?.trim().slice(0, 80) || "";
}

/**
 * Vercel and Cloudflare overwrite these platform headers at their trusted edge.
 * In production we deliberately do not fall back to the client-spoofable
 * x-forwarded-for header. A missing edge identity shares one fail-safe bucket.
 */
export function getTrustedAdminLoginClientIdentity(
  headers: Headers,
  env: Record<string, string | undefined> = process.env,
) {
  const vercelIdentity = normalizeForwardedIdentity(headers.get("x-vercel-forwarded-for"));
  if (env.VERCEL === "1") {
    return vercelIdentity ? `vercel:${vercelIdentity}` : "trusted-edge:unavailable";
  }
  if (vercelIdentity) return `vercel:${vercelIdentity}`;

  const cloudflareIdentity = normalizeForwardedIdentity(headers.get("cf-connecting-ip"));
  if (cloudflareIdentity) return `cloudflare:${cloudflareIdentity}`;

  if (env.NODE_ENV === "production") {
    return "trusted-edge:unavailable";
  }

  return `development:${getRateLimitClientId(headers)}`;
}

export async function checkDistributedAdminLoginRateLimit(
  headers: Headers,
  options: AdminLoginRateLimitOptions = {},
): Promise<DistributedAdminLoginRateLimitResult> {
  const env = options.env ?? process.env;
  const clientIdentity = getTrustedAdminLoginClientIdentity(headers, env);
  const clientHash = hashLeadCaptureIdentity(`admin-login:${clientIdentity}`, env);

  if (!clientHash) {
    console.error("Distributed admin login guard requires a strong LEAD_CAPTURE_HASH_SECRET.");
    return { allowed: false, retryAfterSeconds: 60, reason: "configuration" };
  }

  try {
    const client = options.client
      ?? ((await getSupabaseAdminClient()) as unknown as AdminLoginRateLimitClient);
    const { data, error } = await client.rpc("consume_admin_login_rate_limit", {
      p_client_hash: clientHash,
      p_limit: ADMIN_LOGIN_RATE_LIMIT.limit,
      p_window_seconds: ADMIN_LOGIN_RATE_LIMIT.windowSeconds,
    });
    const result = data?.[0];

    if (
      error
      || !result
      || typeof result.allowed !== "boolean"
      || !Number.isFinite(result.retry_after_seconds)
    ) {
      console.error(`Distributed admin login guard failed (${error?.code ?? "invalid_response"}).`);
      return { allowed: false, retryAfterSeconds: 60, reason: "database" };
    }

    if (result.allowed) return { allowed: true };

    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.min(ADMIN_LOGIN_RATE_LIMIT.windowSeconds, Math.ceil(result.retry_after_seconds)),
      ),
      reason: "rate_limit",
    };
  } catch (error) {
    console.error("Distributed admin login guard failed unexpectedly.", error);
    return { allowed: false, retryAfterSeconds: 60, reason: "database" };
  }
}

export type { AdminLoginRateLimitClient, DistributedAdminLoginRateLimitResult };
