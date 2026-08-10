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

// Klem will provide the all-markets fallback separately. Until then, visitors
// outside CH/DE/AT do not see a dead or incorrectly routed WhatsApp control.
const GLOBAL_WHATSAPP: MarketWhatsAppContact | null = null;

export function getWhatsAppContactForCountry(country: string | null | undefined): MarketWhatsAppContact | null {
  const countryCode = normalizeCountryCode(country);

  if (countryCode === "CH") return SWITZERLAND_WHATSAPP;
  if (countryCode === "AT" || countryCode === "DE") return GERMAN_AUSTRIAN_WHATSAPP;

  return GLOBAL_WHATSAPP;
}
