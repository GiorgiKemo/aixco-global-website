import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function legacyHtml(file: string) {
  return readFileSync(resolve(process.cwd(), "public/aixco-global-op2", file), "utf8");
}

describe("legacy static article responsiveness", () => {
  it("keeps the Tourism article comparison table inside its card on phones", () => {
    const html = legacyHtml("tourism-led-real-estate-batumi.html");

    expect(html).toContain(".table-box {overflow-x:auto;");
    expect(html).toContain("table {min-width:520px;");
  });

  it("uses compact mobile back buttons on article headers with long labels", () => {
    for (const file of [
      "tourism-led-real-estate-batumi.html",
      "high-rental-yield-coastal-real-estate.html",
    ]) {
      const html = legacyHtml(file);

      expect(html).toContain("@media(max-width:480px)");
      expect(html).toContain(".navbar-fullpage .top-cta:not(.back-link), .navbar-article .top-cta:not(.back-link)");
      expect(html).toContain("content:'Back'");
    }
  });

  it("uses optimized legacy homepage videos instead of large source mp4 files", () => {
    const html = legacyHtml("index.html");

    expect(html).toContain('src="media/batumi2-optimized.mp4"');
    expect(html).toContain('href="media/fund1-optimized.mp4"');
    expect(html).toContain('href="media/fund2-optimized.mp4"');
    expect(html).toContain('href="media/fund3-optimized.mp4"');
    expect(html).toContain('data-video="media/bonds-optimized.mp4"');
    expect(html).not.toContain('src="images/batumi2.mp4"');
    expect(html).not.toContain('href="images/fund/fund2.mp4"');
  });
});
