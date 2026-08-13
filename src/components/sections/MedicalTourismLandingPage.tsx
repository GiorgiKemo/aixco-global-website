"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Download,
  Globe,
  Maximize2,
  Menu,
  MoveRight,
  X,
} from "lucide-react";
import { LANGS, useI18n } from "@/i18n/I18nProvider";
import { useSiteContent } from "@/data/site-content-context";
import { DownloadGateLink } from "@/components/downloads/DownloadGateLink";
import { ExpandedProjectImageModal } from "@/components/sections/BrandbookLandingPage";
import { getContactSubmitErrorMessage } from "@/lib/contact-submit-error";
import { recordContactSubmission } from "@/lib/backend/lead-capture";
import { aixcoCurrentProjectGalleryImages, aixcoLiveImages, aixcoLiveLogos } from "@/lib/aixco-live-assets";
import { openAnalyticsPreferences } from "@/lib/analytics/client";
import { LandingSiblingLinks } from "@/components/landing/LandingSiblingLinks";
import { scrollToHash } from "@/lib/smooth-scroll";
import type { Lang } from "@/i18n/languages";

const navigation = [
  { label: "Advantage", href: "#advantage" },
  { label: "Treatments", href: "#treatments" },
  { label: "Clinics", href: "#clinics" },
  { label: "Batumi", href: "#batumi" },
];

const sceneImages = {
  hero: { src: aixcoLiveImages.batumiMosaicGoldenHourCoastline, width: 2400, height: 1600 },
  night: { src: aixcoLiveImages.batumiMosaicSunsetPanorama, width: 2400, height: 1600 },
  pool: { src: aixcoCurrentProjectGalleryImages[16].src, width: 3840, height: 2160 },
  sauna: { src: aixcoCurrentProjectGalleryImages[19].src, width: 3840, height: 2160 },
  garden: { src: aixcoCurrentProjectGalleryImages[18].src, width: 3840, height: 2160 },
} as const;

const medicalGuideDownloads: Record<Lang, { href: string; fileName: string }> = {
  en: {
    href: "/aixco-global-op2/documents/aixco-medical-tourism-guide-en.pdf",
    fileName: "AIXCO-Medical-Tourism-Guide.pdf",
  },
  de: {
    href: "/aixco-global-op2/documents/aixco-leitfaden-medizintourismus-de.pdf",
    fileName: "AIXCO-Leitfaden-fuer-Medizintourismus.pdf",
  },
  pl: {
    href: "/aixco-global-op2/documents/aixco-medical-tourism-guide-en.pdf",
    fileName: "AIXCO-Medical-Tourism-Guide.pdf",
  },
  sl: {
    href: "/aixco-global-op2/documents/aixco-medical-tourism-guide-en.pdf",
    fileName: "AIXCO-Medical-Tourism-Guide.pdf",
  },
  ru: {
    href: "/aixco-global-op2/documents/aixco-medical-tourism-guide-en.pdf",
    fileName: "AIXCO-Medical-Tourism-Guide.pdf",
  },
};

const dentalRows = [
  { treatment: "Implant (single)", georgia: "€500 – €1,500", germany: "€1,500 – €4,000+" },
  { treatment: "Full mouth implants", georgia: "€3,000 – €4,000", germany: "€15,000 – €25,000+" },
  { treatment: "Crown / veneer", georgia: "€150 – €300", germany: "€600 – €1,200" },
  { treatment: "Filling", georgia: "€25 – €70", germany: "€80 – €200" },
] as const;

const cosmeticRows = [
  { treatment: "Botox", georgia: "€50 – €150", germany: "€200 – €600+" },
  { treatment: "Rhinoplasty", georgia: "€2,000 – €4,500", germany: "€4,000 – €8,000" },
  { treatment: "Breast augmentation", georgia: "€3,000 – €5,500", germany: "€4,500 – €8,000" },
  { treatment: "Liposuction", georgia: "€2,000 – €4,000", germany: "€4,000 – €7,000" },
  { treatment: "Facelift", georgia: "€3,000 – €6,000", germany: "€6,000 – €15,000+" },
] as const;

const fertilityRows = [
  { treatment: "Georgia", georgia: "€40,000 – €70,000" },
  { treatment: "United States", georgia: "€130,000 – €180,000+" },
  { treatment: "Greece", georgia: "€75,000 – €100,000" },
  { treatment: "Canada", georgia: "€70,000 – €100,000" },
  { treatment: "Germany", georgia: "Not allowed" },
] as const;

