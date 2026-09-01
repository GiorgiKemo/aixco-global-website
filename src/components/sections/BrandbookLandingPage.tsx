"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Globe,
  Maximize2,
  Menu,
  MoveRight,
  X,
} from "lucide-react";
import { LANGS, useI18n } from "@/i18n/I18nProvider";
import { useSiteContent } from "@/data/site-content-context";
import { CurrentProjectBrochureLink } from "@/components/property/PropertyChrome";
import { getContactSubmitErrorMessage } from "@/lib/contact-submit-error";
import { recordContactSubmission } from "@/lib/backend/lead-capture";
import { aixcoCurrentProjectGalleryImages, aixcoLiveImages, aixcoLiveLogos } from "@/lib/aixco-live-assets";
import { openAnalyticsPreferences } from "@/lib/analytics/client";
import { LandingSiblingLinks } from "@/components/landing/LandingSiblingLinks";
import { scrollToHash } from "@/lib/smooth-scroll";

const navigation = [
  { label: "Opportunity", href: "#opportunity" },
  { label: "The AIXCO way", href: "#approach" },
  { label: "Residence", href: "#residence" },
];

const projectImages = {
  hero: { src: aixcoCurrentProjectGalleryImages[0].src, width: 3882, height: 3871 },
  sunset: { src: aixcoCurrentProjectGalleryImages[1].src, width: 3974, height: 3913 },
  night: { src: aixcoCurrentProjectGalleryImages[2].src, width: 4096, height: 4096 },
  aerial: { src: aixcoCurrentProjectGalleryImages[3].src, width: 4000, height: 4000 },
  arrival: { src: aixcoCurrentProjectGalleryImages[5].src, width: 4000, height: 4000 },
  lounge: { src: aixcoCurrentProjectGalleryImages[12].src, width: 3935, height: 2733 },
  gym: { src: aixcoCurrentProjectGalleryImages[15].src, width: 3840, height: 2160 },
} as const;

type ExpandedImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

type ExpandedProjectImageModalProps = {
  image: ExpandedImage;
  dialogLabel: string;
  closeLabel: string;
  onClose: () => void;
};

export function ExpandedProjectImageModal({ image, dialogLabel, closeLabel, onClose }: ExpandedProjectImageModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={dialogLabel}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-8"
      onClick={(event) => {
        const mediaBounds = event.currentTarget.querySelector("[data-expanded-project-media]")?.getBoundingClientRect();
        if (
          mediaBounds &&
          event.clientX >= mediaBounds.left &&
          event.clientX <= mediaBounds.right &&
          event.clientY >= mediaBounds.top &&
          event.clientY <= mediaBounds.bottom
        ) {
          return;
        }
        onClose();
      }}
    >
      <button
        type="button"
        aria-label={closeLabel}
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        className="absolute right-4 top-4 z-10 inline-flex h-12 w-12 items-center justify-center border border-white/70 bg-transparent text-white [filter:drop-shadow(0_2px_6px_rgb(0_0_0/0.95))] transition-colors hover:border-[#E6C767] hover:bg-[#E6C767] hover:text-[#161616] sm:right-8 sm:top-8"
      >
        <X size={22} strokeWidth={1.6} />
      </button>
      <div data-expanded-project-media className="relative inline-flex max-h-[82dvh] max-w-[92vw]">
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="92vw"
          className="h-auto max-h-[82dvh] w-auto max-w-[92vw] object-contain"
        />
      </div>
    </div>
  );
}

const projectBenefits = [
  { title: "NEW BOULEVARD", body: "Located at 59 Adlia Street, within Batumi's expanding New Boulevard district." },
  { title: "SELECTED HIGHER FLOORS", body: "AIXCO's current inventory is concentrated on the 13th and 14th floors." },
  { title: "PREMIUM RESIDENTIAL CONCEPT", body: "Contemporary architecture combined with residential and community infrastructure." },
  { title: "JULY 2028", body: "Targeted project completion." },
  { title: "RESIDENT AMENITIES", body: "POOL · WELLNESS · LANDSCAPED AREAS · RESIDENT FACILITIES" },
] as const;

const ownershipBenefits = [
  { title: "NO RESIDENCY REQUIREMENT", body: "Property ownership does not generally require the buyer to relocate to Georgia." },
  { title: "1% RENTAL INCOME TAX", body: "Potentially available under the applicable Georgian tax regime, subject to eligibility and individual circumstances." },
  { title: "0% CAPITAL GAINS TAX AFTER 2 YEARS", body: "Subject to applicable Georgian tax rules, holding period, property classification and individual circumstances." },
  { title: "100% FOREIGN OWNERSHIP", body: "International buyers can own qualifying residential property directly, subject to Georgian law." },
  { title: "MINIMUM 60% FINANCING", body: "Local bank financing may be available subject to lender criteria and individual approval." },
] as const;

const heroProofPoints = [
  "FROM €45,000",
  "10% INITIAL PAYMENT",
  "60%+ FINANCING",
  "100% FOREIGN OWNERSHIP",
] as const;

const batumiMarketStats = [
  { value: "17,478", label: "Apartments sold" },
  { value: "$1.3B", label: "Residential market size" },
  { value: "+9.4%", label: "Primary-market price growth" },
  { value: "7.4%", label: "Average rental yield" },
  { value: "52%", label: "Foreign buyers in surveyed projects" },
] as const;

const paymentStages = [
  { value: "10%", title: "INITIAL PAYMENT", body: "Secure the selected property." },
  { value: "30%", title: "DURING CONSTRUCTION", body: "Structured payments during the construction period." },
  { value: "60%", title: "AT COMPLETION", body: "Minimal 60% of bank financing may be available subject to eligibility and lender approval." },
] as const;

