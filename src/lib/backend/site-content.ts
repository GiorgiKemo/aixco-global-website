import { batumiBenefits, batumiProperties, company, dubaiFunds, faqGroups, journeys, metrics, participationRoutes, partners, team } from "@/data/site";
import { newsTickerItems } from "@/data/news";
import { getSafeAixcoNewsUrl, getSafeAssetKey, getSafeEmail, getSafeHttpsUrl, getSafePortalUrl } from "@/lib/security/urls";
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

const rawSiteContentDefaults: SiteContent = {
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

function sanitizeCompanyProfile(profile: SiteContent["company"]): SiteContent["company"] {
  return {
    ...rawSiteContentDefaults.company,
    ...profile,
    email: getSafeEmail(profile.email, rawSiteContentDefaults.company.email),
    socials: {
      ...rawSiteContentDefaults.company.socials,
      ...profile.socials,
      website: rawSiteContentDefaults.company.socials.website,
      linkedin: rawSiteContentDefaults.company.socials.linkedin,
      facebook: getSafeHttpsUrl(profile.socials?.facebook, rawSiteContentDefaults.company.socials.facebook, [
        "facebook.com",
        "www.facebook.com",
      ]),
      instagram: getSafeHttpsUrl(profile.socials?.instagram, rawSiteContentDefaults.company.socials.instagram, [
        "instagram.com",
        "www.instagram.com",
      ]),
      whatsapp: getSafeHttpsUrl(profile.socials?.whatsapp, rawSiteContentDefaults.company.socials.whatsapp, [
        "wa.me",
      ]),
      youtube: getSafeHttpsUrl(profile.socials?.youtube, rawSiteContentDefaults.company.socials.youtube, [
        "youtube.com",
        "www.youtube.com",
      ]),
      x: getSafeHttpsUrl(profile.socials?.x, rawSiteContentDefaults.company.socials.x, ["x.com", "twitter.com"]),
    },
    portals: {
      ...rawSiteContentDefaults.company.portals,
      ...profile.portals,
      customerLogin: getSafePortalUrl(profile.portals?.customerLogin, rawSiteContentDefaults.company.portals.customerLogin),
      brokerLogin: getSafePortalUrl(profile.portals?.brokerLogin, rawSiteContentDefaults.company.portals.brokerLogin),
      developerLogin: getSafePortalUrl(profile.portals?.developerLogin, rawSiteContentDefaults.company.portals.developerLogin),
      customerSignup: getSafePortalUrl(profile.portals?.customerSignup, rawSiteContentDefaults.company.portals.customerSignup),
      brokerSignup: getSafePortalUrl(profile.portals?.brokerSignup, rawSiteContentDefaults.company.portals.brokerSignup),
      developerSignup: getSafePortalUrl(profile.portals?.developerSignup, rawSiteContentDefaults.company.portals.developerSignup),
    },
  };
}

function sanitizeBatumiProperties(properties: SiteContent["batumiProperties"]): SiteContent["batumiProperties"] {
  return properties.map((property, index) => ({
    ...property,
    url: getSafeAssetKey(property.url, rawSiteContentDefaults.batumiProperties[index]?.url ?? property.id),
  }));
}

function sanitizeNewsTickerItems(items: SiteContent["newsTickerItems"]): SiteContent["newsTickerItems"] {
  return items.map((item, index) => ({
    ...item,
    href: getSafeAixcoNewsUrl(item.href, rawSiteContentDefaults.newsTickerItems[index]?.href ?? "https://www.aixco.global/op2/"),
  }));
}

function applyClientRealEstateBrief(content: SiteContent): SiteContent {
  return {
    ...content,
    company: {
      ...content.company,
      tagline: rawSiteContentDefaults.company.tagline,
    },
    batumiBenefits: rawSiteContentDefaults.batumiBenefits,
    batumiProperties: rawSiteContentDefaults.batumiProperties,
    metrics: rawSiteContentDefaults.metrics,
    dubaiFunds: rawSiteContentDefaults.dubaiFunds,
    participationRoutes: rawSiteContentDefaults.participationRoutes,
    journeys: rawSiteContentDefaults.journeys,
    partners: rawSiteContentDefaults.partners,
    faqGroups: rawSiteContentDefaults.faqGroups,
    newsTickerItems: rawSiteContentDefaults.newsTickerItems,
  };
}

function sanitizeSiteContent(content: SiteContent): SiteContent {
  const compliantContent = applyClientRealEstateBrief(content);

  return {
    ...compliantContent,
    company: sanitizeCompanyProfile(compliantContent.company),
    batumiProperties: sanitizeBatumiProperties(compliantContent.batumiProperties),
    newsTickerItems: sanitizeNewsTickerItems(compliantContent.newsTickerItems),
  };
}

export const siteContentDefaults: SiteContent = sanitizeSiteContent(rawSiteContentDefaults);

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
  return sanitizeSiteContent({
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
  });
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
