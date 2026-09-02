"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, ChevronDown, Download, Globe, Menu, X } from "lucide-react";
import { LANGS, useI18n } from "@/i18n/I18nProvider";
import { useSiteContent } from "@/data/site-content-context";
import { DownloadGateLink } from "@/components/downloads/DownloadGateLink";
import { getContactSubmitErrorMessage } from "@/lib/contact-submit-error";
import { recordContactSubmission } from "@/lib/backend/lead-capture";
import { aixcoLiveImages, aixcoLiveLogos } from "@/lib/aixco-live-assets";
import { openAnalyticsPreferences } from "@/lib/analytics/client";
import { LandingSiblingLinks } from "@/components/landing/LandingSiblingLinks";
import { scrollToHash } from "@/lib/smooth-scroll";
import type { Lang } from "@/i18n/languages";

const chapters = [
  { id: "paths", roman: "01", label: "Residency paths" },
  { id: "why-georgia", roman: "05", label: "Why Georgia" },
  { id: "support", roman: "08", label: "AIXCO support" },
  { id: "property", roman: "09", label: "Qualifying property" },
  { id: "contact", roman: "10", label: "Request" },
] as const;

const permitPaths = [
  {
    id: "business",
    roman: "01",
    title: "Business activity",
    price: "BUSINESS",
    detail: "A residence route may be available through qualifying entrepreneurial or employment activity in Georgia, subject to the applicable legal requirements.",
    note: "Best suited to founders, business owners and professionals establishing an active local base.",
    image: aixcoLiveImages.batumiMosaicBlueTower,
  },
  {
    id: "property",
    roman: "02",
    title: "Property ownership",
    price: "$150K+",
    detail: "Qualifying non-agricultural property exceeding $150,000 certified market value can support a short-term residence application.",
    note: "The certified market value — not solely the advertised or purchase price — is used for eligibility.",
    image: aixcoLiveImages.currentProjectCleanFacade,
  },
  {
    id: "investment",
    roman: "03",
    title: "Qualifying investment",
    price: "$300K+",
    detail: "A qualifying investment of at least $300,000 may support an investment residence route, subject to the statutory conditions and approval.",
    note: "Specified dependent family members may also qualify under the investment route where the legal conditions are met.",
    image: aixcoLiveImages.batumiMosaicDuskAerialCentral,
  },
] as const;

const whyGeorgiaCards = [
  { title: "Property ownership", body: "Foreigners can generally own qualifying residential and commercial real estate, with agricultural land subject to separate restrictions." },
  { title: "Residency through property", body: "Qualifying non-agricultural property exceeding $150,000 certified market value can support a short-term residence application." },
  { title: "Family access", body: "Qualifying property-based residence can extend to a spouse and children." },
  { title: "Fast processing", body: "Official processing options are available from 10 to 30 calendar days for the short-term property residence permit." },
] as const;

const supportSteps = [
  { title: "Eligibility review", body: "Identify the most appropriate residency route." },
  { title: "Property / business structure", body: "Select qualifying property or establish the required local structure." },
  { title: "Documentation", body: "Coordinate valuations, translations, notarisation and required supporting documents." },
  { title: "Application", body: "Prepare and coordinate the residence-permit application." },
  { title: "Local setup", body: "Residence card · registered address · banking coordination*" },
  { title: "Tax & relocation", body: "Where applicable, coordinate tax-residency and relocation requirements with appropriate professional advisers." },
] as const;

const aixcoMetrics = [
  { value: "Since 2009", body: "Building long-term expertise in residential real estate and international expansion." },
  { value: "2,000+", body: "Transactions across residential property acquisitions, sales and development." },
  { value: "$4.2B+", body: "Property value transacted across multiple markets." },
  { value: "90+", body: "Professionals across real estate, finance, legal coordination, development and private client services." },
] as const;

// Legacy sections remain hidden to keep this focused content correction surgical;
// empty collections ensure they render no duplicate copy.
const hnwiSteps: Array<{ roman: string; title: string; time: string }> = [];
const relocationIncludes: string[] = [];
const services: string[] = [];

const interestOptions = [
  "Property-based residency",
  "Investment residency",
  "Business-based residency",
  "Tax residency / HNWI",
  "Property + residency",
  "Not sure yet",
] as const;

const budgetOptions = [
  "Under $150K",
  "$150K–$300K",
  "$300K–$500K",
  "$500K+",
  "Prefer not to say",
] as const;

const taxGuideDownloads: Record<Lang, { href: string; fileName: string }> = {
  en: { href: "/aixco-global-op2/documents/aixco-tax-residency-guide-hnwi-en.pdf", fileName: "AIXCO-Tax-Residency-Guide-for-HNWIs.pdf" },
  de: { href: "/aixco-global-op2/documents/aixco-leitfaden-steuerresidenz-hnwi-de.pdf", fileName: "AIXCO-Leitfaden-zur-Steuerresidenz-fuer-HNWI.pdf" },
  pl: { href: "/aixco-global-op2/documents/aixco-tax-residency-guide-hnwi-en.pdf", fileName: "AIXCO-Tax-Residency-Guide-for-HNWIs.pdf" },
  sl: { href: "/aixco-global-op2/documents/aixco-tax-residency-guide-hnwi-en.pdf", fileName: "AIXCO-Tax-Residency-Guide-for-HNWIs.pdf" },
  ru: { href: "/aixco-global-op2/documents/aixco-tax-residency-guide-hnwi-en.pdf", fileName: "AIXCO-Tax-Residency-Guide-for-HNWIs.pdf" },
};

