"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  ChevronDown,
  Globe2,
  House,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform, type Variants } from "framer-motion";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { LANGS, useI18n } from "@/i18n/I18nProvider";
import type { Lang } from "@/i18n/languages";
import { useSiteContent } from "@/data/site-content-context";
import { useUI } from "@/components/ui-state";
import { aixcoLiveImages, aixcoLiveLogos } from "@/lib/aixco-live-assets";
import { recordContactSubmission } from "@/lib/backend/lead-capture";
import { getContactSubmitErrorMessage } from "@/lib/contact-submit-error";
import { openAnalyticsPreferences } from "@/lib/analytics/client";
import { scrollToHash } from "@/lib/smooth-scroll";
import styles from "./GeorgiaTaxResidencyLandingPage.module.css";

type TaxCopy = {
  metaTitle: string;
  metaDescription: string;
  nav: { clock: string; position: string; path: string; why: string; contact: string };
  hero: {
    eyebrow: string;
    title: string;
    accent: string;
    body: string;
    primary: string;
    secondary: string;
    note: string;
    location: string;
    disclaimer: string;
  };
  clock: {
    eyebrow: string;
    title: string;
    body: string;
    selected: string;
    threshold: string;
    remaining: string;
    reached: string;
    quickSelect: string;
    days: string;
    adjust: string;
    resident: string;
    emerging: string;
    residentBody: string;
    emergingBody: string;
    disclaimer: string;
    sourceNote: string;
    sources: { label: string; taxCode: string; hnwi: string; permits: string };
  };
  chapters: {
    eyebrow: string;
    title: string;
    body: string;
    items: { number: string; title: string; body: string }[];
  };
  why: {
    eyebrow: string;
    title: string;
    body: string;
    features: { title: string; body: string }[];
  };
  contact: {
    eyebrow: string;
    title: string;
    body: string;
    name: string;
    email: string;
    phone: string;
    phonePlaceholder: string;
    taxResidence: string;
    taxResidencePlaceholder: string;
    interest: string;
    profile: string;
    message: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    messagePlaceholder: string;
    interestOptions: string[];
    profileOptions: string[];
    consent: string;
    formDisclaimer: string;
    submit: string;
    sending: string;
    successTitle: string;
    successBody: string;
    reference: string;
    another: string;
    error: string;
  };
  footer: { home: string; privacy: string; terms: string; cookies: string; photos: string; rights: string };
  language: string;
  menu: string;
  closeMenu: string;
  close: string;
  home: string;
  consultation: string;
};

type PathwayStage = {
  number: string;
  title: string;
  body: string;
  details: string[];
  action: string;
  target: "contact" | "why";
};

type PathwayCopy = {
  eyebrow: string;
  title: string;
  body: string;
  primary: string;
  education: string;
  disclaimer: string;
  stages: PathwayStage[];
};

