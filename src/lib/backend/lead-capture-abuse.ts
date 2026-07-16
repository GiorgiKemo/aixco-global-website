import "server-only";
import { createHmac } from "node:crypto";
import { contactSubmissionSchema } from "./lead-capture-contracts";
import { getRateLimitClientId } from "@/lib/security/rate-limit";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type LeadCaptureResource = "contact" | "chat" | "portal-event" | "telemetry";

type GuardResult =
  | { allowed: true }
  | {
      allowed: false;
      retryAfterSeconds: number;
      reason: "client_rate_limit" | "recipient_cooldown" | "configuration" | "database";
    };

type AbuseClient = {
  rpc: (
    fn: "record_lead_capture_attempt",
    args: {
      p_resource: string;
      p_client_hash: string;
      p_recipient_hash: string | null;
      p_client_limit: number;
      p_client_window_seconds: number;
      p_recipient_limit: number;
      p_recipient_window_seconds: number;
    },
  ) => PromiseLike<{
    data: { allowed: boolean; reason: string | null; retry_after_seconds: number }[] | null;
    error: { message: string; code?: string } | null;
  }>;
};

type GuardOptions = {
  client?: AbuseClient;
  env?: Record<string, string | undefined>;
};

const rules: Record<
  LeadCaptureResource,
  {
    clientLimit: number;
    clientWindowSeconds: number;
    recipientLimit: number;
    recipientWindowSeconds: number;
  }
> = {
  contact: {
    clientLimit: 5,
    clientWindowSeconds: 10 * 60,
    recipientLimit: 2,
    recipientWindowSeconds: 60 * 60,
  },
  chat: {
    clientLimit: 60,
    clientWindowSeconds: 10 * 60,
    recipientLimit: 0,
    recipientWindowSeconds: 60,
  },
  "portal-event": {
    clientLimit: 60,
    clientWindowSeconds: 10 * 60,
    recipientLimit: 0,
    recipientWindowSeconds: 60,
  },
  telemetry: {
    clientLimit: 120,
    clientWindowSeconds: 10 * 60,
    recipientLimit: 0,
    recipientWindowSeconds: 60,
  },
};

function getHashSecret(env: Record<string, string | undefined>) {
  const configured = env.LEAD_CAPTURE_HASH_SECRET?.trim() ?? "";
  if (configured.length >= 32) return configured;
  if (env.NODE_ENV === "production") return null;
  return "aixco-development-only-abuse-hash-secret";
}

function hashIdentity(secret: string, identity: string) {
  return createHmac("sha256", secret).update(identity).digest("hex");
}

export function hashLeadCaptureIdentity(
  identity: string,
  env: Record<string, string | undefined> = process.env,
) {
  const secret = getHashSecret(env);
  return secret ? hashIdentity(secret, identity) : null;
}

function getRecipient(payload: unknown) {
  const parsed = contactSubmissionSchema.safeParse(payload);
  return parsed.success ? parsed.data.email.trim().toLowerCase() : null;
}

export async function checkDistributedLeadCaptureLimit(
  resource: LeadCaptureResource,
  payload: unknown,
  headers: Headers,
  options: GuardOptions = {},
): Promise<GuardResult> {
  const env = options.env ?? process.env;
  const secret = getHashSecret(env);
  if (!secret) {
    console.error("LEAD_CAPTURE_HASH_SECRET must contain at least 32 characters in production.");
    return { allowed: false, retryAfterSeconds: 60, reason: "configuration" };
  }

  const clientIdentity = getRateLimitClientId(headers);
  const recipient = resource === "contact" ? getRecipient(payload) : null;

  // Invalid contact payloads are rejected by schema validation without consuming a
  // recipient cooldown. The existing local limiter still protects malformed floods.
  if (resource === "contact" && !recipient) return { allowed: true };

  try {
    const rule = rules[resource];
    const client = (options.client ?? (await getSupabaseAdminClient())) as unknown as AbuseClient;
    const { data, error } = await client.rpc("record_lead_capture_attempt", {
      p_resource: resource,
      p_client_hash: hashIdentity(secret, `client:${clientIdentity}`),
      p_recipient_hash: recipient ? hashIdentity(secret, `recipient:${recipient}`) : null,
      p_client_limit: rule.clientLimit,
      p_client_window_seconds: rule.clientWindowSeconds,
      p_recipient_limit: rule.recipientLimit,
      p_recipient_window_seconds: rule.recipientWindowSeconds,
    });

    if (error || !data?.[0]) {
      console.error(`Distributed lead capture guard failed (${error?.code ?? "invalid_response"}).`);
      return { allowed: false, retryAfterSeconds: 60, reason: "database" };
    }

    const result = data[0];
    if (result.allowed) return { allowed: true };

    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, result.retry_after_seconds || 1),
      reason: result.reason === "recipient_cooldown" ? "recipient_cooldown" : "client_rate_limit",
    };
  } catch (error) {
    console.error("Distributed lead capture guard failed unexpectedly.", error);
    return { allowed: false, retryAfterSeconds: 60, reason: "database" };
  }
}
