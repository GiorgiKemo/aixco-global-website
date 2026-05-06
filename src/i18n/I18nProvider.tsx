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
  "starting from": { de: "ab", ru: "от", ka: "დაწყებული", tr: "başlayan", ar: "ابتداءً من" },
  "up to": { de: "bis zu", ru: "до", ka: "მდე", tr: "en fazla", ar: "حتى" },
  from: { de: "ab", ru: "от", ka: "დან", tr: "itibaren", ar: "من" },
  "Rental yield": { de: "Mietrendite", ru: "Арендная доходность", ka: "ქირის შემოსავალი", tr: "Kira getirisi", ar: "عائد الإيجار" },
  "Annual growth": { de: "Jährliches Wachstum", ru: "Годовой рост", ka: "წლიური ზრდა", tr: "Yıllık büyüme", ar: "النمو السنوي" },
  "Entry price": { de: "Einstiegspreis", ru: "Входная цена", ka: "საწყისი ფასი", tr: "Giriş fiyatı", ar: "سعر الدخول" },
  Ownership: { de: "Eigentum", ru: "Собственность", ka: "საკუთრება", tr: "Mülkiyet", ar: "الملكية" },
  Tax: { de: "Steuer", ru: "Налог", ka: "გადასახადი", tr: "Vergi", ar: "الضريبة" },
  "Capital gains": { de: "Kapitalgewinne", ru: "Прирост капитала", ka: "კაპიტალის მოგება", tr: "Sermaye kazancı", ar: "أرباح رأس المال" },
  Financing: { de: "Finanzierung", ru: "Финансирование", ka: "დაფინანსება", tr: "Finansman", ar: "التمويل" },
  Units: { de: "Einheiten", ru: "Юниты", ka: "ერთეულები", tr: "Üniteler", ar: "الوحدات" },
  Total: { de: "Gesamt", ru: "Итого", ka: "სულ", tr: "Toplam", ar: "الإجمالي" },
  Performance: { de: "Performance", ru: "Результат", ka: "შედეგი", tr: "Performans", ar: "الأداء" },
  Revenues: { de: "Erlöse", ru: "Выручка", ka: "შემოსავლები", tr: "Gelirler", ar: "الإيرادات" },
  Exit: { de: "Exit", ru: "Выход", ka: "გასვლა", tr: "Çıkış", ar: "الخروج" },
  Highlights: { de: "Highlights", ru: "Ключевые моменты", ka: "მთავარი საკითხები", tr: "Öne çıkanlar", ar: "أبرز النقاط" },
  "Group company": { de: "Konzerngesellschaft", ru: "Компания группы", ka: "ჯგუფის კომპანია", tr: "Grup şirketi", ar: "شركة ضمن المجموعة" },
  "Strategic partner": { de: "Strategischer Partner", ru: "Стратегический партнер", ka: "სტრატეგიული პარტნიორი", tr: "Stratejik ortak", ar: "شريك استراتيجي" },
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

const catalogSources = [
  supplementalTranslations,
  textTranslations,
  attributeTranslations.placeholder,
  attributeTranslations.content,
  attributeTranslations.title,
] as Array<Partial<Record<string, Partial<Record<Lang, string>>>>>;

function lookupTranslation(text: string, lang: Lang) {
  for (const source of catalogSources) {
    const value = source[text]?.[lang];
    if (value) return value;
  }

  const normalizedText = text.trim().toLocaleLowerCase("en-US");
  for (const source of catalogSources) {
    const key = Object.keys(source).find((candidate) => candidate.trim().toLocaleLowerCase("en-US") === normalizedText);
    const value = key ? source[key]?.[lang] : undefined;
    if (value) return value;
  }

  return undefined;
}

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
      return lookupTranslation(text, lang) ?? text;
    },
    t: (key) => {
      const text = keyedText[key] ?? key;
      return lang === "en" ? text : lookupTranslation(text, lang) ?? text;
    },
  }), [lang, dir]);

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
