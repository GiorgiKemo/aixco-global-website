"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Menu,
  MoveRight,
  X,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { useSiteContent } from "@/data/site-content-context";
import { CurrentProjectBrochureLink } from "@/components/property/PropertyChrome";
import { getContactSubmitErrorMessage } from "@/lib/contact-submit-error";
import { recordContactSubmission } from "@/lib/backend/lead-capture";
import { aixcoCurrentProjectGalleryImages, aixcoLiveLogos } from "@/lib/aixco-live-assets";

const navigation = [
  { label: "Opportunity", href: "#opportunity" },
  { label: "The AIXCO way", href: "#approach" },
  { label: "Residence", href: "#residence" },
];

const projectImages = {
  hero: aixcoCurrentProjectGalleryImages[0].src,
  sunset: aixcoCurrentProjectGalleryImages[1].src,
  night: aixcoCurrentProjectGalleryImages[2].src,
  aerial: aixcoCurrentProjectGalleryImages[3].src,
  arrival: aixcoCurrentProjectGalleryImages[5].src,
  lounge: aixcoCurrentProjectGalleryImages[12].src,
  gym: aixcoCurrentProjectGalleryImages[15].src,
} as const;

const projectInvestmentBenefits = [
  { title: "100% Ownership", body: "Full freehold, no local partner, no conditions. Yours entirely." },
  { title: "No Residency Permit", body: "Ownership without relocation. Buy from anywhere." },
  { title: "1% Rental Income Tax", body: "Keep 99% of what your asset earns - rental income taxed at just 1%." },
  { title: "0% Capital Gains", body: "Hold for more than two years and keep the full upside." },
  { title: "Minimum 60% Financing", body: "Local bank financing can cover at least 60% of the purchase price." },
  { title: "Transparent Title", body: "ISO-certified guidance with clear, verifiable documentation." },
] as const;

