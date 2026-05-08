import { getSupabaseServerClient, hasSupabaseServerConfig } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";
import {
  buildSiteContent,
  normalizeRows,
  siteContentDefaults,
  type SiteContentResult,
} from "./site-content";

type SiteContentRowData = { section: string; entry_key: string; payload: Json };
type SiteContentQueryResult = Promise<{
  data: SiteContentRowData[] | null;
  error: { message: string } | null;
}>;
type SiteContentQueryBuilder = {
  select: (columns: string) => SiteContentQueryBuilder;
  eq: (column: string, value: string | boolean) => SiteContentQueryBuilder;
  order: (column: string, options: { ascending: boolean }) => SiteContentQueryResult;
};
type SiteContentQueryClient = {
  from: (table: "site_content_entries") => SiteContentQueryBuilder;
};

type ServerContentOptions = {
  client?: SiteContentQueryClient;
};

export async function fetchSiteContentForServer(
  locale = "en",
  options: ServerContentOptions = {},
): Promise<SiteContentResult> {
  if (!options.client && !hasSupabaseServerConfig()) {
    return {
      ok: false,
      source: "fallback",
      content: siteContentDefaults,
      reason: "Supabase server config is not available.",
    };
  }

  try {
    const supabase = options.client ?? (await getSupabaseServerClient());
    const { data, error } = await (supabase as SiteContentQueryClient)
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
      reason: error instanceof Error ? error.message : "Unknown site content server fetch error.",
    };
  }
}
