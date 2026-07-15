import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const webVitalSchema = z.object({
  id: z.string().min(1).max(160),
  name: z.enum(["TTFB", "FCP", "LCP", "FID", "CLS", "INP"]),
  value: z.number().finite().min(0),
  delta: z.number().finite(),
  rating: z.enum(["good", "needs-improvement", "poor"]),
  navigationType: z.string().max(40),
  pathname: z.string().startsWith("/").max(800),
}).strict();

export async function POST(request: Request) {
  const declaredLength = Number.parseInt(request.headers.get("content-length") ?? "0", 10);
  if (Number.isFinite(declaredLength) && declaredLength > 4096) {
    return NextResponse.json({ ok: false }, { status: 413, headers: { "Cache-Control": "no-store" } });
  }

  const rawBody = await request.text();
  if (rawBody.length > 4096) {
    return NextResponse.json({ ok: false }, { status: 413, headers: { "Cache-Control": "no-store" } });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody || "null");
  } catch {
    payload = null;
  }

  const parsed = webVitalSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  console.info("[aixco-web-vital]", JSON.stringify({ timestamp: new Date().toISOString(), ...parsed.data }));
  return NextResponse.json({ ok: true }, { status: 202, headers: { "Cache-Control": "no-store" } });
}