const residenceGuideDownloads: Record<Lang, { href: string; fileName: string }> = {
  en: { href: "/aixco-global-op2/documents/aixco-brief-residence-guide-en.pdf", fileName: "AIXCO-Brief-Residence-Guide.pdf" },
  de: { href: "/aixco-global-op2/documents/aixco-aufenthaltsleitfaden-kompakt-de.pdf", fileName: "AIXCO-Aufenthaltsleitfaden-Kompakt.pdf" },
  pl: { href: "/aixco-global-op2/documents/aixco-brief-residence-guide-en.pdf", fileName: "AIXCO-Brief-Residence-Guide.pdf" },
  sl: { href: "/aixco-global-op2/documents/aixco-brief-residence-guide-en.pdf", fileName: "AIXCO-Brief-Residence-Guide.pdf" },
  ru: { href: "/aixco-global-op2/documents/aixco-brief-residence-guide-en.pdf", fileName: "AIXCO-Brief-Residence-Guide.pdf" },
};

function scrollToId(id: string) {
  scrollToHash(`#${id}`);
}

export function GeorgiaResidencyLandingPage() {
  const { lang, setLang, tx } = useI18n();
  const { company } = useSiteContent();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [requestReference, setRequestReference] = useState<string | null>(null);
  const [languageOpen, setLanguageOpen] = useState(false);
  const languageSwitcherRef = useRef<HTMLDivElement | null>(null);
  const formStartedAtRef = useRef(Date.now());
  const currentLangName = LANGS.find((option) => option.code === lang)?.native ?? lang.toUpperCase();
  const taxGuide = taxGuideDownloads[lang] ?? taxGuideDownloads.en;
  const residenceGuide = residenceGuideDownloads[lang] ?? residenceGuideDownloads.en;

  const criteria = [
    {
      value: "€1,010,000",
      body: "Net worth of at least €1,010,000, or annual income of €67,000 for each of the preceding 3 years.",
    },
    {
      value: "€460,000",
      body: "Ownership of assets in Georgia, including real estate, cash, or cryptocurrency, with a minimum value of €460,000.",
    },
    {
      value: tx("Permit"),
      body: "A connection in Georgia through a residence permit.",
    },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!languageOpen) return;
    const closeFromOutside = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || languageSwitcherRef.current?.contains(target)) return;
      setLanguageOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLanguageOpen(false);
    };
    window.addEventListener("pointerdown", closeFromOutside);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closeFromOutside);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [languageOpen]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const interest = String(form.get("interest") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const budget = String(form.get("budget") ?? "").trim();
    const messageBody = String(form.get("message") ?? "").trim();
    const message = [
      messageBody,
      phone ? `WhatsApp / Phone: ${phone}` : "",
      budget ? `Approximate budget: ${budget}` : "",
    ]
      .filter(Boolean)
      .join("\n") || `Interest: ${interest}`;
    const website = String(form.get("website") ?? "").trim();
    setSubmitError(null);
    setIsSubmitting(true);
    const result = await recordContactSubmission(
      { name, email, interest, message, requestType: "message" },
      { antiAbuse: { website, startedAt: formStartedAtRef.current }, locale: lang },
    );
    setIsSubmitting(false);
    if (result.ok) {
      setRequestReference(result.reference ?? null);
      setSubmitted(true);
      return;
    }
    setSubmitError(tx(getContactSubmitErrorMessage(result.reason)));
  };

  return (
    <div id="main-content" className="residency-dossier residency-editorial">
      <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled || menuOpen ? "bg-[#161616]" : "bg-transparent"}`}>
        <div className="landing-header-bar mx-auto flex h-[var(--aixco-header-height)] max-w-[1480px] items-center justify-between gap-3 px-5 sm:px-8">
          <Link href="/" aria-label={tx("AIXCO.Global home")} className="flex min-w-0 shrink-0 items-center">
            <Image
              src={aixcoLiveLogos.aixcoHorizontalDark}
              alt="AIXCO.Global"
              width={1600}
              height={333}
              sizes="10rem"
              className="landing-header-logo h-auto w-[7.25rem] sm:w-36"
            />
          </Link>
          <nav aria-label={tx("Page chapters")} className="hidden min-w-0 items-center gap-6 lg:flex">
            {chapters.map((chapter) => (
              <a
                key={chapter.id}
                href={`#${chapter.id}`}
                onClick={(event) => {
                  event.preventDefault();
                  scrollToId(chapter.id);
                }}
                className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/70 transition-colors hover:text-white"
              >
                {tx(chapter.label)}
              </a>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <a
              href="#contact"
              onClick={(event) => {
                event.preventDefault();
                setMenuOpen(false);
                scrollToId("contact");
              }}
              className="landing-header-control hidden min-h-10 items-center bg-[#E6C767] px-4 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#161616] sm:inline-flex"
            >
              {tx("Request access")}
            </a>
            <div ref={languageSwitcherRef} className="relative">
              <button
                type="button"
                data-language-trigger="true"
                aria-expanded={languageOpen}
                aria-controls="residency-language-list"
                aria-label={`${currentLangName} ${tx("Change language")}`}
                onClick={() => setLanguageOpen((open) => !open)}
                className="landing-header-control inline-flex min-h-10 items-center gap-1 px-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white/80"
              >
                <Globe size={13} strokeWidth={1.6} aria-hidden />
                <span className="sm:hidden">{lang.toUpperCase()}</span>
                <span className="hidden sm:inline">{currentLangName}</span>
                <ChevronDown size={12} className={languageOpen ? "rotate-180" : undefined} aria-hidden />
              </button>
              {languageOpen ? (
                <div id="residency-language-list" className="landing-language-panel absolute end-0 top-[calc(100%+0.4rem)] z-[80] w-52 border border-white/10 bg-[#161616] p-1.5">
                  <ul aria-label={tx("Change language")} className="grid gap-1">
                    {LANGS.map((option) => (
                      <li key={option.code}>
                        <button
                          type="button"
                          data-lang={option.code}
                          aria-current={option.code === lang ? "true" : undefined}
                          translate="no"
                          onClick={() => {
                            setLang(option.code);
                            setLanguageOpen(false);
                          }}
                          className={`flex min-h-10 w-full items-center justify-between px-3 text-start text-sm ${option.code === lang ? "bg-[#E6C767]/20 text-white" : "text-white/75 hover:bg-white/5"}`}
                        >
                          <span lang={option.code} translate="no" className="notranslate">{option.label}</span>
                          <span className="text-[0.62rem] uppercase tracking-[0.14em] opacity-50">{option.native}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              className="landing-header-control inline-flex min-h-10 min-w-10 items-center justify-center text-white lg:hidden"
              aria-label={menuOpen ? tx("Close navigation") : tx("Open navigation")}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {menuOpen ? (
          <nav aria-label={tx("Mobile navigation")} className="landing-mobile-nav border-t border-white/10 bg-[#161616] px-5 py-4 lg:hidden">
            {chapters.map((chapter) => (
              <a
                key={chapter.id}
                href={`#${chapter.id}`}
                onClick={(event) => {
                  event.preventDefault();
                  setMenuOpen(false);
                  scrollToId(chapter.id);
                }}
                className="flex min-h-12 items-center justify-between border-b border-white/10 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white"
              >
                <span>{tx(chapter.label)}</span>
                <span className="text-[#E6C767]">{chapter.roman}</span>
              </a>
            ))}
          </nav>
        ) : null}
      </header>

      <main>
        <section className="relative min-h-[100svh] overflow-hidden bg-[#0b0b0b]">
          <Image
            src={aixcoLiveImages.batumiMosaicDuskAerialCentral}
            alt={tx("Batumi skyline at dusk")}
            fill
            preload
            sizes="100vw"
            className="object-cover"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/25" />
          <div className="residency-frame hidden sm:block" />
          <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1480px] flex-col justify-end px-5 pb-10 pt-28 sm:px-10 sm:pb-14 lg:px-16">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-[#E6C767]">{tx("GEORGIA RESIDENCY")}</p>
            <h1 className="mt-5 max-w-[14ch] text-[clamp(2.15rem,11vw,7.6rem)] font-medium leading-[0.9] tracking-[-0.055em] text-white [overflow-wrap:anywhere] [hyphens:auto]">
              {tx("OWN. ESTABLISH.")} <span className="text-[#E6C767]">{tx("RESIDE.")}</span>
            </h1>
            <p className="mt-6 max-w-[34rem] text-base leading-[1.6] text-white/72 sm:text-lg">
              {tx("Multiple pathways to establish residency in Georgia through property ownership, qualifying investment or business activity. AIXCO coordinates the process from documentation and property selection to application support and local setup.")}
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:max-w-[38rem]">
              <a
                href="#paths"
                onClick={(event) => {
                  event.preventDefault();
                  scrollToId("paths");
                }}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 bg-[#E6C767] px-5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#161616] sm:justify-start sm:text-[0.74rem]"
              >
                {tx("FIND YOUR RESIDENCY PATH")}
              </a>
              <DownloadGateLink
                href={residenceGuide.href}
                fileName={residenceGuide.fileName}
                lockedHref="#contact"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 border border-white/30 px-5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-white hover:border-[#E6C767] hover:bg-[#E6C767] hover:text-[#161616] sm:justify-start sm:text-[0.74rem]"
              >
                {tx("DOWNLOAD RESIDENCY GUIDE")}
              </DownloadGateLink>
            </div>
            <p className="mt-6 max-w-[34rem] text-xs leading-5 text-white/50">{tx("Residency eligibility is subject to Georgian immigration law, individual circumstances and approval by the competent Georgian authorities.")}</p>
            <div className="mt-10 grid max-w-[44rem] grid-cols-1 border-t border-white/20 min-[520px]:grid-cols-3">
              {permitPaths.map((path) => (
                <a
                  key={path.id}
                  href={`#${path.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToId(path.id);
                  }}
                  className="border-b border-white/15 px-0 py-4 last:border-b-0 min-[520px]:border-b-0 min-[520px]:border-r min-[520px]:px-5 min-[520px]:py-5 min-[520px]:last:border-r-0"
                >
                  <strong className="block text-2xl font-medium tracking-[-0.04em] text-[#E6C767] sm:text-3xl">{path.price}</strong>
                  <span className="mt-2 block text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-white/70">{tx(path.title)}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="legacy-paths" className="hidden" aria-hidden="true">
          {permitPaths.map((path) => (
            <article key={path.id} id={path.id} className="relative min-h-[78svh] overflow-hidden border-t border-white/10">
              <Image src={path.image} alt="" fill sizes="100vw" className="object-cover" />
              <div aria-hidden className="absolute inset-0 bg-[#0b0b0b]/72" />
              <div className="relative z-10 mx-auto grid min-h-[78svh] max-w-[1480px] items-end gap-10 px-5 py-16 sm:px-10 lg:grid-cols-[0.7fr_1fr] lg:px-16 lg:py-20">
                <div>
                  <p className="text-[0.7rem] font-semibold tracking-[0.28em] text-[#E6C767]">{path.roman}</p>
                  <h2 className="mt-4 max-w-[12ch] text-[clamp(2.6rem,5vw,5.2rem)] font-medium leading-[0.9] tracking-[-0.05em] text-white">{tx(path.title)}</h2>
                </div>
                <div className="max-w-[36rem] border-t border-[#E6C767]/50 pt-6 lg:justify-self-end">
                  <p className="text-4xl font-medium tracking-[-0.05em] text-[#E6C767] sm:text-5xl">{path.price}</p>
                  <p className="mt-5 text-lg leading-[1.55] text-white/78">{tx(path.detail)}</p>
                  <p className="mt-4 text-sm leading-6 text-white/58">{tx(path.note)}</p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section id="legacy-hnwi" className="hidden" aria-hidden="true">
          <div className="mx-auto max-w-[1480px] px-5 py-20 sm:px-10 lg:px-16 lg:py-28">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.26em] text-[#7A6224]">{tx("Tax residency Georgia")}</p>
            <h2 className="mt-5 max-w-[16ch] text-[clamp(2.8rem,5.4vw,5.8rem)] font-medium leading-[0.9] tracking-[-0.05em]">{tx("HNWI status, run in parallel.")}</h2>
            <p className="mt-6 max-w-[38rem] text-lg leading-[1.55] text-[#161616]/65">
              {tx("An individual may qualify for tax residency in Georgia under the HNWI regime if they meet the following criteria.")}
            </p>
            <div className="mt-12 grid gap-px bg-[#161616]/15 lg:grid-cols-3">
              {criteria.map((item) => (
                <article key={item.value} className="bg-[#F3EDE1] px-0 py-6 lg:px-6 lg:first:pl-0 lg:last:pr-0">
                  <p className="text-3xl font-medium tracking-[-0.045em] text-[#9A7425]">{item.value === tx("Permit") ? tx("Permit") : item.value}</p>
                  <p className="mt-3 max-w-[22rem] text-sm leading-6 text-[#161616]/68">{tx(item.body)}</p>
                </article>
              ))}
            </div>

            <div className="residency-spine mt-20 grid gap-12 lg:gap-16">
              {hnwiSteps.map((step, index) => (
                <article
                  key={step.roman}
                  className={`relative grid gap-3 lg:w-[46%] ${index % 2 === 1 ? "lg:ml-auto lg:text-right" : ""}`}
                >
                  <span className="absolute left-1/2 top-2 hidden h-3 w-3 -translate-x-1/2 rounded-full border border-[#E6C767] bg-[#F3EDE1] lg:block" />
                  <p className="text-[0.68rem] font-semibold tracking-[0.24em] text-[#7A6224]">{step.roman}</p>
                  <h3 className="text-2xl font-medium tracking-[-0.035em] sm:text-3xl">{tx(step.title)}</h3>
                  <p className="text-sm leading-6 text-[#161616]/62">{tx(step.time)}</p>
                </article>
              ))}
            </div>

            <div className="mt-16 grid gap-4 border-t border-[#161616]/15 pt-8 text-sm leading-6 text-[#161616]/68 lg:grid-cols-2">
              <p>{tx("All HNWI process requirements work in-parallel and not in a row, so we can start meeting the 3 main requirements at the same time.")}</p>
              <p>{tx("The residence permit application must be submitted in person while you are physically present in Georgia. After submitting, the client is free to leave and AIXCO continues managing the process.")}</p>
            </div>
          </div>
        </section>

        <section id="legacy-services" className="hidden" aria-hidden="true">
          <div className="mx-auto grid max-w-[1480px] min-w-0 grid-cols-1 gap-14 px-4 py-20 sm:px-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:px-16 lg:py-28">
            <div className="min-w-0">
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.26em] text-[#E6C767]">{tx("Our services")}</p>
              <h2 className="mt-5 max-w-[10ch] text-[clamp(2.15rem,11vw,5.2rem)] font-medium leading-[0.94] tracking-[-0.05em] [overflow-wrap:anywhere]">{tx("A relocation ledger.")}</h2>
              <p className="mt-6 max-w-[28rem] text-base leading-[1.55] text-white/62">
                {tx("For clients without an established tax residency, or who have exited their prior jurisdiction, AIXCO provides a Tax Relocation Package.")}
              </p>
              <p className="mt-10 text-5xl font-medium tracking-[-0.055em] text-[#E6C767]">2,500 EUR</p>
              <p className="mt-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/60">{tx("Tax relocation package")}</p>
              <ul className="mt-6 grid gap-2 text-sm leading-6 text-white/70">
                {relocationIncludes.map((item) => (
                  <li key={item} className="flex min-w-0 gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-[#E6C767]" />
                    <span className="min-w-0 [overflow-wrap:anywhere]">{tx(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <ol className="min-w-0 border-t border-white/15">
              {services.map((service, index) => (
                <li key={service} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 border-b border-white/10 py-4 text-sm leading-6 text-white/78 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-4">
                  <span className="text-[#E6C767]">{String(index + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 [overflow-wrap:anywhere]">{tx(service)}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="paths" className="scroll-mt-16 bg-[#F3EDE1] text-[#161616]">
          <div className="mx-auto max-w-[1480px] px-5 py-20 sm:px-10 lg:px-16 lg:py-28">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#7A6224]">{tx("01 — Three pathways to Georgian residency")}</p>
            <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
              <h2 className="max-w-[14ch] text-[clamp(2.7rem,5.4vw,5.8rem)] font-medium leading-[0.92] tracking-[-0.05em]">{tx("Choose the path that best fits your objectives.")}</h2>
              <div className="max-w-[42rem] text-base leading-7 text-[#161616]/68 sm:text-lg">
                <p>{tx("Whether your goal is to establish a business, purchase property or make a qualifying investment, Georgia offers several residence pathways designed to accommodate different personal and business circumstances.")}</p>
                <p className="mt-4">{tx("Explore the option that best matches your plans.")}</p>
              </div>
            </div>
            <div className="mt-12 grid gap-3 lg:grid-cols-3">
              {permitPaths.map((path) => (
                <article key={path.id} id={path.id} className="group flex min-h-[22rem] scroll-mt-24 flex-col border border-[#161616]/18 bg-[#F8F3E9] p-6 transition-colors hover:border-[#9A7425] hover:bg-white sm:p-8">
                  <div className="flex items-start justify-between gap-5">
                    <span className="text-[0.65rem] font-semibold tracking-[0.22em] text-[#7A6224]">{path.roman}</span>
                    <strong className="text-2xl font-medium tracking-[-0.04em] text-[#9A7425]">{path.price}</strong>
                  </div>
                  <h3 className="mt-10 text-2xl font-medium tracking-[-0.04em]">{tx(path.title)}</h3>
                  <p className="mt-4 text-base leading-7 text-[#161616]/68">{tx(path.detail)}</p>
                  <p className="mt-auto border-t border-[#161616]/12 pt-5 text-sm leading-6 text-[#161616]/56">{tx(path.note)}</p>
                </article>
              ))}
            </div>
            <p className="mt-8 max-w-[46rem] text-sm leading-6 text-[#161616]/58">{tx("For investment residence, the statutory definition of eligible family members is somewhat broader in specified dependency circumstances.")}</p>
            <a href="#property" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 bg-[#161616] px-5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#9A7425]">
              {tx("See the $300K property route")} <ArrowUpRight size={15} />
            </a>
          </div>
        </section>

        <section id="why-georgia" className="scroll-mt-16 bg-[#0b0b0b] text-white">
          <div className="mx-auto max-w-[1480px] px-5 py-20 sm:px-10 lg:px-16 lg:py-28">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#E6C767]">{tx("05 — Why Georgia?")}</p>
            <h2 className="mt-5 max-w-[16ch] text-[clamp(2.7rem,5.4vw,5.8rem)] font-medium leading-[0.92] tracking-[-0.05em]">{tx("A practical base between Europe and Asia.")}</h2>
            <div className="mt-12 grid gap-px bg-white/15 sm:grid-cols-2">
              {whyGeorgiaCards.map((item) => (
                <article key={item.title} className="bg-[#0b0b0b] p-6 transition-colors hover:bg-white/[0.04] sm:p-8">
                  <h3 className="text-lg font-medium uppercase tracking-[-0.02em] text-[#E6C767]">{tx(item.title)}</h3>
                  <p className="mt-4 max-w-[34rem] text-base leading-7 text-white/65">{tx(item.body)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="difference" className="scroll-mt-16 bg-[#F3EDE1] text-[#161616]">
          <div className="mx-auto max-w-[1480px] px-5 py-20 sm:px-10 lg:px-16 lg:py-28">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#7A6224]">{tx("06 — Residence is not tax residence")}</p>
            <h2 className="mt-5 max-w-[15ch] text-[clamp(2.7rem,5vw,5.4rem)] font-medium leading-[0.94] tracking-[-0.05em]">{tx("Two different questions. One strategy.")}</h2>
            <div className="mt-12 grid gap-4 lg:grid-cols-2">
              <article className="border border-[#161616]/18 bg-[#F8F3E9] p-6 sm:p-8">
                <span className="text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-[#7A6224]">{tx("Immigration status")}</span>
                <h3 className="mt-5 text-3xl font-medium tracking-[-0.045em]">{tx("Residence permit")}</h3>
                <p className="mt-4 text-base leading-7 text-[#161616]/66">{tx("Allows a qualifying foreign national to reside in Georgia under the applicable permit.")}</p>
                <p className="mt-8 border-t border-[#161616]/12 pt-5 text-xs font-semibold uppercase tracking-[0.16em]">{tx("Property · Business · Investment")}</p>
              </article>
              <article className="border border-[#161616]/18 bg-[#161616] p-6 text-white sm:p-8">
                <span className="text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-[#E6C767]">{tx("Tax status")}</span>
                <h3 className="mt-5 text-3xl font-medium tracking-[-0.045em]">{tx("Tax residency")}</h3>
                <p className="mt-4 text-base leading-7 text-white/66">{tx("Determines whether an individual is treated as a Georgian tax resident under applicable Georgian tax law.")}</p>
                <p className="mt-8 border-t border-white/12 pt-5 text-xs font-semibold uppercase tracking-[0.16em]">{tx("Standard / HNWI routes*")}</p>
              </article>
            </div>
          </div>
        </section>

        <section id="hnwi" className="scroll-mt-16 bg-[#002147] text-white">
          <div className="mx-auto grid max-w-[1480px] gap-10 px-5 py-20 sm:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:px-16 lg:py-28">
            <div>
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#E6C767]">{tx("07 — HNWI")}</p>
              <h2 className="mt-5 max-w-[12ch] text-[clamp(2.7rem,5vw,5.4rem)] font-medium leading-[0.94] tracking-[-0.05em]">{tx("For high-net-worth individuals.")}</h2>
            </div>
            <div className="lg:pt-10">
              <h3 className="text-2xl font-medium tracking-[-0.035em] text-[#E6C767]">{tx("Residency can be one part of a wider relocation structure.")}</h3>
              <p className="mt-5 max-w-[42rem] text-lg leading-8 text-white/68">{tx("HNWI tax-residency eligibility depends on a combination of financial qualification, Georgian connections and applicable tax rules.")}</p>
              <DownloadGateLink href={taxGuide.href} fileName={taxGuide.fileName} lockedHref="#contact" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 border border-white/40 px-5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:border-[#E6C767] hover:bg-[#E6C767] hover:text-[#161616]">
                <Download size={15} /> {tx("Download the HNWI guide")}
              </DownloadGateLink>
            </div>
          </div>
        </section>

        <section id="support" className="scroll-mt-16 bg-[#F3EDE1] text-[#161616]">
          <div className="mx-auto max-w-[1480px] px-5 py-20 sm:px-10 lg:px-16 lg:py-28">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#7A6224]">{tx("08 — How AIXCO supports")}</p>
            <h2 className="mt-5 max-w-[14ch] text-[clamp(2.7rem,5vw,5.4rem)] font-medium leading-[0.94] tracking-[-0.05em]">{tx("From application to local setup.")}</h2>
            <p className="mt-6 max-w-[52rem] text-lg leading-8 text-[#161616]/66">{tx("Establishing yourself in a new country involves more than submitting an application. AIXCO coordinates the practical steps of the process, working alongside experienced legal, tax and banking professionals to help make your transition to Georgia as straightforward as possible.")}</p>
            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {supportSteps.map((step, index) => (
                <article key={step.title} className="min-h-52 border border-[#161616]/16 bg-[#F8F3E9] p-6 transition-colors hover:border-[#9A7425] hover:bg-white">
                  <span className="text-[0.65rem] font-semibold tracking-[0.2em] text-[#7A6224]">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-7 text-xl font-medium uppercase tracking-[-0.025em]">{tx(step.title)}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#161616]/62">{tx(step.body)}</p>
                </article>
              ))}
            </div>
            <div className="mt-8 border border-[#9A7425]/40 bg-[#E9DFC9] p-6 sm:p-8">
              <h3 className="text-xl font-medium uppercase tracking-[-0.025em] text-[#7A6224]">{tx("Tax relocation package")}</h3>
              <p className="mt-3 max-w-[60rem] text-sm leading-6 text-[#161616]/66">{tx("Residence permit and card, registered and legal address, proof-of-address documentation, initial tax declarations, banking setup, audit assistance, translations, notarisation and tax-residency documentation can be coordinated where applicable.")}</p>
              <p className="mt-4 text-xs leading-5 text-[#161616]/52">{tx("Exact scope, third-party costs and eligibility are confirmed before engagement.")}</p>
            </div>
          </div>
        </section>

        <section id="property" className="scroll-mt-16 bg-[#0b0b0b] text-white">
          <div className="mx-auto max-w-[1480px] px-5 py-20 sm:px-10 lg:px-16 lg:py-28">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#E6C767]">{tx("09 — Find a qualifying property")}</p>
            <h2 className="mt-5 max-w-[15ch] text-[clamp(2.7rem,5vw,5.4rem)] font-medium leading-[0.94] tracking-[-0.05em]">{tx("Residency starts with the right property.")}</h2>
            <div className="mt-12 grid gap-4 lg:grid-cols-2">
              <article className="border border-white/16 p-7 sm:p-9">
                <strong className="text-4xl font-medium tracking-[-0.05em] text-[#E6C767]">$150K–$300K</strong>
                <h3 className="mt-4 text-lg font-medium uppercase tracking-[-0.02em]">{tx("Short-term residency range")}</h3>
                <p className="mt-4 text-base leading-7 text-white/62">{tx("Review AIXCO-selected property options positioned above the certified-value threshold for the short-term residence route.")}</p>
              </article>
              <article className="border border-[#E6C767]/45 bg-white/[0.03] p-7 sm:p-9">
                <strong className="text-4xl font-medium tracking-[-0.05em] text-[#E6C767]">$300K+</strong>
                <h3 className="mt-4 text-lg font-medium uppercase tracking-[-0.02em]">{tx("Investment residency range")}</h3>
                <p className="mt-4 text-base leading-7 text-white/62">{tx("Explore qualifying options for clients considering Georgia's investment residence pathway.")}</p>
              </article>
            </div>
            <Link href="/invest-in-batumi#contact" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 bg-[#E6C767] px-5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#161616] transition-colors hover:bg-white">
              {tx("Show me qualifying properties")} <ArrowUpRight size={15} />
            </Link>
            <p className="mt-6 max-w-[52rem] text-xs leading-5 text-white/48">{tx("Residency eligibility is based on the property's certified market value, not solely its advertised or purchase price.")}</p>
          </div>
        </section>

        <section id="why-aixco" className="scroll-mt-16 bg-[#F3EDE1] text-[#161616]">
          <div className="mx-auto max-w-[1480px] px-5 py-20 sm:px-10 lg:px-16 lg:py-28">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#7A6224]">{tx("10 — Why AIXCO")}</p>
            <h2 className="mt-5 max-w-[14ch] text-[clamp(2.7rem,5vw,5.4rem)] font-medium leading-[0.94] tracking-[-0.05em]">{tx("Property. Residency. One point of contact.")}</h2>
            <div className="mt-8 grid gap-6 text-base leading-7 text-[#161616]/67 lg:grid-cols-2">
              <p>{tx("Purchasing property and establishing a presence in another country often requires the coordination of multiple professionals, processes and administrative steps.")}</p>
              <p>{tx("AIXCO brings these elements together through a single point of contact—combining carefully selected real estate opportunities with coordinated local support to help international clients establish their presence in Georgia with confidence.")}</p>
            </div>
            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {aixcoMetrics.map((metric) => (
                <article key={metric.value} className="border border-[#161616]/15 bg-[#F8F3E9] p-6">
                  <strong className="text-3xl font-medium tracking-[-0.045em] text-[#9A7425]">{metric.value}</strong>
                  <p className="mt-4 text-sm leading-6 text-[#161616]/60">{tx(metric.body)}</p>
                </article>
              ))}
            </div>
            <div className="mt-12 grid gap-8 border-t border-[#161616]/15 pt-10 lg:grid-cols-[1fr_0.8fr]">
              <div>
                <h3 className="text-2xl font-medium tracking-[-0.035em]">{tx("The AIXCO difference")}</h3>
                <p className="mt-4 max-w-[50rem] text-base leading-7 text-[#161616]/66">{tx("Unlike a traditional real estate agency, AIXCO combines property selection with coordinated private client support, helping international buyers move from identifying a qualifying property to establishing their presence in Georgia.")}</p>
              </div>
              <ul className="grid grid-cols-1 gap-2 text-sm uppercase tracking-[0.08em] text-[#161616]/72 sm:grid-cols-2">
                {["Carefully selected property", "Residency coordination", "Banking introductions*", "Professional tax & legal network", "Documentation support", "Ongoing local assistance"].map((item) => <li key={item} className="border-b border-[#161616]/12 py-3">{tx(item)}</li>)}
              </ul>
            </div>
          </div>
        </section>

        <section id="contact" className="relative scroll-mt-16 overflow-hidden">
          <Image src={aixcoLiveImages.batumiMosaicEveningWaterfront} alt="" fill sizes="100vw" className="object-cover" />
          <div aria-hidden className="absolute inset-0 bg-[#0b0b0b]/78" />
          <div className="relative z-10 mx-auto grid max-w-[1480px] gap-12 px-5 py-20 sm:px-10 lg:grid-cols-[0.85fr_1.15fr] lg:px-16 lg:py-28">
            <div className="text-white">
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.26em] text-[#E6C767]">{tx("Book a private consultation")}</p>
              <h2 className="mt-5 max-w-[12ch] text-[clamp(2.8rem,5.2vw,5.4rem)] font-medium leading-[0.9] tracking-[-0.05em]">{tx("Start your journey with AIXCO.")}</h2>
              <p className="mt-6 max-w-[28rem] text-base leading-[1.55] text-white/68">
                {tx("Speak with our team to discover qualifying properties and understand the most appropriate pathway for establishing your presence in Georgia.")}
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <DownloadGateLink
                  href={residenceGuide.href}
                  fileName={residenceGuide.fileName}
                  lockedHref="#contact"
                  className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/70 px-4 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white hover:border-[#E6C767] hover:bg-[#E6C767] hover:text-[#161616]"
                >
                  <Download size={14} /> {tx("Residence permit guide")}
                </DownloadGateLink>
                <DownloadGateLink
                  href={taxGuide.href}
                  fileName={taxGuide.fileName}
                  lockedHref="#contact"
                  className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/70 px-4 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white hover:border-[#E6C767] hover:bg-[#E6C767] hover:text-[#161616]"
                >
                  <Download size={14} /> {tx("Tax residency guide")}
                </DownloadGateLink>
              </div>
              <p className="mt-6 max-w-[28rem] text-xs leading-5 text-white/70">
                {tx("Currencies in Georgia are generally USD and GEL; pricing in EUR can vary according to exchange rates.")}
              </p>
            </div>

            <div className="bg-[#F3EDE1] p-6 text-[#161616] sm:p-8">
              {submitted ? (
                <div className="flex min-h-[22rem] flex-col justify-center">
                  <div className="flex h-11 w-11 items-center justify-center bg-[#E6C767]"><Check size={20} /></div>
                  <h3 className="mt-6 text-3xl font-medium tracking-[-0.04em]">{tx("Thank you. We will contact you shortly.")}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#161616]/62">{tx("Your request is with the AIXCO team.")}</p>
                  {requestReference ? <p className="mt-3 text-sm font-semibold text-[#9A7425]">{tx("Request reference")}: <span className="font-mono">{requestReference}</span></p> : null}
                </div>
              ) : (
                <form aria-label={tx("Contact AIXCO form")} onSubmit={handleSubmit} className="grid gap-5">
                  <div aria-hidden="true" className="pointer-events-none absolute -left-[10000px] h-px w-px overflow-hidden">
                    <label>{tx("Website")}<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="grid gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#161616]/70">
                      {tx("Name & Surname")}
                      <input required minLength={2} maxLength={100} autoComplete="name" name="name" type="text" placeholder={tx("Full name")} className="residency-input" />
                    </label>
                    <label className="grid gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#161616]/70">
                      {tx("Email Address")}
                      <input required maxLength={255} autoComplete="email" name="email" type="email" placeholder="you@email.com" className="residency-input" />
                    </label>
                  </div>
                  <label className="grid gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#161616]/70">
                    {tx("WhatsApp / Phone")}
                    <input maxLength={40} autoComplete="tel" name="phone" type="tel" placeholder="+995 …" className="residency-input" />
                  </label>
                  <label className="grid gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#161616]/70">
                    {tx("I'm interested in")}
                    <select name="interest" defaultValue="Property-based residency" className="residency-input">
                      {interestOptions.map((option) => (
                        <option key={option} value={option}>{tx(option)}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#161616]/70">
                    {tx("Approximate budget")}
                    <select name="budget" defaultValue="" className="residency-input">
                      <option value="">{tx("Select budget")}</option>
                      {budgetOptions.map((option) => (
                        <option key={option} value={option}>{tx(option)}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#161616]/70">
                    {tx("Message")}
                    <textarea minLength={10} maxLength={1500} name="message" rows={4} placeholder={tx("Tell us the path, timing, and whether you already own or want to buy property.")} className="residency-input resize-none" />
                  </label>
                  {submitError ? <p role="alert" className="text-sm font-medium text-[#9A3030]">{submitError}</p> : null}
                  <div className="flex flex-col gap-4 border-t border-[#161616]/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-[16rem] text-xs leading-5 text-[#161616]/70">{tx("By sending this form, you agree that AIXCO may contact you about your request.")}</p>
                    <button type="submit" disabled={isSubmitting} className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#161616] px-5 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-white disabled:opacity-60">
                      {isSubmitting ? tx("Sending...") : tx("REQUEST MY RESIDENCY BRIEF")} <ArrowUpRight size={15} />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <div role="contentinfo" className="border-t border-white/10 bg-[#0b0b0b]">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-4 px-5 py-6 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-white/60 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16">
          <Image src={aixcoLiveLogos.aixcoHorizontalDark} alt="AIXCO.Global" width={1600} height={333} sizes="7rem" className="h-auto w-24 opacity-70" />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a href={`mailto:${company.email}`} className="hover:text-white">{company.email}</a>
            <span>{company.address}</span>
            <LandingSiblingLinks tone="dark" />
            <button type="button" onClick={openAnalyticsPreferences} className="hover:text-white">{tx("Cookie preferences")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
