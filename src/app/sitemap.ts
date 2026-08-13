import type { MetadataRoute } from "next";
import { siteContentDefaults } from "@/lib/backend/site-content";
import { getSiteUrl } from "@/lib/site-url";

const baseUrl = getSiteUrl();

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const propertyPages = siteContentDefaults.batumiProperties.map((property) => ({
    url: `${baseUrl}/aixco-global-op2/${property.url}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/reverance-batumi`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/medical-tourism`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/georgia-residency`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/invest-in-batumi`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...propertyPages,
  ];
}
