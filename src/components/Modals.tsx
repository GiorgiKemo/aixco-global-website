import { useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { useUI } from "./ui-state";
import { useSiteContent } from "@/data/site-content-context";
import type { SiteContent } from "@/lib/backend/site-content";
import { aixcoLiveImages, aixcoLiveLogos, aixcoLivePartnerPeople } from "@/lib/aixco-live-assets";
import { recordPortalEvent } from "@/lib/backend/lead-capture";
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

function getLoginRoles(portals: SiteContent["company"]["portals"]) {
  return [
  {
    title: "Customer",
    action: "Customer Login",
    cta: "Continue as customer",
    url: portals.customerLogin,
    description:
      "Customers can log in to manage property interest, review opportunities, follow their onboarding progress, and continue a purchase or participation journey through the portal.",
    points: [
      "Continue property purchase or participation workflows",
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
      "Brokers can log in to use the portal operationally, manage customer journeys, coordinate tours, and work more efficiently with curated Batumi opportunities.",
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
      "Register as a customer if you want to buy property, explore selected opportunities, or receive a more guided route into Batumi through one organized onboarding form.",
    points: [
      "Submit your interest and onboarding details digitally",
      "Access support for buying property or joining opportunities",
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
        "AIXCO Global provides access to structured real estate participation opportunities, investment information, and related services. AIXCO acts as a facilitator and does not provide financial, legal, or tax advice unless explicitly stated.",
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
      heading: "5. Investment Risks",
      body:
        "All investments carry risk. Returns are not guaranteed and may fluctuate based on market conditions, project performance, and external factors. Past performance is not indicative of future results.",
    },
    {
      heading: "6. No Financial Advice",
      body:
        "Information provided on the Platform is for informational purposes only and should not be considered financial or investment advice. Users should consult independent advisors before making investment decisions.",
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
        "AIXCO Global shall not be liable for any direct, indirect, or consequential losses arising from the use of the Platform or investment decisions made by users.",
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
        "Providing investment opportunities",
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
  if (modal === "terms") return "Terms & Conditions";
  if (modal === "privacy") return "Privacy Policy";
  if (modal === "journey") return (modalData as JourneyDetailData).role;
  if (modal === "team") return (modalData as TeamDetailData).name;
  if (modal === "partner") return (modalData as PartnerDetailData).name;
  return "AIXCO dialog";
}

export function Modals() {
  const { modal, modalData, close } = useUI();
  const { tx } = useI18n();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = modal ? "hidden" : "";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [modal, close]);

  if (!modal) return null;

  const dialogLabel = tx(getModalAccessibleName(modal, modalData));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 animate-fade-in">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-xl" onClick={close} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={dialogLabel}
        className="relative max-h-[88vh] w-full max-w-5xl overflow-y-auto rounded-lg border border-border/70 bg-surface-elevated shadow-elegant animate-scale-in [overflow-wrap:anywhere]"
      >
        <button aria-label="Close" onClick={close} className="icon-button-glass absolute right-3 top-3 z-10 h-10 w-10">
          <X className="h-4 w-4" />
        </button>
        <div className="p-7 md:p-10">
          {modal === "login" && <AccessModal mode="login" tx={tx} />}
          {modal === "register" && <AccessModal mode="register" tx={tx} />}
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
              className="mt-5 inline-flex text-xs uppercase tracking-widest text-primary"
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
