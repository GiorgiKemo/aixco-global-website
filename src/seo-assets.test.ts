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
    expect(layout).toContain('google: "cthSPFpr7n1-BQ5XXtLZXLv9cZ40teF4anFpNTn95ZU"');
    expect(sitemap).not.toContain("legacyInsights");
    expect(sitemap).not.toContain("lastModified");
    expect(robots).toContain("disallow: [\"/admin\", \"/admin/\"]");
    expect(getSiteUrl()).toBe("https://www.aixco.global");
    expect(existsSync(resolve(root, "public/robots.txt"))).toBe(false);
    expect(existsSync(resolve(root, "public/sitemap.xml"))).toBe(false);
    expect(existsSync(resolve(root, "src/app/sitemap.ts"))).toBe(true);
  });

  it("keeps the temporary boot surface from creating a second homepage heading", () => {
    const homeExperience = readFileSync(resolve(root, "src/components/sections/HomeExperience.tsx"), "utf8");

    expect(homeExperience).not.toContain("<h1");
    expect(homeExperience).toContain("Wise selection. Recurring income generation.");
  });

  it("publishes canonical 200 routes and omits redirect-only routes", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toEqual([
      "https://www.aixco.global",
      "https://www.aixco.global/reverance-batumi",
      "https://www.aixco.global/reverance-batumi/calculator",
      "https://www.aixco.global/medical-tourism",
      "https://www.aixco.global/georgia-residency",
      "https://www.aixco.global/invest-in-batumi",
      "https://www.aixco.global/georgia-tax-residency",
      "https://www.aixco.global/aixco-global-bond",
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
        destination: "/reverance-batumi",
        permanent: true,
      }),
      expect.objectContaining({
        source: "/aixco-global-op2/current-project",
        destination: "/reverance-batumi",
        permanent: true,
      }),
    ]));
  });

  it("exposes the project brochure through the clean Reverance URL", async () => {
    expect(nextConfig.rewrites).toBeUndefined();
    expect(
      existsSync(resolve(root, "public/aixco-global-op2/documents/reverance-brochure-en.pdf")),
    ).toBe(true);
    expect(
      existsSync(resolve(root, "public/aixco-global-op2/documents/reverance-brochure-de.pdf")),
    ).toBe(true);
    expect(
      existsSync(resolve(root, "public/aixco-global-op2/documents/reverance-brochure-pl.pdf")),
    ).toBe(true);
    expect(
      existsSync(resolve(root, "public/aixco-global-op2/documents/reverance-brochure-sl.pdf")),
    ).toBe(true);
    expect(
      existsSync(resolve(root, "public/aixco-global-op2/documents/reverance-brochure-ru.pdf")),
    ).toBe(true);
  });

  it("publishes every English and German guide used by the materials carousel", () => {
    const guideFiles = [
      "aixco-tax-residency-guide-hnwi-en.pdf",
      "aixco-brief-residence-guide-en.pdf",
      "aixco-medical-tourism-guide-en.pdf",
      "aixco-full-residence-guide-en.pdf",
      "aixco-leisure-activities-en.pdf",
      "aixco-leitfaden-steuerresidenz-hnwi-de.pdf",
      "aixco-aufenthaltsleitfaden-kompakt-de.pdf",
      "aixco-leitfaden-medizintourismus-de.pdf",
      "aixco-aufenthaltsleitfaden-gesamtversion-de.pdf",
      "aixco-freizeitaktivitaeten-de.pdf",
    ];

    for (const fileName of guideFiles) {
      expect(
        existsSync(resolve(root, "public/aixco-global-op2/documents", fileName)),
        fileName,
      ).toBe(true);
    }
  });

  it("serves complete canonical and social metadata for property pages", async () => {
    const metadata = await generatePropertyMetadata({
      params: Promise.resolve({ slug: "current-project" }),
    });

    expect(metadata).toMatchObject({
      title: "Project Reverance | AIXCO.Global",
      alternates: {
        canonical: "/reverance-batumi",
      },
      robots: {
        index: true,
        follow: true,
      },
      openGraph: {
        url: "/reverance-batumi",
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
        url: "/aixco-global-op2/images/project-gallery-2026/01-hero-exterior.webp",
        width: 4096,
        height: 4096,
      }),
    ]);
    expect(metadata.twitter?.images).toEqual([
      expect.objectContaining({
        url: "/aixco-global-op2/images/project-gallery-2026/01-hero-exterior.webp",
      }),
    ]);
  });
});
