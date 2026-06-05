"use client";

import { useSiteContent } from "@/data/site-content-context";
import { useUI } from "../ui-state";
import { useI18n } from "@/i18n/I18nProvider";
import { PartnerMarquee } from "@/components/partners/PartnerMarquee";

export function Partners() {
  const { openPartner } = useUI();
  const { tx } = useI18n();
  const { partners } = useSiteContent();
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
