import type { MetadataRoute } from "next";
import { legacyInsights } from "@/data/legacy-insights";

const baseUrl = "https://aixco.global";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: baseUrl,
      lastModified,
      priority: 1,
    },
    {
      url: `${baseUrl}/aixco-global-op2`,
      lastModified,
      priority: 0.6,
    },
    ...legacyInsights.map((article) => ({
      url: `${baseUrl}/aixco-global-op2/${article.slug}`,
      lastModified,
      priority: 0.7,
    })),
  ];
}
