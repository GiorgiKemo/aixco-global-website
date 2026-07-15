import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { useUI } from "./ui-state";
import { useSiteContent } from "@/data/site-content-context";
import type { SiteContent } from "@/lib/backend/site-content";
import { aixcoLiveImages, aixcoLiveLogos, aixcoLivePartnerPeople } from "@/lib/aixco-live-assets";
import { recordContactSubmission, recordPortalEvent } from "@/lib/backend/lead-capture";
import { getSafePortalUrl } from "@/lib/security/urls";
import { useI18n } from "@/i18n/I18nProvider";

const teamImageMap: Record<string, string> = {
  "team-benjamin": aixcoLiveImages.teamBenjamin,
  "team-owais": aixcoLiveImages.teamOwais,
  "team-walter": aixcoLiveImages.teamWalter,
};

const partnerLogoMap: Record<string, string> = {
  globalPartners: aixcoLiveLogos.globalPartners,
  isp: aixcoLiveLogos.isp,
  workwise: aixcoLiveLogos.workwise,
  cleanElements: aixcoLiveLogos.cleanElements,
  revanta: aixcoLiveLogos.revanta,
  gti: aixcoLiveLogos.gti,
  bluerock: aixcoLiveLogos.bluerock,
  daewoo: aixcoLiveLogos.daewoo,
};

const partnerPeopleMap: Record<string, string> = {
  butti: aixcoLivePartnerPeople.butti,
  rashid: aixcoLivePartnerPeople.rashid,
  bader: aixcoLivePartnerPeople.bader,
  warren: aixcoLivePartnerPeople.warren,
};

type JourneyDetailData = { tag: string; role: string; intro: string; steps: { title: string; text: string }[] };
type TeamDetailData = { name: string; role: string; bio: string; image: string; points: { title: string; text: string }[] };
type PartnerDetailData = {
  name: string;
  group?: string;
  modalLabel?: string;
  summary: string;
  logo?: string;
  detail?: string[];
  facts?: { title: string; text: string }[];
  leaders?: { name: string; role: string; image?: string }[];
};
type LegalTitle = "Terms & Conditions" | "Privacy Policy";
type LegalSection = { heading: string; body: string; items?: string[] };

const dialogFocusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "video[controls]",
  "audio[controls]",
  "[contenteditable='true']",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getDialogFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(dialogFocusableSelector)).filter(
    (element) => element.tabIndex >= 0 && element.getAttribute("aria-hidden") !== "true" && !element.closest("[inert]"),
  );
}

