import { Webhook } from "svix";
import { describe, expect, it, vi } from "vitest";
import { recordResendWebhookEvent, verifyResendWebhook } from "./resend-webhook";

const secret = `whsec_${Buffer.from("0123456789abcdef0123456789abcdef").toString("base64")}`;

function signedWebhook(body: string, timestamp = new Date()) {
  const id = "msg_test_delivery_event";
  const webhook = new Webhook(secret);
  return new Headers({
    "svix-id": id,
    "svix-timestamp": String(Math.floor(timestamp.getTime() / 1000)),
    "svix-signature": webhook.sign(id, timestamp, body),
  });
}

describe("Resend delivery webhooks", () => {
  it("verifies the raw signed payload with the official Svix verifier", () => {
    const body = JSON.stringify({
      type: "email.delivered",
      created_at: new Date().toISOString(),
      data: { email_id: "email_123" },
    });

    expect(verifyResendWebhook(body, signedWebhook(body), { RESEND_WEBHOOK_SECRET: secret })).toMatchObject({
      eventId: "msg_test_delivery_event",
      event: { type: "email.delivered", data: { email_id: "email_123" } },
    });
  });

  it("rejects invalid signatures and unsupported event types", () => {
    const body = JSON.stringify({ type: "email.opened", created_at: new Date().toISOString(), data: { email_id: "email_123" } });
    const headers = signedWebhook(body);
    headers.set("svix-signature", "v1,invalid");
    expect(() => verifyResendWebhook(body, headers, { RESEND_WEBHOOK_SECRET: secret })).toThrow();

    expect(() => verifyResendWebhook(body, signedWebhook(body), { RESEND_WEBHOOK_SECRET: secret })).toThrow();
  });

  it("deduplicates in the database and redacts addresses/secrets from stored failure detail", async () => {
    const rpc = vi.fn(async () => ({
      data: [{ duplicate: false, applied: true, delivery_id: "delivery-1" }],
      error: null,
    }));
    const event = {
      type: "email.bounced" as const,
      created_at: "2026-07-16T10:00:00.000Z",
      data: {
        email_id: "email_123",
        bounce: { message: "private@example.com rejected token re_super_secret" },
      },
    };

    await expect(recordResendWebhookEvent("event-1", event, { rpc })).resolves.toEqual({
      duplicate: false,
      applied: true,
      matched: true,
    });
    expect(rpc).toHaveBeenCalledWith("record_contact_email_event", expect.objectContaining({
      p_detail: "[redacted-email] rejected token [redacted-secret]",
    }));
  });
});
