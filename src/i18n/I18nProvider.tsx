import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { attributeTranslations, languageOptions, textTranslations, type Lang } from "./translations";
import { assetTranslations } from "./asset-translations";
import { siteContentTranslations } from "./site-content-translations";

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
  "cta.start": "Starting from €10,000",
  "cta.contact": "Contact AIXCO",
};
const pageTitle = "AIXCO.Global | Quality Real Estate — Buy · Broker · Manage";
const pageDescription =
  "Buy selected Batumi apartments with transparent euro pricing from €50,000 (typical entry from €10,000). Real estate buy-sell-brokerage across Switzerland, Dubai legacy, and Georgia.";
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
  "Guru brochure": { de: "Guru brochure", ru: "Guru brochure", ka: "Guru brochure", tr: "Guru brochure", ar: "Guru brochure" },
  "Full Guru project PDF for clients reviewing the Batumi apartment route.": {
    de: "Full Guru project PDF for clients reviewing the Batumi apartment route.",
    ru: "Full Guru project PDF for clients reviewing the Batumi apartment route.",
    ka: "Full Guru project PDF for clients reviewing the Batumi apartment route.",
    tr: "Full Guru project PDF for clients reviewing the Batumi apartment route.",
    ar: "Full Guru project PDF for clients reviewing the Batumi apartment route.",
  },
  "Otium brochure": { de: "Otium brochure", ru: "Otium brochure", ka: "Otium brochure", tr: "Otium brochure", ar: "Otium brochure" },
  "Full Otium project PDF for clients comparing Batumi apartment options.": {
    de: "Full Otium project PDF for clients comparing Batumi apartment options.",
    ru: "Full Otium project PDF for clients comparing Batumi apartment options.",
    ka: "Full Otium project PDF for clients comparing Batumi apartment options.",
    tr: "Full Otium project PDF for clients comparing Batumi apartment options.",
    ar: "Full Otium project PDF for clients comparing Batumi apartment options.",
  },
  "Catalog sheet": { de: "Catalog sheet", ru: "Catalog sheet", ka: "Catalog sheet", tr: "Catalog sheet", ar: "Catalog sheet" },
  "Guru catalog sheet": { de: "Guru catalog sheet", ru: "Guru catalog sheet", ka: "Guru catalog sheet", tr: "Guru catalog sheet", ar: "Guru catalog sheet" },
  "High-resolution Guru catalog image for quick sharing and offline review.": {
    de: "High-resolution Guru catalog image for quick sharing and offline review.",
    ru: "High-resolution Guru catalog image for quick sharing and offline review.",
    ka: "High-resolution Guru catalog image for quick sharing and offline review.",
    tr: "High-resolution Guru catalog image for quick sharing and offline review.",
    ar: "High-resolution Guru catalog image for quick sharing and offline review.",
  },
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
  Login: { de: "Anmelden", ru: "Войти", ka: "შესვლა", tr: "Giriş", ar: "تسجيل الدخول" },
  Register: { de: "Registrieren", ru: "Регистрация", ka: "რეგისტრაცია", tr: "Kayıt Ol", ar: "التسجيل" },
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
  "No. Rental income, resale value, and timing depend on market conditions, occupancy, property management, and project delivery.",
  "Providing real estate purchase, brokerage, and administration services",
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

const catalogSources = [
  supplementalTranslations,
  clientBriefPassthroughTranslations,
  textTranslations,
  assetTranslations,
  siteContentTranslations,
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

export function hasTextTranslation(text: string, lang: Lang) {
  return Boolean(lookupTranslation(text, lang));
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
  const [hasLoadedStoredLang, setHasLoadedStoredLang] = useState(false);
  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    try {
      const storedLang = localStorage.getItem("aixco-lang");
      if (isLang(storedLang)) {
        setLang(storedLang);
      }
    } catch {
      // Language persistence is optional when browser storage is unavailable.
    } finally {
      setHasLoadedStoredLang(true);
    }
  }, []);

  useEffect(() => {
    const localizedTitle = lang === "en" ? pageTitle : attributeTranslations.title[pageTitle]?.[lang] ?? pageTitle;

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
        lang === "en" ? pageDescription : attributeTranslations.content[pageDescription]?.[lang] ?? pageDescription,
      );
    }
    if (hasLoadedStoredLang) {
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
  }, [lang, dir, hasLoadedStoredLang]);

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

export function useOptionalI18n() {
  return useContext(I18nCtx);
}
