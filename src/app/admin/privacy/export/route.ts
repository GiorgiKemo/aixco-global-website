import { NextResponse } from "next/server";
import { getAal2AdminAuthDecision } from "@/lib/admin/auth";
import { auditAdminAction } from "@/lib/admin/audit";
import { verifyPrivacyPreviewToken } from "@/lib/admin/privacy-preview-token";
import {
  exportContactSubjectData,
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
  const previewToken = formData?.get("preview_token");
  if (
    !email.success
    || typeof previewToken !== "string"
    || !verifyPrivacyPreviewToken(previewToken, email.data, auth.principal.id)
  ) {
    return NextResponse.redirect(new URL("/admin/privacy?error=invalid-export-preview", request.url), { status: 303 });
  }

  try {
    await auditAdminAction({
      action: "privacy.subject.export.requested",
      actor: auth.principal,
      outcome: "success",
      target: privacySubjectAuditTarget(email.data),
      headers: request.headers,
    }, { required: true });

    const data = await exportContactSubjectData(email.data);
    await auditAdminAction({
      action: "privacy.subject.export",
      actor: auth.principal,
      outcome: "success",
      target: privacySubjectAuditTarget(email.data),
      details: {
        submissions: data.contactSubmissions.length,
        chatTranscripts: data.chatTranscripts.length,
        deliveries: data.emailDeliveries.length,
        deliveryEvents: data.emailEvents.length,
        abuseAttempts: data.leadCaptureAttempts.length,
      },
      headers: request.headers,
    });

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": 'attachment; filename="aixco-data-export.json"',
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  } catch {
    await auditAdminAction({
      action: "privacy.subject.export",
      actor: auth.principal,
      outcome: "failure",
      target: privacySubjectAuditTarget(email.data),
      headers: request.headers,
    });
    return NextResponse.redirect(new URL("/admin/privacy?error=export-failed", request.url), { status: 303 });
  }
}
