import { NextRequest, NextResponse } from "next/server";
import { getPortalRoleForHost } from "@/lib/portal-wrapper";

export function proxy(request: NextRequest) {
  const role = getPortalRoleForHost(request.nextUrl.hostname);

  if (!role) return NextResponse.next();

  const destination = request.nextUrl.clone();
  destination.pathname = `/portal/${role}`;
  destination.search = "";

  return NextResponse.rewrite(destination);
}

export const config = {
  matcher: "/",
};
