import { describe, expect, it } from "vitest";
import { getCountryFromLocationHeaders, normalizeCountryCode } from "./location-country";

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
});
