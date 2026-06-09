"use client";

import { Mail, MapPin, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { Logo } from "./Logo";
import { SocialLinks } from "./SocialLinks";
import { useSiteContent } from "@/data/site-content-context";
import { useUI } from "./ui-state";
import { useI18n } from "@/i18n/I18nProvider";
import { aixcoLiveLogos } from "@/lib/aixco-live-assets";

type FooterProps = {
  variant?: "default" | "story";
};

export function Footer({ variant = "default" }: FooterProps = {}) {
  const { openTerms, openPrivacy } = useUI();
  const { tx } = useI18n();
  const { company } = useSiteContent();
  const isStory = variant === "story";

  return (
    <footer
      data-story-footer={isStory ? "true" : undefined}
      className={`site-footer relative isolate z-20 overflow-hidden border-t border-border/80 bg-background text-foreground ${isStory ? "story-footer" : ""}`}
    >
      <div className={`container-x relative flex flex-col ${isStory ? "py-8 md:py-9" : "py-10 md:py-12"}`}>
        <div className={`grid gap-8 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-start md:gap-x-10 lg:gap-x-14 ${isStory ? "" : "lg:flex-1"}`}>
          <Logo />

          <section aria-labelledby="footer-contact-heading" className="min-w-0">
            <h2 id="footer-contact-heading" className="sr-only">
              {tx("Contact")}
            </h2>
            <div className="space-y-3">
              <a
                href={`mailto:${company.email}`}
                className="group flex min-h-11 items-start gap-3 text-sm leading-6 text-foreground/72 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span className="icon-button-glass flex h-10 w-10 shrink-0">
                  <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
                </span>
                <span className="min-w-0 pt-2 [overflow-wrap:anywhere]">{company.email}</span>
              </a>
              <div className="flex min-h-11 items-start gap-3 text-sm leading-6 text-foreground/72">
                <span className="icon-button-glass flex h-10 w-10 shrink-0">
                  <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                </span>
                <span className="min-w-0 pt-2">{company.address}</span>
              </div>
            </div>
          </section>

          <SocialLinks socials={company.socials} theme="light" aria-label={tx("AIXCO social media links")} />
        </div>

        <FooterLegalBar tx={tx} openTerms={openTerms} openPrivacy={openPrivacy} />
      </div>
    </footer>
  );
}

export function FooterLegalBar({
  tx,
  openTerms,
  openPrivacy,
  className = "",
  compact = false,
}: {
  tx: (value: string) => string;
  openTerms: () => void;
  openPrivacy: () => void;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`site-footer-legal mt-auto shrink-0 border-t border-border/70 pt-4 md:pt-5 ${
        compact ? "mt-4 md:mt-5" : "mt-10 md:mt-12 pt-6 md:pt-8"
      } ${className}`.trim()}
    >
      <a
        href="https://www.iafcertsearch.org/certified-entity/NjliMzc3N2MtNGQ2Zi01YzY2LThiOTUtMGIwZmViNWMxODk3"
        target="_blank"
        rel="noreferrer"
        className="site-footer-iso group inline-flex min-h-12 w-fit max-w-full items-center gap-3 rounded-lg border border-border/80 bg-surface/70 px-3 py-2 text-sm text-foreground/75 transition hover:border-primary/35 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
        <span className="flex min-w-0 flex-col">
          <span className="inline-flex items-center gap-2 font-semibold text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            {tx("Official systems certified")}
          </span>
          <span className="truncate text-xs text-muted-foreground">{tx("ISO 27001-2022 Certified Systems.")}</span>
        </span>
      </a>

      <div className={`${compact ? "mt-3 pt-3" : "mt-5 pt-5"} flex flex-col gap-3 border-t border-border/60 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4`}>
        <p>&copy; AIXCO Global 2026. {tx("All Rights Reserved.")}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            type="button"
            onClick={openTerms}
            className="inline-flex min-h-10 items-center text-left transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {tx("Terms & Conditions")}
          </button>
          <button
            type="button"
            onClick={openPrivacy}
            className="inline-flex min-h-10 items-center text-left transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {tx("Privacy Policy")}
          </button>
        </div>
      </div>
    </div>
  );
}
