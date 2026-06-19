"use client";

import { ShieldCheck } from "lucide-react";
import Image from "next/image";
import { aixcoLiveLogos } from "@/lib/aixco-live-assets";

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
          <span className="min-w-0 text-xs leading-snug text-muted-foreground [overflow-wrap:anywhere]">
            {tx("ISO 27001-2022 Certified Systems.")}
          </span>
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
