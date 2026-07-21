const LOCATION_COUNTRY_HEADERS = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "cloudfront-viewer-country",
  "x-country-code",
] as const;

export function normalizeCountryCode(value: string | null | undefined) {
  const country = value?.trim().toUpperCase() ?? "";
  return /^[A-Z]{2}$/u.test(country) && country !== "XX" ? country : null;
}

export function getCountryFromLocationHeaders(headers: Pick<Headers, "get">) {
  for (const name of LOCATION_COUNTRY_HEADERS) {
    const country = normalizeCountryCode(headers.get(name));
    if (country) return country;
  }

  return null;
}
