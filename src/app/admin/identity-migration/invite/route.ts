import { NextResponse } from "next/server";
import { getAdminAuthConfig, getAdminAuthDecision } from "@/lib/admin/auth";
import { auditAdminAction } from "@/lib/admin/audit";
import { adminInviteEmailSchema, inviteAdminIdentity } from "@/lib/admin/identity-migration";
import { privacySubjectAuditTarget } from "@/lib/admin/privacy";
import { getSiteUrl } from "@/lib/site-url";

function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}

export async function POST(request: Request) {
  const auth = await getAdminAuthDecision();
  if (!auth.ok) return redirectTo(request, "/admin/login");

  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return new NextResponse("Forbidden", { status: 403 });

  const formData = await request.formData().catch(() => null);
  const email = adminInviteEmailSchema.safeParse(formData?.get("email"));
  if (!email.success) return redirectTo(request, "/admin/identity-migration?error=invalid-email");

  try {
    await auditAdminAction({
      action: "admin.identity.invite.requested",
      actor: auth.principal,
      outcome: "success",
      target: privacySubjectAuditTarget(email.data),
      headers: request.headers,
    }, { required: true });

    const config = getAdminAuthConfig();
    const inviteOrigin = process.env.NODE_ENV === "production"
      ? getSiteUrl()
      : new URL(request.url).origin;
    await inviteAdminIdentity(email.data, {
      role: config.role,
      redirectTo: `${inviteOrigin}/admin/auth/complete`,
    });
    await auditAdminAction({
      action: "admin.identity.invite",
      actor: auth.principal,
      outcome: "success",
      target: privacySubjectAuditTarget(email.data),
      headers: request.headers,
    });
    return redirectTo(request, "/admin/identity-migration?invited=1");
  } catch {
    await auditAdminAction({
      action: "admin.identity.invite",
      actor: auth.principal,
      outcome: "failure",
      target: privacySubjectAuditTarget(email.data),
      headers: request.headers,
    });
    return redirectTo(request, "/admin/identity-migration?error=invite-failed");
  }
}
