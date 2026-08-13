import type { MetadataRoute } from "next";
import { siteContentDefaults } from "@/lib/backend/site-content";
import { getSiteUrl } from "@/lib/site-url";

const baseUrl = getSiteUrl();

export default function sitemap(): MetadataRoute.Sitemap {
  const propertyPages = siteContentDefaults.batumiProperties
    .filter((property) => property.id !== "current-project")
    .map((property) => ({
      url: `${baseUrl}/aixco-global-op2/${property.url}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/reverance-batumi`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/medical-tourism`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/georgia-residency`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/invest-in-batumi`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...propertyPages,
  ];
}
