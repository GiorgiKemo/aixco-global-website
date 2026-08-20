"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronLeft,
  ChevronRight,
  Expand,
  Globe2,
  KeyRound,
  Menu,
  Scale,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { LANGS, useI18n } from "@/i18n/I18nProvider";
import type { Lang } from "@/i18n/languages";
import { useSiteContent } from "@/data/site-content-context";
import { useUI } from "@/components/ui-state";
import { openAnalyticsPreferences } from "@/lib/analytics/client";
import { recordContactSubmission } from "@/lib/backend/lead-capture";
import { aixcoLiveLogos } from "@/lib/aixco-live-assets";
import { scrollToHash } from "@/lib/smooth-scroll";
import styles from "./InvestBatumiLandingPage.module.css";

type Lens = "lifestyle" | "income" | "longTerm";

type LandingCopy = {
  metaTitle: string;
  metaDescription: string;
  nav: { opportunity: string; batumi: string; approach: string; gallery: string; contact: string };
  requestBrief: string;
  menu: string;
  closeMenu: string;
  language: string;
  hero: {
    eyebrow: string;
    title: string;
    accent: string;
    body: string;
    cta: string;
    location: string;
    service: string;
  };
  lens: {
    label: string;
    lifestyle: { title: string; body: string };
    income: { title: string; body: string };
    longTerm: { title: string; body: string };
  };
  batumi: { eyebrow: string; title: string; body: string; cta: string };
  process: {
    eyebrow: string;
    title: string;
    body: string;
    steps: Array<{ title: string; body: string }>;
    cta: string;
  };
  gallery: { eyebrow: string; title: string; expand: string; close: string; previous: string; next: string; captions: string[] };
  guidance: {
    eyebrow: string;
    title: string;
    body: string;
    features: Array<{ title: string; body: string }>;
  };
  contact: {
    eyebrow: string;
    title: string;
    body: string;
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    interest: string;
    interests: string[];
    message: string;
    messagePlaceholder: string;
    consent: string;
    send: string;
    sending: string;
    successTitle: string;
    successBody: string;
    reference: string;
    another: string;
    error: string;
  };
  footer: { home: string; privacy: string; terms: string; cookies: string; rights: string };
};

