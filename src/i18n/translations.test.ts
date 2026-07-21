import { describe, expect, it } from "vitest";
import { languageOptions } from "./languages";

describe("languageOptions", () => {
  it("uses readable labels and does not ship replacement-question-mark text", () => {
    expect(languageOptions).toEqual([
      { code: "en", label: "English", native: "EN", flag: "GB" },
      { code: "de", label: "Deutsch", native: "DE", flag: "DE" },
      { code: "pl", label: "Polski", native: "PL", flag: "PL" },
      { code: "sl", label: "Slovenščina", native: "SL", flag: "SI" },
      { code: "ru", label: "Русский", native: "RU", flag: "RU" },
    ]);

    for (const option of languageOptions) {
      expect(`${option.label}${option.native}${option.flag}`).not.toContain("?");
    }
    expect(languageOptions.map(({ code }) => code)).not.toEqual(expect.arrayContaining(["ka", "tr", "ar"]));
  });
});
