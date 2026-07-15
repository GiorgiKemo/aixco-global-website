import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAuthDecision } from "@/lib/admin/auth";
import { auditAdminAction } from "@/lib/admin/audit";
import { sendLeadNotificationTestEmail } from "@/lib/backend/lead-notification-email";
import { checkRateLimit, getRateLimitClientId } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

const EMAIL_TEST_RATE_LIMIT = {
  limit: 5,
  windowMs: 15 * 60_000,
};

const emailTestSchema = z.object({
  replyTo: z.preprocess(
    (value) => String(value ?? "").trim() || undefined,
    z.string().email().max(255).optional(),
  ),
  message: z.string().trim().min(10).max(1500),
});

function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}

function errorRedirect(request: Request, error: string, detail?: string) {
  const url = new URL("/admin/email-test", request.url);
  url.searchParams.set("error", error);
  if (detail) url.searchParams.set("detail", detail.slice(0, 240));
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  const auth = await getAdminAuthDecision();
  if (!auth.ok) {
    return redirectTo(request, "/admin/login");
  }

  const requestOrigin = request.headers.get("origin");
  if (requestOrigin && requestOrigin !== new URL(request.url).origin) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const rateLimit = checkRateLimit({
    key: `admin-email-test:${getRateLimitClientId(request.headers)}`,
    ...EMAIL_TEST_RATE_LIMIT,
  });

  if (!rateLimit.allowed) {
    return errorRedirect(request, "rate-limited");
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorRedirect(request, "invalid");
  }

  const parsed = emailTestSchema.safeParse({
    replyTo: formData.get("replyTo"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return errorRedirect(request, "invalid");
  }

  const result = await sendLeadNotificationTestEmail(parsed.data);
  if (!result.ok) {
    auditAdminAction({
      action: "email.delivery.test",
      actor: auth.principal,
      outcome: "failure",
      details: { skipped: result.skipped },
    });
    return errorRedirect(request, result.skipped ? "config" : "send", result.reason);
  }

  auditAdminAction({
    action: "email.delivery.test",
    actor: auth.principal,
    outcome: "success",
    target: result.id,
  });

  const url = new URL("/admin/email-test", request.url);
  url.searchParams.set("status", "sent");
  if (result.id) url.searchParams.set("id", result.id);
  return NextResponse.redirect(url, { status: 303 });
}
