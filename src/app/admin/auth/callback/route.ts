import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSiteUrl } from "@/lib/site-url";
import { getSupabaseAuthServerClient } from "@/lib/supabase/auth-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const redirectHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

const INVITE_TOKEN_COOKIE = "aixco_admin_invite_token";
const INVITE_TOKEN_TTL_SECONDS = 10 * 60;

function secureCookie() {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
}

function getRedirectUrl(request: Request, path: string) {
  const requestUrl = new URL(request.url);
  const base = process.env.NODE_ENV === "production" ? getSiteUrl() : requestUrl.origin;
  return new URL(path, base);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");

  // The custom AIXCO invitation email uses a two-step callback. GET only
  // stages the one-time token; POST performs verification after a human click.
  // This prevents Gmail/Outlook security scanners from consuming invitations.
  if (tokenHash) {
    if (requestUrl.searchParams.get("type") !== "invite" || !/^[A-Za-z0-9_-]{12,512}$/.test(tokenHash)) {
      return NextResponse.redirect(
        getRedirectUrl(request, "/admin/login?error=invite-invalid"),
        { status: 303, headers: redirectHeaders },
      );
    }
    const response = NextResponse.redirect(
      getRedirectUrl(request, "/admin/auth/accept"),
      { status: 303, headers: redirectHeaders },
    );
    response.cookies.set({
      name: INVITE_TOKEN_COOKIE,
      value: tokenHash,
      httpOnly: true,
      secure: secureCookie(),
      sameSite: "lax",
      path: "/admin/auth",
      maxAge: INVITE_TOKEN_TTL_SECONDS,
    });
    return response;
  }

  try {
    const supabase = await getSupabaseAuthServerClient();
    if (code) {
      const result = await supabase.auth.exchangeCodeForSession(code);
      if (result.error) throw result.error;
    } else if (tokenHash) {
      const result = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "invite" });
      if (result.error) throw result.error;
    } else {
      throw new Error("Missing invitation credential.");
    }

    return NextResponse.redirect(
      getRedirectUrl(request, "/admin/login?setup=1"),
      { status: 303, headers: redirectHeaders },
    );
  } catch {
    return NextResponse.redirect(
      getRedirectUrl(request, "/admin/login?error=invite-invalid"),
      { status: 303, headers: redirectHeaders },
    );
  }
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return new NextResponse("Forbidden", { status: 403, headers: redirectHeaders });
  }

  const cookieStore = await cookies();
  const tokenHash = cookieStore.get(INVITE_TOKEN_COOKIE)?.value;
  if (!tokenHash || !/^[A-Za-z0-9_-]{12,512}$/.test(tokenHash)) {
    return NextResponse.redirect(
      getRedirectUrl(request, "/admin/login?error=invite-invalid"),
      { status: 303, headers: redirectHeaders },
    );
  }

  try {
    const supabase = await getSupabaseAuthServerClient();
    const result = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "invite" });
    if (result.error) throw result.error;
    const response = NextResponse.redirect(
      getRedirectUrl(request, "/admin/login?setup=1"),
      { status: 303, headers: redirectHeaders },
    );
    response.cookies.set({
      name: INVITE_TOKEN_COOKIE,
      value: "",
      httpOnly: true,
      secure: secureCookie(),
      sameSite: "lax",
      path: "/admin/auth",
      maxAge: 0,
    });
    return response;
  } catch {
    const response = NextResponse.redirect(
      getRedirectUrl(request, "/admin/login?error=invite-invalid"),
      { status: 303, headers: redirectHeaders },
    );
    response.cookies.set({
      name: INVITE_TOKEN_COOKIE,
      value: "",
      httpOnly: true,
      secure: secureCookie(),
      sameSite: "lax",
      path: "/admin/auth",
      maxAge: 0,
    });
    return response;
  }
}
