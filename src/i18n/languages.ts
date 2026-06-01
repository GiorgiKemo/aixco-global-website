export type Lang = "en" | "de" | "ru" | "ka" | "tr" | "ar";

export const languageOptions: { code: Lang; label: string; native: string; flag: string }[] = [
  { code: "en", label: "English", native: "EN", flag: "GB" },
  { code: "de", label: "Deutsch", native: "DE", flag: "DE" },
  { code: "ru", label: "Русский", native: "RU", flag: "RU" },
  { code: "ka", label: "ქართული", native: "KA", flag: "GE" },
  { code: "tr", label: "Türkçe", native: "TR", flag: "TR" },
  { code: "ar", label: "العربية", native: "AR", flag: "SA" },
];
