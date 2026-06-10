import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { languageOptions, type Lang } from "./languages";

export const LANGS = languageOptions;
const DEFAULT_LANG: Lang = "en";

function isLang(value: string | null): value is Lang {
  return LANGS.some((option) => option.code === value);
}

const keyedText: Record<string, string> = {
  "nav.home": "Home",
  "nav.about": "About AIXCO",
  "nav.legacy": "Our journey",
  "nav.dubai": "Dubai",
  "nav.batumi": "Batumi",
  "nav.materials": "Materials",
  "nav.participate": "How to work with AIXCO",
  "nav.how": "How AIXCO Works",
  "nav.team": "Our Team",
  "nav.partners": "Partners",
  "nav.faqs": "FAQs",
  "nav.contact": "Contact",
  "nav.philosophy": "AIXCO Philosophy",
  "nav.more": "More",
  "cta.login": "Login",
  "cta.register": "Register",
  "cta.start": "Explore Batumi real estate",
  "cta.contact": "Contact AIXCO",
};
const pageTitle = "AIXCO.Global | Quality Real Estate — Buy · Broker · Manage";
const pageDescription =
  "Buy selected Batumi apartments with transparent euro pricing from €50,000. Real estate buy-sell-brokerage across Switzerland, Dubai legacy, and Georgia.";
