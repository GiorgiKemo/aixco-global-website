import { NextResponse } from "next/server";
import { getAdminAuthDecision } from "@/lib/admin/auth";
import { auditAdminAction } from "@/lib/admin/audit";
import {
  deleteContactSubjectData,
  privacyEmailSchema,
  privacySubjectAuditTarget,
} from "@/lib/admin/privacy";

export async function POST(request: Request) {
  const auth = await getAdminAuthDecision();
  if (!auth.ok) return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });

  const requestOrigin = request.headers.get("origin");
  if (!requestOrigin || requestOrigin !== new URL(request.url).origin) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  const email = privacyEmailSchema.safeParse(formData?.get("email"));
  const confirmed = formData?.get("confirmation") === "DELETE";
  if (!email.success || !confirmed) {
    return NextResponse.redirect(new URL("/admin/privacy?error=invalid-deletion", request.url), { status: 303 });
  }

  try {
    const result = await deleteContactSubjectData(email.data);
    auditAdminAction({
      action: "privacy.subject.delete",
      actor: auth.principal,
      outcome: "success",
      target: privacySubjectAuditTarget(email.data),
      details: { records: result.deleted },
    });
    return NextResponse.redirect(new URL(`/admin/privacy?deleted=${result.deleted}`, request.url), { status: 303 });
  } catch {
    auditAdminAction({
      action: "privacy.subject.delete",
      actor: auth.principal,
      outcome: "failure",
      target: privacySubjectAuditTarget(email.data),
    });
    return NextResponse.redirect(new URL("/admin/privacy?error=delete-failed", request.url), { status: 303 });
  }
}
