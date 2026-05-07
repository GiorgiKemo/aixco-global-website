import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("SEO static assets", () => {
  it("does not reference missing social, schema, or sitemap assets", () => {
    const html = readFileSync(resolve(root, "index.html"), "utf8");
    const robots = readFileSync(resolve(root, "public/robots.txt"), "utf8");

    expect(html).toContain('/aixco-global-op2/images/optimized/batumi.webp');
    expect(html).toContain('https://aixco.global/aixco-global-op2/images/AIXW.png');
    expect(html).not.toContain('/og-image.jpg');
    expect(html).not.toContain('https://aixco.global/logo.svg');
    expect(robots).toContain('Sitemap: https://aixco.global/sitemap.xml');
    expect(existsSync(resolve(root, "public/sitemap.xml"))).toBe(true);
  });
});
