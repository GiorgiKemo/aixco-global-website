import type { Json } from "@/lib/supabase/database.types";

type Env = Record<string, string | undefined>;

export type ContactLeadNotification = {
  requestReference: string;
  name: string;
  email: string;
  interest: string | null;
  message: string;
  locale: string | null;
  pagePath: string | null;
  userAgent: string | null;
  metadata: Json;
};

type LeadNotificationConfig = {
  configured: boolean;
  apiKey: string;
  from: string;
  to: string[];
  missing: string[];
};

type EmailSenderConfig = Omit<LeadNotificationConfig, "to">;

export type ContactConfirmationType = "call" | "message";

export type ContactConfirmationEmail = {
  requestType: ContactConfirmationType;
  subject: string;
  text: string;
  html: string;
};

type ResendSendResponse = {
  id?: string;
  message?: string;
  name?: string;
};

export type EmailDeliveryTestResult =
  | { ok: true; id: string | undefined; to: string[] }
  | { ok: false; skipped?: boolean; reason: string };

export type EmailProviderDeliveryResult =
  | { ok: true; providerMessageId: string | null }
  | { ok: false; skipped?: boolean; reason: string; retryable?: boolean };

type EmailSendOptions = {
  env?: Env;
  fetchImpl?: typeof fetch;
  idempotencyKey?: string;
  timeoutMs?: number;
};

function readEnv(env: Env, name: string) {
  return env[name]?.trim() ?? "";
}

function splitRecipients(value: string) {
  return value
    .split(",")
    .map((recipient) => recipient.trim())
    .filter(Boolean);
}

function getEmailSenderConfig(env: Env = process.env): EmailSenderConfig {
  const apiKey = readEnv(env, "RESEND_API_KEY");
  const from = readEnv(env, "LEAD_NOTIFICATION_FROM");
  const missing: string[] = [];

  if (!apiKey) missing.push("RESEND_API_KEY");
  if (!from) missing.push("LEAD_NOTIFICATION_FROM");

  return {
    configured: missing.length === 0,
    apiKey,
    from,
    missing,
  };
}

export function getLeadNotificationConfig(env: Env = process.env): LeadNotificationConfig {
  const sender = getEmailSenderConfig(env);
  const to = splitRecipients(readEnv(env, "LEAD_NOTIFICATION_TO"));
  const missing = [...sender.missing];

  if (to.length === 0) missing.push("LEAD_NOTIFICATION_TO");

  return {
    configured: missing.length === 0,
    apiKey: sender.apiKey,
    from: sender.from,
    to,
    missing,
  };
}

