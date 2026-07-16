import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ContactEmailOutboxSummary } from "./contact-email-outbox";
import { sanitizeOperationalError } from "./operational-error";

const WORKER_NAME = "contact-email-deliveries";

type WorkerRuntimeClient = {
  from: (table: "contact_email_worker_runtime") => {
    upsert: (
      values: Record<string, unknown>,
      options: { onConflict: "worker_name" },
    ) => PromiseLike<{ error: { message: string; code?: string } | null }>;
  };
};

async function persistWorkerRuntime(
  values: Record<string, unknown>,
  client?: WorkerRuntimeClient,
) {
  const supabase = client ?? ((await getSupabaseAdminClient()) as unknown as WorkerRuntimeClient);
  const { error } = await supabase.from("contact_email_worker_runtime").upsert(
    { worker_name: WORKER_NAME, ...values },
    { onConflict: "worker_name" },
  );

  if (error) {
    throw new Error(`Could not persist contact worker runtime (${error.code ?? "database_error"}).`);
  }
}

export async function markContactEmailWorkerStarted(
  now = new Date(),
  client?: WorkerRuntimeClient,
) {
  await persistWorkerRuntime({ last_started_at: now.toISOString() }, client);
}

export async function markContactEmailWorkerSucceeded(
  summary: ContactEmailOutboxSummary,
  now = new Date(),
  client?: WorkerRuntimeClient,
) {
  await persistWorkerRuntime(
    {
      last_succeeded_at: now.toISOString(),
      consecutive_failures: 0,
      last_error: null,
      last_summary: summary,
    },
    client,
  );
}

export async function markContactEmailWorkerFailed(
  reason: string,
  now = new Date(),
  client?: WorkerRuntimeClient,
) {
  const safeReason = sanitizeOperationalError(reason, 1000) || "Unknown worker failure.";
  const supabase = client ?? ((await getSupabaseAdminClient()) as unknown as WorkerRuntimeClient);
  const adminClient = supabase as unknown as {
    rpc?: (
      fn: "record_contact_email_worker_failure",
      args: { p_reason: string; p_failed_at: string },
    ) => PromiseLike<{ error: { message: string; code?: string } | null }>;
  };

  if (adminClient.rpc) {
    const { error } = await adminClient.rpc("record_contact_email_worker_failure", {
      p_reason: safeReason,
      p_failed_at: now.toISOString(),
    });
    if (!error) return;
  }

  // Fallback for tests or a briefly mixed application/schema rollout. The
  // migration RPC increments atomically once available.
  await persistWorkerRuntime(
    { last_failed_at: now.toISOString(), last_error: safeReason },
    supabase,
  );
}

export type { WorkerRuntimeClient };