const supplementalTranslations: Partial<Record<string, Partial<Record<Lang, string>>>> = {
  "Checking the AIXCO website content...": {
    de: "AIXCO-Websiteinhalte werden geprueft...",
    ru: "Checking the AIXCO website content...",
    ka: "Checking the AIXCO website content...",
    tr: "AIXCO web sitesi icerigi kontrol ediliyor...",
    ar: "Checking the AIXCO website content...",
  },
  "Answering from website content...": {
    de: "Antwort aus Websiteinhalten...",
    ru: "Answering from website content...",
    ka: "Answering from website content...",
    tr: "Web sitesi iceriginden yanitlaniyor...",
    ar: "Answering from website content...",
  },
  "Client materials": { de: "Client materials", ru: "Client materials", ka: "Client materials", tr: "Client materials", ar: "Client materials" },
  "Materials & downloads": { de: "Materials & downloads", ru: "Materials & downloads", ka: "Materials & downloads", tr: "Materials & downloads", ar: "Materials & downloads" },
  "Download brochures, catalog sheets, and property reference files for the real estate routes shown on this page.": {
    de: "Download brochures, catalog sheets, and property reference files for the real estate routes shown on this page.",
    ru: "Download brochures, catalog sheets, and property reference files for the real estate routes shown on this page.",
    ka: "Download brochures, catalog sheets, and property reference files for the real estate routes shown on this page.",
    tr: "Download brochures, catalog sheets, and property reference files for the real estate routes shown on this page.",
    ar: "Download brochures, catalog sheets, and property reference files for the real estate routes shown on this page.",
  },
  "Available files": { de: "Available files", ru: "Available files", ka: "Available files", tr: "Available files", ar: "Available files" },
  Audience: { de: "Audience", ru: "Audience", ka: "Audience", tr: "Audience", ar: "Audience" },
  Download: { de: "Download", ru: "Download", ka: "Download", tr: "Download", ar: "Download" },
  "Batumi project brochure": { de: "Batumi project brochure", ru: "Batumi project brochure", ka: "Batumi project brochure", tr: "Batumi project brochure", ar: "Batumi project brochure" },
  "Otium brochure": { de: "Otium brochure", ru: "Otium brochure", ka: "Otium brochure", tr: "Otium brochure", ar: "Otium brochure" },
  "Full Otium project PDF for clients comparing Batumi apartment options.": {
    de: "Full Otium project PDF for clients comparing Batumi apartment options.",
    ru: "Full Otium project PDF for clients comparing Batumi apartment options.",
    ka: "Full Otium project PDF for clients comparing Batumi apartment options.",
    tr: "Full Otium project PDF for clients comparing Batumi apartment options.",
    ar: "Full Otium project PDF for clients comparing Batumi apartment options.",
  },
  "Catalog sheet": { de: "Catalog sheet", ru: "Catalog sheet", ka: "Catalog sheet", tr: "Catalog sheet", ar: "Catalog sheet" },
  "Otium catalog sheet": { de: "Otium catalog sheet", ru: "Otium catalog sheet", ka: "Otium catalog sheet", tr: "Otium catalog sheet", ar: "Otium catalog sheet" },
  "High-resolution Otium catalog image for quick sharing and offline review.": {
    de: "High-resolution Otium catalog image for quick sharing and offline review.",
    ru: "High-resolution Otium catalog image for quick sharing and offline review.",
    ka: "High-resolution Otium catalog image for quick sharing and offline review.",
    tr: "High-resolution Otium catalog image for quick sharing and offline review.",
    ar: "High-resolution Otium catalog image for quick sharing and offline review.",
  },
  "Dubai legacy reference": { de: "Dubai legacy reference", ru: "Dubai legacy reference", ka: "Dubai legacy reference", tr: "Dubai legacy reference", ar: "Dubai legacy reference" },
  "Eden House legacy image": { de: "Eden House legacy image", ru: "Eden House legacy image", ka: "Eden House legacy image", tr: "Eden House legacy image", ar: "Eden House legacy image" },
  "Downloadable legacy visual reference for Eden House in Dubai.": {
    de: "Downloadable legacy visual reference for Eden House in Dubai.",
    ru: "Downloadable legacy visual reference for Eden House in Dubai.",
    ka: "Downloadable legacy visual reference for Eden House in Dubai.",
    tr: "Downloadable legacy visual reference for Eden House in Dubai.",
    ar: "Downloadable legacy visual reference for Eden House in Dubai.",
  },
  "Dubai Healthcare City image": { de: "Dubai Healthcare City image", ru: "Dubai Healthcare City image", ka: "Dubai Healthcare City image", tr: "Dubai Healthcare City image", ar: "Dubai Healthcare City image" },
  "Downloadable legacy visual reference for Dubai Healthcare City.": {
    de: "Downloadable legacy visual reference for Dubai Healthcare City.",
    ru: "Downloadable legacy visual reference for Dubai Healthcare City.",
    ka: "Downloadable legacy visual reference for Dubai Healthcare City.",
    tr: "Downloadable legacy visual reference for Dubai Healthcare City.",
    ar: "Downloadable legacy visual reference for Dubai Healthcare City.",
  },
  "Clients and brokers": { de: "Clients and brokers", ru: "Clients and brokers", ka: "Clients and brokers", tr: "Clients and brokers", ar: "Clients and brokers" },
  "Clients and sales partners": { de: "Clients and sales partners", ru: "Clients and sales partners", ka: "Clients and sales partners", tr: "Clients and sales partners", ar: "Clients and sales partners" },
  "Clients and partners": { de: "Clients and partners", ru: "Clients and partners", ka: "Clients and partners", tr: "Clients and partners", ar: "Clients and partners" },
  Start: { de: "Starten Sie", ru: "Начните", ka: "დაიწყეთ", tr: "Başlatın", ar: "ابدأ" },
  About: { de: "Ueber AIXCO", ru: "About", ka: "About", tr: "About", ar: "About" },
  Login: { de: "Anmelden", ru: "Войти", ka: "შესვლა", tr: "Giriş", ar: "تسجيل الدخول" },
  Register: { de: "Registrieren", ru: "Регистрация", ka: "რეგისტრაცია", tr: "Kayıt Ol", ar: "التسجيل" },
  "Open menu": { de: "Menü öffnen", ru: "Открыть меню", ka: "მენიუს გახსნა", tr: "Menüyü aç", ar: "افتح القائمة" },
  "Close menu": { de: "Menü schließen", ru: "Закрыть меню", ka: "მენიუს დახურვა", tr: "Menüyü kapat", ar: "أغلق القائمة" },
  "Social media": { de: "Social Media", ru: "Социальные сети", ka: "სოციალური მედია", tr: "Sosyal medya", ar: "وسائل التواصل الاجتماعي" },
  "AIXCO footer introduction": { de: "AIXCO Footer-Einfuehrung", ru: "AIXCO footer introduction", ka: "AIXCO footer introduction", tr: "AIXCO footer introduction", ar: "AIXCO footer introduction" },
  "AIXCO social media links": { de: "AIXCO Social-Media-Links", ru: "AIXCO social media links", ka: "AIXCO social media links", tr: "AIXCO social media links", ar: "AIXCO social media links" },
  "Buy, broker, and manage selected real estate routes with AIXCO.": {
    de: "Ausgewaehlte Immobilienwege mit AIXCO kaufen, vermitteln und verwalten.",
    ru: "Buy, broker, and manage selected real estate routes with AIXCO.",
    ka: "Buy, broker, and manage selected real estate routes with AIXCO.",
    tr: "Buy, broker, and manage selected real estate routes with AIXCO.",
    ar: "Buy, broker, and manage selected real estate routes with AIXCO.",
  },
  "Buy, broker, and manage real estate with AIXCO.": {
    de: "Immobilien mit AIXCO kaufen, vermitteln und verwalten.",
    ru: "Buy, broker, and manage real estate with AIXCO.",
    ka: "Buy, broker, and manage real estate with AIXCO.",
    tr: "Buy, broker, and manage real estate with AIXCO.",
    ar: "Buy, broker, and manage real estate with AIXCO.",
  },
  "Review Batumi apartments, legacy real estate references, client materials, and the correct onboarding route from one place.": {
    de: "Pruefen Sie Batumi-Apartments, Immobilienreferenzen, Kundenmaterialien und den passenden Onboarding-Weg an einem Ort.",
    ru: "Review Batumi apartments, legacy real estate references, client materials, and the correct onboarding route from one place.",
    ka: "Review Batumi apartments, legacy real estate references, client materials, and the correct onboarding route from one place.",
    tr: "Review Batumi apartments, legacy real estate references, client materials, and the correct onboarding route from one place.",
    ar: "Review Batumi apartments, legacy real estate references, client materials, and the correct onboarding route from one place.",
  },
  "Email AIXCO": { de: "AIXCO per E-Mail kontaktieren", ru: "Email AIXCO", ka: "Email AIXCO", tr: "Email AIXCO", ar: "Email AIXCO" },
  "Real estate routes": { de: "Immobilienwege", ru: "Real estate routes", ka: "Real estate routes", tr: "Real estate routes", ar: "Real estate routes" },
  Routes: { de: "Wege", ru: "Routes", ka: "Routes", tr: "Routes", ar: "Routes" },
  "Buy in Batumi": { de: "In Batumi kaufen", ru: "Buy in Batumi", ka: "Buy in Batumi", tr: "Buy in Batumi", ar: "Buy in Batumi" },
  "Dubai legacy": { de: "Dubai-Legacy", ru: "Dubai legacy", ka: "Dubai legacy", tr: "Dubai legacy", ar: "Dubai legacy" },
  "Official systems certified": { de: "Offizielle Systeme zertifiziert", ru: "Official systems certified", ka: "Official systems certified", tr: "Official systems certified", ar: "Official systems certified" },
  "Explore Batumi real estate": {
    de: "Batumi-Immobilien erkunden",
    ru: "Explore Batumi real estate",
    ka: "Explore Batumi real estate",
    tr: "Explore Batumi real estate",
    ar: "Explore Batumi real estate",
  },
  "Enter Uprising real estate with AIXCO": {
    de: "Mit AIXCO in Uprising-Immobilien einsteigen",
    ru: "Enter Uprising real estate with AIXCO",
    ka: "Enter Uprising real estate with AIXCO",
    tr: "Enter Uprising real estate with AIXCO",
    ar: "Enter Uprising real estate with AIXCO",
  },
  "Buy a flat, review selected apartments, and explore an opportunity-driven emerging market with the AIXCO team.": {
    de: "Buy a flat, review selected apartments, and explore an opportunity-driven emerging market with the AIXCO team.",
    ru: "Buy a flat, review selected apartments, and explore an opportunity-driven emerging market with the AIXCO team.",
    ka: "Buy a flat, review selected apartments, and explore an opportunity-driven emerging market with the AIXCO team.",
    tr: "Buy a flat, review selected apartments, and explore an opportunity-driven emerging market with the AIXCO team.",
    ar: "Buy a flat, review selected apartments, and explore an opportunity-driven emerging market with the AIXCO team.",
  },
  "How to work with AIXCO": {
    de: "Mit AIXCO arbeiten",
    ru: "How to work with AIXCO",
    ka: "AIXCO-სთან მუშაობა",
    tr: "How to work with AIXCO",
    ar: "How to work with AIXCO",
  },
  "How AIXCO Works": {
    de: "Wie AIXCO funktioniert",
    ru: "How AIXCO Works",
    ka: "როგორ მუშაობს AIXCO",
    tr: "How AIXCO Works",
    ar: "How AIXCO Works",
  },
  "How to work": { de: "Mit AIXCO arbeiten", ru: "How to work", ka: "AIXCO-სთან მუშაობა", tr: "How to work", ar: "How to work" },
  "How it works": { de: "So funktioniert es", ru: "How it works", ka: "How it works", tr: "How it works", ar: "How it works" },
  "your Batumi real estate journey": {
    de: "Ihre Batumi-Immobilienreise",
    ru: "your Batumi real estate journey",
    ka: "your Batumi real estate journey",
    tr: "your Batumi real estate journey",
    ar: "your Batumi real estate journey",
  },
  "Register with us now to buy Batumi apartments, partner as a broker, or discuss property administration with the AIXCO team.": {
    de: "Register with us now to buy Batumi apartments, partner as a broker, or discuss property administration with the AIXCO team.",
    ru: "Register with us now to buy Batumi apartments, partner as a broker, or discuss property administration with the AIXCO team.",
    ka: "Register with us now to buy Batumi apartments, partner as a broker, or discuss property administration with the AIXCO team.",
    tr: "Register with us now to buy Batumi apartments, partner as a broker, or discuss property administration with the AIXCO team.",
    ar: "Register with us now to buy Batumi apartments, partner as a broker, or discuss property administration with the AIXCO team.",
  },
  "Real estate interest": {
    de: "Immobilieninteresse",
    ru: "Real estate interest",
    ka: "Real estate interest",
    tr: "Real estate interest",
    ar: "Real estate interest",
  },
  "Entry starts from €50,000 for selected Batumi projects and apartments available exclusively through AIXCO. Full commission can be payable from only a 10% down payment, with final terms depending on project and agreement.": {
    de: "Entry starts from €50,000 for selected Batumi projects and apartments available exclusively through AIXCO. Full commission can be payable from only a 10% down payment, with final terms depending on project and agreement.",
    ru: "Entry starts from €50,000 for selected Batumi projects and apartments available exclusively through AIXCO. Full commission can be payable from only a 10% down payment, with final terms depending on project and agreement.",
    ka: "Entry starts from €50,000 for selected Batumi projects and apartments available exclusively through AIXCO. Full commission can be payable from only a 10% down payment, with final terms depending on project and agreement.",
    tr: "Entry starts from €50,000 for selected Batumi projects and apartments available exclusively through AIXCO. Full commission can be payable from only a 10% down payment, with final terms depending on project and agreement.",
    ar: "Entry starts from €50,000 for selected Batumi projects and apartments available exclusively through AIXCO. Full commission can be payable from only a 10% down payment, with final terms depending on project and agreement.",
  },
  "Can I ask about AIXCO company financing?": {
    de: "Can I ask about AIXCO company financing?",
    ru: "Can I ask about AIXCO company financing?",
    ka: "Can I ask about AIXCO company financing?",
    tr: "Can I ask about AIXCO company financing?",
    ar: "Can I ask about AIXCO company financing?",
  },
  "Yes. AIXCO.Global is presented first as a real estate platform for buying, brokering, and administering property. Separate company-financing information may be available on request from the AIXCO team; it is not a primary website journey and no bond terms are promoted on this page.": {
    de: "Yes. AIXCO.Global is presented first as a real estate platform for buying, brokering, and administering property. Separate company-financing information may be available on request from the AIXCO team; it is not a primary website journey and no bond terms are promoted on this page.",
    ru: "Yes. AIXCO.Global is presented first as a real estate platform for buying, brokering, and administering property. Separate company-financing information may be available on request from the AIXCO team; it is not a primary website journey and no bond terms are promoted on this page.",
    ka: "Yes. AIXCO.Global is presented first as a real estate platform for buying, brokering, and administering property. Separate company-financing information may be available on request from the AIXCO team; it is not a primary website journey and no bond terms are promoted on this page.",
    tr: "Yes. AIXCO.Global is presented first as a real estate platform for buying, brokering, and administering property. Separate company-financing information may be available on request from the AIXCO team; it is not a primary website journey and no bond terms are promoted on this page.",
    ar: "Yes. AIXCO.Global is presented first as a real estate platform for buying, brokering, and administering property. Separate company-financing information may be available on request from the AIXCO team; it is not a primary website journey and no bond terms are promoted on this page.",
  },
  How: { de: "Wie", ru: "Как", ka: "როგორ", tr: "Nasıl", ar: "كيف" },
  "starting from": { de: "ab", ru: "от", ka: "დაწყებული", tr: "başlayan", ar: "ابتداءً من" },
  "up to": { de: "bis zu", ru: "до", ka: "მდე", tr: "en fazla", ar: "حتى" },
  from: { de: "ab", ru: "от", ka: "-დან", tr: "itibaren", ar: "من" },
  "Rental income": { de: "Mieteinnahmen", ru: "Арендный доход", ka: "გაქირავების შემოსავალი", tr: "Kira geliri", ar: "دخل الإيجار" },
  "scenario from": { de: "Szenario ab", ru: "сценарий от", ka: "სცენარი დან", tr: "senaryo", ar: "سيناريو من" },
  "Annual growth": { de: "Jährliches Wachstum", ru: "Годовой рост", ka: "წლიური ზრდა", tr: "Yıllık büyüme", ar: "النمو السنوي" },
  "Entry price": { de: "Einstiegspreis", ru: "Входная цена", ka: "შესვლის საფასური", tr: "Giriş fiyatı", ar: "سعر الدخول" },
  Ownership: { de: "Eigentum", ru: "Собственность", ka: "საკუთრება", tr: "Mülkiyet", ar: "الملكية" },
  Tax: { de: "Steuer", ru: "Налог", ka: "გადასახადი", tr: "Vergi", ar: "الضريبة" },
  "Capital gains": { de: "Kapitalgewinne", ru: "Прирост капитала", ka: "კაპიტალის მოგება", tr: "Sermaye kazancı", ar: "أرباح رأس المال" },
  Financing: { de: "Finanzierung", ru: "Финансирование", ka: "დაფინანსება", tr: "Finansman", ar: "التمويل" },
  Units: { de: "Einheiten", ru: "Юниты", ka: "ერთეულები", tr: "Üniteler", ar: "الوحدات" },
  Total: { de: "Gesamt", ru: "Итого", ka: "ჯამი", tr: "Toplam", ar: "الإجمالي" },
  Performance: { de: "Performance", ru: "Результат", ka: "შედეგიანობა", tr: "Performans", ar: "الأداء" },
  Revenues: { de: "Erlöse", ru: "Выручка", ka: "შემოსავლები", tr: "Gelirler", ar: "الإيرادات" },
  Exit: { de: "Exit", ru: "Выход", ka: "გასვლა", tr: "Çıkış", ar: "الخروج" },
  Highlights: { de: "Highlights", ru: "Ключевые моменты", ka: "მთავარი", tr: "Öne çıkanlar", ar: "أبرز النقاط" },
  "Group company": { de: "Konzerngesellschaft", ru: "Компания группы", ka: "ჯგუფის კომპანია", tr: "Grup şirketi", ar: "شركة ضمن المجموعة" },
  "Strategic partner": { de: "Strategischer Partner", ru: "Стратегический партнер", ka: "სტრატეგიული პარტნიორი", tr: "Stratejik ortak", ar: "شريك استراتيجي" },
  More: { de: "Mehr", ru: "Ещё", ka: "მეტი", tr: "Daha fazla", ar: "المزيد" },
  "AIXCO Philosophy": {
    de: "AIXCO Philosophie",
    ru: "Философия AIXCO",
    ka: "AIXCO-ს ფილოსოფია",
    tr: "AIXCO Felsefesi",
    ar: "فلسفة AIXCO",
  },
  "Read AIXCO Philosophy": {
    de: "AIXCO Philosophie lesen",
    ru: "Читать философию AIXCO",
    ka: "წაიკითხეთ AIXCO-ს ფილოსოფია",
    tr: "AIXCO Felsefesini Oku",
    ar: "اقرأ فلسفة AIXCO",
  },
  "Our philosophy": {
    de: "Unsere Philosophie",
    ru: "Наша философия",
    ka: "ჩვენი ფილოსოფია",
    tr: "Felsefemiz",
    ar: "فلسفتنا",
  },
  "Swiss discipline, real asset ownership, long-term value creation.": {
    de: "Schweizer Disziplin, Eigentum an realen Vermögenswerten, langfristige Wertschöpfung.",
    ru: "Швейцарская дисциплина, владение реальными активами, долгосрочное создание стоимости.",
    ka: "შვეიცარიული დისციპლინა, რეალური აქტივების ფლობა, გრძელვადიანი ღირებულების შექმნა.",
    tr: "İsviçre disiplini, reel varlık sahipliği, uzun vadeli değer yaratımı.",
    ar: "انضباط سويسري، ملكية أصول حقيقية، وخلق قيمة طويلة الأجل.",
  },
  "Read how AIXCO's Swiss real estate heritage shapes its risk management, practical execution, and long-term property services.": {
    de: "Lesen Sie, wie AIXCOs Schweizer Immobilienerbe Risikomanagement, praktische Umsetzung und langfristige Immobiliendienstleistungen pragt.",
    ru: "Read how AIXCO's Swiss real estate heritage shapes its risk management, practical execution, and long-term property services.",
    ka: "Read how AIXCO's Swiss real estate heritage shapes its risk management, practical execution, and long-term property services.",
    tr: "AIXCO'nun Isvicre gayrimenkul mirasinin risk yonetimini, pratik uygulamayi ve uzun vadeli gayrimenkul hizmetlerini nasil sekillendirdigini okuyun.",
    ar: "Read how AIXCO's Swiss real estate heritage shapes its risk management, practical execution, and long-term property services.",
  },
  Email: { de: "E-Mail", ru: "Эл. почта", ka: "ელფოსტა", tr: "E-posta", ar: "البريد الإلكتروني" },
  Address: { de: "Adresse", ru: "Адрес", ka: "მისამართი", tr: "Adres", ar: "العنوان" },
  "AIXCO - Real Estate Platform": {
    de: "AIXCO - Immobilienplattform",
    ru: "AIXCO - real estate platform",
    ka: "AIXCO - real estate platform",
    tr: "AIXCO - Gayrimenkul Platformu",
    ar: "AIXCO - real estate platform",
  },
  "Real Estate": {
    de: "Immobilien",
    ru: "Недвижимость",
    ka: "უძრავი ქონება",
    tr: "Gayrimenkul",
    ar: "العقارات",
  },
  Batumi: { de: "Batumi", ru: "Батуми", ka: "ბათუმი", tr: "Batum", ar: "باتومي" },
  Dubai: { de: "Dubai", ru: "Дубай", ka: "დუბაი", tr: "Dubai", ar: "دبي" },
  "View Asset Details": {
    de: "Asset-Details ansehen",
    ru: "Посмотреть детали актива",
    ka: "აქტივის დეტალების ნახვა",
    tr: "Varlık detaylarını görüntüle",
    ar: "عرض تفاصيل الأصل",
  },
  "Batumi gallery": { de: "Batumi-Galerie", ru: "Галерея Батуми", ka: "ბათუმის გალერეა", tr: "Batum galerisi", ar: "معرض باتومي" },
  "Batumi residential architecture and public realm": {
    de: "Batumi residential architecture and public realm",
    ru: "Batumi residential architecture and public realm",
    ka: "Batumi residential architecture and public realm",
    tr: "Batumi residential architecture and public realm",
    ar: "Batumi residential architecture and public realm",
  },
  "Batumi city real estate district at sunset": {
    de: "Batumi city real estate district at sunset",
    ru: "Batumi city real estate district at sunset",
    ka: "Batumi city real estate district at sunset",
    tr: "Batumi city real estate district at sunset",
    ar: "Batumi city real estate district at sunset",
  },
  "Batumi skyline at night": {
    de: "Batumi skyline at night",
    ru: "Batumi skyline at night",
    ka: "Batumi skyline at night",
    tr: "Batumi skyline at night",
    ar: "Batumi skyline at night",
  },
  "Batumi project image composition": {
    de: "Batumi project image composition",
    ru: "Batumi project image composition",
    ka: "Batumi project image composition",
    tr: "Batumi project image composition",
    ar: "Batumi project image composition",
  },
  "Video gallery": { de: "Videogalerie", ru: "Видеогалерея", ka: "ვიდეო გალერეა", tr: "Video galerisi", ar: "معرض الفيديو" },
  "FAQs - Frequently Asked Questions": {
    de: "FAQ - Häufig gestellte Fragen",
    ru: "FAQ - часто задаваемые вопросы",
    ka: "ხშირად დასმული კითხვები",
    tr: "SSS - Sıkça Sorulan Sorular",
    ar: "الأسئلة الشائعة",
  },
  "Scroll to top": { de: "Nach oben scrollen", ru: "Прокрутить наверх", ka: "ზევით დაბრუნება", tr: "Yukarı kaydır", ar: "التمرير إلى الأعلى" },
  "Play video": { de: "Video abspielen", ru: "Воспроизвести видео", ka: "ვიდეოს გაშვება", tr: "Videoyu oynat", ar: "تشغيل الفيديو" },
  "Close video": { de: "Video schließen", ru: "Закрыть видео", ka: "ვიდეოს დახურვა", tr: "Videoyu kapat", ar: "إغلاق الفيديو" },
  "Expanded video": { de: "Erweitertes Video", ru: "Развернутое видео", ka: "გაფართოებული ვიდეო", tr: "Genişletilmiş video", ar: "فيديو موسع" },
  "expanded player": { de: "erweiterter Player", ru: "развернутый проигрыватель", ka: "გაფართოებული დამკვრელი", tr: "genişletilmiş oynatıcı", ar: "مشغل موسع" },
  "Expand image": { de: "Bild vergrößern", ru: "Развернуть изображение", ka: "გაფართოება", tr: "Görseli büyüt", ar: "تكبير الصورة" },
  "Close image": { de: "Bild schließen", ru: "Закрыть изображение", ka: "ფოტოს დახურვა", tr: "Görseli kapat", ar: "إغلاق الصورة" },
  "Expanded image": { de: "Vergrößertes Bild", ru: "Развернутое изображение", ka: "გაფართოებული გამოსახულება", tr: "Büyütülmüş görsel", ar: "صورة مكبرة" },
  Close: { de: "Schließen", ru: "Закрыть", ka: "დახურვა", tr: "Kapat", ar: "إغلاق" },
  images: { de: "Bilder", ru: "изображения", ka: "სურათები", tr: "görseller", ar: "صور" },
  "Sorry, something went wrong.": {
    de: "Entschuldigung, etwas ist schiefgelaufen.",
    ru: "Извините, что-то пошло не так.",
    ka: "უკაცრავად, რაღაც შეცდომაა.",
    tr: "Üzgünüz, bir şeyler ters gitti.",
    ar: "عذرًا، حدث خطأ ما.",
  },
  "Your request was received.": {
    de: "Ihre Anfrage ist eingegangen.",
    ru: "Ваш запрос получен.",
    ka: "თქვენი მოთხოვნა მიღებულია.",
    tr: "Talebiniz alındı.",
    ar: "تم استلام طلبك.",
  },
  "We saved your details for the AIXCO team. You can also open an email draft if you want to send extra context.": {
    de: "Wir haben Ihre Angaben für das AIXCO-Team gespeichert. Sie können auch einen E-Mail-Entwurf öffnen, wenn Sie zusätzlichen Kontext senden möchten.",
    ru: "Мы сохранили ваши данные для команды AIXCO. Вы также можете открыть черновик письма, если хотите отправить дополнительный контекст.",
    ka: "ჩვენ შევინახეთ თქვენი მონაცემები AIXCO-ს გუნდისთვის. ასევე, შეგიძლიათ გახსნათ ელფოსტის შაბლონი, თუ დამატებითი კონტექსტის გაგზავნა გსურთ.",
    tr: "Bilgilerinizi AIXCO ekibi için kaydettik. Ek bağlam göndermek isterseniz bir e-posta taslağı da açabilirsiniz.",
    ar: "حفظنا بياناتك لفريق AIXCO. يمكنك أيضًا فتح مسودة بريد إلكتروني إذا أردت إرسال سياق إضافي.",
  },
  "Please enter your name": { de: "Bitte geben Sie Ihren Namen ein", ru: "Введите ваше имя", ka: "გთხოვთ, შეიყვანოთ თქვენი სახელი", tr: "Lütfen adınızı girin", ar: "يرجى إدخال اسمك" },
  "Please enter a valid email": { de: "Bitte geben Sie eine gültige E-Mail-Adresse ein", ru: "Введите действительный email", ka: "გთხოვთ, შეიყვანოთ მოქმედი ელფოსტა", tr: "Lütfen geçerli bir e-posta girin", ar: "يرجى إدخال بريد إلكتروني صالح" },
  "Please share a few details": { de: "Bitte teilen Sie einige Details mit", ru: "Пожалуйста, укажите несколько деталей", ka: "გთხოვთ, გაგვიზიაროთ რამდენიმე დეტალი", tr: "Lütfen birkaç ayrıntı paylaşın", ar: "يرجى مشاركة بعض التفاصيل" },
  "AIXCO Live Chat": { de: "AIXCO Live-Chat", ru: "Онлайн-чат AIXCO", ka: "AIXCO-ს პირდაპირი ჩატი", tr: "AIXCO Canlı Sohbet", ar: "دردشة AIXCO المباشرة" },
  "Tell us what you need and send the transcript to AIXCO.": {
    de: "Sagen Sie uns, was Sie benötigen, und senden Sie das Protokoll an AIXCO.",
    ru: "Расскажите, что вам нужно, и отправьте стенограмму в AIXCO.",
    ka: "გვითხარით, რა გჭირდებათ და ტრანსკრიპტი გაუგზავნეთ AIXCO-ს.",
    tr: "Neye ihtiyacınız olduğunu yazın ve dökümü AIXCO'ya gönderin.",
    ar: "أخبرنا بما تحتاجه وأرسل نسخة المحادثة إلى AIXCO.",
  },
  "Close live chat": { de: "Live-Chat schließen", ru: "Закрыть онлайн-чат", ka: "ჩატის დახურვა", tr: "Canlı sohbeti kapat", ar: "إغلاق الدردشة المباشرة" },
  "Open live chat": { de: "Live-Chat öffnen", ru: "Открыть онлайн-чат", ka: "ჩატის გახსნა", tr: "Canlı sohbeti aç", ar: "فتح الدردشة المباشرة" },
  "Minimize live chat": { de: "Live-Chat minimieren", ru: "Свернуть онлайн-чат", ka: "ჩატის ჩაკეცვა", tr: "Canlı sohbeti küçült", ar: "تصغير الدردشة المباشرة" },
  Message: { de: "Nachricht", ru: "Сообщение", ka: "შეტყობინება", tr: "Mesaj", ar: "الرسالة" },
  "Type your message...": { de: "Ihre Nachricht eingeben...", ru: "Введите сообщение...", ka: "ჩაწერეთ თქვენი შეტყობინება...", tr: "Mesajınızı yazın...", ar: "اكتب رسالتك..." },
  Send: { de: "Senden", ru: "Отправить", ka: "გაგზავნა", tr: "Gönder", ar: "إرسال" },
  "Email transcript": { de: "Protokoll per E-Mail senden", ru: "Отправить стенограмму по email", ka: "ტრანსკრიპტის ელფოსტით გაგზავნა", tr: "Dökümü e-postayla gönder", ar: "إرسال نسخة المحادثة بالبريد" },
  "Saving chat...": { de: "Chat wird gespeichert...", ru: "Чат сохраняется...", ka: "ჩატი ინახება...", tr: "Sohbet kaydediliyor...", ar: "جارٍ حفظ الدردشة..." },
  "Chat saved to AIXCO": { de: "Chat bei AIXCO gespeichert", ru: "Чат сохранен в AIXCO", ka: "ჩატი შენახულია AIXCO-ში", tr: "Sohbet AIXCO'ya kaydedildi", ar: "تم حفظ الدردشة لدى AIXCO" },
  "Chat could not be saved": { de: "Chat konnte nicht gespeichert werden", ru: "Не удалось сохранить чат", ka: "ჩატის შენახვა ვერ მოხერხდა", tr: "Sohbet kaydedilemedi", ar: "تعذر حفظ الدردشة" },
  "Live chat": { de: "Live-Chat", ru: "Онлайн-чат", ka: "პირდაპირი ჩატი", tr: "Canlı sohbet", ar: "الدردشة المباشرة" },
  Clear: { de: "Löschen", ru: "Очистить", ka: "გასუფთავება", tr: "Temizle", ar: "مسح" },
  "Property administration": { de: "Immobilienverwaltung", ru: "Property administration", ka: "Property administration", tr: "Mulk yonetimi", ar: "Property administration" },
  "Batumi apartments": { de: "Apartments in Batumi", ru: "Апартаменты в Батуми", ka: "ბათუმის ბინები", tr: "Batum daireleri", ar: "شقق باتومي" },
  "Broker partnership": { de: "Maklerpartnerschaft", ru: "Партнёрство для брокеров", ka: "ბროკერული პარტნიორობა", tr: "Broker ortaklığı", ar: "شراكة الوسطاء" },
  "Developer partnership": { de: "Entwicklerpartnerschaft", ru: "Партнёрство для девелоперов", ka: "დეველოპერის პარტნიორობა", tr: "Geliştirici ortaklığı", ar: "شراكة المطورين" },
  "Welcome to the AIXCO assistant. Ask about Batumi apartments, Dubai legacy projects, property administration, broker partnership, developer partnership, partners, team, or FAQs.": {
    de: "Willkommen beim AIXCO-Assistenten. Fragen Sie nach Batumi-Apartments, Dubai-Legacy-Projekten, Immobilienverwaltung, Maklerpartnerschaft, Entwicklerpartnerschaft, Partnern, Team oder FAQs.",
    ru: "Welcome to the AIXCO assistant. Ask about Batumi apartments, Dubai legacy projects, property administration, broker partnership, developer partnership, partners, team, or FAQs.",
    ka: "Welcome to the AIXCO assistant. Ask about Batumi apartments, Dubai legacy projects, property administration, broker partnership, developer partnership, partners, team, or FAQs.",
    tr: "AIXCO asistanina hos geldiniz. Batum daireleri, Dubai miras projeleri, mulk yonetimi, broker ortakligi, gelistirici ortakligi, ortaklar, ekip veya SSS hakkinda sorabilirsiniz.",
    ar: "Welcome to the AIXCO assistant. Ask about Batumi apartments, Dubai legacy projects, property administration, broker partnership, developer partnership, partners, team, or FAQs.",
  },
  "Thanks. The AIXCO team can help with property administration, handover, documents, rental coordination, and owner reporting.": {
    de: "Danke. Das AIXCO-Team kann bei Immobilienverwaltung, Ubergabe, Dokumenten, Mietkoordination und Eigentumerberichten helfen.",
    ru: "Thanks. The AIXCO team can help with property administration, handover, documents, rental coordination, and owner reporting.",
    ka: "Thanks. The AIXCO team can help with property administration, handover, documents, rental coordination, and owner reporting.",
    tr: "Tesekkurler. AIXCO ekibi mulk yonetimi, teslim, belgeler, kira koordinasyonu ve mal sahibi raporlamasinda yardimci olabilir.",
    ar: "Thanks. The AIXCO team can help with property administration, handover, documents, rental coordination, and owner reporting.",
  },
  "Thanks. The AIXCO team can help with Batumi apartments, available routes, tours, pricing, ownership, rental income, and next steps.": {
    de: "Danke. Das AIXCO-Team kann bei Apartments in Batumi, verfügbaren Wegen, Besichtigungen, Preisen, Eigentum, Mieteinnahmen und nächsten Schritten helfen.",
    ru: "Спасибо. Команда AIXCO поможет с апартаментами в Батуми, доступными вариантами, турами, ценами, собственностью, арендным доходом и следующими шагами.",
    ka: "მადლობა. AIXCO-ს გუნდი დაგეხმარებათ ბათუმის ბინებთან, ხელმისაწვდომ მარშრუტებთან, ტურებთან, ფასებთან, საკუთრების უფლებასთან, საიჯარო შემოსავალთან და შემდგომ ნაბიჯებთან დაკავშირებით.",
    tr: "Teşekkürler. AIXCO ekibi Batum daireleri, uygun yollar, turlar, fiyatlandırma, mülkiyet, kira geliri ve sonraki adımlar konusunda yardımcı olabilir.",
    ar: "شكرًا. يمكن لفريق AIXCO مساعدتك في شقق باتومي والمسارات المتاحة والجولات والأسعار والملكية ودخل الإيجار والخطوات التالية.",
  },
  "Thanks. The AIXCO team can help brokers with portal access, customer tours, listings, and distribution support.": {
    de: "Danke. Das AIXCO-Team kann Maklern mit Portalzugang, Kundentouren, Listings und Vertriebsunterstützung helfen.",
    ru: "Спасибо. Команда AIXCO поможет брокерам с доступом к порталу, турами для клиентов, листингами и поддержкой дистрибуции.",
    ka: "მადლობა. AIXCO-ს გუნდი დაეხმარება ბროკერებს პორტალზე წვდომის, კლიენტებთან ტურების, განცხადებებისა და დისტრიბუციის მხარდაჭერის საკითხებში.",
    tr: "Teşekkürler. AIXCO ekibi brokerlara portal erişimi, müşteri turları, ilanlar ve dağıtım desteği konusunda yardımcı olabilir.",
    ar: "شكرًا. يمكن لفريق AIXCO مساعدة الوسطاء في الوصول إلى البوابة وجولات العملاء والقوائم ودعم التوزيع.",
  },
  "Thanks. The AIXCO team can help developer partners with project visibility, distribution, and onboarding.": {
    de: "Danke. Das AIXCO-Team kann Entwicklerpartnern bei Projektsichtbarkeit, Vertrieb und Onboarding helfen.",
    ru: "Спасибо. Команда AIXCO поможет девелоперским партнёрам с видимостью проектов, дистрибуцией и онбордингом.",
    ka: "მადლობა. AIXCO-ს გუნდი დაეხმარება დეველოპერ პარტნიორებს პროექტის ცნობადობის გაზრდაში, დისტრიბუციასა და პროექტში ჩართვაში.",
    tr: "Teşekkürler. AIXCO ekibi geliştirici ortaklara proje görünürlüğü, dağıtım ve onboarding konularında yardımcı olabilir.",
    ar: "شكرًا. يمكن لفريق AIXCO مساعدة شركاء التطوير في إبراز المشروع والتوزيع والإعداد.",
  },
  "Thanks. The AIXCO team has your note. Add any budget, role, timeline, or preferred project details and email the transcript when you are ready.": {
    de: "Danke. Das AIXCO-Team hat Ihre Nachricht. Ergänzen Sie Budget, Rolle, Zeitplan oder bevorzugte Projektdetails und senden Sie das Protokoll per E-Mail, wenn Sie bereit sind.",
    ru: "Спасибо. Команда AIXCO получила вашу заметку. Добавьте бюджет, роль, сроки или предпочтительный проект и отправьте стенограмму по email, когда будете готовы.",
    ka: "მადლობა. AIXCO-ს გუნდმა თქვენი შენიშვნა გაითვალისწინა. დაამატეთ ბიუჯეტი, როლი, ვადები ან პროექტის სასურველი დეტალები და, როდესაც მზად იქნებით, გამოგვიგზავნეთ ტრანსკრიპტი ელფოსტით.",
    tr: "Teşekkürler. AIXCO ekibi notunuzu aldı. Bütçe, rol, zamanlama veya tercih edilen proje detaylarını ekleyin ve hazır olduğunuzda dökümü e-postayla gönderin.",
    ar: "شكرًا. تلقى فريق AIXCO ملاحظتك. أضف الميزانية أو الدور أو الجدول الزمني أو تفاصيل المشروع المفضل وأرسل نسخة المحادثة بالبريد عندما تكون جاهزًا.",
  },
  "Latest news": { de: "Neueste Nachrichten", ru: "Последние новости", ka: "უახლესი ამბები", tr: "Son haberler", ar: "آخر الأخبار" },
  Latest: { de: "Neueste", ru: "Последнее", ka: "უახლესი", tr: "Son", ar: "الأحدث" },
  "Agency feed": { de: "Agentur-Feed", ru: "Лента агентства", ka: "სააგენტოს არხი", tr: "Ajans akışı", ar: "موجز الوكالة" },
  Agency: { de: "Agentur", ru: "Агентство", ka: "სააგენტო", tr: "Ajans", ar: "وكالة" },
  Market: { de: "Markt", ru: "Рынок", ka: "ბაზარი", tr: "Pazar", ar: "السوق" },
  "Batumi development update: strong buyer demand": {
    "de": "Batumi development update: strong buyer demand",
    "ru": "Batumi development update: strong buyer demand",
    "ka": "Batumi development update: strong buyer demand",
    "tr": "Batumi development update: strong buyer demand",
    "ar": "Batumi development update: strong buyer demand"
  },
  "AIXCO completes Eden House phase in Dubai legacy portfolio": {
    de: "AIXCO schließt Eden-House-Phase im Dubai-Legacy-Portfolio ab",
    ru: "AIXCO завершает фазу Eden House в наследии Дубая",
    ka: "AIXCO ასრულებს Eden House ფაზას დუბაის მემკვიდრეობით პორტფოლიოში",
    tr: "AIXCO, Dubai miras portföyünde Eden House aşamasını tamamlıyor",
    ar: "AIXCO تكمل مرحلة Eden House في محفظة دبي الإرثية",
  },
  "Black Sea corridor demand strengthens across coastal assets": {
    de: "Nachfrage im Schwarzmeer-Korridor stärkt Küstenassets",
    ru: "Спрос в Черноморском коридоре усиливается по прибрежным активам",
    ka: "შავ ზღვაზე კორიდორის მოთხოვნა სანაპირო უძრავ ქონებაზე ძლიერდება",
    tr: "Karadeniz koridoru talebi kıyı varlıklarında güçleniyor",
    ar: "يتعزز الطلب في ممر البحر الأسود عبر الأصول الساحلية",
  },
  "Agency note: short-term rental demand remains a key Batumi driver": {
    de: "Agenturnotiz: Kurzzeitmietrenditen bleiben ein wichtiger Treiber in Batumi",
    ru: "Заметка агентства: доходность краткосрочной аренды остается ключевым драйвером Батуми",
    ka: "სააგენტოს შენიშვნა: ბათუმის მთავარ მამოძრავებელ ფაქტორად კვლავ რჩება მოკლევადიანი გაქირავების შემოსავლები.",
    tr: "Ajans notu: kısa vadeli kira getirileri Batum için temel itici güç olmaya devam ediyor",
    ar: "ملاحظة الوكالة: عوائد الإيجار قصير الأجل تبقى محركًا رئيسيًا في باتومي",
  },
  "Strategic partner update published for infrastructure partners": {
    de: "Update strategischer Partner fur Infrastrukturpartner veroffentlicht",
    ru: "Strategic partner update published for infrastructure partners",
    ka: "Strategic partner update published for infrastructure partners",
    tr: "Altyapi ortaklari icin stratejik ortak guncellemesi yayimlandi",
    ar: "Strategic partner update published for infrastructure partners",
  },
  "New guide: buying Batumi apartments from EUR 50,000": {
    de: "Neuer Leitfaden: Batumi-Wohnungen ab 50.000 EUR kaufen",
    ru: "Новое руководство: покупка квартир в Батуми от 50 000 EUR",
    ka: "ახალი გზამკვლევი: ბათუმის ბინების ყიდვა 50,000 ევროდან",
    tr: "Yeni rehber: 50.000 EUR'dan Batum daireleri satın alma",
    ar: "دليل جديد: شراء شقق باتومي من 50,000 يورو",
  },
  "All Rights Reserved.": { de: "Alle Rechte vorbehalten.", ru: "Все права защищены.", ka: "ყველა უფლება დაცულია.", tr: "Tüm hakları saklıdır.", ar: "جميع الحقوق محفوظة." },
  "ISO 27001-2022 Certified Systems.": {
    de: "ISO 27001-2022 zertifizierte Systeme.",
    ru: "Системы, сертифицированные по ISO 27001-2022.",
    ka: "ISO 27001-2022 სერტიფიცირებული სისტემები.",
    tr: "ISO 27001-2022 sertifikalı sistemler.",
    ar: "أنظمة معتمدة وفق ISO 27001-2022.",
  },
  "Developments Underway": {
    de: "Laufende Entwicklungen",
    ru: "Проекты в разработке",
    ka: "მიმდინარე პროექტები",
    tr: "Devam Eden Projeler",
    ar: "مشاريع قيد التطوير",
  },
  "Participate where growth, stability, and long term value creation meet. AIXCO gives private partners a simple and transparent way to join selected real estate projects.": {
    de: "Beteiligen Sie sich dort, wo Wachstum, Stabilität und langfristige Wertschöpfung zusammenkommen. AIXCO bietet privaten Partnern einen einfachen und transparenten Zugang zu ausgewählten Immobilienprojekten.",
    ru: "Участвуйте там, где сочетаются рост, стабильность и долгосрочное создание стоимости. AIXCO предлагает частным партнерам простой и прозрачный способ присоединиться к выбранным проектам недвижимости.",
    ka: "შემოუერთდით იქ, სადაც ზრდა, სტაბილურობა და გრძელვადიანი ღირებულების შექმნა ერთმანეთს კვეთს. AIXCO კერძო პარტნიორებს არჩეულ უძრავი ქონების პროექტებში ჩართვის მარტივ და გამჭვირვალე გზას სთავაზობს.",
    tr: "Büyüme, istikrar ve uzun vadeli değer yaratımının buluştuğu yerde yer alın. AIXCO, özel ortaklara seçilmiş gayrimenkul projelerine katılmaları için basit ve şeffaf bir yol sunar.",
    ar: "شارك حيث يلتقي النمو والاستقرار وخلق القيمة على المدى الطويل. تمنح AIXCO الشركاء من القطاع الخاص طريقة بسيطة وشفافة للانضمام إلى مشاريع عقارية مختارة.",
  },
  "Customer Real Estate Buyer": {
    de: "Kunde Immobilienkäufer",
    ru: "Клиент-покупатель недвижимости",
    ka: "უძრავი ქონების მყიდველი",
    tr: "Gayrimenkul Alıcısı Müşteri",
    ar: "عميل مشتري عقار",
  },
  "Your email draft is ready.": {
    de: "Ihr E-Mail-Entwurf ist bereit.",
    ru: "Ваш черновик письма готов.",
    ka: "თქვენი ელფოსტის შაბლონი მზადაა.",
    tr: "E-posta taslağınız hazır.",
    ar: "مسودة بريدك الإلكتروني جاهزة.",
  },
  "We validated your details. Your browser has not sent anything yet; use the email draft to send your message directly to AIXCO.": {
    de: "Ihre Angaben wurden geprüft. Ihr Browser hat noch nichts gesendet; nutzen Sie den E-Mail-Entwurf, um Ihre Nachricht direkt an AIXCO zu senden.",
    ru: "Мы проверили ваши данные. Браузер еще ничего не отправил; используйте черновик письма, чтобы отправить сообщение напрямую в AIXCO.",
    ka: "ჩვენ დავადასტურეთ თქვენი მონაცემები. თქვენმა ბრაუზერმა ჯერ არაფერი გაუგზავნა; გამოიყენეთ ელფოსტის შაბლონი, რომ თქვენი შეტყობინება პირდაპირ AIXCO-ს გაუგზავნოთ.",
    tr: "Bilgileriniz doğrulandı. Tarayıcınız henüz hiçbir şey göndermedi; mesajınızı doğrudan AIXCO'ya göndermek için e-posta taslağını kullanın.",
    ar: "تم التحقق من بياناتك. لم يرسل متصفحك أي شيء بعد؛ استخدم مسودة البريد الإلكتروني لإرسال رسالتك مباشرة إلى AIXCO.",
  },
  "Open email draft": {
    de: "E-Mail-Entwurf öffnen",
    ru: "Открыть черновик письма",
    ka: "ელფოსტის ნახვის რედაქტირება",
    tr: "E-posta taslağını aç",
    ar: "افتح مسودة البريد",
  },
  "Edit details": {
    de: "Angaben bearbeiten",
    ru: "Изменить данные",
    ka: "დეტალების რედაქტირება",
    tr: "Bilgileri düzenle",
    ar: "تعديل البيانات",
  },
};

