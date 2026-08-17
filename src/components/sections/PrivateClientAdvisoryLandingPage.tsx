"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  ChevronDown,
  CircleDollarSign,
  FileCheck2,
  Globe2,
  Landmark,
  Menu,
  ShieldCheck,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { LANGS, useI18n } from "@/i18n/I18nProvider";
import type { Lang } from "@/i18n/languages";
import { useUI } from "@/components/ui-state";
import { recordContactSubmission } from "@/lib/backend/lead-capture";
import { getContactSubmitErrorMessage } from "@/lib/contact-submit-error";
import { openAnalyticsPreferences } from "@/lib/analytics/client";
import { aixcoLiveLogos } from "@/lib/aixco-live-assets";
import styles from "./PrivateClientAdvisoryLandingPage.module.css";

const heroImage = "/aixco-global-op2/images/batumi-mosaic-hd/batumi-golden-hour-coastline.webp";
const contextImage = "/aixco-global-op2/images/batumi-mosaic-hd/batumi-modern-coastline.jpg";

type Copy = {
  metaTitle: string;
  metaDescription: string;
  nav: { who: string; markets: string; model: string; structure: string; contact: string };
  hero: {
    eyebrow: string;
    title: string;
    accent: string;
    body: string;
    primary: string;
    secondary: string;
    location: string;
    imageAlt: string;
  };
  who: { eyebrow: string; title: string; paragraphs: string[] };
  markets: { eyebrow: string; title: string; body: string; current: string; currentBody: string; imageAlt: string };
  model: { eyebrow: string; title: string; body: string; steps: { title: string; body: string }[] };
  structure: { eyebrow: string; title: string; body: string; badges: string[]; note: string };
  transparency: { eyebrow: string; title: string; body: string; quarterly: string; items: { title: string; body: string }[] };
  closing: { eyebrow: string; title: string; body: string; primary: string; secondary: string; tertiary: string };
  contact: {
    eyebrow: string;
    title: string;
    body: string;
    name: string;
    email: string;
    interest: string;
    message: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    messagePlaceholder: string;
    interestOptions: string[];
    consent: string;
    submit: string;
    sending: string;
    successTitle: string;
    successBody: string;
    reference: string;
    another: string;
    error: string;
  };
  footer: { home: string; privacy: string; terms: string; cookies: string; rights: string };
  home: string;
  language: string;
  menu: string;
  closeMenu: string;
};

