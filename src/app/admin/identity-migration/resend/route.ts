import { NextResponse } from "next/server";
import { getAal2AdminAuthDecision, getAdminAuthConfig } from "@/lib/admin/auth";
import { auditAdminAction } from "@/lib/admin/audit";
import { resendAdminIdentityInvite } from "@/lib/admin/identity-invite-email";
import {
  getAdminIdentityMigrationStatus,
} from "@/lib/admin/identity-migration";
import { adminInviteEmailSchema } from "@/lib/admin/identity-invite-email";
import { privacySubjectAuditTarget } from "@/lib/admin/privacy";
import { getSiteUrl } from "@/lib/site-url";

function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}

export async function POST(request: Request) {
  const auth = await getAal2AdminAuthDecision();
  if (!auth.ok) return redirectTo(request, "/admin/login");

  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return new NextResponse("Forbidden", { status: 403 });

  const formData = await request.formData().catch(() => null);
  const email = adminInviteEmailSchema.safeParse(formData?.get("email"));
  if (!email.success) return redirectTo(request, "/admin/identity-migration?error=invalid-email");

  const config = getAdminAuthConfig();
  const status = await getAdminIdentityMigrationStatus(config.role).catch(() => null);
  if (!status || status.sourceStatus !== "available") {
    return redirectTo(request, "/admin/identity-migration?error=source-unavailable");
  }

  const pendingAdmin = status.admins.find(
    (admin) => admin.email?.trim().toLowerCase() === email.data
      && admin.invitedAt !== null
      && admin.lastSignInAt === null,
  );
  if (!pendingAdmin) {
    return redirectTo(request, "/admin/identity-migration?error=invite-not-pending");
  }

  try {
    await auditAdminAction({
      action: "admin.identity.invite.resend.requested",
      actor: auth.principal,
      outcome: "success",
      target: privacySubjectAuditTarget(email.data),
      headers: request.headers,
    }, { required: true });

    await resendAdminIdentityInvite(email.data, {
      expectedUserId: pendingAdmin.id,
      redirectTo: `${getSiteUrl()}/admin/auth/complete`,
    });

    await auditAdminAction({
      action: "admin.identity.invite.resend",
      actor: auth.principal,
      outcome: "success",
      target: privacySubjectAuditTarget(email.data),
      headers: request.headers,
    });
    return redirectTo(request, "/admin/identity-migration?resent=1");
  } catch {
    await auditAdminAction({
      action: "admin.identity.invite.resend",
      actor: auth.principal,
      outcome: "failure",
      target: privacySubjectAuditTarget(email.data),
      headers: request.headers,
    });
    return redirectTo(request, "/admin/identity-migration?error=resend-failed");
  }
}
