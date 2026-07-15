import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type Env = Record<string, string | undefined>;

type RuntimeStatusClient = {
  rpc: (
    fn: "contact_delivery_runtime_status",
  ) => PromiseLike<{
    data: { schema_version: string; queued_count: number; failed_count: number }[] | null;
    error: { message: string; code?: string } | null;
  }>;
};

export const CONTACT_PIPELINE_SCHEMA_VERSION = "20260715125925";

function value(env: Env, name: string) {
  return env[name]?.trim() ?? "";
}

function firstValue(env: Env, names: string[]) {
  return names.map((name) => value(env, name)).find(Boolean) ?? "";
}

function extractEmail(address: string) {
  const bracketed = address.match(/<([^<>]+)>\s*$/)?.[1] ?? address;
  return bracketed.trim();
}

function validEmail(address: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(extractEmail(address));
}

export function getContactPipelineEnvironmentReadiness(
  env: Env = process.env,
  options: { worker?: boolean } = {},
) {
  const issues: string[] = [];
  const supabaseUrl = firstValue(env, ["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"]);
  const supabaseSecret = firstValue(env, ["SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY"]);
  const hashSecret = value(env, "LEAD_CAPTURE_HASH_SECRET");

  if (!supabaseUrl) issues.push("missing_supabase_url");
  else {
    try {
      const parsed = new URL(supabaseUrl);
      if (parsed.protocol !== "https:" && env.NODE_ENV === "production") {
        issues.push("invalid_supabase_url");
      }
    } catch {
      issues.push("invalid_supabase_url");
    }
  }
  if (!supabaseSecret) issues.push("missing_supabase_secret");
  if (hashSecret.length < 32) issues.push("weak_lead_capture_hash_secret");

  if (options.worker) {
    const resendApiKey = value(env, "RESEND_API_KEY");
    const sender = value(env, "LEAD_NOTIFICATION_FROM");
    const recipients = value(env, "LEAD_NOTIFICATION_TO")
      .split(",")
      .map((recipient) => recipient.trim())
      .filter(Boolean);
    const cronSecret = value(env, "CRON_SECRET");

    if (!resendApiKey.startsWith("re_") || resendApiKey.length < 8) {
      issues.push("invalid_resend_api_key");
    }
    if (!sender || !validEmail(sender)) issues.push("invalid_notification_sender");
    if (recipients.length === 0 || recipients.some((recipient) => !validEmail(recipient))) {
      issues.push("invalid_notification_recipients");
    }
    if (cronSecret.length < 32) issues.push("weak_cron_secret");
  }

  return { ready: issues.length === 0, issues };
}

export async function getContactPipelineReadiness(
  options: {
    client?: RuntimeStatusClient;
    env?: Env;
  } = {},
) {
  const environment = getContactPipelineEnvironmentReadiness(options.env ?? process.env, {
    worker: true,
  });
  if (!environment.ready) {
    return {
      ready: false as const,
      environment,
      schema: { ready: false as const, version: null, queued: null, failed: null },
    };
  }

  try {
    const client = (options.client ?? (await getSupabaseAdminClient())) as unknown as RuntimeStatusClient;
    const { data, error } = await client.rpc("contact_delivery_runtime_status");
    const status = data?.[0];

    if (error || !status || status.schema_version !== CONTACT_PIPELINE_SCHEMA_VERSION) {
      console.error(`Contact pipeline schema readiness failed (${error?.code ?? "version_mismatch"}).`);
      return {
        ready: false as const,
        environment,
        schema: {
          ready: false as const,
          version: status?.schema_version ?? null,
          queued: status?.queued_count ?? null,
          failed: status?.failed_count ?? null,
        },
      };
    }

    return {
      ready: true as const,
      environment,
      schema: {
        ready: true as const,
        version: status.schema_version,
        queued: status.queued_count,
        failed: status.failed_count,
      },
    };
  } catch (error) {
    console.error("Contact pipeline schema readiness failed unexpectedly.", error);
    return {
      ready: false as const,
      environment,
      schema: { ready: false as const, version: null, queued: null, failed: null },
    };
  }
}