const copyByLanguage: Record<Lang, Copy> = {
  en: {
    metaTitle: "Emerging Market Real Estate Investment | AIXCO.Global",
    metaDescription: "AIXCO Global identifies, acquires, develops and manages residential real estate across high-growth emerging markets.",
    nav: { who: "Who we are", markets: "Emerging markets", model: "How we operate", structure: "Structure", contact: "Request a brief" },
    hero: {
      eyebrow: "Emerging market real estate specialist",
      title: "Emerging Market Real Estate.",
      accent: "Engineered for Long-Term Value.",
      body: "AIXCO Global identifies, acquires, develops and manages residential real estate across the world's fastest-growing property markets — turning early-stage opportunity into disciplined, long-term returns.",
      primary: "Discover the AIXCO Global Bond",
      secondary: "View current projects",
      location: "Batumi, Georgia",
      imageAlt: "Batumi coastline and high-rise skyline at golden hour",
    },
    who: {
      eyebrow: "01 — Who we are",
      title: "An international real estate investor, built for emerging markets.",
      paragraphs: [
        "AIXCO Global is an international real estate group focused exclusively on emerging and fast-growing property markets. Rooted in Swiss real estate heritage and long-term investment discipline, AIXCO identifies undervalued opportunities in markets on the edge of structural growth — acquiring, developing, and managing residential assets across the full property lifecycle.",
        "We don't follow capital into markets that have already matured. We move early — securing land and development opportunities at the lowest point of the price curve, building high-quality residential product, and capturing appreciation as each market comes of age. This is not passive property ownership. It is active, vertically integrated real estate investment, designed to compound value across market cycles.",
      ],
    },
    markets: {
      eyebrow: "02 — Why emerging markets",
      title: "We move before the market feels obvious.",
      body: "Mature real estate markets offer safety — but limited upside. Emerging markets offer what mature markets no longer can: early entry pricing, strong growth trajectories, and outsized appreciation potential.",
      current: "Current focus",
      currentBody: "Batumi, Georgia — one of Europe's fastest-growing coastal real estate markets — alongside a selective pipeline of opportunities across Georgia, the UAE, and other emerging economies with comparable structural tailwinds.",
      imageAlt: "Batumi modern coastline with towers beside the Black Sea",
    },
    model: {
      eyebrow: "03 — How we operate",
      title: "A vertically integrated real estate model.",
      body: "From the first market signal to the moment value is realized, the model keeps research, acquisition, development and portfolio growth connected.",
      steps: [
        { title: "Sourcing", body: "Identifying high-potential real estate and development opportunities before market pricing catches up." },
        { title: "Research & due diligence", body: "Testing the market, the asset, the legal context and the underlying assumptions before capital is committed." },
        { title: "Acquisition", body: "Securing land and property at the earliest, lowest-cost stage of the cycle." },
        { title: "Development", body: "Designing and building residential projects to institutional quality standards." },
        { title: "Income generation", body: "Producing rental income and sales revenue throughout the holding period." },
        { title: "Value realization", body: "Selling selected assets once value has been created, and reinvesting into new opportunities to grow the portfolio." },
      ],
    },
    structure: {
      eyebrow: "04 — Institutional structure",
      title: "Institutional structure. Regulated access.",
      body: "AIXCO Global Assets GmbH, the entity behind the AIXCO Global Bond, is headquartered in Vienna, Austria, and licensed for the purchase, sale, letting, financing and leasing of real estate.",
      badges: ["Vienna, Austria HQ", "Regulated bond issuer", "Listed on Vienna MTF", "Fixed 6% coupon"],
      note: "In December 2025, AIXCO Global Assets GmbH listed its 6% Subordinated Bond 2025–2030 (ISIN: AT0000A3QME7) on the Vienna MTF — giving investors regulated, transparent access to a diversified emerging-market real estate strategy, structured as a fixed-income instrument.",
    },
    transparency: {
      eyebrow: "04B — Governance & transparency",
      title: "Built on transparency.",
      body: "AIXCO Global operates with the transparency investors expect from a regulated, listed issuer. Every investment decision, project update, and financial result is communicated clearly and on a consistent schedule — so investors always know exactly where their capital stands.",
      quarterly: "We report to our investors on a quarterly basis, covering portfolio performance, project progress, and financial results — giving you continuous visibility into how your investment is performing, not just an annual snapshot.",
      items: [
        { title: "Quarterly reporting", body: "Regular updates on portfolio performance, project milestones, and financials." },
        { title: "Regulated structure", body: "Bond issued under a licensed, regulated framework and listed on the Vienna MTF." },
        { title: "Clear communication", body: "Direct access to our investment team for questions at any time." },
        { title: "Full disclosure", body: "Transparent presentation of risks, returns, and underlying real estate assets." },
      ],
    },
    closing: {
      eyebrow: "05 — Begin the conversation",
      title: "Invest where growth is just beginning.",
      body: "AIXCO Global gives investors direct access to a professionally managed, emerging-market real estate strategy — without the burden of owning or managing property directly.",
      primary: "Explore the AIXCO Global Bond",
      secondary: "View current projects",
      tertiary: "Talk to an investment specialist",
    },
    contact: {
      eyebrow: "Private investor briefing",
      title: "Make the opportunity legible.",
      body: "Tell us what you are considering and our team will prepare a focused introduction to the AIXCO Global Bond and current real estate opportunities.",
      name: "Full name",
      email: "Email address",
      interest: "Area of interest",
      message: "Your message",
      namePlaceholder: "Your name",
      emailPlaceholder: "you@example.com",
      messagePlaceholder: "Tell us what you are exploring",
      interestOptions: ["AIXCO Global Bond", "Current projects", "Emerging-market strategy", "Investment specialist"],
      consent: "By sending this form, you agree that AIXCO may contact you about your request.",
      submit: "Request an investment brief",
      sending: "Sending request",
      successTitle: "Your request is with us.",
      successBody: "A member of the AIXCO investment team will be in touch shortly.",
      reference: "Reference",
      another: "Send another request",
      error: "We could not send this request. Please try again or email us directly.",
    },
    footer: { home: "Main website", privacy: "Privacy", terms: "Terms", cookies: "Cookie preferences", rights: "All rights reserved." },
    home: "AIXCO.Global home",
    language: "Change language",
    menu: "Open menu",
    closeMenu: "Close menu",
  },
  de: {
    metaTitle: "Immobilieninvestments in Wachstumsmärkten | AIXCO.Global",
    metaDescription: "AIXCO Global identifiziert, erwirbt, entwickelt und verwaltet Wohnimmobilien in wachstumsstarken Schwellenmärkten.",
    nav: { who: "Über uns", markets: "Wachstumsmärkte", model: "Unser Modell", structure: "Struktur", contact: "Brief anfragen" },
    hero: {
      eyebrow: "Spezialist für Immobilien in Wachstumsmärkten",
      title: "Immobilien in Wachstumsmärkten.",
      accent: "Für langfristigen Wert entwickelt.",
      body: "AIXCO Global identifiziert, erwirbt, entwickelt und verwaltet Wohnimmobilien in den wachstumsstärksten Märkten — und macht frühe Chancen zu disziplinierten, langfristigen Erträgen.",
      primary: "Die AIXCO Global Anleihe entdecken",
      secondary: "Aktuelle Projekte ansehen",
      location: "Batumi, Georgien",
      imageAlt: "Küste und Skyline von Batumi in der goldenen Stunde",
    },
    who: {
      eyebrow: "01 — Über uns",
      title: "Ein internationaler Immobilieninvestor für Wachstumsmärkte.",
      paragraphs: [
        "AIXCO Global ist eine internationale Immobiliengruppe mit klarem Fokus auf aufstrebende und schnell wachsende Immobilienmärkte. Verwurzelt in Schweizer Immobilienerfahrung und langfristiger Investitionsdisziplin, identifiziert AIXCO unterbewertete Chancen an der Schwelle zu strukturellem Wachstum — und erwirbt, entwickelt und verwaltet Wohnimmobilien über den gesamten Lebenszyklus.",
        "Wir folgen keinem Kapital in Märkte, die bereits ausgereift sind. Wir handeln früh — sichern Grundstücke und Entwicklungschancen am unteren Ende der Preiskurve, bauen hochwertige Wohnprodukte und realisieren Wertsteigerungen, wenn ein Markt reift. Das ist kein passiver Immobilienbesitz, sondern aktive, vertikal integrierte Immobilieninvestition.",
      ],
    },
    markets: {
      eyebrow: "02 — Warum Wachstumsmärkte",
      title: "Wir handeln, bevor der Markt offensichtlich wird.",
      body: "Reife Immobilienmärkte bieten Sicherheit — aber begrenztes Aufwärtspotenzial. Wachstumsmärkte bieten frühe Einstiegspreise, starke Wachstumspfade und überdurchschnittliches Wertsteigerungspotenzial.",
      current: "Aktueller Fokus",
      currentBody: "Batumi, Georgien — einer der am schnellsten wachsenden Küstenimmobilienmärkte Europas — sowie eine selektive Pipeline in Georgien, den VAE und anderen Volkswirtschaften mit vergleichbaren strukturellen Wachstumstreibern.",
      imageAlt: "Moderne Skyline von Batumi am Schwarzen Meer",
    },
    model: {
      eyebrow: "03 — Unser Vorgehen",
      title: "Ein vertikal integriertes Immobilienmodell.",
      body: "Vom ersten Marktsignal bis zur Realisierung des Werts verbindet unser Modell Forschung, Erwerb, Entwicklung und Portfoliowachstum.",
      steps: [
        { title: "Sourcing", body: "Hochpotenzielle Immobilien- und Entwicklungschancen erkennen, bevor die Marktpreise nachziehen." },
        { title: "Recherche & Due Diligence", body: "Markt, Objekt, rechtlichen Kontext und Annahmen prüfen, bevor Kapital gebunden wird." },
        { title: "Erwerb", body: "Grundstücke und Immobilien in der frühesten und kostengünstigsten Phase des Zyklus sichern." },
        { title: "Entwicklung", body: "Wohnprojekte nach institutionellen Qualitätsstandards planen und bauen." },
        { title: "Ertrag", body: "Während der Haltedauer Mieteinnahmen und Verkaufserlöse erzielen." },
        { title: "Wertrealisierung", body: "Ausgewählte Objekte nach der Wertschöpfung verkaufen und in neue Chancen reinvestieren." },
      ],
    },
    structure: {
      eyebrow: "04 — Institutionelle Struktur",
      title: "Institutionelle Struktur. Regulierter Zugang.",
      body: "Die AIXCO Global Assets GmbH, die hinter der AIXCO Global Anleihe steht, hat ihren Sitz in Wien und ist für Kauf, Verkauf, Vermietung, Finanzierung und Leasing von Immobilien lizenziert.",
      badges: ["Sitz in Wien, Österreich", "Regulierter Anleiheemittent", "An der Vienna MTF gelistet", "Fester Kupon von 6 %"],
      note: "Im Dezember 2025 notierte die AIXCO Global Assets GmbH ihre 6% Subordinated Bond 2025–2030 (ISIN: AT0000A3QME7) an der Vienna MTF — als regulierten und transparenten Zugang zu einer diversifizierten Immobilienstrategie in Wachstumsmärkten.",
    },
    transparency: {
      eyebrow: "04B — Governance & Transparenz",
      title: "Auf Transparenz gebaut.",
      body: "AIXCO Global arbeitet mit der Transparenz, die Anleger von einem regulierten, gelisteten Emittenten erwarten. Jede Investitionsentscheidung, jedes Projektupdate und jedes Finanzergebnis wird klar und nach einem festen Zeitplan kommuniziert.",
      quarterly: "Wir berichten vierteljährlich über Portfolioperformance, Projektfortschritt und Finanzergebnisse — damit Anleger kontinuierlich sehen, wie sich ihre Investition entwickelt.",
      items: [
        { title: "Quartalsberichte", body: "Regelmäßige Updates zu Portfolio, Meilensteinen und Finanzen." },
        { title: "Regulierte Struktur", body: "Anleihe in einem lizenzierten Rahmen, gelistet an der Vienna MTF." },
        { title: "Klare Kommunikation", body: "Direkter Zugang zu unserem Investmentteam für Fragen." },
        { title: "Vollständige Offenlegung", body: "Transparente Darstellung von Risiken, Erträgen und Immobilienwerten." },
      ],
    },
    closing: {
      eyebrow: "05 — Gespräch beginnen",
      title: "Investieren, wo Wachstum gerade beginnt.",
      body: "AIXCO Global bietet direkten Zugang zu einer professionell verwalteten Immobilienstrategie in Wachstumsmärkten — ohne Immobilien selbst besitzen oder verwalten zu müssen.",
      primary: "Die AIXCO Global Anleihe entdecken",
      secondary: "Aktuelle Projekte ansehen",
      tertiary: "Mit einem Investmentexperten sprechen",
    },
    contact: {
      eyebrow: "Privates Anlegerbriefing",
      title: "Die Chance verständlich machen.",
      body: "Erzählen Sie uns, was Sie prüfen. Unser Team bereitet eine fokussierte Einführung in die AIXCO Global Anleihe und aktuelle Immobilienchancen vor.",
      name: "Vollständiger Name",
      email: "E-Mail-Adresse",
      interest: "Interesse",
      message: "Ihre Nachricht",
      namePlaceholder: "Ihr Name",
      emailPlaceholder: "sie@beispiel.com",
      messagePlaceholder: "Was möchten Sie prüfen?",
      interestOptions: ["AIXCO Global Anleihe", "Aktuelle Projekte", "Strategie für Wachstumsmärkte", "Investmentexperte"],
      consent: "Mit dem Absenden stimmen Sie zu, dass AIXCO Sie zu Ihrer Anfrage kontaktieren darf.",
      submit: "Investmentbrief anfragen",
      sending: "Anfrage wird gesendet",
      successTitle: "Ihre Anfrage ist bei uns.",
      successBody: "Ein Mitglied des AIXCO Investmentteams meldet sich in Kürze.",
      reference: "Referenz",
      another: "Weitere Anfrage senden",
      error: "Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
    },
    footer: { home: "Hauptwebsite", privacy: "Datenschutz", terms: "Bedingungen", cookies: "Cookie-Einstellungen", rights: "Alle Rechte vorbehalten." },
    home: "AIXCO.Global Startseite",
    language: "Sprache ändern",
    menu: "Menü öffnen",
    closeMenu: "Menü schließen",
  },
  pl: {
    metaTitle: "Nieruchomości na rynkach wschodzących | AIXCO.Global",
    metaDescription: "AIXCO Global identyfikuje, nabywa, rozwija i zarządza nieruchomościami mieszkaniowymi na szybko rosnących rynkach.",
    nav: { who: "O nas", markets: "Rynki wschodzące", model: "Nasz model", structure: "Struktura", contact: "Poproś o brief" },
    hero: {
      eyebrow: "Specjalista od nieruchomości na rynkach wschodzących",
      title: "Nieruchomości na rynkach wschodzących.",
      accent: "Zaprojektowane dla długoterminowej wartości.",
      body: "AIXCO Global identyfikuje, nabywa, rozwija i zarządza nieruchomościami mieszkaniowymi na najszybciej rosnących rynkach — zamieniając wczesne szanse w zdyscyplinowane, długoterminowe zwroty.",
      primary: "Poznaj obligację AIXCO Global",
      secondary: "Zobacz aktualne projekty",
      location: "Batumi, Gruzja",
      imageAlt: "Wybrzeże i panorama Batumi o złotej godzinie",
    },
    who: {
      eyebrow: "01 — O nas",
      title: "Międzynarodowy inwestor nieruchomości zbudowany dla rynków wschodzących.",
      paragraphs: [
        "AIXCO Global to międzynarodowa grupa nieruchomości skupiona wyłącznie na rynkach wschodzących i szybko rosnących. Łącząc szwajcarskie dziedzictwo nieruchomości z długoterminową dyscypliną inwestycyjną, AIXCO wyszukuje niedowartościowane szanse na rynkach stojących u progu strukturalnego wzrostu — nabywając, rozwijając i zarządzając aktywami mieszkaniowymi przez cały cykl życia.",
        "Nie podążamy za kapitałem na rynki, które już dojrzały. Działamy wcześnie — zabezpieczamy grunty i możliwości deweloperskie przy najniższym punkcie krzywej cenowej, tworzymy wysokiej jakości produkt mieszkaniowy i realizujemy wzrost wartości wraz z dojrzewaniem rynku. To aktywne, wertykalnie zintegrowane inwestowanie w nieruchomości.",
      ],
    },
    markets: {
      eyebrow: "02 — Dlaczego rynki wschodzące",
      title: "Działamy, zanim rynek stanie się oczywisty.",
      body: "Dojrzałe rynki nieruchomości oferują bezpieczeństwo — ale ograniczony potencjał wzrostu. Rynki wschodzące oferują wczesne ceny wejścia, silne trajektorie wzrostu i ponadprzeciętny potencjał aprecjacji.",
      current: "Obecny fokus",
      currentBody: "Batumi w Gruzji — jeden z najszybciej rozwijających się nadmorskich rynków nieruchomości w Europie — oraz wybrana lista możliwości w Gruzji, ZEA i innych gospodarkach o podobnych, strukturalnych czynnikach wzrostu.",
      imageAlt: "Nowoczesna panorama Batumi nad Morzem Czarnym",
    },
    model: {
      eyebrow: "03 — Jak działamy",
      title: "Wertykalnie zintegrowany model nieruchomości.",
      body: "Od pierwszego sygnału rynkowego do realizacji wartości łączymy badania, nabycie, rozwój i wzrost portfela.",
      steps: [
        { title: "Wyszukiwanie", body: "Identyfikujemy nieruchomości i projekty o wysokim potencjale, zanim ceny odzwierciedlą ich wartość." },
        { title: "Badanie i due diligence", body: "Sprawdzamy rynek, aktywo, kontekst prawny i założenia przed zaangażowaniem kapitału." },
        { title: "Nabycie", body: "Zabezpieczamy grunty i nieruchomości na najwcześniejszym, najtańszym etapie cyklu." },
        { title: "Rozwój", body: "Projektujemy i budujemy inwestycje mieszkaniowe według instytucjonalnych standardów jakości." },
        { title: "Generowanie dochodu", body: "Uzyskujemy dochód z najmu i sprzedaży w całym okresie posiadania." },
        { title: "Realizacja wartości", body: "Sprzedajemy wybrane aktywa po stworzeniu wartości i reinwestujemy w nowe możliwości." },
      ],
    },
    structure: {
      eyebrow: "04 — Struktura instytucjonalna",
      title: "Struktura instytucjonalna. Regulowany dostęp.",
      body: "AIXCO Global Assets GmbH, podmiot stojący za obligacją AIXCO Global, ma siedzibę w Wiedniu i posiada licencję na zakup, sprzedaż, wynajem, finansowanie i leasing nieruchomości.",
      badges: ["Siedziba: Wiedeń", "Regulowany emitent obligacji", "Notowana na Vienna MTF", "Stały kupon 6%"],
      note: "W grudniu 2025 roku AIXCO Global Assets GmbH wprowadziła na Vienna MTF obligację 6% Subordinated Bond 2025–2030 (ISIN: AT0000A3QME7), oferując regulowany i przejrzysty dostęp do zdywersyfikowanej strategii nieruchomości na rynkach wschodzących.",
    },
    transparency: {
      eyebrow: "04B — Zarządzanie i przejrzystość",
      title: "Zbudowane na przejrzystości.",
      body: "AIXCO Global działa z przejrzystością oczekiwaną od regulowanego, notowanego emitenta. Każda decyzja inwestycyjna, aktualizacja projektu i wynik finansowy są komunikowane jasno i zgodnie z harmonogramem.",
      quarterly: "Kwartalnie raportujemy wyniki portfela, postęp projektów i rezultaty finansowe — zapewniając stały wgląd w wyniki inwestycji, a nie tylko roczne podsumowanie.",
      items: [
        { title: "Raportowanie kwartalne", body: "Regularne aktualizacje wyników portfela, kamieni milowych i finansów." },
        { title: "Regulowana struktura", body: "Obligacja wyemitowana w licencjonowanych ramach i notowana na Vienna MTF." },
        { title: "Jasna komunikacja", body: "Bezpośredni dostęp do zespołu inwestycyjnego." },
        { title: "Pełne ujawnienie", body: "Przejrzysta prezentacja ryzyk, zwrotów i aktywów nieruchomościowych." },
      ],
    },
    closing: {
      eyebrow: "05 — Rozpocznij rozmowę",
      title: "Inwestuj tam, gdzie wzrost dopiero się zaczyna.",
      body: "AIXCO Global zapewnia bezpośredni dostęp do profesjonalnie zarządzanej strategii nieruchomości na rynkach wschodzących — bez konieczności samodzielnego posiadania i zarządzania nieruchomością.",
      primary: "Poznaj obligację AIXCO Global",
      secondary: "Zobacz aktualne projekty",
      tertiary: "Porozmawiaj ze specjalistą inwestycyjnym",
    },
    contact: {
      eyebrow: "Prywatny briefing inwestorski",
      title: "Uczyń szansę zrozumiałą.",
      body: "Opowiedz nam, co rozważasz, a nasz zespół przygotuje skoncentrowane wprowadzenie do obligacji AIXCO Global i aktualnych możliwości nieruchomościowych.",
      name: "Imię i nazwisko",
      email: "Adres e-mail",
      interest: "Obszar zainteresowania",
      message: "Twoja wiadomość",
      namePlaceholder: "Twoje imię",
      emailPlaceholder: "ty@przyklad.pl",
      messagePlaceholder: "Co chcesz poznać?",
      interestOptions: ["Obligacja AIXCO Global", "Aktualne projekty", "Strategia rynków wschodzących", "Specjalista inwestycyjny"],
      consent: "Wysyłając formularz, zgadzasz się, aby AIXCO skontaktowało się z Tobą w sprawie zapytania.",
      submit: "Poproś o brief inwestycyjny",
      sending: "Wysyłanie zapytania",
      successTitle: "Otrzymaliśmy Twoje zapytanie.",
      successBody: "Członek zespołu inwestycyjnego AIXCO wkrótce się z Tobą skontaktuje.",
      reference: "Numer referencyjny",
      another: "Wyślij kolejne zapytanie",
      error: "Nie udało się wysłać zapytania. Spróbuj ponownie.",
    },
    footer: { home: "Strona główna", privacy: "Prywatność", terms: "Warunki", cookies: "Ustawienia plików cookie", rights: "Wszelkie prawa zastrzeżone." },
    home: "Strona główna AIXCO.Global",
    language: "Zmień język",
    menu: "Otwórz menu",
    closeMenu: "Zamknij menu",
  },
  sl: {
    metaTitle: "Nepremičnine na rastočih trgih | AIXCO.Global",
    metaDescription: "AIXCO Global prepoznava, pridobiva, razvija in upravlja stanovanjske nepremičnine na hitro rastočih trgih.",
    nav: { who: "O nas", markets: "Rastoči trgi", model: "Naš model", structure: "Struktura", contact: "Zahtevajte povzetek" },
    hero: {
      eyebrow: "Specialist za nepremičnine na rastočih trgih",
      title: "Nepremičnine na rastočih trgih.",
      accent: "Ustvarjene za dolgoročno vrednost.",
      body: "AIXCO Global prepoznava, pridobiva, razvija in upravlja stanovanjske nepremičnine na najhitreje rastočih trgih — zgodnje priložnosti spreminja v disciplinirane, dolgoročne donose.",
      primary: "Spoznajte obveznico AIXCO Global",
      secondary: "Oglejte si aktualne projekte",
      location: "Batumi, Gruzija",
      imageAlt: "Obala in panorama Batumija ob zlati uri",
    },
    who: {
      eyebrow: "01 — O nas",
      title: "Mednarodni vlagatelj v nepremičnine, zgrajen za rastoče trge.",
      paragraphs: [
        "AIXCO Global je mednarodna nepremičninska skupina, osredotočena izključno na rastoče in hitro razvijajoče se trge. Z združevanjem švicarske nepremičninske dediščine in dolgoročne naložbene discipline AIXCO prepoznava podcenjene priložnosti na trgih pred strukturno rastjo — ter pridobiva, razvija in upravlja stanovanjska sredstva skozi celoten življenjski cikel.",
        "Ne sledimo kapitalu na trge, ki so že dozoreli. Delujemo zgodaj — zagotavljamo zemljišča in razvojne priložnosti na najnižji točki cenovne krivulje, gradimo kakovostne stanovanjske projekte in zajemamo rast vrednosti, ko trg dozoreva. To je aktivno, vertikalno integrirano vlaganje v nepremičnine.",
      ],
    },
    markets: {
      eyebrow: "02 — Zakaj rastoči trgi",
      title: "Delujemo, še preden trg postane očiten.",
      body: "Zreli nepremičninski trgi ponujajo varnost — vendar omejen potencial rasti. Rastoči trgi ponujajo zgodnje vstopne cene, močne razvojne poti in nadpovprečen potencial rasti vrednosti.",
      current: "Trenutna osredotočenost",
      currentBody: "Batumi v Gruziji — eden najhitreje rastočih obalnih nepremičninskih trgov v Evropi — ter izbrani nabor priložnosti v Gruziji, ZAE in drugih gospodarstvih s primerljivimi strukturnimi dejavniki rasti.",
      imageAlt: "Sodobna panorama Batumija ob Črnem morju",
    },
    model: {
      eyebrow: "03 — Kako delujemo",
      title: "Vertikalno integriran nepremičninski model.",
      body: "Od prvega tržnega signala do uresničitve vrednosti povezujemo raziskave, pridobivanje, razvoj in rast portfelja.",
      steps: [
        { title: "Iskanje", body: "Prepoznamo nepremičnine in razvojne priložnosti z visokim potencialom, preden jih ovrednoti trg." },
        { title: "Raziskave in skrbni pregled", body: "Pred zavezo kapitala preverimo trg, sredstvo, pravni kontekst in ključne predpostavke." },
        { title: "Pridobitev", body: "Zagotovimo zemljišča in nepremičnine v najzgodnejši in stroškovno najugodnejši fazi cikla." },
        { title: "Razvoj", body: "Načrtujemo in gradimo stanovanjske projekte po institucionalnih standardih kakovosti." },
        { title: "Ustvarjanje prihodka", body: "V obdobju lastništva ustvarjamo najemnine in prihodke od prodaje." },
        { title: "Uresničitev vrednosti", body: "Izbrana sredstva prodamo po ustvarjeni vrednosti in sredstva ponovno vložimo v nove priložnosti." },
      ],
    },
    structure: {
      eyebrow: "04 — Institucionalna struktura",
      title: "Institucionalna struktura. Reguliran dostop.",
      body: "AIXCO Global Assets GmbH, družba za obveznico AIXCO Global, ima sedež na Dunaju in licenco za nakup, prodajo, oddajanje, financiranje in lizing nepremičnin.",
      badges: ["Sedež: Dunaj, Avstrija", "Regulirani izdajatelj obveznic", "Uvrščena na Vienna MTF", "Fiksni kupon 6 %"],
      note: "Decembra 2025 je AIXCO Global Assets GmbH na Vienna MTF uvrstila 6% Subordinated Bond 2025–2030 (ISIN: AT0000A3QME7), ki vlagateljem omogoča reguliran in pregleden dostop do razpršene nepremičninske strategije na rastočih trgih.",
    },
    transparency: {
      eyebrow: "04B — Upravljanje in preglednost",
      title: "Zgrajeno na preglednosti.",
      body: "AIXCO Global deluje s preglednostjo, ki jo vlagatelji pričakujejo od reguliranega, kotiranega izdajatelja. Vsaka naložbena odločitev, posodobitev projekta in finančni rezultat so sporočeni jasno in po stalnem urniku.",
      quarterly: "Vlagatelje četrtletno obveščamo o uspešnosti portfelja, napredku projektov in finančnih rezultatih — za stalni vpogled v uspešnost naložbe.",
      items: [
        { title: "Četrtletno poročanje", body: "Redne posodobitve portfelja, mejnikov projektov in financ." },
        { title: "Regulirana struktura", body: "Obveznica je izdana v licenciranem okviru in uvrščena na Vienna MTF." },
        { title: "Jasna komunikacija", body: "Neposreden dostop do naše naložbene ekipe." },
        { title: "Popolno razkritje", body: "Pregleden prikaz tveganj, donosov in osnovnih nepremičninskih sredstev." },
      ],
    },
    closing: {
      eyebrow: "05 — Začnite pogovor",
      title: "Vlagajte tam, kjer se rast šele začenja.",
      body: "AIXCO Global vlagateljem omogoča neposreden dostop do strokovno upravljane nepremičninske strategije na rastočih trgih — brez bremena neposrednega lastništva ali upravljanja nepremičnin.",
      primary: "Spoznajte obveznico AIXCO Global",
      secondary: "Oglejte si aktualne projekte",
      tertiary: "Pogovor z naložbenim strokovnjakom",
    },
    contact: {
      eyebrow: "Zasebni naložbeni briefing",
      title: "Naj bo priložnost razumljiva.",
      body: "Povejte nam, kaj razmišljate, naša ekipa pa bo pripravila osredotočeno predstavitev obveznice AIXCO Global in aktualnih nepremičninskih priložnosti.",
      name: "Polno ime",
      email: "E-poštni naslov",
      interest: "Področje zanimanja",
      message: "Vaše sporočilo",
      namePlaceholder: "Vaše ime",
      emailPlaceholder: "vi@primer.si",
      messagePlaceholder: "Kaj raziskujete?",
      interestOptions: ["Obveznica AIXCO Global", "Aktualni projekti", "Strategija rastočih trgov", "Naložbeni strokovnjak"],
      consent: "Z oddajo obrazca se strinjate, da vas AIXCO lahko kontaktira glede vašega povpraševanja.",
      submit: "Zahtevajte naložbeni brief",
      sending: "Pošiljanje povpraševanja",
      successTitle: "Vaše povpraševanje smo prejeli.",
      successBody: "Član naložbene ekipe AIXCO vas bo kmalu kontaktiral.",
      reference: "Referenca",
      another: "Pošlji novo povpraševanje",
      error: "Povpraševanja ni bilo mogoče poslati. Poskusite znova.",
    },
    footer: { home: "Domača stran", privacy: "Zasebnost", terms: "Pogoji", cookies: "Nastavitve piškotkov", rights: "Vse pravice pridržane." },
    home: "Domača stran AIXCO.Global",
    language: "Spremeni jezik",
    menu: "Odpri meni",
    closeMenu: "Zapri meni",
  },
  ru: {
    metaTitle: "Недвижимость на развивающихся рынках | AIXCO.Global",
    metaDescription: "AIXCO Global выявляет, приобретает, развивает и управляет жилой недвижимостью на быстрорастущих рынках.",
    nav: { who: "О нас", markets: "Растущие рынки", model: "Наша модель", structure: "Структура", contact: "Запросить бриф" },
    hero: {
      eyebrow: "Специалист по недвижимости на развивающихся рынках",
      title: "Недвижимость на развивающихся рынках.",
      accent: "Создана для долгосрочной ценности.",
      body: "AIXCO Global выявляет, приобретает, развивает и управляет жилой недвижимостью на самых быстрорастущих рынках — превращая ранние возможности в дисциплинированную долгосрочную доходность.",
      primary: "Узнать об облигации AIXCO Global",
      secondary: "Посмотреть текущие проекты",
      location: "Батуми, Грузия",
      imageAlt: "Побережье и панорама Батуми в золотой час",
    },
    who: {
      eyebrow: "01 — О компании",
      title: "Международный инвестор в недвижимость для развивающихся рынков.",
      paragraphs: [
        "AIXCO Global — международная группа в сфере недвижимости, сосредоточенная исключительно на развивающихся и быстрорастущих рынках. Опираясь на швейцарское наследие в недвижимости и долгосрочную инвестиционную дисциплину, AIXCO выявляет недооцененные возможности на рынках, находящихся на пороге структурного роста — приобретая, развивая и управляя жилыми активами на протяжении всего жизненного цикла.",
        "Мы не следуем за капиталом на уже зрелые рынки. Мы действуем рано — обеспечиваем землю и возможности развития на нижней точке ценовой кривой, создаем качественный жилой продукт и фиксируем рост по мере взросления рынка. Это активное, вертикально интегрированное инвестирование в недвижимость.",
      ],
    },
    markets: {
      eyebrow: "02 — Почему развивающиеся рынки",
      title: "Мы действуем до того, как рынок становится очевидным.",
      body: "Зрелые рынки недвижимости дают безопасность, но ограниченный потенциал роста. Развивающиеся рынки дают ранние цены входа, сильную динамику роста и значительный потенциал увеличения стоимости.",
      current: "Текущий фокус",
      currentBody: "Батуми, Грузия — один из самых быстрорастущих прибрежных рынков недвижимости Европы — а также тщательно отобранные возможности в Грузии, ОАЭ и других экономиках с сопоставимыми структурными факторами роста.",
      imageAlt: "Современная панорама Батуми у Черного моря",
    },
    model: {
      eyebrow: "03 — Как мы работаем",
      title: "Вертикально интегрированная модель недвижимости.",
      body: "От первого рыночного сигнала до реализации стоимости мы объединяем исследование, приобретение, развитие и рост портфеля.",
      steps: [
        { title: "Поиск", body: "Выявляем перспективные объекты и возможности развития до того, как цены отражают их потенциал." },
        { title: "Исследование и проверка", body: "Проверяем рынок, актив, правовой контекст и ключевые предпосылки до вложения капитала." },
        { title: "Приобретение", body: "Обеспечиваем землю и недвижимость на самой ранней и экономичной стадии цикла." },
        { title: "Развитие", body: "Проектируем и строим жилые проекты по институциональным стандартам качества." },
        { title: "Формирование дохода", body: "Создаем арендный доход и выручку от продаж в течение периода владения." },
        { title: "Реализация стоимости", body: "Продаем отдельные активы после создания стоимости и реинвестируем в новые возможности." },
      ],
    },
    structure: {
      eyebrow: "04 — Институциональная структура",
      title: "Институциональная структура. Регулируемый доступ.",
      body: "AIXCO Global Assets GmbH, компания, стоящая за облигацией AIXCO Global, находится в Вене и имеет лицензию на покупку, продажу, сдачу в аренду, финансирование и лизинг недвижимости.",
      badges: ["Штаб-квартира: Вена", "Регулируемый эмитент облигаций", "Листинг на Vienna MTF", "Фиксированный купон 6%"],
      note: "В декабре 2025 года AIXCO Global Assets GmbH разместила на Vienna MTF 6% Subordinated Bond 2025–2030 (ISIN: AT0000A3QME7), предоставляя регулируемый и прозрачный доступ к диверсифицированной стратегии недвижимости на развивающихся рынках.",
    },
    transparency: {
      eyebrow: "04B — Управление и прозрачность",
      title: "Основано на прозрачности.",
      body: "AIXCO Global работает с уровнем прозрачности, которого инвесторы ожидают от регулируемого эмитента с листингом. Каждое инвестиционное решение, обновление по проектам и финансовый результат сообщаются ясно и по установленному графику.",
      quarterly: "Мы ежеквартально отчитываемся о результатах портфеля, ходе проектов и финансовых показателях, обеспечивая постоянную видимость эффективности инвестиций.",
      items: [
        { title: "Квартальная отчетность", body: "Регулярные обновления по портфелю, этапам проектов и финансам." },
        { title: "Регулируемая структура", body: "Облигация выпущена в лицензированной структуре и котируется на Vienna MTF." },
        { title: "Понятная коммуникация", body: "Прямой доступ к нашей инвестиционной команде." },
        { title: "Полное раскрытие", body: "Прозрачное представление рисков, доходности и базовых активов недвижимости." },
      ],
    },
    closing: {
      eyebrow: "05 — Начать разговор",
      title: "Инвестируйте там, где рост только начинается.",
      body: "AIXCO Global предоставляет прямой доступ к профессионально управляемой стратегии недвижимости на развивающихся рынках — без необходимости самостоятельно владеть или управлять недвижимостью.",
      primary: "Узнать об облигации AIXCO Global",
      secondary: "Посмотреть текущие проекты",
      tertiary: "Поговорить с инвестиционным специалистом",
    },
    contact: {
      eyebrow: "Персональный инвестиционный брифинг",
      title: "Сделаем возможность понятной.",
      body: "Расскажите, что вы рассматриваете, и наша команда подготовит краткое введение в облигацию AIXCO Global и текущие возможности в недвижимости.",
      name: "Полное имя",
      email: "Электронная почта",
      interest: "Область интереса",
      message: "Ваше сообщение",
      namePlaceholder: "Ваше имя",
      emailPlaceholder: "you@example.com",
      messagePlaceholder: "Что вы рассматриваете?",
      interestOptions: ["Облигация AIXCO Global", "Текущие проекты", "Стратегия развивающихся рынков", "Инвестиционный специалист"],
      consent: "Отправляя форму, вы соглашаетесь, что AIXCO может связаться с вами по вашему запросу.",
      submit: "Запросить инвестиционный бриф",
      sending: "Запрос отправляется",
      successTitle: "Мы получили ваш запрос.",
      successBody: "Член инвестиционной команды AIXCO свяжется с вами в ближайшее время.",
      reference: "Номер обращения",
      another: "Отправить новый запрос",
      error: "Не удалось отправить запрос. Попробуйте еще раз.",
    },
    footer: { home: "Главная", privacy: "Конфиденциальность", terms: "Условия", cookies: "Настройки файлов cookie", rights: "Все права защищены." },
    home: "Главная AIXCO.Global",
    language: "Изменить язык",
    menu: "Открыть меню",
    closeMenu: "Закрыть меню",
  },
};

