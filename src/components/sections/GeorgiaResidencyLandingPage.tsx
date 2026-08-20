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
  { id: "paths", roman: "I", label: "Paths" },
  { id: "hnwi", roman: "II", label: "HNWI" },
  { id: "services", roman: "III", label: "Services" },
  { id: "contact", roman: "IV", label: "Request" },
] as const;

const permitPaths = [
  {
    id: "business",
    roman: "I",
    title: "Business registration",
    price: "€17,000",
    detail: "Open a business with a minimum annual turnover of approximately €17,000.",
    note: "This process can be completed within a short timeframe of about two to three days.",
    image: aixcoLiveImages.batumiMosaicBlueTower,
  },
  {
    id: "property",
    roman: "II",
    title: "Real estate ownership",
    price: "€138,000",
    detail: "Purchase property with a minimum value of €138,000. No work permit is required, saving at least 10 working days.",
    note: "When purchasing through AIXCO, no additional costs apply. Document preparation is completed within one working day.",
    image: aixcoLiveImages.currentProjectCleanFacade,
  },
  {
    id: "investment",
    roman: "III",
    title: "Investment / permanent residency",
    price: "€276,000",
    detail: "Make an investment of at least €276,000 in real estate. Granted for 5 years initially, with eligibility for permanent residency upon renewal.",
    note: "An official valuation report usually requires around three working days. When purchasing through AIXCO, no additional costs apply.",
    image: aixcoLiveImages.batumiMosaicDuskAerialCentral,
  },
] as const;

const hnwiSteps = [
  {
    roman: "01",
    title: "Proof of funds - €1.01 million",
    time: "Timeline depends on how quickly this can be arranged. Support is available through our online notary partner.",
  },
  {
    roman: "02",
    title: "Proof of funds - €460,000",
    time: "1 week from the date we open the account.",
  },
  {
    roman: "03",
    title: "Individual entrepreneur registration + bank account setup",
    time: "Completed within 5 days after receiving all required documents.",
  },
  {
    roman: "04",
    title: "Residence permit",
    time: "30 days from the date the small business status is active.",
  },
  {
    roman: "05",
    title: "Asset audit and document preparation",
    time: "Completed within 4 working days.",
  },
] as const;

const services = [
  "Register the business, tax registration and number",
  "Legal address for the business",
  "Physical address for the residence card",
  "Open all bank accounts (personal, business, crypto)",
  "Audit any crypto asset inside or outside Georgia",
  "Audit the €460,000 in a bank account",
  "Prepare and submit the required tax declarations during the process",
  "Translation/notarization needed for the process inside Georgia",
  "Issue the tax residency certificate, notarization, translation and apostille if needed",
] as const;

const relocationIncludes = [
  "Residence permit and residence card",
  "Registered and legal address",
  "Proof of address documentation",
  "Preparation and submission of initial tax declarations (first three months)",
] as const;

