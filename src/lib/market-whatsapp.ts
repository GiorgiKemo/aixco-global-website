import { normalizeCountryCode } from "@/lib/location-country";

export type MarketWhatsAppContact = {
  number: string;
  href: string;
  allowedPath: string;
};

const SWITZERLAND_WHATSAPP: MarketWhatsAppContact = {
  number: "+41 79 434 05 81",
  href: "https://wa.me/41794340581",
  allowedPath: "/41794340581",
};

const GERMAN_AUSTRIAN_WHATSAPP: MarketWhatsAppContact = {
  number: "+43 664 255 4285",
  href: "https://wa.me/436642554285",
  allowedPath: "/436642554285",
};

export function getWhatsAppContactForCountry(country: string | null | undefined): MarketWhatsAppContact | null {
  const countryCode = normalizeCountryCode(country);

  if (countryCode === "CH") return SWITZERLAND_WHATSAPP;
  if (countryCode === "AT" || countryCode === "DE") return GERMAN_AUSTRIAN_WHATSAPP;

  return null;
}
