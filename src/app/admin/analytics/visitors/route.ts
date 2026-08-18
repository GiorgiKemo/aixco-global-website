import "server-only";

import { NextResponse } from "next/server";
import { getAal2AdminAuthDecision } from "@/lib/admin/auth";
import {
  fetchAdminAnalyticsCountryVisitors,
  fetchAdminAnalyticsVisitorActivity,
  parseAnalyticsRange,
} from "@/lib/admin/analytics";

export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      Vary: "Cookie",
    },
  });
}

export async function GET(request: Request) {
  const auth = await getAal2AdminAuthDecision();
  if (!auth.ok) return json({ error: "Authentication required." }, 401);

  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  if (origin && origin !== requestUrl.origin) return json({ error: "Forbidden." }, 403);

  const countryCode = requestUrl.searchParams.get("country")?.trim().toUpperCase() ?? "";
  const visitorId = requestUrl.searchParams.get("visitor")?.trim() ?? "";
  const range = parseAnalyticsRange(requestUrl.searchParams.get("range"));
  if (visitorId) {
    const result = await fetchAdminAnalyticsVisitorActivity(range, countryCode, visitorId);
    if (!result.ok) return json({ error: result.reason }, result.status ?? 503);
    return json({ kind: "activity", ...result.data });
  }

  const pageValue = Number(requestUrl.searchParams.get("page") ?? "1");
  const pageSizeValue = Number(requestUrl.searchParams.get("pageSize") ?? "20");
  const page = Number.isFinite(pageValue) ? Math.max(1, Math.floor(pageValue)) : 1;
  const pageSize = Number.isFinite(pageSizeValue) ? Math.min(50, Math.max(1, Math.floor(pageSizeValue))) : 20;
  const result = await fetchAdminAnalyticsCountryVisitors(range, countryCode, { page, pageSize });
  if (!result.ok) return json({ error: result.reason }, result.status ?? 503);
  return json({ kind: "visitors", ...result.data });
}
