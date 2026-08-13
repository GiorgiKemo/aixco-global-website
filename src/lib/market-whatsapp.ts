import { normalizeCountryCode } from "@/lib/location-country";

export type MarketWhatsAppContact = {
  number: string;
  href: string;
  allowedPath: string;
};

function buildWhatsAppContact(number: string): MarketWhatsAppContact {
  const digits = number.replace(/\D/g, "");
  return {
    number,
    href: `https://wa.me/${digits}`,
    allowedPath: `/${digits}`,
  };
}

const SWITZERLAND_WHATSAPP = buildWhatsAppContact("+41 79 832 05 81");

const GERMAN_AUSTRIAN_WHATSAPP = buildWhatsAppContact("+43 664 255 4285");

const GLOBAL_WHATSAPP = buildWhatsAppContact("+995 555 54 36 55");

export function getWhatsAppContactForCountry(country: string | null | undefined): MarketWhatsAppContact | null {
  const countryCode = normalizeCountryCode(country);

  if (countryCode === "CH") return SWITZERLAND_WHATSAPP;
  if (countryCode === "AT" || countryCode === "DE") return GERMAN_AUSTRIAN_WHATSAPP;

  return countryCode ? GLOBAL_WHATSAPP : null;
}