const copy: Record<Lang, LandingCopy> = {
  en: {
    metaTitle: "Invest in Batumi Property | AIXCO.Global",
    metaDescription: "Explore selected Batumi property opportunities with AIXCO.Global, transparent guidance and local support from first shortlist to ownership.",
    nav: { opportunity: "Opportunity", batumi: "Why Batumi", approach: "The AIXCO way", gallery: "Gallery", contact: "Contact" },
    requestBrief: "Request a brief",
    menu: "Open menu",
    closeMenu: "Close menu",
    language: "Language",
    hero: {
      eyebrow: "International buyers · Batumi, Georgia",
      title: "See Batumi",
      accent: "differently.",
      body: "Selected property opportunities. Transparent euro pricing. Local expertise from first comparison to ownership.",
      cta: "Build my property shortlist",
      location: "Black Sea coast · Georgia",
      service: "AIXCO buyer advisory",
    },
    lens: {
      label: "Choose your buyer lens",
      lifestyle: { title: "Lifestyle", body: "A compact coastal city where sea, mountains and year-round urban life meet." },
      income: { title: "Income", body: "Compare professionally selected opportunities with clear costs, positioning and management options." },
      longTerm: { title: "Long-term value", body: "Build a considered property strategy around location quality, delivery and future usability." },
    },
    batumi: {
      eyebrow: "The place",
      title: "The Black Sea. Modern energy. Real potential.",
      body: "Batumi combines a distinctive waterfront, ambitious new architecture and direct access to Georgia's natural landscape. AIXCO helps international buyers understand the city street by street and project by project.",
      cta: "Start with the right questions",
    },
    process: {
      eyebrow: "The AIXCO way",
      title: "From interest to ownership.",
      body: "One accountable team helps you compare the details that matter and keeps the process clear at every stage.",
      steps: [
        { title: "Discover", body: "We clarify your objective, budget and preferred property profile." },
        { title: "Compare", body: "You receive a focused shortlist with transparent context and trade-offs." },
        { title: "Secure", body: "We coordinate documentation, due diligence and the purchase process." },
        { title: "Manage", body: "After purchase, we remain available for handover and ownership support." },
      ],
      cta: "Talk to an AIXCO advisor",
    },
    gallery: {
      eyebrow: "Batumi, up close",
      title: "A city with many perspectives.",
      expand: "Expand gallery",
      close: "Close gallery",
      previous: "Previous image",
      next: "Next image",
      captions: ["Batumi at golden hour", "The Black Sea waterfront", "Contemporary Batumi architecture", "Selected residential design", "Private resident amenities"],
    },
    guidance: {
      eyebrow: "Guidance without guesswork",
      title: "Clarity before commitment.",
      body: "AIXCO combines local property knowledge with an international buyer's perspective. We explain the practical details, disclose what is known and help you compare like with like.",
      features: [
        { title: "A focused shortlist", body: "Relevant options selected around your goal—not an overwhelming catalogue." },
        { title: "Transparent comparison", body: "Clear context on pricing, location, delivery stage and the ownership process." },
        { title: "One point of contact", body: "A consistent advisor from first conversation through the next practical step." },
      ],
    },
    contact: {
      eyebrow: "Your Batumi brief",
      title: "Tell us what you are looking for.",
      body: "Share your priorities and an AIXCO advisor will respond with the most relevant next step.",
      name: "Full name",
      namePlaceholder: "Your name",
      email: "Email address",
      emailPlaceholder: "you@email.com",
      interest: "Primary goal",
      interests: ["Lifestyle property", "Income-focused property", "Long-term property", "Not sure yet"],
      message: "What matters most?",
      messagePlaceholder: "Tell us your preferred budget, timeline or property type.",
      consent: "By sending this form, you agree that AIXCO may contact you about your request.",
      send: "Request my shortlist",
      sending: "Sending…",
      successTitle: "Your request is with us.",
      successBody: "An AIXCO advisor will review your brief and contact you shortly.",
      reference: "Reference",
      another: "Send another request",
      error: "We could not send your request. Please try again or email info@aixco.global.",
    },
    footer: { home: "Main website", privacy: "Privacy", terms: "Terms", cookies: "Cookie preferences", rights: "All rights reserved." },
  },
  de: {
    metaTitle: "Immobilien in Batumi kaufen | AIXCO.Global",
    metaDescription: "Entdecken Sie ausgewählte Immobilienchancen in Batumi mit transparenter Beratung und lokaler Begleitung von der Vorauswahl bis zum Eigentum.",
    nav: { opportunity: "Chance", batumi: "Warum Batumi", approach: "Der AIXCO Weg", gallery: "Galerie", contact: "Kontakt" },
    requestBrief: "Briefing anfordern",
    menu: "Menü öffnen",
    closeMenu: "Menü schließen",
    language: "Sprache",
    hero: {
      eyebrow: "Internationale Käufer · Batumi, Georgien",
      title: "Batumi neu",
      accent: "entdecken.",
      body: "Ausgewählte Immobilienchancen. Transparente Euro-Preise. Lokale Expertise vom ersten Vergleich bis zum Eigentum.",
      cta: "Meine Auswahl erstellen",
      location: "Schwarzmeerküste · Georgien",
      service: "AIXCO Käuferberatung",
    },
    lens: {
      label: "Wählen Sie Ihre Perspektive",
      lifestyle: { title: "Lebensstil", body: "Eine kompakte Küstenstadt, in der Meer, Berge und urbanes Leben das ganze Jahr zusammenkommen." },
      income: { title: "Ertrag", body: "Vergleichen Sie professionell ausgewählte Chancen mit klaren Kosten, Positionierung und Verwaltungsoptionen." },
      longTerm: { title: "Langfristiger Wert", body: "Entwickeln Sie eine durchdachte Immobilienstrategie rund um Lage, Fertigstellung und künftige Nutzung." },
    },
    batumi: {
      eyebrow: "Der Ort",
      title: "Das Schwarze Meer. Moderne Energie. Echtes Potenzial.",
      body: "Batumi verbindet eine markante Uferpromenade, ambitionierte neue Architektur und direkten Zugang zu Georgiens Natur. AIXCO hilft internationalen Käufern, die Stadt Straße für Straße und Projekt für Projekt zu verstehen.",
      cta: "Mit den richtigen Fragen beginnen",
    },
    process: {
      eyebrow: "Der AIXCO Weg",
      title: "Vom Interesse zum Eigentum.",
      body: "Ein verantwortliches Team hilft Ihnen, die entscheidenden Details zu vergleichen und hält jeden Schritt verständlich.",
      steps: [
        { title: "Entdecken", body: "Wir klären Ziel, Budget und Ihr bevorzugtes Immobilienprofil." },
        { title: "Vergleichen", body: "Sie erhalten eine fokussierte Auswahl mit transparentem Kontext und Abwägungen." },
        { title: "Sichern", body: "Wir koordinieren Unterlagen, Prüfung und Kaufprozess." },
        { title: "Verwalten", body: "Nach dem Kauf begleiten wir Übergabe und Eigentumsfragen weiter." },
      ],
      cta: "Mit AIXCO sprechen",
    },
    gallery: {
      eyebrow: "Batumi aus der Nähe",
      title: "Eine Stadt mit vielen Perspektiven.",
      expand: "Galerie vergrößern",
      close: "Galerie schließen",
      previous: "Vorheriges Bild",
      next: "Nächstes Bild",
      captions: ["Batumi zur goldenen Stunde", "Die Schwarzmeerküste", "Zeitgenössische Architektur in Batumi", "Ausgewähltes Wohndesign", "Private Annehmlichkeiten"],
    },
    guidance: {
      eyebrow: "Beratung ohne Rätselraten",
      title: "Klarheit vor der Entscheidung.",
      body: "AIXCO verbindet lokale Immobilienkenntnis mit der Perspektive internationaler Käufer. Wir erklären praktische Details, legen Bekanntes offen und schaffen echte Vergleichbarkeit.",
      features: [
        { title: "Eine fokussierte Auswahl", body: "Passende Optionen rund um Ihr Ziel statt eines unübersichtlichen Katalogs." },
        { title: "Transparenter Vergleich", body: "Klarer Kontext zu Preis, Lage, Bauphase und Eigentumsprozess." },
        { title: "Ein Ansprechpartner", body: "Ein verlässlicher Berater vom ersten Gespräch bis zum nächsten praktischen Schritt." },
      ],
    },
    contact: {
      eyebrow: "Ihr Batumi-Briefing",
      title: "Sagen Sie uns, wonach Sie suchen.",
      body: "Teilen Sie Ihre Prioritäten. Ein AIXCO-Berater antwortet mit dem sinnvollsten nächsten Schritt.",
      name: "Vollständiger Name",
      namePlaceholder: "Ihr Name",
      email: "E-Mail-Adresse",
      emailPlaceholder: "sie@email.de",
      interest: "Hauptziel",
      interests: ["Immobilie zur Eigennutzung", "Ertragsorientierte Immobilie", "Langfristige Immobilie", "Noch nicht sicher"],
      message: "Was ist Ihnen wichtig?",
      messagePlaceholder: "Nennen Sie uns Budget, Zeitrahmen oder gewünschten Immobilientyp.",
      consent: "Mit dem Absenden stimmen Sie zu, dass AIXCO Sie zu Ihrer Anfrage kontaktieren darf.",
      send: "Meine Auswahl anfordern",
      sending: "Wird gesendet…",
      successTitle: "Ihre Anfrage ist eingegangen.",
      successBody: "Ein AIXCO-Berater prüft Ihr Briefing und meldet sich in Kürze.",
      reference: "Referenz",
      another: "Weitere Anfrage senden",
      error: "Ihre Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie an info@aixco.global.",
    },
    footer: { home: "Hauptwebsite", privacy: "Datenschutz", terms: "Bedingungen", cookies: "Cookie-Einstellungen", rights: "Alle Rechte vorbehalten." },
  },
  pl: {
    metaTitle: "Nieruchomości w Batumi | AIXCO.Global",
    metaDescription: "Poznaj wybrane możliwości zakupu nieruchomości w Batumi z przejrzystym doradztwem i lokalnym wsparciem od pierwszej selekcji po własność.",
    nav: { opportunity: "Możliwości", batumi: "Dlaczego Batumi", approach: "Sposób AIXCO", gallery: "Galeria", contact: "Kontakt" },
    requestBrief: "Poproś o zestawienie",
    menu: "Otwórz menu",
    closeMenu: "Zamknij menu",
    language: "Język",
    hero: {
      eyebrow: "Kupujący międzynarodowi · Batumi, Gruzja",
      title: "Spójrz na Batumi",
      accent: "inaczej.",
      body: "Wybrane możliwości. Przejrzyste ceny w euro. Lokalna wiedza od pierwszego porównania aż po własność.",
      cta: "Stwórz moją krótką listę",
      location: "Wybrzeże Morza Czarnego · Gruzja",
      service: "Doradztwo AIXCO dla kupujących",
    },
    lens: {
      label: "Wybierz swoją perspektywę",
      lifestyle: { title: "Styl życia", body: "Kompaktowe nadmorskie miasto, gdzie morze, góry i całoroczne życie miejskie spotykają się w jednym miejscu." },
      income: { title: "Dochód", body: "Porównaj profesjonalnie wybrane możliwości z jasnymi kosztami, pozycjonowaniem i opcjami zarządzania." },
      longTerm: { title: "Wartość długoterminowa", body: "Buduj przemyślaną strategię opartą na jakości lokalizacji, realizacji i przyszłym sposobie użytkowania." },
    },
    batumi: {
      eyebrow: "To miejsce",
      title: "Morze Czarne. Nowoczesna energia. Realny potencjał.",
      body: "Batumi łączy charakterystyczne wybrzeże, ambitną nową architekturę i bezpośredni dostęp do gruzińskiej przyrody. AIXCO pomaga międzynarodowym kupującym poznać miasto ulica po ulicy i projekt po projekcie.",
      cta: "Zacznij od właściwych pytań",
    },
    process: {
      eyebrow: "Sposób AIXCO",
      title: "Od zainteresowania do własności.",
      body: "Jeden odpowiedzialny zespół pomaga porównać istotne szczegóły i utrzymuje przejrzystość na każdym etapie.",
      steps: [
        { title: "Poznaj", body: "Ustalamy Twój cel, budżet i preferowany profil nieruchomości." },
        { title: "Porównaj", body: "Otrzymujesz skupioną listę z jasnym kontekstem i kompromisami." },
        { title: "Zabezpiecz", body: "Koordynujemy dokumenty, weryfikację i proces zakupu." },
        { title: "Zarządzaj", body: "Po zakupie wspieramy odbiór i dalsze kwestie właścicielskie." },
      ],
      cta: "Porozmawiaj z doradcą AIXCO",
    },
    gallery: {
      eyebrow: "Batumi z bliska",
      title: "Miasto z wielu perspektyw.",
      expand: "Powiększ galerię",
      close: "Zamknij galerię",
      previous: "Poprzednie zdjęcie",
      next: "Następne zdjęcie",
      captions: ["Batumi o złotej godzinie", "Wybrzeże Morza Czarnego", "Współczesna architektura Batumi", "Wybrane wnętrza mieszkalne", "Prywatne udogodnienia dla mieszkańców"],
    },
    guidance: {
      eyebrow: "Doradztwo bez zgadywania",
      title: "Jasność przed decyzją.",
      body: "AIXCO łączy lokalną wiedzę o rynku z perspektywą międzynarodowego kupującego. Wyjaśniamy praktyczne szczegóły, ujawniamy znane informacje i pomagamy porównywać podobne oferty.",
      features: [
        { title: "Skupiona lista", body: "Opcje dobrane do Twojego celu zamiast przytłaczającego katalogu." },
        { title: "Przejrzyste porównanie", body: "Jasny kontekst cen, lokalizacji, etapu realizacji i procesu zakupu." },
        { title: "Jeden kontakt", body: "Stały doradca od pierwszej rozmowy do kolejnego praktycznego kroku." },
      ],
    },
    contact: {
      eyebrow: "Twoje założenia dla Batumi",
      title: "Powiedz nam, czego szukasz.",
      body: "Podziel się priorytetami, a doradca AIXCO odpowie z najbardziej odpowiednim kolejnym krokiem.",
      name: "Imię i nazwisko",
      namePlaceholder: "Twoje imię i nazwisko",
      email: "Adres e-mail",
      emailPlaceholder: "ty@email.pl",
      interest: "Główny cel",
      interests: ["Nieruchomość do życia", "Nieruchomość dochodowa", "Nieruchomość długoterminowa", "Jeszcze nie wiem"],
      message: "Co jest najważniejsze?",
      messagePlaceholder: "Podaj preferowany budżet, termin lub typ nieruchomości.",
      consent: "Wysyłając formularz, zgadzasz się na kontakt AIXCO w sprawie Twojego zapytania.",
      send: "Poproś o moją listę",
      sending: "Wysyłanie…",
      successTitle: "Otrzymaliśmy Twoje zapytanie.",
      successBody: "Doradca AIXCO przeanalizuje informacje i wkrótce się skontaktuje.",
      reference: "Numer referencyjny",
      another: "Wyślij kolejne zapytanie",
      error: "Nie udało się wysłać zapytania. Spróbuj ponownie lub napisz na info@aixco.global.",
    },
    footer: { home: "Strona główna", privacy: "Prywatność", terms: "Warunki", cookies: "Ustawienia cookies", rights: "Wszelkie prawa zastrzeżone." },
  },
  sl: {
    metaTitle: "Nepremičnine v Batumiju | AIXCO.Global",
    metaDescription: "Odkrijte izbrane nepremičninske priložnosti v Batumiju s preglednim svetovanjem in lokalno podporo od prvega izbora do lastništva.",
    nav: { opportunity: "Priložnost", batumi: "Zakaj Batumi", approach: "Način AIXCO", gallery: "Galerija", contact: "Kontakt" },
    requestBrief: "Zahtevajte pregled",
    menu: "Odpri meni",
    closeMenu: "Zapri meni",
    language: "Jezik",
    hero: {
      eyebrow: "Mednarodni kupci · Batumi, Gruzija",
      title: "Poglejte Batumi",
      accent: "drugače.",
      body: "Izbrane nepremičninske priložnosti. Pregledne cene v evrih. Lokalno znanje od prve primerjave do lastništva.",
      cta: "Pripravite moj ožji izbor",
      location: "Črnomorska obala · Gruzija",
      service: "Svetovanje AIXCO za kupce",
    },
    lens: {
      label: "Izberite svoj pogled",
      lifestyle: { title: "Življenjski slog", body: "Strnjeno obmorsko mesto, kjer se srečajo morje, gore in živahno celoletno urbano življenje." },
      income: { title: "Donos", body: "Primerjajte strokovno izbrane priložnosti z jasnimi stroški, umestitvijo in možnostmi upravljanja." },
      longTerm: { title: "Dolgoročna vrednost", body: "Oblikujte premišljeno strategijo glede na kakovost lokacije, izvedbo in prihodnjo uporabnost." },
    },
    batumi: {
      eyebrow: "Kraj",
      title: "Črno morje. Sodobna energija. Resničen potencial.",
      body: "Batumi združuje prepoznavno obalo, ambiciozno novo arhitekturo in neposreden dostop do gruzijske narave. AIXCO mednarodnim kupcem pomaga razumeti mesto ulico za ulico in projekt za projektom.",
      cta: "Začnite s pravimi vprašanji",
    },
    process: {
      eyebrow: "Način AIXCO",
      title: "Od zanimanja do lastništva.",
      body: "Ena odgovorna ekipa vam pomaga primerjati pomembne podrobnosti in ohranja jasnost na vsakem koraku.",
      steps: [
        { title: "Odkrijte", body: "Opredelimo vaš cilj, proračun in želeni profil nepremičnine." },
        { title: "Primerjajte", body: "Prejmete osredotočen izbor s preglednim kontekstom in kompromisi." },
        { title: "Zavarujte", body: "Uskladimo dokumentacijo, skrbni pregled in postopek nakupa." },
        { title: "Upravljajte", body: "Po nakupu ostanemo na voljo za prevzem in podporo lastniku." },
      ],
      cta: "Pogovorite se s svetovalcem AIXCO",
    },
    gallery: {
      eyebrow: "Batumi od blizu",
      title: "Mesto iz številnih perspektiv.",
      expand: "Razširi galerijo",
      close: "Zapri galerijo",
      previous: "Prejšnja slika",
      next: "Naslednja slika",
      captions: ["Batumi v zlati svetlobi", "Obala Črnega morja", "Sodobna arhitektura Batumija", "Izbrana stanovanjska zasnova", "Zasebne vsebine za stanovalce"],
    },
    guidance: {
      eyebrow: "Svetovanje brez ugibanja",
      title: "Jasnost pred odločitvijo.",
      body: "AIXCO združuje lokalno poznavanje nepremičnin s pogledom mednarodnega kupca. Razložimo praktične podrobnosti, jasno navedemo znana dejstva in omogočimo pošteno primerjavo.",
      features: [
        { title: "Osredotočen izbor", body: "Ustrezne možnosti glede na vaš cilj, ne nepregleden katalog." },
        { title: "Pregledna primerjava", body: "Jasen kontekst cen, lokacije, faze izvedbe in postopka lastništva." },
        { title: "Ena kontaktna oseba", body: "Stalen svetovalec od prvega pogovora do naslednjega praktičnega koraka." },
      ],
    },
    contact: {
      eyebrow: "Vaše izhodišče za Batumi",
      title: "Povejte nam, kaj iščete.",
      body: "Zaupajte nam svoje prednostne naloge in svetovalec AIXCO vam bo predlagal najprimernejši naslednji korak.",
      name: "Ime in priimek",
      namePlaceholder: "Vaše ime",
      email: "E-poštni naslov",
      emailPlaceholder: "vi@email.si",
      interest: "Glavni cilj",
      interests: ["Nepremičnina za bivanje", "Nepremičnina za donos", "Dolgoročna nepremičnina", "Še nisem prepričan/a"],
      message: "Kaj vam je najpomembnejše?",
      messagePlaceholder: "Navedite želeni proračun, časovnico ali vrsto nepremičnine.",
      consent: "Z oddajo obrazca soglašate, da vas AIXCO kontaktira glede vašega povpraševanja.",
      send: "Zahtevajte moj izbor",
      sending: "Pošiljanje…",
      successTitle: "Vaše povpraševanje smo prejeli.",
      successBody: "Svetovalec AIXCO bo pregledal podatke in vas kmalu kontaktiral.",
      reference: "Referenca",
      another: "Pošlji novo povpraševanje",
      error: "Povpraševanja ni bilo mogoče poslati. Poskusite znova ali pišite na info@aixco.global.",
    },
    footer: { home: "Glavna spletna stran", privacy: "Zasebnost", terms: "Pogoji", cookies: "Nastavitve piškotkov", rights: "Vse pravice pridržane." },
  },
  ru: {
    metaTitle: "Недвижимость в Батуми | AIXCO.Global",
    metaDescription: "Изучите отобранные объекты недвижимости в Батуми с прозрачным сопровождением и местной экспертизой — от первой подборки до оформления собственности.",
    nav: { opportunity: "Возможности", batumi: "Почему Батуми", approach: "Подход AIXCO", gallery: "Галерея", contact: "Контакты" },
    requestBrief: "Получить подборку",
    menu: "Открыть меню",
    closeMenu: "Закрыть меню",
    language: "Язык",
    hero: {
      eyebrow: "Для международных покупателей · Батуми, Грузия",
      title: "Взгляните на Батуми",
      accent: "по-новому.",
      body: "Отобранные возможности. Прозрачные цены в евро. Местная экспертиза — от первого сравнения до оформления собственности.",
      cta: "Составить мою подборку",
      location: "Побережье Чёрного моря · Грузия",
      service: "Консультации AIXCO для покупателей",
    },
    lens: {
      label: "Выберите свою цель",
      lifestyle: { title: "Образ жизни", body: "Компактный приморский город, где море, горы и насыщенная городская жизнь соединяются круглый год." },
      income: { title: "Доход", body: "Сравнивайте профессионально отобранные варианты с понятными расходами, позиционированием и возможностями управления." },
      longTerm: { title: "Долгосрочная ценность", body: "Выстраивайте взвешенную стратегию с учётом качества локации, реализации и будущего использования." },
    },
    batumi: {
      eyebrow: "Место",
      title: "Чёрное море. Современная энергия. Реальный потенциал.",
      body: "Батуми объединяет узнаваемую набережную, амбициозную новую архитектуру и близость к природе Грузии. AIXCO помогает международным покупателям понять город — улица за улицей, проект за проектом.",
      cta: "Начать с правильных вопросов",
    },
    process: {
      eyebrow: "Подход AIXCO",
      title: "От интереса к собственности.",
      body: "Одна ответственная команда помогает сравнивать важные детали и сохраняет прозрачность на каждом этапе.",
      steps: [
        { title: "Определить", body: "Мы уточняем вашу цель, бюджет и предпочтительный тип недвижимости." },
        { title: "Сравнить", body: "Вы получаете сфокусированную подборку с понятным контекстом и компромиссами." },
        { title: "Оформить", body: "Мы координируем документы, проверку и процесс покупки." },
        { title: "Управлять", body: "После покупки мы остаёмся на связи по вопросам приёмки и владения." },
      ],
      cta: "Поговорить с консультантом AIXCO",
    },
    gallery: {
      eyebrow: "Батуми в деталях",
      title: "Город с разных ракурсов.",
      expand: "Открыть галерею",
      close: "Закрыть галерею",
      previous: "Предыдущее изображение",
      next: "Следующее изображение",
      captions: ["Батуми в золотой час", "Побережье Чёрного моря", "Современная архитектура Батуми", "Отобранный жилой дизайн", "Приватная инфраструктура для жителей"],
    },
    guidance: {
      eyebrow: "Консультация без догадок",
      title: "Ясность до принятия решения.",
      body: "AIXCO сочетает знание местного рынка с пониманием задач международного покупателя. Мы объясняем практические детали, открыто сообщаем известные факты и помогаем корректно сравнивать варианты.",
      features: [
        { title: "Сфокусированная подборка", body: "Подходящие варианты под вашу цель вместо перегруженного каталога." },
        { title: "Прозрачное сравнение", body: "Понятный контекст цены, локации, стадии реализации и процесса оформления." },
        { title: "Один контакт", body: "Постоянный консультант от первого разговора до следующего практического шага." },
      ],
    },
    contact: {
      eyebrow: "Ваш запрос по Батуми",
      title: "Расскажите, что вы ищете.",
      body: "Поделитесь приоритетами, и консультант AIXCO предложит наиболее подходящий следующий шаг.",
      name: "Имя и фамилия",
      namePlaceholder: "Ваше имя",
      email: "Электронная почта",
      emailPlaceholder: "you@email.com",
      interest: "Основная цель",
      interests: ["Недвижимость для жизни", "Доходная недвижимость", "Долгосрочная недвижимость", "Пока не определился/-ась"],
      message: "Что для вас важнее всего?",
      messagePlaceholder: "Укажите желаемый бюджет, сроки или тип недвижимости.",
      consent: "Отправляя форму, вы соглашаетесь, что AIXCO может связаться с вами по вашему запросу.",
      send: "Получить мою подборку",
      sending: "Отправка…",
      successTitle: "Ваш запрос получен.",
      successBody: "Консультант AIXCO изучит запрос и свяжется с вами в ближайшее время.",
      reference: "Номер заявки",
      another: "Отправить ещё один запрос",
      error: "Не удалось отправить запрос. Попробуйте ещё раз или напишите на info@aixco.global.",
    },
    footer: { home: "Главный сайт", privacy: "Конфиденциальность", terms: "Условия", cookies: "Настройки cookies", rights: "Все права защищены." },
  },
};

