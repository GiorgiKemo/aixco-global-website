import { describe, expect, it } from "vitest";
import { assetTranslations } from "./asset-translations";
import { curatedVisibleTranslations } from "./curated-visible-translations";
import { germanTranslationFixes } from "./german-translation-fixes";
import { localePassthroughFixes } from "./locale-passthrough-fixes";
import { localeTranslationFixes } from "./locale-translation-fixes";
import { siteContentTranslations } from "./site-content-translations";
import { textTranslations } from "./translations";

type TranslationEntry = {
  de?: string;
};

type TranslationSource = Record<string, TranslationEntry>;

const intentionalGermanPassthrough = new Set([
  "AIXCO.Global",
  "2009",
  "600+",
  "The Canal",
  "Eden House The Canal",
  "Eden House The Park",
  "Dubai Healthcare City",
  "AIXCO",
  "USD",
]);

const englishLeakPattern = /\b(?:asset\s+management|opportunities|company|reporting|performance|brokern?|dashboard|updates|launch|listing|pipeline|onboarding|dealflow|legacy|buyer|developer|clients?|post-launch)\b/i;
const asciiGermanUmlautPattern = /\b(?:sorgfaeltig\w*|ausgewaehl\w*|widerstandsfaeh\w*|stabilitaet\w*|ertraeg\w*|gepraeg\w*|maerkt\w*|ursprueng\w*|grundsaetz\w*|risikopruef\w*|persoenlich\w*|broschuer\w*|immobilienpraesent\w*|projektpraesenz\w*|unterstuetz\w*|verfuegbar\w*|haeufig\w*|loesch\w*|einheitsloes\w*|aender\w*|eroeffn\w*|moechten\w*|moeglich\w*|vermoeg\w*|koennen\w*|muessen\w*|wuensch\w*|zurueck\w*|schliess\w*|abschliess\w*|fuehr\w*|gruend\w*|kaeufer\w*|verkaeuf\w*|eigentuemer\w*|uebergab\w*|staerk\w*|fuer|ueber|waehrend)\b/i;

describe("German translation completeness", () => {
  it("rejects English pass-through copy in the resolved catalog", () => {
    const sources: TranslationSource[] = [
      germanTranslationFixes,
      localeTranslationFixes,
      localePassthroughFixes,
      curatedVisibleTranslations,
      textTranslations,
      assetTranslations,
      siteContentTranslations,
    ];
    const keys = [...new Set(sources.flatMap((source) => Object.keys(source)))];
    const untranslated = keys.filter((key) => {
      const resolved = sources.find((source) => source[key]?.de)?.[key]?.de;
      return (!resolved || resolved === key) && !intentionalGermanPassthrough.has(key);
    });
    const mixedEnglish = keys.flatMap((key) => {
      const resolved = sources.find((source) => source[key]?.de)?.[key]?.de;
      return resolved && englishLeakPattern.test(resolved) ? [`${key} => ${resolved}`] : [];
    });
    const asciiUmlautSpellings = keys.flatMap((key) => {
      const resolved = sources.find((source) => source[key]?.de)?.[key]?.de;
      return resolved && asciiGermanUmlautPattern.test(resolved) ? [`${key} => ${resolved}`] : [];
    });

    expect(untranslated).toEqual([]);
    expect(mixedEnglish).toEqual([]);
    expect(asciiUmlautSpellings).toEqual([]);
  });
});
