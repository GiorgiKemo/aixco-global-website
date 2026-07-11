import type { CaptureResult } from "@/lib/backend/lead-capture-contracts";
import type { Json } from "@/lib/supabase/database.types";

type Env = Record<string, string | undefined>;

export type ContactLeadNotification = {
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

type ResendSendResponse = {
  id?: string;
  message?: string;
  name?: string;
};

export type EmailDeliveryTestResult =
  | { ok: true; id: string | null; to: string[] }
  | { ok: false; skipped?: boolean; reason: string };

function readEnv(env: Env, name: string) {
  return env[name]?.trim() ?? "";
}

function splitRecipients(value: string) {
  return value
    .split(",")
    .map((recipient) => recipient.trim())
    .filter(Boolean);
}

export function getLeadNotificationConfig(env: Env = process.env): LeadNotificationConfig {
  const apiKey = readEnv(env, "RESEND_API_KEY");
  const from = readEnv(env, "LEAD_NOTIFICATION_FROM");
  const to = splitRecipients(readEnv(env, "LEAD_NOTIFICATION_TO"));
  const missing: string[] = [];

  if (!apiKey) missing.push("RESEND_API_KEY");
  if (!from) missing.push("LEAD_NOTIFICATION_FROM");
  if (to.length === 0) missing.push("LEAD_NOTIFICATION_TO");

  return {
    configured: missing.length === 0,
    apiKey,
    from,
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

function buildText(notification: ContactLeadNotification) {
  const metadata = getMetadataObject(notification.metadata);

  return [
    "New AIXCO website contact request",
    "",
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

function buildHtml(notification: ContactLeadNotification) {
  const metadata = getMetadataObject(notification.metadata);
  const rows = [
    ["Name", notification.name],
    ["Email", notification.email],
    ["Interest", notification.interest],
    ["Page", notification.pagePath],
    ["Locale", notification.locale],
    ["Timezone", typeof metadata.timezone === "string" ? metadata.timezone : null],
    ["Referrer", typeof metadata.referrer === "string" ? metadata.referrer : null],
    [
      "Viewport",
      metadata.viewport_width && metadata.viewport_height ? `${metadata.viewport_width}x${metadata.viewport_height}` : null,
    ],
    ["User agent", notification.userAgent],
  ];

  return `
    <div style="font-family: Arial, sans-serif; color: #151515; line-height: 1.5;">
      <h1 style="font-size: 22px; margin: 0 0 16px;">New AIXCO website contact request</h1>
      <table style="border-collapse: collapse; width: 100%; max-width: 720px;">
        <tbody>
          ${rows
            .map(([label, value]) => `
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px 10px; text-align: left; width: 150px; background: #f7f4ee;">${escapeHtml(String(label))}</th>
                <td style="border: 1px solid #ddd; padding: 8px 10px;">${escapeHtml(value ? String(value) : "Not provided")}</td>
              </tr>
            `)
            .join("")}
        </tbody>
      </table>
      <h2 style="font-size: 16px; margin: 20px 0 8px;">Message</h2>
      <div style="white-space: pre-wrap; border: 1px solid #ddd; background: #fbfaf7; padding: 12px; max-width: 720px;">${escapeHtml(notification.message)}</div>
    </div>
  `;
}

async function readErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as ResendSendResponse;
    return payload.message || payload.name || `Resend request failed with status ${response.status}.`;
  } catch {
    return `Resend request failed with status ${response.status}.`;
  }
}

async function readSendId(response: Response) {
  try {
    const payload = (await response.json()) as ResendSendResponse;
    return payload.id ?? null;
  } catch {
    return null;
  }
}

export async function sendLeadNotificationTestEmail(
  input: {
    replyTo?: string;
    message: string;
  },
  options: {
    env?: Env;
    fetchImpl?: typeof fetch;
  } = {},
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
  const html = `
    <div style="font-family: Arial, sans-serif; color: #151515; line-height: 1.5;">
      <h1 style="font-size: 22px; margin: 0 0 16px;">AIXCO info inbox delivery test</h1>
      <div style="white-space: pre-wrap; border: 1px solid #ddd; background: #fbfaf7; padding: 12px; max-width: 720px;">${escapeHtml(input.message)}</div>
      <p style="margin: 16px 0 0; color: #666; font-size: 13px;">Sent from the authenticated admin dashboard at ${escapeHtml(sentAt)}.</p>
    </div>
  `;
  const fetchImpl = options.fetchImpl ?? fetch;
  const response = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.from,
      to: config.to,
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      subject: "[TEST] AIXCO info inbox delivery check",
      text,
      html,
      tags: [{ name: "source", value: "admin_email_test" }],
    }),
  });

  if (!response.ok) {
    return { ok: false, reason: await readErrorMessage(response) };
  }

  return { ok: true, id: await readSendId(response), to: config.to };
}
export async function sendContactLeadNotificationEmail(
  notification: ContactLeadNotification,
  options: {
    env?: Env;
    fetchImpl?: typeof fetch;
  } = {},
): Promise<CaptureResult> {
  const config = getLeadNotificationConfig(options.env ?? process.env);

  if (!config.configured) {
    return {
      ok: false,
      skipped: true,
      reason: `Lead notification email configuration is not available: ${config.missing.join(", ")}.`,
    };
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const response = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.from,
      to: config.to,
      reply_to: notification.email,
      subject: `New AIXCO lead: ${notification.interest ?? "Website inquiry"}`,
      text: buildText(notification),
      html: buildHtml(notification),
    }),
  });

  if (!response.ok) {
    return { ok: false, reason: await readErrorMessage(response) };
  }

  return { ok: true };
}
