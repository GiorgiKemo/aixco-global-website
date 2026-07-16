import { describe, expect, it, vi } from "vitest";
import {
  buildContactConfirmationEmail,
  buildContactLeadNotificationHtml,
  sendContactConfirmationEmail,
  sendContactLeadNotificationEmail,
  sendLeadNotificationTestEmail,
} from "./lead-notification-email";

const configuredEnv = {
  RESEND_API_KEY: "re_test_key",
  LEAD_NOTIFICATION_FROM: "AIXCO Website <leads@aixco.global>",
  LEAD_NOTIFICATION_TO: "info@aixco.global",
};

const notification = {
  requestReference: "AIX-2026-000001",
  name: "Reference User",
  email: "reference@example.com",
  interest: "Schedule a Call",
  message: "Schedule a call request. Phone number: +995555555555.",
  locale: "en",
  pagePath: "/#contact",
  userAgent: "Vitest",
  metadata: {},
};

describe("lead notification email", () => {
  it("shows the database request reference in the subject and message", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      new Response(JSON.stringify({ id: "email_lead_123" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(
      sendContactLeadNotificationEmail(
        {
          requestReference: "AIX-2026-000001",
          name: "Reference User",
          email: "reference@example.com",
          interest: "Website inquiry",
          message: "Please send more information about the current project.",
          locale: "en",
          pagePath: "/#contact",
          userAgent: "Vitest",
          metadata: {},
        },
        {
          env: configuredEnv,
          fetchImpl: fetchMock as unknown as typeof fetch,
          idempotencyKey: "lead-notification/AIX-2026-000001",
        },
      ),
    ).resolves.toEqual({ ok: true, providerMessageId: "email_lead_123" });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(new Headers(request.headers).get("Idempotency-Key")).toBe(
      "lead-notification/AIX-2026-000001",
    );
    const body = JSON.parse(String(request.body)) as Record<string, unknown>;

    expect(body.subject).toBe("[AIX-2026-000001] New AIXCO lead: Website inquiry");
    expect(String(body.text)).toContain("Request reference: AIX-2026-000001");
    expect(String(body.html)).toContain("AIX-2026-000001");
    expect(String(body.html)).toContain("#161616");
    expect(String(body.html)).toContain("#E6C767");
    expect(String(body.html)).toContain("#F3EDE1");
    expect(String(body.html)).toContain("AIXCOGlobal-horizontal-dark.png");
    expect(String(body.html)).toContain('class="aixco-logo"');
    expect(String(body.html)).toContain('width="360"');
    expect(String(body.html)).toContain("background: #002147");
    expect(String(body.html)).toContain("Reply to Reference User");
  });

  it("escapes submitted content and renders referrers as non-clickable text", () => {
    const html = buildContactLeadNotificationHtml({
      requestReference: "AIX-2026-000009",
      name: "<img src=x onerror=alert(1)>",
      email: "lead@example.com",
      interest: "Current project",
      message: "Please send <script>alert('x')</script> details.",
      locale: "en",
      pagePath: "/#contact",
      userAgent: "Vitest",
      metadata: {
        referrer: "javascript:alert(1)",
      },
    });

    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(html).toContain("&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;");
    expect(html).not.toContain("href=\"javascript:");
    expect(html).toContain("javascript:alert(1)");
  });

  it("sends a marked inbox test to the configured recipient and returns the Resend id", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
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
    expect(String(body.html)).toContain("AIXCO inbox verification");
    expect(String(body.html)).toContain("AIXCOGlobal-horizontal-dark.png");
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

  it("builds the document-approved call confirmation with its request reference", () => {
    const confirmation = buildContactConfirmationEmail(notification);

    expect(confirmation.requestType).toBe("call");
    expect(confirmation.subject).toBe(
      "[AIX-2026-000001] Your AIXCO Call Request Has Been Received",
    );
    expect(confirmation.text).toContain("Dear Sir or Madam,");
    expect(confirmation.text).toContain("Thank you for scheduling a call with AIXCO.");
    expect(confirmation.text).toContain(
      "One of our team members will review your request and contact you shortly to confirm your appointment",
    );
    expect(confirmation.text).toContain("Request reference: AIX-2026-000001");
    expect(confirmation.text).toContain("Please do not reply to this message, as replies are not monitored.");
    expect(confirmation.text).not.toContain("Thank you for your interest in AIXCO.");
    expect(confirmation.html).toContain("Your AIXCO Call Request Has Been Received");
    expect(confirmation.html).toContain("AIX-2026-000001");
    expect(confirmation.html).toContain("AIXCOGlobal-horizontal-dark.png");
    expect(confirmation.html).not.toContain("+995555555555");
  });

  it("builds the document-approved message confirmation and escapes the reference", () => {
    const confirmation = buildContactConfirmationEmail({
      ...notification,
      requestReference: "AIX-2026-000002<script>",
      interest: "Send an Email",
    });

    expect(confirmation.requestType).toBe("message");
    expect(confirmation.subject).toBe("[AIX-2026-000002<script>] We Have Received Your Message");
    expect(confirmation.text).toContain("Thank you for contacting AIXCO.");
    expect(confirmation.text).toContain(
      "One of our team members will review your enquiry and get back to you as soon as possible.",
    );
    expect(confirmation.text).toContain(
      "Thank you for your interest in AIXCO. We look forward to assisting you.",
    );
    expect(confirmation.html).toContain("AIX-2026-000002&lt;script&gt;");
    expect(confirmation.html).not.toContain("AIX-2026-000002<script>");
  });

  it("uses the selected website language for customer confirmations", () => {
    const german = buildContactConfirmationEmail({
      ...notification,
      requestType: "message",
      locale: "de-DE",
    });
    const arabic = buildContactConfirmationEmail({
      ...notification,
      requestType: "call",
      locale: "ar",
    });

    expect(german.subject).toContain("Wir haben Ihre Nachricht erhalten");
    expect(german.text).toContain("Anfragereferenz: AIX-2026-000001");
    expect(german.html).toContain('<html lang="de" dir="ltr">');
    expect(arabic.subject).toContain("تم استلام طلب مكالمتك");
    expect(arabic.html).toContain('<html lang="ar" dir="rtl">');
  });

  it("sends the confirmation to the requester without requiring or exposing the internal inbox", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      new Response(JSON.stringify({ id: "email_confirmation_123" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(
      sendContactConfirmationEmail(notification, {
        env: {
          RESEND_API_KEY: configuredEnv.RESEND_API_KEY,
          LEAD_NOTIFICATION_FROM: configuredEnv.LEAD_NOTIFICATION_FROM,
        },
        fetchImpl: fetchMock as unknown as typeof fetch,
        idempotencyKey: "contact-confirmation/AIX-2026-000001",
      }),
    ).resolves.toEqual({ ok: true, providerMessageId: "email_confirmation_123" });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(new Headers(request.headers).get("Idempotency-Key")).toBe(
      "contact-confirmation/AIX-2026-000001",
    );
    const body = JSON.parse(String(request.body)) as Record<string, unknown>;

    expect(body).toMatchObject({
      from: "AIXCO Website <leads@aixco.global>",
      to: ["reference@example.com"],
      subject: "[AIX-2026-000001] Your AIXCO Call Request Has Been Received",
      tags: [
        { name: "source", value: "contact_confirmation" },
        { name: "request_type", value: "call" },
      ],
    });
    expect(body).not.toHaveProperty("reply_to");
    expect(String(body.text)).toContain("Please do not reply to this message");
  });

  it("reports confirmation configuration and provider failures without sending a real email", async () => {
    const fetchMock = vi.fn();

    await expect(
      sendContactConfirmationEmail(notification, {
        env: {},
        fetchImpl: fetchMock as unknown as typeof fetch,
      }),
    ).resolves.toEqual({
      ok: false,
      skipped: true,
      retryable: false,
      reason:
        "Contact confirmation email configuration is not available: RESEND_API_KEY, LEAD_NOTIFICATION_FROM.",
    });
    expect(fetchMock).not.toHaveBeenCalled();

    const failingFetch = vi.fn(async () =>
      new Response(JSON.stringify({ message: "sender rejected" }), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      }),
    );
    await expect(
      sendContactConfirmationEmail(notification, {
        env: configuredEnv,
        fetchImpl: failingFetch as unknown as typeof fetch,
      }),
    ).resolves.toEqual({ ok: false, reason: "sender rejected", retryable: false });
  });

  it("retries only the concurrent Resend 409 idempotency error", async () => {
    const concurrent = vi.fn(async () =>
      new Response(JSON.stringify({
        name: "concurrent_idempotent_requests",
        message: "The original request is still in progress.",
      }), { status: 409, headers: { "Content-Type": "application/json" } }),
    );
    await expect(sendContactLeadNotificationEmail(notification, {
      env: configuredEnv,
      fetchImpl: concurrent as unknown as typeof fetch,
      idempotencyKey: "lead-notification/AIX-2026-000001",
    })).resolves.toMatchObject({ ok: false, retryable: true });

    const mismatched = vi.fn(async () =>
      new Response(JSON.stringify({
        name: "invalid_idempotent_request",
        message: "The key was previously used with a different payload.",
      }), { status: 409, headers: { "Content-Type": "application/json" } }),
    );
    await expect(sendContactLeadNotificationEmail(notification, {
      env: configuredEnv,
      fetchImpl: mismatched as unknown as typeof fetch,
      idempotencyKey: "lead-notification/AIX-2026-000001",
    })).resolves.toMatchObject({ ok: false, retryable: false });
  });

  it("does not clear the durable payload when a successful Resend response has no message id", async () => {
    const missingId = vi.fn(async () =>
      new Response(JSON.stringify({}), { status: 200, headers: { "Content-Type": "application/json" } }),
    );

    await expect(sendContactLeadNotificationEmail(notification, {
      env: configuredEnv,
      fetchImpl: missingId as unknown as typeof fetch,
      idempotencyKey: "lead-notification/AIX-2026-000001",
    })).resolves.toEqual({
      ok: false,
      reason: "Resend accepted the request without a valid message identifier.",
      retryable: true,
    });
  });

  it("treats a malformed successful provider id as a retryable invalid response", async () => {
    const malformedId = vi.fn(async () =>
      new Response(JSON.stringify({ id: { nested: "not-a-string" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(sendContactLeadNotificationEmail(notification, {
      env: configuredEnv,
      fetchImpl: malformedId as unknown as typeof fetch,
    })).resolves.toEqual({
      ok: false,
      reason: "Resend accepted the request without a valid message identifier.",
      retryable: true,
    });
  });

  it("uses a safe status fallback for malformed provider error fields", async () => {
    const malformedError = vi.fn(async () =>
      new Response(JSON.stringify({ message: { private: "unsafe" }, name: 409 }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(sendContactLeadNotificationEmail(notification, {
      env: configuredEnv,
      fetchImpl: malformedError as unknown as typeof fetch,
    })).resolves.toEqual({
      ok: false,
      reason: "Resend request failed with status 400.",
      retryable: false,
    });
  });

  it("times out a stalled provider request", async () => {
    const stalledFetch = vi.fn(
      (_url: string | URL | Request, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        }),
    );

    await expect(
      sendContactLeadNotificationEmail(notification, {
        env: configuredEnv,
        fetchImpl: stalledFetch as unknown as typeof fetch,
        timeoutMs: 10,
        idempotencyKey: "lead-notification/AIX-2026-000001",
      }),
    ).resolves.toEqual({
      ok: false,
      reason: "Resend request timed out after 10ms.",
      retryable: true,
    });
  });
});
