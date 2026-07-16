import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAuthDecision } from "@/lib/admin/auth";
import { auditAdminAction } from "@/lib/admin/audit";
import { requeueContactEmailDeliveries } from "@/lib/admin/leads";

const requeueSchema = z.object({ contactId: z.string().uuid() });

function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}

export async function POST(request: Request) {
  const auth = await getAdminAuthDecision();
  if (!auth.ok) return redirectTo(request, "/admin/login");

  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  const parsed = requeueSchema.safeParse({ contactId: formData?.get("contactId") });
  if (!parsed.success) return redirectTo(request, "/admin/leads?error=invalid-email-requeue");

  try {
    const count = await requeueContactEmailDeliveries(parsed.data.contactId);
    if (count < 1) {
      auditAdminAction({
        action: "contact.email.requeue",
        actor: auth.principal,
        outcome: "failure",
        target: `contact:${parsed.data.contactId}`,
        details: { reason: "no-eligible-failed-deliveries" },
      });
      return redirectTo(request, "/admin/leads?error=no-email-to-requeue");
    }

    auditAdminAction({
      action: "contact.email.requeue",
      actor: auth.principal,
      outcome: "success",
      target: `contact:${parsed.data.contactId}`,
      details: { deliveries: count },
    });
    return redirectTo(request, `/admin/leads?requeued=${count}#contact-${parsed.data.contactId}`);
  } catch {
    auditAdminAction({
      action: "contact.email.requeue",
      actor: auth.principal,
      outcome: "failure",
      target: `contact:${parsed.data.contactId}`,
      details: { reason: "storage-failure" },
    });
    return redirectTo(request, "/admin/leads?error=email-requeue-failed");
  }
}
