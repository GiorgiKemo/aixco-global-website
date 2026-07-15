import { NextRequest, NextResponse } from "next/server";
import { getPortalRoleForHost } from "@/lib/portal-wrapper";
import { refreshSupabaseAuthSession } from "@/lib/supabase/auth-proxy";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return refreshSupabaseAuthSession(request);
  }

  const role = getPortalRoleForHost(request.nextUrl.hostname);

  if (!role) return NextResponse.next();

  const destination = request.nextUrl.clone();
  destination.pathname = `/portal/${role}`;
  destination.search = "";

  return NextResponse.rewrite(destination);
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};
