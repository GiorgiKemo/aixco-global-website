import {
  getCountries,
  getCountryCallingCode,
  isSupportedCountry,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

const TIMEZONE_COUNTRIES: Record<string, CountryCode> = {
  "Asia/Dubai": "AE",
  "Asia/Tbilisi": "GE",
  "Europe/Berlin": "DE",
  "Europe/Ljubljana": "SI",
  "Europe/London": "GB",
  "Europe/Moscow": "RU",
  "Europe/Paris": "FR",
  "Europe/Warsaw": "PL",
  "Europe/Zurich": "CH",
};

export const DEFAULT_PHONE_COUNTRY: CountryCode = "CH";

export function getPhoneCountryFallback(locale?: string, timezone?: string) {
  if (timezone && TIMEZONE_COUNTRIES[timezone]) return TIMEZONE_COUNTRIES[timezone];

  if (locale) {
    try {
      const region = new Intl.Locale(locale.replace("_", "-")).region;
      if (region && isSupportedCountry(region)) return region;
    } catch {
      // Fall through to the stable AIXCO default.
    }
  }

  return DEFAULT_PHONE_COUNTRY;
}

export function getPhoneCountryOptions(locale: string) {
  const displayNames = new Intl.DisplayNames([locale, "en"], { type: "region" });

  return getCountries()
    .map((country) => ({
      country,
      callingCode: getCountryCallingCode(country),
      label: displayNames.of(country) ?? country,
    }))
    .sort((left, right) => left.label.localeCompare(right.label, locale));
}

export function composeInternationalPhone(country: CountryCode, value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) return trimmed;

  const parsed = parsePhoneNumberFromString(trimmed, country);
  if (parsed) return parsed.number;

  return `+${getCountryCallingCode(country)} ${trimmed}`;
}

export function toSupportedPhoneCountry(value: string | null | undefined) {
  const country = value?.trim().toUpperCase() ?? "";
  return isSupportedCountry(country) ? country : null;
}
