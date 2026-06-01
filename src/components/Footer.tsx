"use client";

import Image from "next/image";
import Link from "next/link";
import { Instagram, Linkedin } from "lucide-react";
import { Logo } from "./Logo";
import { useSiteContent } from "@/data/site-content-context";
import { useUI } from "./ui-state";
import { useI18n } from "@/i18n/I18nProvider";
import { aixcoLiveLogos } from "@/lib/aixco-live-assets";
import { getSafeHttpsUrl } from "@/lib/security/urls";

export function Footer() {
  const { openTerms, openPrivacy } = useUI();
  const { tx } = useI18n();
  const { company } = useSiteContent();
  const instagramHref = getSafeHttpsUrl(company.socials.instagram, "https://www.instagram.com/aixco.global", [
    "instagram.com",
    "www.instagram.com",
  ]);
  const linkedinHref = getSafeHttpsUrl(company.socials.linkedin, "https://www.linkedin.com/company/aixco-global", [
    "linkedin.com",
    "www.linkedin.com",
  ]);

  return (
    <footer className="relative border-t border-border/60 bg-gradient-onyx py-10">
      <div className="container-x flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo />
          <p className="mt-4 text-xs text-muted-foreground">&copy; AIXCO Global 2026. {tx("All Rights Reserved.")}</p>
        </div>

        <div data-footer-actions className="flex flex-wrap items-center gap-4 text-sm text-foreground/80 md:pr-24 lg:pr-0">
          <Link href="/aixco-philosophy" prefetch={false} className="inline-flex min-h-10 items-center link-underline">
            AIXCO Philosophy
          </Link>
          <a
            href="https://www.iafcertsearch.org/certified-entity/NjliMzc3N2MtNGQ2Zi01YzY2LThiOTUtMGIwZmViNWMxODk3"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center gap-2 link-underline"
          >
            <Image
              src={aixcoLiveLogos.iso}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              width={64}
              height={64}
              sizes="32px"
              className="h-8 w-8 rounded-sm object-contain"
            />
            {tx("ISO 27001-2022 Certified Systems.")}
          </a>
          <button onClick={openTerms} className="inline-flex min-h-10 items-center link-underline">{tx("Terms & Conditions")}</button>
          <button onClick={openPrivacy} className="inline-flex min-h-10 items-center link-underline">{tx("Privacy Policy")}</button>
          <a aria-label="Instagram" href={instagramHref} target="_blank" rel="noreferrer" className="icon-button-glass h-10 w-10">
            <Instagram className="h-4 w-4" />
          </a>
          <a aria-label="LinkedIn" href={linkedinHref} target="_blank" rel="noreferrer" className="icon-button-glass h-10 w-10">
            <Linkedin className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
