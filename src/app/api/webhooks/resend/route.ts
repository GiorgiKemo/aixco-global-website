import { NextResponse } from "next/server";
import { recordResendWebhookEvent, verifyResendWebhook } from "@/lib/backend/resend-webhook";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_WEBHOOK_BYTES = 64 * 1024;
const responseHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff",
};

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return NextResponse.json(
      { ok: false, reason: "Unsupported media type." },
      { status: 415, headers: responseHeaders },
    );
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_WEBHOOK_BYTES) {
    return NextResponse.json(
      { ok: false, reason: "Payload too large." },
      { status: 413, headers: responseHeaders },
    );
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_WEBHOOK_BYTES) {
    return NextResponse.json(
      { ok: false, reason: "Payload too large." },
      { status: 413, headers: responseHeaders },
    );
  }

  let verified: ReturnType<typeof verifyResendWebhook>;
  try {
    verified = verifyResendWebhook(rawBody, request.headers);
  } catch (error) {
    console.error("Resend webhook signature or payload was rejected.", error);
    return NextResponse.json(
      { ok: false, reason: "Invalid webhook." },
      { status: 400, headers: responseHeaders },
    );
  }

  try {
    const { eventId, event } = verified;
    const result = await recordResendWebhookEvent(eventId, event);

    if (!result.matched) {
      // Resend is at-least-once. A delivery event can race the API response
      // that persists provider_message_id, so ask Resend to retry rather than
      // falsely acknowledge an unlinked event.
      return NextResponse.json(
        { ok: false, reason: "Delivery is not available yet." },
        { status: 503, headers: { ...responseHeaders, "Retry-After": "5" } },
      );
    }

    return NextResponse.json(
      { ok: true, duplicate: result.duplicate, applied: result.applied },
      { headers: responseHeaders },
    );
  } catch (error) {
    console.error("Resend webhook persistence failed.", error);
    return NextResponse.json(
      { ok: false, reason: "Webhook storage is temporarily unavailable." },
      { status: 503, headers: { ...responseHeaders, "Retry-After": "60" } },
    );
  }
}