const copyByLanguage: Record<Lang, TaxCopy> = {
  en: {
    metaTitle: "Georgia Tax Residency for HNWI | AIXCO.Global",
    metaDescription: "AIXCO.Global helps internationally mobile individuals map a clear, compliant route to Georgia tax residency.",
    nav: { clock: "183-day rule", position: "Your position", path: "The route", why: "Why Georgia", contact: "Consultation" },
    hero: {
      eyebrow: "Georgia tax residency",
      title: "A CLEARER ROUTE TO",
      accent: "INTERNATIONAL TAX RESIDENCY.",
      body: "Georgia offers two principal pathways for individuals seeking Georgian tax-resident status: physical presence or the dedicated High-Net-Worth Individual procedure. AIXCO helps internationally mobile individuals and families understand the route, coordinate the required local elements and connect with the appropriate tax and legal professionals.",
      primary: "Check my eligibility",
      secondary: "Book a private consultation",
      note: "AIXCO advisory · Georgia",
      location: "Batumi · Georgia",
      disclaimer: "General information only. Tax residency depends on individual facts, source-of-income rules, other-country residency rules and applicable double-tax treaties.",
    },
    clock: {
      eyebrow: "183-day presence check",
      title: "Calculate from your actual stay dates.",
      body: "Under Article 34 of Georgia's Tax Code, the general test is 183 or more days in any continuous 12-calendar-month period ending in the tax year. It is a starting point, not a standalone answer: the Code contains specific counting rules and separate routes.",
      selected: "Selected presence",
      threshold: "General threshold",
      remaining: "days remaining",
      reached: "Threshold reached",
      quickSelect: "Quick select",
      days: "days in a 12-month period",
      adjust: "Days spent in Georgia in the relevant 12-month period",
      resident: "General 183-day threshold reached",
      emerging: "Below the general 183-day threshold",
      residentBody: "This reaches the general statutory threshold. Resident status is established for each tax period; a certificate and any treaty outcome still require a case-specific review.",
      emergingBody: "Below 183 days does not settle your position. Article 34 also provides a separate HNWI procedure, while other residence, source and treaty rules may still matter.",
      disclaimer: "Illustrative information only — not tax or legal advice. Verify the current rules before acting.",
      sourceNote: "AIXCO brochure figures in EUR are indicative conversions. The references below use current official GEL/USD thresholds and should be rechecked before filing.",
      sources: {
        label: "Official references",
        taxCode: "Georgia Tax Code · Article 34",
        hnwi: "Minister of Finance Order No. 60 · HNWI procedure",
        permits: "SDA · residence permits",
      },
    },
    chapters: {
      eyebrow: "A clear route",
      title: "Make the move feel considered.",
      body: "Start with the statutory test, then separate tax residence from an immigration permit and check the HNWI procedure only if the facts fit.",
      items: [
        { number: "01", title: "Understand the 183-day test", body: "Count actual days using the continuous 12-month rule and keep clear travel evidence." },
        { number: "02", title: "Separate the legal questions", body: "Tax residence, a residence permit and a tax-residency certificate are different outcomes; one does not automatically grant the others." },
        { number: "03", title: "Check the HNWI procedure", body: "Order No. 60 uses property over GEL 3 million or annual income over GEL 200,000 in each of the preceding three years, plus a Georgian connection condition. Confirm before relying on it." },
      ],
    },
    why: {
      eyebrow: "Why Georgia",
      title: "A framework built around facts.",
      body: "Georgia has a clear starting point, but tax residence is determined by the Code and the complete cross-border profile — not lifestyle alone.",
      features: [
        { title: "183-day baseline", body: "Article 34 uses 183 or more days in any continuous 12-month period ending in the tax year." },
        { title: "HNWI procedure", body: "Order No. 60 sets a separate route for significant-property individuals; wealth alone does not produce an automatic result." },
        { title: "GEL thresholds", body: "The order uses property over GEL 3 million or annual income over GEL 200,000 in each of the previous three years, plus a Georgian connection: a permit/ID or at least GEL 25,000 of Georgian-source income." },
        { title: "Permit is separate", body: "The SDA lists separate routes, including short-term property over USD 150,000 and investment residence at USD 300,000 or more. Eligibility and amounts must be checked on the official page." },
      ],
    },
    contact: {
      eyebrow: "Ready to map your position?",
      title: "Understand your Georgia tax-residency options.",
      body: "Tell us where you are currently based, how much time you plan to spend in Georgia and whether you are considering the HNWI route. We will help identify the appropriate next conversation.",
      name: "Full name",
      email: "Email address",
      phone: "WhatsApp / Phone",
      phonePlaceholder: "+995 …",
      taxResidence: "Current country of tax residence",
      taxResidencePlaceholder: "e.g. Germany",
      interest: "I am interested in",
      profile: "My approximate profile",
      message: "Your message",
      namePlaceholder: "Your name",
      emailPlaceholder: "you@example.com",
      messagePlaceholder: "Tell us what you are planning",
      interestOptions: [
        "183-day tax residency",
        "HNWI tax residency",
        "Property + tax residency",
        "Residence permit + tax residency",
        "International relocation",
        "Not sure yet",
      ],
      profileOptions: [
        "Under GEL 3M assets",
        "GEL 3M+ assets",
        "GEL 200K+ annual income",
        "Prefer not to disclose yet",
      ],
      consent: "By sending this form, you agree that AIXCO may contact you about your request.",
      formDisclaimer: "Please do not submit sensitive tax documents, bank statements or detailed financial records through this website form.",
      submit: "Request a private review",
      sending: "Sending request",
      successTitle: "Your request is with us.",
      successBody: "A member of the AIXCO team will be in touch shortly.",
      reference: "Reference",
      another: "Send another request",
      error: "We could not send this request. Please try again or email us directly.",
    },
    footer: { home: "Main website", privacy: "Privacy", terms: "Terms", cookies: "Cookie preferences", photos: "Photo credits", rights: "All rights reserved." },
    language: "Change language",
    menu: "Open menu",
    closeMenu: "Close menu",
    close: "Close",
    home: "AIXCO.Global home",
    consultation: "Book a consultation",
  },
  de: {
    metaTitle: "Steuerresidenz in Georgien für HNWI | AIXCO.Global",
    metaDescription: "AIXCO.Global begleitet international mobile Privatpersonen bei der klaren und strukturierten Prüfung einer Steuerresidenz in Georgien.",
    nav: { clock: "183-Tage-Regel", position: "Ihre Position", path: "Der Weg", why: "Warum Georgien", contact: "Beratung" },
    hero: {
      eyebrow: "Steuerresidenz Georgien",
      title: "EIN KLARERER WEG ZUR",
      accent: "INTERNATIONALEN STEUERRESIDENZ.",
      body: "Georgien bietet zwei Hauptwege zur Steuerresidenz — die 183-Tage-Regel und das HNWI-Regime — für international mobile Personen, Familien und Privatkunden.",
      primary: "Meine Eignung prüfen",
      secondary: "Private Beratung buchen",
      note: "AIXCO Beratung · Georgien",
      location: "Batumi · Georgien",
      disclaimer: "Nur allgemeine Information. Die Steuerresidenz hängt von individuellen Fakten, Quellenregeln, Wohnsitzregeln in anderen Ländern und anwendbaren Doppelbesteuerungsabkommen ab.",
    },
    clock: {
      eyebrow: "Prüfung der 183-Tage-Regel",
      title: "Berechnen Sie anhand Ihrer tatsächlichen Aufenthaltsdaten.",
      body: "Nach Artikel 34 des georgischen Steuergesetzbuchs gilt grundsätzlich: mindestens 183 Tage in einem beliebigen zusammenhängenden Zeitraum von 12 Kalendermonaten, der im Steuerjahr endet. Das ist ein Ausgangspunkt, keine vollständige Prüfung; das Gesetz enthält eigene Zählregeln und weitere Verfahren.",
      selected: "Ausgewählter Aufenthalt",
      threshold: "Allgemeiner Schwellenwert",
      remaining: "verbleibende Tage",
      reached: "Schwellenwert erreicht",
      quickSelect: "Schnellauswahl",
      days: "Tage in einem 12-Monats-Zeitraum",
      adjust: "Aufenthaltstage in Georgien im maßgeblichen 12-Monats-Zeitraum",
      resident: "Allgemeiner 183-Tage-Schwellenwert erreicht",
      emerging: "Unter dem allgemeinen 183-Tage-Schwellenwert",
      residentBody: "Damit ist der allgemeine gesetzliche Schwellenwert erreicht. Der Status wird für jedes Steuerjahr festgestellt; eine Bescheinigung und die Einordnung nach einem Doppelbesteuerungsabkommen erfordern weiterhin eine Einzelfallprüfung.",
      emergingBody: "Weniger als 183 Tage entscheiden die Frage nicht allein. Artikel 34 sieht außerdem ein eigenes HNWI-Verfahren vor; weitere Wohnsitz-, Quellen- und Abkommensregeln können relevant sein.",
      disclaimer: "Nur zur Orientierung — keine Steuer- oder Rechtsberatung. Prüfen Sie die aktuellen Regeln vor einer Antragstellung.",
      sourceNote: "Die EUR-Beträge in der AIXCO-Broschüre sind indikative Umrechnungen. Die folgenden Quellen verwenden aktuelle offizielle GEL/USD-Schwellenwerte und sollten vor einer Einreichung erneut geprüft werden.",
      sources: {
        label: "Offizielle Quellen",
        taxCode: "Steuergesetz Georgiens · Artikel 34",
        hnwi: "Verordnung Nr. 60 des Finanzministers · HNWI-Verfahren",
        permits: "SDA · Aufenthaltstitel",
      },
    },
    chapters: {
      eyebrow: "Ein klarer Weg",
      title: "Den Schritt bewusst gestalten.",
      body: "Beginnen Sie mit dem gesetzlichen Test, trennen Sie anschließend Steuerresidenz und Aufenthaltstitel und prüfen Sie das HNWI-Verfahren nur, wenn die Fakten passen.",
      items: [
        { number: "01", title: "Den 183-Tage-Test verstehen", body: "Zählen Sie die tatsächlichen Tage nach der zusammenhängenden 12-Monats-Regel und bewahren Sie klare Reisedaten auf." },
        { number: "02", title: "Rechtsfragen trennen", body: "Steuerresidenz, Aufenthaltstitel und Steuerresidenzbescheinigung sind unterschiedliche Ergebnisse; das eine gewährt nicht automatisch das andere." },
        { number: "03", title: "Das HNWI-Verfahren prüfen", body: "Verordnung Nr. 60 nennt Vermögen über 3 Mio. GEL oder ein Jahreseinkommen über 200.000 GEL in jedem der drei Vorjahre sowie eine Verbindung zu Georgien. Vor einer Nutzung bestätigen." },
      ],
    },
    why: {
      eyebrow: "Warum Georgien",
      title: "Ein Rahmen, der auf Fakten beruht.",
      body: "Georgien bietet einen klaren Ausgangspunkt, doch die Steuerresidenz richtet sich nach dem Gesetz und dem vollständigen grenzüberschreitenden Profil — nicht allein nach dem Lebensstil.",
      features: [
        { title: "183-Tage-Basis", body: "Artikel 34 verwendet mindestens 183 Tage in einem zusammenhängenden 12-Monats-Zeitraum, der im Steuerjahr endet." },
        { title: "HNWI-Verfahren", body: "Verordnung Nr. 60 beschreibt einen gesonderten Weg für Personen mit erheblichem Vermögen; Vermögen allein führt nicht automatisch zum Ergebnis." },
        { title: "GEL-Schwellenwerte", body: "Genannt werden Vermögen über 3 Mio. GEL oder Jahreseinkommen über 200.000 GEL in jedem der drei Vorjahre sowie eine Verbindung zu Georgien: Aufenthaltstitel/ID oder mindestens 25.000 GEL aus georgischer Quelle." },
        { title: "Aufenthaltstitel getrennt", body: "Die SDA führt eigene Wege auf, darunter Immobilien über 150.000 USD für den kurzfristigen Aufenthaltstitel und mindestens 300.000 USD für den Investitionsaufenthalt. Voraussetzungen und Beträge bitte offiziell prüfen." },
      ],
    },
    contact: {
      eyebrow: "Bereit, Ihre Position zu klären?",
      title: "Verstehen Sie Ihre Optionen zur Steuerresidenz in Georgien.",
      body: "Nennen Sie uns Ihren aktuellen Wohnsitz, wie viel Zeit Sie in Georgien verbringen möchten und ob Sie die HNWI-Route prüfen. Wir helfen beim nächsten passenden Gespräch.",
      name: "Vollständiger Name",
      email: "E-Mail-Adresse",
      phone: "WhatsApp / Telefon",
      phonePlaceholder: "+995 …",
      taxResidence: "Aktuelles Land der Steuerresidenz",
      taxResidencePlaceholder: "z. B. Deutschland",
      interest: "Ich interessiere mich für",
      profile: "Mein ungefähres Profil",
      message: "Ihre Nachricht",
      namePlaceholder: "Ihr Name",
      emailPlaceholder: "sie@beispiel.com",
      messagePlaceholder: "Was planen Sie?",
      interestOptions: [
        "183-Tage-Steuerresidenz",
        "HNWI-Steuerresidenz",
        "Immobilie + Steuerresidenz",
        "Aufenthaltstitel + Steuerresidenz",
        "Internationale Verlagerung",
        "Noch unsicher",
      ],
      profileOptions: [
        "Vermögen unter 3 Mio. GEL",
        "Vermögen ab 3 Mio. GEL",
        "Jahreseinkommen ab 200.000 GEL",
        "Noch keine Angabe",
      ],
      consent: "Mit dem Absenden stimmen Sie zu, dass AIXCO Sie zu Ihrer Anfrage kontaktieren darf.",
      formDisclaimer: "Bitte senden Sie keine sensiblen Steuerunterlagen, Kontoauszüge oder detaillierte Finanzdaten über dieses Website-Formular.",
      submit: "Private Prüfung anfragen",
      sending: "Anfrage wird gesendet",
      successTitle: "Ihre Anfrage ist bei uns.",
      successBody: "Ein Mitglied des AIXCO-Teams meldet sich in Kürze.",
      reference: "Referenz",
      another: "Weitere Anfrage senden",
      error: "Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
    },
    footer: { home: "Hauptwebsite", privacy: "Datenschutz", terms: "Bedingungen", cookies: "Cookie-Einstellungen", photos: "Bildnachweise", rights: "Alle Rechte vorbehalten." },
    language: "Sprache ändern",
    menu: "Menü öffnen",
    closeMenu: "Menü schließen",
    close: "Schließen",
    home: "AIXCO.Global Startseite",
    consultation: "Beratung buchen",
  },
  pl: {
    metaTitle: "Rezydencja podatkowa w Gruzji dla HNWI | AIXCO.Global",
    metaDescription: "AIXCO.Global pomaga osobom mobilnym międzynarodowo uporządkować drogę do rezydencji podatkowej w Gruzji.",
    nav: { clock: "Reguła 183 dni", position: "Twoja sytuacja", path: "Droga", why: "Dlaczego Gruzja", contact: "Konsultacja" },
    hero: {
      eyebrow: "Rezydencja podatkowa w Gruzji",
      title: "PRZEJRZYSTSZA DROGA DO",
      accent: "MIĘDZYNARODOWEJ REZYDENCJI PODATKOWEJ.",
      body: "Gruzja oferuje dwie główne ścieżki rezydencji podatkowej — regułę 183 dni i reżim HNWI — dla osób mobilnych międzynarodowo, rodzin i klientów prywatnych.",
      primary: "Sprawdź moją kwalifikowalność",
      secondary: "Umów prywatną konsultację",
      note: "Doradztwo AIXCO · Gruzja",
      location: "Batumi · Gruzja",
      disclaimer: "Wyłącznie informacje ogólne. Rezydencja podatkowa zależy od indywidualnych faktów, zasad źródła dochodu, zasad rezydencji w innych krajach i obowiązujących umów o unikaniu podwójnego opodatkowania.",
    },
    clock: {
      eyebrow: "Sprawdzenie reguły 183 dni",
      title: "Oblicz wynik na podstawie rzeczywistych dat pobytu.",
      body: "Zgodnie z art. 34 gruzińskiego kodeksu podatkowego podstawowy test to co najmniej 183 dni w dowolnym nieprzerwanym okresie 12 miesięcy kalendarzowych kończącym się w danym roku podatkowym. To punkt wyjścia, a nie pełna odpowiedź; kodeks zawiera szczególne zasady liczenia i odrębne procedury.",
      selected: "Wybrany pobyt",
      threshold: "Próg ogólny",
      remaining: "dni do progu",
      reached: "Próg osiągnięty",
      quickSelect: "Szybki wybór",
      days: "dni w okresie 12 miesięcy",
      adjust: "Dni spędzone w Gruzji w odpowiednim okresie 12 miesięcy",
      resident: "Ogólny próg 183 dni został osiągnięty",
      emerging: "Poniżej ogólnego progu 183 dni",
      residentBody: "Osiągasz ogólny próg ustawowy. Status rezydenta ustala się dla każdego roku podatkowego, a zaświadczenie i wynik analizy umowy podatkowej nadal wymagają oceny konkretnej sytuacji.",
      emergingBody: "Mniej niż 183 dni nie rozstrzyga sprawy samo w sobie. Art. 34 przewiduje także odrębną procedurę HNWI, a znaczenie mogą mieć inne zasady dotyczące rezydencji, źródeł dochodu i umów.",
      disclaimer: "Informacja poglądowa — nie stanowi porady podatkowej ani prawnej. Przed działaniem sprawdź aktualne przepisy.",
      sourceNote: "Kwoty w EUR w broszurze AIXCO są orientacyjnymi przeliczeniami. Poniższe źródła używają aktualnych oficjalnych progów w GEL/USD i należy je ponownie sprawdzić przed złożeniem wniosku.",
      sources: {
        label: "Oficjalne źródła",
        taxCode: "Kodeks podatkowy Gruzji · art. 34",
        hnwi: "Rozporządzenie ministra finansów nr 60 · procedura HNWI",
        permits: "SDA · zezwolenia na pobyt",
      },
    },
    chapters: {
      eyebrow: "Jasna droga",
      title: "Zaplanuj zmianę świadomie.",
      body: "Zacznij od testu ustawowego, następnie oddziel rezydencję podatkową od zezwolenia na pobyt i sprawdź procedurę HNWI tylko wtedy, gdy fakty ją uzasadniają.",
      items: [
        { number: "01", title: "Zrozum test 183 dni", body: "Policz faktyczne dni zgodnie z zasadą nieprzerwanego okresu 12 miesięcy i zachowaj dokładną historię podróży." },
        { number: "02", title: "Oddziel pytania prawne", body: "Rezydencja podatkowa, zezwolenie na pobyt i certyfikat rezydencji podatkowej to różne rezultaty; jedno nie daje automatycznie drugiego." },
        { number: "03", title: "Sprawdź procedurę HNWI", body: "Rozporządzenie nr 60 wskazuje majątek powyżej 3 mln GEL lub roczny dochód powyżej 200 000 GEL w każdym z trzech poprzednich lat oraz warunek związku z Gruzją. Potwierdź to przed zastosowaniem." },
      ],
    },
    why: {
      eyebrow: "Dlaczego Gruzja",
      title: "Ramy oparte na faktach.",
      body: "Gruzja ma jasny punkt wyjścia, ale rezydencję podatkową określa kodeks i pełny profil transgraniczny — nie sam styl życia.",
      features: [
        { title: "Podstawa 183 dni", body: "Art. 34 stosuje co najmniej 183 dni w dowolnym nieprzerwanym okresie 12 miesięcy kończącym się w roku podatkowym." },
        { title: "Procedura HNWI", body: "Rozporządzenie nr 60 opisuje odrębną ścieżkę dla osób o znacznym majątku; sam majątek nie daje automatycznego rezultatu." },
        { title: "Progi w GEL", body: "Rozporządzenie wskazuje majątek powyżej 3 mln GEL lub roczny dochód powyżej 200 000 GEL w każdym z trzech poprzednich lat oraz związek z Gruzją: zezwolenie/ID lub co najmniej 25 000 GEL dochodu ze źródła w Gruzji." },
        { title: "Zezwolenie to osobna kwestia", body: "SDA wymienia osobne ścieżki, w tym nieruchomość powyżej 150 000 USD dla krótkoterminowego pobytu i co najmniej 300 000 USD dla pobytu inwestycyjnego. Warunki i kwoty należy sprawdzić oficjalnie." },
      ],
    },
    contact: {
      eyebrow: "Gotowy, aby uporządkować swoją sytuację?",
      title: "Poznaj swoje opcje rezydencji podatkowej w Gruzji.",
      body: "Napisz, gdzie obecnie mieszkasz podatkowo, ile czasu planujesz spędzać w Gruzji i czy rozważasz ścieżkę HNWI. Pomożemy wskazać właściwą kolejną rozmowę.",
      name: "Imię i nazwisko",
      email: "Adres e-mail",
      phone: "WhatsApp / telefon",
      phonePlaceholder: "+995 …",
      taxResidence: "Obecny kraj rezydencji podatkowej",
      taxResidencePlaceholder: "np. Niemcy",
      interest: "Interesuje mnie",
      profile: "Mój przybliżony profil",
      message: "Twoja wiadomość",
      namePlaceholder: "Twoje imię",
      emailPlaceholder: "ty@przyklad.com",
      messagePlaceholder: "Co planujesz?",
      interestOptions: [
        "Rezydencja podatkowa 183 dni",
        "Rezydencja podatkowa HNWI",
        "Nieruchomość + rezydencja podatkowa",
        "Zezwolenie na pobyt + rezydencja podatkowa",
        "Relokacja międzynarodowa",
        "Jeszcze nie wiem",
      ],
      profileOptions: [
        "Aktywa poniżej 3 mln GEL",
        "Aktywa 3 mln GEL+",
        "Dochód roczny 200 tys. GEL+",
        "Wolę nie ujawniać",
      ],
      consent: "Wysyłając formularz, wyrażasz zgodę na kontakt AIXCO w sprawie zapytania.",
      formDisclaimer: "Nie przesyłaj przez ten formularz wrażliwych dokumentów podatkowych, wyciągów bankowych ani szczegółowych danych finansowych.",
      submit: "Poproś o prywatną analizę",
      sending: "Wysyłanie zapytania",
      successTitle: "Twoje zapytanie do nas dotarło.",
      successBody: "Członek zespołu AIXCO wkrótce się z Tobą skontaktuje.",
      reference: "Numer referencyjny",
      another: "Wyślij kolejne zapytanie",
      error: "Nie udało się wysłać zapytania. Spróbuj ponownie.",
    },
    footer: { home: "Strona główna", privacy: "Prywatność", terms: "Warunki", cookies: "Ustawienia plików cookie", photos: "Autorzy zdjęć", rights: "Wszelkie prawa zastrzeżone." },
    language: "Zmień język",
    menu: "Otwórz menu",
    closeMenu: "Zamknij menu",
    close: "Zamknij",
    home: "Strona główna AIXCO.Global",
    consultation: "Umów konsultację",
  },
  sl: {
    metaTitle: "Davčno rezidentstvo v Gruziji za HNWI | AIXCO.Global",
    metaDescription: "AIXCO.Global pomaga mednarodno mobilnim posameznikom razumeti jasno pot do davčnega rezidentstva v Gruziji.",
    nav: { clock: "Pravilo 183 dni", position: "Vaš položaj", path: "Pot", why: "Zakaj Gruzija", contact: "Posvet" },
    hero: {
      eyebrow: "Davčno rezidentstvo v Gruziji",
      title: "JASNEJŠA POT DO",
      accent: "MEDNARODNEGA DAVČNEGA REZIDENTSTVA.",
      body: "Gruzija ponuja dve glavni poti do davčnega rezidentstva — pravilo 183 dni in režim HNWI — za mednarodno mobilne posameznike, družine in zasebne stranke.",
      primary: "Preveri mojo upravičenost",
      secondary: "Rezerviraj zasebno posvetovanje",
      note: "Svetovanje AIXCO · Gruzija",
      location: "Batumi · Gruzija",
      disclaimer: "Samo splošne informacije. Davčno rezidentstvo je odvisno od posameznih dejstev, pravil o viru dohodka, pravil o rezidentstvu v drugih državah in veljavnih pogodb o izogibanju dvojnega obdavčevanja.",
    },
    clock: {
      eyebrow: "Preverjanje pravila 183 dni",
      title: "Izračunajte na podlagi dejanskih datumov bivanja.",
      body: "Po 34. členu gruzijskega davčnega zakonika je splošni test najmanj 183 dni v katerem koli neprekinjenem 12-mesečnem koledarskem obdobju, ki se konča v davčnem letu. To je izhodišče, ne popoln odgovor; zakonik vsebuje posebna pravila štetja in ločene postopke.",
      selected: "Izbrana prisotnost",
      threshold: "Splošni prag",
      remaining: "preostalih dni",
      reached: "Prag dosežen",
      quickSelect: "Hitra izbira",
      days: "dni v 12-mesečnem obdobju",
      adjust: "Dnevi v Gruziji v ustreznem 12-mesečnem obdobju",
      resident: "Splošni prag 183 dni je dosežen",
      emerging: "Pod splošnim pragom 183 dni",
      residentBody: "S tem dosežete splošni zakonski prag. Status rezidenta se določa za vsako davčno obdobje; potrdilo in obravnava po davčni pogodbi še vedno zahtevata presojo konkretnega primera.",
      emergingBody: "Manj kot 183 dni samo po sebi ne odloči položaja. 34. člen določa tudi ločen postopek HNWI, pomembna pa so lahko druga pravila o rezidentstvu, viru in pogodbah.",
      disclaimer: "Samo informativno — ni davčno ali pravno svetovanje. Pred ukrepanjem preverite veljavna pravila.",
      sourceNote: "Zneski v EUR v brošuri AIXCO so okvirne pretvorbe. Spodnji viri uporabljajo aktualne uradne pragove v GEL/USD in jih je treba pred vložitvijo ponovno preveriti.",
      sources: {
        label: "Uradni viri",
        taxCode: "Davčni zakonik Gruzije · 34. člen",
        hnwi: "Odredba ministra za finance št. 60 · postopek HNWI",
        permits: "SDA · dovoljenja za prebivanje",
      },
    },
    chapters: {
      eyebrow: "Jasna pot",
      title: "Premik naj bo premišljen.",
      body: "Začnite z zakonskim testom, nato ločite davčno rezidentstvo od dovoljenja za prebivanje in postopek HNWI preverite le, če ga dejstva podpirajo.",
      items: [
        { number: "01", title: "Razumite test 183 dni", body: "Preštejte dejanske dni po pravilu neprekinjenega 12-mesečnega obdobja in shranite jasne podatke o potovanjih." },
        { number: "02", title: "Ločite pravna vprašanja", body: "Davčno rezidentstvo, dovoljenje za prebivanje in potrdilo o davčnem rezidentstvu so različni rezultati; eden drugega ne podeli samodejno." },
        { number: "03", title: "Preverite postopek HNWI", body: "Odredba št. 60 uporablja premoženje nad 3 milijone GEL ali letni prihodek nad 200.000 GEL v vsakem od treh prejšnjih let ter pogoj povezave z Gruzijo. Pred uporabo potrdite aktualne pogoje." },
      ],
    },
    why: {
      eyebrow: "Zakaj Gruzija",
      title: "Okvir, ki temelji na dejstvih.",
      body: "Gruzija ima jasno izhodišče, vendar davčno rezidentstvo določata zakonik in celoten čezmejni profil — ne le življenjski slog.",
      features: [
        { title: "Osnova 183 dni", body: "34. člen uporablja najmanj 183 dni v katerem koli neprekinjenem 12-mesečnem obdobju, ki se konča v davčnem letu." },
        { title: "Postopek HNWI", body: "Odredba št. 60 opisuje ločeno pot za osebe z znatnim premoženjem; samo premoženje ne prinese samodejnega rezultata." },
        { title: "Pragi v GEL", body: "Odredba uporablja premoženje nad 3 milijone GEL ali letni prihodek nad 200.000 GEL v vsakem od treh prejšnjih let ter povezavo z Gruzijo: dovoljenje/ID ali najmanj 25.000 GEL prihodka iz gruzijskega vira." },
        { title: "Dovoljenje je ločeno", body: "SDA navaja ločene poti, vključno z nepremičnino nad 150.000 USD za kratkoročno dovoljenje in najmanj 300.000 USD za investicijsko prebivanje. Pogoje in zneske preverite na uradni strani." },
      ],
    },
    contact: {
      eyebrow: "Ste pripravljeni razumeti svoj položaj?",
      title: "Razumite svoje možnosti davčnega rezidentstva v Gruziji.",
      body: "Povejte nam, kje imate trenutno davčno rezidentstvo, koliko časa nameravate preživeti v Gruziji in ali razmišljate o poti HNWI. Pomagali vam bomo pri naslednjem koraku.",
      name: "Polno ime",
      email: "E-poštni naslov",
      phone: "WhatsApp / telefon",
      phonePlaceholder: "+995 …",
      taxResidence: "Trenutna država davčnega rezidentstva",
      taxResidencePlaceholder: "npr. Nemčija",
      interest: "Zanima me",
      profile: "Moj približni profil",
      message: "Vaše sporočilo",
      namePlaceholder: "Vaše ime",
      emailPlaceholder: "vi@primer.com",
      messagePlaceholder: "Kaj načrtujete?",
      interestOptions: [
        "Davčno rezidentstvo 183 dni",
        "Davčno rezidentstvo HNWI",
        "Nepremičnina + davčno rezidentstvo",
        "Dovoljenje za prebivanje + davčno rezidentstvo",
        "Mednarodna selitev",
        "Še nisem prepričan",
      ],
      profileOptions: [
        "Premoženje pod 3 mil. GEL",
        "Premoženje 3 mil. GEL+",
        "Letni dohodek 200 tisoč GEL+",
        "Ne želim razkriti",
      ],
      consent: "Z oddajo obrazca soglašate, da vas AIXCO kontaktira glede vašega povpraševanja.",
      formDisclaimer: "Prosimo, ne pošiljajte občutljivih davčnih dokumentov, bančnih izpiskov ali podrobnih finančnih podatkov prek tega spletnega obrazca.",
      submit: "Zahtevajte zasebni pregled",
      sending: "Pošiljanje povpraševanja",
      successTitle: "Vaše povpraševanje smo prejeli.",
      successBody: "Član ekipe AIXCO vas bo kmalu kontaktiral.",
      reference: "Referenca",
      another: "Pošljite novo povpraševanje",
      error: "Povpraševanja ni bilo mogoče poslati. Poskusite znova.",
    },
    footer: { home: "Glavna stran", privacy: "Zasebnost", terms: "Pogoji", cookies: "Nastavitve piškotkov", photos: "Avtorji fotografij", rights: "Vse pravice pridržane." },
    language: "Spremenite jezik",
    menu: "Odprite meni",
    closeMenu: "Zaprite meni",
    close: "Zapri",
    home: "Domov AIXCO.Global",
    consultation: "Dogovorite posvet",
  },
  ru: {
    metaTitle: "Налоговое резидентство в Грузии для HNWI | AIXCO.Global",
    metaDescription: "AIXCO.Global помогает международно мобильным клиентам выстроить понятный путь к налоговому резидентству в Грузии.",
    nav: { clock: "Правило 183 дней", position: "Ваша ситуация", path: "Маршрут", why: "Почему Грузия", contact: "Консультация" },
    hero: {
      eyebrow: "Налоговое резидентство в Грузии",
      title: "БОЛЕЕ ПОНЯТНЫЙ ПУТЬ К",
      accent: "МЕЖДУНАРОДНОМУ НАЛОГОВОМУ РЕЗИДЕНТСТВУ.",
      body: "Грузия предлагает два основных пути к налоговому резидентству — правило 183 дней и режим HNWI — для мобильных людей, семей и частных клиентов.",
      primary: "Проверить моё соответствие",
      secondary: "Записаться на частную консультацию",
      note: "Консультация AIXCO · Грузия",
      location: "Батуми · Грузия",
      disclaimer: "Только общая информация. Налоговое резидентство зависит от индивидуальных обстоятельств, правил об источнике дохода, правил резидентства в других странах и применимых соглашений об избежании двойного налогообложения.",
    },
    clock: {
      eyebrow: "Проверка правила 183 дней",
      title: "Рассчитайте результат по фактическим датам пребывания.",
      body: "Согласно статье 34 Налогового кодекса Грузии, общий критерий — не менее 183 дней в любом непрерывном периоде из 12 календарных месяцев, который заканчивается в налоговом году. Это отправная точка, а не полный ответ: Кодекс содержит особые правила подсчёта и отдельные процедуры.",
      selected: "Выбранное присутствие",
      threshold: "Общий порог",
      remaining: "дней до порога",
      reached: "Порог достигнут",
      quickSelect: "Быстрый выбор",
      days: "дней за 12-месячный период",
      adjust: "Дни, проведённые в Грузии за соответствующий 12-месячный период",
      resident: "Общий порог 183 дней достигнут",
      emerging: "Ниже общего порога 183 дней",
      residentBody: "Это достигает общего установленного законом порога. Статус резидента определяется за каждый налоговый период; сертификат и результат по налоговому соглашению всё равно требуют анализа конкретной ситуации.",
      emergingBody: "Менее 183 дней сами по себе не определяют вашу ситуацию. Статья 34 также предусматривает отдельную процедуру HNWI, а значение могут иметь другие правила о резидентстве, источнике дохода и соглашениях.",
      disclaimer: "Только для общего ознакомления — не налоговая и не юридическая консультация. Проверьте действующие правила перед действиями.",
      sourceNote: "Суммы в EUR в брошюре AIXCO являются ориентировочными конверсиями. В приведённых источниках используются актуальные официальные пороги в GEL/USD; проверьте их перед подачей заявления.",
      sources: {
        label: "Официальные источники",
        taxCode: "Налоговый кодекс Грузии · статья 34",
        hnwi: "Приказ министра финансов №60 · процедура HNWI",
        permits: "SDA · виды на жительство",
      },
    },
    chapters: {
      eyebrow: "Понятный маршрут",
      title: "Переезд должен быть осознанным.",
      body: "Начните с установленного законом критерия, затем отделите налоговое резидентство от вида на жительство и проверяйте процедуру HNWI только при наличии соответствующих фактов.",
      items: [
        { number: "01", title: "Понять тест 183 дней", body: "Подсчитайте фактические дни по правилу непрерывного 12-месячного периода и сохраняйте точные данные о поездках." },
        { number: "02", title: "Разделить правовые вопросы", body: "Налоговое резидентство, вид на жительство и сертификат налогового резидентства — разные результаты; одно не даёт автоматически другое." },
        { number: "03", title: "Проверить процедуру HNWI", body: "Приказ №60 использует имущество свыше 3 млн GEL или годовой доход свыше 200 000 GEL в каждом из трёх предыдущих лет, а также условие связи с Грузией. Подтвердите правила перед применением." },
      ],
    },
    why: {
      eyebrow: "Почему Грузия",
      title: "Система, основанная на фактах.",
      body: "В Грузии есть понятная отправная точка, но налоговое резидентство определяется Кодексом и полной трансграничной картиной — а не только образом жизни.",
      features: [
        { title: "База 183 дней", body: "Статья 34 использует не менее 183 дней в любом непрерывном 12-месячном периоде, который заканчивается в налоговом году." },
        { title: "Процедура HNWI", body: "Приказ №60 описывает отдельный путь для лиц со значительным имуществом; само имущество не даёт автоматического результата." },
        { title: "Пороги в GEL", body: "Приказ использует имущество свыше 3 млн GEL или годовой доход свыше 200 000 GEL в каждом из трёх предыдущих лет, а также связь с Грузией: вид на жительство/ID или не менее 25 000 GEL дохода из грузинского источника." },
        { title: "ВНЖ — отдельный вопрос", body: "SDA указывает отдельные пути, включая недвижимость свыше 150 000 USD для краткосрочного ВНЖ и от 300 000 USD для инвестиционного ВНЖ. Условия и суммы нужно проверить официально." },
      ],
    },
    contact: {
      eyebrow: "Готовы разобраться в своей ситуации?",
      title: "Поймите свои варианты налогового резидентства в Грузии.",
      body: "Расскажите, где вы сейчас являетесь налоговым резидентом, сколько времени планируете проводить в Грузии и рассматриваете ли маршрут HNWI. Мы поможем определить следующий шаг.",
      name: "Имя и фамилия",
      email: "Электронная почта",
      phone: "WhatsApp / телефон",
      phonePlaceholder: "+995 …",
      taxResidence: "Текущая страна налогового резидентства",
      taxResidencePlaceholder: "например, Германия",
      interest: "Меня интересует",
      profile: "Мой примерный профиль",
      message: "Ваше сообщение",
      namePlaceholder: "Ваше имя",
      emailPlaceholder: "you@example.com",
      messagePlaceholder: "Что вы планируете?",
      interestOptions: [
        "Налоговое резидентство по правилу 183 дней",
        "Налоговое резидентство HNWI",
        "Недвижимость + налоговое резидентство",
        "ВНЖ + налоговое резидентство",
        "Международная релокация",
        "Пока не уверен",
      ],
      profileOptions: [
        "Активы до 3 млн GEL",
        "Активы от 3 млн GEL",
        "Годовой доход от 200 000 GEL",
        "Предпочитаю не раскрывать",
      ],
      consent: "Отправляя форму, вы соглашаетесь, что AIXCO может связаться с вами по вашему запросу.",
      formDisclaimer: "Пожалуйста, не отправляйте через эту форму конфиденциальные налоговые документы, банковские выписки или подробные финансовые данные.",
      submit: "Запросить частный обзор",
      sending: "Запрос отправляется",
      successTitle: "Мы получили ваш запрос.",
      successBody: "Представитель AIXCO свяжется с вами в ближайшее время.",
      reference: "Номер запроса",
      another: "Отправить новый запрос",
      error: "Не удалось отправить запрос. Попробуйте ещё раз.",
    },
    footer: { home: "Главная страница", privacy: "Конфиденциальность", terms: "Условия", cookies: "Настройки файлов cookie", photos: "Авторы фотографий", rights: "Все права защищены." },
    language: "Изменить язык",
    menu: "Открыть меню",
    closeMenu: "Закрыть меню",
    close: "Закрыть",
    home: "Главная AIXCO.Global",
    consultation: "Записаться на консультацию",
  },
};

