"use client";

import Image from "next/image";
import type { SiteContent } from "@/lib/backend/site-content";
import { aixcoLiveLogos } from "@/lib/aixco-live-assets";
import { motion } from "@/lib/framer-motion";
import { premiumPress } from "@/lib/motion";

export type Partner = SiteContent["partners"][number];

const logoMap: Record<string, string> = {
  globalPartners: aixcoLiveLogos.globalPartners,
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
  variant = "native",
  ariaLabel,
  className = "",
}: {
  title?: string;
  partners: Partner[];
  openPartner: (partner: Partner) => void;
  tx: (text: string) => string;
  reverse?: boolean;
  variant?: "native" | "story";
  ariaLabel?: string;
  className?: string;
}) {
  if (items.length === 0) return null;

  const marqueeLabel = ariaLabel ?? (title ? tx(title) : undefined);

  return (
    <div className={`${variant === "story" ? "mb-0" : "mb-12 min-w-0 overflow-hidden last:mb-0"} ${className}`.trim()}>
      {title ? (
        <h3 className={`${variant === "story" ? "sr-only" : "scroll-reveal mb-5 min-w-0 font-display text-2xl [overflow-wrap:anywhere]"}`}>
          {tx(title)}
        </h3>
      ) : null}
      <div
        className={`partner-marquee ${variant === "story" ? "partner-marquee--story" : ""} ${variant === "native" ? "scroll-reveal" : ""}`}
        aria-label={marqueeLabel}
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

  return (
    <motion.button
      type="button"
      onClick={() => openPartner(partner)}
      tabIndex={isClone ? -1 : undefined}
      aria-label={tx(partner.name)}
      className={`partner-marquee-item group ${partner.featured ? "partner-marquee-item--featured" : ""}`}
      whileTap={premiumPress}
    >
      <span className="partner-marquee-item__card">
        <span className="partner-marquee-item__logo-stage">
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              width={240}
              height={120}
              sizes="(min-width: 768px) 11.25rem, 9.5rem"
              className="partner-marquee-item__logo"
            />
          ) : null}
        </span>
      </span>
      <span className="partner-marquee-item__name">{tx(partner.name)}</span>
    </motion.button>
  );
}