const clientBriefPassthroughCopy = [
  "Story navigation",
  "Quality Real Estate - Buy / Broker / Manage",
  "Explore",
  "Batumi skyline and landmark towers",
  "Since 2009, AIXCO has bought, sold, and brokered real estate across Europe and the Gulf - today focused on Batumi, with a legacy track record in Switzerland and Dubai.",
  "AIXCO transaction backdrop",
  "Dubai - Legacy portfolio",
  "Legacy market - we are not opening new Dubai real estate offers. Below is a snapshot of delivered and in-progress real estate volume.",
  "Batumi - Current opportunity",
  "Opportunity-driven focus in Georgia - buy apartments with transparent euro pricing, strong rental potential, and full foreign ownership.",
  "Otium Batumi project reference",
  "AIXCO contact and office reference",
  "Choose the journey that fits your role. The process is structured, transparent, and digitally managed.",
  "Team",
  "AIXCO leadership",
  "Dubai Healthcare City legacy reference",
  "Group companies and strategic partners",
  "Batumi coastal real estate reference",
  "Frequently asked questions",
  "AIXCO contact office reference",
  "Start with AIXCO",
  "Register for the correct customer, broker, property owner, or developer journey and the AIXCO team will follow up.",
  "Grungasse 16, 1050 Wien, Austria",
  "Philosophy",
  "Legacy market — we are not opening new Dubai real estate offers. Below is a snapshot of delivered and in-progress real estate volume.",
  "Choose the journey that fits your role. Whether you are buying property, brokering clients, administering a unit, or bringing projects to market, the process is structured, transparent, and digitally managed.",
  "Customers/Partners Work",
  "Buy a Batumi apartment as the primary route, broker qualified buyers, or work with AIXCO on property administration after purchase.",
  "AIXCO - Real Estate Platform",
  "Since 2009, AIXCO has bought, sold, and brokered real estate across Europe and the Gulf—today focused on Batumi, with a legacy track record in Switzerland and Dubai.",
  "Customers sign up, review selected Batumi apartments, book a private tour, and move through reservation and purchase with the AIXCO team.",
  "Broker Real Estate with AIXCO",
  "Brokers and partners can introduce qualified buyers, coordinate tours, and manage deal flow through a structured real estate sales process.",
  "Administer Your Property",
  "Property owners can work with AIXCO on documentation, buyer handover, reporting, rental coordination, and ongoing administration after purchase.",
  "Property Owner Administration",
  "For owners who want AIXCO support after purchase with handover, rental coordination, documents, and reporting.",
  "A guided service path for owners who want their property administered professionally after purchase.",
  "Register ownership details",
  "Create your account and share the apartment or property details.",
  "Confirm service scope",
  "Agree what AIXCO should handle: handover, documents, rental coordination, or reporting.",
  "Upload documents",
  "Provide purchase, ownership, and project materials in the secure portal.",
  "Coordinate handover",
  "Track completion, snagging, key handover, and operational next steps.",
  "Manage updates",
  "Receive status updates, documents, and service coordination in one place.",
  "Review reporting",
  "Monitor property-related updates and owner communication online.",
  "For developers seeking project visibility, buyer access, tour coordination, and a stronger real estate sales channel.",
  "A project sales pathway for developers seeking market access and buyer reach.",
  "Review commercial viability, positioning, pricing, and buyer suitability.",
  "Prepare the listing",
  "Align project information, media, floor plans, pricing, and route to market.",
  "Ongoing coordination",
  "Provide updates, milestones, tour support, and buyer communications post-launch.",
  "Diversified services and operating business.",
  "ISP Group is described in the AIXCO source as a diversified services firm specializing in the acquisition, management, and transformation of businesses across multiple industries.",
  "Diversified services and operating platform.",
  "Clean-tech and lithium asset company.",
  "Clean Elements is described in the AIXCO source as a clean-products and lithium asset company positioned around environmental transition themes.",
  "Advisory collective for growth businesses.",
  "Groupe GTI is presented as an advisory collective focused on accelerating growth-oriented enterprises, especially across technology, infrastructure, and industrial sectors.",
  "Bluerock is described as a financial consultancy delivering data-driven strategies in planning and advisory, with a client-focused approach aimed at sustainable growth.",
  "Is rental income guaranteed?",
  "No. Approx. 8% net rental yields are scenario-based and depend on occupancy, market conditions, property management, project delivery, and external factors.",
  "Yes. Reporting, documents, project updates, and transparent workflow are available through the portal and ISO-certified system.",
  "Yes. Selected Batumi apartments allow 100% foreign ownership, and no residency permit is required to buy.",
  "Providing real estate purchase, brokerage, and administration services",
  "Batumi daytime aerial skyline and Black Sea",
  "Batumi sunset city and coastline view",
  "Batumi night skyline from the Black Sea",
  "Batumi coastal nature and Black Sea view",
  "Batumi tower and daytime city view",
  "Batumi project image gallery",
  "Select Batumi gallery image",
  "Show image",
  "Batumi skyline at sunset",
  "Client objectives",
  "Every client starts with a different objective",
  "Some are looking to build long-term wealth through real estate ownership. Others want recurring income, international diversification, or simply a way to participate in a market they believe has strong future potential.",
  "Rather than offering a one-size-fits-all solution, we begin by understanding what matters most to you.",
  "Selected Batumi property opportunity",
  "Client approach",
  "in business, supporting clients across property ownership, brokerage, and administration.",
  "Ownership or flexible participation",
  "For many clients, this leads to direct ownership of carefully selected properties in emerging, profitable, sustainable markets.",
  "For others, AIXCO offers an alternative participation program for clients who would like exposure to the market without the commitments that come with owning and managing property themselves.",
  "Our commitment remains the same: transparent guidance, long-term support, and access to opportunities that align with your personal goals.",
  "Dubai waterfront residential real estate development",
  "Batumi skyline above coastal fog",
  "AIXCO contact architecture reference",
  "AIXCO real estate architecture",
  "Origins",
  "Risk",
  "Platform",
  "Principles",
  "Swiss discipline in practice",
  "Long-term platform",
  "Disciplined ownership of real assets, shaped by Swiss real estate heritage.",
  "AIXCO Global was built on disciplined real estate ownership, practical execution, and long-term property services.",
  "First acquisition",
  "GDV",
  "Transactions",
  "Value transacted",
  "Gross development value",
  "Transactions completed",
  "Real estate transacted across markets",
  "Disciplined ownership",
  "Property administration",
  "Responsible risk assessment",
  "Long-term value creation",
  "The Philosophy section continues with the original ownership and risk-management detail, now split into readable in-page slides.",
  "AIXCO's philosophy closes with the platform, people, and principles behind the real estate service model.",
  "AIXCO's philosophy starts with ownership: durable assets, conservative risk assessment, and recurring income generation.",
  "The platform connects selected opportunities, international teams, and service discipline around long-term property value.",
  "A real estate foundation built through ownership",
  "Since its first acquisition in 2009, the company has steadily expanded within the Swiss residential real estate market, developing a portfolio defined by resilience, stability, and recurring income generation.",
  "Over the decades, AIXCO has evolved into a diversified international group combining Swiss real estate heritage with modern asset-backed acquisitions.",
  "A distinctly Swiss philosophy of managing risk",
  "At the core of AIXCO lies a distinctly Swiss philosophy of managing risk. AIXCO approaches real estate decisions with discipline, conservatism, and a long-term perspective, focusing on durable properties and practical operating fundamentals.",
  "Through carefully selected real estate purchases, sales, brokerage mandates, and property administration, AIXCO focuses on durable assets, practical risk assessment, and sustainable long-term growth.",
  "International expansion through selected opportunities",
  "Built upon decades of market experience and responsible ownership, AIXCO continues to expand internationally through selected opportunities in Dubai and Georgia.",
  "Today, AIXCO manages projects representing more than $400 million in gross development value, supported by an international team of over 90 professionals and a global network of clients, brokers, developers, and partners.",
  "AIXCO has completed more than 2,000 real estate transactions and transacted over $4.2 billion in property value across international markets.",
  "Integrity, stability, discipline, and responsible risk assessment",
  "Integrity, stability, discipline, and responsible risk assessment remain central to every aspect of our real estate practice.",
  "As AIXCO continues to grow internationally, its vision remains unchanged: to build a resilient real estate services platform - buy, broker, and manage property - rooted in Swiss heritage, disciplined execution, and enduring long-term value.",
] as const;

