import { describe, expect, it } from "vitest";
import { getCountryFromLocationHeaders, isSwitzerlandCountryCode, normalizeCountryCode } from "./location-country";

describe("location country detection", () => {
  it("prefers the hosting edge country header", () => {
    const headers = new Headers({
      "x-vercel-ip-country": "ge",
      "cf-ipcountry": "de",
    });

    expect(getCountryFromLocationHeaders(headers)).toBe("GE");
  });

  it("falls through invalid or unavailable location values", () => {
    const headers = new Headers({
      "x-vercel-ip-country": "XX",
      "cf-ipcountry": "pl",
    });

    expect(getCountryFromLocationHeaders(headers)).toBe("PL");
    expect(normalizeCountryCode("not-a-country")).toBeNull();
  });

  it("recognizes Switzerland while rejecting neighboring and unknown countries", () => {
    expect(isSwitzerlandCountryCode("ch")).toBe(true);
    expect(isSwitzerlandCountryCode("DE")).toBe(false);
    expect(isSwitzerlandCountryCode("XX")).toBe(false);
    expect(isSwitzerlandCountryCode(null)).toBe(false);
  });
});
