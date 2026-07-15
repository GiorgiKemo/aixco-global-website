import { createPortalWrapperHtml, isPortalRole } from "@/lib/portal-wrapper";

const PORTAL_RESPONSE_HEADERS = {
  "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
  "Content-Security-Policy": [
    "default-src 'none'",
    "style-src 'unsafe-inline'",
    "frame-src https://workw.com",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join("; "),
  "Content-Type": "text/html; charset=utf-8",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-Robots-Tag": "noindex, nofollow",
} as const;

type PortalRouteContext = {
  params: Promise<{ role: string }>;
};

export async function GET(_request: Request, context: PortalRouteContext) {
  const { role } = await context.params;

  if (!isPortalRole(role)) {
    return new Response("Portal not found", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  return new Response(createPortalWrapperHtml(role), {
    status: 200,
    headers: PORTAL_RESPONSE_HEADERS,
  });
}
