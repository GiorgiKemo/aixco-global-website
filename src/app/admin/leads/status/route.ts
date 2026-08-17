import { NextResponse } from "next/server";
import { z } from "zod";
import { getAal2AdminAuthDecision } from "@/lib/admin/auth";
import { auditAdminAction } from "@/lib/admin/audit";
import {
  LeadNotFoundError,
  leadResourceSchema,
  leadStatusSchema,
  updateLeadStatus,
} from "@/lib/admin/leads";
import { readBoundedJson } from "@/lib/security/request-body";
import {
  buildAdminLeadsFeedbackRedirect,
  sanitizeAdminLeadsReturnTo,
} from "../navigation";

const statusUpdateSchema = z.object({
  resource: leadResourceSchema,
  id: z.string().uuid(),
  status: leadStatusSchema,
  returnTo: z.preprocess(
    (value) => value === null || value === "" ? undefined : value,
    z.string().max(2048).optional(),
  ),
});

function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}

async function readStatusUpdatePayload(request: Request, wantsJson: boolean) {
  if (wantsJson) {
    const body = await readBoundedJson(request, 4096);
    return body.ok ? body.value : {};
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) return {};

  return {
    resource: formData.get("resource"),
    id: formData.get("id"),
    status: formData.get("status"),
    returnTo: formData.get("returnTo"),
  };
}

function readReturnTo(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return (value as Record<string, unknown>).returnTo;
}

export async function POST(request: Request) {
  const wantsJson = Boolean(
    request.headers.get("accept")?.includes("application/json") ||
      request.headers.get("content-type")?.includes("application/json"),
  );

  const auth = await getAal2AdminAuthDecision();
  if (!auth.ok) {
    if (wantsJson) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    return redirectTo(request, "/admin/login");
  }

  const requestOrigin = request.headers.get("origin");
  if (!requestOrigin || requestOrigin !== new URL(request.url).origin) {
    if (wantsJson) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    return new NextResponse("Forbidden", { status: 403 });
  }

  const payload = await readStatusUpdatePayload(request, wantsJson);
  const returnTo = sanitizeAdminLeadsReturnTo(readReturnTo(payload), "/admin/leads?tab=new");
  const parsed = statusUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    if (wantsJson) return NextResponse.json({ ok: false, error: "invalid-status-update" }, { status: 400 });
    return redirectTo(request, buildAdminLeadsFeedbackRedirect(returnTo, { error: "invalid-status-update" }));
  }

  try {
    await auditAdminAction({
      action: "lead.status.update.requested",
      actor: auth.principal,
      outcome: "success",
      target: `${parsed.data.resource}:${parsed.data.id}`,
      details: { status: parsed.data.status },
      headers: request.headers,
    }, { required: true });

    await updateLeadStatus(parsed.data.resource, parsed.data.id, parsed.data.status);
    await auditAdminAction({
      action: "lead.status.update",
      actor: auth.principal,
      outcome: "success",
      target: `${parsed.data.resource}:${parsed.data.id}`,
      details: { status: parsed.data.status },
      headers: request.headers,
    });
    if (wantsJson) return NextResponse.json({ ok: true });
    return redirectTo(request, buildAdminLeadsFeedbackRedirect(
      returnTo,
      { updated: "1" },
      `${parsed.data.resource}-${parsed.data.id}`,
    ));
  } catch (error) {
    await auditAdminAction({
      action: "lead.status.update",
      actor: auth.principal,
      outcome: "failure",
      target: `${parsed.data.resource}:${parsed.data.id}`,
      details: { status: parsed.data.status },
      headers: request.headers,
    });
    const notFound = error instanceof LeadNotFoundError;
    if (wantsJson) {
      return NextResponse.json(
        { ok: false, error: notFound ? "lead-not-found" : "status-update-failed" },
        { status: notFound ? 404 : 500 },
      );
    }
    return redirectTo(request, buildAdminLeadsFeedbackRedirect(
      returnTo,
      { error: notFound ? "lead-not-found" : "status-update-failed" },
      `${parsed.data.resource}-${parsed.data.id}`,
    ));
  }
}
