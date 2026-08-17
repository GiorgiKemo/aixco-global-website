import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getAdminAuthConfig, getAdminAuthDecision } from "@/lib/admin/auth";
import { auditAdminAction } from "@/lib/admin/audit";
import {
  adminInviteEmailSchema,
  claimAdminIdentityBootstrap,
  completeAdminIdentityBootstrap,
  getAdminIdentityMigrationStatus,
  inviteAdminIdentity,
  releaseAdminIdentityBootstrap,
} from "@/lib/admin/identity-migration";
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

  const config = getAdminAuthConfig();
  const status = await getAdminIdentityMigrationStatus(config.role).catch(() => null);
  if (!status || status.sourceStatus !== "available") {
    return redirectTo(request, "/admin/identity-migration?error=source-unavailable");
  }
  if (
    auth.principal.authentication === "legacy-shared-password"
    && status.admins.length > 0
  ) {
    return redirectTo(request, "/admin/identity-migration?error=migration-invite-closed");
  }

  let bootstrapClaimId: string | null = null;
  if (auth.principal.authentication === "legacy-shared-password") {
    bootstrapClaimId = randomUUID();
    try {
      const claimed = await claimAdminIdentityBootstrap(bootstrapClaimId);
      if (!claimed) {
        return redirectTo(request, "/admin/identity-migration?error=migration-invite-closed");
      }
    } catch {
      return redirectTo(request, "/admin/identity-migration?error=source-unavailable");
    }
  }

  let inviteAttempted = false;
  try {
    await auditAdminAction({
      action: "admin.identity.invite.requested",
      actor: auth.principal,
      outcome: "success",
      target: privacySubjectAuditTarget(email.data),
      headers: request.headers,
    }, { required: true });

    inviteAttempted = true;
    const inviteOrigin = process.env.NODE_ENV === "production"
      ? getSiteUrl()
      : new URL(request.url).origin;
    const invited = await inviteAdminIdentity(email.data, {
      role: config.role,
      redirectTo: `${inviteOrigin}/admin/auth/complete`,
    });
    if (bootstrapClaimId) {
      try {
        const completed = await completeAdminIdentityBootstrap(bootstrapClaimId, invited.id);
        if (!completed) {
          console.error("Could not mark the administrator bootstrap claim complete.");
        }
      } catch {
        // The named admin already exists. Keep the durable claim in place and
        // rely on the identity-source check to close all subsequent attempts.
        console.error("Could not mark the administrator bootstrap claim complete.");
      }
    }
    await auditAdminAction({
      action: "admin.identity.invite",
      actor: auth.principal,
      outcome: "success",
      target: privacySubjectAuditTarget(email.data),
      headers: request.headers,
    });
    return redirectTo(request, "/admin/identity-migration?invited=1");
  } catch {
    if (bootstrapClaimId && !inviteAttempted) {
      try {
        const released = await releaseAdminIdentityBootstrap(bootstrapClaimId);
        if (!released) {
          console.error("Could not release an unused administrator bootstrap claim.");
        }
      } catch {
        console.error("Could not release an unused administrator bootstrap claim.");
      }
    }
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