const pathwayCopyByLanguage: Record<Lang, PathwayCopy> = {
  en: {
    eyebrow: "01 — Two routes",
    title: "Which route fits your position?",
    body: "Georgia offers a physical-presence route and a dedicated HNWI procedure. Compare the core requirements before deciding which route deserves professional review.",
    primary: "Schedule a private consultation",
    education: "Read the 183-day rule",
    disclaimer: "General guidance only — not tax or legal advice. Individual outcomes depend on specific facts.",
    stages: [
      { number: "02", title: "The 183-day route", body: "For individuals relocating to Georgia, the standard route is based on physical presence: 183 or more days in any continuous 12-month period ending in the relevant tax year.", details: ["Best suited to individuals and families relocating to Georgia", "Keep clear travel and presence evidence"], action: "Review the framework", target: "why" },
      { number: "03", title: "HNWI tax residency", body: "Qualifying applicants may use the dedicated HNWI procedure without meeting the 183-day requirement when the financial and Georgian-connection conditions are satisfied.", details: ["GEL 3M assets or GEL 200K annual income test", "Georgian assets and connection conditions apply"], action: "Check HNWI eligibility", target: "why" },
      { number: "→", title: "Need help choosing?", body: "Our team will help you understand the available options and connect you with the appropriate specialists based on your personal circumstances.", details: ["Separate tax residence from immigration residence", "Coordinate a case-specific professional review"], action: "Schedule a private consultation", target: "contact" },
    ],
  },
  de: {
    eyebrow: "Der AIXCO-Weg",
    title: "Von der Frage zur Klarheit.",
    body: "AIXCO verbindet Aufenthalt, Immobilie und praktische Orientierung zu einem durchdachten Weg.",
    primary: "Mit einem Gespräch beginnen",
    education: "Die 183-Tage-Regel lesen",
    disclaimer: "Nur allgemeine Orientierung — keine Steuer- oder Rechtsberatung. Das Ergebnis hängt von den konkreten Fakten ab.",
    stages: [
      { number: "01", title: "Ihre Prioritäten verstehen", body: "Erzählen Sie uns, was Ihnen wichtig ist — Mobilität, Privatsphäre, Geschäft, Familie oder Lebensstil — damit wir uns auf das Richtige konzentrieren.", details: ["Ziele und Rahmenbedingungen klären", "Die Faktoren ordnen, die Ihre Entscheidungen prägen"], action: "Mit einem Gespräch beginnen", target: "contact" },
      { number: "02", title: "Die passende Struktur prüfen", body: "Trennen Sie Fragen, die oft vermischt werden: Steuerresidenz, Aufenthaltstitel, Immobilie und der praktische Weg dazwischen.", details: ["Die 183-Tage-Basis verstehen", "Passende Aufenthalts- und HNWI-Wege prüfen"], action: "Den Rahmen erkunden", target: "why" },
      { number: "03", title: "Mit dem richtigen Berater sprechen", body: "Bringen Sie Ihre Fakten in ein fokussiertes Gespräch und gehen Sie mit einem klareren nächsten Schritt und den richtigen Ansprechpartnern weiter.", details: ["Ein kompaktes Privatkunden-Briefing vorbereiten", "Mit einem durchdachten Plan weitergehen"], action: "Beratung buchen", target: "contact" },
    ],
  },
  pl: {
    eyebrow: "Droga AIXCO",
    title: "Od pytania do jasnej sytuacji.",
    body: "AIXCO łączy rezydencję, nieruchomości i praktyczne wskazówki w jedną przemyślaną drogę.",
    primary: "Zacznij od rozmowy",
    education: "Przeczytaj regułę 183 dni",
    disclaimer: "To ogólne informacje — nie porada podatkowa ani prawna. Wynik zależy od konkretnych faktów.",
    stages: [
      { number: "01", title: "Zrozum swoje priorytety", body: "Powiedz nam, co jest najważniejsze — mobilność, prywatność, biznes, rodzina czy styl życia — abyśmy mogli skupić się na właściwym rozwiązaniu.", details: ["Doprecyzuj cele i ograniczenia", "Uporządkuj czynniki wpływające na decyzje"], action: "Zacznij od rozmowy", target: "contact" },
      { number: "02", title: "Poznaj właściwą strukturę", body: "Oddziel pytania, które często są łączone: rezydencję podatkową, pobyt, nieruchomość i praktyczną drogę między nimi.", details: ["Zrozum podstawę 183 dni", "Sprawdź właściwe ścieżki pobytowe i HNWI"], action: "Poznaj ramy", target: "why" },
      { number: "03", title: "Porozmawiaj z właściwym doradcą", body: "Przedstaw swoje fakty w konkretnej rozmowie i wyjdź z jaśniejszym kolejnym krokiem oraz właściwymi osobami po swojej stronie.", details: ["Przygotuj zwięzły brief klienta prywatnego", "Ruszaj dalej z przemyślanym planem"], action: "Umów konsultację", target: "contact" },
    ],
  },
  sl: {
    eyebrow: "Pot AIXCO",
    title: "Od vprašanja do jasnega položaja.",
    body: "AIXCO povezuje bivanje, nepremičnine in praktično usmerjanje v premišljeno celoto.",
    primary: "Začnite s pogovorom",
    education: "Preberite pravilo 183 dni",
    disclaimer: "Splošne informacije — ne davčno ali pravno svetovanje. Rezultat je odvisen od konkretnih dejstev.",
    stages: [
      { number: "01", title: "Razumite svoje prioritete", body: "Povejte nam, kaj vam največ pomeni — mobilnost, zasebnost, posel, družina ali življenjski slog — da se osredotočimo na pravo rešitev.", details: ["Pojasnite cilje in omejitve", "Uredite dejavnike, ki bodo oblikovali vaše odločitve"], action: "Začnite s pogovorom", target: "contact" },
      { number: "02", title: "Raziščite pravo strukturo", body: "Ločite vprašanja, ki se pogosto prepletajo: davčno rezidentstvo, dovoljenje za prebivanje, nepremičnino in praktično pot med njimi.", details: ["Razumite osnovo 183 dni", "Preglejte ustrezne poti prebivanja in HNWI"], action: "Raziščite okvir", target: "why" },
      { number: "03", title: "Pogovorite se s pravim svetovalcem", body: "Svoja dejstva prinesite v osredotočen pogovor in odidite z jasnejšim naslednjim korakom ter pravimi sogovorniki.", details: ["Pripravite zgoščen brief za zasebno stranko", "Nadaljujte s premišljenim načrtom"], action: "Rezervirajte posvet", target: "contact" },
    ],
  },
  ru: {
    eyebrow: "Путь AIXCO",
    title: "От вопроса к ясной позиции.",
    body: "AIXCO объединяет вопросы проживания, недвижимости и практические решения в один продуманный маршрут.",
    primary: "Начать с разговора",
    education: "Прочитать правило 183 дней",
    disclaimer: "Общая информация — не налоговая и не юридическая консультация. Результат зависит от конкретных обстоятельств.",
    stages: [
      { number: "01", title: "Понять ваши приоритеты", body: "Расскажите, что для вас важнее всего — мобильность, конфиденциальность, бизнес, семья или образ жизни — чтобы мы сосредоточились на подходящем решении.", details: ["Уточнить цели и ограничения", "Определить факторы, которые повлияют на решения"], action: "Начать с разговора", target: "contact" },
      { number: "02", title: "Выбрать подходящую структуру", body: "Разделить вопросы, которые часто смешивают: налоговое резидентство, вид на жительство, недвижимость и практический путь между ними.", details: ["Понять основу правила 183 дней", "Рассмотреть подходящие процедуры проживания и HNWI"], action: "Изучить рамки", target: "why" },
      { number: "03", title: "Поговорить с нужным консультантом", body: "Обсудите свои обстоятельства в сфокусированном разговоре и получите более ясный следующий шаг и нужных специалистов.", details: ["Подготовить краткий бриф частного клиента", "Продолжить с продуманным планом"], action: "Записаться на консультацию", target: "contact" },
    ],
  },
};

