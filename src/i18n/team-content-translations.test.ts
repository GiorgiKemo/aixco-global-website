import { describe, expect, it } from "vitest";
import { team } from "@/data/site";
import { languageOptions } from "./languages";
import { siteContentTranslations } from "./site-content-translations";
import { teamContentTranslations } from "./team-content-translations";

const teamCopy = new Set(
  team.flatMap((member) => [
    member.bio,
    ...member.points.flatMap((point) => [point.title, point.text]),
  ]),
);

describe("team content translations", () => {
  it("keeps every leadership detail available in the initial active-language catalog", () => {
    const translatedLanguages = languageOptions
      .map((language) => language.code)
      .filter((language) => language !== "en");

    for (const copy of teamCopy) {
      const translations = teamContentTranslations[copy as keyof typeof teamContentTranslations];
      expect(translations, copy).toBeDefined();
      for (const language of translatedLanguages) {
        expect(translations?.[language as keyof typeof translations], `${language}: ${copy}`).toBeTruthy();
      }
    }
  });

  it("keeps the deferred full catalog aligned with the initial leadership catalog", () => {
    for (const copy of teamCopy) {
      expect(siteContentTranslations[copy as keyof typeof siteContentTranslations]).toEqual(
        teamContentTranslations[copy as keyof typeof teamContentTranslations],
      );
    }
  });
});
