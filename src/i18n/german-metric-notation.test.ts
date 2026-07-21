import { describe, expect, it } from "vitest";
import { curatedVisibleTranslations } from "./curated-visible-translations";
import { germanTranslationFixes } from "./german-translation-fixes";
import {
  normalizeGermanCompactMetricTranslation,
  normalizeGermanCompactMillions,
} from "./german-metric-notation";
import { siteContentTranslations } from "./site-content-translations";
import { textTranslations } from "./translations";

describe("normalizeGermanCompactMillions", () => {
  it.each([
    ["462 Mio. USD", "$462M"],
    ["350 Mio. USD Mischnutzungsprogramm", "$350M Mischnutzungsprogramm"],
    ["800+ Mio. USD Entwicklungsvolumen", "$800M+ Entwicklungsvolumen"],
    ["USD 462m", "$462M"],
    ["USD 800m+ development volume", "$800M+ development volume"],
    ["Mio. USD", "M"],
  ])("normalizes compact German metric %s", (source, expected) => {
    expect(normalizeGermanCompactMillions(source)).toBe(expected);
  });

  it("does not rewrite written-out German financial prose", () => {
    const prose = "Das Volumen beträgt mehr als 400 Millionen US-Dollar.";
    expect(normalizeGermanCompactMillions(prose)).toBe(prose);
  });

  it("only applies runtime normalization to compact metric source fields", () => {
    expect(
      normalizeGermanCompactMetricTranslation(
        "Development value: USD 462m",
        "Entwicklungswert: 462 Mio. USD",
      ),
    ).toBe("Entwicklungswert: $462M");
    expect(
      normalizeGermanCompactMetricTranslation(
        "A paragraph about the development value",
        "Ein Absatz über 462 Mio. USD Entwicklungswert.",
      ),
    ).toBe("Ein Absatz über 462 Mio. USD Entwicklungswert.");
  });

  it("keeps every German compact-million catalog entry free of legacy suffixes", () => {
    const catalogs = [
      ["German overrides", germanTranslationFixes],
      ["curated copy", curatedVisibleTranslations],
      ["site copy", siteContentTranslations],
      ["base copy", textTranslations],
    ] as const;

    for (const [catalogName, catalog] of catalogs) {
      for (const [source, localeText] of Object.entries(catalog)) {
        if (source !== "m USD" && !/\bUSD\s+\d[\d.,]*m(?:\+)?(?=\s|$)/iu.test(source)) {
          continue;
        }

        const german = (localeText as { de?: string }).de;
        if (!german) continue;

        expect(german, `${catalogName}: ${source}`).not.toMatch(/Mio\.|\bUSD\s+\d[\d.,]*m/iu);
      }
    }
  });
});