const clinics = [
  { name: "American Hospital Tbilisi", focus: "Premium care", body: "Premium international-level care for complex treatments." },
  { name: "Evex Hospitals", focus: "Full-service care", body: "Largest network with nationwide coverage." },
  { name: "Aversi Clinic", focus: "Diagnostics", body: "Strong in diagnostics and specialist consultations." },
  { name: "Caucasus Medical Center", focus: "Complex treatments", body: "Best for serious and complex medical cases." },
  { name: "American Medical Centers", focus: "Expats and general care", body: "General and routine care for expatriates." },
  { name: "Todua Clinic", focus: "Diagnostics", body: "High-level diagnostics and imaging." },
  { name: "MediClub Georgia", focus: "Cosmetic and rehab", body: "Focus on cosmetic procedures and rehabilitation." },
] as const;

const interestOptions = [
  "Medical tourism consultation",
  "Dental care in Georgia",
  "Cosmetic surgery",
  "Fertility treatment",
  "Orthopedic surgery",
  "Treatment and property ownership",
  "Project Reverance",
] as const;

type SceneImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

function scrollToSection(href: string) {
  scrollToHash(href);
}

function MedicalTourismGuideLink({ className }: { className?: string }) {
  const { lang, tx } = useI18n();
  const guide = medicalGuideDownloads[lang] ?? medicalGuideDownloads.en;

  return (
    <DownloadGateLink
      href={guide.href}
      fileName={guide.fileName}
      lockedHref="#contact"
      className={className}
    >
      <Download size={15} strokeWidth={1.7} aria-hidden />
      {tx("Download the medical tourism guide")}
    </DownloadGateLink>
  );
}

