import { useEffect } from "react";
import { X } from "lucide-react";
import { useUI } from "./ui-state";
import { company } from "@/data/site";
import { aixcoLiveImages } from "@/lib/aixco-live-assets";

const teamImageMap: Record<string, string> = {
  "team-benjamin": aixcoLiveImages.teamBenjamin,
  "team-owais": aixcoLiveImages.teamOwais,
  "team-walter": aixcoLiveImages.teamWalter,
};

export function Modals() {
  const { modal, modalData, close } = useUI();

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
      <div role="dialog" aria-modal="true" className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto glass rounded-lg shadow-elegant animate-scale-in">
        <button aria-label="Close" onClick={close} className="icon-button-glass absolute right-3 top-3 z-10 h-9 w-9">
          <X className="h-4 w-4" />
        </button>
        <div className="p-7 md:p-10">
          {modal === "login" && <AuthForm mode="login" />}
          {modal === "register" && <AuthForm mode="register" />}
          {modal === "terms" && <Legal title="Terms & Conditions" />}
          {modal === "privacy" && <Legal title="Privacy Policy" />}
          {modal === "journey" && <JourneyDetail data={modalData} />}
          {modal === "team" && <TeamDetail data={modalData} />}
          {modal === "partner" && <PartnerDetail data={modalData} />}
        </div>
      </div>
    </div>
  );
}

function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isReg = mode === "register";
  return (
    <div>
      <p className="eyebrow mb-3">{isReg ? "Create account" : "Welcome back"}</p>
      <h3 className="heading-section mb-2">{isReg ? "Join AIXCO Global" : "Sign in to AIXCO"}</h3>
      <p className="text-sm text-muted-foreground mb-6">
        {isReg ? "Choose how you'd like to participate. You'll be redirected to our secure portal." : "Continue to your AIXCO portal."}
      </p>

      {isReg && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[
            { role: "Customer", url: company.portals.customer },
            { role: "Broker", url: company.portals.broker },
            { role: "Developer", url: company.portals.developer },
          ].map((r) => (
            <a key={r.role} href={r.url} target="_blank" rel="noreferrer"
              className="mac-card group p-4 transition">
              <p className="text-[11px] uppercase tracking-[0.28em] text-primary">As</p>
              <p className="font-display text-xl mt-1">{r.role}</p>
              <p className="text-xs text-muted-foreground mt-2">Open the {r.role.toLowerCase()} portal →</p>
            </a>
          ))}
        </div>
      )}

      <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
        {isReg && (
          <div>
            <label htmlFor="name" className="text-xs uppercase tracking-widest text-muted-foreground">Full name</label>
            <input id="name" required className="form-control mt-1" />
          </div>
        )}
        <div>
          <label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">Email</label>
          <input id="email" type="email" required className="form-control mt-1" />
        </div>
        <div>
          <label htmlFor="pw" className="text-xs uppercase tracking-widest text-muted-foreground">Password</label>
          <input id="pw" type="password" required minLength={8} className="form-control mt-1" />
        </div>
        <button type="submit" className="btn-gold mt-2">{isReg ? "Create account" : "Sign in"}</button>
        <p className="text-[11px] text-muted-foreground">
          By continuing you agree to AIXCO's Terms and Privacy Policy. You'll be securely redirected to the AIXCO portal.
        </p>
      </form>
    </div>
  );
}

function Legal({ title }: { title: string }) {
  return (
    <div>
      <p className="eyebrow mb-3">Legal</p>
      <h3 className="heading-section mb-4">{title}</h3>
      <div className="prose-invert space-y-4 text-sm text-foreground/80 leading-relaxed">
        <p>
          This document summarizes the {title.toLowerCase()} that govern your use of the AIXCO Global website and platform.
          AIXCO Global, headquartered at {company.address}, operates this site for informational purposes.
        </p>
        <p>
          Nothing on this site constitutes an offer to sell or a solicitation to buy securities. Any participation in AIXCO products
          requires a separate, signed agreement and, where applicable, suitability and KYC verification.
        </p>
        <p>
          We collect only the information you actively provide (e.g. contact form data) and basic analytics needed to operate the site.
          We never sell personal data. You may request deletion at any time by writing to {company.email}.
        </p>
        <p>
          Returns depend on market conditions, project execution and regulatory suitability. Past performance is not indicative of future results.
          Real-estate investments involve risk, including possible loss of capital.
        </p>
      </div>
    </div>
  );
}

function JourneyDetail({ data }: { data: { role: string; summary: string; steps: string[] } }) {
  return (
    <div>
      <p className="eyebrow mb-3">Journey</p>
      <h3 className="heading-section mb-2">{data.role}</h3>
      <p className="text-sm text-muted-foreground mb-6">{data.summary}</p>
      <ol className="space-y-4">
        {data.steps.map((s, i) => (
          <li key={i} className="flex gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary font-display text-lg">{i + 1}</span>
            <p className="pt-1.5 text-sm text-foreground/85">{s}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function TeamDetail({ data }: { data: { name: string; role: string; bio: string; image: string } }) {
  return (
    <div className="grid sm:grid-cols-[180px_1fr] gap-6">
      <img src={teamImageMap[data.image]} alt={data.name} className="w-full aspect-[4/5] object-cover rounded-lg grayscale" loading="lazy" />
      <div>
        <p className="eyebrow mb-3">Leadership</p>
        <h3 className="heading-section mb-1">{data.name}</h3>
        <p className="text-primary text-sm mb-4">{data.role}</p>
        <p className="text-sm text-foreground/80 leading-relaxed">{data.bio}</p>
      </div>
    </div>
  );
}

function PartnerDetail({ data }: { data: { name: string; summary: string } }) {
  return (
    <div>
      <p className="eyebrow mb-3">Partner</p>
      <h3 className="heading-section mb-3">{data.name}</h3>
      <p className="text-sm text-foreground/80 leading-relaxed">{data.summary}</p>
    </div>
  );
}
