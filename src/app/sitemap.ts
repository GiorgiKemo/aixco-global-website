import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const baseUrl = getSiteUrl();

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: baseUrl,
      lastModified,
      priority: 1,
    },
    {
      url: `${baseUrl}/aixco-philosophy`,
      lastModified,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/aixco-global-op2`,
      lastModified,
      priority: 0.6,
    },
  ];
}
