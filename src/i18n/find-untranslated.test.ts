import { describe, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { textTranslations } from "./translations";
import { siteContentTranslations } from "./site-content-translations";
import { assetTranslations } from "./asset-translations";

type TranslationEntry = {
  de?: string;
};

type TranslationSource = Record<string, TranslationEntry>;

describe("find untranslated German keys", () => {
  it("dumps all untranslated keys", () => {
    // Read I18nProvider.tsx to extract clientBriefPassthroughCopy
    const providerPath = path.join(process.cwd(), "src/i18n/I18nProvider.tsx");
    const providerContent = fs.readFileSync(providerPath, "utf8");
    
    // Parse clientBriefPassthroughCopy array correctly using string regex
    const match = providerContent.match(/const clientBriefPassthroughCopy = \[\s*([\s\S]*?)\s*\] as const;/);
    const passthroughKeys: string[] = [];
    if (match) {
      const itemsText = match[1];
      const strRegex = /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/g;
      let m;
      while ((m = strRegex.exec(itemsText)) !== null) {
        const str = m[0].slice(1, -1); // remove surrounding quotes
        passthroughKeys.push(str);
      }
    }
    
    console.log(`Parsed ${passthroughKeys.length} keys from clientBriefPassthroughCopy`);

    const check = (source: TranslationSource, name: string) => {
      console.log(`\n=== Checking ${name} ===`);
      for (const [key, value] of Object.entries(source)) {
        if (!value || typeof value !== "object") continue;
        const de = value.de;
        if (!de) {
          console.log(`[Missing de] "${key}"`);
          continue;
        }
        if (de === key || de.trim() === key.trim()) {
          // Filter out proper nouns or single words that might be the same in German
          if (/[a-zA-Z]{3,}/.test(key) && key.includes(" ") && !key.includes("AIXCO") && !key.includes("Current project") && !key.includes("Batumi") && !key.includes("Dubai") && !key.includes("Eden House") && !key.includes("Healthcare City") && !key.includes("ISP Group") && !key.includes("Clean Elements") && !key.includes("Groupe GTI") && !key.includes("Bluerock")) {
            console.log(`[de == key] "${key}"`);
          }
        }
      }
    };

    check(textTranslations, "textTranslations");
    check(siteContentTranslations, "siteContentTranslations");
    check(assetTranslations, "assetTranslations");

    console.log(`\n=== Checking clientBriefPassthroughCopy ===`);
    for (const key of passthroughKeys) {
      if (/[a-zA-Z]{3,}/.test(key) && key.includes(" ") && !key.includes("AIXCO") && !key.includes("Current project") && !key.includes("Batumi") && !key.includes("Dubai") && !key.includes("Eden House") && !key.includes("Healthcare City") && !key.includes("ISP Group") && !key.includes("Clean Elements") && !key.includes("Groupe GTI") && !key.includes("Bluerock")) {
        // Check if there is a translation in translations.ts or site-content-translations.ts first
        const tVal = (textTranslations as TranslationSource)[key]?.de;
        const sVal = (siteContentTranslations as TranslationSource)[key]?.de;
        if (tVal && tVal !== key) continue;
        if (sVal && sVal !== key) continue;
        console.log(`[passthrough] "${key}"`);
      }
    }
  });
});