function sameCopyInAllLanguages(text: string): Partial<Record<Lang, string>> {
  return {
    de: text,
    ru: text,
    ka: text,
    tr: text,
    ar: text,
  };
}

const clientBriefPassthroughTranslations: Partial<Record<string, Partial<Record<Lang, string>>>> =
  Object.fromEntries(clientBriefPassthroughCopy.map((text) => [text, sameCopyInAllLanguages(text)]));

type TranslationSource = Partial<Record<string, Partial<Record<Lang, string>>>>;
type AttributeTranslationCatalog = {
  placeholder: TranslationSource;
  content: TranslationSource;
  title: TranslationSource;
};
type LoadedTranslationCatalogs = {
  sources: TranslationSource[];
  attributes: AttributeTranslationCatalog;
};

const germanQualityTranslations: TranslationSource = {
  Home: { de: "Startseite" },
  "About AIXCO": { de: "Über AIXCO" },
  About: { de: "Über AIXCO" },
  "Our journey": { de: "Unsere Reise" },
  Materials: { de: "Materialien" },
  "How to work with AIXCO": { de: "Mit AIXCO arbeiten" },
  "How AIXCO Works": { de: "So arbeitet AIXCO" },
  "Our Team": { de: "Unser Team" },
  Partners: { de: "Partner" },
  Contact: { de: "Kontakt" },
  "AIXCO Philosophy": { de: "AIXCO Philosophie" },
  More: { de: "Mehr" },
  "Explore Batumi real estate": { de: "Batumi-Immobilien erkunden" },
  "Contact AIXCO": { de: "AIXCO kontaktieren" },
  "Buy, broker, and manage selected real estate routes with AIXCO.": {
    de: "Ausgewählte Immobilienwege mit AIXCO kaufen, vermitteln und verwalten.",
  },
  "Open menu": { de: "Menü öffnen" },
  "Close menu": { de: "Menü schließen" },
  Philosophy: { de: "Philosophie" },
  Origins: { de: "Ursprung" },
  Principles: { de: "Grundsätze" },
  Objectives: { de: "Ziele" },
  Legacy: { de: "Historie" },
  "How to work": { de: "Zusammenarbeit" },
  Journeys: { de: "Ablauf" },
  "Quality Real Estate - Buy / Broker / Manage": { de: "Qualitätsimmobilien - Kaufen / Vermitteln / Verwalten" },
  Explore: { de: "Entdecken" },
  "Batumi apartments": { de: "Wohnungen in Batumi" },
  "Buy a flat, review selected apartments, and explore an opportunity-driven emerging market with the AIXCO team.": {
    de: "Kaufen Sie eine Wohnung, prüfen Sie ausgewählte Apartments und entdecken Sie mit dem AIXCO-Team einen chancenreichen aufstrebenden Markt.",
  },
  "Enter uprising real estate with AIXCO": { de: "Mit AIXCO in Uprising-Immobilien einsteigen" },
  "Since 2009, AIXCO has bought, sold, and brokered real estate across Europe and the Gulf - today focused on Batumi, with a legacy track record in Switzerland and Dubai.": {
    de: "Seit 2009 kauft, verkauft und vermittelt AIXCO Immobilien in Europa und der Golfregion - heute mit Fokus auf Batumi und einer nachgewiesenen Historie in der Schweiz und Dubai.",
  },
  "Since 2009, AIXCO has bought, sold, and brokered real estate across Europe and the Gulf—today focused on Batumi, with a legacy track record in Switzerland and Dubai.": {
    de: "Seit 2009 kauft, verkauft und vermittelt AIXCO Immobilien in Europa und der Golfregion - heute mit Fokus auf Batumi und einer nachgewiesenen Historie in der Schweiz und Dubai.",
  },
  "Disciplined ownership of real assets, shaped by Swiss real estate heritage.": {
    de: "Diszipliniertes Eigentum an Sachwerten, geprägt durch Schweizer Immobilienerfahrung.",
  },
  "AIXCO Global was built on disciplined real estate ownership, practical execution, and long-term property services.": {
    de: "AIXCO Global basiert auf diszipliniertem Immobilieneigentum, praktischer Umsetzung und langfristigen Immobiliendienstleistungen.",
  },
  "First acquisition": { de: "Erster Erwerb" },
  "Gross development value": { de: "Brutto-Entwicklungswert" },
  "Transactions completed": { de: "Abgeschlossene Transaktionen" },
  "Real estate transacted across markets": { de: "Immobilienwert über Märkte hinweg" },
  "Disciplined ownership": { de: "Diszipliniertes Eigentum" },
  "Property administration": { de: "Immobilienverwaltung" },
  "Responsible risk assessment": { de: "Verantwortungsvolle Risikoprüfung" },
  "Long-term value creation": { de: "Langfristige Wertschaffung" },
  ownership: { de: "Eigentum" },
  Risk: { de: "Risiko" },
  Platform: { de: "Plattform" },
  "Swiss discipline in practice": { de: "Schweizer Disziplin in der Praxis" },
  "Long-term platform": { de: "Langfristige Plattform" },
  "A real estate foundation built through ownership": { de: "Ein Immobilienfundament, aufgebaut durch Eigentum" },
  "AIXCO's philosophy starts with ownership: durable assets, conservative risk assessment, and recurring income generation.": {
    de: "Die Philosophie von AIXCO beginnt mit Eigentum: langlebige Sachwerte, konservative Risikoprüfung und wiederkehrende Erträge.",
  },
  "Since its first acquisition in 2009, the company has steadily expanded within the Swiss residential real estate market, developing a portfolio defined by resilience, stability, and recurring income generation.": {
    de: "Seit dem ersten Erwerb im Jahr 2009 hat sich das Unternehmen im Schweizer Wohnimmobilienmarkt stetig erweitert und ein Portfolio aufgebaut, das von Widerstandsfähigkeit, Stabilität und wiederkehrenden Erträgen geprägt ist.",
  },
  "Over the decades, AIXCO has evolved into a diversified international group combining Swiss real estate heritage with modern asset-backed acquisitions.": {
    de: "Im Laufe der Jahrzehnte hat sich AIXCO zu einer diversifizierten internationalen Gruppe entwickelt, die Schweizer Immobilienerfahrung mit modernen sachwertbasierten Akquisitionen verbindet.",
  },
  "A distinctly Swiss philosophy of managing risk": { de: "Eine klar Schweizer Philosophie im Risikomanagement" },
  "At the core of AIXCO lies a distinctly Swiss philosophy of managing risk. AIXCO approaches real estate decisions with discipline, conservatism, and a long-term perspective, focusing on durable properties and practical operating fundamentals.": {
    de: "Im Kern von AIXCO steht eine klar Schweizer Philosophie im Umgang mit Risiko. AIXCO trifft Immobilienentscheidungen mit Disziplin, konservativem Blick und langfristiger Perspektive - mit Fokus auf langlebige Immobilien und solide operative Grundlagen.",
  },
  "Through carefully selected real estate purchases, sales, brokerage mandates, and property administration, AIXCO focuses on durable assets, practical risk assessment, and sustainable long-term growth.": {
    de: "Durch sorgfältig ausgewählte Immobilienkäufe, Verkäufe, Vermittlungsmandate und Immobilienverwaltung konzentriert sich AIXCO auf langlebige Sachwerte, praktische Risikoprüfung und nachhaltiges langfristiges Wachstum.",
  },
  "International expansion through selected opportunities": { de: "Internationale Expansion durch ausgewählte Chancen" },
  "The platform connects selected opportunities, international teams, and service discipline around long-term property value.": {
    de: "Die Plattform verbindet ausgewählte Chancen, internationale Teams und Servicedisziplin rund um langfristigen Immobilienwert.",
  },
  "Built upon decades of market experience and responsible ownership, AIXCO continues to expand internationally through selected opportunities in Dubai and Georgia.": {
    de: "Aufbauend auf jahrzehntelanger Markterfahrung und verantwortungsvollem Eigentum expandiert AIXCO international weiter - über ausgewählte Chancen in Dubai und Georgien.",
  },
  "Today, AIXCO manages projects representing more than $400 million in gross development value, supported by an international team of over 90 professionals and a global network of clients, brokers, developers, and partners.": {
    de: "Heute betreut AIXCO Projekte mit einem Brutto-Entwicklungswert von mehr als 400 Millionen US-Dollar, getragen von einem internationalen Team aus über 90 Fachleuten und einem globalen Netzwerk aus Kunden, Maklern, Entwicklern und Partnern.",
  },
  "AIXCO has completed more than 2,000 real estate transactions and transacted over $4.2 billion in property value across international markets.": {
    de: "AIXCO hat mehr als 2.000 Immobilientransaktionen abgeschlossen und über internationale Märkte hinweg Immobilienwerte von mehr als 4,2 Milliarden US-Dollar umgesetzt.",
  },
  "Integrity, stability, discipline, and responsible risk assessment": {
    de: "Integrität, Stabilität, Disziplin und verantwortungsvolle Risikoprüfung",
  },
  "Integrity, stability, discipline, and responsible risk assessment remain central to every aspect of our real estate practice.": {
    de: "Integrität, Stabilität, Disziplin und verantwortungsvolle Risikoprüfung bleiben zentral für jeden Bereich unserer Immobilienpraxis.",
  },
  "As AIXCO continues to grow internationally, its vision remains unchanged: to build a resilient real estate services platform - buy, broker, and manage property - rooted in Swiss heritage, disciplined execution, and enduring long-term value.": {
    de: "Während AIXCO international weiter wächst, bleibt die Vision unverändert: eine widerstandsfähige Immobiliendienstleistungsplattform aufzubauen - Kaufen, Vermitteln und Verwalten - verwurzelt in Schweizer Herkunft, disziplinierter Umsetzung und dauerhaftem langfristigem Wert.",
  },
  "Client objectives": { de: "Kundenziele" },
  "Every client starts with a different objective": { de: "Jeder Kunde startet mit einem anderen Ziel" },
  client: { de: "Kunde" },
  "Some are looking to build long-term wealth through real estate ownership. Others want recurring income, international diversification, or simply a way to participate in a market they believe has strong future potential.": {
    de: "Einige möchten durch Immobilieneigentum langfristig Vermögen aufbauen. Andere suchen wiederkehrende Erträge, internationale Diversifikation oder einfach einen Weg, an einem Markt teilzunehmen, dem sie starkes Zukunftspotenzial zutrauen.",
  },
  "Rather than offering a one-size-fits-all solution, we begin by understanding what matters most to you.": {
    de: "Statt eine Einheitslösung anzubieten, beginnen wir damit zu verstehen, was für Sie am wichtigsten ist.",
  },
  "Client approach": { de: "Kundenansatz" },
  "in business, supporting clients across property ownership, brokerage, and administration.": {
    de: "am Markt, mit Unterstützung für Kunden bei Immobilieneigentum, Vermittlung und Verwaltung.",
  },
  "Ownership or flexible participation": { de: "Eigentum oder flexible Beteiligung" },
  Ownership: { de: "Eigentum" },
  "For many clients, this leads to direct ownership of carefully selected properties in emerging, profitable, sustainable markets.": {
    de: "Für viele Kunden führt dies zu direktem Eigentum an sorgfältig ausgewählten Immobilien in aufstrebenden, profitablen und nachhaltigen Märkten.",
  },
  "For others, AIXCO offers an alternative participation program for clients who would like exposure to the market without the commitments that come with owning and managing property themselves.": {
    de: "Für andere bietet AIXCO ein alternatives Beteiligungsprogramm für Kunden, die Marktzugang wünschen, ohne die Verpflichtungen aus eigenem Immobilienbesitz und eigener Verwaltung zu übernehmen.",
  },
  "Our commitment remains the same: transparent guidance, long-term support, and access to opportunities that align with your personal goals.": {
    de: "Unser Anspruch bleibt derselbe: transparente Beratung, langfristige Unterstuetzung und Zugang zu Chancen, die zu Ihren persoenlichen Zielen passen.",
  },
  "Dubai - Legacy portfolio": { de: "Dubai - Historisches Portfolio" },
  "Legacy market - we are not opening new Dubai real estate offers. Below is a snapshot of delivered and in-progress real estate volume.": {
    de: "Historischer Markt - wir eröffnen keine neuen Immobilienangebote in Dubai. Unten sehen Sie eine Momentaufnahme des realisierten und laufenden Immobilienvolumens.",
  },
  "Legacy market â€” we are not opening new Dubai real estate offers. Below is a snapshot of delivered and in-progress real estate volume.": {
    de: "Historischer Markt - wir eröffnen keine neuen Immobilienangebote in Dubai. Unten sehen Sie eine Momentaufnahme des realisierten und laufenden Immobilienvolumens.",
  },
  "Batumi - Current opportunity": { de: "Batumi - Aktuelle Chance" },
  "Opportunity-driven focus in Georgia - buy apartments with transparent euro pricing, strong rental potential, and full foreign ownership.": {
    de: "Chancenorientierter Fokus in Georgien - Wohnungen mit transparenter Euro-Preisgestaltung, starkem Mietpotenzial und vollständigem ausländischem Eigentum kaufen.",
  },
  "Selected projects and apartments available exclusively through AIXCO": {
    de: "Ausgewählte Projekte und Apartments exklusiv über AIXCO verfügbar",
  },
  "100% foreign ownership": { de: "100% ausländisches Eigentum" },
  "No residency permit required": { de: "Keine Aufenthaltsgenehmigung erforderlich" },
  "Entry from €50,000": { de: "Einstieg ab 50.000 EUR" },
  "Entry from â‚¬50,000": { de: "Einstieg ab 50.000 EUR" },
  "Bank financing available from 60% of the property value": {
    de: "Bankfinanzierung ab 60% des Immobilienwerts verfügbar",
  },
  "Approx. 8% net rental yields": { de: "Ca. 8% Nettomietrendite" },
  "Full commission payable from only a 10% down payment": { de: "Volle Provision bereits ab 10% Anzahlung zahlbar" },
  "0% capital gains tax after 2 years of ownership": { de: "0% Kapitalertragsteuer nach 2 Jahren Eigentum" },
  "1% tax on rental income": { de: "1% Steuer auf Mieteinnahmen" },
  "Full transparency through an ISO-certified system": { de: "Volle Transparenz durch ein ISO-zertifiziertes System" },
  "Prime apartments from our own stock at the best available prices": {
    de: "Prime-Apartments aus eigenem Bestand zu den besten verfügbaren Preisen",
  },
  "Selected Batumi projects and apartments through AIXCO, with entry from €50,000, 100% foreign ownership, bank financing options, and transparent ISO-certified process.": {
    de: "Ausgewählte Batumi-Projekte und Apartments über AIXCO, mit Einstieg ab 50.000 EUR, 100% ausländischem Eigentum, Bankfinanzierungsoptionen und transparentem ISO-zertifiziertem Prozess.",
  },
  "Selected Batumi property opportunity": { de: "Ausgewählte Immobilienchance in Batumi" },
  "Client materials": { de: "Kundenmaterialien" },
  "Materials & downloads": { de: "Materialien & Downloads" },
  "Download brochures, catalog sheets, and property reference files for the real estate routes shown on this page.": {
    de: "Laden Sie Broschüren, Katalogblätter und Immobilienreferenzen für die auf dieser Seite gezeigten Immobilienwege herunter.",
  },
  "Available files": { de: "Verfuegbare Dateien" },
  Audience: { de: "Zielgruppe" },
  Download: { de: "Herunterladen" },
  "Batumi project brochure": { de: "Batumi-Projektbroschüre" },
  "Otium brochure": { de: "Otium-Broschüre" },
  "Full Otium project PDF for clients comparing Batumi apartment options.": {
    de: "Vollständige Otium-Projekt-PDF für Kunden, die Apartmentoptionen in Batumi vergleichen.",
  },
  "Catalog sheet": { de: "Katalogblatt" },
  "Otium catalog sheet": { de: "Otium-Katalogblatt" },
  "High-resolution Otium catalog image for quick sharing and offline review.": {
    de: "Hochaufgelöstes Otium-Katalogbild für schnelle Weitergabe und Offline-Prüfung.",
  },
  "Dubai legacy reference": { de: "Dubai-Historiereferenz" },
  "Eden House legacy image": { de: "Eden-House-Historienbild" },
  "Downloadable legacy visual reference for Eden House in Dubai.": {
    de: "Herunterladbare visuelle Historiereferenz für Eden House in Dubai.",
  },
  "Dubai Healthcare City image": { de: "Dubai-Healthcare-City-Bild" },
  "Downloadable legacy visual reference for Dubai Healthcare City.": {
    de: "Herunterladbare visuelle Historiereferenz für Dubai Healthcare City.",
  },
  "Clients and brokers": { de: "Kunden und Makler" },
  "Clients and sales partners": { de: "Kunden und Vertriebspartner" },
  "Clients and partners": { de: "Kunden und Partner" },
  "Customers/Partners Work": { de: "Zusammenarbeit mit Kunden und Partnern" },
  "How Customers/Partners Work": { de: "So arbeiten Kunden und Partner mit AIXCO" },
  "Buy a Batumi apartment as the primary route, broker qualified buyers, or work with AIXCO on property administration after purchase.": {
    de: "Kaufen Sie als Hauptweg ein Apartment in Batumi, vermitteln Sie qualifizierte Käufer oder arbeiten Sie nach dem Kauf mit AIXCO bei der Immobilienverwaltung zusammen.",
  },
  "Buy an Apartment in Batumi": { de: "Apartment in Batumi kaufen" },
  "Customers sign up, review selected Batumi apartments, book a private tour, and move through reservation and purchase with the AIXCO team.": {
    de: "Kunden registrieren sich, prüfen ausgewählte Apartments in Batumi, buchen eine private Besichtigung und durchlaufen Reservierung und Kauf mit dem AIXCO-Team.",
  },
  "Broker Real Estate with AIXCO": { de: "Immobilien mit AIXCO vermitteln" },
  "Brokers and partners can introduce qualified buyers, coordinate tours, and manage deal flow through a structured real estate sales process.": {
    de: "Makler und Partner können qualifizierte Käufer vorstellen, Besichtigungen koordinieren und den Dealflow über einen strukturierten Immobilienverkaufsprozess steuern.",
  },
  "Administer Your Property": { de: "Ihre Immobilie verwalten" },
  "Property owners can work with AIXCO on documentation, buyer handover, reporting, rental coordination, and ongoing administration after purchase.": {
    de: "Immobilieneigentümer können nach dem Kauf mit AIXCO bei Dokumentation, Käuferübergabe, Reporting, Mietkoordination und laufender Verwaltung zusammenarbeiten.",
  },
  "Choose the journey that fits your role. The process is structured, transparent, and digitally managed.": {
    de: "Wählen Sie den Ablauf, der zu Ihrer Rolle passt. Der Prozess ist strukturiert, transparent und digital gesteuert.",
  },
  "Choose the journey that fits your role. Whether you are buying property, brokering clients, administering a unit, or bringing projects to market, the process is structured, transparent, and digitally managed.": {
    de: "Wählen Sie den Ablauf, der zu Ihrer Rolle passt. Ob Sie Immobilien kaufen, Kunden vermitteln, eine Einheit verwalten oder Projekte in den Markt bringen - der Prozess ist strukturiert, transparent und digital gesteuert.",
  },
  "Journey 01": { de: "Ablauf 01" },
  "Journey 02": { de: "Ablauf 02" },
  "Journey 03": { de: "Ablauf 03" },
  "Journey 04": { de: "Ablauf 04" },
  "Customer Real Estate Buyer": { de: "Immobilienkäufer" },
  "For clients buying apartments or reserving units in Batumi through a guided digital process.": {
    de: "Für Kunden, die Apartments in Batumi über einen geführten digitalen Prozess kaufen oder reservieren.",
  },
  "Property Owner Administration": { de: "Verwaltung für Immobilieneigentümer" },
  "For owners who want AIXCO support after purchase with handover, rental coordination, documents, and reporting.": {
    de: "Für Eigentümer, die nach dem Kauf AIXCO-Unterstützung bei Übergabe, Mietkoordination, Dokumenten und Reporting wünschen.",
  },
  Broker: { de: "Makler" },
  "For intermediaries and distribution partners introducing clients and managing deal flow.": {
    de: "Für Vermittler und Vertriebspartner, die Kunden vorstellen und Dealflow steuern.",
  },
  Developer: { de: "Entwickler" },
  "For developers seeking project visibility, buyer access, tour coordination, and a stronger real estate sales channel.": {
    de: "Für Entwickler, die Projektpräsenz, Käuferzugang, Besichtigungskoordination und einen stärkeren Immobilienvertriebskanal suchen.",
  },
  "AIXCO leadership": { de: "AIXCO-Führung" },
  leadership: { de: "Führung" },
  Founder: { de: "Gründer" },
  Partner: { de: "Partner" },
  "Leadership, vision, and overall group direction.": { de: "Führung, Vision und strategische Gesamtsteuerung der Gruppe." },
  "Capital markets, banking relationships, and financial structuring.": {
    de: "Kapitalmärkte, Bankbeziehungen und Finanzstrukturierung.",
  },
  "Product positioning, channel development, and distribution strategy.": {
    de: "Produktpositionierung, Kanalentwicklung und Vertriebsstrategie.",
  },
  "Group companies and strategic partners": { de: "Konzerngesellschaften und strategische Partner" },
  "Group companies": { de: "Konzerngesellschaften" },
  "Strategic partners": { de: "Strategische Partner" },
  "Frequently asked questions": { de: "Häufig gestellte Fragen" },
  Customer: { de: "Kunde" },
  "Buying property, reserving apartments, or working with AIXCO on real estate services.": {
    de: "Immobilien kaufen, Apartments reservieren oder mit AIXCO an Immobiliendienstleistungen arbeiten.",
  },
  "What is the minimum amount to reserve or buy?": { de: "Welcher Mindestbetrag gilt für Reservierung oder Kauf?" },
  "Entry starts from €50,000 for selected Batumi projects and apartments available exclusively through AIXCO. Full commission can be payable from only a 10% down payment, with final terms depending on project and agreement.": {
    de: "Der Einstieg beginnt ab 50.000 EUR für ausgewählte Batumi-Projekte und Apartments, die exklusiv über AIXCO verfügbar sind. Die volle Provision kann bereits ab 10% Anzahlung zahlbar sein; die endgültigen Bedingungen hängen von Projekt und Vereinbarung ab.",
  },
  "Can I buy property directly?": { de: "Kann ich direkt eine Immobilie kaufen?" },
  "Yes. Customers may pursue direct apartment purchase, brokerage support, or property administration.": {
    de: "Ja. Kunden können einen direkten Apartmentkauf, Maklerunterstützung oder Immobilienverwaltung nutzen.",
  },
  "Is rental income guaranteed?": { de: "Sind Mieteinnahmen garantiert?" },
  "No. Approx. 8% net rental yields are scenario-based and depend on occupancy, market conditions, property management, project delivery, and external factors.": {
    de: "Nein. Ca. 8% Nettomietrendite ist szenariobasiert und hängt von Auslastung, Marktbedingungen, Immobilienverwaltung, Projektfertigstellung und externen Faktoren ab.",
  },
  "Will I receive reporting?": { de: "Erhalte ich Reporting?" },
  "Yes. Reporting, documents, project updates, and transparent workflow are available through the portal and ISO-certified system.": {
    de: "Ja. Reporting, Dokumente, Projektupdates und transparente Workflows sind über das Portal und das ISO-zertifizierte System verfügbar.",
  },
  "Can foreigners buy property in Batumi?": { de: "Können Ausländer Immobilien in Batumi kaufen?" },
  "Yes. Selected Batumi apartments allow 100% foreign ownership, and no residency permit is required to buy.": {
    de: "Ja. Ausgewählte Apartments in Batumi erlauben 100% ausländisches Eigentum, und für den Kauf ist keine Aufenthaltsgenehmigung erforderlich.",
  },
  "Can I ask about AIXCO company financing?": { de: "Kann ich Informationen zur AIXCO-Unternehmensfinanzierung anfragen?" },
  "Yes. AIXCO.Global is presented first as a real estate platform for buying, brokering, and administering property. Separate company-financing information may be available on request from the AIXCO team; it is not a primary website journey and no bond terms are promoted on this page.": {
    de: "Ja. AIXCO.Global wird zuerst als Immobilienplattform für Kauf, Vermittlung und Verwaltung dargestellt. Separate Informationen zur Unternehmensfinanzierung können auf Anfrage beim AIXCO-Team verfügbar sein; dies ist kein primärer Website-Ablauf und auf dieser Seite werden keine Bond-Konditionen beworben.",
  },
  "Start with AIXCO": { de: "Mit AIXCO starten" },
  "Register for the correct customer, broker, property owner, or developer journey and the AIXCO team will follow up.": {
    de: "Registrieren Sie sich für den passenden Kunden-, Makler-, Eigentümer- oder Entwicklerablauf. Das AIXCO-Team meldet sich anschließend.",
  },
  "Batumi property profile": { de: "Batumi-Immobilienprofil" },
  "Property profile": { de: "Immobilienprofil" },
  "Back to Batumi": { de: "Zurück zu Batumi" },
  Back: { de: "Zurück" },
  "View catalog": { de: "Katalog ansehen" },
  "Download brochure": { de: "Broschüre herunterladen" },
  "Premium residential complex": { de: "Premium-Wohnkomplex" },
  Floors: { de: "Etagen" },
  "per building": { de: "pro Gebäude" },
  Apartments: { de: "Apartments" },
  "total units": { de: "Einheiten gesamt" },
  Completion: { de: "Fertigstellung" },
  target: { de: "Zieltermin" },
  Scale: { de: "Größe" },
  Location: { de: "Lage" },
  "Rental case": { de: "Mietannahme" },
  "Exclusive access": { de: "Exklusiver Zugang" },
  Financing: { de: "Finanzierung" },
  "Tax & transparency": { de: "Steuern & Transparenz" },
  "Reverance by Otium is a premium residential complex at 59 Adlia Street, planned with 17 floors per building, 408 apartments, and completion targeted for June 2028.": {
    de: "Reverance by Otium ist ein Premium-Wohnkomplex in der 59 Adlia Street, geplant mit 17 Etagen pro Gebäude, 408 Apartments und einer angestrebten Fertigstellung im Juni 2028.",
  },
  "25,000 sqm of comfort and community infrastructure across a 45,000 sqm planned site.": {
    de: "25.000 m2 Komfort- und Gemeinschaftsinfrastruktur auf einem geplanten Areal von 45.000 m2.",
  },
  "59 Adlia Street, with New Boulevard 5 minutes away, shopping and airport access 7 minutes away, and Batumi Medical Center 8 minutes away.": {
    de: "59 Adlia Street, mit New Boulevard in 5 Minuten Entfernung, Einkaufsmöglichkeiten und Flughafenanschluss in 7 Minuten sowie dem Batumi Medical Center in 8 Minuten Entfernung.",
  },
  "$600/month average long-term rent, $80/night average short-stay rent, and 90% potential occupancy shown in the project deck.": {
    de: "600 USD durchschnittliche Langzeitmiete pro Monat, 80 USD durchschnittliche Kurzzeitmiete pro Nacht und 90% potenzielle Auslastung laut Projektunterlagen.",
  },
  "Selected projects and apartments available exclusively through AIXCO Entry from €50,000 Prime apartments from our own stock at the best available prices": {
    de: "Ausgewählte Projekte und Apartments exklusiv über AIXCO verfügbar. Einstieg ab 50.000 EUR. Prime-Apartments aus eigenem Bestand zu den besten verfügbaren Preisen.",
  },
  "Selected projects and apartments available exclusively through AIXCO Entry from â‚¬50,000 Prime apartments from our own stock at the best available prices": {
    de: "Ausgewählte Projekte und Apartments exklusiv über AIXCO verfügbar. Einstieg ab 50.000 EUR. Prime-Apartments aus eigenem Bestand zu den besten verfügbaren Preisen.",
  },
  "100% foreign ownership No residency permit required": {
    de: "100% ausländisches Eigentum. Keine Aufenthaltsgenehmigung erforderlich.",
  },
  "Bank financing available from 60% of the property value Full commission payable from only a 10% down payment": {
    de: "Bankfinanzierung ab 60% des Immobilienwerts verfügbar. Volle Provision bereits ab 10% Anzahlung zahlbar.",
  },
  "0% capital gains tax after 2 years of ownership 1% tax on rental income Full transparency through an ISO-certified system": {
    de: "0% Kapitalertragsteuer nach 2 Jahren Eigentum. 1% Steuer auf Mieteinnahmen. Volle Transparenz durch ein ISO-zertifiziertes System.",
  },
  "This page is not available.": { de: "Diese Seite ist nicht verfügbar." },
  "The page may have moved, or the address may be incorrect. Return to AIXCO.Global to continue exploring selected real estate services.": {
    de: "Die Seite wurde möglicherweise verschoben oder die Adresse ist falsch. Kehren Sie zu AIXCO.Global zurück, um ausgewählte Immobiliendienstleistungen weiter zu erkunden.",
  },
  "Return to Home": { de: "Zur Startseite" },
  "Register ownership details": { de: "Eigentumsdetails registrieren" },
  "Confirm service scope": { de: "Serviceumfang bestaetigen" },
  "Upload documents": { de: "Dokumente hochladen" },
  "Coordinate handover": { de: "Übergabe koordinieren" },
  "Manage updates": { de: "Updates verwalten" },
  "Review reporting": { de: "Reporting prüfen" },
  "Prepare the listing": { de: "Listing vorbereiten" },
  "Ongoing coordination": { de: "Laufende Koordination" },
};

