import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
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
    expect(sitemap).toContain("legacyInsights");
    expect(robots).toContain("disallow: [\"/admin\", \"/admin/\"]");
    expect(getSiteUrl()).toBe("https://aixco-global-website.vercel.app");
    expect(existsSync(resolve(root, "public/robots.txt"))).toBe(false);
    expect(existsSync(resolve(root, "public/sitemap.xml"))).toBe(false);
    expect(existsSync(resolve(root, "src/app/sitemap.ts"))).toBe(true);
  });
});
