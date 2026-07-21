import { describe, expect, it } from "vitest";
import {
  composeInternationalPhone,
  getPhoneCountryFallback,
  toSupportedPhoneCountry,
} from "./phone-country";

describe("brochure phone country helpers", () => {
  it("uses the visitor timezone before the browser language", () => {
    expect(getPhoneCountryFallback("en-US", "Asia/Tbilisi")).toBe("GE");
  });

  it("falls back to the locale region and then Switzerland", () => {
    expect(getPhoneCountryFallback("de-DE", "Etc/Unknown")).toBe("DE");
    expect(getPhoneCountryFallback("en", "Etc/Unknown")).toBe("CH");
  });

  it("creates an international number while preserving an explicit prefix", () => {
    expect(composeInternationalPhone("GE", "555 12 34 56")).toBe("+995555123456");
    expect(composeInternationalPhone("DE", "+49 30 123456")).toBe("+49 30 123456");
    expect(toSupportedPhoneCountry("pl")).toBe("PL");
    expect(toSupportedPhoneCountry("XX")).toBeNull();
  });
});