function getMetadataObject(metadata: Json): { [key: string]: Json | undefined } {
  return metadata && typeof metadata === "object" && !Array.isArray(metadata) ? metadata : {};
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatLine(label: string, value: string | number | null | undefined) {
  return `${label}: ${value === null || value === undefined || value === "" ? "Not provided" : value}`;
}

const emailBrand = {
  onyx: "#161616",
  white: "#FFFFFF",
  gold: "#E6C767",
  documentGold: "#9C7F3C",
  navy: "#002147",
  gray: "#9A9A9A",
  ivory: "#F3EDE1",
  logo: "https://www.aixco.global/aixco-global-op2/images/AIXCOGlobal-horizontal-dark.png",
} as const;

function displayValue(value: string | number | null | undefined) {
  return value === null || value === undefined || value === "" ? "Not provided" : String(value);
}

function safeWebUrl(value: string | null | undefined) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function buildBrandedEmailShell(input: {
  preheader: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  content: string;
}) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>${escapeHtml(input.title)}</title>
    <style>
      @media screen and (max-width: 520px) {
        .aixco-email-wrap {
          padding: 12px 0 !important;
        }
        .aixco-shell-padding {
          padding-left: 24px !important;
          padding-right: 24px !important;
        }
        .aixco-logo {
          width: 250px !important;
        }
        .aixco-title {
          font-size: 28px !important;
        }
        .aixco-contact-cell {
          display: block !important;
          width: 100% !important;
          padding: 16px 0 !important;
          border-left: 0 !important;
        }
        .aixco-message {
          padding: 22px 20px 22px 22px !important;
          font-size: 16px !important;
        }
        .aixco-body-copy {
          font-size: 16px !important;
        }
        .aixco-reference {
          font-size: 23px !important;
        }
        .aixco-reply {
          display: block !important;
          padding: 15px 18px !important;
          text-align: center !important;
        }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background: ${emailBrand.ivory}; color: ${emailBrand.onyx};">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent; mso-hide: all;">${escapeHtml(input.preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse; background: ${emailBrand.ivory};">
      <tr>
        <td class="aixco-email-wrap" align="center" style="padding: 28px 12px;">
          <table role="presentation" width="790" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 790px; border-collapse: collapse; background: ${emailBrand.white};">
            <tr>
              <td class="aixco-shell-padding" style="padding: 38px 46px 35px; background: ${emailBrand.white};">
                <img class="aixco-logo" src="${emailBrand.logo}" width="360" alt="AIXCO.GLOBAL" style="display: block; width: 360px; max-width: 100%; height: auto; border: 0; color: ${emailBrand.onyx}; font-family: Arial, sans-serif; font-size: 16px;">
                <div style="height: 1px; margin: 28px 0 37px; background: ${emailBrand.documentGold}; font-size: 1px; line-height: 1px;">&nbsp;</div>
                <p style="margin: 0 0 16px; font-family: Gilroy, 'Avenir Next', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.3; font-weight: 700; letter-spacing: 2.8px; color: ${emailBrand.documentGold}; text-transform: uppercase;">${escapeHtml(input.eyebrow)}</p>
                <h1 class="aixco-title" style="margin: 0; font-family: Gilroy, 'Avenir Next', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 40px; line-height: 1.15; font-weight: 700; letter-spacing: -0.55px; color: ${emailBrand.onyx};">${escapeHtml(input.title)}</h1>
                ${input.subtitle ? `<p style="margin: 17px 0 0; max-width: 650px; font-family: Gilroy, 'Avenir Next', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 18px; line-height: 1.6; color: #666666;">${escapeHtml(input.subtitle)}</p>` : ""}
              </td>
            </tr>
            ${input.content}
            <tr>
              <td align="center" style="padding: 38px 34px 39px; background: ${emailBrand.navy};">
                <p style="margin: 0 0 12px; font-family: Gilroy, 'Avenir Next', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 24px; line-height: 1.3; font-weight: 500; letter-spacing: 5.5px; color: ${emailBrand.white}; text-transform: uppercase;">AIXCO.GLOBAL</p>
                <p style="margin: 0; font-family: Gilroy, 'Avenir Next', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 12px; line-height: 1.5; font-weight: 600; letter-spacing: 3.5px; color: ${emailBrand.white}; text-transform: uppercase;">Switzerland &nbsp;&middot;&nbsp; Dubai &nbsp;&middot;&nbsp; Batumi</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

const contactConfirmationCopy = {
  call: {
    title: "Your AIXCO Call Request Has Been Received",
    opening: "Thank you for scheduling a call with AIXCO.",
    response:
      "We have successfully received your request. One of our team members will review your request and contact you shortly to confirm your appointment and answer any questions you may have.",
    closing: null,
  },
  message: {
    title: "We Have Received Your Message",
    opening: "Thank you for contacting AIXCO.",
    response:
      "We have successfully received your message. One of our team members will review your enquiry and get back to you as soon as possible.",
    closing: "Thank you for your interest in AIXCO. We look forward to assisting you.",
  },
} as const;

function getContactConfirmationType(notification: ContactLeadNotification): ContactConfirmationType {
  return notification.interest?.trim().toLowerCase() === "schedule a call" ? "call" : "message";
}

export function buildContactConfirmationEmail(notification: ContactLeadNotification): ContactConfirmationEmail {
  const requestType = getContactConfirmationType(notification);
  const copy = contactConfirmationCopy[requestType];
  const automatedNotice =
    "Please note that this is an automated confirmation email. Please do not reply to this message, as replies are not monitored.";
  const text = [
    copy.title,
    "",
    "Dear Sir or Madam,",
    "",
    copy.opening,
    "",
    copy.response,
    "",
    `Request reference: ${notification.requestReference}`,
    "",
    automatedNotice,
    ...(copy.closing ? ["", copy.closing] : []),
    "",
    "Kind regards,",
    "The AIXCO Team",
    "AIXCO Global",
    "info@aixco.global",
    "www.aixco.global",
  ].join("\n");

  const paragraphStyle = `margin: 0 0 20px; font-family: Gilroy, 'Avenir Next', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 18px; line-height: 1.65; color: ${emailBrand.onyx};`;
  const html = buildBrandedEmailShell({
    preheader: `${copy.title}. Reference ${notification.requestReference}.`,
    eyebrow: "Request confirmation",
    title: copy.title,
    content: `
      <tr>
        <td class="aixco-shell-padding" style="padding: 0 46px 42px; background: ${emailBrand.white};">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse; margin: 0 0 34px;">
            <tr>
              <td style="padding: 25px 29px 24px; background: ${emailBrand.gold}; color: ${emailBrand.onyx};">
                <p style="margin: 0 0 8px; font-family: Gilroy, 'Avenir Next', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 12px; line-height: 1.3; font-weight: 700; letter-spacing: 2.1px; text-transform: uppercase;">Request reference</p>
                <p class="aixco-reference" style="margin: 0; font-family: Gilroy, 'Avenir Next', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 28px; line-height: 1.2; font-weight: 700; letter-spacing: 0.4px;">${escapeHtml(notification.requestReference)}</p>
              </td>
            </tr>
          </table>
          <p class="aixco-body-copy" style="${paragraphStyle}">Dear Sir or Madam,</p>
          <p class="aixco-body-copy" style="${paragraphStyle}">${escapeHtml(copy.opening)}</p>
          <p class="aixco-body-copy" style="${paragraphStyle}">${escapeHtml(copy.response)}</p>
          <div style="margin: 30px 0; padding: 22px 23px; border-left: 4px solid ${emailBrand.documentGold}; background: ${emailBrand.ivory};">
            <p class="aixco-body-copy" style="margin: 0; font-family: Gilroy, 'Avenir Next', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.65; color: #4F4F4F;">${escapeHtml(automatedNotice)}</p>
          </div>
          ${copy.closing ? `<p class="aixco-body-copy" style="${paragraphStyle}">${escapeHtml(copy.closing)}</p>` : ""}
          <p class="aixco-body-copy" style="margin: 28px 0 4px; font-family: Gilroy, 'Avenir Next', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 18px; line-height: 1.65; color: ${emailBrand.onyx};">Kind regards,</p>
          <p class="aixco-body-copy" style="margin: 0; font-family: Gilroy, 'Avenir Next', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 18px; line-height: 1.6; font-weight: 700; color: ${emailBrand.onyx};">The AIXCO Team</p>
          <p class="aixco-body-copy" style="margin: 0; font-family: Gilroy, 'Avenir Next', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.7; color: #555555;">AIXCO Global<br><a href="mailto:info@aixco.global" style="color: ${emailBrand.navy}; text-decoration: underline;">info@aixco.global</a><br><a href="https://www.aixco.global/" style="color: ${emailBrand.navy}; text-decoration: underline;">www.aixco.global</a></p>
        </td>
      </tr>`,
  });

  return {
    requestType,
    subject: `[${notification.requestReference}] ${copy.title}`,
    text,
    html,
  };
}

function buildText(notification: ContactLeadNotification) {
  const metadata = getMetadataObject(notification.metadata);

  return [
    "New AIXCO website contact request",
    "",
    formatLine("Request reference", notification.requestReference),
    formatLine("Name", notification.name),
    formatLine("Email", notification.email),
    formatLine("Interest", notification.interest),
    "",
    "Message:",
    notification.message,
    "",
    "Context:",
    formatLine("Page", notification.pagePath),
    formatLine("Locale", notification.locale),
    formatLine("Timezone", typeof metadata.timezone === "string" ? metadata.timezone : null),
    formatLine("Referrer", typeof metadata.referrer === "string" ? metadata.referrer : null),
    formatLine("Viewport", metadata.viewport_width && metadata.viewport_height ? `${metadata.viewport_width}x${metadata.viewport_height}` : null),
    formatLine("User agent", notification.userAgent),
  ].join("\n");
}

export function buildContactLeadNotificationHtml(notification: ContactLeadNotification) {
  const metadata = getMetadataObject(notification.metadata);
  const contextRows = [
    ["Page", notification.pagePath],
    ["Locale", notification.locale],
    ["Timezone", typeof metadata.timezone === "string" ? metadata.timezone : null],
    ["Referrer", typeof metadata.referrer === "string" ? metadata.referrer : null],
    [
      "Viewport",
      metadata.viewport_width && metadata.viewport_height ? `${metadata.viewport_width}x${metadata.viewport_height}` : null,
    ],
  ];
  const referrerUrl = safeWebUrl(typeof metadata.referrer === "string" ? metadata.referrer : null);
  const replyHref = `mailto:${notification.email}?subject=${encodeURIComponent(`Re: ${notification.requestReference}`)}`;

  return buildBrandedEmailShell({
    preheader: `${notification.requestReference} - ${notification.name} submitted a new AIXCO website request.`,
    eyebrow: "New contact request",
    title: "A new client enquiry has arrived.",
    subtitle: "The request details are collected below for a quick, confident follow-up.",
    content: `
      <tr>
        <td class="aixco-shell-padding" style="padding: 0 46px; background: ${emailBrand.white};">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 29px 31px 28px; background: ${emailBrand.gold}; color: ${emailBrand.onyx};">
                <p style="margin: 0 0 9px; font-family: Gilroy, 'Avenir Next', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 13px; line-height: 1.3; font-weight: 700; letter-spacing: 2.2px; text-transform: uppercase;">Request reference</p>
                <p style="margin: 0; font-family: Gilroy, 'Avenir Next', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 29px; line-height: 1.2; font-weight: 700; letter-spacing: 0.5px;">${escapeHtml(notification.requestReference)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td class="aixco-shell-padding" style="padding: 43px 46px 0; background: ${emailBrand.white};">
          <p style="margin: 0 0 18px; font-family: Gilroy, 'Avenir Next', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.3; font-weight: 700; letter-spacing: 2.8px; color: ${emailBrand.documentGold}; text-transform: uppercase;">Contact details</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse; border-top: 1px solid #D8C89F;">
            <tr>
              <td class="aixco-contact-cell" width="50%" valign="top" style="padding: 25px 22px 25px 0; border-bottom: 1px solid #D8C89F;">
                <p style="margin: 0 0 10px; font-family: Gilroy, 'Avenir Next', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 12px; line-height: 1.3; font-weight: 600; letter-spacing: 1.6px; color: #6F6F6F; text-transform: uppercase;">Name</p>
                <p style="margin: 0; font-family: Gilroy, 'Avenir Next', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 22px; line-height: 1.4; font-weight: 700; color: ${emailBrand.onyx};">${escapeHtml(notification.name)}</p>
              </td>
              <td class="aixco-contact-cell" width="50%" valign="top" style="padding: 25px 0 25px 25px; border-bottom: 1px solid #D8C89F; border-left: 1px solid #D8C89F;">
                <p style="margin: 0 0 10px; font-family: Gilroy, 'Avenir Next', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 12px; line-height: 1.3; font-weight: 600; letter-spacing: 1.6px; color: #6F6F6F; text-transform: uppercase;">Email</p>
                <p style="margin: 0; font-family: Gilroy, 'Avenir Next', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 19px; line-height: 1.45; font-weight: 700; color: ${emailBrand.onyx}; word-break: break-word;"><a href="mailto:${escapeHtml(notification.email)}" style="color: ${emailBrand.navy}; text-decoration: underline;">${escapeHtml(notification.email)}</a></p>
              </td>
            </tr>
            <tr>
              <td colspan="2" valign="top" style="padding: 25px 0 26px; border-bottom: 1px solid #D8C89F;">
                <p style="margin: 0 0 10px; font-family: Gilroy, 'Avenir Next', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 12px; line-height: 1.3; font-weight: 600; letter-spacing: 1.6px; color: #6F6F6F; text-transform: uppercase;">Interest</p>
                <p style="margin: 0; font-family: Gilroy, 'Avenir Next', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 20px; line-height: 1.5; font-weight: 400; color: ${emailBrand.onyx};">${escapeHtml(displayValue(notification.interest))}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td class="aixco-shell-padding" style="padding: 43px 46px 0; background: ${emailBrand.white};">
          <p style="margin: 0 0 17px; font-family: Gilroy, 'Avenir Next', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.3; font-weight: 700; letter-spacing: 2.8px; color: ${emailBrand.documentGold}; text-transform: uppercase;">Client message</p>
          <div class="aixco-message" style="padding: 34px 34px 34px 36px; border-left: 4px solid ${emailBrand.documentGold}; background: ${emailBrand.ivory}; white-space: pre-wrap; font-family: Gilroy, 'Avenir Next', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 20px; line-height: 1.72; color: ${emailBrand.onyx};">${escapeHtml(notification.message)}</div>
        </td>
      </tr>
      <tr>
        <td class="aixco-shell-padding" style="padding: 32px 46px 0; background: ${emailBrand.white};">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse;">
            <tr>
              <td style="background: ${emailBrand.onyx};">
                <a class="aixco-reply" href="${escapeHtml(replyHref)}" style="display: inline-block; padding: 20px 32px; font-family: Gilroy, 'Avenir Next', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.2; font-weight: 700; letter-spacing: 1.5px; color: ${emailBrand.gold}; text-decoration: none; text-transform: uppercase;">Reply to ${escapeHtml(notification.name)}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td class="aixco-shell-padding" style="padding: 43px 46px 42px; background: ${emailBrand.white};">
          <p style="margin: 0 0 17px; font-family: Gilroy, 'Avenir Next', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.3; font-weight: 700; letter-spacing: 2.8px; color: ${emailBrand.documentGold}; text-transform: uppercase;">Request context</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse; border-top: 1px solid #D8C89F;">
            ${contextRows
              .map(([label, value]) => {
                const renderedValue = escapeHtml(displayValue(value));
                const isReferrer = label === "Referrer" && referrerUrl;
                return `
                  <tr>
                    <th width="34%" valign="top" style="padding: 14px 14px 14px 0; border-bottom: 1px solid #E2D8BF; font-family: Gilroy, 'Avenir Next', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 12px; line-height: 1.45; font-weight: 600; letter-spacing: 1.5px; color: #6F6F6F; text-align: left; text-transform: uppercase;">${escapeHtml(String(label))}</th>
                    <td valign="top" style="padding: 14px 0; border-bottom: 1px solid #E2D8BF; font-family: Gilroy, 'Avenir Next', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.5; color: ${emailBrand.onyx}; word-break: break-word;">${isReferrer ? `<a href="${escapeHtml(referrerUrl)}" style="color: #1155CC; text-decoration: underline;">${renderedValue}</a>` : renderedValue}</td>
                  </tr>`;
              })
              .join("")}
          </table>
        </td>
      </tr>`,
  });
}

async function postResendEmail(
  apiKey: string,
  body: Record<string, unknown>,
  options: EmailSendOptions,
): Promise<EmailProviderDeliveryResult> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = Math.max(10, Math.min(options.timeoutMs ?? 10_000, 30_000));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...(options.idempotencyKey ? { "Idempotency-Key": options.idempotencyKey } : {}),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    let payload: ResendSendResponse = {};
    try {
      payload = (await response.json()) as ResendSendResponse;
    } catch {
      // A successful response may be empty, while failures still get a safe status fallback.
    }

    if (!response.ok) {
      return {
        ok: false,
        reason: payload.message || payload.name || `Resend request failed with status ${response.status}.`,
        retryable:
          response.status === 408 ||
          response.status === 409 ||
          response.status === 425 ||
          response.status === 429 ||
          response.status >= 500,
      };
    }

    return { ok: true, providerMessageId: payload.id ?? null };
  } catch (error) {
    if (controller.signal.aborted) {
      return { ok: false, reason: `Resend request timed out after ${timeoutMs}ms.`, retryable: true };
    }

    return {
      ok: false,
      reason: error instanceof Error ? error.message : "Unknown Resend request error.",
      retryable: true,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function sendLeadNotificationTestEmail(
  input: {
    replyTo?: string;
    message: string;
  },
  options: EmailSendOptions = {},
): Promise<EmailDeliveryTestResult> {
  const config = getLeadNotificationConfig(options.env ?? process.env);

  if (!config.configured) {
    return {
      ok: false,
      skipped: true,
      reason: `Lead notification email configuration is not available: ${config.missing.join(", ")}.`,
    };
  }

  const sentAt = new Date().toISOString();
  const text = [
    "AIXCO info inbox delivery test",
    "",
    input.message,
    "",
    `Sent from the authenticated admin dashboard at ${sentAt}.`,
  ].join("\n");
  const html = buildBrandedEmailShell({
    preheader: "AIXCO info inbox delivery test.",
    eyebrow: "Delivery test",
    title: "AIXCO inbox verification",
    subtitle: "This message confirms that authenticated website email delivery is working.",
    content: `
      <tr>
        <td style="padding: 32px 34px; background: ${emailBrand.white};">
          <p style="margin: 0 0 14px; font-family: Arial, Helvetica, sans-serif; font-size: 11px; line-height: 1.3; font-weight: 700; letter-spacing: 2px; color: ${emailBrand.documentGold}; text-transform: uppercase;">Test message</p>
          <div style="padding: 22px 22px 22px 24px; border-left: 3px solid ${emailBrand.documentGold}; background: ${emailBrand.ivory}; white-space: pre-wrap; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.65; color: ${emailBrand.onyx};">${escapeHtml(input.message)}</div>
          <p style="margin: 18px 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 1.55; color: #666666;">Sent from the authenticated admin dashboard at ${escapeHtml(sentAt)}.</p>
        </td>
      </tr>`,
  });
  const result = await postResendEmail(
    config.apiKey,
    {
      from: config.from,
      to: config.to,
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      subject: "[TEST] AIXCO info inbox delivery check",
      text,
      html,
      tags: [{ name: "source", value: "admin_email_test" }],
    },
    options,
  );

  return result.ok
    ? { ok: true, id: result.providerMessageId ?? undefined, to: config.to }
    : result;
}
export async function sendContactLeadNotificationEmail(
  notification: ContactLeadNotification,
  options: EmailSendOptions = {},
): Promise<EmailProviderDeliveryResult> {
  const config = getLeadNotificationConfig(options.env ?? process.env);

  if (!config.configured) {
    return {
      ok: false,
      skipped: true,
      retryable: false,
      reason: `Lead notification email configuration is not available: ${config.missing.join(", ")}.`,
    };
  }

  return postResendEmail(
    config.apiKey,
    {
      from: config.from,
      to: config.to,
      reply_to: notification.email,
      subject: `[${notification.requestReference}] New AIXCO lead: ${notification.interest ?? "Website inquiry"}`,
      text: buildText(notification),
      html: buildContactLeadNotificationHtml(notification),
      tags: [{ name: "source", value: "lead_notification" }],
    },
    options,
  );
}

export async function sendContactConfirmationEmail(
  notification: ContactLeadNotification,
  options: EmailSendOptions = {},
): Promise<EmailProviderDeliveryResult> {
  const config = getEmailSenderConfig(options.env ?? process.env);

  if (!config.configured) {
    return {
      ok: false,
      skipped: true,
      retryable: false,
      reason: `Contact confirmation email configuration is not available: ${config.missing.join(", ")}.`,
    };
  }

  const confirmation = buildContactConfirmationEmail(notification);
  return postResendEmail(
    config.apiKey,
    {
      from: config.from,
      to: [notification.email],
      subject: confirmation.subject,
      text: confirmation.text,
      html: confirmation.html,
      tags: [
        { name: "source", value: "contact_confirmation" },
        { name: "request_type", value: confirmation.requestType },
      ],
    },
    options,
  );
}
