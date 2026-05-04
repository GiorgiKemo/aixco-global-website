import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { attributeTranslations, languageOptions, textTranslations, type Lang } from "./translations";

export const LANGS = languageOptions;
const DEFAULT_LANG: Lang = "en";

function isLang(value: string | null): value is Lang {
  return LANGS.some((option) => option.code === value);
}

const keyedText: Record<string, string> = {
  "nav.home": "Home",
  "nav.about": "About AIXCO",
  "nav.dubai": "Dubai",
  "nav.batumi": "Batumi",
  "nav.participate": "Ways to Participate",
  "nav.how": "How AIXCO Works",
  "nav.team": "Our Team",
  "nav.partners": "Partners",
  "nav.faqs": "FAQs",
  "nav.contact": "Contact",
  "cta.login": "Login",
  "cta.register": "Register",
  "cta.start": "Starting from €1,000",
  "cta.contact": "Contact AIXCO",
};
const pageTitle = "AIXCO.Global | Quality Real Estate Participation";
const pageDescription = "Participate in selected Batumi real estate projects starting from €1,000. Transparent structure, euro-based pricing, and long-term value creation.";
const supplementalTranslations: Partial<Record<string, Partial<Record<Lang, string>>>> = {
  Start: { de: "Starten Sie", ru: "Начните", ka: "დაიწყეთ", tr: "Başlatın", ar: "ابدأ" },
  How: { de: "Wie", ru: "Как", ka: "როგორ", tr: "Nasıl", ar: "كيف" },
  "Developments Underway": {
    de: "Laufende Entwicklungen",
    ru: "Проекты в разработке",
    ka: "მიმდინარე განვითარებები",
    tr: "Devam Eden Projeler",
    ar: "مشاريع قيد التطوير",
  },
  "Participate where growth, stability, and long term value creation meet. AIXCO gives private partners a simple and transparent way to join selected real estate projects.": {
    de: "Beteiligen Sie sich dort, wo Wachstum, Stabilität und langfristige Wertschöpfung zusammenkommen. AIXCO bietet privaten Partnern einen einfachen und transparenten Zugang zu ausgewählten Immobilienprojekten.",
    ru: "Участвуйте там, где сочетаются рост, стабильность и долгосрочное создание стоимости. AIXCO предлагает частным партнерам простой и прозрачный способ присоединиться к выбранным проектам недвижимости.",
    ka: "მიიღეთ მონაწილეობა იქ, სადაც ერთიანდება ზრდა, სტაბილურობა და გრძელვადიანი ღირებულების შექმნა. AIXCO კერძო პარტნიორებს სთავაზობს მარტივ და გამჭვირვალე გზას შერჩეულ უძრავი ქონების პროექტებში მონაწილეობის მისაღებად.",
    tr: "Büyüme, istikrar ve uzun vadeli değer yaratımının buluştuğu yerde yer alın. AIXCO, özel ortaklara seçilmiş gayrimenkul projelerine katılmaları için basit ve şeffaf bir yol sunar.",
    ar: "شارك حيث يلتقي النمو والاستقرار وخلق القيمة على المدى الطويل. تمنح AIXCO الشركاء من القطاع الخاص طريقة بسيطة وشفافة للانضمام إلى مشاريع عقارية مختارة.",
  },
  "Customer Real Estate Buyer": {
    de: "Kunde Immobilienkäufer",
    ru: "Клиент-покупатель недвижимости",
    ka: "კლიენტი უძრავი ქონების მყიდველი",
    tr: "Gayrimenkul Alıcısı Müşteri",
    ar: "عميل مشتري عقار",
  },
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  tx: (text: string) => string;
  dir: "ltr" | "rtl";
};
const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return DEFAULT_LANG;
    const storedLang = localStorage.getItem("aixco-lang");
    return isLang(storedLang) ? storedLang : DEFAULT_LANG;
  });
  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.title = lang === "en" ? pageTitle : attributeTranslations.title[pageTitle]?.[lang] ?? pageTitle;
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute(
        "content",
        lang === "en" ? pageDescription : attributeTranslations.content[pageDescription]?.[lang] ?? pageDescription,
      );
    }
    try {
      localStorage.setItem("aixco-lang", lang);
    } catch {
      // Language persistence is optional when browser storage is unavailable.
    }
  }, [lang, dir]);

  const value = useMemo<Ctx>(() => ({
    lang,
    setLang,
    dir,
    tx: (text) => {
      if (lang === "en") return text;
      const supplementalValue = supplementalTranslations[text]?.[lang];
      if (supplementalValue) return supplementalValue;
      const textValue = textTranslations[text as keyof typeof textTranslations]?.[lang];
      if (textValue) return textValue;
      const placeholderValue = attributeTranslations.placeholder[text as keyof typeof attributeTranslations.placeholder]?.[lang];
      if (placeholderValue) return placeholderValue;
      const contentValue = attributeTranslations.content[text as keyof typeof attributeTranslations.content]?.[lang];
      if (contentValue) return contentValue;
      const titleValue = attributeTranslations.title[text as keyof typeof attributeTranslations.title]?.[lang];
      return titleValue ?? text;
    },
    t: (key) => {
      const text = keyedText[key] ?? key;
      return lang === "en" ? text : textTranslations[text as keyof typeof textTranslations]?.[lang] ?? text;
    },
  }), [lang, dir]);

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