const baseCatalogSources: TranslationSource[] = [
  germanQualityTranslations,
  supplementalTranslations,
  clientBriefPassthroughTranslations,
];

const emptyAttributeTranslations: AttributeTranslationCatalog = {
  placeholder: {},
  content: {},
  title: {},
};

let translationCatalogPromise: Promise<LoadedTranslationCatalogs> | null = null;

function loadTranslationCatalogs() {
  translationCatalogPromise ??= Promise.all([
    import("./translations"),
    import("./asset-translations"),
    import("./site-content-translations"),
  ]).then(([translations, assets, siteContent]) => {
    const attributes = translations.attributeTranslations as AttributeTranslationCatalog;

    return {
      attributes,
      sources: [
        germanQualityTranslations,
        supplementalTranslations,
        translations.textTranslations,
        assets.assetTranslations,
        siteContent.siteContentTranslations,
        clientBriefPassthroughTranslations,
        attributes.placeholder,
        attributes.content,
        attributes.title,
      ],
    };
  });

  return translationCatalogPromise;
}

function lookupTranslation(text: string, lang: Lang, sources: TranslationSource[]) {
  for (const source of sources) {
    const value = source[text]?.[lang];
    if (value) return value;
  }

  const normalizedText = text.trim().toLocaleLowerCase("en-US");
  for (const source of sources) {
    const key = getNormalizedTranslationKeys(source).get(normalizedText);
    const value = key ? source[key]?.[lang] : undefined;
    if (value) return value;
  }

  return undefined;
}

