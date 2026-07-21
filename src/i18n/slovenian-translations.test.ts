import { describe, expect, it } from "vitest";
import { slovenianTranslationFixes } from "./slovenian-translation-fixes";
import { slovenianTranslations } from "./slovenian-translations";

const protectedTerms = [
  "AIXCO",
  "ISO",
  "USD",
  "EUR",
  "Reverance",
  "Eden House",
  "Dubai Healthcare City",
  "Global Partners",
  "Workwise",
  "Daewoo",
  "info@aixco.global",
] as const;

function protectedValues(text: string) {
  const normalized = text.replaceAll("â‚¬", "€").replaceAll("â€”", "—");
  return normalized.match(/[$€£]?\d(?:[\d,.]*\d)?(?:[-–]\d(?:[\d,.]*\d)?)?(?:\s?%|[kKmMbB]\+?|\+)?/gu) ?? [];
}

describe("Slovenian translation catalog", () => {
  it("contains complete, clean generated values", () => {
    expect(Object.keys(slovenianTranslations).length).toBeGreaterThanOrEqual(970);

    for (const [source, entry] of Object.entries(slovenianTranslations)) {
      const translated = entry.sl;
      expect(translated, source).toBeTruthy();
      expect(translated, source).not.toMatch(/ZXQ\d+QXZ/i);
      expect(translated, source).not.toMatch(/Ã|Â|â‚¬|â€”|�/u);
      expect(protectedValues(translated), source).toEqual(protectedValues(source));

      for (const term of protectedTerms) {
        if (source.includes(term)) expect(translated, source).toContain(term);
      }
    }
  });

  it("keeps Slovenian diacritics in real interface copy", () => {
    expect(slovenianTranslations["Explore opportunities"].sl).toMatch(/[čšž]/iu);
    expect(slovenianTranslations["This page is not available."].sl).toBe("Ta stran ni na voljo.");
  });

  it("uses reviewed Slovenian for prominent calls to action and project copy", () => {
    expect(slovenianTranslationFixes.REGISTER.sl).toBe("REGISTRIRAJTE SE");
    expect(slovenianTranslationFixes["Our current project"].sl).toBe("Naš trenutni projekt");
    expect(slovenianTranslationFixes["Entry from €45,000"].sl).toBe("Vstopna cena od €45,000");
    expect(slovenianTranslationFixes["Secure your position from €5,000"].sl).toContain("€5,000");
    expect(slovenianTranslationFixes["USD 462m"].sl).toBe("$462M");
    expect(slovenianTranslationFixes["USD 350m mixed-use program"].sl).toBe("$350M program mešane rabe");
    expect(slovenianTranslationFixes.Risk.sl).toBe("Tveganje");
    expect(slovenianTranslationFixes.Email.sl).toBe("E-pošta");
    expect(
      slovenianTranslationFixes[
        "Reverance is a premium residential complex on Batumi's New Boulevard. AIXCO currently offers 28 selected apartments on the 13th and 14th floors, with completion targeted for July 2028."
      ].sl,
    ).toContain("13. in 14. nadstropju");
  });
});
