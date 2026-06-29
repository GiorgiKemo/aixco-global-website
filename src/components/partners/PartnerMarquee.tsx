"use client";

import Image from "next/image";
import { useState } from "react";
import type { SiteContent } from "@/lib/backend/site-content";
import { aixcoLiveLogos } from "@/lib/aixco-live-assets";
import { motion } from "@/lib/framer-motion";
import { premiumPress } from "@/lib/motion";

export type Partner = SiteContent["partners"][number];

const logoMap: Record<string, string> = {
  globalPartners: aixcoLiveLogos.globalPartnersMarquee,
  isp: aixcoLiveLogos.isp,
  workwise: aixcoLiveLogos.workwise,
  cleanElements: aixcoLiveLogos.cleanElements,
  revanta: aixcoLiveLogos.revanta,
  gti: aixcoLiveLogos.gti,
  bluerock: aixcoLiveLogos.bluerock,
  daewoo: aixcoLiveLogos.daewoo,
};

export function PartnerMarquee({
  title,
  partners: items,
  openPartner,
  tx,
  reverse = false,
  ariaLabel,
  className = "",
}: {
  title?: string;
  partners: Partner[];
  openPartner: (partner: Partner) => void;
  tx: (text: string) => string;
  reverse?: boolean;
  ariaLabel?: string;
  className?: string;
}) {
  if (items.length === 0) return null;

  const marqueeLabel = ariaLabel ?? (title ? tx(title) : undefined);

  return (
    <div className={`mb-0 ${className}`.trim()}>
      {title ? (
        <h3 className="sr-only">{tx(title)}</h3>
      ) : null}
      <div
        className="partner-marquee partner-marquee--story"
        aria-label={marqueeLabel}
        data-marquee-paused="false"
      >
        <div className={`partner-marquee-track ${reverse ? "partner-marquee-track-reverse" : ""}`}>
          {[0, 1].map((setIndex) => (
            <div key={setIndex} className="partner-marquee-set" aria-hidden={setIndex === 1 ? "true" : undefined}>
              {items.map((partner) => (
                <PartnerMarqueeItem
                  key={`${setIndex}-${partner.name}`}
                  partner={partner}
                  openPartner={openPartner}
                  tx={tx}
                  isClone={setIndex === 1}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PartnerMarqueeItem({
  partner,
  openPartner,
  tx,
  isClone,
}: {
  partner: Partner;
  openPartner: (partner: Partner) => void;
  tx: (text: string) => string;
  isClone: boolean;
}) {
  const logoSrc = partner.logo ? logoMap[partner.logo] : null;
  const translatedName = tx(partner.name);
  const [logoState, setLogoState] = useState<"pending" | "loaded" | "error">(logoSrc ? "pending" : "error");

  return (
    <motion.button
      type="button"
      onClick={() => openPartner(partner)}
      tabIndex={isClone ? -1 : undefined}
      aria-label={translatedName}
      className={`partner-marquee-item group ${partner.featured ? "partner-marquee-item--featured" : ""}`}
      whileTap={premiumPress}
    >
      <span className="partner-marquee-item__card">
        <span className="partner-marquee-item__fallback" data-logo-state={logoState} aria-hidden>
          {translatedName}
        </span>
        {logoSrc ? (
          <Image
            src={logoSrc}
            alt=""
            aria-hidden
            loading="lazy"
            fetchPriority="auto"
            decoding="async"
            width={240}
            height={120}
            sizes="(min-width: 768px) 11.25rem, 9.5rem"
            className="partner-marquee-item__logo"
            onLoad={() => setLogoState("loaded")}
            onError={() => setLogoState("error")}
          />
        ) : null}
      </span>
      <span className="partner-marquee-item__name">{translatedName}</span>
    </motion.button>
  );
}
