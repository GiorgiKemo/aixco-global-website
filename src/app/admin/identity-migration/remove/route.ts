import { NextResponse } from "next/server";
import { getAal2AdminAuthDecision, getAdminAuthConfig } from "@/lib/admin/auth";
import { auditAdminAction } from "@/lib/admin/audit";
import { privacySubjectAuditTarget } from "@/lib/admin/privacy";
import { removeAdminIdentity } from "@/lib/admin/identity-migration";

function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}

export async function POST(request: Request) {
  const auth = await getAal2AdminAuthDecision();
  if (!auth.ok) return redirectTo(request, "/admin/login");

  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return new NextResponse("Forbidden", { status: 403 });

  const formData = await request.formData().catch(() => null);
  const targetUserId = typeof formData?.get("targetUserId") === "string" ? formData.get("targetUserId") as string : "";
  const confirmEmail = typeof formData?.get("confirmEmail") === "string" ? formData.get("confirmEmail") as string : "";
  const confirmText = typeof formData?.get("confirmText") === "string" ? formData.get("confirmText") as string : "";
  if (!targetUserId || !confirmEmail.trim() || confirmText.trim().toUpperCase() !== "REMOVE") {
    return redirectTo(request, "/admin/identity-migration?error=remove-confirmation");
  }

  const config = getAdminAuthConfig();
  try {
    // The helper re-reads the target from Supabase, so the email confirmation
    // is checked against the current identity rather than trusted blindly.
    const supabase = await import("@/lib/supabase/admin").then(({ getSupabaseAdminClient }) => getSupabaseAdminClient());
    const targetResult = await supabase.auth.admin.getUserById(targetUserId);
    const targetEmail = targetResult.data?.user?.email?.trim().toLowerCase() ?? "";
    if (!targetResult.data?.user || !targetEmail || targetEmail !== confirmEmail.trim().toLowerCase()) {
      return redirectTo(request, "/admin/identity-migration?error=remove-confirmation");
    }

    await auditAdminAction({
      action: "admin.identity.remove.requested",
      actor: auth.principal,
      outcome: "success",
      target: privacySubjectAuditTarget(targetEmail),
      details: { targetUserId },
      headers: request.headers,
    }, { required: true });

    const removed = await removeAdminIdentity(targetUserId, auth.principal.id, config.role);
    await auditAdminAction({
      action: "admin.identity.remove",
      actor: auth.principal,
      outcome: "success",
      target: privacySubjectAuditTarget(removed.email ?? targetEmail),
      details: { targetUserId: removed.id, remainingAdminCount: removed.remainingAdminCount },
      headers: request.headers,
    });
    return redirectTo(request, "/admin/identity-migration?removed=1");
  } catch {
    await auditAdminAction({
      action: "admin.identity.remove",
      actor: auth.principal,
      outcome: "failure",
      target: privacySubjectAuditTarget(confirmEmail.trim().toLowerCase()),
      details: { targetUserId },
      headers: request.headers,
    });
    return redirectTo(request, "/admin/identity-migration?error=remove-failed");
  }
}
