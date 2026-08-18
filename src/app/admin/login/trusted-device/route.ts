import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getAdminAuthDecision,
  getCurrentSupabaseMfaAdminAuthDecision,
} from "@/lib/admin/auth";
import {
  ADMIN_TRUSTED_DEVICE_COOKIE_NAME,
  ADMIN_TRUSTED_DEVICE_TTL_SECONDS,
  createTrustedDeviceToken,
  getTrustedDeviceSecret,
} from "@/lib/admin/trusted-device";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const schema = z.object({
  action: z.enum(["check", "enable", "disable"]),
}).strict();

const headers = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

function secureCookie() {
  return process.env.VERCEL === "1" || process.env.ADMIN_COOKIE_SECURE === "true";
}

function originIsSame(request: Request) {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === new URL(request.url).origin);
}

function clearCookie(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_TRUSTED_DEVICE_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie(),
    path: "/admin",
    maxAge: 0,
  });
}

export async function POST(request: Request) {
  if (!originIsSame(request)) {
    return NextResponse.json({ ok: false }, { status: 403, headers });
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ ok: false }, { status: 415, headers });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400, headers });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400, headers });

  if (parsed.data.action === "disable") {
    const response = NextResponse.json({ ok: true, trusted: false }, { headers });
    clearCookie(response);
    return response;
  }

  if (parsed.data.action === "check") {
    const auth = await getAdminAuthDecision();
    return NextResponse.json(
      {
        ok: true,
        trusted: auth.ok && auth.principal.authentication === "supabase-trusted-device",
      },
      { headers },
    );
  }

  // Issuing/renewing a 30-day token requires the real current Supabase AAL2
  // state. A trusted-device session is intentionally not sufficient to renew
  // itself.
  const auth = await getCurrentSupabaseMfaAdminAuthDecision();
  if (!auth.ok || auth.principal.authentication !== "supabase-mfa" || auth.principal.aal !== "aal2") {
    return NextResponse.json({ ok: false, error: "mfa-required" }, { status: 401, headers });
  }

  const secret = getTrustedDeviceSecret();
  if (!secret) {
    return NextResponse.json({ ok: false, error: "not-configured" }, { status: 503, headers });
  }

  const response = NextResponse.json({ ok: true, trusted: true }, { headers });
  response.cookies.set({
    name: ADMIN_TRUSTED_DEVICE_COOKIE_NAME,
    value: createTrustedDeviceToken(auth.principal.id, secret),
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie(),
    path: "/admin",
    maxAge: ADMIN_TRUSTED_DEVICE_TTL_SECONDS,
  });
  return response;
}
