import { z } from "zod";
import type { Json } from "@/lib/supabase/database.types";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  sendContactConfirmationEmail,
  sendContactLeadNotificationEmail,
  type ContactLeadNotification,
  type EmailProviderDeliveryResult,
} from "./lead-notification-email";

type DeliveryChannel = "lead_notification" | "contact_confirmation";

type DeliveryRow = {
  id: string;
  channel: DeliveryChannel;
  status: "pending" | "processing" | "retrying" | "provider_accepted" | "failed";
  idempotency_key: string;
  payload: Json;
  attempts: number;
  max_attempts: number;
  lock_token: string | null;
};

type DatabaseError = { message: string; code?: string };
type DatabaseResult<T> = { data: T; error: DatabaseError | null };
type UpdateQuery = PromiseLike<DatabaseResult<null>> & {
  eq: (column: string, value: string) => UpdateQuery;
};

type OutboxClient = {
  rpc: (
    fn: "claim_contact_email_deliveries",
    args: { p_batch_size: number },
  ) => PromiseLike<DatabaseResult<DeliveryRow[] | null>>;
  from: (table: "contact_email_deliveries") => {
    update: (values: Record<string, unknown>) => UpdateQuery;
  };
};

type EmailSender = (
  notification: ContactLeadNotification,
  options: { idempotencyKey: string },
) => Promise<EmailProviderDeliveryResult>;

type ProcessOutboxOptions = {
  batchSize?: number;
  client?: OutboxClient;
  confirmationSender?: EmailSender;
  leadNotificationSender?: EmailSender;
  now?: Date;
  pruneAbuseAttempts?: boolean;
};

export type ContactEmailOutboxSummary = {
  claimed: number;
  providerAccepted: number;
  retrying: number;
  failed: number;
};

const notificationPayloadSchema = z
  .object({
    requestReference: z.string().regex(/^AIX-[0-9]{4}-[0-9]{6}$/),
    name: z.string().min(2).max(100),
    email: z.string().email().max(255),
    interest: z.string().max(255).nullable(),
    message: z.string().min(10).max(1500),
    locale: z.string().max(35).nullable(),
    pagePath: z.string().max(800).nullable(),
    userAgent: z.string().max(500).nullable(),
    metadata: z.record(z.string(), z.unknown()),
  })
  .strict();

function parseNotificationPayload(payload: Json): ContactLeadNotification | null {
  const parsed = notificationPayloadSchema.safeParse(payload);
  if (!parsed.success) return null;

  return {
    ...parsed.data,
    metadata: parsed.data.metadata as Json,
  };
}

function safeErrorMessage(reason: string) {
  return reason.replace(/\s+/g, " ").trim().slice(0, 2000) || "Unknown email delivery error.";
}

export function calculateContactEmailRetryAt(attempts: number, now = new Date()) {
  const normalizedAttempts = Math.max(1, attempts);
  const delaySeconds = Math.min(6 * 60 * 60, 60 * 2 ** (normalizedAttempts - 1));
  return new Date(now.getTime() + delaySeconds * 1000);
}

async function updateClaimedDelivery(
  client: OutboxClient,
  delivery: DeliveryRow,
  values: Record<string, unknown>,
) {
  if (!delivery.lock_token) {
    throw new Error(`Claimed delivery ${delivery.id} did not include a lock token.`);
  }

  const { error } = await client
    .from("contact_email_deliveries")
    .update({
      ...values,
      locked_at: null,
      lock_token: null,
    })
    .eq("id", delivery.id)
    .eq("lock_token", delivery.lock_token);

  if (error) {
    throw new Error(`Could not persist contact email delivery state (${error.code ?? "database_error"}).`);
  }
}

export async function processContactEmailOutbox(
  options: ProcessOutboxOptions = {},
): Promise<ContactEmailOutboxSummary> {
  const client = (options.client ?? (await getSupabaseAdminClient())) as unknown as OutboxClient;
  const batchSize = Math.max(1, Math.min(options.batchSize ?? 20, 100));
  const now = options.now ?? new Date();
  const { data, error } = await client.rpc("claim_contact_email_deliveries", {
    p_batch_size: batchSize,
  });

  if (error) {
    throw new Error(`Could not claim contact email deliveries (${error.code ?? "database_error"}).`);
  }

  const deliveries = data ?? [];
  const summary: ContactEmailOutboxSummary = {
    claimed: deliveries.length,
    providerAccepted: 0,
    retrying: 0,
    failed: 0,
  };

  for (const delivery of deliveries) {
    const notification = parseNotificationPayload(delivery.payload);

    if (!notification) {
      await updateClaimedDelivery(client, delivery, {
        status: "failed",
        last_error: "The queued email payload is invalid.",
        next_attempt_at: now.toISOString(),
      });
      summary.failed += 1;
      continue;
    }

    const sender =
      delivery.channel === "lead_notification"
        ? options.leadNotificationSender ?? sendContactLeadNotificationEmail
        : options.confirmationSender ?? sendContactConfirmationEmail;
    let result: EmailProviderDeliveryResult;

    try {
      result = await sender(notification, { idempotencyKey: delivery.idempotency_key });
    } catch (sendError) {
      result = {
        ok: false,
        reason: sendError instanceof Error ? sendError.message : "Unknown email delivery error.",
      };
    }

    if (result.ok) {
      await updateClaimedDelivery(client, delivery, {
        status: "provider_accepted",
        payload: {},
        provider_message_id: result.providerMessageId,
        provider_accepted_at: now.toISOString(),
        last_error: null,
        next_attempt_at: now.toISOString(),
      });
      summary.providerAccepted += 1;
      continue;
    }

    const exhausted = result.retryable === false || delivery.attempts >= delivery.max_attempts;
    await updateClaimedDelivery(client, delivery, {
      status: exhausted ? "failed" : "retrying",
      last_error: safeErrorMessage(result.reason),
      next_attempt_at: exhausted
        ? now.toISOString()
        : calculateContactEmailRetryAt(delivery.attempts, now).toISOString(),
    });

    if (exhausted) summary.failed += 1;
    else summary.retrying += 1;
  }

  if (options.pruneAbuseAttempts !== false) {
    try {
      const pruneClient = client as unknown as {
        rpc: (fn: "prune_lead_capture_attempts") => PromiseLike<{
          error: DatabaseError | null;
        }>;
      };
      const pruneResult = await pruneClient.rpc("prune_lead_capture_attempts");
      if (pruneResult.error) {
        console.error(`Could not prune lead capture attempts (${pruneResult.error.code ?? "database_error"}).`);
      }
    } catch (error) {
      console.error("Could not prune lead capture attempts.", error);
    }
  }

  return summary;
}