const normalizedTranslationKeys = new WeakMap<TranslationSource, Map<string, string>>();

function getNormalizedTranslationKeys(source: TranslationSource) {
  const cached = normalizedTranslationKeys.get(source);
  if (cached) return cached;

  const normalizedKeys = new Map<string, string>();
  for (const key of Object.keys(source)) {
    normalizedKeys.set(key.trim().toLocaleLowerCase("en-US"), key);
  }

  normalizedTranslationKeys.set(source, normalizedKeys);
  return normalizedKeys;
}

export async function hasTextTranslation(text: string, lang: Lang) {
  const catalogs = await loadTranslationCatalogs();
  return Boolean(lookupTranslation(text, lang, catalogs.sources));
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
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG);
  const [translationCatalogs, setTranslationCatalogs] = useState<LoadedTranslationCatalogs | null>(null);
  const hasLoadedStoredLangRef = useRef(false);
  const dir = lang === "ar" ? "rtl" : "ltr";
  const activeCatalogSources = translationCatalogs?.sources ?? baseCatalogSources;
  const activeAttributeTranslations = translationCatalogs?.attributes ?? emptyAttributeTranslations;
  const translationLookupCache = useMemo(() => ({
    lang,
    sources: activeCatalogSources,
    entries: new Map<string, string>(),
  }), [activeCatalogSources, lang]);

  useEffect(() => {
    try {
      const storedLang = localStorage.getItem("aixco-lang");
      if (isLang(storedLang)) {
        setLang(storedLang);
      }
    } catch {
      // Language persistence is optional when browser storage is unavailable.
    } finally {
      hasLoadedStoredLangRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (lang === "en" || translationCatalogs) return;

    let isMounted = true;
    loadTranslationCatalogs().then((catalogs) => {
      if (isMounted) setTranslationCatalogs(catalogs);
    });

    return () => {
      isMounted = false;
    };
  }, [lang, translationCatalogs]);

  useEffect(() => {
    const localizedTitle = lang === "en" ? pageTitle : activeAttributeTranslations.title[pageTitle]?.[lang] ?? pageTitle;

    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    const syncTitle = () => {
      if (document.title !== localizedTitle) {
        document.title = localizedTitle;
      }
    };

    syncTitle();
    const titleSync = window.setTimeout(syncTitle, 0);
    const titleObserver = new MutationObserver(syncTitle);
    titleObserver.observe(document.head, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute(
        "content",
        lang === "en" ? pageDescription : activeAttributeTranslations.content[pageDescription]?.[lang] ?? pageDescription,
      );
    }
    if (hasLoadedStoredLangRef.current) {
      try {
        localStorage.setItem("aixco-lang", lang);
      } catch {
        // Language persistence is optional when browser storage is unavailable.
      }
    }

    return () => {
      window.clearTimeout(titleSync);
      titleObserver.disconnect();
    };
  }, [lang, dir, activeAttributeTranslations]);

  const value = useMemo<Ctx>(() => ({
    lang,
    setLang,
    dir,
    tx: (text) => {
      if (lang === "en") return text;
      const cached = translationLookupCache.entries.get(text);
      if (cached !== undefined) return cached;

      const translated = lookupTranslation(text, lang, activeCatalogSources) ?? text;
      translationLookupCache.entries.set(text, translated);
      return translated;
    },
    t: (key) => {
      const text = keyedText[key] ?? key;
      if (lang === "en") return text;

      const cacheKey = `key:${key}\n${text}`;
      const cached = translationLookupCache.entries.get(cacheKey);
      if (cached !== undefined) return cached;

      const translated = lookupTranslation(text, lang, activeCatalogSources) ?? text;
      translationLookupCache.entries.set(cacheKey, translated);
      return translated;
    },
  }), [lang, dir, activeCatalogSources, translationLookupCache]);

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function useOptionalI18n() {
  return useContext(I18nCtx);
}