function scrollToSection(href: string) {
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function BrandbookLandingPage() {
  const { lang, tx } = useI18n();
  const { company, batumiProperties, participationRoutes } = useSiteContent();
  const currentProject = batumiProperties.find((project) => project.id === "current-project") ?? batumiProperties[0];
  const currentProjectHref = `/aixco-global-op2/${currentProject.url}`;
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [requestReference, setRequestReference] = useState<string | null>(null);
  const formStartedAtRef = useRef(Date.now());

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
        <div className="mx-auto flex h-[4.6rem] w-full max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link href="/" aria-label="AIXCO.Global home" className="flex items-center">
            <Image
              src={aixcoLiveLogos.aixcoHorizontalDark}
              alt="AIXCO.Global"
              width={1600}
              height={333}
              priority
              sizes="(min-width: 1024px) 12rem, 10rem"
              className="h-auto w-36 sm:w-40"
            />
          </Link>

          <nav aria-label="Primary navigation" className="hidden items-center gap-9 lg:flex">
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
                {item.label}
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
              Request a brief <ArrowUpRight size={14} strokeWidth={1.8} />
            </a>
          </nav>

          <button
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center border border-[#161616]/20 lg:hidden"
          >
            {menuOpen ? <X size={21} strokeWidth={1.6} /> : <Menu size={21} strokeWidth={1.6} />}
          </button>
        </div>

        {menuOpen && (
          <nav aria-label="Mobile navigation" className="border-t border-[#161616]/10 bg-[#F3EDE1] px-5 py-5 lg:hidden">
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
                  {item.label}
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
                Request a private brief <ArrowUpRight size={15} strokeWidth={1.8} />
              </a>
            </div>
          </nav>
        )}
      </header>

      <main>
        <section id="top" className="scroll-mt-20">
          <div className="mx-auto grid min-h-[calc(100svh-4.6rem)] w-full max-w-[1600px] lg:grid-cols-[0.82fr_1.18fr]">
            <div className="relative flex min-h-[36rem] flex-col justify-between overflow-hidden bg-[#161616] px-6 pb-8 pt-8 text-white sm:px-10 sm:pb-10 lg:min-h-[calc(100svh-4.6rem)] lg:px-14 lg:pt-12">
              <div className="relative z-10 flex items-start justify-end">
                <span className="pt-1 text-right text-[0.58rem] font-medium uppercase tracking-[0.2em] text-white/45">01 / 04<br />AIXCO GLOBAL</span>
              </div>

              <div className="relative z-10 max-w-[35rem] py-10 lg:py-6">
                <p className="mb-6 flex items-center gap-3 text-[0.64rem] font-semibold uppercase tracking-[0.23em] text-[#E6C767]">
                  <span className="h-px w-8 bg-[#E6C767]" /> {tx("Batumi property profile")}
                </p>
                <h1 className="max-w-[8.5ch] text-[clamp(3.9rem,7vw,7.4rem)] font-medium leading-[0.86] tracking-[-0.065em]">
                  Project <span className="text-[#E6C767]">Reverance</span>
                </h1>
                <p className="mt-8 max-w-[28rem] text-[1.05rem] leading-[1.55] text-white/68 sm:text-[1.12rem]">
                  {tx(currentProject.summary)}
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <a
                    href="#opportunity"
                    onClick={(event) => {
                      event.preventDefault();
                      handleNavClick("#opportunity");
                    }}
                    className="brandbook-button-gold inline-flex min-h-12 items-center gap-3 bg-[#E6C767] px-5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#161616]"
                  >
                    {tx("Explore the current project")} <ArrowUpRight size={16} strokeWidth={1.8} />
                  </a>
                  <a
                    href="#contact"
                    onClick={(event) => {
                      event.preventDefault();
                      handleNavClick("#contact");
                    }}
                    className="inline-flex min-h-12 items-center gap-3 border border-white/25 px-5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:border-[#E6C767] hover:text-[#E6C767]"
                  >
                    {tx("Contact AIXCO")} <ArrowRight size={16} strokeWidth={1.6} />
                  </a>
                </div>
              </div>

              <div className="relative z-10 flex items-end justify-between border-t border-white/15 pt-5 text-[0.62rem] font-medium uppercase tracking-[0.17em] text-white/45">
                <span>59 Adlia Street · Batumi</span>
                <span className="hidden items-center gap-2 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#E6C767]" /> {tx("Completion targeted for July 2028")}</span>
              </div>
            </div>

            <div className="relative min-h-[26rem] overflow-hidden bg-[#002147] lg:min-h-full">
              <Image
                src={projectImages.hero}
                alt="The Reverance residence exterior in Batumi"
                fill
                priority
                quality={90}
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover object-[58%_center] transition-transform duration-[1400ms] ease-out hover:scale-[1.03]"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-black/30" />
              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between text-white sm:inset-x-8 sm:bottom-8 lg:inset-x-10">
                <div>
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#E6C767]">Project Reverance</p>
                  <p className="mt-2 max-w-[28rem] text-xl font-medium tracking-[-0.03em] sm:text-2xl">{tx("Reverance is a premium residential complex on Batumi's New Boulevard.")}</p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Link href={currentProjectHref} className="border border-white/35 px-3 py-2 text-[0.58rem] font-semibold uppercase tracking-[0.16em] transition-colors hover:border-[#E6C767] hover:text-[#E6C767]">{tx("View project")}</Link>
                  <CurrentProjectBrochureLink className="inline-flex items-center gap-2 border border-white/35 px-3 py-2 text-[0.58rem] font-semibold uppercase tracking-[0.16em] transition-colors hover:border-[#E6C767] hover:text-[#E6C767]" />
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between border-x border-b border-[#161616]/10 px-5 py-4 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#161616]/45 sm:px-8 lg:px-12">
            <span className="flex items-center gap-3"><ArrowDown size={14} strokeWidth={1.5} /> Scroll to explore</span>
            <span>Private residences · 01</span>
          </div>
        </section>

        <section id="opportunity" className="scroll-mt-20 border-b border-[#161616]/10 bg-[#F3EDE1]">
          <div className="mx-auto grid w-full max-w-[1600px] lg:grid-cols-[0.88fr_1.12fr]">
            <div className="px-5 py-20 sm:px-8 sm:py-28 lg:px-14 lg:py-36">
              <p className="brandbook-eyebrow">01 — {tx("Project highlights")}</p>
              <h2 className="mt-8 max-w-[9ch] text-[clamp(3rem,5.5vw,6.6rem)] font-medium leading-[0.9] tracking-[-0.065em]">
                {tx("Selected access, structured for ownership.")}
              </h2>
              <p className="mt-9 max-w-[31rem] text-lg leading-[1.55] text-[#161616]/65">
                {tx("Clear guidance, real project information, and supporting materials from AIXCO.")}
              </p>
              <div className="mt-12 grid max-w-[37rem] grid-cols-2 border-y border-[#161616]/20 sm:grid-cols-4">
                <div className="py-5 pr-4">
                  <strong className="block text-2xl font-medium tracking-[-0.04em] sm:text-3xl">{tx("17")}</strong>
                  <span className="mt-2 block text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-[#161616]/48">{tx("Floors")}</span>
                </div>
                <div className="border-l border-[#161616]/20 px-4 py-5">
                  <strong className="block text-2xl font-medium tracking-[-0.04em] sm:text-3xl">{tx("408")}</strong>
                  <span className="mt-2 block text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-[#161616]/48">{tx("Apartments")}</span>
                </div>
                <div className="border-l border-[#161616]/20 py-5 pl-4 sm:px-4">
                  <strong className="block text-2xl font-medium tracking-[-0.04em] sm:text-3xl">{tx("28")}</strong>
                  <span className="mt-2 block text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-[#161616]/48">{tx("Available")}</span>
                </div>
                <div className="border-l border-[#161616]/20 py-5 pl-4">
                  <strong className="block text-2xl font-medium tracking-[-0.04em] sm:text-3xl">{tx("Jul 2028")}</strong>
                  <span className="mt-2 block text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-[#161616]/48">{tx("Completion")}</span>
                </div>
              </div>
              <div className="mt-8 grid gap-3 text-sm leading-6 text-[#161616]/62">
                {currentProject.highlights.slice(0, 2).map((highlight) => (
                  <p key={highlight.label} className="border-l border-[#E6C767] pl-4"><strong className="font-semibold text-[#161616]">{tx(highlight.label)}:</strong> {tx(highlight.value)}</p>
                ))}
              </div>
            </div>

            <div className="relative min-h-[28rem] overflow-hidden bg-[#D9D0C0] lg:min-h-[44rem]">
              <Image src={projectImages.sunset} alt="Sunset over the residence facade" fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover object-center" />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute left-5 top-5 flex items-center gap-3 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white sm:left-8 sm:top-8">
                <span className="h-px w-8 bg-[#E6C767]" /> {tx("Reverance project gallery")}
              </div>
              <div className="absolute bottom-5 right-5 flex max-w-[16rem] items-end justify-between gap-8 text-right text-white sm:bottom-8 sm:right-8">
                <span className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/65">{tx("59 Adlia Street")}</span>
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
                <p className="brandbook-eyebrow">03 — {tx("The investment case")}</p>
                <h2 className="mt-8 max-w-[8ch] text-[clamp(3.2rem,5.7vw,6.8rem)] font-medium leading-[0.88] tracking-[-0.065em]">{tx("Reverance")}</h2>
                <p className="mt-9 max-w-[24rem] text-lg leading-[1.55] text-[#161616]/62">{tx("Reverance is a premium residential complex on Batumi's New Boulevard.")}</p>
                <Link href={currentProjectHref} className="brandbook-text-link mt-10 inline-flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em]">{tx("View the complete residence")} <MoveRight size={17} strokeWidth={1.6} /></Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <figure className="relative aspect-[0.92] overflow-hidden bg-[#D9D0C0] sm:row-span-2 sm:aspect-auto sm:min-h-[39rem]">
                  <Image src={projectImages.lounge} alt="Reverance residential towers project render" fill sizes="(min-width: 1024px) 35vw, 100vw" className="object-cover transition-transform duration-700 hover:scale-[1.03]" />
                  <figcaption className="absolute bottom-4 left-4 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white/75">{tx("Project gallery")}</figcaption>
                </figure>
                <figure className="relative aspect-[1.25] overflow-hidden bg-[#D9D0C0]">
                  <Image src={projectImages.arrival} alt="Reverance arrival and landscaped exterior project render" fill sizes="(min-width: 1024px) 28vw, 50vw" className="object-cover transition-transform duration-700 hover:scale-[1.03]" />
                  <figcaption className="absolute bottom-4 left-4 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white/75">{tx("Project gallery")}</figcaption>
                </figure>
                <figure className="relative aspect-[1.25] overflow-hidden bg-[#D9D0C0]">
                  <Image src={projectImages.gym} alt="Reverance residential towers project render" fill sizes="(min-width: 1024px) 28vw, 50vw" className="object-cover transition-transform duration-700 hover:scale-[1.03]" />
                  <figcaption className="absolute bottom-4 left-4 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white/75">{tx("Project gallery")}</figcaption>
                </figure>
              </div>
            </div>

            <div className="mt-16 border-t border-[#161616]/15 pt-8 lg:mt-24">
              <p className="brandbook-eyebrow">{tx("Why Reverance")}</p>
              <div className="mt-6 grid gap-px bg-[#161616]/15 sm:grid-cols-2 lg:grid-cols-3">
                {projectInvestmentBenefits.map((benefit) => (
                  <article key={benefit.title} className="bg-[#F3EDE1] p-6 sm:p-7">
                    <h3 className="text-xl font-medium tracking-[-0.035em]">{tx(benefit.title)}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#161616]/62">{tx(benefit.body)}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="scroll-mt-20 bg-[#161616] text-white">
          <div className="mx-auto grid w-full max-w-[1600px] gap-16 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24 lg:px-14 lg:py-32">
            <div>
              <p className="brandbook-eyebrow brandbook-eyebrow-light">04 — {tx("Start with AIXCO")}</p>
              <h2 className="mt-8 max-w-[8ch] text-[clamp(3.2rem,5.7vw,6.7rem)] font-medium leading-[0.88] tracking-[-0.065em]">{tx("Contact AIXCO")}</h2>
              <p className="mt-9 max-w-[25rem] text-lg leading-[1.55] text-white/60">{tx("Register for the correct customer, broker, property owner, or developer journey and the AIXCO team will follow up.")}</p>
              <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 pt-5 text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-white/45">
                <span>{tx("Private viewings")}</span><span>{tx("Investment briefs")}</span><span>{tx("Owner support")}</span>
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
                <form aria-label="Contact AIXCO form" onSubmit={handleSubmit} className="grid gap-7">
                  <div aria-hidden="true" className="pointer-events-none absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
                    <label>Website<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
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
                <select name="interest" defaultValue="Project Reverance" className="brandbook-input">
                      <option value="Project Reverance">{tx("Project Reverance")}</option>
                      <option value="Customer Real Estate Buyer">{tx("Customer Real Estate Buyer")}</option>
                      <option value="Property Owner Administration">{tx("Property Owner Administration")}</option>
                      <option value="Broker">{tx("Broker")}</option>
                      <option value="Developer">{tx("Developer")}</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/55">
                    {tx("Message")}
                    <textarea required minLength={10} maxLength={1500} name="message" rows={4} placeholder={tx("Tell us how we can help")} className="brandbook-input resize-none" />
                  </label>
                  {submitError ? <p role="alert" className="text-sm font-medium text-[#F0A9A9]">{submitError}</p> : null}
                  <div className="flex flex-col gap-5 border-t border-white/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-[17rem] text-xs leading-[1.5] text-white/38">{tx("By sending this form, you agree that AIXCO may contact you about your request.")}</p>
                    <button type="submit" disabled={isSubmitting} className="brandbook-button-gold inline-flex min-h-12 items-center justify-center gap-3 bg-[#E6C767] px-6 text-[0.68rem] font-semibold uppercase tracking-[0.17em] text-[#161616] disabled:cursor-wait disabled:opacity-60">{isSubmitting ? tx("Sending...") : tx("Send request")} <ArrowUpRight size={16} strokeWidth={1.8} /></button>
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
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a href={`mailto:${company.email}`} className="transition-colors hover:text-[#161616]">{company.email}</a>
            <span>{company.address}</span>
            <span>{company.offices.join(" · ")}</span>
            <span>{tx("Since")} {company.founded}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
