import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { curatedVisibleTranslations } from "./curated-visible-translations";
import { germanTranslationFixes } from "./german-translation-fixes";
import { languageOptions, type Lang } from "./languages";
import { localePassthroughFixes } from "./locale-passthrough-fixes";
import { localeTranslationFixes } from "./locale-translation-fixes";
import { polishTranslations } from "./polish-translations";
import { polishTranslationsExtra } from "./polish-translations-extra";
import { polishTranslationsFinal } from "./polish-translations-final";
import { polishContentTranslations } from "./polish-content-translations";
import { polishRuntimeTranslations } from "./polish-runtime-translations";
import { propertyPageTranslations } from "./property-page-translations";

export const LANGS = languageOptions;
const DEFAULT_LANG: Lang = "en";

function isLang(value: string | null): value is Lang {
  return LANGS.some((option) => option.code === value);
}

function readStoredLang(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;

  try {
    const storedLang = window.localStorage.getItem("aixco-lang");
    return isLang(storedLang) ? storedLang : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

const keyedText: Record<string, string> = {
  "nav.home": "Home",
  "nav.about": "About AIXCO",
  "nav.legacy": "Our journey",
  "nav.dubai": "Dubai",
  "nav.batumi": "Batumi",
  "nav.materials": "Download Materials",
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
  "cta.start": "Explore opportunities",
  "cta.contact": "Contact AIXCO",
};
const supplementalTranslations: Partial<Record<string, Partial<Record<Lang, string>>>> = {
  "Skip to main content": {
    de: "Zum Hauptinhalt springen",
    ru: "Перейти к основному содержанию",
    ka: "მთავარ შინაარსზე გადასვლა",
    tr: "Ana içeriğe geç",
    ar: "انتقل إلى المحتوى الرئيسي",
    pl: "Przejdź do głównej treści",
  },
  "Pause background video": {
    de: "Hintergrundvideo pausieren",
    ru: "Приостановить фоновое видео",
    ka: "ფონური ვიდეოს შეჩერება",
    tr: "Arka plan videosunu duraklat",
    ar: "إيقاف فيديو الخلفية مؤقتًا",
    pl: "Wstrzymaj wideo w tle",
  },
  "Play background video": {
    de: "Hintergrundvideo abspielen",
    ru: "Воспроизвести фоновое видео",
    ka: "ფონური ვიდეოს დაკვრა",
    tr: "Arka plan videosunu oynat",
    ar: "تشغيل فيديو الخلفية",
    pl: "Odtwórz wideo w tle",
  },
  "Request reference": {
    de: "Anfragereferenz",
    ru: "Номер обращения",
    ka: "მოთხოვნის ნომერი",
    tr: "Talep referansı",
    ar: "مرجع الطلب",
    pl: "Numer zgłoszenia",
  },
  "Pause partner movement": {
    de: "Partnerbewegung pausieren",
    ru: "Приостановить движение партнёров",
    ka: "პარტნიორების მოძრაობის შეჩერება",
    tr: "İş ortakları hareketini duraklat",
    ar: "إيقاف حركة الشركاء مؤقتًا",
    pl: "Wstrzymaj ruch partnerów",
  },
  "Resume partner movement": {
    de: "Partnerbewegung fortsetzen",
    ru: "Возобновить движение партнёров",
    ka: "პარტნიორების მოძრაობის გაგრძელება",
    tr: "İş ortakları hareketini sürdür",
    ar: "استئناف حركة الشركاء",
    pl: "Wznów ruch partnerów",
  },
  "Pause gallery movement": {
    de: "Galeriebewegung pausieren",
    ru: "Приостановить движение галереи",
    ka: "გალერეის მოძრაობის შეჩერება",
    tr: "Galeri hareketini duraklat",
    ar: "إيقاف حركة المعرض مؤقتًا",
    pl: "Wstrzymaj ruch galerii",
  },
  "Resume gallery movement": {
    de: "Galeriebewegung fortsetzen",
    ru: "Возобновить движение галереи",
    ka: "გალერეის მოძრაობის გაგრძელება",
    tr: "Galeri hareketini sürdür",
    ar: "استئناف حركة المعرض",
    pl: "Wznów ruch galerii",
  },
  "Global Real Estate": {
    de: "Globale Immobilien",
    ru: "Глобальная недвижимость",
    ka: "გლობალური უძრავი ქონება",
    tr: "Global gayrimenkul",
    ar: "العقارات العالمية",
  },
  "Emerging Market Opportunities with AIXCO": {
    de: "Zugang zu aufstrebenden Märkten mit AIXCO",
    ru: "Возможности на развивающихся рынках с AIXCO",
    ka: "განვითარებადი ბაზრების შესაძლებლობები AIXCO-სთან ერთად",
    tr: "AIXCO ile gelisen pazar firsatlari",
    ar: "فرص الأسواق الناشئة مع AIXCO",
  },
  "Swiss Real Estate Expertise and Knowledge Conquering Emerging Markets": {
    de: "Schweizer Immobilienexpertise und Wissen erobern aufstrebende Märkte",
    ru: "Швейцарская экспертиза и знания в недвижимости осваивают развивающиеся рынки",
    ka: "შვეიცარიული უძრავი ქონების ექსპერტიზა და ცოდნა განვითარებად ბაზრებს იპყრობს",
    tr: "Isvicre gayrimenkul uzmanligi ve bilgisi gelisen pazarlari fethediyor",
    ar: "خبرة ومعرفة سويسرية في العقارات تفتح الأسواق الناشئة",
  },
  "A real estate foundation built on wise selection": {
    de: "Ein Immobilienfundament, aufgebaut auf kluger Auswahl",
    ru: "Фундамент недвижимости, построенный на разумном выборе",
    ka: "უძრავი ქონების საფუძველი, შექმნილი გონივრული შერჩევით",
    tr: "Akilli secim uzerine kurulu gayrimenkul temeli",
    ar: "أساس عقاري بني على الاختيار الحكيم",
  },
  "AIXCO's philosophy starts with wise selection: durable assets, disciplined risk assessment, and recurring income generation.": {
    de: "Die Philosophie von AIXCO beginnt mit kluger Auswahl: langlebige Sachwerte, umsichtige Risikoprüfung und wiederkehrende Erträge.",
    ru: "Философия AIXCO начинается с разумного выбора: надежные активы, дисциплинированная оценка рисков и регулярный доход.",
    ka: "AIXCO-ს ფილოსოფია იწყება გონივრული შერჩევით: გამძლე აქტივები, დისციპლინირებული რისკის შეფასება და განმეორებადი შემოსავალი.",
    tr: "AIXCO'nun felsefesi akilli secimle baslar: dayanikli varliklar, disiplinli risk degerlendirmesi ve duzenli gelir uretimi.",
    ar: "تبدأ فلسفة AIXCO بالاختيار الحكيم: أصول متينة، وتقييم منضبط للمخاطر، وتوليد دخل متكرر.",
  },
  "Access support for buying property or property services": {
    de: "Unterstützung beim Immobilienkauf oder bei Immobiliendienstleistungen erhalten",
  },
  "Since its first acquisition in 2009, the company has grown through carefully selected real estate decisions, building a portfolio defined by resilience, stability, and recurring income generation.": {
    de: "Seit dem ersten Erwerb im Jahr 2009 ist das Unternehmen durch sorgfältig ausgewählte Immobilienentscheidungen gewachsen und hat ein Portfolio aufgebaut, das von Widerstandsfähigkeit, Stabilität und wiederkehrenden Erträgen geprägt ist.",
    ru: "С момента первого приобретения в 2009 году компания развивалась за счет тщательно отобранных решений в сфере недвижимости, формируя портфель, основанный на устойчивости, стабильности и регулярном доходе.",
    ka: "2009 წელს პირველი შენაძენის შემდეგ კომპანია გაიზარდა ყურადღებით შერჩეული უძრავი ქონების გადაწყვეტილებებით და შექმნა პორტფელი, რომელიც გამძლეობით, სტაბილურობითა და განმეორებადი შემოსავლით გამოირჩევა.",
    tr: "2009'daki ilk satin alimdan bu yana sirket, ozenle secilmis gayrimenkul kararlariyla buyuyerek dayaniklilik, istikrar ve duzenli gelir uretimiyle tanimlanan bir portfoy olusturdu.",
    ar: "منذ أول استحواذ لها في عام 2009، نمت الشركة من خلال قرارات عقارية مختارة بعناية، وبنت محفظة تتميز بالمرونة والاستقرار وتوليد الدخل المتكرر.",
  },
  "Over the decades, AIXCO has evolved into a diversified international group combining Swiss real estate heritage with disciplined asset selection in emerging markets.": {
    de: "Im Laufe der Jahrzehnte entwickelte sich AIXCO zu einer diversifizierten internationalen Gruppe, die Schweizer Immobilienerfahrung mit disziplinierter Objektauswahl in aufstrebenden Märkten verbindet.",
    ru: "За десятилетия AIXCO превратилась в диверсифицированную международную группу, объединяющую швейцарское наследие недвижимости с дисциплинированным отбором активов на развивающихся рынках.",
    ka: "ათწლეულების განმავლობაში AIXCO გადაიქცა დივერსიფიცირებულ საერთაშორისო ჯგუფად, რომელიც შვეიცარიულ უძრავი ქონების მემკვიდრეობას განვითარებად ბაზრებზე დისციპლინირებულ აქტივების შერჩევას უკავშირებს.",
    tr: "AIXCO yillar icinde Isvicre gayrimenkul mirasini gelisen pazarlarda disiplinli varlik secimiyle birlestiren cesitlendirilmis uluslararasi bir gruba donustu.",
    ar: "على مدى العقود، تطورت AIXCO إلى مجموعة دولية متنوعة تجمع بين الإرث العقاري السويسري والاختيار المنضبط للأصول في الأسواق الناشئة.",
  },
  "Current gross development value": {
    de: "Aktueller Bruttoentwicklungswert",
    ru: "Текущая валовая стоимость развития",
    ka: "მიმდინარე მთლიანი განვითარების ღირებულება",
    tr: "Mevcut brut gelistirme degeri",
    ar: "إجمالي قيمة التطوير الحالية",
  },
  "Current GDV": {
    de: "Aktueller GDV",
    ru: "Текущий GDV",
    ka: "მიმდინარე GDV",
    tr: "Mevcut GDV",
    ar: "قيمة التطوير الحالية",
  },
  "Emerging Market Opportunities": {
    de: "Zugang zu aufstrebenden Märkten",
    ru: "Возможности на развивающихся рынках",
    ka: "განვითარებადი ბაზრების შესაძლებლობები",
    tr: "Gelisen pazar firsatlari",
    ar: "فرص الأسواق الناشئة",
  },
  "with AIXCO": {
    de: "mit AIXCO",
    ru: "с AIXCO",
    ka: "AIXCO-სთან ერთად",
    tr: "AIXCO ile",
    ar: "مع AIXCO",
  },
  "Own property in some of the world's fastest-growing destinations.": {
    de: "Erwerben Sie Eigentum in einigen der am schnellsten wachsenden Destinationen der Welt.",
    ru: "Владейте недвижимостью в одних из самых быстрорастущих направлений мира.",
    ka: "ფლობდეთ ქონებას მსოფლიოს ყველაზე სწრაფად მზარდ მიმართულებებში.",
    tr: "Dunyanin en hizli buyuyen destinasyonlarindan bazilarinda mulk sahibi olun.",
    ar: "امتلك عقارا في بعض اسرع الوجهات نموا في العالم.",
  },
  "Book consultation": {
    de: "Beratung buchen",
    ru: "Записаться на консультацию",
    ka: "კონსულტაციის დაჯავშნა",
    tr: "Danismanlik randevusu",
    ar: "حجز استشارة",
  },
  "CONTACT ME": {
    de: "Kontakt",
    ru: "Связаться",
    ka: "დამიკავშირდით",
    tr: "Bana ulasin",
    ar: "اتصل بي",
  },
  "How would you like us to contact you?": {
    de: "Wie sollen wir Sie kontaktieren?",
    ru: "Как нам с вами связаться?",
    ka: "როგორ გსურთ დაგიკავშირდეთ?",
    tr: "Sizinle nasil iletisime gecelim?",
    ar: "كيف تريد أن نتواصل معك؟",
  },
  "Schedule a Call": {
    de: "Anruf planen",
    ru: "Запланировать звонок",
    ka: "ზარის დაგეგმვა",
    tr: "Arama planla",
    ar: "جدولة مكالمة",
  },
  "Send an Email": {
    de: "E-Mail senden",
    ru: "Отправить письмо",
    ka: "ელფოსტის გაგზავნა",
    tr: "E-posta gonder",
    ar: "إرسال بريد إلكتروني",
  },
  "Name & Surname": {
    de: "Vor- und Nachname",
    ru: "Имя и фамилия",
    ka: "სახელი და გვარი",
    tr: "Ad ve soyad",
    ar: "الاسم واللقب",
  },
  "Phone Number": {
    de: "Telefonnummer",
    ru: "Номер телефона",
    ka: "ტელეფონის ნომერი",
    tr: "Telefon numarasi",
    ar: "رقم الهاتف",
  },
  "Preferred Time for a Call": {
    de: "Bevorzugte Uhrzeit für den Anruf",
    ru: "Предпочтительное время для звонка",
    ka: "სასურველი დრო ზარისთვის",
    tr: "Arama icin tercih edilen saat",
    ar: "الوقت المفضل للمكالمة",
  },
  "Email Address": {
    de: "E-Mail-Adresse",
    ru: "Адрес электронной почты",
    ka: "ელფოსტის მისამართი",
    tr: "E-posta adresi",
    ar: "عنوان البريد الإلكتروني",
  },
  Submit: {
    de: "Absenden",
    ru: "Отправить",
    ka: "გაგზავნა",
    tr: "Gonder",
    ar: "إرسال",
  },
  "Sending...": {
    de: "Wird gesendet...",
    ru: "Отправка...",
    ka: "იგზავნება...",
    tr: "Gonderiliyor...",
    ar: "جار الإرسال...",
  },
  "Thank you. We will contact you shortly.": {
    de: "Vielen Dank. Wir werden Sie in Kürze kontaktieren.",
    ru: "Спасибо. Мы скоро свяжемся с вами.",
    ka: "გმადლობთ. ჩვენ მალე დაგიკავშირდებით.",
    tr: "Tesekkurler. Sizinle kisa sure icinde iletisime gececegiz.",
    ar: "شكراً لك. سنتواصل معك قريباً.",
  },
  "We could not send your request. Please try again or email info@aixco.global.": {
    de: "Ihre Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie an info@aixco.global.",
    ru: "Не удалось отправить запрос. Пожалуйста, попробуйте еще раз или напишите на info@aixco.global.",
    ka: "თქვენი მოთხოვნის გაგზავნა ვერ მოხერხდა. სცადეთ ხელახლა ან მოგვწერეთ info@aixco.global-ზე.",
    tr: "Talebiniz gonderilemedi. Lutfen tekrar deneyin veya info@aixco.global adresine e-posta gonderin.",
    ar: "تعذر إرسال طلبك. يرجى المحاولة مرة أخرى أو مراسلة info@aixco.global.",
  },
  "Emerging market opportunities with AIXCO": {
    de: "Zugang zu aufstrebenden Märkten mit AIXCO",
    ru: "Возможности на развивающихся рынках с AIXCO",
    ka: "განვითარებადი ბაზრების შესაძლებლობები AIXCO-სთან ერთად",
    tr: "AIXCO ile gelişen pazar fırsatları",
    ar: "فرص الأسواق الناشئة مع AIXCO",
  },
  "Emerging market": {
    de: "Aufstrebender Markt",
    ru: "Развивающийся рынок",
    ka: "განვითარებადი ბაზარი",
    tr: "Gelişen pazar",
    ar: "سوق ناشئ",
  },
  "opportunities with AIXCO": {
    de: "Chancen mit AIXCO",
    ru: "возможности с AIXCO",
    ka: "შესაძლებლობები AIXCO-სთან ერთად",
    tr: "AIXCO ile fırsatlar",
    ar: "فرص مع AIXCO",
  },
  "Emerging market opportunities": {
    de: "Zugang zu aufstrebenden Märkten",
    ru: "Возможности на развивающихся рынках",
    ka: "განვითარებადი ბაზრების შესაძლებლობები",
    tr: "Gelişen pazar fırsatları",
    ar: "فرص الأسواق الناشئة",
  },
  "Welcome to the AIXCO assistant. Ask about emerging market opportunities, client materials and downloads, Dubai legacy projects, property administration, broker partnership, developer partnership, partners, team, or FAQs.": {
    de: "Willkommen beim AIXCO-Assistenten. Fragen Sie nach Zugang zu aufstrebenden Märkten, Kundenmaterialien und Downloads, Dubai-Legacy-Projekten, Immobilienverwaltung, Maklerpartnerschaft, Entwicklerpartnerschaft, Partnern, Team oder FAQs.",
    ru: "Добро пожаловать в помощник AIXCO. Спрашивайте о возможностях развивающихся рынков, клиентских материалах и загрузках, наследии проектов в Дубае, управлении недвижимостью, брокерском партнерстве, партнерстве с застройщиками, партнерах, команде или FAQ.",
    ka: "კეთილი იყოს თქვენი მობრძანება AIXCO-ს ასისტენტში. იკითხეთ განვითარებადი ბაზრების შესაძლებლობებზე, კლიენტის მასალებსა და ჩამოტვირთვებზე, დუბაის ლეგასი პროექტებზე, ქონების ადმინისტრირებაზე, ბროკერებთან პარტნიორობაზე, დეველოპერებთან პარტნიორობაზე, პარტნიორებზე, გუნდზე ან FAQ-ზე.",
    tr: "AIXCO asistanına hoş geldiniz. Gelişen pazar fırsatları, müşteri materyalleri ve indirmeler, Dubai geçmiş projeleri, mülk yönetimi, broker ortaklığı, geliştirici ortaklığı, partnerler, ekip veya SSS hakkında sorabilirsiniz.",
    ar: "مرحبًا بك في مساعد AIXCO. اسأل عن فرص الأسواق الناشئة، ومواد العملاء والتنزيلات، ومشاريع دبي السابقة، وإدارة العقارات، وشراكات الوسطاء، وشراكات المطورين، والشركاء، والفريق، أو الأسئلة الشائعة.",
  },
  "Welcome to the AIXCO assistant. Ask about emerging market opportunities, download materials, Dubai legacy projects, property administration, broker partnership, developer partnership, partners, team, or FAQs.": {
    de: "Willkommen beim AIXCO-Assistenten. Fragen Sie nach Zugang zu aufstrebenden Märkten, Download-Materialien, Dubai-Legacy-Projekten, Immobilienverwaltung, Maklerpartnerschaft, Entwicklerpartnerschaft, Partnern, Team oder FAQs.",
    ru: "Добро пожаловать в помощник AIXCO. Спрашивайте о возможностях развивающихся рынков, материалах для скачивания, проектах наследия в Дубае, управлении недвижимостью, брокерском партнерстве, партнерстве с застройщиками, партнерах, команде или FAQ.",
    ka: "კეთილი იყოს თქვენი მობრძანება AIXCO-ს ასისტენტში. იკითხეთ განვითარებადი ბაზრების შესაძლებლობებზე, ჩამოსატვირთ მასალებზე, დუბაის ლეგასი პროექტებზე, ქონების ადმინისტრირებაზე, ბროკერებთან პარტნიორობაზე, დეველოპერებთან პარტნიორობაზე, პარტნიორებზე, გუნდზე ან FAQ-ზე.",
    tr: "AIXCO asistanina hos geldiniz. Gelisen pazar firsatlari, indirilebilir materyaller, Dubai gecmis projeleri, mulk yonetimi, broker ortakligi, gelistirici ortakligi, partnerler, ekip veya SSS hakkinda sorabilirsiniz.",
    ar: "مرحبًا بك في مساعد AIXCO. اسأل عن فرص الأسواق الناشئة ومواد التنزيل ومشاريع دبي السابقة وإدارة العقارات وشراكات الوسطاء وشراكات المطورين والشركاء والفريق أو الأسئلة الشائعة.",
  },
  "your emerging-market real estate journey": {
    de: "Ihre Immobilienreise in aufstrebenden Märkten",
    ru: "ваш путь в недвижимости развивающихся рынков",
    ka: "თქვენი გზა განვითარებადი ბაზრების უძრავ ქონებაში",
    tr: "gelişen pazar gayrimenkul yolculuğunuz",
    ar: "رحلتك العقارية في الأسواق الناشئة",
  },
  "Register with us now to buy an apartment with AIXCO, partner as a broker, or discuss property administration with the AIXCO team.": {
    de: "Registrieren Sie sich jetzt, um mit AIXCO ein Apartment zu kaufen, als Maklerpartner zu arbeiten oder Immobilienverwaltung mit dem AIXCO-Team zu besprechen.",
    ru: "Зарегистрируйтесь сейчас, чтобы купить апартамент с AIXCO, стать брокерским партнером или обсудить управление недвижимостью с командой AIXCO.",
    ka: "დარეგისტრირდით ახლა, რომ შეიძინოთ ბინა AIXCO-სთან ერთად, ითანამშრომლოთ ბროკერად ან განიხილოთ ქონების ადმინისტრირება AIXCO-ს გუნდთან.",
    tr: "AIXCO ile bir daire satın almak, broker ortağı olmak veya AIXCO ekibiyle mülk yönetimini görüşmek için şimdi kaydolun.",
    ar: "سجّل معنا الآن لشراء شقة مع AIXCO، أو للشراكة كوسيط، أو لمناقشة إدارة العقارات مع فريق AIXCO.",
  },
  "New guide: buying an apartment with AIXCO from EUR 45,000": {
    de: "Neuer Leitfaden: Apartmentkauf mit AIXCO ab 45.000 EUR",
    ru: "Новый гид: покупка апартамента с AIXCO от 45 000 евро",
    ka: "ახალი გზამკვლევი: ბინის შეძენა AIXCO-სთან ერთად 45,000 ევროდან",
    tr: "Yeni rehber: AIXCO ile 45.000 EUR'dan daire satın alma",
    ar: "دليل جديد: شراء شقة مع AIXCO ابتداءً من 45,000 يورو",
  },
  "Emerging market opportunity": {
    de: "Chance in einem aufstrebenden Markt",
    ru: "Возможность на развивающемся рынке",
    ka: "განვითარებადი ბაზრის შესაძლებლობა",
    tr: "Gelişen pazar fırsatı",
    ar: "فرصة في سوق ناشئ",
  },
  "Current focus in Georgia": {
    de: "Aktueller Fokus in Georgien",
    ru: "Текущий фокус в Грузии",
    ka: "მიმდინარე ფოკუსი საქართველოში",
    tr: "Gürcistan'daki mevcut odak",
    ar: "التركيز الحالي في جورجيا",
  },
  "View emerging market opportunities": {
    de: "Zugang zu aufstrebenden Märkten ansehen",
    ru: "Посмотреть возможности развивающихся рынков",
    ka: "განვითარებადი ბაზრების შესაძლებლობების ნახვა",
    tr: "Gelişen pazar fırsatlarını görüntüle",
    ar: "عرض فرص الأسواق الناشئة",
  },
  "Selected emerging market property opportunity": {
    de: "Ausgewählte Immobilienchance in einem aufstrebenden Markt",
    ru: "Выбранная возможность недвижимости на развивающемся рынке",
    ka: "შერჩეული უძრავი ქონების შესაძლებლობა განვითარებად ბაზარზე",
    tr: "Seçilmiş gelişen pazar gayrimenkul fırsatı",
    ar: "فرصة عقارية مختارة في سوق ناشئ",
  },
  "Since 2009, AIXCO has bought, sold, and brokered real estate across Europe and the Gulf - today focused on selected emerging-market opportunities, with a legacy track record in Switzerland and Dubai.": {
    de: "Seit 2009 kauft, verkauft und vermittelt AIXCO Immobilien in Europa und der Golfregion. Heute liegt der Fokus auf ausgewählten Chancen in aufstrebenden Märkten - mit einem gewachsenen Portfolio in der Schweiz und Dubai.",
    ru: "С 2009 года AIXCO покупает, продает и сопровождает сделки с недвижимостью в Европе и странах Залива; сегодня фокус на выбранных возможностях развивающихся рынков, опираясь на опыт в Швейцарии и Дубае.",
    ka: "2009 წლიდან AIXCO ყიდულობს, ყიდის და შუამავლობს უძრავი ქონების გარიგებებს ევროპასა და ყურის რეგიონში; დღეს ფოკუსია შერჩეულ შესაძლებლობებზე განვითარებად ბაზრებში, შვეიცარიისა და დუბაის გამოცდილებით.",
    tr: "2009'dan beri AIXCO Avrupa ve Körfez'de gayrimenkul alım, satım ve aracılık süreçleri yürütüyor; bugün odak, İsviçre ve Dubai geçmişiyle seçilmiş gelişen pazar fırsatlarıdır.",
    ar: "منذ عام 2009، اشترت AIXCO وباعت ووسّطت العقارات في أوروبا والخليج؛ واليوم تركّز على فرص مختارة في الأسواق الناشئة مع سجل سابق في سويسرا ودبي.",
  },
  "Since 2009, AIXCO has bought, sold, and brokered real estate across Europe and the Gulf—today focused on selected emerging-market opportunities, with a legacy track record in Switzerland and Dubai.": {
    de: "Seit 2009 kauft, verkauft und vermittelt AIXCO Immobilien in Europa und der Golfregion. Heute liegt der Fokus auf ausgewählten Chancen in aufstrebenden Märkten - mit einem gewachsenen Portfolio in der Schweiz und Dubai.",
    ru: "С 2009 года AIXCO покупает, продает и сопровождает сделки с недвижимостью в Европе и странах Залива; сегодня фокус на выбранных возможностях развивающихся рынков, опираясь на опыт в Швейцарии и Дубае.",
    ka: "2009 წლიდან AIXCO ყიდულობს, ყიდის და შუამავლობს უძრავი ქონების გარიგებებს ევროპასა და ყურის რეგიონში; დღეს ფოკუსია შერჩეულ შესაძლებლობებზე განვითარებად ბაზრებში, შვეიცარიისა და დუბაის გამოცდილებით.",
    tr: "2009'dan beri AIXCO Avrupa ve Körfez'de gayrimenkul alım, satım ve aracılık süreçleri yürütüyor; bugün odak, İsviçre ve Dubai geçmişiyle seçilmiş gelişen pazar fırsatlarıdır.",
    ar: "منذ عام 2009، اشترت AIXCO وباعت ووسّطت العقارات في أوروبا والخليج؛ واليوم تركّز على فرص مختارة في الأسواق الناشئة مع سجل سابق في سويسرا ودبي.",
  },
  "Selected emerging-market projects and apartments through AIXCO, with Batumi as the current focus, entry from €45,000, 100% foreign ownership, bank financing minimum 60%, and a transparent ISO-certified process.": {
    de: "Ausgewählte Projekte und Apartments in aufstrebenden Märkten über AIXCO, mit Batumi als aktuellem Fokus, Einstieg ab 45.000 EUR, 100% ausländischem Eigentum, Bankfinanzierung mindestens 60% und einem transparenten ISO-zertifizierten Prozess.",
    ru: "Выбранные проекты и апартаменты на развивающихся рынках через AIXCO, с текущим фокусом на Батуми, входом от 45 000 евро, 100% иностранной собственностью, банковским финансированием минимум 60% и прозрачным ISO-сертифицированным процессом.",
    ka: "AIXCO-ს მეშვეობით შერჩეული პროექტები და ბინები განვითარებად ბაზრებზე, ბათუმით როგორც მიმდინარე ფოკუსით, შესვლა 45,000 ევროდან, 100% უცხოური საკუთრება, საბანკო დაფინანსება მინიმუმ 60% და გამჭვირვალე ISO-სერტიფიცირებული პროცესი.",
    tr: "AIXCO aracılığıyla seçilmiş gelişen pazar projeleri ve daireleri; mevcut odak Batum, giriş 45.000 EUR'dan, %100 yabancı mülkiyeti, minimum %60 banka finansmanı ve şeffaf ISO sertifikalı süreç.",
    ar: "مشاريع وشقق مختارة في الأسواق الناشئة عبر AIXCO، مع باتومي كتركيز حالي، ودخول من 45,000 يورو، وملكية أجنبية 100%، وتمويل مصرفي بحد أدنى 60%، وعملية شفافة معتمدة وفق ISO.",
  },
  "Today, Batumi is AIXCO's current selected emerging-market focus, with exclusive project access, 100% foreign ownership, no residency permit requirement, bank financing minimum 60% of property value, and an ISO-certified transparency process.": {
    de: "Heute ist Batumi der aktuelle ausgewählte Fokus von AIXCO in einem aufstrebenden Markt, mit exklusivem Projektzugang, 100% ausländischem Eigentum, keiner Aufenthaltserlaubnis für den Kauf, Bankfinanzierung von mindestens 60% des Immobilienwerts und einem ISO-zertifizierten Transparenzprozess.",
    ru: "Сегодня Батуми является текущим выбранным фокусом AIXCO на развивающемся рынке: эксклюзивный доступ к проектам, 100% иностранная собственность, отсутствие требования ВНЖ, банковское финансирование минимум 60% стоимости объекта и ISO-сертифицированный прозрачный процесс.",
    ka: "დღეს ბათუმი არის AIXCO-ს მიმდინარე შერჩეული ფოკუსი განვითარებად ბაზარზე: ექსკლუზიური წვდომა პროექტებზე, 100% უცხოური საკუთრება, ბინადრობის ნებართვის მოთხოვნის გარეშე, საბანკო დაფინანსება ქონების ღირებულების მინიმუმ 60% და ISO-სერტიფიცირებული გამჭვირვალობის პროცესი.",
    tr: "Bugün Batum, AIXCO'nun gelişen pazarlardaki mevcut seçilmiş odağıdır: özel proje erişimi, %100 yabancı mülkiyeti, oturum izni şartı yok, mülk değerinin minimum %60'ı kadar banka finansmanı ve ISO sertifikalı şeffaflık süreci.",
    ar: "اليوم تُعد باتومي التركيز الحالي المختار لـ AIXCO في سوق ناشئ، مع وصول حصري إلى المشاريع، وملكية أجنبية 100%، وعدم الحاجة إلى تصريح إقامة، وتمويل مصرفي بحد أدنى 60% من قيمة العقار، وعملية شفافية معتمدة وفق ISO.",
  },
  "A guided process for clients purchasing or reserving selected emerging-market apartments through AIXCO's current focus.": {
    de: "Ein geführter Prozess für Kunden, die ausgewählte Apartments in AIXCOs aktuellem Fokusmarkt kaufen oder reservieren.",
    ru: "Сопровождаемый процесс для клиентов, покупающих или резервирующих выбранные апартаменты в текущем фокусе AIXCO на развивающемся рынке.",
    ka: "მართული პროცესი კლიენტებისთვის, რომლებიც ყიდულობენ ან ჯავშნიან შერჩეულ ბინებს AIXCO-ს მიმდინარე განვითარებად ბაზრის ფოკუსში.",
    tr: "AIXCO'nun mevcut gelişen pazar odağında seçilmiş daireleri satın alan veya rezerve eden müşteriler için rehberli süreç.",
    ar: "عملية موجهة للعملاء الذين يشترون أو يحجزون شققًا مختارة ضمن التركيز الحالي لـ AIXCO في سوق ناشئ.",
  },
  "For clients buying apartments or reserving units in selected emerging markets through a guided digital process.": {
    de: "Für Kunden, die Apartments in ausgewählten aufstrebenden Märkten über einen geführten digitalen Prozess kaufen oder reservieren.",
    ru: "Для клиентов, покупающих апартаменты или резервирующих объекты на выбранных развивающихся рынках через сопровождаемый цифровой процесс.",
    ka: "კლიენტებისთვის, რომლებიც ყიდულობენ ბინებს ან ჯავშნიან ობიექტებს შერჩეულ განვითარებად ბაზრებზე მართული ციფრული პროცესით.",
    tr: "Seçilmiş gelişen pazarlarda daire satın alan veya birimleri rehberli dijital süreçle rezerve eden müşteriler için.",
    ar: "للعملاء الذين يشترون شققًا أو يحجزون وحدات في أسواق ناشئة مختارة من خلال عملية رقمية موجهة.",
  },
  "Entry starts from €45,000 for selected emerging-market projects and apartments available exclusively through AIXCO, with Batumi as the current focus. Full commission can be payable from only a 10% down payment, with final terms depending on project and agreement.": {
    de: "Der Einstieg beginnt bei 45.000 EUR für ausgewählte Projekte und Apartments in aufstrebenden Märkten, exklusiv über AIXCO, mit Batumi als aktuellem Fokus. Die volle Provision kann bereits ab nur 10% Anzahlung zahlbar sein; die endgültigen Bedingungen hängen von Projekt und Vereinbarung ab.",
    ru: "Вход начинается от 45 000 евро для выбранных проектов и апартаментов на развивающихся рынках, доступных эксклюзивно через AIXCO, с текущим фокусом на Батуми. Полная комиссия может выплачиваться уже с 10% первоначального взноса; окончательные условия зависят от проекта и соглашения.",
    ka: "შესვლა იწყება 45,000 ევროდან შერჩეული განვითარებადი ბაზრის პროექტებისა და ბინებისთვის, ექსკლუზიურად AIXCO-ს მეშვეობით, ბათუმით როგორც მიმდინარე ფოკუსით. სრული საკომისიო შეიძლება გადახდილი იყოს მხოლოდ 10% წინასწარი შენატანიდან; საბოლოო პირობები დამოკიდებულია პროექტსა და შეთანხმებაზე.",
    tr: "AIXCO aracılığıyla özel olarak sunulan seçilmiş gelişen pazar projeleri ve daireleri için giriş 45.000 EUR'dan başlar; mevcut odak Batum'dur. Tam komisyon yalnızca %10 peşinatla ödenebilir; nihai koşullar proje ve anlaşmaya bağlıdır.",
    ar: "يبدأ الدخول من 45,000 يورو للمشاريع والشقق المختارة في الأسواق الناشئة والمتاحة حصريًا عبر AIXCO، مع باتومي كتركيز حالي. يمكن أن تكون العمولة الكاملة مستحقة من دفعة أولى قدرها 10% فقط، وتخضع الشروط النهائية للمشروع والاتفاق.",
  },
  "Can foreigners buy property in AIXCO's current emerging-market focus?": {
    de: "Können Ausländer Immobilien im aktuellen aufstrebenden Fokusmarkt von AIXCO kaufen?",
    ru: "Могут ли иностранцы покупать недвижимость в текущем фокусе AIXCO на развивающемся рынке?",
    ka: "შეუძლიათ თუ არა უცხოელებს ქონების შეძენა AIXCO-ს მიმდინარე განვითარებად ბაზრის ფოკუსში?",
    tr: "Yabancılar AIXCO'nun mevcut gelişen pazar odağında mülk satın alabilir mi?",
    ar: "هل يمكن للأجانب شراء عقار ضمن التركيز الحالي لـ AIXCO في سوق ناشئ؟",
  },
  "Yes. Selected apartments in AIXCO's current focus allow 100% foreign ownership, and no residency permit is required to buy.": {
    de: "Ja. Ausgewählte Apartments im aktuellen Fokus von AIXCO erlauben 100% ausländisches Eigentum, und für den Kauf ist keine Aufenthaltserlaubnis erforderlich.",
    ru: "Да. Выбранные апартаменты в текущем фокусе AIXCO допускают 100% иностранную собственность, и для покупки не требуется вид на жительство.",
    ka: "დიახ. AIXCO-ს მიმდინარე ფოკუსში შერჩეული ბინები იძლევა 100% უცხოურ საკუთრებას და შესაძენად ბინადრობის ნებართვა საჭირო არ არის.",
    tr: "Evet. AIXCO'nun mevcut odağındaki seçilmiş dairelerde %100 yabancı mülkiyeti mümkündür ve satın almak için oturum izni gerekmez.",
    ar: "نعم. تتيح الشقق المختارة ضمن التركيز الحالي لـ AIXCO ملكية أجنبية بنسبة 100%، ولا يلزم تصريح إقامة للشراء.",
  },
  "Brokers can log in to use the portal operationally, manage customer journeys, coordinate tours, and work more efficiently with curated emerging-market opportunities.": {
    de: "Makler können sich anmelden, um das Portal operativ zu nutzen, Kundenreisen zu verwalten, Besichtigungen zu koordinieren und effizienter mit kuratierten Chancen in aufstrebenden Märkten zu arbeiten.",
    ru: "Брокеры могут входить в портал для работы, управлять путями клиентов, координировать туры и эффективнее работать с отобранными возможностями развивающихся рынков.",
    ka: "ბროკერებს შეუძლიათ პორტალში შესვლა ოპერაციული გამოყენებისთვის, კლიენტების გზების მართვა, ტურების კოორდინაცია და შერჩეულ განვითარებად ბაზრის შესაძლებლობებთან უფრო ეფექტურად მუშაობა.",
    tr: "Brokerler portalı operasyonel olarak kullanmak, müşteri yolculuklarını yönetmek, turları koordine etmek ve seçilmiş gelişen pazar fırsatlarıyla daha verimli çalışmak için giriş yapabilir.",
    ar: "يمكن للوسطاء تسجيل الدخول لاستخدام البوابة تشغيليًا، وإدارة رحلات العملاء، وتنسيق الجولات، والعمل بكفاءة أكبر مع فرص منتقاة في الأسواق الناشئة.",
  },
  "Register as a customer if you want to buy property, explore selected opportunities, or receive a more guided route into selected emerging-market real estate through one organized onboarding form.": {
    de: "Registrieren Sie sich als Kunde, wenn Sie Immobilien kaufen, ausgewählte Chancen erkunden oder über ein organisiertes Onboarding-Formular einen geführten Weg in ausgewählte Immobilien aufstrebender Märkte erhalten möchten.",
    ru: "Зарегистрируйтесь как клиент, если хотите купить недвижимость, изучить выбранные возможности или получить более структурированный путь к выбранной недвижимости развивающихся рынков через одну форму онбординга.",
    ka: "დარეგისტრირდით კლიენტად, თუ გსურთ უძრავი ქონების შეძენა, შერჩეული შესაძლებლობების შესწავლა ან ერთ ორგანიზებულ ფორმაში მართული გზა შერჩეულ განვითარებად ბაზრის უძრავ ქონებაში.",
    tr: "Mülk satın almak, seçilmiş fırsatları keşfetmek veya tek bir düzenli kayıt formuyla seçilmiş gelişen pazar gayrimenkulüne daha rehberli bir yol almak istiyorsanız müşteri olarak kaydolun.",
    ar: "سجّل كعميل إذا كنت ترغب في شراء عقار، أو استكشاف فرص مختارة، أو الحصول على مسار أكثر توجيهًا نحو عقارات مختارة في الأسواق الناشئة من خلال نموذج إعداد واحد منظم.",
  },
  "Checking the AIXCO website content...": {
    de: "AIXCO-Websiteinhalte werden geprüft...",
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
  "On request": { de: "Auf Anfrage", ru: "On request", ka: "On request", tr: "On request", ar: "On request" },
  "available on request": { de: "auf Anfrage verfügbar", ru: "available on request", ka: "available on request", tr: "available on request", ar: "available on request" },
  "Client brochure": { de: "Kundenbroschüre", ru: "Брошюра для клиентов", ka: "კლიენტის ბროშურა", tr: "Müşteri broşürü", ar: "كتيب العملاء" },
  "AIXCO client brochure": { de: "AIXCO-Kundenbroschüre", ru: "Брошюра AIXCO для клиентов", ka: "AIXCO-ს კლიენტის ბროშურა", tr: "AIXCO müşteri broşürü", ar: "كتيب عملاء AIXCO" },
  "Download the AIXCO client brochure with the real estate investment overview and opportunity details.": {
    de: "Laden Sie die AIXCO-Kundenbroschüre mit dem Immobilieninvestment-Überblick und Details zu den Chancen herunter.",
    ru: "Скачайте клиентскую брошюру AIXCO с обзором инвестиций в недвижимость и деталями возможностей.",
    ka: "ჩამოტვირთეთ AIXCO-ს კლიენტის ბროშურა უძრავი ქონების საინვესტიციო მიმოხილვით და შესაძლებლობების დეტალებით.",
    tr: "Gayrimenkul yatırım özeti ve fırsat detaylarını içeren AIXCO müşteri broşürünü indirin.",
    ar: "نزّل كتيب عملاء AIXCO الذي يتضمن نظرة عامة على الاستثمار العقاري وتفاصيل الفرص.",
  },
  "Batumi project brochure": { de: "Batumi project brochure", ru: "Batumi project brochure", ka: "Batumi project brochure", tr: "Batumi project brochure", ar: "Batumi project brochure" },
  "Current project brochure": { de: "Current project brochure", ru: "Current project brochure", ka: "Current project brochure", tr: "Current project brochure", ar: "Current project brochure" },
  "Current project PDF for clients comparing selected apartment options.": {
    de: "Current project PDF for clients comparing selected apartment options.",
    ru: "Current project PDF for clients comparing selected apartment options.",
    ka: "Current project PDF for clients comparing selected apartment options.",
    tr: "Current project PDF for clients comparing selected apartment options.",
    ar: "Current project PDF for clients comparing selected apartment options.",
  },
  "Catalog sheet": { de: "Catalog sheet", ru: "Catalog sheet", ka: "Catalog sheet", tr: "Catalog sheet", ar: "Catalog sheet" },
  "Current project catalog sheet": { de: "Current project catalog sheet", ru: "Current project catalog sheet", ka: "Current project catalog sheet", tr: "Current project catalog sheet", ar: "Current project catalog sheet" },
  "High-resolution current project catalog image for quick sharing and offline review.": {
    de: "High-resolution current project catalog image for quick sharing and offline review.",
    ru: "High-resolution current project catalog image for quick sharing and offline review.",
    ka: "High-resolution current project catalog image for quick sharing and offline review.",
    tr: "High-resolution current project catalog image for quick sharing and offline review.",
    ar: "High-resolution current project catalog image for quick sharing and offline review.",
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
  About: { de: "Über AIXCO", ru: "About", ka: "About", tr: "About", ar: "About" },
  Login: { de: "Anmelden", ru: "Войти", ka: "შესვლა", tr: "Giriş", ar: "تسجيل الدخول" },
  Register: { de: "Registrieren", ru: "Регистрация", ka: "რეგისტრაცია", tr: "Kayıt Ol", ar: "التسجيل" },
  "Open menu": { de: "Menü öffnen", ru: "Открыть меню", ka: "მენიუს გახსნა", tr: "Menüyü aç", ar: "افتح القائمة" },
  "Close menu": { de: "Menü schließen", ru: "Закрыть меню", ka: "მენიუს დახურვა", tr: "Menüyü kapat", ar: "أغلق القائمة" },
  "Social media": { de: "Social Media", ru: "Социальные сети", ka: "სოციალური მედია", tr: "Sosyal medya", ar: "وسائل التواصل الاجتماعي" },
  "AIXCO footer introduction": { de: "AIXCO Footer-Einführung", ru: "AIXCO footer introduction", ka: "AIXCO footer introduction", tr: "AIXCO footer introduction", ar: "AIXCO footer introduction" },
  "AIXCO social media links": { de: "AIXCO Social-Media-Links", ru: "AIXCO social media links", ka: "AIXCO social media links", tr: "AIXCO social media links", ar: "AIXCO social media links" },
  "Buy, broker, and manage selected real estate routes with AIXCO.": {
    de: "Ausgewählte Immobilienwege mit AIXCO kaufen, vermitteln und verwalten.",
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
    de: "Prüfen Sie Batumi-Apartments, Immobilienreferenzen, Kundenmaterialien und den passenden Onboarding-Weg an einem Ort.",
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
  "Explore opportunities": {
    de: "Chancen erkunden",
    ru: "Explore opportunities",
    ka: "Explore opportunities",
    tr: "Explore opportunities",
    ar: "Explore opportunities",
  },
  "Real Estate Investment": {
    de: "Immobilieninvestment",
    ru: "Real Estate Investment",
    ka: "Real Estate Investment",
    tr: "Real Estate Investment",
    ar: "Real Estate Investment",
  },
  "Enter Uprising real estate with AIXCO": {
    de: "Mit AIXCO in Uprising-Immobilien einsteigen",
    ru: "Enter Uprising real estate with AIXCO",
    ka: "Enter Uprising real estate with AIXCO",
    tr: "Enter Uprising real estate with AIXCO",
    ar: "Enter Uprising real estate with AIXCO",
  },
  "Explore selected apartments and opportunity-driven real estate with the AIXCO team.": {
    de: "Explore selected apartments and opportunity-driven real estate with the AIXCO team.",
    ru: "Explore selected apartments and opportunity-driven real estate with the AIXCO team.",
    ka: "Explore selected apartments and opportunity-driven real estate with the AIXCO team.",
    tr: "Explore selected apartments and opportunity-driven real estate with the AIXCO team.",
    ar: "Explore selected apartments and opportunity-driven real estate with the AIXCO team.",
  },
  "How to work with AIXCO": {
    de: "Mit AIXCO arbeiten",
    ru: "How to work with AIXCO",
    ka: "AIXCO-სთან მუშაობა",
    tr: "How to work with AIXCO",
    ar: "How to work with AIXCO",
  },
  "How it works": {
    de: "So funktioniert es",
    ru: "How it works",
    ka: "How it works",
    tr: "How it works",
    ar: "How it works",
  },
  "Buy an apartment as the primary route, broker qualified buyers, or work with AIXCO on property administration after purchase.": {
    de: "Kaufen Sie als Hauptweg ein Apartment, vermitteln Sie qualifizierte Käufer oder arbeiten Sie nach dem Kauf mit AIXCO bei der Immobilienverwaltung zusammen.",
    ru: "Buy an apartment as the primary route, broker qualified buyers, or work with AIXCO on property administration after purchase.",
    ka: "Buy an apartment as the primary route, broker qualified buyers, or work with AIXCO on property administration after purchase.",
    tr: "Buy an apartment as the primary route, broker qualified buyers, or work with AIXCO on property administration after purchase.",
    ar: "Buy an apartment as the primary route, broker qualified buyers, or work with AIXCO on property administration after purchase.",
  },
  "Global opportunities": {
    de: "Globale Chancen",
    ru: "Global opportunities",
    ka: "Global opportunities",
    tr: "Global opportunities",
    ar: "Global opportunities",
  },
  "Expanding through carefully selected opportunities": {
    de: "Expansion durch sorgfältig ausgewählte Chancen",
    ru: "Expanding through carefully selected opportunities",
    ka: "Expanding through carefully selected opportunities",
    tr: "Expanding through carefully selected opportunities",
    ar: "Expanding through carefully selected opportunities",
  },
  "AIXCO combines local market expertise with international experience to provide access to opportunities positioned for long-term growth and capital appreciation.": {
    de: "AIXCO verbindet lokale Marktexpertise mit internationaler Erfahrung, um Zugang zu Chancen zu bieten, die auf langfristiges Wachstum und Kapitalwertsteigerung ausgerichtet sind.",
    ru: "AIXCO combines local market expertise with international experience to provide access to opportunities positioned for long-term growth and capital appreciation.",
    ka: "AIXCO combines local market expertise with international experience to provide access to opportunities positioned for long-term growth and capital appreciation.",
    tr: "AIXCO combines local market expertise with international experience to provide access to opportunities positioned for long-term growth and capital appreciation.",
    ar: "AIXCO combines local market expertise with international experience to provide access to opportunities positioned for long-term growth and capital appreciation.",
  },
  "Bank financing minimum 60%": {
    de: "Bankfinanzierung mindestens 60%",
    ru: "Bank financing minimum 60%",
    ka: "Bank financing minimum 60%",
    tr: "Bank financing minimum 60%",
    ar: "Bank financing minimum 60%",
  },
  "Approx. 10-12% net rental yields": {
    de: "Ca. 10-12% Nettomietrendite",
    ru: "Approx. 10-12% net rental yields",
    ka: "Approx. 10-12% net rental yields",
    tr: "Approx. 10-12% net rental yields",
    ar: "Approx. 10-12% net rental yields",
  },
  "Secure your position from €5,000": {
    de: "Sichern Sie Ihre Position ab 5.000 EUR",
    ru: "Зафиксируйте позицию от 5 000 евро",
    ka: "დაიკავეთ პოზიცია 5,000 ევროდან",
    tr: "Pozisyonunuzu 5.000 EUR'dan guvenceye alin",
    ar: "احجز موقعك ابتداء من 5,000 يورو",
  },
  "Approx. 12% net rental yields": {
    de: "Ca. 12% Nettomietrendite",
    ru: "Около 12% чистой арендной доходности",
    ka: "დაახლოებით 12% წმინდა საიჯარო შემოსავალი",
    tr: "Yaklasik %12 net kira getirisi",
    ar: "حوالي 12% عائد إيجار صاف",
  },
  "Current project": {
    de: "Aktuelles Projekt",
    ru: "Current project",
    ka: "Current project",
    tr: "Current project",
    ar: "Current project",
  },
  "AIXCO-managed buyer guidance, project information, and supporting materials available through the client route.": {
    de: "Von AIXCO betreute Käuferbegleitung, Projektinformationen und Begleitmaterialien über den Kundenweg.",
    ru: "AIXCO-managed buyer guidance, project information, and supporting materials available through the client route.",
    ka: "AIXCO-managed buyer guidance, project information, and supporting materials available through the client route.",
    tr: "AIXCO-managed buyer guidance, project information, and supporting materials available through the client route.",
    ar: "AIXCO-managed buyer guidance, project information, and supporting materials available through the client route.",
  },
  "Buy an Apartment with AIXCO": {
    de: "Apartment mit AIXCO kaufen",
    ru: "Buy an Apartment with AIXCO",
    ka: "Buy an Apartment with AIXCO",
    tr: "Buy an Apartment with AIXCO",
    ar: "Buy an Apartment with AIXCO",
  },
  "Customers sign up, review selected apartments, book a private tour, and move through reservation and purchase with the AIXCO team.": {
    de: "Kunden registrieren sich, prüfen ausgewählte Apartments, buchen eine private Besichtigung und durchlaufen Reservierung und Kauf mit dem AIXCO-Team.",
    ru: "Customers sign up, review selected apartments, book a private tour, and move through reservation and purchase with the AIXCO team.",
    ka: "Customers sign up, review selected apartments, book a private tour, and move through reservation and purchase with the AIXCO team.",
    tr: "Customers sign up, review selected apartments, book a private tour, and move through reservation and purchase with the AIXCO team.",
    ar: "Customers sign up, review selected apartments, book a private tour, and move through reservation and purchase with the AIXCO team.",
  },
  "No. Approx. 10-12% net rental yields are scenario-based and depend on occupancy, market conditions, property management, project delivery, and external factors.": {
    de: "Nein. Ca. 10-12% Nettomietrendite ist szenariobasiert und hängt von Auslastung, Marktbedingungen, Immobilienverwaltung, Projektfertigstellung und externen Faktoren ab.",
    ru: "No. Approx. 10-12% net rental yields are scenario-based and depend on occupancy, market conditions, property management, project delivery, and external factors.",
    ka: "No. Approx. 10-12% net rental yields are scenario-based and depend on occupancy, market conditions, property management, project delivery, and external factors.",
    tr: "No. Approx. 10-12% net rental yields are scenario-based and depend on occupancy, market conditions, property management, project delivery, and external factors.",
    ar: "No. Approx. 10-12% net rental yields are scenario-based and depend on occupancy, market conditions, property management, project delivery, and external factors.",
  },
  "How AIXCO Works": {
    de: "Wie AIXCO funktioniert",
    ru: "How AIXCO Works",
    ka: "როგორ მუშაობს AIXCO",
    tr: "How AIXCO Works",
    ar: "How AIXCO Works",
  },
  "How to work": { de: "Mit AIXCO arbeiten", ru: "How to work", ka: "AIXCO-სთან მუშაობა", tr: "How to work", ar: "How to work" },
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
  "Entry starts from €45,000 for selected Batumi projects and apartments available exclusively through AIXCO. Full commission can be payable from only a 10% down payment, with final terms depending on project and agreement.": {
    de: "Entry starts from €45,000 for selected Batumi projects and apartments available exclusively through AIXCO. Full commission can be payable from only a 10% down payment, with final terms depending on project and agreement.",
    ru: "Entry starts from €45,000 for selected Batumi projects and apartments available exclusively through AIXCO. Full commission can be payable from only a 10% down payment, with final terms depending on project and agreement.",
    ka: "Entry starts from €45,000 for selected Batumi projects and apartments available exclusively through AIXCO. Full commission can be payable from only a 10% down payment, with final terms depending on project and agreement.",
    tr: "Entry starts from €45,000 for selected Batumi projects and apartments available exclusively through AIXCO. Full commission can be payable from only a 10% down payment, with final terms depending on project and agreement.",
    ar: "Entry starts from €45,000 for selected Batumi projects and apartments available exclusively through AIXCO. Full commission can be payable from only a 10% down payment, with final terms depending on project and agreement.",
  },
  "Can I ask about AIXCO company financing?": {
    de: "Can I ask about AIXCO company financing?",
    ru: "Can I ask about AIXCO company financing?",
    ka: "Can I ask about AIXCO company financing?",
    tr: "Can I ask about AIXCO company financing?",
    ar: "Can I ask about AIXCO company financing?",
  },
  "Yes. AIXCO.Global is presented first as a real estate services company for buying, brokering, and administering property. Separate company-financing information may be available on request from the AIXCO team; it is not a primary website journey and no bond terms are promoted on this page.": {
    de: "Yes. AIXCO.Global is presented first as a real estate services company for buying, brokering, and administering property. Separate company-financing information may be available on request from the AIXCO team; it is not a primary website journey and no bond terms are promoted on this page.",
    ru: "Yes. AIXCO.Global is presented first as a real estate services company for buying, brokering, and administering property. Separate company-financing information may be available on request from the AIXCO team; it is not a primary website journey and no bond terms are promoted on this page.",
    ka: "Yes. AIXCO.Global is presented first as a real estate services company for buying, brokering, and administering property. Separate company-financing information may be available on request from the AIXCO team; it is not a primary website journey and no bond terms are promoted on this page.",
    tr: "Yes. AIXCO.Global is presented first as a real estate services company for buying, brokering, and administering property. Separate company-financing information may be available on request from the AIXCO team; it is not a primary website journey and no bond terms are promoted on this page.",
    ar: "Yes. AIXCO.Global is presented first as a real estate services company for buying, brokering, and administering property. Separate company-financing information may be available on request from the AIXCO team; it is not a primary website journey and no bond terms are promoted on this page.",
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
  "AIXCO - Real Estate Investment": {
    de: "AIXCO - Immobilieninvestment",
    ru: "AIXCO - real estate investment",
    ka: "AIXCO - real estate investment",
    tr: "AIXCO - Gayrimenkul Platformu",
    ar: "AIXCO - real estate investment",
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
  "Batumi evening waterfront and mountain skyline": {
    de: "Batumi evening waterfront and mountain skyline",
    ru: "Batumi evening waterfront and mountain skyline",
    ka: "Batumi evening waterfront and mountain skyline",
    tr: "Batumi evening waterfront and mountain skyline",
    ar: "Batumi evening waterfront and mountain skyline",
  },
  "Dubai legacy portfolio video": {
    de: "Dubai legacy portfolio video",
    ru: "Dubai legacy portfolio video",
    ka: "Dubai legacy portfolio video",
    tr: "Dubai legacy portfolio video",
    ar: "Dubai legacy portfolio video",
  },
  "Batumi dusk aerial coastline and city lights": {
    de: "Batumi dusk aerial coastline and city lights",
    ru: "Batumi dusk aerial coastline and city lights",
    ka: "Batumi dusk aerial coastline and city lights",
    tr: "Batumi dusk aerial coastline and city lights",
    ar: "Batumi dusk aerial coastline and city lights",
  },
  "Batumi golden hour skyline and coastline": {
    de: "Batumi golden hour skyline and coastline",
    ru: "Batumi golden hour skyline and coastline",
    ka: "Batumi golden hour skyline and coastline",
    tr: "Batumi golden hour skyline and coastline",
    ar: "Batumi golden hour skyline and coastline",
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
  "Chat messages": { de: "Chatnachrichten", ru: "Сообщения чата", ka: "ჩატის შეტყობინებები", tr: "Sohbet mesajları", ar: "رسائل الدردشة" },
  "Please choose a valid preferred call time.": { de: "Bitte wählen Sie eine gültige bevorzugte Anrufzeit.", ru: "Выберите корректное предпочтительное время звонка.", ka: "გთხოვთ აირჩიოთ ზარის სასურველი დრო.", tr: "Lütfen geçerli bir tercih edilen arama saati seçin.", ar: "يرجى اختيار وقت مفضل صالح للمكالمة." },
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
  "New guide: buying Batumi apartments from EUR 45,000": {
    de: "Neuer Leitfaden: Batumi-Wohnungen ab 45.000 EUR kaufen",
    ru: "Новое руководство: покупка квартир в Батуми от 45 000 EUR",
    ka: "ახალი გზამკვლევი: ბათუმის ბინების ყიდვა 45,000 ევროდან",
    tr: "Yeni rehber: 45.000 EUR'dan Batum daireleri satın alma",
    ar: "دليل جديد: شراء شقق باتومي من 45,000 يورو",
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
  "Real Estate Investment",
  "Explore",
  "Batumi skyline and landmark towers",
  "Since 2009, AIXCO has bought, sold, and brokered real estate across Europe and the Gulf - today focused on Batumi, with a legacy track record in Switzerland and Dubai.",
  "AIXCO transaction backdrop",
  "Dubai - Legacy portfolio",
  "Legacy market - we are not opening new Dubai real estate offers. Below is a snapshot of delivered and in-progress real estate volume.",
  "Batumi - Current opportunity",
  "Opportunity-driven focus in Georgia - buy apartments with transparent euro pricing, strong rental potential, and full foreign ownership.",
  "Current project reference",
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
  "How it works",
  "Buy an apartment as the primary route, broker qualified buyers, or work with AIXCO on property administration after purchase.",
  "AIXCO - Real Estate Investment",
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
  "No. Approx. 10-12% net rental yields are scenario-based and depend on occupancy, market conditions, property management, project delivery, and external factors.",
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
  "Global opportunities",
  "Disciplined ownership of real assets, shaped by Swiss real estate heritage.",
  "AIXCO Global was built on disciplined real estate ownership, practical execution, and long-term property services.",
  "First acquisition",
  "Current GDV",
  "Transactions",
  "Value transacted",
  "Current gross development value",
  "Transactions completed",
  "Real estate transacted across markets",
  "Disciplined ownership",
  "Property administration",
  "Responsible risk assessment",
  "Long-term value creation",
  "The Philosophy section continues with the original ownership and risk-management detail, now split into readable in-page slides.",
  "AIXCO's philosophy closes with the platform, people, and principles behind the real estate service model.",
  "AIXCO's philosophy starts with wise selection: durable assets, disciplined risk assessment, and recurring income generation.",
  "AIXCO combines local market expertise with international experience to provide access to opportunities positioned for long-term growth and capital appreciation.",
  "A real estate foundation built on wise selection",
  "Since its first acquisition in 2009, the company has grown through carefully selected real estate decisions, building a portfolio defined by resilience, stability, and recurring income generation.",
  "Over the decades, AIXCO has evolved into a diversified international group combining Swiss real estate heritage with disciplined asset selection in emerging markets.",
  "A distinctly Swiss philosophy of managing risk",
  "At the core of AIXCO lies a distinctly Swiss philosophy of managing risk. AIXCO approaches real estate decisions with discipline, conservatism, and a long-term perspective, focusing on durable properties and practical operating fundamentals.",
  "Through carefully selected real estate purchases, sales, brokerage mandates, and property administration, AIXCO focuses on durable assets, practical risk assessment, and sustainable long-term growth.",
  "Expanding through carefully selected opportunities",
  "Built upon decades of market experience and responsible ownership, AIXCO continues to expand internationally through selected opportunities in Dubai and Georgia.",
  "Today, AIXCO manages projects representing more than $400 million in gross development value, supported by an international team of over 90 professionals and a global network of clients, brokers, developers, and partners.",
  "Today, AIXCO manages projects representing more than $400 million in gross development value, supported by an international team of over 90 professional and highly skilled employees and a global network of clients, brokers, developers, and partners.",
  "Professional and highly skilled employees",
  "Skilled employees",
  "AIXCO has completed more than 2,000 real estate transactions and transacted over $4.2 billion in property value across international markets.",
  "Integrity, stability, discipline, and responsible risk assessment",
  "Integrity, stability, discipline, and responsible risk assessment remain central to every aspect of our real estate practice.",
  "As AIXCO continues to grow internationally, its vision remains unchanged: to build a resilient real estate services - buy, broker, and manage property - rooted in Swiss heritage, disciplined execution, and enduring long-term value.",
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
  "Real Estate Investment": { de: "Immobilieninvestment" },
  Explore: { de: "Entdecken" },
  "Batumi apartments": { de: "Wohnungen in Batumi" },
  "Explore selected apartments and opportunity-driven real estate with the AIXCO team.": {
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
    de: "Verantwortungsvolles Eigentum an Sachwerten, geprägt durch Schweizer Praxis.",
  },
  "AIXCO Global was built on disciplined real estate ownership, practical execution, and long-term property services.": {
    de: "AIXCO Global basiert auf verantwortungsvoll bewirtschaftetem Immobilieneigentum, praktischer Umsetzung und langfristigen Immobiliendienstleistungen.",
  },
  "First acquisition": { de: "Erster Erwerb" },
  "Gross development value": { de: "Brutto-Entwicklungswert" },
  "Transactions completed": { de: "Abgeschlossene Transaktionen" },
  "Real estate transacted across markets": { de: "Immobilienwert über Märkte hinweg" },
  "Disciplined ownership": { de: "Verantwortungsvolles Eigentum" },
  "Property administration": { de: "Immobilienverwaltung" },
  "Responsible risk assessment": { de: "Verantwortungsvolle Risikoprüfung" },
  "Long-term value creation": { de: "Langfristige Wertschaffung" },
  ownership: { de: "Eigentum" },
  Risk: { de: "Risiko" },
  Platform: { de: "Plattform" },
  "Global opportunities": { de: "Globale Chancen" },
  "Swiss discipline in practice": { de: "Schweizer Disziplin in der Praxis" },
  "A real estate foundation built through ownership": { de: "Ein Immobilienfundament, aufgebaut durch Eigentum" },
  "AIXCO's philosophy starts with ownership: durable assets, conservative risk assessment, and recurring income generation.": {
    de: "Die Philosophie von AIXCO beginnt mit Eigentum: langlebige Sachwerte, umsichtige Risikoprüfung und wiederkehrende Erträge.",
  },
  "Since its first acquisition in 2009, the company has steadily expanded within the Swiss residential real estate market, developing a portfolio defined by resilience, stability, and recurring income generation.": {
    de: "Seit dem ersten Erwerb 2009 hat sich das Unternehmen im Schweizer Wohnimmobilienmarkt stetig ausgebaut - mit einem Portfolio aus Widerstandsfähigkeit, Stabilität und wiederkehrenden Erträgen.",
  },
  "Over the decades, AIXCO has evolved into a diversified international group combining Swiss real estate heritage with modern asset-backed acquisitions.": {
    de: "AIXCO ist zu einer internationalen Gruppe geworden, die Schweizer Immobilienerfahrung mit modernen sachwertbasierten Akquisitionen verbindet.",
  },
  "A distinctly Swiss philosophy of managing risk": { de: "Klare Schweizer Disziplin im Risikomanagement" },
  "At the core of AIXCO lies a distinctly Swiss philosophy of managing risk. AIXCO approaches real estate decisions with discipline, conservatism, and a long-term perspective, focusing on durable properties and practical operating fundamentals.": {
    de: "Im Kern von AIXCO steht eine klare Schweizer Risikodisziplin. Entscheidungen werden mit Konservatismus und langfristiger Perspektive getroffen - mit Fokus auf langlebige Immobilien und solide Betriebsgrundlagen.",
  },
  "Through carefully selected real estate purchases, sales, brokerage mandates, and property administration, AIXCO focuses on durable assets, practical risk assessment, and sustainable long-term growth.": {
    de: "Über ausgewählte Käufe, Verkäufe, Vermittlungsmandate und Verwaltung konzentriert sich AIXCO auf langlebige Sachwerte, praktische Risikoprüfung und nachhaltiges Wachstum.",
  },
  "Expanding through carefully selected opportunities": {
    de: "Expansion durch sorgfältig ausgewählte Chancen",
  },
  "AIXCO combines local market expertise with international experience to provide access to opportunities positioned for long-term growth and capital appreciation.": {
    de: "AIXCO verbindet lokale Marktexpertise mit internationaler Erfahrung, um Zugang zu Chancen zu bieten, die auf langfristiges Wachstum und Kapitalwertsteigerung ausgerichtet sind.",
  },
  "Built upon decades of market experience and responsible ownership, AIXCO continues to expand internationally through selected opportunities in Dubai and Georgia.": {
    de: "Aufbauend auf jahrzehntelanger Markterfahrung und verantwortungsvollem Eigentum expandiert AIXCO international weiter - über ausgewählte Chancen in Dubai und Georgien.",
  },
  "Today, AIXCO manages projects representing more than $400 million in gross development value, supported by an international team of over 90 professionals and a global network of clients, brokers, developers, and partners.": {
    de: "Heute betreut AIXCO Projekte mit einem Brutto-Entwicklungswert von mehr als 400 Millionen US-Dollar, getragen von einem internationalen Team aus über 90 Fachleuten und einem globalen Netzwerk aus Kunden, Maklern, Entwicklern und Partnern.",
  },
  "Today, AIXCO manages projects representing more than $400 million in gross development value, supported by an international team of over 90 professional and highly skilled employees and a global network of clients, brokers, developers, and partners.": {
    de: "Heute betreut AIXCO Projekte mit einem Brutto-Entwicklungswert von mehr als 400 Millionen US-Dollar, getragen von einem internationalen Team aus über 90 professionellen und hochqualifizierten Mitarbeitenden und einem globalen Netzwerk aus Kunden, Maklern, Entwicklern und Partnern.",
  },
  "Professional and highly skilled employees": {
    de: "Professionelle und hochqualifizierte Mitarbeitende",
  },
  "Skilled employees": {
    de: "Fachkräfte",
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
  "As AIXCO continues to grow internationally, its vision remains unchanged: to build a resilient real estate services - buy, broker, and manage property - rooted in Swiss heritage, disciplined execution, and enduring long-term value.": {
    de: "Während AIXCO international weiter wächst, bleibt die Vision unverändert: widerstandsfähige Immobiliendienstleistungen aufzubauen - Kaufen, Vermitteln und Verwalten - verwurzelt in Schweizer Herkunft, disziplinierter Umsetzung und dauerhaftem langfristigem Wert.",
  },
  "As AIXCO continues to grow internationally, its vision remains unchanged: to build resilient real estate services - buy, broker, and manage property - rooted in Swiss heritage, disciplined execution, and enduring long-term value.": {
    de: "Während AIXCO international weiter wächst, bleibt die Vision unverändert: widerstandsfähige Immobiliendienstleistungen aufzubauen - Kaufen, Vermitteln und Verwalten - verwurzelt in Schweizer Herkunft, disziplinierter Umsetzung und dauerhaftem langfristigem Wert.",
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
    de: "Unser Anspruch bleibt derselbe: transparente Beratung, langfristige Unterstützung und Zugang zu Chancen, die zu Ihren persönlichen Zielen passen.",
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
  "Entry from €45,000": { de: "Einstieg ab 45.000 EUR" },
  "Entry from â‚¬45,000": { de: "Einstieg ab 45.000 EUR" },
  "Bank financing minimum 60%": { de: "Bankfinanzierung mindestens 60%" },
  "Approx. 10-12% net rental yields": { de: "Ca. 10-12% Nettomietrendite" },
  "Bank financing minimum": { de: "Bankfinanzierung mindestens" },
  "Current project": { de: "Aktuelles Projekt" },
  "Ours: a current AIXCO residential project with selected apartments, structured buyer guidance, and completion targeted for June 2028.": {
    de: "Unser aktuelles AIXCO-Wohnprojekt mit ausgewählten Apartments, strukturierter Käuferbegleitung und geplanter Fertigstellung im Juni 2028.",
  },
  "Access": { de: "Zugang" },
  "AIXCO-managed buyer guidance, project information, and supporting materials available through the client route.": {
    de: "Von AIXCO betreute Käuferbegleitung, Projektinformationen und Begleitmaterialien über den Kundenweg.",
  },
  "Full commission payable from only a 10% down payment": { de: "Volle Provision bereits ab 10% Anzahlung zahlbar" },
  "0% capital gains tax after 2 years of ownership": { de: "0% Kapitalertragsteuer nach 2 Jahren Eigentum" },
  "1% tax on rental income": { de: "1% Steuer auf Mieteinnahmen" },
  "Full transparency through an ISO-certified system": { de: "Volle Transparenz durch ein ISO-zertifiziertes System" },
  "Prime apartments from our own stock at the best available prices": {
    de: "Prime-Apartments aus eigenem Bestand zu den besten verfügbaren Preisen",
  },
  "Selected Batumi projects and apartments through AIXCO, with entry from €45,000, 100% foreign ownership, bank financing options, and transparent ISO-certified process.": {
    de: "Ausgewählte Batumi-Projekte und Apartments über AIXCO, mit Einstieg ab 45.000 EUR, 100% ausländischem Eigentum, Bankfinanzierungsoptionen und transparentem ISO-zertifiziertem Prozess.",
  },
  "Selected Batumi property opportunity": { de: "Ausgewählte Immobilienchance in Batumi" },
  "Client materials": { de: "Kundenmaterialien" },
  "Materials & downloads": { de: "Materialien & Downloads" },
  "Download brochures, catalog sheets, and property reference files for the real estate routes shown on this page.": {
    de: "Laden Sie Broschüren, Katalogblätter und Immobilienreferenzen für die auf dieser Seite gezeigten Immobilienwege herunter.",
  },
  "Available files": { de: "Verfügbare Dateien" },
  Audience: { de: "Zielgruppe" },
  Download: { de: "Herunterladen" },
  "Client brochure": { de: "Kundenbroschüre" },
  "AIXCO client brochure": { de: "AIXCO-Kundenbroschüre" },
  "Download the AIXCO client brochure with the real estate investment overview and opportunity details.": {
    de: "Laden Sie die AIXCO-Kundenbroschüre mit dem Immobilieninvestment-Überblick und Details zu den Chancen herunter.",
  },
  "Batumi project brochure": { de: "Batumi-Projektbroschüre" },
  "Current project brochure": { de: "Broschüre zum aktuellen Projekt" },
  "Current AIXCO project PDF for clients comparing selected apartment options.": {
    de: "Aktuelle AIXCO-Projekt-PDF für Kunden, die ausgewählte Apartmentoptionen vergleichen.",
  },
  "Catalog sheet": { de: "Katalogblatt" },
  "Current project catalog sheet": { de: "Katalogblatt zum aktuellen Projekt" },
  "High-resolution current project catalog image for quick sharing and offline review.": {
    de: "Hochaufgelöstes Katalogbild des aktuellen Projekts für schnelle Weitergabe und Offline-Prüfung.",
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
  "How it works": { de: "Zusammenarbeit mit Kunden und Partnern" },
  "How How it works": { de: "So arbeiten Kunden und Partner mit AIXCO" },
  "Buy an apartment as the primary route, broker qualified buyers, or work with AIXCO on property administration after purchase.": {
    de: "Kaufen Sie als Hauptweg ein Apartment in Batumi, vermitteln Sie qualifizierte Käufer oder arbeiten Sie nach dem Kauf mit AIXCO bei der Immobilienverwaltung zusammen.",
  },
  "Buy an Apartment in Batumi": { de: "Apartment in Batumi kaufen" },
  "Customers sign up, review selected Batumi apartments, book a private tour, and move through reservation and purchase with the AIXCO team.": {
    de: "Kunden registrieren sich, prüfen ausgewählte Apartments in Batumi, buchen eine private Besichtigung und durchlaufen Reservierung und Kauf mit dem AIXCO-Team.",
  },
  "Buy an Apartment with AIXCO": { de: "Apartment mit AIXCO kaufen" },
  "Customers sign up, review selected apartments, book a private tour, and move through reservation and purchase with the AIXCO team.": {
    de: "Kunden registrieren sich, prüfen ausgewählte Apartments, buchen eine private Besichtigung und durchlaufen Reservierung und Kauf mit dem AIXCO-Team.",
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
    de: "Wählen Sie den Ablauf, der optimal auf Ihre Rolle zugeschnitten ist. Der Prozess ist strukturiert, transparent und digital gesteuert.",
  },
  "Choose the journey that fits your role. Whether you are buying property, brokering clients, administering a unit, or bringing projects to market, the process is structured, transparent, and digitally managed.": {
    de: "Wählen Sie den Ablauf, der optimal auf Ihre Rolle zugeschnitten ist. Ob Sie Immobilien kaufen, Kunden vermitteln, eine Einheit verwalten oder Projekte in den Markt bringen - der Prozess ist strukturiert, transparent und digital gesteuert.",
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
    de: "Für Entwickler, die Projektpräsenz, Käuferzugang, Terminmanagement und einen stärkeren Immobilienvertriebskanal suchen.",
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
  "Entry starts from €45,000 for selected Batumi projects and apartments available exclusively through AIXCO. Full commission can be payable from only a 10% down payment, with final terms depending on project and agreement.": {
    de: "Der Einstieg beginnt ab 45.000 EUR für ausgewählte Batumi-Projekte und Apartments, die exklusiv über AIXCO verfügbar sind. Die volle Provision kann bereits ab 10% Anzahlung zahlbar sein; die endgültigen Bedingungen hängen von Projekt und Vereinbarung ab.",
  },
  "Can I buy property directly?": { de: "Kann ich direkt eine Immobilie kaufen?" },
  "Yes. Customers may pursue direct apartment purchase, brokerage support, or property administration.": {
    de: "Ja. Kunden können einen direkten Apartmentkauf, Maklerunterstützung oder Immobilienverwaltung nutzen.",
  },
  "Is rental income guaranteed?": { de: "Sind Mieteinnahmen garantiert?" },
  "No. Approx. 10-12% net rental yields are scenario-based and depend on occupancy, market conditions, property management, project delivery, and external factors.": {
    de: "Nein. Ca. 10-12% Nettomietrendite ist szenariobasiert und hängt von Auslastung, Marktbedingungen, Immobilienverwaltung, Projektfertigstellung und externen Faktoren ab.",
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
  "Yes. AIXCO.Global is presented first as a real estate services company for buying, brokering, and administering property. Separate company-financing information may be available on request from the AIXCO team; it is not a primary website journey and no bond terms are promoted on this page.": {
    de: "Ja. AIXCO.Global wird zuerst als Immobiliendienstleister für Kauf, Vermittlung und Verwaltung dargestellt. Separate Informationen zur Unternehmensfinanzierung können auf Anfrage beim AIXCO-Team verfügbar sein; dies ist kein primärer Website-Ablauf und auf dieser Seite werden keine Bond-Konditionen beworben.",
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
  "Our current AIXCO residential project includes selected apartments, structured buyer guidance, and completion targeted for June 2028.": {
    de: "Unser aktuelles AIXCO-Wohnprojekt umfasst ausgewählte Apartments, strukturierte Käuferbegleitung und eine geplante Fertigstellung im Juni 2028.",
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
  "Selected projects and apartments available exclusively through AIXCO Entry from €45,000 Prime apartments from our own stock at the best available prices": {
    de: "Ausgewählte Projekte und Apartments exklusiv über AIXCO verfügbar. Einstieg ab 45.000 EUR. Prime-Apartments aus eigenem Bestand zu den besten verfügbaren Preisen.",
  },
  "Selected projects and apartments available exclusively through AIXCO Entry from â‚¬45,000 Prime apartments from our own stock at the best available prices": {
    de: "Ausgewählte Projekte und Apartments exklusiv über AIXCO verfügbar. Einstieg ab 45.000 EUR. Prime-Apartments aus eigenem Bestand zu den besten verfügbaren Preisen.",
  },
  "100% foreign ownership No residency permit required": {
    de: "100% ausländisches Eigentum. Keine Aufenthaltsgenehmigung erforderlich.",
  },
  "Bank financing minimum 60% Full commission payable from only a 10% down payment": {
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
  "Confirm service scope": { de: "Serviceumfang bestätigen" },
  "Upload documents": { de: "Dokumente hochladen" },
  "Coordinate handover": { de: "Übergabe koordinieren" },
  "Manage updates": { de: "Updates verwalten" },
  "Review reporting": { de: "Reporting prüfen" },
  "Prepare the listing": { de: "Listing vorbereiten" },
  "Ongoing coordination": { de: "Laufende Koordination" },
};

const baseCatalogSources: TranslationSource[] = [
  germanTranslationFixes,
  localeTranslationFixes,
  localePassthroughFixes,
  polishTranslations,
  polishTranslationsExtra,
  polishTranslationsFinal,
  polishRuntimeTranslations,
  polishContentTranslations,
  curatedVisibleTranslations,
  propertyPageTranslations,
  germanQualityTranslations,
  supplementalTranslations,
  clientBriefPassthroughTranslations,
];

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
        germanTranslationFixes,
        localeTranslationFixes,
        localePassthroughFixes,
        polishTranslations,
        polishTranslationsExtra,
        polishTranslationsFinal,
        polishRuntimeTranslations,
        polishContentTranslations,
        curatedVisibleTranslations,
        propertyPageTranslations,
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
  const [hasLoadedStoredLang, setHasLoadedStoredLang] = useState(false);
  const [translationCatalogs, setTranslationCatalogs] = useState<LoadedTranslationCatalogs | null>(null);
  const dir = lang === "ar" ? "rtl" : "ltr";
  const activeCatalogSources = translationCatalogs?.sources ?? baseCatalogSources;
  const translationLookupCache = useMemo(() => ({
    lang,
    sources: activeCatalogSources,
    entries: new Map<string, string>(),
  }), [activeCatalogSources, lang]);

  useEffect(() => {
    const storedLang = readStoredLang();
    setLang((currentLang) => (currentLang === storedLang ? currentLang : storedLang));
    setHasLoadedStoredLang(true);
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
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    if (hasLoadedStoredLang) {
      try {
        localStorage.setItem("aixco-lang", lang);
      } catch {
        // Language persistence is optional when browser storage is unavailable.
      }
    }
  }, [lang, dir, hasLoadedStoredLang]);

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
