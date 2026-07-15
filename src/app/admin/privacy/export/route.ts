import { NextResponse } from "next/server";
import { getAdminAuthDecision } from "@/lib/admin/auth";
import { auditAdminAction } from "@/lib/admin/audit";
import { exportContactSubjectData, privacyEmailSchema } from "@/lib/admin/privacy";

export async function POST(request: Request) {
  const auth = await getAdminAuthDecision();
  if (!auth.ok) return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });

  const requestOrigin = request.headers.get("origin");
  if (requestOrigin && requestOrigin !== new URL(request.url).origin) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  const email = privacyEmailSchema.safeParse(formData?.get("email"));
  if (!email.success) return NextResponse.redirect(new URL("/admin/privacy?error=invalid-email", request.url), { status: 303 });

  try {
    const data = await exportContactSubjectData(email.data);
    auditAdminAction({
      action: "privacy.subject.export",
      actor: auth.principal,
      outcome: "success",
      target: email.data,
      details: { records: data.contactSubmissions.length },
    });

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": 'attachment; filename="aixco-data-export.json"',
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  } catch {
    auditAdminAction({
      action: "privacy.subject.export",
      actor: auth.principal,
      outcome: "failure",
      target: email.data,
    });
    return NextResponse.redirect(new URL("/admin/privacy?error=export-failed", request.url), { status: 303 });
  }
}