const heroImage = aixcoLiveImages.taxResidencyHeroGenerated;
const privateClientProcess = [
  { title: "Private consultation", body: "Understand your objectives, existing country of residence, family position and mobility plans." },
  { title: "Preliminary route", body: "Identify whether the 183-day route, HNWI route or another structure is potentially relevant." },
  { title: "Professional review", body: "Coordinate the required Georgian tax and legal review." },
  { title: "Local structure", body: "Where necessary, coordinate property, residence permit, address, banking or company-related elements." },
  { title: "Application", body: "Prepare and coordinate the applicable documentation and submission process." },
  { title: "Ongoing position", body: "Support renewal, local administration and coordination with advisers where required." },
] as const;

const taxSystemFeatures = [
  { title: "Territorial principle", body: "Georgia generally distinguishes between Georgian-source and foreign-source income when determining personal taxation." },
  { title: "20% standard personal income tax*", body: "The standard Georgian personal income-tax framework applies to qualifying Georgian-source income." },
  { title: "Special regimes*", body: "Certain qualifying entrepreneurs and activities may be eligible for separate regimes." },
  { title: "International treaties", body: "Georgia maintains a network of double-taxation agreements that can matter where two jurisdictions potentially treat the same individual as resident." },
] as const;

const reveal: Variants = {
  hidden: { clipPath: "inset(0 0 100% 0)", y: 36 },
  visible: { clipPath: "inset(0 0 0 0)", y: 0, transition: { duration: 0.72, ease: [0.16, 1, 0.3, 1] } },
};

