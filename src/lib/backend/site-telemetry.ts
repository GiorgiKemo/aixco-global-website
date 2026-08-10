import "server-only";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";

const telemetryInputSchema = z.object({
  eventKind: z.enum(["web_vital", "client_error", "server_error"]),
  eventName: z.string().trim().min(1).max(120),
  eventId: z.string().trim().min(1).max(255).nullable().optional(),
  pagePath: z.string().trim().max(800).nullable().optional(),
  value: z.number().finite().min(0).max(999_999_999).nullable().optional(),
  rating: z.enum(["good", "needs-improvement", "poor", "unknown"]).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).strict();

const allowedMetadataKeys = new Set([
  "boundary",
  "buildId",
  "component",
  "delta",
  "digest",
  "metricId",
  "navigationType",
  "routeKind",
  "sessionId",
  "source",
]);

type SiteTelemetryInput = z.input<typeof telemetryInputSchema>;
type SiteTelemetryClient = {
  from: (table: "site_telemetry_events") => {
    insert: (value: Record<string, unknown>) => PromiseLike<{
      error: { message: string; code?: string } | null;
    }>;
  };
};

function safePagePath(value: string | null | undefined) {
  if (!value) return null;
  try {
    return new URL(value, "https://aixco.invalid").pathname.slice(0, 800);
  } catch {
    return value.split(/[?#]/, 1)[0]?.slice(0, 800) || null;
  }
}

function safeMetadata(value: Record<string, unknown> | undefined): Json {
  const output: Record<string, Json | undefined> = {};
  for (const [key, item] of Object.entries(value ?? {})) {
    if (!allowedMetadataKeys.has(key)) continue;
    if (typeof item === "string") output[key] = item.slice(0, 255);
    else if (typeof item === "number" && Number.isFinite(item)) output[key] = item;
    else if (typeof item === "boolean" || item === null) output[key] = item;
  }
  return output;
}

export async function storeSiteTelemetryEvent(
  input: SiteTelemetryInput,
  options: { client?: SiteTelemetryClient } = {},
) {
  const parsed = telemetryInputSchema.parse(input);
  const client = options.client ?? ((await getSupabaseAdminClient()) as unknown as SiteTelemetryClient);
  const { error } = await client.from("site_telemetry_events").insert({
    event_kind: parsed.eventKind,
    event_name: parsed.eventName,
    event_id: parsed.eventId ?? null,
    page_path: safePagePath(parsed.pagePath),
    value: parsed.value ?? null,
    rating: parsed.rating ?? null,
    metadata: safeMetadata(parsed.metadata),
  });

  if (error) {
    throw new Error(`Site telemetry storage failed (${error.code ?? "database_error"}).`);
  }
}

export type { SiteTelemetryClient, SiteTelemetryInput };
