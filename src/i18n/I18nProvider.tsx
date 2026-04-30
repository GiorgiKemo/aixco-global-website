import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "en" | "de" | "ru" | "ka" | "tr" | "ar";

export const LANGS: { code: Lang; label: string; native: string }[] = [
  { code: "en", label: "English", native: "EN" },
  { code: "de", label: "Deutsch", native: "DE" },
  { code: "ru", label: "Русский", native: "RU" },
  { code: "ka", label: "ქართული", native: "KA" },
  { code: "tr", label: "Türkçe", native: "TR" },
  { code: "ar", label: "العربية", native: "AR" },
];

type Dict = Record<string, Partial<Record<Lang, string>>>;

// Minimal nav/CTA dictionary. Body content stays in English in this v1.
const dict: Dict = {
  "nav.home": { en: "Home", de: "Start", ru: "Главная", ka: "მთავარი", tr: "Ana Sayfa", ar: "الرئيسية" },
  "nav.about": { en: "About", de: "Über uns", ru: "О нас", ka: "შესახებ", tr: "Hakkımızda", ar: "عن أيكسكو" },
  "nav.dubai": { en: "Dubai", de: "Dubai", ru: "Дубай", ka: "დუბაი", tr: "Dubai", ar: "دبي" },
  "nav.batumi": { en: "Batumi", de: "Batumi", ru: "Батуми", ka: "ბათუმი", tr: "Batum", ar: "باتومي" },
  "nav.participate": { en: "Participate", de: "Mitwirken", ru: "Участие", ka: "მონაწილეობა", tr: "Katılım", ar: "المشاركة" },
  "nav.how": { en: "How it works", de: "Funktionsweise", ru: "Как работает", ka: "როგორ მუშაობს", tr: "Nasıl Çalışır", ar: "كيف نعمل" },
  "nav.team": { en: "Team", de: "Team", ru: "Команда", ka: "გუნდი", tr: "Ekip", ar: "الفريق" },
  "nav.partners": { en: "Partners", de: "Partner", ru: "Партнёры", ka: "პარტნიორები", tr: "Ortaklar", ar: "الشركاء" },
  "nav.insights": { en: "Insights", de: "Insights", ru: "Аналитика", ka: "ანალიტიკა", tr: "İçgörüler", ar: "رؤى" },
  "nav.faqs": { en: "FAQs", de: "FAQs", ru: "Вопросы", ka: "FAQ", tr: "SSS", ar: "الأسئلة" },
  "nav.contact": { en: "Contact", de: "Kontakt", ru: "Контакты", ka: "კონტაქტი", tr: "İletişim", ar: "اتصل" },
  "cta.login": { en: "Login", de: "Anmelden", ru: "Войти", ka: "შესვლა", tr: "Giriş", ar: "دخول" },
  "cta.register": { en: "Register", de: "Registrieren", ru: "Регистрация", ka: "რეგისტრაცია", tr: "Kayıt", ar: "تسجيل" },
  "cta.start": { en: "Start from €1,000", de: "Ab €1.000 starten", ru: "Старт от €1 000", ka: "დაიწყე €1,000-დან", tr: "€1.000'den başla", ar: "ابدأ من €1,000" },
  "cta.contact": { en: "Contact AIXCO", de: "AIXCO kontaktieren", ru: "Связаться", ka: "დაგვიკავშირდი", tr: "Bize Ulaşın", ar: "تواصل معنا" },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string; dir: "ltr" | "rtl" };
const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => (typeof window !== "undefined" && (localStorage.getItem("aixco-lang") as Lang)) || "en");
  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try { localStorage.setItem("aixco-lang", lang); } catch {}
  }, [lang, dir]);

  const value = useMemo<Ctx>(() => ({
    lang,
    setLang,
    dir,
    t: (key) => dict[key]?.[lang] ?? dict[key]?.en ?? key,
  }), [lang, dir]);

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