const interestOptions = [
  "Tax residency (HNWI)",
  "Residence by property",
  "Residence by investment",
  "Business registration",
  "Tax relocation package",
  "Project Reverance",
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
    const message = String(form.get("message") ?? "").trim();
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
        <div className="landing-header-bar mx-auto flex h-16 max-w-[1480px] items-center justify-between gap-3 px-5 sm:px-8">
          <Link href="/" aria-label={tx("AIXCO.Global home")} className="flex min-w-0 shrink-0 items-center">
            <Image
              src={aixcoLiveLogos.aixcoHorizontalDark}
              alt="AIXCO.Global"
              width={1600}
              height={333}
              sizes="10rem"
              className="h-auto w-[7.25rem] sm:w-36"
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
                className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/70 transition-colors hover:text-white"
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
              className="hidden min-h-10 items-center bg-[#E6C767] px-4 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#161616] sm:inline-flex"
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
                className="inline-flex min-h-10 items-center gap-1 px-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/80"
              >
                <Globe size={13} strokeWidth={1.6} aria-hidden />
                <span className="sm:hidden">{lang.toUpperCase()}</span>
                <span className="hidden sm:inline">{currentLangName}</span>
                <ChevronDown size={12} className={languageOpen ? "rotate-180" : undefined} aria-hidden />
              </button>
              {languageOpen ? (
                <div id="residency-language-list" className="absolute end-0 top-[calc(100%+0.4rem)] z-[80] w-52 border border-white/10 bg-[#161616] p-1.5">
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
              className="inline-flex min-h-10 min-w-10 items-center justify-center text-white lg:hidden"
              aria-label={menuOpen ? tx("Close navigation") : tx("Open navigation")}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {menuOpen ? (
          <nav aria-label={tx("Mobile navigation")} className="border-t border-white/10 bg-[#161616] px-5 py-4 lg:hidden">
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
            src={aixcoLiveImages.batumiMosaicNightSkyline}
            alt={tx("Batumi night skyline")}
            fill
            preload
            sizes="100vw"
            className="object-cover"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/25" />
          <div className="residency-frame hidden sm:block" />
          <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1480px] flex-col justify-end px-5 pb-10 pt-28 sm:px-10 sm:pb-14 lg:px-16">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-[#E6C767]">{tx("Residence permit in Georgia")}</p>
            <h1 className="mt-5 max-w-[14ch] text-[clamp(2.55rem,12vw,7.6rem)] font-medium leading-[0.86] tracking-[-0.055em] text-white">
              {tx("Stay. Own.")} <span className="text-[#E6C767]">{tx("Reside.")}</span>
            </h1>
            <p className="mt-6 max-w-[34rem] text-base leading-[1.6] text-white/72 sm:text-lg">
              {tx("There are several ways to obtain residency in Georgia. AIXCO works from its official residence and tax residency guides: business, property, or investment.")}
            </p>
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

        <section id="paths" className="scroll-mt-16">
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

        <section id="hnwi" className="scroll-mt-16 bg-[#F3EDE1] text-[#161616]">
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

        <section id="services" className="scroll-mt-16 bg-[#002147] text-white">
          <div className="mx-auto grid max-w-[1480px] gap-14 px-5 py-20 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-16 lg:py-28">
            <div>
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.26em] text-[#E6C767]">{tx("Our services")}</p>
              <h2 className="mt-5 max-w-[10ch] text-[clamp(2.7rem,5vw,5.2rem)] font-medium leading-[0.9] tracking-[-0.05em]">{tx("A relocation ledger.")}</h2>
              <p className="mt-6 max-w-[28rem] text-base leading-[1.55] text-white/62">
                {tx("For clients without an established tax residency, or who have exited their prior jurisdiction, AIXCO provides a Tax Relocation Package.")}
              </p>
              <p className="mt-10 text-5xl font-medium tracking-[-0.055em] text-[#E6C767]">2,500 EUR</p>
              <p className="mt-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/60">{tx("Tax relocation package")}</p>
              <ul className="mt-6 grid gap-2 text-sm leading-6 text-white/70">
                {relocationIncludes.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-[#E6C767]" />
                    {tx(item)}
                  </li>
                ))}
              </ul>
            </div>
            <ol className="border-t border-white/15">
              {services.map((service, index) => (
                <li key={service} className="grid grid-cols-[3rem_1fr] gap-4 border-b border-white/10 py-4 text-sm leading-6 text-white/78">
                  <span className="text-[#E6C767]">{String(index + 1).padStart(2, "0")}</span>
                  <span>{tx(service)}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="contact" className="relative scroll-mt-16 overflow-hidden">
          <Image src={aixcoLiveImages.batumiMosaicEveningWaterfront} alt="" fill sizes="100vw" className="object-cover" />
          <div aria-hidden className="absolute inset-0 bg-[#0b0b0b]/78" />
          <div className="relative z-10 mx-auto grid max-w-[1480px] gap-12 px-5 py-20 sm:px-10 lg:grid-cols-[0.85fr_1.15fr] lg:px-16 lg:py-28">
            <div className="text-white">
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.26em] text-[#E6C767]">{tx("Private request")}</p>
              <h2 className="mt-5 max-w-[10ch] text-[clamp(2.8rem,5.2vw,5.4rem)] font-medium leading-[0.9] tracking-[-0.05em]">{tx("Write to AIXCO.")}</h2>
              <p className="mt-6 max-w-[28rem] text-base leading-[1.55] text-white/68">
                {tx("Tell us which path you are considering. The AIXCO team will follow up with the matching residence or tax residency brief.")}
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
                    {tx("I’m interested in")}
                    <select name="interest" defaultValue="Tax residency (HNWI)" className="residency-input">
                      {interestOptions.map((option) => (
                        <option key={option} value={option}>{tx(option)}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#161616]/70">
                    {tx("Message")}
                    <textarea required minLength={10} maxLength={1500} name="message" rows={4} placeholder={tx("Tell us the path, timing, and whether you already own or want to buy property.")} className="residency-input resize-none" />
                  </label>
                  {submitError ? <p role="alert" className="text-sm font-medium text-[#9A3030]">{submitError}</p> : null}
                  <div className="flex flex-col gap-4 border-t border-[#161616]/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-[16rem] text-xs leading-5 text-[#161616]/70">{tx("By sending this form, you agree that AIXCO may contact you about your request.")}</p>
                    <button type="submit" disabled={isSubmitting} className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#161616] px-5 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-white disabled:opacity-60">
                      {isSubmitting ? tx("Sending...") : tx("Send request")} <ArrowUpRight size={15} />
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
