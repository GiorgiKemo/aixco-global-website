import { NextRequest, NextResponse } from "next/server";
import { getPortalRoleForHost } from "@/lib/portal-wrapper";

export function proxy(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const role = getPortalRoleForHost(forwardedHost ?? request.headers.get("host"));

  if (!role) return NextResponse.next();

  const destination = request.nextUrl.clone();
  destination.pathname = `/portal/${role}`;
  destination.search = "";

  return NextResponse.rewrite(destination);
}

export const config = {
  matcher: "/",
};