const images = {
  hero: { src: "/aixco-global-op2/images/batumi-mosaic-hd/batumi-golden-hour-coastline.webp", width: 3840, height: 2160 },
  verticalCity: { src: "/aixco-global-op2/images/batumi-mosaic-hd/batumi-dusk-aerial-central.webp", width: 3840, height: 2160 },
  verticalTower: { src: "/aixco-global-op2/images/project-gallery-2026/05-front-facade.webp", width: 4000, height: 4000 },
  gallery: [
    { src: "/aixco-global-op2/images/batumi-mosaic-hd/batumi-sunset-panorama.webp", width: 3840, height: 2160 },
    { src: "/aixco-global-op2/images/batumi-mosaic-hd/batumi-evening-waterfront.webp", width: 3840, height: 1946 },
    { src: "/aixco-global-op2/images/project-gallery-2026/10-low-angle-facade.webp", width: 4096, height: 4096 },
    { src: "/aixco-global-op2/images/project-gallery-2026/15-business-lounge.webp", width: 1920, height: 1080 },
    { src: "/aixco-global-op2/images/project-gallery-2026/09-pool-terrace.webp", width: 4000, height: 4000 },
  ],
  contact: { src: "/aixco-global-op2/images/project-gallery-2026/17-indoor-pool.webp", width: 4096, height: 2731 },
} as const;