function ExpandableScene({
  image,
  alt,
  className,
  objectPosition = "center",
  expandLabel,
}: {
  image: { src: string; width: number; height: number };
  alt: string;
  className?: string;
  objectPosition?: string;
  expandLabel: string;
}) {
  const { tx } = useI18n();
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div className={`overflow-hidden ${className ?? "relative h-full"}`}>
        {/* Native img: these files are already optimized WebPs/JPEGs; Next's optimizer
            can leave the fill frame empty on some local patterns. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.src}
          alt={alt}
          width={image.width}
          height={image.height}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
          style={{ objectPosition }}
        />
        <button
          type="button"
          aria-label={expandLabel}
          onClick={() => setExpanded(true)}
          className="absolute inset-0 z-10 cursor-zoom-in"
        >
          <span className="absolute right-4 top-4 inline-flex items-center gap-2 p-2 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-white [text-shadow:0_2px_8px_rgb(0_0_0/0.95)]">
            <Maximize2 size={13} strokeWidth={1.7} /> {tx("Expand")}
          </span>
        </button>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0b0b]/70 via-transparent to-[#0b0b0b]/10" />
      </div>
      {expanded ? (
        <ExpandedProjectImageModal
          image={{ ...image, alt }}
          dialogLabel={tx("Expanded project image")}
          closeLabel={tx("Close expanded image")}
          onClose={() => setExpanded(false)}
        />
      ) : null}
    </>
  );
}

export function MedicalTourismLandingPage() {
  const { lang, setLang, tx } = useI18n();
  const { company } = useSiteContent();
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [requestReference, setRequestReference] = useState<string | null>(null);
  const [expandedHero, setExpandedHero] = useState<SceneImage | null>(null);
  const [languageOpen, setLanguageOpen] = useState(false);
  const languageSwitcherRef = useRef<HTMLDivElement | null>(null);
  const formStartedAtRef = useRef(Date.now());
  const currentLangName = LANGS.find((option) => option.code === lang)?.native ?? lang.toUpperCase();

  useEffect(() => {
    if (!expandedHero) return;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpandedHero(null);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [expandedHero]);

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
      {
        name,
        email,
        interest,
        message,
        requestType: "message",
      },
      {
        antiAbuse: { website, startedAt: formStartedAtRef.current },
        locale: lang,
      },
    );

    setIsSubmitting(false);

    if (result.ok) {
      setRequestReference(result.reference ?? null);
      setSubmitted(true);
      return;
    }

    setSubmitError(tx(getContactSubmitErrorMessage(result.reason)));
  };

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    window.setTimeout(() => scrollToSection(href), 0);
  };

  return (
    <div id="main-content" className="brandbook-landing bg-[#F3EDE1] text-[#161616]">
      <header className="brandbook-header sticky top-0 z-50 border-b border-[#161616]/10 bg-[#F3EDE1]/95 backdrop-blur-md">
        <div className="landing-header-bar mx-auto flex h-[4.6rem] w-full max-w-[1600px] items-center justify-between gap-3 px-5 sm:px-8 lg:px-12">
          <Link href="/" aria-label={tx("AIXCO.Global home")} className="flex min-w-0 shrink-0 items-center">
            <Image
              src={aixcoLiveLogos.aixcoHorizontalDark}
              alt="AIXCO.Global"
              width={1600}
              height={333}
              priority
              sizes="(min-width: 1024px) 12rem, 10rem"
              className="h-auto w-[7.25rem] sm:w-36 lg:w-40"
            />
          </Link>

          <nav aria-label={tx("Primary navigation")} className="hidden items-center gap-9 lg:ms-auto lg:flex">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(event) => {
                  event.preventDefault();
                  handleNavClick(item.href);
                }}
                className="brandbook-nav-link text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#161616]/68"
              >
                {tx(item.label)}
              </a>
            ))}
            <a
              href="#contact"
              onClick={(event) => {
                event.preventDefault();
                handleNavClick("#contact");
              }}
              className="brandbook-header-cta inline-flex min-h-10 items-center gap-2 bg-[#161616] px-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#002147]"
            >
              {tx("Request a brief")} <ArrowUpRight size={14} strokeWidth={1.8} />
            </a>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label={menuOpen ? tx("Close navigation") : tx("Open navigation")}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center border border-[#161616]/20 lg:hidden"
          >
            {menuOpen ? <X size={21} strokeWidth={1.6} /> : <Menu size={21} strokeWidth={1.6} />}
          </button>

          <div ref={languageSwitcherRef} className="relative shrink-0">
            <button
              data-language-trigger="true"
              type="button"
              aria-expanded={languageOpen}
              aria-controls="medical-tourism-language-list"
              aria-label={`${currentLangName} ${tx("Change language")}`}
              onClick={() => setLanguageOpen((current) => !current)}
              className="inline-flex min-h-11 items-center gap-1.5 border border-[#161616]/15 bg-transparent px-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#161616] transition-colors hover:border-[#E6C767] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E6C767]/70 sm:px-3"
            >
              <Globe size={14} strokeWidth={1.6} aria-hidden />
              <span className="sm:hidden">{lang.toUpperCase()}</span>
              <span className="hidden sm:inline">{currentLangName}</span>
              <ChevronDown size={13} strokeWidth={1.6} className={languageOpen ? "rotate-180" : undefined} aria-hidden />
            </button>
            {languageOpen ? (
              <div id="medical-tourism-language-list" className="absolute end-0 top-[calc(100%+0.5rem)] z-[80] w-56 border border-[#161616]/10 bg-[#F3EDE1] p-1.5 text-[#161616] shadow-xl">
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
                        className={`flex min-h-10 w-full items-center justify-between px-3 py-2 text-start text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E6C767]/70 ${option.code === lang ? "bg-[#E6C767]/25" : "hover:bg-[#161616]/[0.06]"}`}
                      >
                        <span lang={option.code} translate="no" className="language-option-label notranslate">{option.label}</span>
                        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] opacity-60">{option.native}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          </div>
        </div>

        {menuOpen ? (
          <nav aria-label={tx("Mobile navigation")} className="border-t border-[#161616]/10 bg-[#F3EDE1] px-5 py-5 lg:hidden">
            <div className="mx-auto flex max-w-[1600px] flex-col gap-1">
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(event) => {
                    event.preventDefault();
                    handleNavClick(item.href);
                  }}
                  className="flex items-center justify-between border-b border-[#161616]/10 py-4 text-sm font-semibold uppercase tracking-[0.16em]"
                >
                  {tx(item.label)}
                  <ArrowUpRight size={16} strokeWidth={1.6} />
                </a>
              ))}
              <a
                href="#contact"
                onClick={(event) => {
                  event.preventDefault();
                  handleNavClick("#contact");
                }}
                className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 bg-[#161616] text-xs font-semibold uppercase tracking-[0.17em] text-white"
              >
                {tx("Request a private brief")} <ArrowUpRight size={15} strokeWidth={1.8} />
              </a>
            </div>
          </nav>
        ) : null}
      </header>

      <main>
        <section id="top" className="scroll-mt-20">
          <div className="mx-auto grid min-h-[calc(100svh-4.6rem)] w-full max-w-[1600px] lg:grid-cols-[0.86fr_1.14fr]">
            <div className="relative flex min-h-[min(28rem,calc(100svh-4.6rem))] flex-col overflow-hidden bg-[#161616] px-5 pb-8 pt-8 text-white sm:min-h-[34rem] sm:px-10 sm:pb-10 lg:min-h-[calc(100svh-4.6rem)] lg:px-14 lg:pt-12">
              <div className="relative z-10 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                <p className="flex min-w-0 items-center gap-3 pt-1 text-[0.64rem] font-semibold uppercase tracking-[0.23em] text-[#E6C767]">
                  <span className="h-px w-8 bg-[#E6C767]" /> {tx("Georgia healthcare")}
                </p>
                <span className="pt-1 text-right text-[0.58rem] font-medium uppercase tracking-[0.2em] text-white/45">03 / 03<br />AIXCO GLOBAL</span>
              </div>

              <div className="relative z-10 mt-7 max-w-[36rem]">
                <h1 className="max-w-[11ch] text-[clamp(2.45rem,11vw,6.6rem)] font-medium leading-[0.86] tracking-[-0.065em]">
                  {tx("Medical care")} <span className="text-[#E6C767]">{tx("at European quality.")}</span>
                </h1>
                <p className="mt-8 max-w-[30rem] text-[1.05rem] leading-[1.55] text-white/68 sm:text-[1.12rem]">
                  {tx("Georgia offers high-value private treatment at significantly lower cost, especially for dental care, cosmetic procedures, fertility, and planned surgery.")}
                </p>
                <div className="mt-9 flex w-full max-w-[34rem] flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <a
                    href="#contact"
                    onClick={(event) => {
                      event.preventDefault();
                      handleNavClick("#contact");
                    }}
                    className="brandbook-button-gold inline-flex min-h-12 items-center justify-center gap-3 bg-[#E6C767] px-5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#161616]"
                  >
                    {tx("Request a medical brief")} <ArrowUpRight size={16} strokeWidth={1.8} />
                  </a>
                  <MedicalTourismGuideLink className="inline-flex min-h-12 items-center justify-center gap-3 border border-white/70 bg-white/[0.06] px-5 text-center text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:border-[#E6C767] hover:bg-[#E6C767] hover:text-[#161616]" />
                </div>
              </div>

              <div className="relative z-10 mt-auto grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t border-white/25 pt-4 text-[0.58rem] font-medium uppercase tracking-[0.15em] text-white/60 sm:text-[0.62rem] sm:tracking-[0.17em]">
                <span>{tx("Batumi")} · {tx("Black Sea coast")}</span>
                <span className="hidden items-center justify-self-end gap-2 text-right sm:flex">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#E6C767]" /> {tx("Private clinics across Georgia")}
                </span>
              </div>
            </div>

            <div className="relative min-h-[17.5rem] overflow-hidden bg-[#002147] sm:min-h-[26rem] lg:min-h-full">
              <Image
                src={sceneImages.hero.src}
                alt={tx("Batumi coastline at golden hour")}
                fill
                priority
                quality={90}
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover object-[58%_center] transition-transform duration-[1400ms] ease-out hover:scale-[1.03]"
              />
              <button
                type="button"
                aria-label={tx("Expand the Batumi coastline image")}
                onClick={() => setExpandedHero({ ...sceneImages.hero, alt: tx("Batumi coastline at golden hour") })}
                className="absolute inset-0 z-10 cursor-zoom-in"
              >
                <span className="absolute right-5 top-5 inline-flex items-center gap-2 p-2 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-white [text-shadow:0_2px_8px_rgb(0_0_0/0.95)] sm:right-8 sm:top-8">
                  <Maximize2 size={13} strokeWidth={1.7} /> {tx("Expand image")}
                </span>
              </button>
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#161616]/60 via-[#161616]/10 to-transparent" />
              <div className="pointer-events-none absolute inset-x-5 bottom-5 z-20 max-w-[28rem] text-white [text-shadow:0_2px_10px_rgb(0_0_0/0.95)] sm:inset-x-8 sm:bottom-8">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#E6C767]">{tx("50-80% below Western prices")}</p>
                <p className="mt-2 text-xl font-medium leading-[1.15] tracking-[-0.03em] sm:text-2xl">{tx("A calm Black Sea city for treatment and recovery.")}</p>
              </div>
            </div>
          </div>

          <div className="mx-auto grid w-full max-w-[1600px] grid-cols-2 border-x border-b border-[#161616]/10 sm:grid-cols-4">
            {[
              { value: "50-80%", label: "Typical cost saving" },
              { value: tx("Days"), label: "Specialist access" },
              { value: "7", label: "Named private clinics" },
              { value: "2026", label: "Insurance required for entry" },
            ].map((metric) => (
              <div key={metric.label} className="border-r border-[#161616]/10 px-4 py-5 last:border-r-0 sm:px-8 sm:py-6">
                <strong className="block text-xl font-medium tracking-[-0.04em] sm:text-3xl">{metric.value}</strong>
                <span className="mt-2 block text-[0.56rem] font-semibold uppercase tracking-[0.12em] text-[#161616]/48 [overflow-wrap:anywhere] sm:text-[0.6rem] sm:tracking-[0.15em]">{tx(metric.label)}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="advantage" className="scroll-mt-20 border-b border-[#161616]/10 bg-[#F3EDE1]">
          <div className="mx-auto grid w-full max-w-[1600px] lg:grid-cols-[0.9fr_1.1fr]">
            <div className="px-5 py-20 sm:px-8 sm:py-28 lg:px-14 lg:py-36">
              <p className="brandbook-eyebrow">01 — {tx("Why Georgia")}</p>
              <h2 className="mt-8 max-w-[9ch] text-[clamp(3rem,5.5vw,6.4rem)] font-medium leading-[0.9] tracking-[-0.065em]">
                {tx("Care without the wait.")}
              </h2>
              <p className="mt-9 max-w-[32rem] text-lg leading-[1.55] text-[#161616]/65">
                {tx("Georgia's largely privatized healthcare system has produced modern clinics, patient-focused service, and fast access to specialists with minimal bureaucracy.")}
              </p>
              <div className="mt-12 grid max-w-[38rem] gap-px bg-[#161616]/15">
                {[
                  { title: "Modern equipment", body: "Private clinics use contemporary medical equipment and well-maintained facilities." },
                  { title: "Fast access", body: "Specialists are often available within days, not months." },
                  { title: "Transparent packages", body: "Consultations, diagnostics, and treatment are frequently offered as clear package deals." },
                ].map((item) => (
                  <article key={item.title} className="bg-[#F3EDE1] px-0 py-5">
                    <h3 className="text-xl font-medium tracking-[-0.035em]">{tx(item.title)}</h3>
                    <p className="mt-2 max-w-[30rem] text-sm leading-6 text-[#161616]/62">{tx(item.body)}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="relative min-h-[28rem] overflow-hidden bg-[#D9D0C0] lg:min-h-[44rem]">
              <ExpandableScene
                image={sceneImages.night}
                alt={tx("Sunset over the Batumi skyline")}
                expandLabel={tx("Expand the Batumi skyline image")}
                objectPosition="center"
                className="absolute inset-0"
              />
              <div className="pointer-events-none absolute bottom-5 left-5 z-20 max-w-[20rem] text-white [text-shadow:0_2px_10px_rgb(0_0_0/0.95)] sm:bottom-8 sm:left-8">
                <span className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/80">{tx("Batumi")}</span>
                <p className="mt-2 text-xl font-medium leading-[1.05] tracking-[-0.035em]">{tx("Visa-free entry for many nationalities.")}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="treatments" className="scroll-mt-20 bg-[#002147] text-white">
          <div className="mx-auto w-full max-w-[1600px] px-5 py-20 sm:px-8 sm:py-28 lg:px-14 lg:py-32">
            <div className="flex flex-col justify-between gap-8 border-b border-white/20 pb-10 lg:flex-row lg:items-end">
              <div>
                <p className="brandbook-eyebrow brandbook-eyebrow-light">02 — {tx("Selected treatments")}</p>
                <h2 className="mt-8 max-w-[10ch] text-[clamp(3.2rem,5.6vw,6.5rem)] font-medium leading-[0.88] tracking-[-0.065em]">{tx("Where Georgia is strongest.")}</h2>
              </div>
              <p className="max-w-[24rem] text-base leading-[1.55] text-white/60 lg:pb-2">{tx("Approximate prices from the official AIXCO medical tourism guide. Currencies in Georgia are generally USD and GEL; euro figures can vary with exchange rates.")}</p>
            </div>

            <div className="mt-12 grid gap-10 lg:grid-cols-2">
              <article className="border-t border-white/20 pt-8">
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#E6C767]">01</p>
                <h3 className="mt-4 text-3xl font-medium tracking-[-0.045em]">{tx("Dental care")}</h3>
                <p className="mt-4 max-w-[28rem] text-[0.98rem] leading-[1.55] text-white/58">{tx("Dental implants, veneers, crowns, and full-mouth reconstruction with European materials.")}</p>
                <div className="mt-8 overflow-x-auto">
                <table className="w-full min-w-[28rem] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/20 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-white/45">
                      <th className="pb-3 font-semibold">{tx("Treatment")}</th>
                      <th className="pb-3 font-semibold">{tx("Georgia")}</th>
                      <th className="pb-3 font-semibold">{tx("Germany")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dentalRows.map((row) => (
                      <tr key={row.treatment} className="border-b border-white/10">
                        <td className="py-3 pr-3">{tx(row.treatment)}</td>
                        <td className="py-3 pr-3 whitespace-nowrap text-[#E6C767]">{row.georgia}</td>
                        <td className="py-3 whitespace-nowrap text-white/55">{row.germany}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </article>

              <article className="border-t border-white/20 pt-8">
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#E6C767]">02</p>
                <h3 className="mt-4 text-3xl font-medium tracking-[-0.045em]">{tx("Cosmetic surgery")}</h3>
                <p className="mt-4 max-w-[28rem] text-[0.98rem] leading-[1.55] text-white/58">{tx("Rhinoplasty, facelifts, liposuction, and non-surgical treatments in modern private clinics.")}</p>
                <div className="mt-8 overflow-x-auto">
                <table className="w-full min-w-[28rem] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/20 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-white/45">
                      <th className="pb-3 font-semibold">{tx("Treatment")}</th>
                      <th className="pb-3 font-semibold">{tx("Georgia")}</th>
                      <th className="pb-3 font-semibold">{tx("Germany")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cosmeticRows.map((row) => (
                      <tr key={row.treatment} className="border-b border-white/10">
                        <td className="py-3 pr-3">{tx(row.treatment)}</td>
                        <td className="py-3 pr-3 whitespace-nowrap text-[#E6C767]">{row.georgia}</td>
                        <td className="py-3 whitespace-nowrap text-white/55">{row.germany}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </article>

              <article className="border-t border-white/20 pt-8">
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#E6C767]">03</p>
                <h3 className="mt-4 text-3xl font-medium tracking-[-0.045em]">{tx("Fertility")}</h3>
                <p className="mt-4 max-w-[28rem] text-[0.98rem] leading-[1.55] text-white/58">{tx("IVF, egg donation, and legally regulated surrogacy with intended parents legally recognized.")}</p>
                <div className="mt-8 overflow-x-auto">
                <table className="w-full min-w-[22rem] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/20 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-white/45">
                      <th className="pb-3 font-semibold">{tx("Country")}</th>
                      <th className="pb-3 font-semibold">{tx("Typical cost")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fertilityRows.map((row) => (
                      <tr key={row.treatment} className="border-b border-white/10">
                        <td className="py-3 pr-3">{tx(row.treatment)}</td>
                        <td className={`py-3 whitespace-nowrap ${row.treatment === "Georgia" ? "text-[#E6C767]" : "text-white/70"}`}>
                          {row.georgia === "Not allowed" ? tx("Not allowed") : row.georgia}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </article>

              <article className="border-t border-white/20 pt-8">
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#E6C767]">04</p>
                <h3 className="mt-4 text-3xl font-medium tracking-[-0.045em]">{tx("Orthopedics")}</h3>
                <p className="mt-4 max-w-[28rem] text-[0.98rem] leading-[1.55] text-white/58">{tx("Knee and hip replacements, arthroscopy, and spine-related procedures with rehabilitation packages.")}</p>
                <div className="mt-8 grid gap-4 border-t border-white/15 pt-6 text-sm leading-6 text-white/70">
                  <p>{tx("A basic checkup typically starts around €130. Hospital treatment can reach approximately €340, depending on the clinic and city.")}</p>
                  <p>{tx("From 2026, proof of health insurance is mandatory for entry into Georgia.")}</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="clinics" className="scroll-mt-20 border-b border-[#161616]/10 bg-[#F3EDE1]">
          <div className="mx-auto w-full max-w-[1600px] px-5 py-20 sm:px-8 sm:py-28 lg:px-14 lg:py-36">
            <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
              <div>
                <p className="brandbook-eyebrow">03 — {tx("Leading clinics")}</p>
                <h2 className="mt-8 max-w-[10ch] text-[clamp(3rem,5.4vw,6.2rem)] font-medium leading-[0.9] tracking-[-0.065em]">{tx("Named institutions, not anonymous networks.")}</h2>
                <p className="mt-9 max-w-[26rem] text-lg leading-[1.55] text-[#161616]/62">{tx("AIXCO works from official clinic names published in its medical tourism guide, so patients can compare real institutions.")}</p>
              </div>
              <div className="grid gap-0 border-t border-[#161616]/20">
                {clinics.map((clinic, index) => (
                  <article key={clinic.name} className="grid gap-3 border-b border-[#161616]/15 py-6 sm:grid-cols-[4rem_minmax(0,1fr)_11rem] sm:items-start">
                    <span className="text-3xl font-medium text-[#9C7F3C]">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="text-xl font-medium tracking-[-0.03em]">{clinic.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#161616]/62">{tx(clinic.body)}</p>
                    </div>
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#161616]/45 sm:pt-2 sm:text-right">{tx(clinic.focus)}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="scroll-mt-20 bg-[#161616] text-white">
          <div className="mx-auto w-full max-w-[1600px] px-5 py-20 sm:px-8 sm:py-28 lg:px-14 lg:py-32">
            <p className="brandbook-eyebrow brandbook-eyebrow-light">04 — {tx("Patient path")}</p>
            <h2 className="mt-8 max-w-[11ch] text-[clamp(3.1rem,5.4vw,6.2rem)] font-medium leading-[0.9] tracking-[-0.065em]">{tx("Arrive prepared. Recover well.")}</h2>
            <div className="mt-14 grid divide-y divide-white/20 md:grid-cols-3 md:divide-x md:divide-y-0">
              {[
                { title: "Before arrival", body: "Buy travel or international insurance. Required from 2026." },
                { title: "After arrival", body: "Choose a private clinic or a local insurance plan for a longer stay." },
                { title: "For a longer stay", body: "Residency can open limited state coverage. Private insurance is still recommended." },
              ].map((step, index) => (
                <article key={step.title} className="flex min-h-[16rem] flex-col justify-between py-8 md:px-8 md:first:pl-0 md:last:pr-0">
                  <span className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#E6C767]">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-3xl font-medium tracking-[-0.045em]">{tx(step.title)}</h3>
                    <p className="mt-4 max-w-[20rem] text-[0.98rem] leading-[1.55] text-white/58">{tx(step.body)}</p>
                  </div>
                </article>
              ))}
            </div>
            <p className="mt-10 max-w-[40rem] border-t border-white/15 pt-6 text-sm leading-6 text-white/50">{tx("112 is the national number for ambulance, police, and fire services.")}</p>
          </div>
        </section>

        <section id="batumi" className="scroll-mt-20 border-b border-[#161616]/10 bg-[#F3EDE1]">
          <div className="mx-auto w-full max-w-[1600px] px-5 py-20 sm:px-8 sm:py-28 lg:px-14 lg:py-36">
            <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
              <div>
                <p className="brandbook-eyebrow">05 — {tx("Recover in Batumi")}</p>
                <h2 className="mt-8 max-w-[9ch] text-[clamp(3.2rem,5.7vw,6.6rem)] font-medium leading-[0.88] tracking-[-0.065em]">{tx("A calm coast after treatment.")}</h2>
                <p className="mt-9 max-w-[26rem] text-lg leading-[1.55] text-[#161616]/62">{tx("Patients benefit from affordable accommodation, visa-free entry for many nationalities, and a comfortable Black Sea setting for recovery.")}</p>
                <p className="mt-6 max-w-[26rem] text-lg leading-[1.55] text-[#161616]/62">{tx("Combine treatment with property ownership in Batumi. AIXCO currently offers 28 selected apartments at Project Reverance, 8 minutes from Batumi Medical Center.")}</p>
                <Link href="/reverance-batumi" className="brandbook-text-link mt-10 inline-flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em]">
                  {tx("View Project Reverance")} <MoveRight size={17} strokeWidth={1.6} />
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <figure className="group relative aspect-[0.92] overflow-hidden bg-[#D9D0C0] sm:row-span-2 sm:aspect-auto sm:min-h-[39rem]">
                  <ExpandableScene
                    image={sceneImages.pool}
                    alt={tx("Reverance indoor pool")}
                    expandLabel={tx("Expand the Reverance indoor pool image")}
                    className="absolute inset-0"
                  />
                  <figcaption className="pointer-events-none absolute bottom-4 left-4 z-20 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white [text-shadow:0_2px_8px_rgb(0_0_0/0.95)]">{tx("Indoor pool")}</figcaption>
                </figure>
                <figure className="group relative aspect-[1.25] overflow-hidden bg-[#D9D0C0]">
                  <ExpandableScene
                    image={sceneImages.garden}
                    alt={tx("Reverance garden pool")}
                    expandLabel={tx("Expand the Reverance garden pool image")}
                    className="absolute inset-0"
                  />
                  <figcaption className="pointer-events-none absolute bottom-4 left-4 z-20 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white [text-shadow:0_2px_8px_rgb(0_0_0/0.95)]">{tx("Garden pool")}</figcaption>
                </figure>
                <figure className="group relative aspect-[1.25] overflow-hidden bg-[#D9D0C0]">
                  <ExpandableScene
                    image={sceneImages.sauna}
                    alt={tx("Reverance sauna")}
                    expandLabel={tx("Expand the Reverance sauna image")}
                    className="absolute inset-0"
                  />
                  <figcaption className="pointer-events-none absolute bottom-4 left-4 z-20 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white [text-shadow:0_2px_8px_rgb(0_0_0/0.95)]">{tx("Sauna")}</figcaption>
                </figure>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="scroll-mt-20 bg-[#161616] text-white">
          <div className="mx-auto grid w-full max-w-[1600px] gap-16 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24 lg:px-14 lg:py-32">
            <div>
              <p className="brandbook-eyebrow brandbook-eyebrow-light">06 — {tx("Start with AIXCO")}</p>
              <h2 className="mt-8 max-w-[8ch] text-[clamp(3.2rem,5.7vw,6.7rem)] font-medium leading-[0.88] tracking-[-0.065em]">{tx("Contact AIXCO")}</h2>
              <p className="mt-9 max-w-[25rem] text-lg leading-[1.55] text-white/60">{tx("Tell us the treatment you are considering. The AIXCO team will follow up with a private brief.")}</p>
              <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 pt-5 text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-white/45">
                <span>{tx("Treatment planning")}</span>
                <span>{tx("Clinic introductions")}</span>
                <span>{tx("Recovery stays")}</span>
              </div>
            </div>

            <div className="border-t border-white/20 pt-6 lg:pt-0">
              {submitted ? (
                <div className="flex min-h-[24rem] flex-col justify-center border border-[#E6C767]/45 bg-[#E6C767]/[0.06] p-8 sm:p-12">
                  <div className="flex h-12 w-12 items-center justify-center bg-[#E6C767] text-[#161616]"><Check size={23} strokeWidth={2} /></div>
                  <h3 className="mt-8 text-3xl font-medium tracking-[-0.045em]">{tx("Thank you. We will contact you shortly.")}</h3>
                  <p className="mt-4 max-w-[25rem] text-base leading-[1.55] text-white/60">{tx("Your request is with the AIXCO team.")}</p>
                  {requestReference ? <p className="mt-4 text-sm font-semibold text-[#E6C767]">{tx("Request reference")}: <span className="font-mono">{requestReference}</span></p> : null}
                  <button type="button" onClick={() => { setSubmitted(false); setRequestReference(null); }} className="mt-8 inline-flex w-fit items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.17em] text-[#E6C767]">{tx("Send another request")} <ArrowRight size={16} strokeWidth={1.6} /></button>
                </div>
              ) : (
                <form aria-label={tx("Contact AIXCO form")} onSubmit={handleSubmit} className="grid gap-7">
                  <div aria-hidden="true" className="pointer-events-none absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
                    <label>{tx("Website")}<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
                  </div>
                  <div className="grid gap-7 sm:grid-cols-2">
                    <label className="grid gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/55">
                      {tx("Name & Surname")}
                      <input required minLength={2} maxLength={100} autoComplete="name" name="name" type="text" placeholder={tx("Full name")} className="brandbook-input" />
                    </label>
                    <label className="grid gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/55">
                      {tx("Email Address")}
                      <input required maxLength={255} autoComplete="email" name="email" type="email" placeholder="you@email.com" className="brandbook-input" />
                    </label>
                  </div>
                  <label className="grid gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/55">
                    {tx("I’m interested in")}
                    <select name="interest" defaultValue="Medical tourism consultation" className="brandbook-input">
                      {interestOptions.map((option) => (
                        <option key={option} value={option}>{tx(option)}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/55">
                    {tx("Message")}
                    <textarea required minLength={10} maxLength={1500} name="message" rows={4} placeholder={tx("Tell us the treatment, timing, and whether you also want a Batumi residence.")} className="brandbook-input resize-none" />
                  </label>
                  {submitError ? <p role="alert" className="text-sm font-medium text-[#F0A9A9]">{submitError}</p> : null}
                  <div className="flex flex-col gap-5 border-t border-white/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-[17rem] text-xs leading-[1.5] text-white/38">{tx("By sending this form, you agree that AIXCO may contact you about your request.")}</p>
                    <button type="submit" disabled={isSubmitting} className="brandbook-button-gold inline-flex min-h-12 items-center justify-center gap-3 bg-[#E6C767] px-6 text-[0.68rem] font-semibold uppercase tracking-[0.17em] text-[#161616] disabled:cursor-wait disabled:opacity-60">
                      {isSubmitting ? tx("Sending...") : tx("Send request")} <ArrowUpRight size={16} strokeWidth={1.8} />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <div role="contentinfo" className="border-t border-[#161616]/10 bg-[#F3EDE1]">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-5 py-7 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#161616]/45 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-14">
          <Image src={aixcoLiveLogos.aixcoHorizontalDark} alt="AIXCO.Global" width={1600} height={333} sizes="8rem" className="h-auto w-28 opacity-70" />
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a href={`mailto:${company.email}`} className="transition-colors hover:text-[#161616]">{company.email}</a>
            <span>{company.address}</span>
            <span>{company.offices.join(" · ")}</span>
            <span>{tx("Since")} {company.founded}</span>
            <LandingSiblingLinks tone="ivory" />
            <button type="button" onClick={openAnalyticsPreferences} className="transition-colors hover:text-[#161616] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#161616]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F3EDE1]">
              {tx("Cookie preferences")}
            </button>
          </div>
        </div>
      </div>

      {expandedHero ? (
        <ExpandedProjectImageModal
          image={expandedHero}
          dialogLabel={tx("Expanded project image")}
          closeLabel={tx("Close expanded image")}
          onClose={() => setExpandedHero(null)}
        />
      ) : null}
    </div>
  );
}
