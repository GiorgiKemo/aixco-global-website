import "server-only";
import { Webhook } from "svix";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { sanitizeOperationalError } from "./operational-error";

const supportedEventType = z.enum([
  "email.sent",
  "email.delivered",
  "email.delivery_delayed",
  "email.bounced",
  "email.complained",
  "email.failed",
  "email.suppressed",
]);

const resendWebhookSchema = z.object({
  type: supportedEventType,
  created_at: z.string().datetime({ offset: true }),
  data: z.object({
    email_id: z.string().min(1).max(255),
    bounce: z.object({ message: z.string().max(2000).optional() }).passthrough().optional(),
    error: z.object({ message: z.string().max(2000).optional() }).passthrough().optional(),
    reason: z.string().max(2000).optional(),
  }).passthrough(),
}).passthrough();

type ResendWebhookEvent = z.infer<typeof resendWebhookSchema>;

type ResendWebhookClient = {
  rpc: (
    fn: "record_contact_email_event",
    args: {
      p_event_id: string;
      p_provider_message_id: string;
      p_event_type: ResendWebhookEvent["type"];
      p_occurred_at: string;
      p_detail: string | null;
    },
  ) => PromiseLike<{
    data: { duplicate: boolean; applied: boolean; delivery_id: string | null }[] | null;
    error: { message: string; code?: string } | null;
  }>;
};

function getWebhookSecret(env: Record<string, string | undefined>) {
  const secret = env.RESEND_WEBHOOK_SECRET?.trim() ?? "";
  if (!secret.startsWith("whsec_") || secret.length < 16) {
    throw new Error("RESEND_WEBHOOK_SECRET is not configured.");
  }
  return secret;
}

export function verifyResendWebhook(
  rawBody: string,
  headers: Headers,
  env: Record<string, string | undefined> = process.env,
) {
  const eventId = headers.get("svix-id")?.trim() ?? "";
  const timestamp = headers.get("svix-timestamp")?.trim() ?? "";
  const signature = headers.get("svix-signature")?.trim() ?? "";
  if (!eventId || !timestamp || !signature) throw new Error("Missing Resend webhook signature headers.");

  // The official Svix verifier validates the HMAC, rejects timestamps outside
  // its replay window, and accepts key rotation signatures. Verification must
  // receive the untouched request body.
  const verified = new Webhook(getWebhookSecret(env)).verify(rawBody, {
    "svix-id": eventId,
    "svix-timestamp": timestamp,
    "svix-signature": signature,
  });
  const event = resendWebhookSchema.parse(verified);

  return { eventId: eventId.slice(0, 255), event };
}

function getEventDetail(event: ResendWebhookEvent) {
  const detail = event.data.bounce?.message ?? event.data.error?.message ?? event.data.reason ?? null;
  return detail ? sanitizeOperationalError(detail, 1000) || null : null;
}

export async function recordResendWebhookEvent(
  eventId: string,
  event: ResendWebhookEvent,
  client?: ResendWebhookClient,
) {
  const supabase = client ?? ((await getSupabaseAdminClient()) as unknown as ResendWebhookClient);
  const { data, error } = await supabase.rpc("record_contact_email_event", {
    p_event_id: eventId,
    p_provider_message_id: event.data.email_id,
    p_event_type: event.type,
    p_occurred_at: event.created_at,
    p_detail: getEventDetail(event),
  });

  if (error) {
    throw new Error(`Could not store Resend webhook event (${error.code ?? "database_error"}).`);
  }

  const result = data?.[0];
  if (!result) throw new Error("Resend webhook storage returned no result.");
  return {
    duplicate: result.duplicate,
    applied: result.applied,
    matched: Boolean(result.delivery_id),
  };
}

export type { ResendWebhookClient, ResendWebhookEvent };
