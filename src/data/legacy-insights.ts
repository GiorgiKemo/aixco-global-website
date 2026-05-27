export type LegacyInsightSection = {
  heading: string;
  paragraphs: string[];
};

export type LegacyInsight = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  sections: LegacyInsightSection[];
};

export const legacyInsights = [] as const satisfies LegacyInsight[];

export function normalizeLegacySlug(slug: string) {
  return decodeURIComponent(slug).replace(/\/+$/, "").replace(/\.html$/i, "").toLowerCase();
}

export function findLegacyInsight() {
  return null;
}

export function getLegacyInsightParams() {
  return [];
}
