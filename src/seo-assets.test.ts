import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import nextConfig from "../next.config.mjs";
import { generateMetadata as generatePropertyMetadata } from "@/app/aixco-global-op2/[slug]/page";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { getSiteUrl } from "@/lib/site-url";

const root = process.cwd();

describe("SEO static assets", () => {
  it("does not reference missing social, schema, or sitemap assets", () => {
    const layout = readFileSync(resolve(root, "src/app/layout.tsx"), "utf8");
    const sitemap = readFileSync(resolve(root, "src/app/sitemap.ts"), "utf8");
    const robots = readFileSync(resolve(root, "src/app/robots.ts"), "utf8");

    expect(layout).toContain("/aixco-global-op2/images/optimized/batumi.webp");
    expect(layout).toContain("/favicon.ico");
    expect(layout).not.toContain("/og-image.jpg");
    expect(layout).not.toContain("https://aixco.global/logo.svg");
    expect(layout).toContain('canonical: "/"');
    expect(sitemap).not.toContain("legacyInsights");
    expect(robots).toContain("disallow: [\"/admin\", \"/admin/\"]");
    expect(getSiteUrl()).toBe("https://www.aixco.global");
    expect(existsSync(resolve(root, "public/robots.txt"))).toBe(false);
    expect(existsSync(resolve(root, "public/sitemap.xml"))).toBe(false);
    expect(existsSync(resolve(root, "src/app/sitemap.ts"))).toBe(true);
  });

  it("publishes canonical 200 routes and omits redirect-only routes", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toEqual([
      "https://www.aixco.global",
      "https://www.aixco.global/aixco-global-op2/current-project",
    ]);
    expect(urls).not.toContain("https://www.aixco.global/aixco-global-op2");
  });

  it("points crawler directives at the canonical host", () => {
    const directives = robots();

    expect(directives.host).toBe("https://www.aixco.global");
    expect(directives.sitemap).toBe("https://www.aixco.global/sitemap.xml");
  });

  it("permanently consolidates duplicate hosts and known legacy routes", async () => {
    const redirects = await nextConfig.redirects?.();

    expect(redirects).toEqual(expect.arrayContaining([
      expect.objectContaining({
        source: "/:path*",
        has: [{ type: "host", value: "aixco.global" }],
        destination: "https://www.aixco.global/:path*",
        permanent: true,
      }),
      expect.objectContaining({
        source: "/:path*",
        has: [{ type: "host", value: "aixco-global-website.vercel.app" }],
        destination: "https://www.aixco.global/:path*",
        permanent: true,
      }),
      expect.objectContaining({
        source: "/aixco-global-op2",
        destination: "/",
        permanent: true,
      }),
      expect.objectContaining({
        source: "/aixco-global-op2/current-project.html",
        destination: "/aixco-global-op2/current-project",
        permanent: true,
      }),
    ]));
  });

  it("exposes the project brochure through the clean Reverance URL", async () => {
    const rewrites = await nextConfig.rewrites?.();

    expect(rewrites).toContainEqual({
      source: "/aixco-global-op2/documents/reverance-brochure-en.pdf",
      destination: "/aixco-global-op2/documents/reverance-by-otium-brochure-en.pdf",
    });
    expect(
      existsSync(resolve(root, "public/aixco-global-op2/documents/reverance-brochure-de.pdf")),
    ).toBe(true);
  });

  it("serves complete canonical and social metadata for property pages", async () => {
    const metadata = await generatePropertyMetadata({
      params: Promise.resolve({ slug: "current-project" }),
    });

    expect(metadata).toMatchObject({
      title: "Our current project | AIXCO.Global",
      alternates: {
        canonical: "/aixco-global-op2/current-project",
      },
      robots: {
        index: true,
        follow: true,
      },
      openGraph: {
        url: "/aixco-global-op2/current-project",
        siteName: "AIXCO.Global",
        locale: "en_US",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
      },
    });
    expect(metadata.openGraph?.images).toEqual([
      expect.objectContaining({
        url: "/aixco-global-op2/images/optimized/current-project-hero-towers.webp",
        width: 1280,
        height: 610,
      }),
    ]);
    expect(metadata.twitter?.images).toEqual([
      expect.objectContaining({
        url: "/aixco-global-op2/images/optimized/current-project-hero-towers.webp",
      }),
    ]);
  });
});
