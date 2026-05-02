import { describe, expect, it } from "vitest";
import { languageOptions } from "./translations";

describe("languageOptions", () => {
  it("uses readable labels and does not ship replacement-question-mark text", () => {
    expect(languageOptions).toEqual([
      { code: "en", label: "English", native: "EN", flag: "GB" },
      { code: "de", label: "Deutsch", native: "DE", flag: "DE" },
      { code: "ru", label: "Русский", native: "RU", flag: "RU" },
      { code: "ka", label: "ქართული", native: "KA", flag: "GE" },
      { code: "tr", label: "Türkçe", native: "TR", flag: "TR" },
      { code: "ar", label: "العربية", native: "AR", flag: "SA" },
    ]);

    for (const option of languageOptions) {
      expect(`${option.label}${option.native}${option.flag}`).not.toContain("?");
    }
  });
});
