import { partners } from "@/data/site";
import { useUI } from "../ui-state";
import { motion } from "framer-motion";
import { premiumPress, premiumSurfaceHover } from "@/lib/motion";
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
  const featured = partners.find((partner) => partner.featured);
  const groupCompanies = partners.filter((partner) => partner.group === "Group companies");
  const strategicPartners = partners.filter((partner) => partner.group === "Strategic partners");

  return (
    <section id="partners" className="relative py-28 md:py-36 scroll-mt-24">
      <div className="container-x">
        <div className="scroll-reveal mb-14 max-w-3xl">
          <p className="eyebrow">{tx("Companies & Partners")}</p>
          <h2 className="heading-section mt-5">{tx("The AIXCO ecosystem")}</h2>
          <p className="mt-6 text-foreground/80 leading-relaxed">
            {tx("Explore the operating companies and strategic partners behind the platform. Global Partners is featured as the lead highlight.")}
          </p>
        </div>

        {featured && (
          <motion.button
            type="button"
            onClick={() => openPartner(featured)}
            className="scroll-reveal mac-card mb-10 grid w-full gap-6 p-7 text-left md:grid-cols-[1.1fr_0.9fr] md:p-10"
            whileHover={premiumSurfaceHover}
            whileTap={premiumPress}
          >
            <div>
              <p className="eyebrow">{tx("Featured highlight")}</p>
              <h3 className="mt-4 font-display text-4xl">{featured.name}</h3>
              {featured.detail.slice(0, 2).map((paragraph) => (
                <p key={paragraph} className="mt-4 text-sm leading-relaxed text-foreground/80">
                  {tx(paragraph)}
                </p>
              ))}
              <span className="mt-6 inline-flex text-xs uppercase tracking-widest text-primary">{tx("View details")}</span>
            </div>
            {featured.logo && (
              <div className="flex min-h-64 items-center justify-center rounded-lg border border-border/60 bg-surface-elevated/70 p-10">
                <img
                  src={logoMap[featured.logo]}
                  alt={featured.name}
                  loading="lazy"
                  width={420}
                  height={220}
                  className="max-h-36 w-full object-contain"
                />
              </div>
            )}
          </motion.button>
        )}

        <PartnerGrid title="Group companies" partners={groupCompanies} openPartner={openPartner} tx={tx} />
        <PartnerGrid title="Strategic partners" partners={strategicPartners} openPartner={openPartner} tx={tx} />
      </div>
    </section>
  );
}

function PartnerGrid({
  title,
  partners: items,
  openPartner,
  tx,
}: {
  title: string;
  partners: Partner[];
  openPartner: (partner: Partner) => void;
  tx: (text: string) => string;
}) {
  if (items.length === 0) return null;

  return (
    <div className="mb-10 last:mb-0">
      <h3 className="scroll-reveal mb-5 font-display text-2xl">{tx(title)}</h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((partner) => (
          <motion.button
            key={partner.name}
            onClick={() => openPartner(partner)}
            className={`scroll-reveal mac-card group flex min-h-[180px] flex-col justify-between p-7 text-left ${partner.featured ? "ring-1 ring-primary/35" : ""}`}
            whileHover={premiumSurfaceHover}
            whileTap={premiumPress}
          >
            <div>
              {partner.logo && (
                <div className="mb-6 flex h-16 items-center justify-start rounded-md bg-surface-elevated/70 p-3">
                  <img
                    src={logoMap[partner.logo]}
                    alt={partner.name}
                    loading="lazy"
                    width={180}
                    height={80}
                    className="max-h-10 w-full object-contain object-left"
                  />
                </div>
              )}
              <p className="font-display text-xl">{partner.name}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{tx(partner.summary)}</p>
            </div>
            <span className="mt-4 inline-block text-[11px] uppercase tracking-widest text-primary">
              {tx("Open profile")}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
