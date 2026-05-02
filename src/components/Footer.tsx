import { Instagram, Linkedin } from "lucide-react";
import { Logo } from "./Logo";
import { company } from "@/data/site";
import { useUI } from "./ui-state";
import { useI18n } from "@/i18n/I18nProvider";
import { aixcoLiveLogos } from "@/lib/aixco-live-assets";

export function Footer() {
  const { openTerms, openPrivacy } = useUI();
  const { tx } = useI18n();

  return (
    <footer className="relative border-t border-border/60 bg-gradient-onyx py-10">
      <div className="container-x flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo />
          <img
            src={aixcoLiveLogos.aixcoGlobal}
            alt="AIXCO Global"
            loading="lazy"
            width={420}
            height={120}
            className="mt-4 h-9 w-auto object-contain opacity-80 [filter:brightness(0)_saturate(100%)]"
          />
          <p className="mt-4 text-xs text-muted-foreground">© AIXCO Global 2026. All Rights Reserved.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/80">
          <a
            href="https://www.iafcertsearch.org/certified-entity/NjliMzc3N2MtNGQ2Zi01YzY2LThiOTUtMGIwZmViNWMxODk3"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 link-underline"
          >
            <img src={aixcoLiveLogos.iso} alt="" aria-hidden loading="lazy" className="h-8 w-8 rounded-sm object-contain" />
            ISO 27001-2022 Certified Systems.
          </a>
          <button onClick={openTerms} className="link-underline">{tx("Terms & Conditions")}</button>
          <button onClick={openPrivacy} className="link-underline">{tx("Privacy Policy")}</button>
          <a aria-label="Instagram" href={company.socials.instagram} target="_blank" rel="noreferrer" className="icon-button-glass h-9 w-9">
            <Instagram className="h-4 w-4" />
          </a>
          <a aria-label="LinkedIn" href={company.socials.linkedin} target="_blank" rel="noreferrer" className="icon-button-glass h-9 w-9">
            <Linkedin className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
