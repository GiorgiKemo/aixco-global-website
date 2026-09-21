import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { reveranceStockCopy } from "./reverance-stock-copy";
import { reveranceStockTranslations } from "../i18n/reverance-stock-translations";

describe("current stock marketing copy", () => {
  it.each(["availability", "summary", "metadata"] as const)("translates %s in every supported language", key => {
    const text = reveranceStockCopy[key];
    expect(text).not.toMatch(/28-apartment|24 available|4 reserved|13th and 14th/);
    for (const lang of ["de", "pl", "sl", "ru"] as const) {
      expect(reveranceStockTranslations[text][lang]).toBeTruthy();
      expect(reveranceStockTranslations[text][lang]).not.toBe(text);
    }
  });

  it.each([
    "src/data/site.ts", "src/app/reverance-batumi/page.tsx", "src/i18n/I18nProvider.tsx",
    "src/components/sections/BrandbookLandingPage.tsx", "src/components/sections/MedicalTourismLandingPage.tsx",
  ])("uses shared current-stock copy in %s", file => {
    const source = fs.readFileSync(file, "utf8");
    expect(source).toContain("reveranceStockCopy");
    expect(source).not.toMatch(/28-apartment inventory|24 available|24 are currently available|selected 28 apartments/);
  });
});
