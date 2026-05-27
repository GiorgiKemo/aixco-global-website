import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/aixco-global-op2/*.html"],
      },
    ],
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
