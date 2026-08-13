import { normalizeCountryCode } from "@/lib/location-country";

export type MarketWhatsAppContact = {
  number: string;
  href: string;
  allowedPath: string;
};

const SWITZERLAND_WHATSAPP: MarketWhatsAppContact = {
  number: "+41 79 832 05 81",
  href: "https://wa.me/41798320581",
  allowedPath: "/41798320581",
};

const GERMAN_AUSTRIAN_WHATSAPP: MarketWhatsAppContact = {
  number: "+43 664 255 4285",
  href: "https://wa.me/436642554285",
  allowedPath: "/436642554285",
};

const GLOBAL_WHATSAPP: MarketWhatsAppContact = {
  number: "+995 555 54 36 55",
  href: "https://wa.me/99555543655",
  allowedPath: "/99555543655",
};

export function getWhatsAppContactForCountry(country: string | null | undefined): MarketWhatsAppContact | null {
  const countryCode = normalizeCountryCode(country);

  if (countryCode === "CH") return SWITZERLAND_WHATSAPP;
  if (countryCode === "AT" || countryCode === "DE") return GERMAN_AUSTRIAN_WHATSAPP;

  return countryCode ? GLOBAL_WHATSAPP : null;
}
