import { describe, expect, it, vi } from "vitest";
import {
  calculateContactEmailRetryAt,
  processContactEmailOutbox,
} from "./contact-email-outbox";

const payload = {
  requestReference: "AIX-2026-000001",
  name: "Queue User",
  email: "queue@example.com",
  interest: "Send an Email",
  message: "Please send more information about the current project.",
  locale: "en",
  pagePath: "/#contact",
  userAgent: "Vitest",
  metadata: {},
};

function delivery(
  channel: "lead_notification" | "contact_confirmation",
  overrides: Record<string, unknown> = {},
) {
  return {
    id: `${channel}-id`,
    channel,
    status: "processing" as const,
    idempotency_key: `${channel}/AIX-2026-000001`,
    payload,
    attempts: 1,
    max_attempts: 8,
    lock_token: `${channel}-lock`,
    ...overrides,
  };
}

function createOutboxClient(rows: ReturnType<typeof delivery>[], claimError: { code?: string; message: string } | null = null) {
  const updates: { values: Record<string, unknown>; filters: [string, string][] }[] = [];

  return {
    updates,
    client: {
      rpc: vi.fn(async () => ({ data: claimError ? null : rows, error: claimError })),
      from: () => ({
        update: (values: Record<string, unknown>) => {
          const filters: [string, string][] = [];
          const result = { data: null, error: null };
          const query = {
            eq(column: string, value: string) {
              filters.push([column, value]);
              return query;
            },
            then<TResult1 = typeof result, TResult2 = never>(
              onfulfilled?: ((value: typeof result) => TResult1 | PromiseLike<TResult1>) | null,
              onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
            ) {
              updates.push({ values, filters });
              return Promise.resolve(result).then(onfulfilled, onrejected);
            },
          };
          return query;
        },
      }),
    },
  };
}

describe("contact email outbox", () => {
  it("routes both channels, passes stable idempotency keys, and records provider acceptance", async () => {
    const rows = [delivery("lead_notification"), delivery("contact_confirmation")];
    const { client, updates } = createOutboxClient(rows);
    const leadSender = vi.fn(async () => ({ ok: true as const, providerMessageId: "resend-lead" }));
    const confirmationSender = vi.fn(async () => ({
      ok: true as const,
      providerMessageId: "resend-confirmation",
    }));

    await expect(
      processContactEmailOutbox({
        client,
        leadNotificationSender: leadSender,
        confirmationSender,
        now: new Date("2026-07-15T10:00:00.000Z"),
      }),
    ).resolves.toEqual({ claimed: 2, providerAccepted: 2, retrying: 0, failed: 0 });

    expect(leadSender).toHaveBeenCalledWith(payload, {
      idempotencyKey: "lead_notification/AIX-2026-000001",
    });
    expect(confirmationSender).toHaveBeenCalledWith(payload, {
      idempotencyKey: "contact_confirmation/AIX-2026-000001",
    });
    expect(updates).toHaveLength(2);
    expect(updates[0]).toMatchObject({
      values: {
        status: "provider_accepted",
        payload: {},
        provider_message_id: "resend-lead",
        provider_accepted_at: "2026-07-15T10:00:00.000Z",
        locked_at: null,
        lock_token: null,
      },
      filters: [
        ["id", "lead_notification-id"],
        ["lock_token", "lead_notification-lock"],
      ],
    });
  });

  it("retries provider failures with exponential backoff", async () => {
    const { client, updates } = createOutboxClient([delivery("lead_notification", { attempts: 3 })]);

    await expect(
      processContactEmailOutbox({
        client,
        leadNotificationSender: async () => ({
          ok: false,
          reason: "provider\n temporarily unavailable",
        }),
        now: new Date("2026-07-15T10:00:00.000Z"),
      }),
    ).resolves.toEqual({ claimed: 1, providerAccepted: 0, retrying: 1, failed: 0 });

    expect(updates[0]?.values).toMatchObject({
      status: "retrying",
      last_error: "provider temporarily unavailable",
      next_attempt_at: "2026-07-15T10:04:00.000Z",
    });
  });

  it("marks exhausted and malformed deliveries as failed without losing the queue record", async () => {
    const exhausted = delivery("contact_confirmation", { attempts: 8, max_attempts: 8 });
    const malformed = delivery("lead_notification", { id: "malformed", payload: { email: "bad" } });
    const { client, updates } = createOutboxClient([exhausted, malformed]);

    await expect(
      processContactEmailOutbox({
        client,
        confirmationSender: async () => ({ ok: false, reason: "sender rejected" }),
        now: new Date("2026-07-15T10:00:00.000Z"),
      }),
    ).resolves.toEqual({ claimed: 2, providerAccepted: 0, retrying: 0, failed: 2 });

    expect(updates.map((update) => update.values.status)).toEqual(["failed", "failed"]);
    expect(updates[1]?.values.last_error).toBe("The queued email payload is invalid.");
  });

  it("does not retry permanent provider validation failures", async () => {
    const { client, updates } = createOutboxClient([delivery("contact_confirmation")]);

    await expect(
      processContactEmailOutbox({
        client,
        confirmationSender: async () => ({
          ok: false,
          reason: "sender domain is not verified",
          retryable: false,
        }),
        now: new Date("2026-07-15T10:00:00.000Z"),
      }),
    ).resolves.toEqual({ claimed: 1, providerAccepted: 0, retrying: 0, failed: 1 });

    expect(updates[0]?.values).toMatchObject({
      status: "failed",
      last_error: "sender domain is not verified",
    });
  });

  it("fails the worker run when claiming the queue fails", async () => {
    const { client } = createOutboxClient([], { code: "42P01", message: "missing relation" });

    await expect(processContactEmailOutbox({ client })).rejects.toThrow(
      "Could not claim contact email deliveries (42P01).",
    );
  });

  it("caps retry delay at six hours", () => {
    expect(
      calculateContactEmailRetryAt(20, new Date("2026-07-15T10:00:00.000Z")).toISOString(),
    ).toBe("2026-07-15T16:00:00.000Z");
  });
});
