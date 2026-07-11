import { describe, expect, it, vi } from "vitest";
import { sendLeadNotificationTestEmail } from "./lead-notification-email";

const configuredEnv = {
  RESEND_API_KEY: "re_test_key",
  LEAD_NOTIFICATION_FROM: "AIXCO Website <leads@aixco.global>",
  LEAD_NOTIFICATION_TO: "info@aixco.global",
};

describe("lead notification email", () => {
  it("sends a marked inbox test to the configured recipient and returns the Resend id", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ id: "email_test_123" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await sendLeadNotificationTestEmail(
      {
        replyTo: "tester@example.com",
        message: "Confirm that the info inbox receives this test.",
      },
      {
        env: configuredEnv,
        fetchImpl: fetchMock as unknown as typeof fetch,
      },
    );

    expect(result).toEqual({
      ok: true,
      id: "email_test_123",
      to: ["info@aixco.global"],
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://api.resend.com/emails");

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(request.body)) as Record<string, unknown>;

    expect(request.method).toBe("POST");
    expect(body).toMatchObject({
      from: "AIXCO Website <leads@aixco.global>",
      to: ["info@aixco.global"],
      reply_to: "tester@example.com",
      subject: "[TEST] AIXCO info inbox delivery check",
      tags: [{ name: "source", value: "admin_email_test" }],
    });
    expect(String(body.text)).toContain("Confirm that the info inbox receives this test.");
  });

  it("does not call Resend when the notification configuration is incomplete", async () => {
    const fetchMock = vi.fn();

    const result = await sendLeadNotificationTestEmail(
      { message: "This message is long enough for the test." },
      {
        env: {},
        fetchImpl: fetchMock as unknown as typeof fetch,
      },
    );

    expect(result).toEqual({
      ok: false,
      skipped: true,
      reason:
        "Lead notification email configuration is not available: RESEND_API_KEY, LEAD_NOTIFICATION_FROM, LEAD_NOTIFICATION_TO.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});