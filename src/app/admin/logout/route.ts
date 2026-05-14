import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE_NAME, ADMIN_SESSION_COOKIE_PATH } from "@/lib/admin/auth";

function clearSession(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.VERCEL === "1" || process.env.ADMIN_COOKIE_SECURE === "true",
    path: ADMIN_SESSION_COOKIE_PATH,
    maxAge: 0,
  });

  return response;
}

export function GET(request: Request) {
  return clearSession(request);
}

export function POST(request: Request) {
  return clearSession(request);
}
