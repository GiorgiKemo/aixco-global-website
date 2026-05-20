"use client";

import { ChevronDown, Globe } from "lucide-react";
import type { RefObject } from "react";
import { LANGS } from "@/i18n/I18nProvider";
import { NAV, getDesktopNavLabel } from "./nav-data";

type NavMeasurementProps = {
  controlsMeasureRef: RefObject<HTMLDivElement | null>;
  desktopNavLinkClass: string;
  desktopNavSpacing: string;
  lang: string;
  navMeasureRef: RefObject<HTMLDivElement | null>;
  t: (key: string) => string;
};

export function NavMeasurement({
  controlsMeasureRef,
  desktopNavLinkClass,
  desktopNavSpacing,
  lang,
  navMeasureRef,
  t,
}: NavMeasurementProps) {
  return (
    <div aria-hidden className="pointer-events-none invisible fixed -left-[9999px] top-0 flex items-center gap-4 whitespace-nowrap">
      <nav ref={navMeasureRef} className={`flex items-center justify-center ${desktopNavSpacing}`}>
        {NAV.map((item) => {
          const label = t(item.key);
          return (
            <span key={item.key} className={`rounded-full ${desktopNavLinkClass} leading-none tracking-wide`}>
              {getDesktopNavLabel(lang, item.key, label)}
            </span>
          );
        })}
        <span className={`rounded-full ${desktopNavLinkClass} leading-none tracking-wide`}>{t("nav.more")}</span>
      </nav>
      <div ref={controlsMeasureRef} className="flex items-center gap-3">
        <span data-nav-persistent className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] uppercase tracking-widest">
          <Globe className="h-3.5 w-3.5" />
          {LANGS.find((item) => item.code === lang)?.native}
          <ChevronDown className="h-3 w-3" />
        </span>
        <span className="px-3 py-2 text-sm tracking-wide">{t("cta.login")}</span>
        <span className="px-4 py-2 text-sm tracking-wide">{t("cta.register")}</span>
        <span className="px-4 py-2 text-sm tracking-wide">{t("cta.start")}</span>
      </div>
    </div>
  );
}
