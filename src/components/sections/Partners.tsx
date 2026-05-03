import { partners } from "@/data/site";
import { useUI } from "../ui-state";
import { motion } from "framer-motion";
import { premiumPress } from "@/lib/motion";
import { useI18n } from "@/i18n/I18nProvider";
import { aixcoLiveLogos } from "@/lib/aixco-live-assets";

type Partner = (typeof partners)[number];

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

export function Partners() {
  const { openPartner } = useUI();
  const { tx } = useI18n();
  const groupCompanies = partners.filter((partner) => partner.group === "Group companies");
  const strategicPartners = partners.filter((partner) => partner.group === "Strategic partners");

  return (
    <section id="partners" className="relative scroll-mt-16 py-16 md:scroll-mt-20 md:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-surface/60 to-transparent" aria-hidden="true" />
      <div className="container-x">
        <div className="scroll-reveal mb-14 max-w-3xl">
          <p className="eyebrow">{tx("Companies & Partners")}</p>
          <h2 className="heading-section mt-5">{tx("The AIXCO ecosystem")}</h2>
        </div>

        <PartnerMarquee title="Group companies" partners={groupCompanies} openPartner={openPartner} tx={tx} />
        <PartnerMarquee
          title="Strategic partners"
          partners={strategicPartners}
          openPartner={openPartner}
          tx={tx}
          reverse
        />
      </div>
    </section>
  );
}

function PartnerMarquee({
  title,
  partners: items,
  openPartner,
  tx,
  reverse = false,
}: {
  title: string;
  partners: Partner[];
  openPartner: (partner: Partner) => void;
  tx: (text: string) => string;
  reverse?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <div className="mb-12 last:mb-0">
      <h3 className="scroll-reveal mb-5 font-display text-2xl">{tx(title)}</h3>
      <div className="partner-marquee scroll-reveal" aria-label={tx(title)}>
        <div className={`partner-marquee-track ${reverse ? "partner-marquee-track-reverse" : ""}`}>
          {[0, 1].map((setIndex) => (
            <div key={setIndex} className="partner-marquee-set" aria-hidden={setIndex === 1 ? "true" : undefined}>
              {items.map((partner) => (
                <PartnerCard
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

function PartnerCard({
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
  return (
    <motion.button
      type="button"
      onClick={() => openPartner(partner)}
      aria-label={`${partner.name} ${tx("Open profile")}`}
      tabIndex={isClone ? -1 : undefined}
      className={`partner-flip-card group h-[236px] w-[min(78vw,300px)] shrink-0 text-left md:w-[300px] ${partner.featured ? "partner-flip-card-featured" : ""}`}
      whileTap={premiumPress}
    >
      <span className="partner-flip-card-inner">
        <span className="partner-flip-face partner-flip-front" aria-hidden="true">
          {partner.logo && (
            <span className="partner-logo-stage">
              <img
                src={logoMap[partner.logo]}
                alt={partner.name}
                loading="lazy"
                decoding="async"
                width={240}
                height={120}
                className="partner-logo-image max-h-20 max-w-full object-contain"
              />
            </span>
          )}
        </span>
        <span className="partner-flip-face partner-flip-back">
          <span className="block font-display text-xl leading-tight">{partner.name}</span>
          <span className="mt-3 line-clamp-4 block text-sm leading-relaxed text-foreground/80">
            {tx(partner.summary)}
          </span>
          <span className="mt-5 inline-block text-[11px] uppercase tracking-widest text-primary">
            {tx("Open profile")}
          </span>
        </span>
      </span>
    </motion.button>
  );
}
