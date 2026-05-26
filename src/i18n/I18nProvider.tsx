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
  Start: { de: "Starten Sie", ru: "Начните", ka: "დაიწყეთ", tr: "Başlatın", ar: "ابدأ" },
  Login: { de: "Anmelden", ru: "Войти", ka: "შესვლა", tr: "Giriş", ar: "تسجيل الدخول" },
  Register: { de: "Registrieren", ru: "Регистрация", ka: "რეგისტრაცია", tr: "Kayıt Ol", ar: "التسجيل" },
  How: { de: "Wie", ru: "Как", ka: "როგორ", tr: "Nasıl", ar: "كيف" },
  "starting from": { de: "ab", ru: "от", ka: "დაწყებული", tr: "başlayan", ar: "ابتداءً من" },
  "up to": { de: "bis zu", ru: "до", ka: "მდე", tr: "en fazla", ar: "حتى" },
  from: { de: "ab", ru: "от", ka: "-დან", tr: "itibaren", ar: "من" },
  "Rental yield": { de: "Mietrendite", ru: "Арендная доходность", ka: "გაქირავების შემოსავლიანობა", tr: "Kira getirisi", ar: "عائد الإيجار" },
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
  "Read how AIXCO's Swiss real estate heritage shapes its risk management, capital preservation, and income-focused asset ownership.": {
    de: "Lesen Sie, wie die Schweizer Immobilienherkunft von AIXCO Risikomanagement, Kapitalerhalt und einkommensorientiertes Asset-Eigentum prägt.",
    ru: "Узнайте, как швейцарское наследие AIXCO в недвижимости формирует управление рисками, сохранение капитала и ориентированное на доход владение активами.",
    ka: "გაიგეთ, როგორ აყალიბებს AIXCO-ს შვეიცარიული უძრავი ქონების მემკვიდრეობა რისკების მართვას, კაპიტალის შენარჩუნებას და შემოსავალზე ორიენტირებულ აქტივების ფლობას.",
    tr: "AIXCO'nun İsviçre gayrimenkul mirasının risk yönetimini, sermaye korumasını ve gelir odaklı varlık sahipliğini nasıl şekillendirdiğini okuyun.",
    ar: "اقرأ كيف يشكل إرث AIXCO السويسري في العقارات إدارة المخاطر وحفظ رأس المال وملكية الأصول المركزة على الدخل.",
  },
  Email: { de: "E-Mail", ru: "Эл. почта", ka: "ელფოსტა", tr: "E-posta", ar: "البريد الإلكتروني" },
  Address: { de: "Adresse", ru: "Адрес", ka: "მისამართი", tr: "Adres", ar: "العنوان" },
  "AIXCO - Product Powerhouse": {
    de: "AIXCO - Produkt-Powerhouse",
    ru: "AIXCO - продуктовая платформа",
    ka: "AIXCO - Product Powerhouse",
    tr: "AIXCO - Güçlü Ürün Platformu",
    ar: "AIXCO - منصة منتجات قوية",
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
  "AIXCO 6% Bond": { de: "AIXCO 6%-Anleihe", ru: "Облигация AIXCO 6%", ka: "AIXCO-ს 6%-იანი ობლიგაცია", tr: "AIXCO %6 Tahvil", ar: "سند AIXCO بعائد 6%" },
  "Batumi apartments": { de: "Apartments in Batumi", ru: "Апартаменты в Батуми", ka: "ბათუმის ბინები", tr: "Batum daireleri", ar: "شقق باتومي" },
  "Broker partnership": { de: "Maklerpartnerschaft", ru: "Партнёрство для брокеров", ka: "ბროკერული პარტნიორობა", tr: "Broker ortaklığı", ar: "شراكة الوسطاء" },
  "Developer partnership": { de: "Entwicklerpartnerschaft", ru: "Партнёрство для девелоперов", ka: "დეველოპერის პარტნიორობა", tr: "Geliştirici ortaklığı", ar: "شراكة المطورين" },
  "Welcome to AIXCO Live Chat. Tell us whether you are interested in the AIXCO 6% Bond, Batumi apartments, broker partnership, or developer partnership.": {
    de: "Willkommen im AIXCO Live-Chat. Sagen Sie uns, ob Sie sich für die AIXCO 6%-Anleihe, Apartments in Batumi, eine Maklerpartnerschaft oder eine Entwicklerpartnerschaft interessieren.",
    ru: "Добро пожаловать в онлайн-чат AIXCO. Напишите, что вас интересует: облигация AIXCO 6%, апартаменты в Батуми, партнёрство для брокеров или партнёрство для девелоперов.",
    ka: "კეთილი იყოს თქვენი მობრძანება AIXCO-ს პირდაპირ ჩატში. გთხოვთ, გვითხრათ, გაინტერესებთ AIXCO-ს 6%-იანი ობლიგაცია, ბათუმის ბინები, ბროკერთან პარტნიორობა თუ დეველოპერთან პარტნიორობა.",
    tr: "AIXCO Canlı Sohbet'e hoş geldiniz. AIXCO %6 Tahvil, Batum daireleri, broker ortaklığı veya geliştirici ortaklığı ile ilgilenip ilgilenmediğinizi söyleyin.",
    ar: "مرحبًا بك في دردشة AIXCO المباشرة. أخبرنا إن كنت مهتمًا بسند AIXCO بعائد 6% أو شقق باتومي أو شراكة الوسطاء أو شراكة المطورين.",
  },
  "Thanks. The AIXCO team can help with the bond route, onboarding, subscription steps, and the supporting documentation.": {
    de: "Danke. Das AIXCO-Team kann bei der Anleihe, dem Onboarding, den Zeichnungsschritten und den Unterlagen helfen.",
    ru: "Спасибо. Команда AIXCO поможет с облигацией, онбордингом, этапами подписки и сопроводительными документами.",
    ka: "მადლობა. AIXCO-ს გუნდი დაგეხმარებათ ობლიგაციების მიმართულებით, თანამშრომლად აყვანის, გამოწერის ეტაპებისა და დამხმარე დოკუმენტაციის საკითხებში.",
    tr: "Teşekkürler. AIXCO ekibi tahvil süreci, onboarding, abonelik adımları ve destekleyici belgeler konusunda yardımcı olabilir.",
    ar: "شكرًا. يمكن لفريق AIXCO مساعدتك في مسار السند، والإعداد، وخطوات الاكتتاب، والمستندات الداعمة.",
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
  "Batumi development update highlights new investor demand": {
    de: "Batumi-Entwicklungsupdate zeigt neue Investorennachfrage",
    ru: "Обновление по развитию Батуми показывает новый спрос инвесторов",
    ka: "ბათუმის განვითარების სიახლეები ინვესტორთა ახალ მოთხოვნაზე მიუთითებს",
    tr: "Batum geliştirme güncellemesi yeni yatırımcı talebini öne çıkarıyor",
    ar: "تحديث تطوير باتومي يبرز طلبًا جديدًا من المستثمرين",
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
  "Agency note: short-term rental yields remain a key Batumi driver": {
    de: "Agenturnotiz: Kurzzeitmietrenditen bleiben ein wichtiger Treiber in Batumi",
    ru: "Заметка агентства: доходность краткосрочной аренды остается ключевым драйвером Батуми",
    ka: "სააგენტოს შენიშვნა: ბათუმის მთავარ მამოძრავებელ ფაქტორად კვლავ რჩება მოკლევადიანი გაქირავების შემოსავლები.",
    tr: "Ajans notu: kısa vadeli kira getirileri Batum için temel itici güç olmaya devam ediyor",
    ar: "ملاحظة الوكالة: عوائد الإيجار قصير الأجل تبقى محركًا رئيسيًا في باتومي",
  },
  "Strategic partner update published for infrastructure investors": {
    de: "Update strategischer Partner für Infrastrukturinvestoren veröffentlicht",
    ru: "Опубликовано обновление стратегического партнера для инфраструктурных инвесторов",
    ka: "ინფრასტრუქტურის ინვესტორებისთვის სტრატეგიული პარტნიორის განახლებული ინფორმაცია გამოქვეყნდა",
    tr: "Altyapı yatırımcıları için stratejik ortak güncellemesi yayımlandı",
    ar: "نُشر تحديث الشريك الاستراتيجي لمستثمري البنية التحتية",
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

const catalogSources = [
  supplementalTranslations,
  siteContentTranslations,
  assetTranslations,
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
