import { NextResponse } from "next/server";
import { getAal2AdminAuthDecision } from "@/lib/admin/auth";
import { auditAdminAction } from "@/lib/admin/audit";
import { verifyPrivacyPreviewToken } from "@/lib/admin/privacy-preview-token";
import {
  deleteContactSubjectData,
  privacyEmailSchema,
  privacySubjectAuditTarget,
} from "@/lib/admin/privacy";

export async function POST(request: Request) {
  const auth = await getAal2AdminAuthDecision();
  if (!auth.ok) return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });

  const requestOrigin = request.headers.get("origin");
  if (!requestOrigin || requestOrigin !== new URL(request.url).origin) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  const email = privacyEmailSchema.safeParse(formData?.get("email"));
  const previewedEmail = privacyEmailSchema.safeParse(formData?.get("previewed_email"));
  const confirmationEmail = privacyEmailSchema.safeParse(formData?.get("confirmation_email"));
  const previewToken = formData?.get("preview_token");
  const confirmed = formData?.get("confirmation") === "DELETE";
  const exactSubjectConfirmed = Boolean(
    email.success
      && previewedEmail.success
      && confirmationEmail.success
      && previewedEmail.data === email.data
      && confirmationEmail.data === email.data
      && typeof previewToken === "string"
      && verifyPrivacyPreviewToken(previewToken, email.data, auth.principal.id),
  );
  if (!email.success || !confirmed || !exactSubjectConfirmed) {
    return NextResponse.redirect(new URL("/admin/privacy?error=invalid-deletion", request.url), { status: 303 });
  }

  try {
    await auditAdminAction({
      action: "privacy.subject.delete.requested",
      actor: auth.principal,
      outcome: "success",
      target: privacySubjectAuditTarget(email.data),
      headers: request.headers,
    }, { required: true });

    const result = await deleteContactSubjectData(email.data);
    await auditAdminAction({
      action: "privacy.subject.delete",
      actor: auth.principal,
      outcome: "success",
      target: privacySubjectAuditTarget(email.data),
      details: {
        records: result.deleted,
      },
      headers: request.headers,
    });
    return NextResponse.redirect(new URL(`/admin/privacy?deleted=${result.deleted}`, request.url), { status: 303 });
  } catch {
    await auditAdminAction({
      action: "privacy.subject.delete",
      actor: auth.principal,
      outcome: "failure",
      target: privacySubjectAuditTarget(email.data),
      headers: request.headers,
    });
    return NextResponse.redirect(new URL("/admin/privacy?error=delete-failed", request.url), { status: 303 });
  }
}
