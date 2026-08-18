import "server-only";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const adminInviteEmailSchema = z.string().trim().email().max(255).transform((value) => value.toLowerCase());

const identityInviteEmailConfigSchema = z.object({
  apiKey: z.string().trim().min(1),
  from: z.string().trim().min(1),
});

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getConfig() {
  const parsed = identityInviteEmailConfigSchema.safeParse({
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.ADMIN_INVITE_FROM || process.env.LEAD_NOTIFICATION_FROM,
  });
  if (!parsed.success) {
    throw new Error("Administrator invitation email delivery is not configured.");
  }
  return parsed.data;
}

function buildInviteText(email: string, actionLink: string) {
  return [
    "AIXCO administrator invitation",
    "",
    `You have been invited to manage the AIXCO admin dashboard as ${email}.`,
    "",
    "Open this secure invitation link to create your administrator password. MFA is optional.",
    actionLink,
    "",
    "This link is single-use. If it expires, an administrator can send another invitation from the dashboard.",
    "",
    "AIXCO Global",
    "https://www.aixco.global",
  ].join("\n");
}

function buildInviteHtml(email: string, actionLink: string) {
  const escapedEmail = escapeHtml(email);
  const escapedLink = escapeHtml(actionLink);
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f3ede1;color:#161616;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:640px;margin:0 auto;padding:32px 18px;">
      <div style="background:#ffffff;border-top:5px solid #9c7f3c;padding:36px 34px;">
        <p style="margin:0 0 12px;color:#9c7f3c;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">AIXCO Admin</p>
        <h1 style="margin:0;color:#161616;font-size:32px;line-height:1.15;">Your administrator invitation</h1>
        <p style="margin:22px 0 0;color:#4f4f4f;font-size:16px;line-height:1.6;">You have been invited to manage the AIXCO admin dashboard as <strong>${escapedEmail}</strong>.</p>
        <p style="margin:26px 0 0;"><a href="${escapedLink}" style="display:inline-block;background:#161616;color:#e6c767;padding:15px 22px;text-decoration:none;font-weight:700;border-radius:6px;">Accept invitation</a></p>
        <p style="margin:24px 0 0;color:#6f6e6a;font-size:13px;line-height:1.6;">This secure link is single-use. It will take you to AIXCO to create your administrator password. MFA is optional. If it expires, an administrator can send another invitation from the dashboard.</p>
        <p style="margin:28px 0 0;color:#6f6e6a;font-size:13px;line-height:1.6;word-break:break-word;">If the button does not work, copy and paste this URL into your browser:<br><a href="${escapedLink}" style="color:#735a20;">${escapedLink}</a></p>
      </div>
      <p style="margin:18px 0 0;color:#6f6e6a;text-align:center;font-size:12px;">AIXCO Global · <a href="https://www.aixco.global" style="color:#735a20;">www.aixco.global</a></p>
    </div>
  </body>
</html>`;
}

type GeneratedAdminInvite = {
  id: string;
  email: string;
  actionLink: string;
  appMetadata: Record<string, unknown>;
};

export async function generateAdminIdentityInvite(
  email: string,
  options: { redirectTo: string; expectedUserId?: string },
): Promise<GeneratedAdminInvite> {
  const normalizedEmail = adminInviteEmailSchema.parse(email);
  const supabase = await getSupabaseAdminClient();
  const generated = await supabase.auth.admin.generateLink({
    type: "invite",
    email: normalizedEmail,
    options: { redirectTo: options.redirectTo },
  });
  const actionLink = generated.data?.properties?.action_link;
  const hashedToken = generated.data?.properties?.hashed_token;
  const generatedUser = generated.data?.user;
  if (generated.error || !generatedUser || !actionLink || !hashedToken) {
    throw new Error("A new administrator invitation link could not be generated.");
  }
  if (options.expectedUserId && generatedUser.id !== options.expectedUserId) {
    throw new Error("A new administrator invitation link could not be generated.");
  }

  let actionUrl: URL;
  try {
    actionUrl = new URL(actionLink);
  } catch {
    throw new Error("A new administrator invitation link could not be generated.");
  }
  if (actionUrl.protocol !== "https:" || actionUrl.searchParams.get("redirect_to") !== options.redirectTo) {
    throw new Error("Supabase Auth redirect URL is not configured for the public site.");
  }

  // Do not send Supabase's one-time verification URL directly. Email security
  // scanners commonly prefetch links and would consume it before the recipient
  // clicks. The AIXCO callback stores the hash in an HttpOnly cookie and only
  // verifies it after the recipient presses Continue.
  const acceptUrl = new URL("/admin/auth/callback", options.redirectTo);
  acceptUrl.searchParams.set("token_hash", hashedToken);
  acceptUrl.searchParams.set("type", "invite");

  return {
    id: generatedUser.id,
    email: normalizedEmail,
    actionLink: acceptUrl.toString(),
    appMetadata: generatedUser.app_metadata ?? {},
  };
}

export async function sendAdminIdentityInviteEmail(
  email: string,
  actionLink: string,
  options: { fetchImpl?: typeof fetch } = {},
) {
  const normalizedEmail = adminInviteEmailSchema.parse(email);
  const config = getConfig();
  const response = await (options.fetchImpl ?? fetch)("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `admin-invite-${randomUUID()}`,
    },
    body: JSON.stringify({
      from: config.from,
      to: [normalizedEmail],
      subject: "Your AIXCO administrator invitation",
      text: buildInviteText(normalizedEmail, actionLink),
      html: buildInviteHtml(normalizedEmail, actionLink),
      tags: [{ name: "source", value: "admin_identity_invite" }],
    }),
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    // Keep the outward error generic; provider response bodies may contain sensitive details.
  }

  if (!response.ok) throw new Error("The administrator invitation email could not be sent.");

  const providerId = payload && typeof payload === "object" && !Array.isArray(payload)
    ? (payload as { id?: unknown }).id
    : null;
  if (typeof providerId !== "string" || !providerId.trim()) {
    throw new Error("The administrator invitation email provider returned no message id.");
  }

  return { email: normalizedEmail, providerMessageId: providerId };
}

export async function resendAdminIdentityInvite(
  email: string,
  options: {
    expectedUserId: string;
    redirectTo: string;
    fetchImpl?: typeof fetch;
  },
) {
  const normalizedEmail = adminInviteEmailSchema.parse(email);
  const supabase = await getSupabaseAdminClient();
  const current = await supabase.auth.admin.getUserById(options.expectedUserId);
  const currentUser = current.data.user;

  if (
    current.error
    || !currentUser
    || currentUser.id !== options.expectedUserId
    || currentUser.email?.trim().toLowerCase() !== normalizedEmail
    || currentUser.last_sign_in_at
  ) {
    throw new Error("This administrator no longer has a pending invitation.");
  }

  const generated = await generateAdminIdentityInvite(normalizedEmail, {
    expectedUserId: options.expectedUserId,
    redirectTo: options.redirectTo,
  });
  return sendAdminIdentityInviteEmail(normalizedEmail, generated.actionLink, {
    fetchImpl: options.fetchImpl,
  });
}
