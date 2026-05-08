import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { findLegacyInsight, getLegacyInsightParams, legacyInsights } from "@/data/legacy-insights";

describe("legacy insight migration", () => {
  it("moves old static article content into typed Next route data", () => {
    const tourism = findLegacyInsight("tourism-led-real-estate-batumi.html");
    const rentalYield = findLegacyInsight("high-rental-yield-coastal-real-estate");

    expect(legacyInsights).toHaveLength(10);
    expect(tourism?.title).toContain("Tourism-Led Real Estate");
    expect(tourism?.sections.some((section) => section.heading.includes("Tourism"))).toBe(true);
    expect(rentalYield?.title).toContain("8–12% Rental Yield");
  });

  it("supports both historical .html URLs and extensionless Next routes", () => {
    const params = getLegacyInsightParams().map((param) => param.slug);

    expect(params).toContain("batumi-short-term-rentals.html");
    expect(params).toContain("batumi-short-term-rentals");
    expect(findLegacyInsight("batumi-short-term-rentals.html")).toEqual(findLegacyInsight("batumi-short-term-rentals"));
  });

  it("removes obsolete public HTML files after rebuilding them as Next pages", () => {
    for (const article of legacyInsights) {
      expect(existsSync(resolve(process.cwd(), "public/aixco-global-op2", article.slug))).toBe(false);
    }

    expect(existsSync(resolve(process.cwd(), "public/aixco-global-op2/index.html"))).toBe(false);
  });
});
