import { NextResponse } from "next/server";
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

function getRedirectUrl(request: Request, path: string) {
  const requestUrl = new URL(request.url);
  const base = process.env.NODE_ENV === "production" ? getSiteUrl() : requestUrl.origin;
  return new URL(path, base);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");

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
