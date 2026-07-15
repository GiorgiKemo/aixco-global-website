import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAuthDecision } from "@/lib/admin/auth";
import { auditAdminAction } from "@/lib/admin/audit";
import { leadResourceSchema, leadStatusSchema, updateLeadStatus } from "@/lib/admin/leads";

const statusUpdateSchema = z.object({
  resource: leadResourceSchema,
  id: z.string().uuid(),
  status: leadStatusSchema,
});

function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}

async function readStatusUpdatePayload(request: Request, wantsJson: boolean) {
  if (wantsJson) return request.json().catch(() => ({}));

  const formData = await request.formData().catch(() => null);
  if (!formData) return {};

  return {
    resource: formData.get("resource"),
    id: formData.get("id"),
    status: formData.get("status"),
  };
}

export async function POST(request: Request) {
  const wantsJson = Boolean(
    request.headers.get("accept")?.includes("application/json") ||
      request.headers.get("content-type")?.includes("application/json"),
  );

  const auth = await getAdminAuthDecision();
  if (!auth.ok) {
    if (wantsJson) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    return redirectTo(request, "/admin/login");
  }

  const requestOrigin = request.headers.get("origin");
  if (requestOrigin && requestOrigin !== new URL(request.url).origin) {
    if (wantsJson) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    return new NextResponse("Forbidden", { status: 403 });
  }

  const parsed = statusUpdateSchema.safeParse(await readStatusUpdatePayload(request, wantsJson));

  if (!parsed.success) {
    if (wantsJson) return NextResponse.json({ ok: false, error: "invalid-status-update" }, { status: 400 });
    return redirectTo(request, "/admin/leads?error=invalid-status-update");
  }

  try {
    await updateLeadStatus(parsed.data.resource, parsed.data.id, parsed.data.status);
    auditAdminAction({
      action: "lead.status.update",
      actor: auth.principal,
      outcome: "success",
      target: `${parsed.data.resource}:${parsed.data.id}`,
      details: { status: parsed.data.status },
    });
    if (wantsJson) return NextResponse.json({ ok: true });
    return redirectTo(request, `/admin/leads?updated=1#${parsed.data.resource}-${parsed.data.id}`);
  } catch {
    auditAdminAction({
      action: "lead.status.update",
      actor: auth.principal,
      outcome: "failure",
      target: `${parsed.data.resource}:${parsed.data.id}`,
      details: { status: parsed.data.status },
    });
    if (wantsJson) return NextResponse.json({ ok: false, error: "status-update-failed" }, { status: 500 });
    return redirectTo(request, "/admin/leads?error=status-update-failed");
  }
}
