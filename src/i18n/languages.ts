export type Lang = "en" | "de" | "pl" | "sl" | "ru";

// The legacy locale keys remain part of the catalog shape so the existing
// historical translations can stay in source without being exposed in the UI.
export type CatalogLang = Lang | "ka" | "tr" | "ar";

export const languageOptions: { code: Lang; label: string; native: string; flag: string }[] = [
  { code: "en", label: "English", native: "EN", flag: "GB" },
  { code: "de", label: "Deutsch", native: "DE", flag: "DE" },
  { code: "pl", label: "Polski", native: "PL", flag: "PL" },
  { code: "sl", label: "Slovenščina", native: "SL", flag: "SI" },
  { code: "ru", label: "Русский", native: "RU", flag: "RU" },
];
