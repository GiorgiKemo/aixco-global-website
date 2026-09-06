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
  market: {
    eyebrow: string;
    title: string;
    body: string;
    stats: Array<{ value: string; label: string }>;
    source: string;
  };
  pricing: {
    eyebrow: string;
    title: string;
    tiers: Array<{ title: string; price: string }>;
  };
  process: {
    eyebrow: string;
    title: string;
    body: string;
    steps: Array<{ value?: string; title: string; body: string }>;
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
    phone: string;
    phonePlaceholder: string;
    interest: string;
    interests: string[];
    budget: string;
    budgetSelect: string;
    budgetOptions: string[];
    unitType: string;
    unitTypeSelect: string;
    unitTypeOptions: string[];
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
      eyebrow: "Batumi, Georgia · Coastal property",
      title: "OWN PROPERTY IN ONE OF EUROPE'S",
      accent: "FASTEST-GROWING COASTAL MARKETS",
      body: "Selected apartments from €45,000. 10% initial payment, up to 60% bank financing, up to 12% net rental yield, 1% rental income tax, and 100% foreign ownership.",
      cta: "View available apartments",
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
      eyebrow: "Why Batumi",
      title: "One of Europe's most dynamic residential property markets.",
      body: "Batumi has become one of Europe's most dynamic residential property markets, supported by economic growth, expanding tourism, modern infrastructure and increasing international demand.",
      cta: "Explore the opportunity",
    },
    market: {
      eyebrow: "Why Batumi",
      title: "Batumi by the numbers.",
      body: "Key indicators from independent market research underline the city's growing residential appeal.",
      stats: [
        { value: "17,478", label: "Property transactions (2025)" },
        { value: "$1.3B", label: "Residential market size" },
        { value: "+9.4%", label: "Primary-market price growth" },
        { value: "7.4%", label: "Average rental yield" },
        { value: "52%", label: "International buyers in surveyed projects" },
      ],
      source: "Sources: Galt & Taggart Research; Colliers Georgia.",
    },
    pricing: {
      eyebrow: "Investment",
      title: "How much does it cost?",
      tiers: [
        { title: "Studio", price: "From €45,000" },
        { title: "1 Bedroom", price: "From €65,000" },
        { title: "2 Bedroom", price: "From €95,000" },
        { title: "Luxury", price: "From €150,000" },
      ],
    },
    process: {
      eyebrow: "Payment structure",
      title: "Own your apartment. Pay in stages.",
      body: "A structured route to ownership without paying the full property price upfront.",
      steps: [
        { value: "10%", title: "Initial payment", body: "Secure the selected property." },
        { value: "30%", title: "During construction", body: "Structured payments during the construction period." },
        { value: "60%", title: "At completion", body: "Up to 60% bank financing may be available subject to eligibility and lender approval." },
      ],
      cta: "Calculate my payment plan",
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
      eyebrow: "Why AIXCO",
      title: "Why buy through AIXCO?",
      body: "Since its first acquisition in 2009, AIXCO has followed a disciplined strategy built on long-term real estate ownership, careful capital allocation and international expansion.",
      features: [
        { title: "Select", body: "We shortlist only projects we would buy ourselves." },
        { title: "Negotiate", body: "Access developer pricing and selected inventory." },
        { title: "Purchase", body: "Complete documentation with local support." },
        { title: "Own", body: "Rental, reporting and administration." },
      ],
    },
    contact: {
      eyebrow: "Get started",
      title: "FIND THE RIGHT PROPERTY IN BATUMI",
      body: "Tell us what you're looking for. We'll show you the available apartments that best match your budget and objective.",
      name: "Full name",
      namePlaceholder: "Your name",
      email: "Email address",
      emailPlaceholder: "you@email.com",
      phone: "WhatsApp / phone",
      phonePlaceholder: "+995 …",
      interest: "Primary goal",
      interests: ["Investment / rental income", "Lifestyle / personal use", "Long-term hold", "Not sure yet"],
      budget: "Budget",
      budgetSelect: "Select budget",
      budgetOptions: ["€45K–€60K", "€60K–€100K", "€100K+", "Not decided"],
      unitType: "I'm looking for",
      unitTypeSelect: "Select unit type",
      unitTypeOptions: ["Studio", "1 Bedroom", "2 Bedroom", "Not sure"],
      message: "Anything else we should know?",
      messagePlaceholder: "Preferred timeline, floor level or other priorities.",
      consent: "By sending this form, you agree that AIXCO may contact you about your request.",
      send: "Send me available apartments",
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
      eyebrow: "Batumi, Georgien · Küstenimmobilien",
      title: "EIGENTUM IN EINEM DER",
      accent: "AM SCHNELLSTEN WACHSENDEN KÜSTENMÄRKTE EUROPAS",
      body: "Ausgewählte Wohnungen ab 45.000 €. 10 % Anzahlung, bis zu 60 % Bankfinanzierung, bis zu 12 % Nettomietrendite, 1 % Steuer auf Mieteinkünfte und 100 % ausländisches Eigentum.",
      cta: "Verfügbare Wohnungen ansehen",
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
      eyebrow: "Warum Batumi",
      title: "Einer der dynamischsten Wohnungsmärkte Europas.",
      body: "Batumi hat sich zu einem der dynamischsten Wohnungsmärkte Europas entwickelt – getragen von Wirtschaftswachstum, wachsendem Tourismus, moderner Infrastruktur und steigender internationaler Nachfrage.",
      cta: "Die Chance entdecken",
    },
    market: {
      eyebrow: "Warum Batumi",
      title: "Batumi in Zahlen.",
      body: "Schlüsselindikatoren unabhängiger Marktforschung unterstreichen die wachsende Attraktivität der Stadt.",
      stats: [
        { value: "17.478", label: "Immobilientransaktionen (2025)" },
        { value: "1,3 Mrd. $", label: "Größe des Wohnungsmarkts" },
        { value: "+9,4 %", label: "Preiswachstum auf dem Primärmarkt" },
        { value: "7,4 %", label: "Durchschnittliche Mietrendite" },
        { value: "52 %", label: "Internationale Käufer in untersuchten Projekten" },
      ],
      source: "Quellen: Galt & Taggart Research; Colliers Georgia.",
    },
    pricing: {
      eyebrow: "Investition",
      title: "Was kostet es?",
      tiers: [
        { title: "Studio", price: "Ab 45.000 €" },
        { title: "1 Schlafzimmer", price: "Ab 65.000 €" },
        { title: "2 Schlafzimmer", price: "Ab 95.000 €" },
        { title: "Luxus", price: "Ab 150.000 €" },
      ],
    },
    process: {
      eyebrow: "Zahlungsstruktur",
      title: "Eigentum an Ihrer Wohnung. Zahlung in Etappen.",
      body: "Ein strukturierter Weg zum Eigentum, ohne den vollen Kaufpreis sofort zu zahlen.",
      steps: [
        { value: "10 %", title: "Anzahlung", body: "Sichern Sie die ausgewählte Immobilie." },
        { value: "30 %", title: "Während der Bauphase", body: "Strukturierte Zahlungen während der Bauphase." },
        { value: "60 %", title: "Bei Fertigstellung", body: "Bis zu 60 % Bankfinanzierung können vorbehaltlich Eignung und Genehmigung des Kreditgebers verfügbar sein." },
      ],
      cta: "Meinen Zahlungsplan berechnen",
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
      eyebrow: "Warum AIXCO",
      title: "Warum über AIXCO kaufen?",
      body: "Seit der ersten Akquisition im Jahr 2009 verfolgt AIXCO eine disziplinierte Strategie auf Basis langfristigen Immobilieneigentums, sorgfältiger Kapitalallokation und internationaler Expansion.",
      features: [
        { title: "Auswählen", body: "Wir listen nur Projekte auf, die wir selbst kaufen würden." },
        { title: "Verhandeln", body: "Zugang zu Entwicklerpreisen und ausgewähltem Bestand." },
        { title: "Kaufen", body: "Vollständige Dokumentation mit lokaler Unterstützung." },
        { title: "Besitzen", body: "Vermietung, Reporting und Verwaltung." },
      ],
    },
    contact: {
      eyebrow: "Jetzt starten",
      title: "DIE RICHTIGE IMMOBILIE IN BATUMI FINDEN",
      body: "Sagen Sie uns, wonach Sie suchen. Wir zeigen Ihnen die verfügbaren Wohnungen, die am besten zu Budget und Ziel passen.",
      name: "Vollständiger Name",
      namePlaceholder: "Ihr Name",
      email: "E-Mail-Adresse",
      emailPlaceholder: "sie@email.de",
      phone: "WhatsApp / Telefon",
      phonePlaceholder: "+995 …",
      interest: "Hauptziel",
      interests: ["Investition / Mieteinnahmen", "Eigennutzung / Lifestyle", "Langfristiger Bestand", "Noch nicht sicher"],
      budget: "Budget",
      budgetSelect: "Budget wählen",
      budgetOptions: ["45.000–60.000 €", "60.000–100.000 €", "100.000 €+", "Noch unentschieden"],
      unitType: "Ich suche",
      unitTypeSelect: "Wohnungstyp wählen",
      unitTypeOptions: ["Studio", "1 Schlafzimmer", "2 Schlafzimmer", "Noch unsicher"],
      message: "Gibt es noch etwas, das wir wissen sollten?",
      messagePlaceholder: "Bevorzugter Zeitrahmen, Etage oder andere Prioritäten.",
      consent: "Mit dem Absenden stimmen Sie zu, dass AIXCO Sie zu Ihrer Anfrage kontaktieren darf.",
      send: "Verfügbare Wohnungen senden",
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
      eyebrow: "Batumi, Gruzja · Nieruchomości nad morzem",
      title: "KUP NIERUCHOMOŚĆ NA JEDNYM Z",
      accent: "NAJSZYBCIEJ ROSNĄCYCH NADMORSKICH RYNKÓW EUROPY",
      body: "Wybrane apartamenty od 45 000 €. 10% wpłaty początkowej, do 60% finansowania bankowego, do 12% netto z najmu, 1% podatku od dochodu z najmu i 100% własności dla cudzoziemców.",
      cta: "Zobacz dostępne apartamenty",
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
      eyebrow: "Dlaczego Batumi",
      title: "Jeden z najbardziej dynamicznych rynków mieszkaniowych w Europie.",
      body: "Batumi stało się jednym z najbardziej dynamicznych rynków mieszkaniowych w Europie, wspieranym przez wzrost gospodarczy, rozwijającą się turystykę, nową infrastrukturę i rosnący popyt międzynarodowy.",
      cta: "Poznaj możliwości",
    },
    market: {
      eyebrow: "Dlaczego Batumi",
      title: "Batumi w liczbach.",
      body: "Kluczowe wskaźniki z niezależnych badań rynku potwierdzają rosnącą atrakcyjność miasta.",
      stats: [
        { value: "17 478", label: "Transakcji nieruchomości (2025)" },
        { value: "1,3 mld $", label: "Wielkość rynku mieszkaniowego" },
        { value: "+9,4%", label: "Wzrost cen na rynku pierwotnym" },
        { value: "7,4%", label: "Średnia rentowność najmu" },
        { value: "52%", label: "Zagraniczni nabywcy w badanych projektach" },
      ],
      source: "Źródła: Galt & Taggart Research; Colliers Georgia.",
    },
    pricing: {
      eyebrow: "Inwestycja",
      title: "Ile to kosztuje?",
      tiers: [
        { title: "Studio", price: "Od 45 000 €" },
        { title: "1 sypialnia", price: "Od 65 000 €" },
        { title: "2 sypialnie", price: "Od 95 000 €" },
        { title: "Luksus", price: "Od 150 000 €" },
      ],
    },
    process: {
      eyebrow: "Struktura płatności",
      title: "Kup mieszkanie. Płać etapami.",
      body: "Ustrukturyzowana droga do własności bez konieczności płacenia pełnej ceny z góry.",
      steps: [
        { value: "10%", title: "Wpłata początkowa", body: "Zabezpiecz wybraną nieruchomość." },
        { value: "30%", title: "W trakcie budowy", body: "Ustrukturyzowane płatności w okresie budowy." },
        { value: "60%", title: "Po ukończeniu", body: "Do 60% finansowania bankowego może być dostępne z zastrzeżeniem kwalifikowalności i zgody banku." },
      ],
      cta: "Oblicz mój plan płatności",
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
      eyebrow: "Dlaczego AIXCO",
      title: "Dlaczego kupować przez AIXCO?",
      body: "Od pierwszej akwizycji w 2009 roku AIXCO realizuje zdyscyplinowaną strategię opartą na długoterminowej własności, ostrożnej alokacji kapitału i ekspansji międzynarodowej.",
      features: [
        { title: "Wybierz", body: "Prezentujemy tylko projekty, które sami byśmy kupili." },
        { title: "Negocjuj", body: "Dostęp do cen deweloperskich i wybranego asortymentu." },
        { title: "Kup", body: "Pełna dokumentacja z lokalnym wsparciem." },
        { title: "Posiadaj", body: "Najem, raportowanie i administracja." },
      ],
    },
    contact: {
      eyebrow: "Zacznij teraz",
      title: "ZNAJDŹ WŁAŚCIWĄ NIERUCHOMOŚĆ W BATUMI",
      body: "Powiedz nam, czego szukasz. Pokażemy dostępne apartamenty, które najlepiej pasują do budżetu i celu.",
      name: "Imię i nazwisko",
      namePlaceholder: "Twoje imię i nazwisko",
      email: "Adres e-mail",
      emailPlaceholder: "ty@email.pl",
      phone: "WhatsApp / telefon",
      phonePlaceholder: "+995 …",
      interest: "Główny cel",
      interests: ["Inwestycja / dochód z najmu", "Styl życia / użytek własny", "Długoterminowa posiadłość", "Jeszcze nie wiem"],
      budget: "Budżet",
      budgetSelect: "Wybierz budżet",
      budgetOptions: ["45–60 tys. €", "60–100 tys. €", "100 tys. €+", "Jeszcze nie zdecydowane"],
      unitType: "Szukam",
      unitTypeSelect: "Wybierz typ",
      unitTypeOptions: ["Studio", "1 sypialnia", "2 sypialnie", "Nie jestem pewien"],
      message: "Czy jest coś jeszcze, o czym powinniśmy wiedzieć?",
      messagePlaceholder: "Preferowany termin, piętro lub inne priorytety.",
      consent: "Wysyłając formularz, zgadzasz się na kontakt AIXCO w sprawie Twojego zapytania.",
      send: "Wyślij dostępne apartamenty",
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
      eyebrow: "Batumi, Gruzija · Obalne nepremičnine",
      title: "POSTANITE LASTNIK NA ENEM OD",
      accent: "NAJHITREJE RASTOČIH OBALNIH TRGOV V EVROPI",
      body: "Izbrani apartmaji od 45.000 €. 10% začetno plačilo, do 60% bančnega financiranja, do 12% neto donosa najema, 1% davka na dohodek iz najema in 100% tuje lastništvo.",
      cta: "Oglejte si razpoložljive apartmaje",
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
      eyebrow: "Zakaj Batumi",
      title: "Eden najhitreje rastočih stanovanjskih trgov v Evropi.",
      body: "Batumi je postal eden najdinamičnejših stanovanjskih trgov v Evropi, podprt z gospodarsko rastjo, naraščajočim turizmom, sodobno infrastrukturo in naraščajočim mednarodnim povpraševanjem.",
      cta: "Raziščite priložnost",
    },
    market: {
      eyebrow: "Zakaj Batumi",
      title: "Batumi v številkah.",
      body: "Ključni kazalniki neodvisnih tržnih raziskav potrjujejo naraščajočo privlačnost mesta.",
      stats: [
        { value: "17.478", label: "Nepremičninskih transakcij (2025)" },
        { value: "1,3 mlrd $", label: "Velikost stanovanjskega trga" },
        { value: "+9,4 %", label: "Rast cen na primarnem trgu" },
        { value: "7,4 %", label: "Povprečni donos najema" },
        { value: "52 %", label: "Tuji kupci v pregledanih projektih" },
      ],
      source: "Viri: Galt & Taggart Research; Colliers Georgia.",
    },
    pricing: {
      eyebrow: "Naložba",
      title: "Koliko stane?",
      tiers: [
        { title: "Studio", price: "Od 45.000 €" },
        { title: "1 spalnica", price: "Od 65.000 €" },
        { title: "2 spalnici", price: "Od 95.000 €" },
        { title: "Luksuz", price: "Od 150.000 €" },
      ],
    },
    process: {
      eyebrow: "Struktura plačil",
      title: "Postanite lastnik stanovanja. Plačujte po fazah.",
      body: "Strukturirana pot do lastništva brez plačila celotne cene nepremičnine vnaprej.",
      steps: [
        { value: "10 %", title: "Začetno plačilo", body: "Zagotovite izbrano nepremičnino." },
        { value: "30 %", title: "Med gradnjo", body: "Strukturirana plačila v obdobju gradnje." },
        { value: "60 %", title: "Ob zaključku", body: "Do 60 % bančnega financiranja je lahko na voljo glede na upravičenost in odobritev posojilodajalca." },
      ],
      cta: "Izračunaj moj načrt plačil",
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
      eyebrow: "Zakaj AIXCO",
      title: "Zakaj kupovati prek AIXCO?",
      body: "Od prve pridobitve leta 2009 AIXCO izvaja disciplinirano strategijo, zgrajeno na dolgoročnem lastništvu nepremičnin, premišljeni alokaciji kapitala in mednarodni širitvi.",
      features: [
        { title: "Izberite", body: "Na kratki seznam uvrščamo le projekte, ki bi jih kupili sami." },
        { title: "Pogajajte se", body: "Dostop do razvijalčevih cen in izbranega inventarja." },
        { title: "Kupite", body: "Celotna dokumentacija z lokalno podporo." },
        { title: "Lastite", body: "Najem, poročanje in upravljanje." },
      ],
    },
    contact: {
      eyebrow: "Začnite zdaj",
      title: "NAJDITE PRAVO NEPREMIČNINO V BATUMIJU",
      body: "Povejte nam, kaj iščete. Pokazali vam bomo razpoložljive apartmaje, ki najbolje ustrezajo proračunu in cilju.",
      name: "Ime in priimek",
      namePlaceholder: "Vaše ime",
      email: "E-poštni naslov",
      emailPlaceholder: "vi@email.si",
      phone: "WhatsApp / telefon",
      phonePlaceholder: "+995 …",
      interest: "Glavni cilj",
      interests: ["Naložba / donos najema", "Življenjski slog / lastna raba", "Dolgoročno lastništvo", "Še nisem prepričan/a"],
      budget: "Proračun",
      budgetSelect: "Izberite proračun",
      budgetOptions: ["45.000–60.000 €", "60.000–100.000 €", "100.000 €+", "Še nisem se odločil"],
      unitType: "Iščem",
      unitTypeSelect: "Izberite tip",
      unitTypeOptions: ["Studio", "1 spalnica", "2 spalnici", "Še nisem prepričan"],
      message: "Ali je še kaj, kar bi morali vedeti?",
      messagePlaceholder: "Želeni časovni okvir, nadstropje ali druge prioritete.",
      consent: "Z oddajo obrazca soglašate, da vas AIXCO kontaktira glede vašega povpraševanja.",
      send: "Pošlji razpoložljive apartmaje",
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
      eyebrow: "Батуми, Грузия · Прибрежная недвижимость",
      title: "КУПИТЕ НЕДВИЖИМОСТЬ НА ОДНОМ ИЗ",
      accent: "САМЫХ БЫСТРОРАСТУЩИХ ПРИБРЕЖНЫХ РЫНКОВ ЕВРОПЫ",
      body: "Отобранные апартаменты от 45 000 €. 10% первый взнос, до 60% банковского финансирования, до 12% чистой арендной доходности, 1% налога на доход от аренды и 100% иностранная собственность.",
      cta: "Смотреть доступные апартаменты",
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
      eyebrow: "Почему Батуми",
      title: "Один из самых динамичных рынков жилья в Европе.",
      body: "Батуми стал одним из самых динамичных рынков жилой недвижимости в Европе благодаря экономическому росту, развивающемуся туризму, новой инфраструктуре и растущему международному спросу.",
      cta: "Изучить возможности",
    },
    market: {
      eyebrow: "Почему Батуми",
      title: "Батуми в цифрах.",
      body: "Ключевые показатели независимых исследований рынка подтверждают растущую привлекательность города.",
      stats: [
        { value: "17 478", label: "Сделок с недвижимостью (2025)" },
        { value: "1,3 млрд $", label: "Объём жилого рынка" },
        { value: "+9,4%", label: "Рост цен на первичном рынке" },
        { value: "7,4%", label: "Средняя арендная доходность" },
        { value: "52%", label: "Иностранные покупатели в обследованных проектах" },
      ],
      source: "Источники: Galt & Taggart Research; Colliers Georgia.",
    },
    pricing: {
      eyebrow: "Инвестиция",
      title: "Сколько это стоит?",
      tiers: [
        { title: "Студия", price: "От 45 000 €" },
        { title: "1 спальня", price: "От 65 000 €" },
        { title: "2 спальни", price: "От 95 000 €" },
        { title: "Люкс", price: "От 150 000 €" },
      ],
    },
    process: {
      eyebrow: "Структура оплаты",
      title: "Владейте квартирой. Платите поэтапно.",
      body: "Структурированный путь к собственности без полной предоплаты стоимости объекта.",
      steps: [
        { value: "10%", title: "Первый взнос", body: "Закрепите выбранный объект." },
        { value: "30%", title: "Во время строительства", body: "Структурированные платежи в период строительства." },
        { value: "60%", title: "При завершении", body: "До 60% банковского финансирования может быть доступно при соответствии требованиям и одобрении кредитора." },
      ],
      cta: "Рассчитать мой план оплаты",
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
      eyebrow: "Почему AIXCO",
      title: "Почему покупать через AIXCO?",
      body: "С первой сделки в 2009 году AIXCO следует дисциплинированной стратегии, основанной на долгосрочном владении недвижимостью, взвешенном распределении капитала и международной экспансии.",
      features: [
        { title: "Отбор", body: "Мы отбираем только те проекты, которые купили бы сами." },
        { title: "Переговоры", body: "Доступ к ценам застройщика и отобранному инвентарю." },
        { title: "Покупка", body: "Полное оформление документов с местной поддержкой." },
        { title: "Владение", body: "Аренда, отчётность и администрирование." },
      ],
    },
    contact: {
      eyebrow: "Начать",
      title: "НАЙДИТЕ ПОДХОДЯЩУЮ НЕДВИЖИМОСТЬ В БАТУМИ",
      body: "Расскажите, что вы ищете. Мы покажем доступные апартаменты, которые лучше всего соответствуют бюджету и задаче.",
      name: "Имя и фамилия",
      namePlaceholder: "Ваше имя",
      email: "Электронная почта",
      emailPlaceholder: "you@email.com",
      phone: "WhatsApp / телефон",
      phonePlaceholder: "+995 …",
      interest: "Основная цель",
      interests: ["Инвестиция / арендный доход", "Образ жизни / личное использование", "Долгосрочное владение", "Пока не определился/-ась"],
      budget: "Бюджет",
      budgetSelect: "Выберите бюджет",
      budgetOptions: ["45–60 тыс. €", "60–100 тыс. €", "100 тыс. €+", "Ещё не решил"],
      unitType: "Я ищу",
      unitTypeSelect: "Выберите тип",
      unitTypeOptions: ["Студия", "1 спальня", "2 спальни", "Пока не уверен"],
      message: "Есть ли ещё что-то, что нам следует знать?",
      messagePlaceholder: "Предпочтительные сроки, этаж или другие приоритеты.",
      consent: "Отправляя форму, вы соглашаетесь, что AIXCO может связаться с вами по вашему запросу.",
      send: "Прислать доступные апартаменты",
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

const processIcons = [ShieldCheck, Scale, KeyRound] as const;
const investorReasons = [
  "Entry prices still below most European coastal cities",
  "Strong tourism growth",
  "Fast-growing economy",
  "Very low property taxes",
  "Simple ownership process",
  "Black Sea lifestyle",
] as const;

const buyerJourney = [
  { title: "Select", body: "Find the right apartment" },
  { title: "Reserve", body: "Secure your property" },
  { title: "Finance", body: "Payment plan & financing" },
  { title: "Construction", body: "Project updates" },
  { title: "Handover", body: "Receive your keys" },
  { title: "Rental", body: "Income management (optional)" },
  { title: "Ownership support", body: "Administration & ongoing assistance" },
] as const;

function scrollTo(href: string) {
  scrollToHash(href);
}

export function InvestBatumiLandingPage() {
  const { lang, setLang, tx } = useI18n();
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
  const [investmentPrice, setInvestmentPrice] = useState(65000);
  const [monthlyRent, setMonthlyRent] = useState(600);
  const [loanPayment, setLoanPayment] = useState(0);
  const languageRef = useRef<HTMLDivElement | null>(null);
  const formStartedAt = useRef(Date.now());
  const activeLanguage = LANGS.find((option) => option.code === lang)?.native ?? lang.toUpperCase();
  const estimatedMonthlyCashflow = monthlyRent - loanPayment;
  const estimatedAnnualReturn = investmentPrice > 0 ? (estimatedMonthlyCashflow * 12 / investmentPrice) * 100 : 0;

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
    const phone = String(form.get("phone") ?? "").trim();
    const budget = String(form.get("budget") ?? "").trim();
    const unitType = String(form.get("unitType") ?? "").trim();
    const composedMessage = [
      String(form.get("message") ?? "").trim(),
      phone ? `WhatsApp / Phone: ${phone}` : "",
      budget ? `Budget: ${budget}` : "",
      unitType ? `Looking for: ${unitType}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
    const message = composedMessage.length >= 10
      ? composedMessage
      : [`Primary goal: ${interest}`, composedMessage].filter(Boolean).join("\n\n");
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
                <div className={`${styles.languageMenu} landing-language-panel`}>
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
          <nav aria-label="Mobile navigation" className={`${styles.mobileNav} landing-mobile-nav`}>
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
            <div className={styles.heroDocumentActions}>
              <button type="button" className={styles.goldButton} onClick={() => scrollTo("#contact")}>{content.hero.cta}<ArrowUpRight size={17} /></button>
              <button type="button" className={styles.heroSecondaryButton} onClick={() => scrollTo("#contact")}>{tx("Download investment guide")}<ArrowUpRight size={16} /></button>
            </div>
            <div className={styles.heroMeta}><span>{content.hero.location}</span><span>{content.hero.service}</span></div>
          </div>
          <div className={styles.heroImageFrame}>
            <Image src={images.hero.src} alt="Batumi skyline and Black Sea from above" fill preload unoptimized quality={90} sizes="(max-width: 700px) 100vw, 57vw" className={styles.heroImage} />
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

        <section id="market" className={styles.marketSection}>
          <div className={styles.marketIntro}>
            <p className={styles.eyebrowGold}>{tx("02 — Why Batumi?")}</p>
            <h2>{content.market.title}</h2>
            <p>{content.market.body}</p>
          </div>
          <div className={styles.marketStats}>
            {content.market.stats.map((stat) => (
              <article key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>
          <p className={styles.marketSource}>{content.market.source}</p>
        </section>

        <section id="pricing" className={styles.pricingSection}>
          <div className={styles.briefSectionIntro}>
            <p className={styles.eyebrowDark}>{tx("03 — Why are investors buying today?")}</p>
            <h2>{tx("Why are investors buying today?")}</h2>
          </div>
          <div className={styles.reasonGrid}>
            {investorReasons.map((reason, index) => (
              <article key={reason}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{tx(reason)}</h3>
              </article>
            ))}
          </div>
          <div className={styles.pricingIntro}>
            <p className={styles.eyebrowDark}>{tx("04 — How much does it cost?")}</p>
            <h2>{content.pricing.title}</h2>
          </div>
          <div className={styles.pricingGrid}>
            {content.pricing.tiers.map((tier, index) => (
              <article key={tier.title}>
                <span>0{index + 1}</span>
                <h3>{tier.title}</h3>
                <p>{tier.price}</p>
              </article>
            ))}
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
            <Image src={images.verticalCity.src} alt={content.gallery.captions[1]} fill quality={90} sizes="(max-width: 700px) 58vw, (max-width: 960px) 50vw, 33vw" style={{ aspectRatio: `${images.verticalCity.width} / ${images.verticalCity.height}` }} />
            <span><Expand size={16} />{content.gallery.expand}</span>
          </button>
          <button type="button" className={`${styles.imageFrame} ${styles.imageFrameTwo}`} aria-label={content.gallery.expand} onClick={() => setGalleryIndex(2)}>
            <Image src={images.verticalTower.src} alt={content.gallery.captions[2]} fill quality={90} sizes="(max-width: 700px) 42vw, (max-width: 960px) 50vw, 27vw" style={{ aspectRatio: `${images.verticalTower.width} / ${images.verticalTower.height}` }} />
            <span><Expand size={16} />{content.gallery.expand}</span>
          </button>
        </section>

        <section id="approach" className={styles.processSection}>
          <div className={styles.processIntro}>
            <p className={styles.eyebrowGold}>{tx("05 — How do I buy?")}</p>
            <h2>{content.process.title}</h2>
            <p>{content.process.body}</p>
          </div>
          <div className={styles.processGrid}>
            {content.process.steps.map((step, index) => {
              const Icon = processIcons[index];
              return (
                <article key={step.title}>
                  <div className={styles.stepTop}>
                    <span>{step.value ?? `0${index + 1}`}</span>
                    <Icon size={23} strokeWidth={1.35} />
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              );
            })}
          </div>
          <Link href="/reverance-batumi/calculator" className={styles.goldButton}>
            {content.process.cta}
            <ArrowUpRight size={17} />
          </Link>
        </section>

        <section id="returns" className={styles.briefSection}>
          <div className={styles.briefSectionIntro}>
            <p className={styles.eyebrowGold}>{tx("06 — How much could it generate?")}</p>
            <h2>{tx("How much could it generate?")}</h2>
            <p>{tx("Use a simple illustration to see how price, rent and loan payments affect estimated cashflow and annual return.")}</p>
          </div>
          <div className={styles.returnCalculator}>
            <div className={styles.calculatorInputs}>
              <label>{tx("Property price")}<span>€</span><input type="number" min="10000" step="1000" value={investmentPrice} onChange={(event) => setInvestmentPrice(Number(event.target.value) || 0)} /></label>
              <label>{tx("Monthly rent")}<span>€</span><input type="number" min="0" step="50" value={monthlyRent} onChange={(event) => setMonthlyRent(Number(event.target.value) || 0)} /></label>
              <label>{tx("Monthly loan payment")}<span>€</span><input type="number" min="0" step="50" value={loanPayment} onChange={(event) => setLoanPayment(Number(event.target.value) || 0)} /></label>
            </div>
            <div className={styles.calculatorResults} aria-live="polite">
              <article><span>{tx("Estimated monthly cashflow")}</span><strong>{estimatedMonthlyCashflow.toLocaleString(lang, { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}</strong></article>
              <article><span>{tx("Estimated annual return")}</span><strong>{estimatedAnnualReturn.toFixed(1)}%</strong></article>
            </div>
          </div>
          <p className={styles.calculatorNote}>{tx("Illustrative calculation only. It excludes vacancy, operating costs, taxes, fees and changes in financing terms.")}</p>
        </section>

        <section id="experience" className={styles.experienceSection}>
          <div className={styles.briefSectionIntro}>
            <p className={styles.eyebrowDark}>{tx("07 — Built on experience. Focused on the future.")}</p>
            <h2>{tx("Built on experience. Focused on the future.")}</h2>
          </div>
          <div className={styles.experienceCopy}>
            <p>{tx("Since its first acquisition in 2009, AIXCO has followed a disciplined strategy built on long-term real estate ownership, careful capital allocation and international expansion.")}</p>
            <p>{tx("Today, AIXCO combines Swiss real estate heritage, international experience and a growing development platform to identify opportunities, create value and build a diversified portfolio designed for long-term growth.")}</p>
          </div>
          <div className={styles.experiencePath}>
            {[
              ["Switzerland", "Swiss real estate heritage"],
              ["Dubai", "International expansion"],
              ["Georgia", "Strategic growth market"],
              ["Future", "Selected emerging markets"],
            ].map(([place, body], index) => <article key={place}><span>{String(index + 1).padStart(2, "0")}</span><h3>{tx(place)}</h3><p>{tx(body)}</p></article>)}
          </div>
        </section>

        <section id="gallery" className={styles.gallerySection}>
          <div className={styles.galleryHeading}>
            <div><p className={styles.eyebrowDark}>{content.gallery.eyebrow}</p><h2>{content.gallery.title}</h2></div>
            <button type="button" onClick={() => setGalleryIndex(0)}><Expand size={16} />{content.gallery.expand}</button>
          </div>
          <div className={styles.galleryGrid}>
            {images.gallery.map((image, index) => (
              <button key={image.src} type="button" aria-label={content.gallery.captions[index]} onClick={() => setGalleryIndex(index)}>
                <Image src={image.src} alt={content.gallery.captions[index]} fill quality={90} sizes="(max-width: 700px) 50vw, (max-width: 960px) 50vw, 24vw" style={{ aspectRatio: `${image.width} / ${image.height}` }} />
                <span>{content.gallery.captions[index]}</span>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.guidanceSection}>
          <div className={styles.guidanceIntro}>
            <p className={styles.eyebrowDark}>{tx("08 — Why buy through AIXCO?")}</p>
            <h2>{content.guidance.title}</h2>
            <p>{content.guidance.body}</p>
          </div>
          <div className={styles.guidanceList}>
            {content.guidance.features.map((feature, index) => (
              <article key={feature.title}><span>0{index + 1}</span><div><h3>{feature.title}</h3><p>{feature.body}</p></div></article>
            ))}
          </div>
        </section>

        <section id="comparison" className={styles.comparisonSection}>
          <div className={styles.briefSectionIntro}>
            <p className={styles.eyebrowGold}>{tx("09 — Compare Batumi to other markets")}</p>
            <h2>{tx("Compare Batumi to other markets.")}</h2>
            <p>{tx("Compare entry pricing in context, then review the exact project, location, condition and ownership terms before making a decision.")}</p>
          </div>
          <div className={styles.comparisonTable} role="table" aria-label={tx("Coastal market comparison")}>
            <div role="row"><strong role="columnheader">{tx("Market")}</strong><strong role="columnheader">{tx("Position")}</strong><strong role="columnheader">{tx("Buyer consideration")}</strong></div>
            {[
              ["Batumi", "Emerging Black Sea market", "Accessible entry pricing and developing infrastructure"],
              ["Dubai", "Established international market", "Higher entry pricing and mature investor demand"],
              ["Mediterranean coast", "Mature European markets", "Limited supply in prime coastal locations"],
              ["Tbilisi", "Capital-city market", "Different demand profile from a resort-led coastal city"],
            ].map((row) => <div role="row" key={row[0]}>{row.map((cell) => <span role="cell" key={cell}>{tx(cell)}</span>)}</div>)}
          </div>
          <p className={styles.calculatorNote}>{tx("This qualitative comparison does not replace current price-per-square-metre data or project-level due diligence.")}</p>
        </section>

        <section id="journey" className={styles.journeySection}>
          <div className={styles.briefSectionIntro}>
            <p className={styles.eyebrowDark}>{tx("10 — Buyer journey")}</p>
            <h2>{tx("Buyer journey")}</h2>
          </div>
          <ol>
            {buyerJourney.map((step, index) => (
              <li key={step.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><h3>{tx(step.title)}</h3><p>{tx(step.body)}</p></div>
              </li>
            ))}
          </ol>
        </section>

        <section id="contact" className={styles.contactSection}>
          <div className={styles.contactMedia}>
            <Image src={images.contact.src} alt="Premium indoor pool and resident wellness area" fill quality={90} sizes="(max-width: 960px) 100vw, 50vw" style={{ aspectRatio: `${images.contact.width} / ${images.contact.height}` }} />
          </div>
          <div className={styles.contactPanel}>
            <p className={styles.eyebrowGold}>{tx("11 — Find the right property in Batumi")}</p>
            <h2 id="invest-batumi-contact-title">{content.contact.title}</h2>
            <p className={styles.contactIntro}>{content.contact.body}</p>
            <ul className={styles.contactIncludes}>
              {["Current availability", "Prices", "Floor plans", "Financing example", "Rental projections", "Investment guide"].map((item) => <li key={item}><Check size={14} />{tx(item)}</li>)}
            </ul>
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
                <label>{content.contact.phone}<input maxLength={40} name="phone" type="tel" autoComplete="tel" placeholder={content.contact.phonePlaceholder} /></label>
                <label>{content.contact.interest}<select name="interest" defaultValue={content.contact.interests[0]}>{content.contact.interests.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                <div className={styles.formRow}>
                  <label>{content.contact.budget}<select name="budget" defaultValue=""><option value="">{content.contact.budgetSelect}</option>{content.contact.budgetOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                  <label>{content.contact.unitType}<select name="unitType" defaultValue=""><option value="">{content.contact.unitTypeSelect}</option>{content.contact.unitTypeOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                </div>
                <label>{content.contact.message}<textarea minLength={0} maxLength={1500} rows={4} name="message" placeholder={content.contact.messagePlaceholder} /></label>
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
