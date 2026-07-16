import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type Env = Record<string, string | undefined>;

type RuntimeStatusClient = {
  rpc: (
    fn: "contact_delivery_runtime_status",
  ) => PromiseLike<{
    data: {
      schema_version: string;
      queued_count: number;
      failed_count: number;
      delivery_issue_count: number;
      oldest_queued_at: string | null;
      oldest_processing_at: string | null;
      worker_last_started_at: string | null;
      worker_last_succeeded_at: string | null;
      worker_last_failed_at: string | null;
      worker_consecutive_failures: number;
      scheduler_active: boolean;
      scheduler_last_succeeded_at: string | null;
    }[] | null;
    error: { message: string; code?: string } | null;
  }>;
};

export const CONTACT_PIPELINE_SCHEMA_VERSION = "20260715231001";

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

function positiveInteger(env: Env, name: string, fallback: number) {
  const parsed = Number.parseInt(value(env, name), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function ageMinutes(valueToMeasure: string | null, now: Date) {
  if (!valueToMeasure) return null;
  const timestamp = new Date(valueToMeasure).getTime();
  return Number.isFinite(timestamp) ? Math.max(0, (now.getTime() - timestamp) / 60_000) : Number.POSITIVE_INFINITY;
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
    const webhookSecret = value(env, "RESEND_WEBHOOK_SECRET");

    if (!resendApiKey.startsWith("re_") || resendApiKey.length < 8) {
      issues.push("invalid_resend_api_key");
    }
    if (!sender || !validEmail(sender)) issues.push("invalid_notification_sender");
    if (recipients.length === 0 || recipients.some((recipient) => !validEmail(recipient))) {
      issues.push("invalid_notification_recipients");
    }
    if (cronSecret.length < 32) issues.push("weak_cron_secret");
    if (!webhookSecret.startsWith("whsec_") || webhookSecret.length < 16) {
      issues.push("invalid_resend_webhook_secret");
    }
  }

  return { ready: issues.length === 0, issues };
}

export async function getContactPipelineReadiness(
  options: {
    client?: RuntimeStatusClient;
    env?: Env;
    operational?: boolean;
    now?: Date;
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
      operations: { ready: false as const, issues: ["environment_not_ready"] },
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
        operations: { ready: false as const, issues: ["schema_not_ready"] },
      };
    }

    const operationalIssues: string[] = [];
    const now = options.now ?? new Date();
    const env = options.env ?? process.env;
    const maxQueued = positiveInteger(env, "CONTACT_EMAIL_MAX_QUEUED", 50);
    const maxFailed = positiveInteger(env, "CONTACT_EMAIL_MAX_FAILED", 0);
    const maxQueueAgeMinutes = positiveInteger(env, "CONTACT_EMAIL_MAX_QUEUE_AGE_MINUTES", 15);
    const maxProcessingAgeMinutes = positiveInteger(env, "CONTACT_EMAIL_MAX_PROCESSING_AGE_MINUTES", 3);
    const maxHeartbeatAgeMinutes = positiveInteger(env, "CONTACT_EMAIL_MAX_HEARTBEAT_AGE_MINUTES", 15);

    if (status.queued_count > maxQueued) operationalIssues.push("queue_depth_exceeded");
    if (status.failed_count > maxFailed) operationalIssues.push("failed_deliveries_present");
    const queueAge = ageMinutes(status.oldest_queued_at, now);
    if (queueAge !== null && queueAge > maxQueueAgeMinutes) operationalIssues.push("oldest_queue_item_stale");
    const processingAge = ageMinutes(status.oldest_processing_at, now);
    if (processingAge !== null && processingAge > maxProcessingAgeMinutes) operationalIssues.push("processing_lease_stale");
    if (!status.scheduler_active) operationalIssues.push("scheduler_inactive");
    const heartbeatAge = ageMinutes(status.worker_last_succeeded_at, now);
    if (heartbeatAge === null || heartbeatAge > maxHeartbeatAgeMinutes) operationalIssues.push("worker_heartbeat_stale");
    if (status.worker_consecutive_failures > 0) operationalIssues.push("worker_failures_present");

    const operations = {
      ready: operationalIssues.length === 0,
      issues: operationalIssues,
      oldestQueuedAt: status.oldest_queued_at,
      oldestProcessingAt: status.oldest_processing_at,
      workerLastStartedAt: status.worker_last_started_at,
      workerLastSucceededAt: status.worker_last_succeeded_at,
      workerLastFailedAt: status.worker_last_failed_at,
      workerConsecutiveFailures: status.worker_consecutive_failures,
      schedulerActive: status.scheduler_active,
      schedulerLastSucceededAt: status.scheduler_last_succeeded_at,
    };
    const operationalReady = options.operational === false || operations.ready;

    return {
      ready: operationalReady,
      environment,
      schema: {
        ready: true as const,
        version: status.schema_version,
        queued: status.queued_count,
        failed: status.failed_count,
        deliveryIssues: status.delivery_issue_count,
      },
      operations,
    };
  } catch (error) {
    console.error("Contact pipeline schema readiness failed unexpectedly.", error);
    return {
      ready: false as const,
      environment,
      schema: { ready: false as const, version: null, queued: null, failed: null },
      operations: { ready: false as const, issues: ["runtime_status_unavailable"] },
    };
  }
}
