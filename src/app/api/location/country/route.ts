import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getCountryFromLocationHeaders } from "@/lib/location-country";

export const dynamic = "force-dynamic";

export async function GET() {
  const requestHeaders = await headers();
  const country = getCountryFromLocationHeaders(requestHeaders);

  return NextResponse.json(
    { country },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}