const aixcoCredibilityStats = [
  { value: "2009", label: "In business since" },
  { value: "2,000+", label: "Real estate transactions" },
  { value: "$4.2B+", label: "Property value transacted" },
  { value: "$400M+", label: "Current gross development value" },
  { value: "90+", label: "Professionals" },
] as const;

const faqItems = [
  {
    question: "Can foreigners own property in Georgia?",
    answer:
      "Foreign buyers can generally own residential real estate directly, subject to applicable Georgian law and property classification.",
  },
  {
    question: "How much do I need to start?",
    answer:
      "Selected Reverance apartments are currently marketed from approximately €45,000, with structured payment options.",
  },
  {
    question: "When is Reverance expected to be completed?",
    answer: "Target completion is July 2028.",
  },
  {
    question: "Can AIXCO help after completion?",
    answer:
      "Yes. The current AIXCO service model includes documentation, handover, rental coordination and ongoing property administration.",
  },
] as const;

const budgetOptions = ["€45K–€60K", "€60K–€100K", "€100K+", "Not decided"] as const;
const unitTypeOptions = ["Studio", "1 Bedroom", "2 Bedroom", "Not sure"] as const;

function scrollToSection(href: string) {
  scrollToHash(href);
}

export function BrandbookLandingPage() {
  const { lang, setLang, tx } = useI18n();
  const { company, batumiProperties, participationRoutes } = useSiteContent();
  const currentProject = batumiProperties.find((project) => project.id === "current-project") ?? batumiProperties[0];
  const currentProjectHref = currentProject.id === "current-project"
    ? "/reverance-batumi"
    : `/aixco-global-op2/${currentProject.url}`;
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [requestReference, setRequestReference] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<ExpandedImage | null>(null);
  const [languageOpen, setLanguageOpen] = useState(false);
  const languageSwitcherRef = useRef<HTMLDivElement | null>(null);
  const formStartedAtRef = useRef(Date.now());
  const currentLangName = LANGS.find((option) => option.code === lang)?.native ?? lang.toUpperCase();
  const renderBenefitCard = (benefit: { title: string; body: string }) => (
    <article key={benefit.title} className="bg-[#F3EDE1] p-6 sm:p-7">
      <h3 className="text-lg font-medium tracking-[-0.035em] sm:text-xl">{tx(benefit.title)}</h3>
      <p className="mt-3 text-sm leading-6 text-[#161616]/62">{tx(benefit.body)}</p>
    </article>
  );

  useEffect(() => {
    if (!expandedImage) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpandedImage(null);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [expandedImage]);

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

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const interest = "Project Reverance";
    const phone = String(form.get("phone") ?? "").trim();
    const budget = String(form.get("budget") ?? "").trim();
    const unitType = String(form.get("unitType") ?? "").trim();
    const message = [
      String(form.get("message") ?? "").trim(),
      phone ? `WhatsApp / Phone: ${phone}` : "",
      budget ? `Budget: ${budget}` : "",
      unitType ? `Looking for: ${unitType}` : "",
    ]
      .filter(Boolean)
      .join("\n");
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
    <div id="main-content" className="brandbook-landing reverance-editorial bg-[#F3EDE1] text-[#161616]">
      <header className="brandbook-header sticky top-0 z-50 border-b border-[#161616]/10 bg-[#F3EDE1]/95 backdrop-blur-md">
        <div className="landing-header-bar mx-auto flex h-[var(--aixco-header-height)] w-full max-w-[1600px] items-center justify-between gap-3 px-5 sm:px-8 lg:px-12">
          <Link href="/" aria-label={tx("AIXCO.Global home")} className="flex min-w-0 shrink-0 items-center">
            <Image
              src={aixcoLiveLogos.aixcoHorizontalDark}
              alt="AIXCO.Global"
              width={1600}
              height={333}
              sizes="(min-width: 1024px) 12rem, 10rem"
              className="landing-header-logo h-auto w-[7.25rem] sm:w-36 lg:w-40"
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
              className="brandbook-header-cta landing-header-control inline-flex min-h-10 items-center gap-2 bg-[#161616] px-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#002147]"
            >
              {tx("Request a brief")} <ArrowUpRight size={14} strokeWidth={1.8} />
            </a>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label={menuOpen ? tx("Close navigation") : tx("Open navigation")}
            aria-expanded={menuOpen}
            onClick={() => {
              setMenuOpen((value) => !value);
              setLanguageOpen(false);
            }}
            className="landing-header-control order-2 inline-flex min-h-11 min-w-11 items-center justify-center border border-[#161616]/20 lg:hidden"
          >
            {menuOpen ? <X size={21} strokeWidth={1.6} /> : <Menu size={21} strokeWidth={1.6} />}
          </button>

          <div ref={languageSwitcherRef} className="relative order-1 shrink-0">
            <button
              data-language-trigger="true"
              type="button"
              aria-expanded={languageOpen}
              aria-controls="brandbook-language-list"
              aria-label={`${currentLangName} ${tx("Change language")}`}
              onClick={() => setLanguageOpen((current) => !current)}
              className="landing-header-control inline-flex min-h-11 items-center gap-1.5 border border-[#161616]/15 bg-transparent px-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#161616] transition-colors hover:border-[#E6C767] hover:text-[#161616] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E6C767]/70 sm:px-3"
            >
              <Globe size={14} strokeWidth={1.6} aria-hidden />
              <span className="sm:hidden">{lang.toUpperCase()}</span>
              <span className="hidden sm:inline">{currentLangName}</span>
              <ChevronDown size={13} strokeWidth={1.6} className={languageOpen ? "rotate-180" : undefined} aria-hidden />
            </button>
            {languageOpen ? (
              <div id="brandbook-language-list" className="landing-language-panel absolute end-0 top-[calc(100%+0.5rem)] z-[80] w-56 border border-[#161616]/10 bg-[#F3EDE1] p-1.5 text-[#161616] shadow-xl">
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

        {menuOpen && (
          <nav aria-label={tx("Mobile navigation")} className="landing-mobile-nav border-t border-[#161616]/10 bg-[#F3EDE1] px-5 py-5 lg:hidden">
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
        )}

      </header>

      <main>
        <section id="top" className="scroll-mt-20">
          <div className="mx-auto grid min-h-[calc(100svh-4.6rem)] w-full max-w-[1600px] lg:grid-cols-[0.82fr_1.18fr]">
            <div className="relative flex min-h-[min(28rem,calc(100svh-4.6rem))] flex-col overflow-hidden bg-[#161616] px-5 pb-8 pt-8 text-white sm:min-h-[36rem] sm:px-10 sm:pb-10 lg:min-h-[calc(100svh-4.6rem)] lg:px-14 lg:pt-12">
              <div className="relative z-10 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                <p className="flex min-w-0 items-center gap-3 pt-1 text-[0.64rem] font-semibold uppercase tracking-[0.23em] text-[#E6C767]">
                  <span className="h-px w-8 bg-[#E6C767]" /> {tx("Batumi property profile")}
                </p>
                <span className="pt-1 text-right text-[0.58rem] font-medium uppercase tracking-[0.2em] text-white/60">01 / 04<br />AIXCO GLOBAL</span>
              </div>

              <div className="relative z-10 mt-7 max-w-[42rem]">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#E6C767]">{tx("Project Reverance")}</p>
                <h1 className="mt-3 max-w-none [overflow-wrap:anywhere] [hyphens:none] text-[clamp(1.85rem,7.4vw,3.35rem)] font-medium leading-[0.95] tracking-[-0.055em] sm:text-[clamp(2.6rem,4.8vw,4.6rem)]">
                  {tx("OWN PROPERTY ON BATUMI'S NEW BOULEVARD")}
                </h1>
                <p className="mt-6 max-w-[34rem] text-[1.05rem] leading-[1.55] text-white/68 sm:text-[1.12rem]">
                  {tx("Selected residences in one of Batumi's most dynamic coastal districts.")}
                </p>
                <p className="mt-4 max-w-[34rem] text-[0.98rem] leading-[1.55] text-white/62">
                  {tx("AIXCO offers 28 selected apartments on the 13th and 14th floors of Project Reverance, with completion targeted for July 2028.")}
                </p>
                <div className="reverance-hero-proof-grid mt-7 grid grid-cols-2 gap-2.5 sm:gap-3">
                  {heroProofPoints.map((point) => (
                    <span
                      key={point}
                      className="reverance-hero-proof flex min-h-[3.25rem] items-center justify-center border border-white/25 bg-white/[0.08] px-2.5 py-2.5 text-center text-[0.64rem] font-semibold uppercase leading-[1.25] tracking-[0.1em] text-white sm:min-h-[3.5rem] sm:px-3 sm:text-[0.68rem] sm:tracking-[0.12em]"
                    >
                      {tx(point)}
                    </span>
                  ))}
                </div>
                <div className="reverance-hero-actions mt-8 grid gap-3 sm:grid-cols-2">
                  <a
                    href="#opportunity"
                    onClick={(event) => {
                      event.preventDefault();
                      handleNavClick("#opportunity");
                    }}
                    className="brandbook-button-gold inline-flex min-h-12 w-full min-w-0 items-center justify-center gap-2.5 whitespace-normal [overflow-wrap:anywhere] bg-[#E6C767] px-4 text-[0.72rem] font-semibold uppercase leading-[1.15] tracking-[0.12em] text-[#161616] sm:justify-start sm:px-4 sm:text-[0.7rem] sm:tracking-[0.13em]"
                  >
                    {tx("VIEW AVAILABLE APARTMENTS")} <ArrowUpRight className="shrink-0" size={16} strokeWidth={1.8} />
                  </a>
                  <CurrentProjectBrochureLink className="reverance-hero-cta-secondary inline-flex min-h-12 w-full min-w-0 items-center justify-center gap-2.5 whitespace-normal [overflow-wrap:anywhere] border border-white/70 bg-white/[0.06] px-4 text-[0.72rem] font-semibold uppercase leading-[1.15] tracking-[0.12em] text-white transition-[background-color,border-color,color,transform] duration-200 hover:border-[#E6C767] hover:bg-[#E6C767] hover:text-[#161616] sm:justify-start sm:px-4 sm:text-[0.7rem] sm:tracking-[0.13em]" />
                </div>
                <p className="reverance-hero-disclaimer mt-4 max-w-[34rem] text-[0.8rem] leading-[1.45] text-white/70 sm:text-[0.84rem]">
                  {tx("Pricing, payment terms and financing are subject to apartment availability, eligibility and final contractual terms.")}
                </p>
              </div>

              <div className="relative z-10 mt-auto grid grid-cols-1 items-start gap-2 border-t border-white/25 pt-4 text-[0.58rem] font-medium uppercase tracking-[0.15em] text-white/60 sm:text-[0.62rem] sm:tracking-[0.17em] xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center xl:gap-4">
                <span>{tx("59 Adlia Street")} · Batumi · Georgia</span>
                <span className="hidden items-center gap-2 text-left sm:flex xl:justify-self-end xl:text-right"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#E6C767]" /> {tx("Completion targeted for July 2028")}</span>
              </div>
            </div>

            <div className="relative min-h-[26rem] overflow-hidden bg-[#002147] lg:min-h-full">
              <Image
                src={aixcoLiveImages.currentProjectCleanFacade}
                alt={tx("The Reverance residence exterior in Batumi")}
                fill
                preload
                quality={90}
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover object-[58%_center] transition-transform duration-[1400ms] ease-out hover:scale-[1.03]"
              />
              <button
                type="button"
                aria-label={tx("Expand image")}
                onClick={() => setExpandedImage({ ...projectImages.hero, alt: tx("The Reverance residence exterior in Batumi") })}
                className="absolute inset-0 z-10 cursor-zoom-in"
              >
                <span className="absolute right-2 top-2 inline-flex max-w-[calc(100%-0.75rem)] items-center gap-1.5 p-2 text-[0.52rem] font-semibold uppercase tracking-[0.12em] text-white [overflow-wrap:anywhere] [text-shadow:0_2px_8px_rgb(0_0_0/0.95)] sm:right-8 sm:top-8 sm:gap-2 sm:text-[0.58rem] sm:tracking-[0.16em]">
                  <Maximize2 size={13} strokeWidth={1.7} /> <span className="hidden min-[380px]:inline">{tx("Expand image")}</span>
                </span>
              </button>
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#161616]/55 via-[#161616]/10 to-transparent" />
              <div className="pointer-events-none absolute inset-x-5 bottom-5 z-20 grid gap-5 text-white sm:inset-x-8 sm:bottom-8 lg:inset-x-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div className="max-w-[30rem] [text-shadow:0_2px_10px_rgb(0_0_0/0.95),0_1px_2px_rgb(0_0_0)]">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#E6C767]">{tx("Project Reverance")}</p>
                  <p className="mt-2 text-xl font-medium leading-[1.15] tracking-[-0.03em] text-white sm:text-2xl">{tx("OWN PROPERTY ON BATUMI'S NEW BOULEVARD")}</p>
                </div>
                <div className="pointer-events-auto z-30 flex flex-wrap items-center justify-start gap-2 lg:justify-end">
                  <Link href={currentProjectHref} className="inline-flex min-h-10 items-center justify-center border border-white/90 bg-transparent px-4 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-white [text-shadow:0_2px_6px_rgb(0_0_0/0.95)] transition-colors hover:border-[#E6C767] hover:bg-[#E6C767] hover:text-[#161616] hover:[text-shadow:none]">{tx("View project")}</Link>
                  <CurrentProjectBrochureLink className="inline-flex min-h-10 items-center gap-2 border border-white/90 bg-transparent px-4 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-white [text-shadow:0_2px_6px_rgb(0_0_0/0.95)] transition-colors hover:border-[#E6C767] hover:bg-[#E6C767] hover:text-[#161616] hover:[text-shadow:none]" />
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between border-x border-b border-[#161616]/10 px-5 py-4 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#161616]/70 sm:px-8 lg:px-12">
            <span className="flex items-center gap-3"><ArrowDown size={14} strokeWidth={1.5} /> {tx("Scroll to explore")}</span>
            <span>{tx("Private residences")} · 01</span>
          </div>
        </section>

        <section id="opportunity" className="scroll-mt-20 border-b border-[#161616]/10 bg-[#F3EDE1]">
          <div className="mx-auto grid w-full max-w-[1600px] lg:grid-cols-[0.88fr_1.12fr]">
            <div className="px-5 py-20 sm:px-8 sm:py-28 lg:px-14 lg:py-36">
              <p className="brandbook-eyebrow">01 — {tx("THE OPPORTUNITY")}</p>
              <h2 className="mt-8 max-w-[12ch] text-[clamp(2.4rem,5.2vw,5.4rem)] font-medium leading-[0.92] tracking-[-0.065em]">
                {tx("A SELECTED ENTRY INTO BATUMI REAL ESTATE")}
              </h2>
              <p className="mt-9 max-w-[31rem] text-lg leading-[1.55] text-[#161616]/65">
                {tx("Reverance is a premium residential development on Batumi's New Boulevard, combining contemporary residences, resident amenities and access to one of the city's most active development districts.")}
              </p>
              <p className="mt-5 max-w-[31rem] text-base leading-[1.55] text-[#161616]/62">
                {tx("AIXCO has selected 28 apartments on the 13th and 14th floors, giving clients access to a focused inventory rather than an overwhelming catalogue.")}
              </p>
              <div className="mt-12 grid max-w-[37rem] grid-cols-2 border-y border-[#161616]/20 xl:grid-cols-4">
                <div className="py-5 pr-4">
                  <strong className="block text-2xl font-medium tracking-[-0.04em] sm:text-3xl">{tx("28")}</strong>
                  <span className="mt-2 block text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#161616]/70">{tx("AIXCO-selected apartments")}</span>
                </div>
                <div className="border-l border-[#161616]/20 px-4 py-5">
                  <strong className="block text-2xl font-medium tracking-[-0.04em] sm:text-3xl">{tx("13–14")}</strong>
                  <span className="mt-2 block text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#161616]/70">{tx("Selected floors")}</span>
                </div>
                <div className="border-t border-[#161616]/20 py-5 pr-4 xl:border-l xl:border-t-0 xl:px-4">
                  <strong className="block text-2xl font-medium tracking-[-0.04em] sm:text-3xl">{tx("Jul 2028")}</strong>
                  <span className="mt-2 block text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#161616]/70">{tx("Target completion")}</span>
                </div>
                <div className="border-l border-t border-[#161616]/20 py-5 pl-4 xl:border-t-0">
                  <strong className="block text-2xl font-medium tracking-[-0.04em] sm:text-3xl">{tx("25,000 m²")}</strong>
                  <span className="mt-2 block text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#161616]/70">{tx("Comfort & community infrastructure")}</span>
                </div>
              </div>
              <div className="mt-8 grid gap-3 text-sm leading-6 text-[#161616]/62">
                {currentProject.highlights.slice(0, 2).map((highlight) => (
                  <p key={highlight.label} className="border-l border-[#E6C767] pl-4"><strong className="font-semibold text-[#161616]">{tx(highlight.label)}:</strong> {tx(highlight.value)}</p>
                ))}
              </div>
            </div>

            <div className="relative min-h-[28rem] overflow-hidden bg-[#9A9A9A] lg:min-h-[44rem]">
              <Image src={projectImages.sunset.src} alt={tx("Sunset over the residence facade")} fill quality={90} sizes="(min-width: 1024px) 56vw, 100vw" className="object-cover object-center" />
              <button
                type="button"
                aria-label={tx("Expand image")}
                onClick={() => setExpandedImage({ ...projectImages.sunset, alt: tx("Sunset over the residence facade") })}
                className="absolute inset-0 z-10 cursor-zoom-in"
              >
                <span className="absolute right-2 top-2 inline-flex max-w-[calc(100%-0.75rem)] items-center gap-1.5 p-2 text-[0.52rem] font-semibold uppercase tracking-[0.12em] text-white [overflow-wrap:anywhere] [text-shadow:0_2px_8px_rgb(0_0_0/0.95)] sm:right-8 sm:top-8 sm:gap-2 sm:text-[0.58rem] sm:tracking-[0.16em]">
                  <Maximize2 size={13} strokeWidth={1.7} /> <span className="hidden min-[380px]:inline">{tx("Expand image")}</span>
                </span>
              </button>
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              <div className="pointer-events-none absolute left-5 top-5 z-20 flex items-center gap-3 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white [text-shadow:0_2px_8px_rgb(0_0_0/0.95)] sm:left-8 sm:top-8">
                <span className="h-px w-8 bg-[#E6C767]" /> {tx("Reverance project gallery")}
              </div>
              <div className="pointer-events-none absolute bottom-5 right-5 z-20 grid max-w-[20rem] gap-2 text-right text-white [text-shadow:0_2px_10px_rgb(0_0_0/0.95),0_1px_2px_rgb(0_0_0)] sm:bottom-8 sm:right-8">
                <span className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/80">{tx("59 Adlia Street")}</span>
                <p className="text-xl font-medium leading-[1.05] tracking-[-0.035em]">{tx("New Boulevard 5 minutes away.")}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="approach" className="scroll-mt-20 bg-[#002147] text-white">
          <div className="mx-auto w-full max-w-[1600px] px-5 py-20 sm:px-8 sm:py-28 lg:px-14 lg:py-32">
            <div className="flex flex-col justify-between gap-8 border-b border-white/20 pb-10 lg:flex-row lg:items-end">
              <div>
                <p className="brandbook-eyebrow brandbook-eyebrow-light">02 — {tx("How to work with AIXCO")}</p>
                <h2 className="mt-8 max-w-[10ch] text-[clamp(3.2rem,5.6vw,6.5rem)] font-medium leading-[0.88] tracking-[-0.065em]">{tx("ACQUIRE. PARTNER. CREATE VALUE.")}</h2>
              </div>
              <p className="max-w-[23rem] text-base leading-[1.55] text-white/60 lg:pb-2">{tx("From property ownership and strategic partnership to professional asset management, AIXCO is with you at every stage of the journey.")}</p>
            </div>

            <div className="grid divide-y divide-white/20 md:grid-cols-3 md:divide-x md:divide-y-0">
              {participationRoutes.slice(0, 3).map((item, index) => (
                <article key={item.id} className="group flex min-h-[17rem] flex-col justify-between py-8 md:px-8 md:first:pl-0 md:last:pr-0 lg:min-h-[21rem]">
                  <div className="flex items-start justify-between">
                    <span className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#E6C767]">{String(index + 1).padStart(2, "0")}</span>
                    <ArrowUpRight size={19} strokeWidth={1.4} className="text-white/35 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#E6C767]" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-medium tracking-[-0.045em]">{tx(item.title)}</h3>
                    <p className="mt-4 max-w-[18rem] text-[0.98rem] leading-[1.55] text-white/58">{tx(item.body)}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="residence" className="scroll-mt-20 border-b border-[#161616]/10 bg-[#F3EDE1]">
          <div className="mx-auto w-full max-w-[1600px] px-5 py-20 sm:px-8 sm:py-28 lg:px-14 lg:py-36">
            <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
              <div>
                <p className="brandbook-eyebrow">03 — {tx("WHY REVERANCE")}</p>
                <h2 className="mt-8 max-w-[14ch] text-[clamp(2.4rem,5.2vw,5.6rem)] font-medium leading-[0.9] tracking-[-0.065em]">{tx("BUILT FOR LIVING. POSITIONED FOR OWNERSHIP.")}</h2>
                <p className="mt-9 max-w-[24rem] text-lg leading-[1.55] text-[#161616]/62">{tx("Reverance is a premium residential development on Batumi's New Boulevard, combining contemporary residences, resident amenities and access to one of the city's most active development districts.")}</p>
                <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
                  <Link href={currentProjectHref} className="brandbook-text-link inline-flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em]">{tx("View the complete residence")} <MoveRight size={17} strokeWidth={1.6} /></Link>
                  <Link href="/reverance-batumi/calculator" className="inline-flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#6A5417] transition-colors hover:text-[#161616]">{tx("Model your investment")} <ArrowUpRight size={17} strokeWidth={1.6} /></Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <figure className="group relative aspect-[0.92] overflow-hidden bg-[#9A9A9A] sm:row-span-2 sm:aspect-auto sm:min-h-[39rem]">
                      <Image src={projectImages.lounge.src} alt={tx("Reverance residential towers project render")} fill quality={90} sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 hover:scale-[1.03]" />
                  <button type="button" aria-label={tx("Expand the Reverance residential towers image")} onClick={() => setExpandedImage({ ...projectImages.lounge, alt: tx("Reverance residential towers project render") })} className="absolute inset-0 z-10 cursor-zoom-in">
                    <span className="absolute right-4 top-4 inline-flex items-center gap-2 p-2 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-white [text-shadow:0_2px_8px_rgb(0_0_0/0.95)] sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                      <Maximize2 size={13} strokeWidth={1.7} /> {tx("Expand")}
                    </span>
                  </button>
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <figcaption className="pointer-events-none absolute bottom-4 left-4 z-20 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white [text-shadow:0_2px_8px_rgb(0_0_0/0.95)]">{tx("Project gallery")}</figcaption>
                </figure>
                <figure className="group relative aspect-[1.25] overflow-hidden bg-[#9A9A9A]">
                      <Image src={projectImages.arrival.src} alt={tx("Reverance arrival and landscaped exterior project render")} fill quality={90} sizes="(min-width: 1024px) 28vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 hover:scale-[1.03]" />
                  <button type="button" aria-label={tx("Expand the Reverance arrival image")} onClick={() => setExpandedImage({ ...projectImages.arrival, alt: tx("Reverance arrival and landscaped exterior project render") })} className="absolute inset-0 z-10 cursor-zoom-in">
                    <span className="absolute right-4 top-4 inline-flex items-center gap-2 p-2 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-white [text-shadow:0_2px_8px_rgb(0_0_0/0.95)] sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                      <Maximize2 size={13} strokeWidth={1.7} /> {tx("Expand")}
                    </span>
                  </button>
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <figcaption className="pointer-events-none absolute bottom-4 left-4 z-20 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white [text-shadow:0_2px_8px_rgb(0_0_0/0.95)]">{tx("Project gallery")}</figcaption>
                </figure>
                <figure className="group relative aspect-[1.25] overflow-hidden bg-[#9A9A9A]">
                      <Image src={projectImages.gym.src} alt={tx("Reverance residential towers project render")} fill quality={90} sizes="(min-width: 1024px) 28vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 hover:scale-[1.03]" />
                  <button type="button" aria-label={tx("Expand the Reverance amenities image")} onClick={() => setExpandedImage({ ...projectImages.gym, alt: tx("Reverance residential towers project render") })} className="absolute inset-0 z-10 cursor-zoom-in">
                    <span className="absolute right-4 top-4 inline-flex items-center gap-2 p-2 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-white [text-shadow:0_2px_8px_rgb(0_0_0/0.95)] sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                      <Maximize2 size={13} strokeWidth={1.7} /> {tx("Expand")}
                    </span>
                  </button>
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <figcaption className="pointer-events-none absolute bottom-4 left-4 z-20 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white [text-shadow:0_2px_8px_rgb(0_0_0/0.95)]">{tx("Project gallery")}</figcaption>
                </figure>
              </div>
            </div>

            <div className="mt-16 border-t border-[#161616]/15 pt-8 lg:mt-24">
              <p className="brandbook-eyebrow">{tx("Project benefits")}</p>
              <div className="mt-6">
                <div className="grid gap-px bg-[#161616]/15 sm:grid-cols-2 lg:hidden">
                  {projectBenefits.map(renderBenefitCard)}
                </div>
                <div className="hidden lg:block">
                  <div className="grid gap-px bg-[#161616]/15 lg:grid-cols-3">
                    {projectBenefits.slice(0, 3).map(renderBenefitCard)}
                  </div>
                  <div className="mt-px flex justify-center border-t border-[#161616]/15 pt-px">
                    <div className="grid w-2/3 grid-cols-2 gap-px bg-[#161616]/15">
                      {projectBenefits.slice(3).map(renderBenefitCard)}
                    </div>
                  </div>
                </div>
              </div>
              <p className="brandbook-eyebrow mt-14">{tx("OWNERSHIP IN GEORGIA")}</p>
              <h3 className="mt-4 max-w-[22ch] text-2xl font-medium tracking-[-0.04em] sm:text-3xl">{tx("A PROPERTY MARKET BUILT FOR INTERNATIONAL OWNERS.")}</h3>
              <div className="mt-6">
                <div className="grid gap-px bg-[#161616]/15 sm:grid-cols-2 lg:hidden">
                  {ownershipBenefits.map(renderBenefitCard)}
                </div>
                <div className="hidden lg:block">
                  <div className="grid gap-px bg-[#161616]/15 lg:grid-cols-3">
                    {ownershipBenefits.slice(0, 3).map(renderBenefitCard)}
                  </div>
                  <div className="mt-px flex justify-center border-t border-[#161616]/15 pt-px">
                    <div className="grid w-2/3 grid-cols-2 gap-px bg-[#161616]/15">
                      {ownershipBenefits.slice(3).map(renderBenefitCard)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="why-batumi" className="scroll-mt-20 border-b border-[#161616]/10 bg-[#002147] text-white">
          <div className="mx-auto w-full max-w-[1600px] px-5 py-20 sm:px-8 sm:py-28 lg:px-14 lg:py-32">
            <p className="brandbook-eyebrow brandbook-eyebrow-light">04 — {tx("WHY BATUMI")}</p>
            <h2 className="mt-8 max-w-[16ch] text-[clamp(2.2rem,4.8vw,5rem)] font-medium leading-[0.92] tracking-[-0.065em]">
              {tx("Batumi combines Black Sea tourism, international demand, new infrastructure and comparatively accessible residential pricing.")}
            </h2>
            <div className="mt-12 grid gap-px bg-white/15 sm:grid-cols-2 lg:grid-cols-5">
              {batumiMarketStats.map((stat) => (
                <article key={stat.label} className="bg-[#002147] p-6 text-center sm:p-7">
                  <strong className="block text-2xl font-medium tracking-[-0.04em] text-[#E6C767] sm:text-3xl">{tx(stat.value)}</strong>
                  <span className="mt-3 block text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-white/70">{tx(stat.label)}</span>
                </article>
              ))}
            </div>
            <p className="mt-8 text-[0.72rem] leading-5 text-white/50">{tx("Sources: Galt & Taggart Research; Colliers Georgia.")}</p>
          </div>
        </section>

        <section id="payment" className="scroll-mt-20 border-b border-[#161616]/10 bg-[#F3EDE1]">
          <div className="mx-auto w-full max-w-[1600px] px-5 py-20 sm:px-8 sm:py-28 lg:px-14 lg:py-36">
            <p className="brandbook-eyebrow">05 — {tx("PAYMENT STRUCTURE")}</p>
            <h2 className="mt-8 max-w-[14ch] text-[clamp(2.2rem,4.8vw,5rem)] font-medium leading-[0.9] tracking-[-0.065em]">{tx("OWN YOUR APARTMENT. PAY IN STAGES.")}</h2>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {paymentStages.map((stage, index) => (
                <article key={stage.title} className="border border-[#161616]/15 bg-white/40 p-6 sm:p-8">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#6A5417]">{String(index + 1).padStart(2, "0")}</p>
                  <strong className="mt-4 block text-4xl font-medium tracking-[-0.05em]">{tx(stage.value)}</strong>
                  <h3 className="mt-3 text-lg font-medium tracking-[-0.03em]">{tx(stage.title)}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#161616]/62">{tx(stage.body)}</p>
                </article>
              ))}
            </div>
            <p className="mt-8 max-w-[34rem] text-base leading-[1.55] text-[#161616]/62">{tx("A structured route to ownership without paying the full property price upfront.")}</p>
            <Link href="/reverance-batumi/calculator" className="brandbook-button-gold mt-8 inline-flex min-h-12 items-center gap-3 bg-[#E6C767] px-5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#161616]">
              {tx("CALCULATE MY PAYMENT PLAN")} <ArrowUpRight size={16} strokeWidth={1.8} />
            </Link>
          </div>
        </section>

        <section id="why-aixco" className="scroll-mt-20 border-b border-[#161616]/10 bg-[#161616] text-white">
          <div className="mx-auto w-full max-w-[1600px] px-5 py-20 sm:px-8 sm:py-28 lg:px-14 lg:py-32">
            <p className="brandbook-eyebrow brandbook-eyebrow-light">06 — {tx("WHY AIXCO")}</p>
            <h2 className="mt-8 max-w-[12ch] text-[clamp(2.2rem,4.8vw,5rem)] font-medium leading-[0.9] tracking-[-0.065em]">{tx("WE DON'T JUST BUY PROPERTY. WE SELECT IT.")}</h2>
            <p className="mt-6 max-w-[34rem] text-lg leading-[1.55] text-white/62">{tx("AIXCO combines international real estate experience with disciplined asset selection and local execution.")}</p>
            <div className="mt-12 grid gap-px bg-white/15 sm:grid-cols-2 lg:grid-cols-5">
              {aixcoCredibilityStats.map((stat) => (
                <article key={stat.label} className="bg-[#161616] p-6 text-center sm:p-7">
                  <strong className="block text-2xl font-medium tracking-[-0.04em] text-[#E6C767] sm:text-3xl">{tx(stat.value)}</strong>
                  <span className="mt-3 block text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-white/70">{tx(stat.label)}</span>
                </article>
              ))}
            </div>
            <p className="mt-10 max-w-[40rem] text-base leading-[1.55] text-white/58">{tx("Our role is not to show you every property on the market. It is to identify selected assets based on location, pricing, development quality, ownership structure and long-term market fundamentals.")}</p>
            <p className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#E6C767]">{tx("SWISS HERITAGE → DUBAI EXPERIENCE → BATUMI OPPORTUNITY")}</p>
          </div>
        </section>

        <section id="research" className="scroll-mt-20 border-b border-[#161616]/10 bg-[#F3EDE1]">
          <div className="mx-auto grid w-full max-w-[1600px] gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:gap-20 lg:px-14 lg:py-36">
            <div>
              <p className="brandbook-eyebrow">07 — {tx("INDEPENDENT MARKET RESEARCH")}</p>
              <h2 className="mt-8 max-w-[10ch] text-[clamp(2.2rem,4.8vw,4.8rem)] font-medium leading-[0.9] tracking-[-0.065em]">{tx("DECISIONS SUPPORTED BY DATA.")}</h2>
              <p className="mt-8 text-base leading-[1.55] text-[#161616]/62">{tx("AIXCO uses independent third-party market research alongside its own due diligence when evaluating markets and projects.")}</p>
            </div>
            <div className="grid gap-6">
              <article className="border border-[#161616]/15 bg-white/50 p-6 sm:p-8">
                <h3 className="text-xl font-medium tracking-[-0.03em]">{tx("COLLIERS")}</h3>
                <p className="mt-3 text-sm leading-6 text-[#161616]/62">{tx("Global real estate advisory and research firm providing professional property-market intelligence across international markets.")}</p>
              </article>
              <article className="border border-[#161616]/15 bg-white/50 p-6 sm:p-8">
                <h3 className="text-xl font-medium tracking-[-0.03em]">{tx("GALT & TAGGART")}</h3>
                <p className="mt-3 text-sm leading-6 text-[#161616]/62">{tx("Leading Georgian investment bank and research house providing in-depth analysis of Georgia's economy, capital markets and real estate sector.")}</p>
              </article>
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-20 border-b border-[#161616]/10 bg-[#002147] text-white">
          <div className="mx-auto w-full max-w-[1600px] px-5 py-20 sm:px-8 sm:py-28 lg:px-14 lg:py-32">
            <p className="brandbook-eyebrow brandbook-eyebrow-light">08 — {tx("FAQ")}</p>
            <h2 className="mt-8 max-w-[12ch] text-[clamp(2.2rem,4.8vw,5rem)] font-medium leading-[0.9] tracking-[-0.065em]">{tx("WHAT BUYERS USUALLY ASK.")}</h2>
            <div className="mt-12 grid gap-px bg-white/15">
              {faqItems.map((item) => (
                <article key={item.question} className="bg-[#002147] p-6 sm:p-8">
                  <h3 className="text-lg font-medium tracking-[-0.03em] text-[#E6C767]">{tx(item.question)}</h3>
                  <p className="mt-3 max-w-[40rem] text-sm leading-6 text-white/68">{tx(item.answer)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="scroll-mt-20 bg-[#161616] text-white">
          <div className="mx-auto grid w-full max-w-[1600px] gap-16 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24 lg:px-14 lg:py-32">
            <div>
              <p className="brandbook-eyebrow brandbook-eyebrow-light">09 — {tx("Start with AIXCO")}</p>
              <h2 className="mt-8 max-w-[12ch] text-[clamp(2.4rem,5.2vw,5.4rem)] font-medium leading-[0.9] tracking-[-0.065em]">{tx("YOUR REVERANCE PROPERTY STARTS HERE.")}</h2>
              <p className="mt-9 max-w-[25rem] text-lg leading-[1.55] text-white/60">{tx("Tell us what you're looking for. We'll show you the available apartments that best match your budget and objective.")}</p>
              <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 pt-5 text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-white/60">
                <span>{tx("Private viewings")}</span><span>{tx("Investment briefs")}</span><span>{tx("Owner support")}</span>
              </div>
            </div>

            <div className="border-t border-white/20 pt-6 lg:pt-0">
              {submitted ? (
                <div className="flex min-h-[24rem] flex-col justify-center border border-[#E6C767]/45 bg-[#E6C767]/[0.06] p-8 sm:p-12">
                  <div className="flex h-12 w-12 items-center justify-center bg-[#E6C767] text-[#161616]"><Check size={23} strokeWidth={2} /></div>
                  <h3 className="mt-8 text-3xl font-medium tracking-[-0.045em]">{tx("Thank you. We will contact you shortly.")}</h3>
                  <p className="mt-4 max-w-[25rem] text-base leading-[1.55] text-white/60">{tx("Your request is with the AIXCO team.")}</p>
                  {requestReference ? <p className="mt-4 text-sm font-semibold text-[#E6C767]">{tx("Request reference")}: <span>{requestReference}</span></p> : null}
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
                    {tx("WHATSAPP / PHONE")}
                    <input maxLength={40} autoComplete="tel" name="phone" type="tel" placeholder="+995 …" className="brandbook-input" />
                  </label>
                  <div className="grid gap-7 sm:grid-cols-2">
                    <label className="grid gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/55">
                      {tx("BUDGET")}
                      <select name="budget" defaultValue="" className="brandbook-input">
                        <option value="">{tx("Select budget")}</option>
                        {budgetOptions.map((option) => (
                          <option key={option} value={option}>{tx(option)}</option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/55">
                      {tx("I'M LOOKING FOR")}
                      <select name="unitType" defaultValue="" className="brandbook-input">
                        <option value="">{tx("Select unit type")}</option>
                        {unitTypeOptions.map((option) => (
                          <option key={option} value={option}>{tx(option)}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label className="grid gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/55">
                    {tx("Message")}
                    <textarea minLength={0} maxLength={1500} name="message" rows={3} placeholder={tx("Tell us how we can help")} className="brandbook-input resize-none" />
                  </label>
                  <p className="text-xs leading-[1.5] text-white/55">{tx("Receive current availability, floor plans, pricing and payment options directly from AIXCO.")}</p>
                  {submitError ? <p role="alert" className="text-sm font-medium text-[#F0A9A9]">{submitError}</p> : null}
                  <div className="flex flex-col gap-5 border-t border-white/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-[17rem] text-xs leading-[1.5] text-white/70">{tx("By sending this form, you agree that AIXCO may contact you about your request.")}</p>
                    <button type="submit" disabled={isSubmitting} className="brandbook-button-gold inline-flex min-h-12 items-center justify-center gap-3 bg-[#E6C767] px-6 text-[0.68rem] font-semibold uppercase tracking-[0.17em] text-[#161616] disabled:cursor-wait disabled:opacity-60">{isSubmitting ? tx("Sending...") : tx("SEND ME AVAILABLE APARTMENTS")} <ArrowUpRight size={16} strokeWidth={1.8} /></button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <div role="contentinfo" className="border-t border-[#161616]/10 bg-[#F3EDE1]">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-5 py-7 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#161616]/70 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-14">
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

      {expandedImage ? (
        <ExpandedProjectImageModal
          image={expandedImage}
          dialogLabel={tx("Expanded project image")}
          closeLabel={tx("Close expanded image")}
          onClose={() => setExpandedImage(null)}
        />
      ) : null}
    </div>
  );
}
