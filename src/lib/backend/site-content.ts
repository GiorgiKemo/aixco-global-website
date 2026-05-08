import { batumiBenefits, batumiProperties, company, dubaiFunds, faqGroups, journeys, metrics, participationRoutes, partners, team } from "@/data/site";
import { newsTickerItems } from "@/data/news";
import { getSupabaseBrowserClient, hasSupabaseBrowserConfig } from "@/lib/supabase/client";
import type { Database, Json } from "@/lib/supabase/database.types";

export type SiteContent = {
  company: typeof company;
  metrics: typeof metrics;
  dubaiFunds: typeof dubaiFunds;
  batumiBenefits: typeof batumiBenefits;
  batumiProperties: typeof batumiProperties;
  participationRoutes: typeof participationRoutes;
  journeys: typeof journeys;
  team: typeof team;
  partners: typeof partners;
  faqGroups: typeof faqGroups;
  newsTickerItems: typeof newsTickerItems;
};

export const siteContentDefaults: SiteContent = {
  company,
  metrics,
  dubaiFunds,
  batumiBenefits,
  batumiProperties,
  participationRoutes,
  journeys,
  team,
  partners,
  faqGroups,
  newsTickerItems,
};

export type SiteContentRow = Pick<
  Database["public"]["Tables"]["site_content_entries"]["Row"],
  "section" | "entry_key" | "payload"
>;

export type SiteContentResult =
  | { ok: true; source: "supabase"; content: SiteContent }
  | { ok: false; source: "fallback"; content: SiteContent; reason: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function readPayload<T>(
  rows: SiteContentRow[],
  section: string,
  entryKey: string,
  fallback: T,
  expectedShape: "array" | "object",
) {
  const payload = rows.find((row) => row.section === section && row.entry_key === entryKey)?.payload;

  if (expectedShape === "array") {
    return Array.isArray(payload) ? (payload as T) : fallback;
  }

  return isRecord(payload) ? (payload as T) : fallback;
}

export function buildSiteContent(rows: SiteContentRow[]): SiteContent {
  return {
    company: readPayload(rows, "company", "profile", siteContentDefaults.company, "object"),
    metrics: readPayload(rows, "metrics", "items", siteContentDefaults.metrics, "array"),
    dubaiFunds: readPayload(rows, "dubai_funds", "items", siteContentDefaults.dubaiFunds, "array"),
    batumiBenefits: readPayload(rows, "batumi_benefits", "items", siteContentDefaults.batumiBenefits, "array"),
    batumiProperties: readPayload(rows, "batumi_properties", "items", siteContentDefaults.batumiProperties, "array"),
    participationRoutes: readPayload(rows, "participation_routes", "items", siteContentDefaults.participationRoutes, "array"),
    journeys: readPayload(rows, "journeys", "items", siteContentDefaults.journeys, "array"),
    team: readPayload(rows, "team", "items", siteContentDefaults.team, "array"),
    partners: readPayload(rows, "partners", "items", siteContentDefaults.partners, "array"),
    faqGroups: readPayload(rows, "faq_groups", "items", siteContentDefaults.faqGroups, "array"),
    newsTickerItems: readPayload(rows, "news_ticker", "items", siteContentDefaults.newsTickerItems, "array"),
  };
}

export function normalizeRows(data: { section: string; entry_key: string; payload: Json }[] | null): SiteContentRow[] {
  return (data ?? []).filter((row) => row.section && row.entry_key);
}

export async function fetchSiteContent(locale = "en"): Promise<SiteContentResult> {
  if (!hasSupabaseBrowserConfig()) {
    return {
      ok: false,
      source: "fallback",
      content: siteContentDefaults,
      reason: "Supabase browser config is not available.",
    };
  }

  try {
    const supabase = await getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("site_content_entries")
      .select("section, entry_key, payload")
      .eq("locale", locale)
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    if (error) {
      return {
        ok: false,
        source: "fallback",
        content: siteContentDefaults,
        reason: error.message,
      };
    }

    return {
      ok: true,
      source: "supabase",
      content: buildSiteContent(normalizeRows(data)),
    };
  } catch (error) {
    return {
      ok: false,
      source: "fallback",
      content: siteContentDefaults,
      reason: error instanceof Error ? error.message : "Unknown site content fetch error.",
    };
  }
}
