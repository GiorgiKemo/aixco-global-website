import { describe, expect, it } from "vitest";
import { getWhatsAppContactForCountry } from "./market-whatsapp";

describe("market WhatsApp contacts", () => {
  it("uses the Swiss number for Switzerland", () => {
    expect(getWhatsAppContactForCountry("ch")).toEqual({
      number: "+41 79 434 05 81",
      href: "https://wa.me/41794340581",
      allowedPath: "/41794340581",
    });
  });

  it("uses the German/Austrian number for Germany and Austria", () => {
    const expected = {
      number: "+43 664 255 4285",
      href: "https://wa.me/436642554285",
      allowedPath: "/436642554285",
    };

    expect(getWhatsAppContactForCountry("DE")).toEqual(expected);
    expect(getWhatsAppContactForCountry("AT")).toEqual(expected);
  });

  it("does not expose a market number for other or unknown locations", () => {
    expect(getWhatsAppContactForCountry("GE")).toBeNull();
    expect(getWhatsAppContactForCountry("XX")).toBeNull();
    expect(getWhatsAppContactForCountry(null)).toBeNull();
  });
});