const processIcons = [Search, Scale, ShieldCheck, KeyRound] as const;

function scrollTo(href: string) {
  scrollToHash(href);
}

export function InvestBatumiLandingPage() {
  const { lang, setLang } = useI18n();
  const { company } = useSiteContent();
  const { openPrivacy, openTerms } = useUI();
  const content = copy[lang];
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [activeLens, setActiveLens] = useState<Lens>("lifestyle");
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [requestReference, setRequestReference] = useState<string | null>(null);
  const languageRef = useRef<HTMLDivElement | null>(null);
  const formStartedAt = useRef(Date.now());
  const activeLanguage = LANGS.find((option) => option.code === lang)?.native ?? lang.toUpperCase();

  useEffect(() => {
    document.title = content.metaTitle;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) description.content = content.metaDescription;
  }, [content.metaDescription, content.metaTitle]);

  useEffect(() => {
    if (!languageOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !languageRef.current?.contains(event.target)) setLanguageOpen(false);
    };
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLanguageOpen(false);
    };
    window.addEventListener("pointerdown", closeOutside);
    window.addEventListener("keydown", closeEscape);
    return () => {
      window.removeEventListener("pointerdown", closeOutside);
      window.removeEventListener("keydown", closeEscape);
    };
  }, [languageOpen]);

  useEffect(() => {
    if (galleryIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === "Escape") setGalleryIndex(null);
      if (event.key === "ArrowLeft") setGalleryIndex((current) => current === null ? null : (current - 1 + images.gallery.length) % images.gallery.length);
      if (event.key === "ArrowRight") setGalleryIndex((current) => current === null ? null : (current + 1) % images.gallery.length);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", keyHandler);
    };
  }, [galleryIndex]);

  const handleNav = (href: string) => {
    setMenuOpen(false);
    window.setTimeout(() => scrollTo(href), 0);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const interest = String(form.get("interest") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    const website = String(form.get("website") ?? "").trim();

    setSubmitError(null);
    setSubmitting(true);
    const result = await recordContactSubmission(
      { name, email, interest: `Invest in Batumi: ${interest}`, message, requestType: "message" },
      { antiAbuse: { website, startedAt: formStartedAt.current }, locale: lang },
    );
    setSubmitting(false);

    if (result.ok) {
      setRequestReference(result.reference ?? null);
      setSubmitted(true);
      return;
    }
    setSubmitError(content.contact.error);
  };

  const navItems = [
    { label: content.nav.opportunity, href: "#opportunity" },
    { label: content.nav.batumi, href: "#batumi" },
    { label: content.nav.approach, href: "#approach" },
    { label: content.nav.gallery, href: "#gallery" },
  ];
  const lens = content.lens[activeLens];

  return (
    <div id="main-content" className={`${styles.page} ${styles.paperLedPage}`}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" aria-label="AIXCO.Global home" className={styles.logoLink}>
            <Image src={aixcoLiveLogos.aixcoHorizontalDark} alt="AIXCO.Global" width={1600} height={333} sizes="(min-width: 768px) 10rem, 8.5rem" />
          </Link>
          <nav aria-label="Primary navigation" className={styles.desktopNav}>
            {navItems.map((item) => (
              <a key={item.href} href={item.href} onClick={(event) => { event.preventDefault(); handleNav(item.href); }}>{item.label}</a>
            ))}
          </nav>
          <div className={styles.headerActions}>
            <button type="button" className={styles.briefButton} onClick={() => handleNav("#contact")}>{content.requestBrief}<ArrowUpRight size={15} /></button>
            <div className={styles.language} ref={languageRef}>
              <button type="button" className={styles.languageButton} aria-label={`${activeLanguage} ${content.language}`} aria-expanded={languageOpen} onClick={() => setLanguageOpen((open) => !open)}>
                <Globe2 size={16} /><span>{activeLanguage}</span>
              </button>
              {languageOpen ? (
                <div className={styles.languageMenu}>
                  {LANGS.map((option) => (
                    <button key={option.code} type="button" data-active={option.code === lang} onClick={() => { setLang(option.code); setLanguageOpen(false); }}>
                      <span>{option.label}</span><span>{option.native}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <button type="button" className={styles.menuButton} aria-label={menuOpen ? content.closeMenu : content.menu} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {menuOpen ? (
          <nav aria-label="Mobile navigation" className={styles.mobileNav}>
            {navItems.map((item) => <a key={item.href} href={item.href} onClick={(event) => { event.preventDefault(); handleNav(item.href); }}>{item.label}</a>)}
            <a href="#contact" onClick={(event) => { event.preventDefault(); handleNav("#contact"); }}>{content.nav.contact}</a>
          </nav>
        ) : null}
      </header>

      <main>
        <section id="opportunity" className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.eyebrowLight}>{content.hero.eyebrow}</p>
            <h1>{content.hero.title}{" "}<span>{content.hero.accent}</span></h1>
            <p className={styles.heroBody}>{content.hero.body}</p>
            <button type="button" className={styles.goldButton} onClick={() => scrollTo("#contact")}>{content.hero.cta}<ArrowUpRight size={17} /></button>
            <div className={styles.heroMeta}><span>{content.hero.location}</span><span>{content.hero.service}</span></div>
          </div>
          <div className={styles.heroImageFrame}>
            <Image src={images.hero.src} alt="Batumi skyline and Black Sea from above" fill preload quality={90} sizes="(max-width: 700px) 100vw, 57vw" className={styles.heroImage} />
          </div>
        </section>

        <section className={styles.lensSection} aria-labelledby="buyer-lens-heading">
          <div className={styles.lensInner}>
            <p id="buyer-lens-heading">{content.lens.label}</p>
            <div className={styles.lensTabs} role="tablist" aria-label={content.lens.label}>
              {(["lifestyle", "income", "longTerm"] as Lens[]).map((key) => (
                <button key={key} type="button" role="tab" aria-selected={activeLens === key} onClick={() => setActiveLens(key)}>
                  {content.lens[key].title}
                </button>
              ))}
            </div>
            <div className={styles.lensSummary} role="tabpanel" aria-live="polite"><strong>{lens.title}</strong><span>{lens.body}</span></div>
          </div>
        </section>

        <section id="batumi" className={styles.batumiSection}>
          <div className={styles.batumiCopy}>
            <p className={styles.eyebrowGold}>{content.batumi.eyebrow}</p>
            <div className={styles.batumiWord} aria-hidden="true">BATUMI</div>
            <h2>{content.batumi.title}</h2>
            <p>{content.batumi.body}</p>
            <button type="button" className={styles.textButton} onClick={() => scrollTo("#contact")}>{content.batumi.cta}<ArrowUpRight size={16} /></button>
          </div>
          <button type="button" className={`${styles.imageFrame} ${styles.imageFrameOne}`} aria-label={content.gallery.expand} onClick={() => setGalleryIndex(1)}>
            <Image src={images.verticalCity.src} alt={content.gallery.captions[1]} fill quality={90} sizes="(max-width: 700px) 58vw, (max-width: 960px) 50vw, 33vw" />
            <span><Expand size={16} />{content.gallery.expand}</span>
          </button>
          <button type="button" className={`${styles.imageFrame} ${styles.imageFrameTwo}`} aria-label={content.gallery.expand} onClick={() => setGalleryIndex(2)}>
            <Image src={images.verticalTower.src} alt={content.gallery.captions[2]} fill quality={90} sizes="(max-width: 700px) 42vw, (max-width: 960px) 50vw, 27vw" />
            <span><Expand size={16} />{content.gallery.expand}</span>
          </button>
        </section>

        <section id="approach" className={styles.processSection}>
          <div className={styles.processIntro}>
            <p className={styles.eyebrowGold}>{content.process.eyebrow}</p>
            <h2>{content.process.title}</h2>
            <p>{content.process.body}</p>
          </div>
          <div className={styles.processGrid}>
            {content.process.steps.map((step, index) => {
              const Icon = processIcons[index];
              return <article key={step.title}><div className={styles.stepTop}><span>0{index + 1}</span><Icon size={23} strokeWidth={1.35} /></div><h3>{step.title}</h3><p>{step.body}</p></article>;
            })}
          </div>
          <button type="button" className={styles.goldButton} onClick={() => scrollTo("#contact")}>{content.process.cta}<ArrowUpRight size={17} /></button>
        </section>

        <section id="gallery" className={styles.gallerySection}>
          <div className={styles.galleryHeading}>
            <div><p className={styles.eyebrowDark}>{content.gallery.eyebrow}</p><h2>{content.gallery.title}</h2></div>
            <button type="button" onClick={() => setGalleryIndex(0)}><Expand size={16} />{content.gallery.expand}</button>
          </div>
          <div className={styles.galleryGrid}>
            {images.gallery.map((image, index) => (
              <button key={image.src} type="button" aria-label={content.gallery.captions[index]} onClick={() => setGalleryIndex(index)}>
                <Image src={image.src} alt={content.gallery.captions[index]} fill quality={90} sizes="(max-width: 700px) 50vw, (max-width: 960px) 50vw, 24vw" />
                <span>{content.gallery.captions[index]}</span>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.guidanceSection}>
          <div className={styles.guidanceIntro}>
            <p className={styles.eyebrowDark}>{content.guidance.eyebrow}</p>
            <h2>{content.guidance.title}</h2>
            <p>{content.guidance.body}</p>
          </div>
          <div className={styles.guidanceList}>
            {content.guidance.features.map((feature, index) => (
              <article key={feature.title}><span>0{index + 1}</span><div><h3>{feature.title}</h3><p>{feature.body}</p></div></article>
            ))}
          </div>
        </section>

        <section id="contact" className={styles.contactSection}>
          <div className={styles.contactMedia}>
            <Image src={images.contact.src} alt="Premium indoor pool and resident wellness area" fill quality={90} sizes="(max-width: 960px) 100vw, 50vw" />
          </div>
          <div className={styles.contactPanel}>
            <p className={styles.eyebrowGold}>{content.contact.eyebrow}</p>
            <h2 id="invest-batumi-contact-title">{content.contact.title}</h2>
            <p className={styles.contactIntro}>{content.contact.body}</p>
            {submitted ? (
              <div className={styles.success} role="status">
                <span><Check size={25} /></span><h3>{content.contact.successTitle}</h3><p>{content.contact.successBody}</p>
                {requestReference ? <p className={styles.reference}>{content.contact.reference}: {requestReference}</p> : null}
                <button type="button" onClick={() => { setSubmitted(false); setRequestReference(null); formStartedAt.current = Date.now(); }}>{content.contact.another}</button>
              </div>
            ) : (
              <form className={styles.form} aria-labelledby="invest-batumi-contact-title" onSubmit={handleSubmit}>
                <input className={styles.honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                <div className={styles.formRow}>
                  <label>{content.contact.name}<input required minLength={2} maxLength={100} name="name" autoComplete="name" placeholder={content.contact.namePlaceholder} /></label>
                  <label>{content.contact.email}<input required maxLength={255} name="email" type="email" autoComplete="email" placeholder={content.contact.emailPlaceholder} /></label>
                </div>
                <label>{content.contact.interest}<select name="interest" defaultValue={content.contact.interests[0]}>{content.contact.interests.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                <label>{content.contact.message}<textarea required minLength={10} maxLength={1500} rows={4} name="message" placeholder={content.contact.messagePlaceholder} /></label>
                {submitError ? <p className={styles.formError} role="alert">{submitError}</p> : null}
                <div className={styles.formFooter}><p>{content.contact.consent}</p><button type="submit" disabled={submitting}>{submitting ? content.contact.sending : content.contact.send}<ArrowUpRight size={16} /></button></div>
              </form>
            )}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <Link href="/" aria-label="AIXCO.Global home"><Image src={aixcoLiveLogos.aixcoHorizontalDark} alt="AIXCO.Global" width={1600} height={333} sizes="8rem" /></Link>
        <div><a href={`mailto:${company.email}`}>{company.email}</a><span>{company.offices.join(" · ")}</span></div>
        <div className={styles.footerLinks}>
          <Link href="/">{content.footer.home}</Link>
          <button type="button" onClick={openPrivacy}>{content.footer.privacy}</button>
          <button type="button" onClick={openTerms}>{content.footer.terms}</button>
          <button type="button" onClick={openAnalyticsPreferences}>{content.footer.cookies}</button>
        </div>
        <p>© {new Date().getFullYear()} AIXCO.Global. {content.footer.rights}</p>
      </footer>

      {galleryIndex !== null ? (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={content.gallery.expand} onClick={(event) => { if (event.target === event.currentTarget) setGalleryIndex(null); }}>
          <button type="button" className={styles.lightboxClose} aria-label={content.gallery.close} onClick={() => setGalleryIndex(null)}><X size={22} /></button>
          <button type="button" className={styles.lightboxPrevious} aria-label={content.gallery.previous} onClick={() => setGalleryIndex((galleryIndex - 1 + images.gallery.length) % images.gallery.length)}><ChevronLeft size={28} /></button>
          <figure>
            <Image src={images.gallery[galleryIndex].src} alt={content.gallery.captions[galleryIndex]} width={images.gallery[galleryIndex].width} height={images.gallery[galleryIndex].height} quality={90} sizes="92vw" />
            <figcaption><span>{String(galleryIndex + 1).padStart(2, "0")} / {String(images.gallery.length).padStart(2, "0")}</span>{content.gallery.captions[galleryIndex]}</figcaption>
          </figure>
          <button type="button" className={styles.lightboxNext} aria-label={content.gallery.next} onClick={() => setGalleryIndex((galleryIndex + 1) % images.gallery.length)}><ChevronRight size={28} /></button>
        </div>
      ) : null}
    </div>
  );
}
