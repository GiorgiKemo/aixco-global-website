import { useEffect } from "react";
import { X } from "lucide-react";
import { useUI } from "./ui-state";
import { company } from "@/data/site";
import { aixcoLiveImages, aixcoLiveLogos, aixcoLivePartnerPeople } from "@/lib/aixco-live-assets";
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

const loginRoles = [
  {
    title: "Customer",
    action: "Customer Login",
    cta: "Continue as customer",
    url: company.portals.customerLogin,
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
    url: company.portals.brokerLogin,
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
    url: company.portals.developerLogin,
    description:
      "Developer partners can log in to manage visibility for their listings while benefiting from a platform that still supports customers with a complete 360° service journey.",
    points: [
      "Manage listing visibility through the platform",
      "Reach a better-supported and qualified audience",
      "Benefit from stronger presentation and follow-up flow",
    ],
  },
];

const registerRoles = [
  {
    title: "Why become a customer?",
    action: "Register as Customer",
    cta: "Start customer registration",
    url: company.portals.customerSignup,
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
    url: company.portals.brokerSignup,
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
    url: company.portals.developerSignup,
    description:
      "Register as a developer partner to advertise listings through AIXCO while ensuring end customers still experience a full 360° service from first inquiry onward.",
    points: [
      "Advertise listings within a stronger branded environment",
      "Benefit from customer-facing sales and support flow",
      "Keep the experience complete from inquiry to follow-up",
    ],
  },
];

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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 animate-fade-in">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-xl" onClick={close} aria-hidden />
      <div role="dialog" aria-modal="true" className="relative max-h-[88vh] w-full max-w-5xl overflow-y-auto glass rounded-lg shadow-elegant animate-scale-in">
        <button aria-label="Close" onClick={close} className="icon-button-glass absolute right-3 top-3 z-10 h-9 w-9">
          <X className="h-4 w-4" />
        </button>
        <div className="p-7 md:p-10">
          {modal === "login" && <AccessModal mode="login" tx={tx} />}
          {modal === "register" && <AccessModal mode="register" tx={tx} />}
          {modal === "terms" && <Legal title="Terms & Conditions" tx={tx} />}
          {modal === "privacy" && <Legal title="Privacy Policy" tx={tx} />}
          {modal === "journey" && <JourneyDetail data={modalData} tx={tx} />}
          {modal === "team" && <TeamDetail data={modalData} tx={tx} />}
          {modal === "partner" && <PartnerDetail data={modalData} tx={tx} />}
        </div>
      </div>
    </div>
  );
}

function AccessModal({ mode, tx }: { mode: "login" | "register"; tx: (text: string) => string }) {
  const isRegister = mode === "register";
  const title = isRegister ? "Register with AIXCO" : "Login to your AIXCO portal";
  const subtitle = isRegister
    ? "Register opens the relevant onboarding form for each role so the right information can be submitted before portal access is activated."
    : "Login takes each user type to its respective portal so customers, brokers, and developers can continue in the right environment immediately.";
  const roles = isRegister ? registerRoles : loginRoles;

  return (
    <div>
      <h3 className="heading-section mb-3">{tx(title)}</h3>
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{tx(subtitle)}</p>
      <div className="mb-6 flex flex-wrap gap-3">
        {roles.map((role) => (
          <a key={role.action} href={role.url} target="_blank" rel="noreferrer" className="btn-ghost-gold !py-2 !px-4 text-[12px]">
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
            <a href={role.url} target="_blank" rel="noreferrer" className="mt-5 inline-flex text-xs uppercase tracking-widest text-primary">
              {tx(role.cta)}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function Legal({ title, tx }: { title: string; tx: (text: string) => string }) {
  return (
    <div>
      <p className="eyebrow mb-3">Legal</p>
      <h3 className="heading-section">{tx(title)}</h3>
    </div>
  );
}

function JourneyDetail({
  data,
  tx,
}: {
  data: { tag: string; role: string; intro: string; steps: { title: string; text: string }[] };
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
  data: { name: string; role: string; bio: string; image: string; points: { title: string; text: string }[] };
  tx: (text: string) => string;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-[180px_1fr]">
      <img src={teamImageMap[data.image]} alt={data.name} className="aspect-[4/5] w-full rounded-lg object-cover grayscale" loading="lazy" decoding="async" />
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
  data: { name: string; group?: string; summary: string; logo?: string; detail?: string[]; leaders?: { name: string; role: string; image?: string }[] };
  tx: (text: string) => string;
}) {
  return (
    <div>
      <div className="mb-6 grid gap-5 sm:grid-cols-[180px_1fr] sm:items-center">
        {data.logo && (
          <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-border/60 bg-surface-elevated/70 p-5">
            <img
              src={partnerLogoMap[data.logo]}
              alt={data.name}
              loading="lazy"
              decoding="async"
              className="max-h-24 w-full object-contain"
              width={320}
              height={180}
            />
          </div>
        )}
        <div>
          <p className="eyebrow mb-3">{tx(data.group ?? "Partner")}</p>
          <h3 className="heading-section mb-3">{data.name}</h3>
        </div>
      </div>
      {(data.detail ?? [data.summary]).map((paragraph) => (
        <p key={paragraph} className="mb-4 text-sm leading-relaxed text-foreground/80">{tx(paragraph)}</p>
      ))}
      {data.leaders && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {data.leaders.map((leader) => (
            <div key={leader.name} className="grid gap-4 rounded-lg border border-border/50 bg-background/50 p-4 sm:grid-cols-[86px_1fr] sm:items-center">
              {leader.image && (
                <img
                  src={partnerPeopleMap[leader.image]}
                  alt={leader.name}
                  loading="lazy"
                  decoding="async"
                  width={180}
                  height={180}
                  className="aspect-square w-full rounded-md object-cover"
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