function keepFocusInsideDialog(event: KeyboardEvent, container: HTMLElement) {
  if (event.key !== "Tab") return;

  const focusable = getDialogFocusableElements(container);
  if (!focusable.length) {
    event.preventDefault();
    container.focus({ preventScroll: true });
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;

  if (event.shiftKey && (active === first || !container.contains(active))) {
    event.preventDefault();
    last.focus({ preventScroll: true });
  } else if (!event.shiftKey && (active === last || !container.contains(active))) {
    event.preventDefault();
    first.focus({ preventScroll: true });
  }
}

function isolateDialogLayer(layer: HTMLElement) {
  const previousStates: Array<{ element: HTMLElement; inert: boolean; ariaHidden: string | null }> = [];
  let current: HTMLElement = layer;

  while (current.parentElement) {
    const parent = current.parentElement;
    Array.from(parent.children).forEach((sibling) => {
      if (sibling === current || !(sibling instanceof HTMLElement)) return;
      previousStates.push({
        element: sibling,
        inert: sibling.inert,
        ariaHidden: sibling.getAttribute("aria-hidden"),
      });
      sibling.inert = true;
      sibling.setAttribute("aria-hidden", "true");
    });

    if (parent === document.body) break;
    current = parent;
  }

  return () => {
    previousStates.reverse().forEach(({ element, inert, ariaHidden }) => {
      element.inert = inert;
      if (ariaHidden === null) element.removeAttribute("aria-hidden");
      else element.setAttribute("aria-hidden", ariaHidden);
    });
  };
}

function getLoginRoles(portals: SiteContent["company"]["portals"]) {
  return [
  {
    title: "Customer",
    action: "Customer Login",
    cta: "Continue as customer",
    url: portals.customerLogin,
    description:
      "Customers can log in to manage property interest, review opportunities, follow their onboarding progress, and continue a purchase or service journey through the portal.",
    points: [
      "Continue property purchase or service workflows",
      "Access documents, updates, and dashboard information",
      "Stay connected to a guided 360° service process",
    ],
  },
  {
    title: "Broker",
    action: "Broker Login",
    cta: "Continue as broker",
    url: portals.brokerLogin,
    description:
      "Brokers can log in to use the portal operationally, manage customer journeys, coordinate tours, and work more efficiently with curated emerging-market opportunities.",
    points: [
      "Coordinate customer tours and service requests",
      "Use portal tools and listing support more efficiently",
      "Work with curated and exclusive access opportunities",
    ],
  },
  {
    title: "Developer Partner",
    action: "Developer Login",
    cta: "Continue as developer",
    url: portals.developerLogin,
    description:
      "Developer partners can log in to manage visibility for their listings while benefiting from a platform that still supports customers with a complete 360° service journey.",
    points: [
      "Manage listing visibility through the platform",
      "Reach a better-supported and qualified audience",
      "Benefit from stronger presentation and follow-up flow",
    ],
  },
  ];
}

function getRegisterRoles(portals: SiteContent["company"]["portals"]) {
  return [
  {
    title: "Why become a customer?",
    action: "Register as Customer",
    cta: "Start customer registration",
    url: portals.customerSignup,
    description:
      "Register as a customer if you want to buy property, explore selected opportunities, or receive a more guided route into selected emerging-market real estate through one organized onboarding form.",
    points: [
      "Submit your interest and onboarding details digitally",
      "Access support for buying property or property services",
      "Move into a guided 360° customer journey",
    ],
  },
  {
    title: "Why become a broker?",
    action: "Register as Broker",
    cta: "Start broker registration",
    url: portals.brokerSignup,
    description:
      "Register as a broker to use the AIXCO portal and services for customer tours, curated support, and stronger access to selected and exclusive listings.",
    points: [
      "Use the portal to support active client workflows",
      "Arrange tours and customer servicing more smoothly",
      "Offer curated and exclusive listing access",
    ],
  },
  {
    title: "Why become a developer partner?",
    action: "Join as Developer Partner",
    cta: "Start developer onboarding",
    url: portals.developerSignup,
    description:
      "Register as a developer partner to advertise listings through AIXCO while ensuring end customers still experience a full 360° service from first inquiry onward.",
    points: [
      "Advertise listings within a stronger branded environment",
      "Benefit from customer-facing sales and support flow",
      "Keep the experience complete from inquiry to follow-up",
    ],
  },
  ];
}

const legalCopy: Record<LegalTitle, LegalSection[]> = {
  "Terms & Conditions": [
    {
      heading: "1. Introduction",
      body:
        "These Terms & Conditions govern your access to and use of the AIXCO Global platform (\u201cPlatform\u201d). By accessing or using the Platform, you agree to be bound by these terms. If you do not agree, you should not use the Platform.",
    },
    {
      heading: "2. Nature of Services",
      body:
        "AIXCO Global provides information and services for real estate purchase, brokerage, property administration, and related portal workflows. AIXCO acts as a facilitator and does not provide financial, legal, or tax advice unless explicitly stated.",
    },
    {
      heading: "3. Eligibility",
      body:
        "Users must be at least 18 years old and legally capable of entering binding agreements. Certain services may be restricted based on jurisdiction and regulatory requirements.",
    },
    {
      heading: "4. Account Registration & KYC",
      body:
        "To access services, users must register and complete Know Your Customer (KYC) verification. You agree to provide accurate, complete, and updated information. AIXCO reserves the right to suspend or terminate accounts that fail verification or provide misleading data.",
    },
    {
      heading: "5. Real Estate Risks",
      body:
        "Real estate purchases and rental assumptions carry risk. Rental income, resale values, and project timelines are not guaranteed and may fluctuate based on market conditions, property condition, project delivery, and external factors.",
    },
    {
      heading: "6. No Professional Advice",
      body:
        "Information provided on the Platform is for informational purposes only and should not be considered financial, legal, tax, or property-purchase advice. Users should consult independent advisors before entering a real estate transaction.",
    },
    {
      heading: "7. User Responsibilities",
      body:
        "You are responsible for maintaining the confidentiality of your account credentials and for all activities conducted under your account. Unauthorized use must be reported immediately.",
    },
    {
      heading: "8. Fees & Transactions",
      body:
        "Any applicable fees, commissions, or charges will be disclosed prior to participation. Users agree to all applicable payment terms when engaging in transactions.",
    },
    {
      heading: "9. Intellectual Property",
      body:
        "All content, branding, and materials on the Platform are the intellectual property of AIXCO Global and may not be reproduced, distributed, or used without prior written consent.",
    },
    {
      heading: "10. Limitation of Liability",
      body:
        "AIXCO Global shall not be liable for any direct, indirect, or consequential losses arising from the use of the Platform or real estate decisions made by users.",
    },
    {
      heading: "11. Third-Party Services",
      body:
        "The Platform may include links or integrations with third-party services. AIXCO is not responsible for the content, policies, or practices of such third parties.",
    },
    {
      heading: "12. Termination",
      body:
        "AIXCO reserves the right to suspend or terminate access to the Platform at its discretion, particularly in cases of misuse, regulatory concerns, or breach of these terms.",
    },
    {
      heading: "13. Governing Law",
      body: "These Terms are governed by applicable laws and regulations relevant to AIXCO Global\u2019s operating jurisdictions.",
    },
    {
      heading: "14. Changes to Terms",
      body: "AIXCO may update these Terms periodically. Continued use of the Platform constitutes acceptance of the updated Terms.",
    },
    {
      heading: "15. Contact",
      body: "For questions regarding these Terms, contact: info@aixco.global",
    },
  ],
  "Privacy Policy": [
    {
      heading: "1. Introduction",
      body:
        "AIXCO Global is committed to protecting your personal data and privacy. This Privacy Policy explains how we collect, use, and safeguard your information.",
    },
    {
      heading: "2. Information We Collect",
      body:
        "We may collect personal data including name, email address, phone number, identification documents, financial details, and usage data when you interact with the Platform.",
    },
    {
      heading: "3. Purpose of Data Collection",
      body: "Your data is used for:",
      items: [
        "Account creation and management",
        "KYC and compliance verification",
        "Providing real estate purchase, brokerage, and administration services",
        "Communication and support",
        "Improving platform functionality",
      ],
    },
    {
      heading: "4. Legal Basis for Processing",
      body: "We process personal data based on contractual necessity, legal obligations, legitimate interests, and user consent where applicable.",
    },
    {
      heading: "5. Data Sharing",
      body: "We do not sell personal data. Information may be shared with:",
      items: [
        "Regulatory authorities (when required)",
        "KYC/AML verification providers",
        "Financial and legal partners involved in transactions",
      ],
    },
    {
      heading: "6. Data Security",
      body:
        "We implement industry-standard security measures aligned with ISO 27001 principles to protect your data from unauthorized access, misuse, or disclosure.",
    },
    {
      heading: "7. Data Retention",
      body: "Personal data is retained only as long as necessary for legal, regulatory, and operational purposes.",
    },
    {
      heading: "8. Cookies & Tracking",
      body:
        "We use cookies and analytics tools to enhance user experience and monitor platform performance. You may manage cookie preferences through your browser settings.",
    },
    {
      heading: "9. Your Rights",
      body: "Depending on your jurisdiction, you may have the right to:",
      items: [
        "Access your data",
        "Request correction or deletion",
        "Restrict or object to processing",
        "Request data portability",
      ],
    },
    {
      heading: "10. International Data Transfers",
      body: "Your data may be processed in multiple jurisdictions where AIXCO operates, subject to appropriate safeguards.",
    },
    {
      heading: "11. Third-Party Links",
      body: "The Platform may contain links to third-party websites. We are not responsible for their privacy practices.",
    },
    {
      heading: "12. Updates to Policy",
      body: "This Privacy Policy may be updated periodically. Continued use of the Platform indicates acceptance of changes.",
    },
    {
      heading: "13. Contact",
      body: "For privacy-related inquiries, contact: info@aixco.global",
    },
  ],
};

function getModalAccessibleName(modal: NonNullable<ReturnType<typeof useUI>["modal"]>, modalData: unknown) {
  if (modal === "login") return "Login to your AIXCO portal";
  if (modal === "register") return "Register with AIXCO";
  if (modal === "contact") return "Contact AIXCO";
  if (modal === "terms") return "Terms & Conditions";
  if (modal === "privacy") return "Privacy Policy";
  if (modal === "journey") return (modalData as JourneyDetailData).role;
  if (modal === "team") return (modalData as TeamDetailData).name;
  if (modal === "partner") return (modalData as PartnerDetailData).name;
  return "AIXCO dialog";
}

export function Modals() {
  const { modal, modalData, close, openContact } = useUI();
  const { tx } = useI18n();
  const shellRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const handledContactUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const openContactFromUrl = () => {
      const url = new URL(window.location.href);
      const signature = `${url.pathname}${url.search}${url.hash}`;
      const requestsContact = url.pathname === "/" && url.searchParams.get("modal") === "contact";

      if (!requestsContact) {
        handledContactUrlRef.current = null;
        return;
      }

      if (handledContactUrlRef.current === signature) return;
      handledContactUrlRef.current = signature;
      openContact();
    };

    openContactFromUrl();
    window.addEventListener("popstate", openContactFromUrl);
    return () => window.removeEventListener("popstate", openContactFromUrl);
  }, [openContact]);

  useEffect(() => {
    if (!modal) return;

    const shell = shellRef.current;
    const dialog = dialogRef.current;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    const restoreIsolation = shell ? isolateDialogLayer(shell) : () => undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (dialog) keepFocusInsideDialog(event, dialog);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    (closeButtonRef.current ?? dialog)?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
      restoreIsolation();
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [modal, close]);

  if (!modal) return null;

  const dialogLabel = tx(getModalAccessibleName(modal, modalData));

  return (
    <div ref={shellRef} className="modal-shell fixed inset-0 z-[100] flex min-h-[100dvh] items-center justify-center overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-[max(1rem,env(safe-area-inset-top,0px))] md:p-6">
      <div className="modal-backdrop absolute inset-0 bg-transparent backdrop-blur-lg backdrop-saturate-150" onClick={close} aria-hidden />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={dialogLabel}
        tabIndex={-1}
        className="modal-panel relative max-h-[calc(100dvh-2rem)] w-full max-w-5xl overflow-y-auto overscroll-contain rounded-lg border border-border/70 bg-surface-elevated shadow-elegant [overflow-wrap:anywhere] md:max-h-[88dvh]"
      >
        <button ref={closeButtonRef} aria-label={tx("Close")} onClick={close} className="icon-button-glass absolute end-3 top-3 z-10 h-11 w-11">
          <X className="h-4 w-4" />
        </button>
        <div className="p-5 sm:p-7 md:p-10">
          {modal === "login" && <AccessModal mode="login" tx={tx} />}
          {modal === "register" && <AccessModal mode="register" tx={tx} />}
          {modal === "contact" && <ContactRequestModal tx={tx} />}
          {modal === "terms" && <Legal title="Terms & Conditions" tx={tx} />}
          {modal === "privacy" && <Legal title="Privacy Policy" tx={tx} />}
          {modal === "journey" && <JourneyDetail data={modalData as JourneyDetailData} tx={tx} />}
          {modal === "team" && <TeamDetail data={modalData as TeamDetailData} tx={tx} />}
          {modal === "partner" && <PartnerDetail data={modalData as PartnerDetailData} tx={tx} />}
        </div>
      </div>
    </div>
  );
}

