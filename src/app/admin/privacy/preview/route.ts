import { NextResponse } from "next/server";
import { getAal2AdminAuthDecision } from "@/lib/admin/auth";
import { auditAdminAction } from "@/lib/admin/audit";
import { createPrivacyPreviewToken } from "@/lib/admin/privacy-preview-token";
import {
  previewContactSubjectData,
  privacyEmailSchema,
  privacySubjectAuditTarget,
} from "@/lib/admin/privacy";

export async function POST(request: Request) {
  const auth = await getAal2AdminAuthDecision();
  if (!auth.ok) {
    return NextResponse.json({ error: "not-authenticated" }, { status: 401 });
  }

  const requestOrigin = request.headers.get("origin");
  if (!requestOrigin || requestOrigin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const email = privacyEmailSchema.safeParse(
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>).email
      : null,
  );
  if (!email.success) {
    return NextResponse.json({ error: "invalid-email" }, { status: 400 });
  }

  try {
    await auditAdminAction({
      action: "privacy.subject.preview.requested",
      actor: auth.principal,
      outcome: "success",
      target: privacySubjectAuditTarget(email.data),
      headers: request.headers,
    }, { required: true });

    const preview = await previewContactSubjectData(email.data);
    const previewToken = createPrivacyPreviewToken(email.data, auth.principal.id);
    if (!previewToken) throw new Error("privacy-preview-token-unavailable");
    return NextResponse.json({ ...preview, previewToken }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "preview-failed" }, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