function scrollToSection(id: string) {
  scrollToHash(`#${id}`);
}

export function GeorgiaTaxResidencyLandingPage() {
  const { lang, setLang, tx } = useI18n();
  const { company } = useSiteContent();
  const { openPrivacy, openTerms } = useUI();
  const content = copyByLanguage[lang] ?? copyByLanguage.en;
  const sourcePathway = pathwayCopyByLanguage.en;
  const pathway: PathwayCopy = {
    ...sourcePathway,
    eyebrow: tx(sourcePathway.eyebrow),
    title: tx(sourcePathway.title),
    body: tx(sourcePathway.body),
    primary: tx(sourcePathway.primary),
    education: tx(sourcePathway.education),
    disclaimer: tx(sourcePathway.disclaimer),
    stages: sourcePathway.stages.map((stage) => ({
      ...stage,
      title: tx(stage.title),
      body: tx(stage.body),
      details: stage.details.map((detail) => tx(detail)),
      action: tx(stage.action),
    })),
  };
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [openPathStage, setOpenPathStage] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [requestReference, setRequestReference] = useState<string | null>(null);
  const languageRef = useRef<HTMLDivElement | null>(null);
  const formStartedAt = useRef(Date.now());
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.35 });
  const heroImageY = useTransform(smoothProgress, [0, 0.28], [0, 88]);
  const progressWidth = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);
  const [scrolled, setScrolled] = useState(false);
  const currentLanguage = LANGS.find((option) => option.code === lang)?.native ?? lang.toUpperCase();

  useEffect(() => {
    document.title = content.metaTitle;
    document.documentElement.lang = lang;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) description.content = content.metaDescription;
  }, [content.metaDescription, content.metaTitle, lang]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!languageOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !languageRef.current?.contains(event.target)) setLanguageOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLanguageOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [languageOpen]);

  const handleNav = (id: string) => {
    setMenuOpen(false);
    setTimeout(() => scrollToSection(id), 0);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const interest = String(form.get("interest") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const taxResidence = String(form.get("taxResidence") ?? "").trim();
    const profile = String(form.get("profile") ?? "").trim();
    const messageBody = String(form.get("message") ?? "").trim();
    const message = [
      messageBody,
      phone ? `WhatsApp / Phone: ${phone}` : "",
      taxResidence ? `Current country of tax residence: ${taxResidence}` : "",
      profile ? `Approximate profile: ${profile}` : "",
    ]
      .filter(Boolean)
      .join("\n") || `Interest: ${interest}`;
    const website = String(form.get("website") ?? "").trim();
    setSubmitError(null);
    setSubmitting(true);
    const result = await recordContactSubmission(
      { name, email, interest: `Georgia tax residency: ${interest}`, message, requestType: "message" },
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

  return (
    <div id="main-content" className={styles.page}>
      <motion.div className={styles.progressBar} style={{ width: progressWidth }} aria-hidden="true" />

      <header className={`${styles.header} ${scrolled || menuOpen ? styles.headerScrolled : ""}`}>
        <div className={styles.headerInner}>
          <Link href="/" aria-label={content.home} className={styles.logoLink}>
            <Image src={aixcoLiveLogos.aixcoHorizontalDark} alt="AIXCO.Global" width={1600} height={333} sizes="9rem" />
          </Link>
          <nav aria-label="Primary navigation" className={styles.desktopNav}>
            <button type="button" onClick={() => handleNav("clock")}>{content.nav.clock}</button>
            <button type="button" onClick={() => handleNav("position")}>{content.nav.position}</button>
            <button type="button" onClick={() => handleNav("path")}>{content.nav.path}</button>
            <button type="button" onClick={() => handleNav("why")}>{content.nav.why}</button>
          </nav>
          <div className={styles.headerActions}>
            <button type="button" className={styles.headerCta} onClick={() => handleNav("contact")}>
              {content.consultation}<ArrowUpRight size={14} aria-hidden />
            </button>
            <div className={styles.language} ref={languageRef}>
              <button type="button" className={styles.languageButton} aria-label={`${currentLanguage} — ${content.language}`} aria-expanded={languageOpen} onClick={() => setLanguageOpen((open) => !open)}>
                <Globe2 size={15} aria-hidden /><span>{currentLanguage}</span><ChevronDown size={13} className={languageOpen ? styles.chevronOpen : ""} aria-hidden />
              </button>
              <AnimatePresence>
                {languageOpen ? (
                  <motion.div className={`${styles.languageMenu} landing-language-panel`} initial={{ clipPath: "inset(0 0 100% 0)", y: -8 }} animate={{ clipPath: "inset(0 0 0 0)", y: 0 }} exit={{ clipPath: "inset(0 0 100% 0)", y: -8 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
                    {LANGS.map((option) => (
                      <button key={option.code} type="button" data-active={option.code === lang} onClick={() => { setLang(option.code); setLanguageOpen(false); }}>
                        <span>{option.label}</span><span>{option.native}</span>
                      </button>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
            <button type="button" className={styles.menuButton} aria-label={menuOpen ? content.closeMenu : content.menu} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
              {menuOpen ? <X size={21} aria-hidden /> : <Menu size={21} aria-hidden />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {menuOpen ? (
            <motion.nav className={`${styles.mobileNav} landing-mobile-nav`} aria-label="Mobile navigation" initial={{ height: 0, clipPath: "inset(0 0 100% 0)" }} animate={{ height: "auto", clipPath: "inset(0 0 0 0)" }} exit={{ height: 0, clipPath: "inset(0 0 100% 0)" }} transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}>
              {["clock", "position", "path", "why", "contact"].map((id) => (
                <button key={id} type="button" onClick={() => handleNav(id)}>{content.nav[id as keyof typeof content.nav]}</button>
              ))}
            </motion.nav>
          ) : null}
        </AnimatePresence>
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="tax-hero-title">
          <div className={styles.heroCopy}>
            <motion.div initial={reducedMotion ? false : "hidden"} animate="visible" variants={reveal}>
              <p className={styles.eyebrow}><span />{content.hero.eyebrow}</p>
              <h1 id="tax-hero-title">{content.hero.title}<br />{" "}<span>{content.hero.accent}</span></h1>
              <p className={styles.heroBody}>{content.hero.body}</p>
              <p className={styles.heroDisclaimer}>{content.hero.disclaimer}</p>
              <div className={styles.heroActions}>
                <button type="button" className={styles.goldButton} onClick={() => handleNav("contact")}>{content.hero.primary}<ArrowUpRight size={16} aria-hidden /></button>
                <button type="button" className={styles.textButton} onClick={() => handleNav("clock")}>{content.hero.secondary}<ArrowDown size={16} aria-hidden /></button>
              </div>
              <div className={styles.heroFootnote}><span>{content.hero.note}</span><span>{content.hero.location}</span></div>
            </motion.div>
          </div>
          <div className={styles.heroMedia}>
            <motion.div className={styles.heroImageInner} style={reducedMotion ? undefined : { y: heroImageY }}>
              <Image src={heroImage} alt="Batumi coastline and modern architecture in Georgia" fill preload quality={90} sizes="(min-width: 821px) 59vw, 100vw" />
            </motion.div>
            <div className={styles.heroMediaCaption}><span>{content.hero.location}</span><span>41.6168° N · 41.6367° E</span></div>
          </div>
        </section>

        <section id="clock" className={`${styles.clockSection} ${styles.pathwaySection}`} aria-labelledby="pathway-title">
          <div className={styles.pathwayGrid}>
            <motion.div className={styles.pathwayIntro} initial={reducedMotion ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={reveal}>
              <p className={styles.eyebrow}><span />{pathway.eyebrow}</p>
              <h2 id="pathway-title">{pathway.title}</h2>
              <p>{pathway.body}</p>
              <div className={styles.pathwayLinks}>
                <button type="button" className={styles.goldButton} onClick={() => handleNav("contact")}>
                  {pathway.primary}<ArrowUpRight size={16} aria-hidden />
                </button>
                <button type="button" className={styles.inlineLink} onClick={() => handleNav("position")}>
                  {pathway.education}<ArrowDown size={15} aria-hidden />
                </button>
              </div>
              <p className={styles.pathwayDisclaimer}>{pathway.disclaimer}</p>
            </motion.div>
            <motion.div id="position" className={styles.pathwayList} initial={reducedMotion ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={reveal}>
              {pathway.stages.map((stage, index) => {
                const isOpen = openPathStage === index;
                const panelId = `pathway-stage-${lang}-${index}`;
                return (
                  <div key={stage.number} className={`${styles.pathwayStage} ${isOpen ? styles.pathwayStageOpen : ""}`}>
                    <button
                      type="button"
                      className={styles.pathwayStageTrigger}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenPathStage(isOpen ? -1 : index)}
                    >
                      <span className={styles.pathwayNumber}>{stage.number}</span>
                      <span className={styles.pathwayStageTitle}>{stage.title}</span>
                      <ChevronDown className={styles.pathwayChevron} size={22} strokeWidth={1.4} aria-hidden />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen ? (
                        <motion.div id={panelId} className={styles.pathwayStagePanel} initial={reducedMotion ? false : { clipPath: "inset(0 0 100% 0)", height: 0 }} animate={{ clipPath: "inset(0 0 0 0)", height: "auto" }} exit={reducedMotion ? undefined : { clipPath: "inset(0 0 100% 0)", height: 0 }} transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}>
                          <p>{stage.body}</p>
                          <ul>
                            {stage.details.map((detail) => <li key={detail}><Check size={15} strokeWidth={1.8} aria-hidden />{detail}</li>)}
                          </ul>
                          <button type="button" className={styles.pathwayAction} onClick={() => handleNav(stage.target)}>
                            {stage.action}<ArrowUpRight size={15} aria-hidden />
                          </button>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </section>

        <section id="difference" className={styles.sourceSection}>
          <div className={styles.sourceIntro}>
            <p className={styles.eyebrow}><span />{tx("04 — Tax residency or residence permit?")}</p>
            <h2>{tx("Tax residency or residence permit?")}</h2>
            <p>{tx("Although they are often discussed together, tax residency and a residence permit serve entirely different purposes. One determines your tax status, while the other determines your immigration status.")}</p>
          </div>
          <div className={styles.legalConceptGrid}>
            <article><span>{tx("Tax status")}</span><h3>{tx("Tax residency")}</h3><p>{tx("Determines whether Georgia treats you as tax resident for a particular tax year.")}</p><strong>{tx("183-day / HNWI route")}</strong></article>
            <article><span>{tx("Immigration status")}</span><h3>{tx("Residence permit")}</h3><p>{tx("Determines whether you have permission to reside in Georgia under an applicable immigration route.")}</p><strong>{tx("Property / investment / work / other")}</strong></article>
            <article><span>{tx("Evidence")}</span><h3>{tx("Tax-residency certificate")}</h3><p>{tx("A document confirming Georgian tax-resident status for the relevant period, where issued under the applicable procedure.")}</p><strong>{tx("One does not automatically create the others.")}</strong></article>
          </div>
        </section>

        <section id="why" className={styles.whySection} aria-labelledby="why-title">
          <div className={styles.whyImage}><Image src={aixcoLiveImages.taxResidencyWhyGeorgia} alt="Batumi skyline and waterfront at sunset" fill quality={90} sizes="(min-width: 821px) 45vw, 100vw" /></div>
          <div className={styles.whyCopy}>
            <motion.div initial={reducedMotion ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={reveal}>
              <p className={styles.eyebrow}><span />{content.why.eyebrow}</p>
              <h2 id="why-title">{content.why.title}</h2>
              <p className={styles.whyBody}>{content.why.body}</p>
            </motion.div>
            <div className={styles.featureGrid}>
              {content.why.features.map((feature, index) => (
                <motion.article key={feature.title} initial={reducedMotion ? false : { clipPath: "inset(0 0 100% 0)", y: 18 }} whileInView={{ clipPath: "inset(0 0 0 0)", y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}>
                  <span>0{index + 1}</span><h3>{feature.title}</h3><p>{feature.body}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="tax-system" className={styles.sourceSectionDark}>
          <div className={styles.sourceIntro}>
            <p className={styles.eyebrow}><span />{tx("05 — A tax system built around source")}</p>
            <h2>{tx("A tax system built around source.")}</h2>
            <p>{tx("Georgia's tax system can offer significant advantages, but the right outcome depends on your individual circumstances and the rules of your home country.")}</p>
          </div>
          <div className={styles.taxFeatureGrid}>
            {taxSystemFeatures.map((feature, index) => <article key={feature.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{tx(feature.title)}</h3><p>{tx(feature.body)}</p></article>)}
          </div>
          <p className={styles.sourceDisclaimer}>{tx("Tax residency in Georgia does not automatically end your tax residency or tax obligations in another country.")}</p>
        </section>

        <section id="international" className={styles.sourceSection}>
          <div className={styles.sourceIntro}>
            <p className={styles.eyebrow}><span />{tx("06 — The international question")}</p>
            <h2>{tx("Getting Georgian residency is only half the analysis.")}</h2>
          </div>
          <div className={styles.internationalFlow}>
            <article><span>01</span><h3>{tx("Country of departure")}</h3><p>{tx("Do you still have a permanent home, spouse or dependants, business ownership or management, employment, economic interests or significant physical presence?")}</p></article>
            <i aria-hidden>→</i>
            <article><span>02</span><h3>{tx("Georgia")}</h3><p>{tx("Have you met the 183-day rule, the HNWI framework, the applicable source-of-income rules and the required evidence?")}</p></article>
            <i aria-hidden>→</i>
            <article><span>03</span><h3>{tx("Tax treaty")}</h3><p>{tx("If both countries consider you resident, the applicable Double Taxation Agreement may determine treaty residence and allocate taxing rights.")}</p></article>
          </div>
          <p className={styles.sourceDisclaimer}>{tx("AIXCO coordinates the Georgian side. Your home-country exit position should be reviewed with qualified advisers in that jurisdiction.")}</p>
        </section>

        <section id="hnwi-clients" className={styles.sourceSectionGold}>
          <div className={styles.sourceIntro}>
            <p className={styles.eyebrow}><span />{tx("07 — For HNWI clients")}</p>
            <h2>{tx("A dedicated route for qualifying high-net-worth individuals.")}</h2>
            <p>{tx("Eligible applicants may qualify without meeting the 183-day physical-presence requirement, provided all applicable financial and Georgian-connection conditions are satisfied.")}</p>
          </div>
          <div className={styles.hnwiQualification}>
            <article><span>01</span><h3>{tx("Financial qualification")}</h3><strong>{tx("GEL 3 million+ worldwide assets")}</strong><em>{tx("or")}</em><strong>{tx("GEL 200,000+ annual income in each of the previous three years")}</strong></article>
            <article><span>02</span><h3>{tx("Georgian assets")}</h3><strong>{tx("USD 500,000+ qualifying assets located in Georgia*")}</strong></article>
            <article><span>03</span><h3>{tx("Georgian connection")}</h3><strong>{tx("Residence permit or citizenship")}</strong><em>{tx("or")}</em><strong>{tx("GEL 25,000+ qualifying Georgian-source income*")}</strong></article>
          </div>
        </section>

        <section id="eligibility" className={styles.sourceSection}>
          <div className={styles.sourceIntro}>
            <p className={styles.eyebrow}><span />{tx("08 — HNWI eligibility check")}</p>
            <h2>{tx("Could the HNWI route apply to you?")}</h2>
            <p>{tx("Answer a few simple questions to understand whether the HNWI tax-residency framework may be relevant. This is an initial self-assessment only.")}</p>
          </div>
          <div className={styles.eligibilityGrid}>
            <fieldset><legend><span>01</span>{tx("Financial qualification")}</legend><label><input type="checkbox" />{tx("I own worldwide assets exceeding GEL 3 million")}</label><label><input type="checkbox" />{tx("My annual income exceeded GEL 200,000 in each of the previous three years")}</label></fieldset>
            <fieldset><legend><span>02</span>{tx("Georgian assets")}</legend><label><input type="checkbox" />{tx("Yes — I own USD 500,000+ in qualifying Georgian assets")}</label><label><input type="checkbox" />{tx("I am planning to acquire qualifying assets")}</label><label><input type="checkbox" />{tx("Not yet")}</label></fieldset>
            <fieldset><legend><span>03</span>{tx("Georgian connection")}</legend><label><input type="checkbox" />{tx("Georgian residence permit or citizenship")}</label><label><input type="checkbox" />{tx("GEL 25,000+ qualifying Georgian-source income*")}</label><label><input type="checkbox" />{tx("Not sure")}</label></fieldset>
          </div>
          <button type="button" className={styles.sourceCta} onClick={() => handleNav("contact")}>{tx("Discuss your eligibility")}<ArrowUpRight size={16} /></button>
          <p className={styles.sourceDisclaimer}>{tx("Every situation is unique. Final eligibility depends on individual circumstances and should be confirmed by qualified Georgian legal and tax professionals.")}</p>
        </section>

        <section id="path" className={styles.sourceSectionDark}>
          <div className={styles.sourceIntro}>
            <p className={styles.eyebrow}><span />{tx("09 — AIXCO private client process")}</p>
            <h2>{tx("From question to coordinated position.")}</h2>
          </div>
          <ol className={styles.privateProcess}>
            {privateClientProcess.map((step, index) => <li key={step.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{tx(step.title)}</h3><p>{tx(step.body)}</p></div></li>)}
          </ol>
        </section>

        <section id="why-aixco" className={styles.sourceSection}>
          <div className={styles.sourceIntro}>
            <p className={styles.eyebrow}><span />{tx("10 — Why AIXCO")}</p>
            <h2>{tx("More than a tax-residency application.")}</h2>
            <p>{tx("AIXCO supports international private clients across the practical elements of establishing a position in Georgia.")}</p>
          </div>
          <div className={styles.aixcoSupportGrid}>
            <article><House size={22} /><h3>{tx("Property")}</h3><p>{tx("Access selected Georgian real estate and local market expertise.")}</p></article>
            <article><ShieldCheck size={22} /><h3>{tx("Residency")}</h3><p>{tx("Coordinate property-based and other relevant residency pathways.")}</p></article>
            <article><Globe2 size={22} /><h3>{tx("Private client support")}</h3><p>{tx("Connect banking, local administration, professional advisers and ongoing coordination.")}</p></article>
          </div>
        </section>

        <section id="contact" className={styles.contactSection} aria-labelledby="contact-title">
          <div className={styles.contactIntro}>
            <motion.div initial={reducedMotion ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={reveal}>
              <p className={styles.eyebrow}><span />{content.contact.eyebrow}</p>
              <h2 id="contact-title">{content.contact.title}</h2>
              <p>{content.contact.body}</p>
              <div className={styles.contactCoordinates}><span>41.6168° N</span><span>41.6367° E</span><span>Private client desk</span></div>
            </motion.div>
          </div>
          <div className={styles.contactPanel}>
            {submitted ? (
              <motion.div className={styles.success} initial={reducedMotion ? false : { clipPath: "inset(0 0 100% 0)", y: 18 }} animate={{ clipPath: "inset(0 0 0 0)", y: 0 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} role="status">
                <span className={styles.successIcon}><Check size={25} aria-hidden /></span>
                <h3>{content.contact.successTitle}</h3><p>{content.contact.successBody}</p>
                {requestReference ? <p className={styles.reference}>{content.contact.reference}: {requestReference}</p> : null}
                <button type="button" className={styles.textButton} onClick={() => { setSubmitted(false); setRequestReference(null); formStartedAt.current = Date.now(); }}>{content.contact.another}<ArrowUpRight size={15} aria-hidden /></button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form} aria-labelledby="contact-title">
                <input className={styles.honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                <div className={styles.formRow}>
                  <label>{content.contact.name}<input required minLength={2} maxLength={100} name="name" autoComplete="name" placeholder={content.contact.namePlaceholder} /></label>
                  <label>{content.contact.email}<input required maxLength={255} name="email" type="email" autoComplete="email" placeholder={content.contact.emailPlaceholder} /></label>
                </div>
                <div className={styles.formRow}>
                  <label>{content.contact.phone}<input maxLength={40} name="phone" type="tel" autoComplete="tel" placeholder={content.contact.phonePlaceholder} /></label>
                  <label>{content.contact.taxResidence}<input maxLength={80} name="taxResidence" autoComplete="country-name" placeholder={content.contact.taxResidencePlaceholder} /></label>
                </div>
                <label>{content.contact.interest}<select name="interest" defaultValue={content.contact.interestOptions[0]}>{content.contact.interestOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
                <label>{content.contact.profile}<select name="profile" defaultValue={content.contact.profileOptions[0]}>{content.contact.profileOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
                <label>{content.contact.message}<textarea maxLength={1500} rows={5} name="message" placeholder={content.contact.messagePlaceholder} /></label>
                {submitError ? <p className={styles.formError} role="alert">{submitError}</p> : null}
                <div className={styles.formFooter}><div><p>{content.contact.consent}</p><p className={styles.formDisclaimer}>{content.contact.formDisclaimer}</p></div><button type="submit" className={styles.goldButton} disabled={submitting}>{submitting ? content.contact.sending : content.contact.submit}<ArrowUpRight size={16} aria-hidden /></button></div>
              </form>
            )}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <Link href="/" aria-label={content.home}><Image src={aixcoLiveLogos.aixcoHorizontalDark} alt="AIXCO.Global" width={1600} height={333} sizes="8rem" /></Link>
        <div className={styles.footerInfo}><a href={`mailto:${company.email}`}>{company.email}</a><span>{company.offices.join(" · ")}</span></div>
        <div className={styles.footerLinks}><Link href="/">{content.footer.home}</Link><button type="button" onClick={openPrivacy}>{content.footer.privacy}</button><button type="button" onClick={openTerms}>{content.footer.terms}</button><button type="button" onClick={openAnalyticsPreferences}>{content.footer.cookies}</button><Link href="/georgia-tax-residency/photo-credits">{content.footer.photos}</Link></div>
        <p>© {new Date().getFullYear()} AIXCO.Global. {content.footer.rights}</p>
      </footer>
    </div>
  );
}