const sectionIds = ["who", "markets", "model", "structure", "contact"] as const;

export function PrivateClientAdvisoryLandingPage() {
  const { lang, setLang } = useI18n();
  const { openPrivacy, openTerms } = useUI();
  const content = copyByLanguage[lang];
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [requestReference, setRequestReference] = useState<string | null>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const formStartedAt = useRef(Date.now());

  useEffect(() => {
    document.title = content.metaTitle;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) description.content = content.metaDescription;
  }, [content.metaDescription, content.metaTitle]);

  useEffect(() => {
    if (!languageOpen) return;
    const close = (event: PointerEvent) => {
      if (event.target instanceof Node && !languageRef.current?.contains(event.target)) setLanguageOpen(false);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setLanguageOpen(false); };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", escape);
    return () => { window.removeEventListener("pointerdown", close); window.removeEventListener("keydown", escape); };
  }, [languageOpen]);

  const goTo = (id: string) => {
    setMenuOpen(false);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
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
      { name, email, interest: `AIXCO Global Bond: ${interest}`, message, requestType: "message" },
      { antiAbuse: { website, startedAt: formStartedAt.current }, locale: lang },
    );
    setSubmitting(false);
    if (result.ok) {
      setRequestReference(result.reference ?? null);
      setSubmitted(true);
      return;
    }
    setSubmitError(content.contact.error || getContactSubmitErrorMessage(result.reason));
  };

  const iconForStep = [TrendingUp, FileCheck2, Building2, Landmark, CircleDollarSign, BarChart3] as const;

  return (
    <div id="main-content" className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" aria-label={content.home} className={styles.logoLink}>
            <Image src={aixcoLiveLogos.aixcoHorizontalDark} alt="AIXCO.Global" width={1600} height={333} priority sizes="10rem" />
          </Link>
          <nav className={styles.desktopNav} aria-label="Primary navigation">
            <button type="button" onClick={() => goTo("who")}>{content.nav.who}</button>
            <button type="button" onClick={() => goTo("markets")}>{content.nav.markets}</button>
            <button type="button" onClick={() => goTo("model")}>{content.nav.model}</button>
            <button type="button" onClick={() => goTo("structure")}>{content.nav.structure}</button>
          </nav>
          <div className={styles.headerActions}>
            <button type="button" className={styles.headerCta} onClick={() => goTo("contact")}>
              {content.nav.contact}<ArrowUpRight size={14} aria-hidden />
            </button>
            <div className={styles.language} ref={languageRef}>
              <button type="button" className={styles.languageButton} aria-label={`${content.language}: ${lang.toUpperCase()}`} aria-expanded={languageOpen} onClick={() => setLanguageOpen((open) => !open)}>
                <Globe2 size={15} aria-hidden /><span>{lang.toUpperCase()}</span><ChevronDown size={13} className={languageOpen ? styles.chevronOpen : ""} aria-hidden />
              </button>
              {languageOpen && (
                <div className={styles.languageMenu}>
                  {LANGS.map((option) => (
                    <button key={option.code} type="button" data-active={option.code === lang} onClick={() => { setLang(option.code); setLanguageOpen(false); }}>
                      <span>{option.label}</span><span>{option.native}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="button" className={styles.menuButton} aria-label={menuOpen ? content.closeMenu : content.menu} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
              {menuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className={styles.mobileNav} aria-label="Mobile navigation">
            {sectionIds.map((id) => (
              <button key={id} type="button" onClick={() => goTo(id)}>{content.nav[id === "who" ? "who" : id === "markets" ? "markets" : id === "model" ? "model" : id === "structure" ? "structure" : "contact"]}</button>
            ))}
          </nav>
        )}
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="private-client-title">
          <div className={styles.heroIndex} aria-hidden="true"><span>01</span><i /><span>05</span></div>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{content.hero.eyebrow}</p>
            <h1 id="private-client-title">{content.hero.title}<br /><span>{content.hero.accent}</span></h1>
            <div className={styles.shortRule} />
            <p className={styles.heroBody}>{content.hero.body}</p>
            <div className={styles.heroActions}>
              <button type="button" className={styles.goldButton} onClick={() => goTo("contact")}>{content.hero.primary}<ArrowRight size={17} aria-hidden /></button>
              <Link href="/reverance-batumi" className={styles.textLink}>{content.hero.secondary}<ArrowRight size={16} aria-hidden /></Link>
            </div>
            <p className={styles.location}><span className={styles.locationDot} aria-hidden />{content.hero.location}</p>
          </div>
          <div className={styles.heroMedia}>
            <Image src={heroImage} alt={content.hero.imageAlt} fill priority sizes="(max-width: 800px) 100vw, 58vw" unoptimized />
            <div className={styles.mediaCaption}><span>BATUMI, GEORGIA</span><span>BLACK SEA COAST</span></div>
          </div>
        </section>

        <section id="who" className={`${styles.section} ${styles.whoSection}`}>
          <div className={styles.sectionIntro}><p className={styles.eyebrow}>{content.who.eyebrow}</p><h2>{content.who.title}</h2></div>
          <div className={styles.proseStack}>{content.who.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        </section>

        <section id="markets" className={styles.marketSection}>
          <div className={styles.marketMedia}><Image src={contextImage} alt={content.markets.imageAlt} fill sizes="(max-width: 800px) 100vw, 50vw" unoptimized /></div>
          <div className={styles.marketCopy}><p className={styles.eyebrow}>{content.markets.eyebrow}</p><h2>{content.markets.title}</h2><p>{content.markets.body}</p><div className={styles.focusNote}><span>{content.markets.current}</span><strong>{content.markets.currentBody}</strong></div></div>
        </section>

        <section id="model" className={`${styles.section} ${styles.modelSection}`}>
          <div className={styles.sectionIntro}><p className={styles.eyebrow}>{content.model.eyebrow}</p><h2>{content.model.title}</h2><p>{content.model.body}</p></div>
          <div className={styles.stepsGrid}>{content.model.steps.map((step, index) => { const Icon = iconForStep[index]; return <article className={styles.step} key={step.title}><div className={styles.stepTop}><span>0{index + 1}</span><Icon size={20} strokeWidth={1.5} aria-hidden /></div><h3>{step.title}</h3><p>{step.body}</p></article>; })}</div>
        </section>

        <section id="structure" className={styles.structureSection}>
          <div className={styles.structureIntro}><p className={styles.eyebrow}>{content.structure.eyebrow}</p><h2>{content.structure.title}</h2><p>{content.structure.body}</p></div>
          <div className={styles.bondCard}><div className={styles.bondMark}><ShieldCheck size={22} strokeWidth={1.5} aria-hidden /><span>AIXCO<br />GLOBAL<br />ASSETS</span></div><div className={styles.bondInfo}><span className={styles.bondLabel}>AIXCO GLOBAL BOND</span><strong>6%</strong><span>Subordinated Bond 2025–2030</span><small>ISIN: AT0000A3QME7 · Vienna MTF</small></div></div>
          <div className={styles.badges}>{content.structure.badges.map((badge) => <span key={badge}>{badge}</span>)}</div>
          <p className={styles.structureNote}>{content.structure.note}</p>
        </section>

        <section className={`${styles.section} ${styles.transparencySection}`}>
          <div className={styles.sectionIntro}><p className={styles.eyebrow}>{content.transparency.eyebrow}</p><h2>{content.transparency.title}</h2></div>
          <div className={styles.transparencyCopy}><p>{content.transparency.body}</p><p className={styles.quarterly}>{content.transparency.quarterly}</p></div>
          <div className={styles.transparencyGrid}>{content.transparency.items.map((item) => <article key={item.title}><span className={styles.itemRule} /><h3>{item.title}</h3><p>{item.body}</p></article>)}</div>
        </section>

        <section className={styles.closingSection}>
          <p className={styles.eyebrow}>{content.closing.eyebrow}</p><h2>{content.closing.title}</h2><p>{content.closing.body}</p>
          <div className={styles.closingActions}><button type="button" className={styles.goldButton} onClick={() => goTo("contact")}>{content.closing.primary}<ArrowRight size={17} aria-hidden /></button><Link href="/reverance-batumi" className={styles.outlineButton}>{content.closing.secondary}<ArrowUpRight size={15} aria-hidden /></Link><button type="button" className={styles.textLink} onClick={() => goTo("contact")}>{content.closing.tertiary}<ArrowRight size={16} aria-hidden /></button></div>
        </section>

        <section id="contact" className={styles.contactSection}>
          <div className={styles.contactMedia}><Image src={heroImage} alt="Batumi coastline at dusk" fill sizes="(max-width: 800px) 100vw, 42vw" unoptimized /></div>
          <div className={styles.contactPanel}><p className={styles.eyebrow}>{content.contact.eyebrow}</p><h2>{content.contact.title}</h2><p className={styles.contactBody}>{content.contact.body}</p>{submitted ? <div className={styles.successPanel}><div className={styles.successIcon}><ShieldCheck size={20} aria-hidden /></div><h3>{content.contact.successTitle}</h3><p>{content.contact.successBody}</p>{requestReference && <small>{content.contact.reference}: {requestReference}</small>}<button type="button" className={styles.textLink} onClick={() => { setSubmitted(false); setRequestReference(null); formStartedAt.current = Date.now(); }}>{content.contact.another}<ArrowRight size={16} aria-hidden /></button></div> : <form className={styles.contactForm} onSubmit={handleSubmit}><div className={styles.formGrid}><label><span>{content.contact.name}</span><input name="name" required minLength={2} maxLength={100} placeholder={content.contact.namePlaceholder} /></label><label><span>{content.contact.email}</span><input name="email" type="email" required placeholder={content.contact.emailPlaceholder} /></label></div><label><span>{content.contact.interest}</span><select name="interest" defaultValue=""><option value="" disabled>{content.contact.interest}</option>{content.contact.interestOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select><ChevronDown className={styles.selectIcon} size={16} aria-hidden /></label><label><span>{content.contact.message}</span><textarea name="message" required minLength={10} maxLength={1500} placeholder={content.contact.messagePlaceholder} rows={4} /></label><input className={styles.honeypot} name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" /><label className={styles.consent}><input type="checkbox" required /><span>{content.contact.consent}</span></label>{submitError && <p className={styles.formError} role="alert">{submitError}</p>}<button type="submit" className={styles.goldButton} disabled={submitting}>{submitting ? content.contact.sending : content.contact.submit}<ArrowRight size={17} aria-hidden /></button></form>}</div>
        </section>
      </main>

      <footer className={styles.footer}><Link href="/" aria-label={content.home} className={styles.footerLogo}><Image src={aixcoLiveLogos.aixcoHorizontalDark} alt="AIXCO.Global" width={1600} height={333} sizes="9rem" /></Link><div className={styles.footerLinks}><Link href="/">{content.footer.home}</Link><button type="button" onClick={openPrivacy}>{content.footer.privacy}</button><button type="button" onClick={openTerms}>{content.footer.terms}</button><button type="button" onClick={openAnalyticsPreferences}>{content.footer.cookies}</button></div><small>© {new Date().getFullYear()} AIXCO.Global · {content.footer.rights}</small></footer>
    </div>
  );
}
