import { describe, expect, it } from "vitest";
import { getWhatsAppContactForCountry } from "./market-whatsapp";

describe("market WhatsApp contacts", () => {
  it.each(["CH", "DE", "AT", "GE"])("keeps the WhatsApp URL aligned with the displayed number for %s", (country) => {
    const contact = getWhatsAppContactForCountry(country);

    expect(contact).not.toBeNull();
    const digits = contact!.number.replace(/\D/g, "");
    expect(contact!.href).toBe(`https://wa.me/${digits}`);
    expect(contact!.allowedPath).toBe(`/${digits}`);
  });

  it("uses the Swiss number for Switzerland", () => {
    expect(getWhatsAppContactForCountry("ch")).toEqual({
      number: "+41 79 832 05 81",
      href: "https://wa.me/41798320581",
      allowedPath: "/41798320581",
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

  it("uses the shared international number for other detected countries", () => {
    const expected = {
      number: "+995 555 54 36 55",
      href: "https://wa.me/995555543655",
      allowedPath: "/995555543655",
    };

    expect(getWhatsAppContactForCountry("GE")).toEqual(expected);
    expect(getWhatsAppContactForCountry("US")).toEqual(expected);
    expect(getWhatsAppContactForCountry("XX")).toBeNull();
  });

  it("fails closed when country detection is unavailable", () => {
    expect(getWhatsAppContactForCountry(null)).toBeNull();
  });
});