type ContactMode = "call" | "email";

function toDateTimeLocalValue(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function getMinimumCallTimeValue() {
  const nextAvailable = new Date();
  nextAvailable.setMinutes(nextAvailable.getMinutes() + 15, 0, 0);
  const minutesPastStep = nextAvailable.getMinutes() % 15;

  if (minutesPastStep) {
    nextAvailable.setMinutes(nextAvailable.getMinutes() + (15 - minutesPastStep));
  }

  return toDateTimeLocalValue(nextAvailable);
}

function formatPreferredCallTime(value: string) {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value.replace("T", " ");

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function ContactRequestModal({ tx }: { tx: (text: string) => string }) {
  const [mode, setMode] = useState<ContactMode | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [requestReference, setRequestReference] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [minimumCallTime, setMinimumCallTime] = useState("");
  const formStartedAtRef = useRef(Date.now());

  useEffect(() => {
    if (mode === "call") {
      setMinimumCallTime(getMinimumCallTimeValue());
    }
  }, [mode]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const preferredTime = String(form.get("preferredTime") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    const website = String(form.get("website") ?? "").trim();

    if (!mode || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    const payload =
      mode === "call"
        ? {
            name,
            email,
            interest: "Schedule a Call",
            message: `Schedule a call request. Phone number: ${phone}. Preferred time for a call: ${formatPreferredCallTime(preferredTime)}`,
          }
        : {
            name,
            email,
            interest: "Send an Email",
            message,
          };

    const result = await recordContactSubmission(payload, {
      antiAbuse: { website, startedAt: formStartedAtRef.current },
    });
    setIsSubmitting(false);

    if (result.ok) {
      setRequestReference(result.reference ?? null);
      setSubmitted(true);
      return;
    }

    setSubmitError(tx("We could not send your request. Please try again or email info@aixco.global."));
  };

  if (submitted) {
    return (
      <div className="contact-request-modal max-w-2xl" role="status" aria-live="polite" aria-atomic="true">
        <p className="eyebrow mb-3">{tx("Contact AIXCO")}</p>
        <h3 className="heading-section">{tx("Thank you. We will contact you shortly.")}</h3>
        {requestReference ? (
          <p className="mt-4 text-sm font-semibold text-foreground">
            {tx("Request reference")}: <span className="font-mono">{requestReference}</span>
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="contact-request-modal max-w-3xl">
      <p className="eyebrow mb-3">{tx("Contact AIXCO")}</p>
      <h3 className="heading-section">{tx("How would you like us to contact you?")}</h3>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            setSubmitError(null);
            setMode("call");
          }}
          aria-pressed={mode === "call"}
          className="contact-request-option"
        >
          <span>{tx("Schedule a Call")}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setSubmitError(null);
            setMode("email");
          }}
          aria-pressed={mode === "email"}
          className="contact-request-option"
        >
          <span>{tx("Send an Email")}</span>
        </button>
      </div>

      {mode ? (
        <form onSubmit={handleSubmit} className="contact-request-form mt-6 grid gap-4">
          <div aria-hidden="true" className="pointer-events-none absolute start-[-10000px] top-auto h-px w-px overflow-hidden">
            <label>
              Website
              <input name="website" type="text" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <label className="grid gap-2">
            <span className="story-metric-label text-foreground/60">{tx("Name & Surname")}</span>
            <input
              name="name"
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
              className="contact-request-input"
            />
          </label>

          {mode === "call" ? (
            <>
              <label className="grid gap-2">
                <span className="story-metric-label text-foreground/60">{tx("Phone Number")}</span>
                <input
                  name="phone"
                  required
                  minLength={5}
                  maxLength={40}
                  autoComplete="tel"
                  className="contact-request-input"
                />
              </label>
              <label className="grid gap-2">
                <span className="story-metric-label text-foreground/60">{tx("Preferred Time for a Call")}</span>
                <input
                  name="preferredTime"
                  type="datetime-local"
                  required
                  min={minimumCallTime}
                  step={900}
                  autoComplete="off"
                  className="contact-request-input"
                />
              </label>
            </>
          ) : null}

          <label className="grid gap-2">
            <span className="story-metric-label text-foreground/60">{tx("Email Address")}</span>
            <input
              name="email"
              type="email"
              required
              maxLength={255}
              autoComplete="email"
              className="contact-request-input"
            />
          </label>

          {mode === "email" ? (
            <label className="grid gap-2">
              <span className="story-metric-label text-foreground/60">{tx("Message")}</span>
              <textarea
                name="message"
                required
                minLength={10}
                maxLength={1500}
                rows={5}
                className="contact-request-input resize-y"
              />
            </label>
          ) : null}

          {submitError ? (
            <p role="alert" className="text-sm font-medium text-destructive">
              {submitError}
            </p>
          ) : null}

          <button type="submit" disabled={isSubmitting} className="btn-gold w-fit">
            {tx(isSubmitting ? "Sending..." : "Submit")}
          </button>
        </form>
      ) : null}
    </div>
  );
}

function AccessModal({ mode, tx }: { mode: "login" | "register"; tx: (text: string) => string }) {
  const { company } = useSiteContent();
  const isRegister = mode === "register";
  const title = isRegister ? "Register with AIXCO" : "Login to your AIXCO portal";
  const subtitle = isRegister
    ? "Register opens the relevant onboarding form for each role so the right information can be submitted before portal access is activated."
    : "Login takes each user type to its respective portal so customers, brokers, and developers can continue in the right environment immediately.";
  const roles = (isRegister ? getRegisterRoles(company.portals) : getLoginRoles(company.portals))
    .map((role) => ({ ...role, url: getSafePortalUrl(role.url, "") }))
    .filter((role) => role.url);

  return (
    <div>
      <h3 className="heading-section mb-3">{tx(title)}</h3>
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{tx(subtitle)}</p>
      <div className="mb-6 flex flex-wrap gap-3">
        {roles.map((role) => (
          <a
            key={role.action}
            href={role.url}
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              void recordPortalEvent({
                mode,
                roleTitle: role.title,
                action: role.action,
                portalUrl: role.url,
              });
            }}
            className="btn-ghost-gold !py-2 !px-4 text-[12px]"
          >
            {tx(role.action)}
          </a>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {roles.map((role) => (
          <div key={role.title} className="mac-card p-5">
            <h4 className="font-display text-xl">{tx(role.title)}</h4>
            <p className="mt-3 text-sm leading-relaxed text-foreground/80">{tx(role.description)}</p>
            <ul className="mt-4 space-y-2">
              {role.points.map((point) => (
                <li key={point} className="text-sm leading-relaxed text-muted-foreground">{tx(point)}</li>
              ))}
            </ul>
            <a
              href={role.url}
              target="_blank"
              rel="noreferrer"
              onClick={() => {
                void recordPortalEvent({
                  mode,
                  roleTitle: role.title,
                  action: role.cta,
                  portalUrl: role.url,
                });
              }}
              className="mt-5 inline-flex min-h-11 items-center py-2 text-xs uppercase tracking-widest text-primary"
            >
              {tx(role.cta)}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function Legal({ title, tx }: { title: LegalTitle; tx: (text: string) => string }) {
  const sections = legalCopy[title];

  return (
    <div>
      <p className="eyebrow mb-3">Legal</p>
      <h3 className="heading-section">{tx(title)}</h3>
      <div className="mt-6 space-y-5">
        {sections.map((section) => (
          <section key={section.heading}>
            <h4 className="font-display text-lg">{tx(section.heading)}</h4>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">{tx(section.body)}</p>
            {section.items && (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
                {section.items.map((item) => (
                  <li key={item}>{tx(item)}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

function JourneyDetail({
  data,
  tx,
}: {
  data: JourneyDetailData;
  tx: (text: string) => string;
}) {
  return (
    <div>
      <p className="eyebrow mb-3">{tx(data.tag)}</p>
      <h3 className="heading-section mb-2">{tx(data.role)}</h3>
      <p className="mb-6 text-sm text-muted-foreground">{tx(data.intro)}</p>
      <ol className="space-y-4">
        {data.steps.map((step, i) => (
          <li key={`${step.title}-${i}`} className="flex gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary font-display text-lg">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h4 className="font-display text-xl">{tx(step.title)}</h4>
              <p className="mt-1 text-sm text-foreground/85">{tx(step.text)}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function TeamDetail({
  data,
  tx,
}: {
  data: TeamDetailData;
  tx: (text: string) => string;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-[180px_1fr]">
      <Image
        src={teamImageMap[data.image]}
        alt={data.name}
        className="aspect-[9/10] w-full rounded-lg object-cover"
        loading="lazy"
        decoding="async"
        width={832}
        height={1024}
        sizes="(min-width: 640px) 180px, 100vw"
      />
      <div>
        <p className="eyebrow mb-3">{tx("Leadership")}</p>
        <h3 className="heading-section mb-1">{data.name}</h3>
        <p className="mb-4 text-sm text-primary">{tx(data.role)}</p>
        <p className="text-sm leading-relaxed text-foreground/80">{tx(data.bio)}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {data.points.map((point) => (
            <div key={point.title} className="rounded-lg border border-border/50 bg-background/50 p-4">
              <h4 className="font-display text-lg">{tx(point.title)}</h4>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tx(point.text)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PartnerDetail({
  data,
  tx,
}: {
  data: PartnerDetailData;
  tx: (text: string) => string;
}) {
  const label =
    data.modalLabel ??
    (data.group === "Group companies" ? "Group company" : data.group === "Strategic partners" ? "Strategic partner" : data.group ?? "Partner");

  return (
    <div>
      <div className="mb-6 grid gap-5 sm:grid-cols-[180px_1fr] sm:items-center">
        {data.logo && (
          <div className="partner-modal-logo-stage">
            <Image
              src={partnerLogoMap[data.logo]}
              alt={data.name}
              loading="lazy"
              decoding="async"
              className="partner-modal-logo-image"
              width={320}
              height={180}
              sizes="180px"
            />
          </div>
        )}
        <div>
          <p className="eyebrow mb-3">{tx(label)}</p>
          <h3 className="heading-section mb-3">{data.name}</h3>
        </div>
      </div>
      {(data.detail ?? [data.summary]).map((paragraph) => (
        <p key={paragraph} className="mb-4 text-sm leading-relaxed text-foreground/80">{tx(paragraph)}</p>
      ))}
      {data.facts && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {data.facts.map((fact) => (
            <div key={`${fact.title}-${fact.text}`} className="rounded-lg border border-border/50 bg-background/50 p-4">
              <h4 className="font-display text-lg">{tx(fact.title)}</h4>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tx(fact.text)}</p>
            </div>
          ))}
        </div>
      )}
      {data.leaders && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {data.leaders.map((leader) => (
            <div key={leader.name} className="grid gap-4 rounded-lg border border-border/50 bg-background/50 p-4 sm:grid-cols-[86px_1fr] sm:items-center">
              {leader.image && (
                <Image
                  src={partnerPeopleMap[leader.image]}
                  alt={leader.name}
                  loading="lazy"
                  decoding="async"
                  width={180}
                  height={180}
                  sizes="(min-width: 640px) 86px, 100vw"
                  className="aspect-square w-full rounded-md bg-surface-elevated object-contain"
                />
              )}
              <div>
                <h4 className="font-display text-lg">{leader.name}</h4>
                <p className="mt-1 text-sm text-primary">{tx(leader.role)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
