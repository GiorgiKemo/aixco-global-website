"use client";

import { useSiteContent } from "@/data/site-content-context";
import { useUI } from "../ui-state";
import { ArrowUpRight } from "lucide-react";
import { motion } from "@/lib/framer-motion";
import { type MouseEvent } from "react";
import { premiumPress, premiumSurfaceHover } from "@/lib/motion";
import { useI18n } from "@/i18n/I18nProvider";
import { replaceLocationHash } from "@/lib/section-hash";
import { scrollToHash } from "@/lib/smooth-scroll";

export function HowItWorks() {
  const { openJourney, openRegister } = useUI();
  const { tx } = useI18n();
  const { journeys } = useSiteContent();

  const handlePartnersClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    replaceLocationHash("#partners");
    scrollToHash("#partners");
  };

  return (
    <section id="how" className="relative scroll-mt-16 py-14 md:scroll-mt-20 md:py-16 lg:flex lg:min-h-[calc(100svh-5rem)] lg:items-center lg:py-0">
      <div className="container-x lg:py-0">
        <div className="scroll-reveal mb-10 max-w-5xl">
          <p className="eyebrow">{tx("Journeys")}</p>
          <h2 className="heading-section mt-5 text-[clamp(2.4rem,3.8vw,3.55rem)] leading-[1.03] min-[1360px]:text-[clamp(2.75rem,4.1vw,4rem)]">{tx("How AIXCO Works")}</h2>
          <p className="mt-5 max-w-4xl text-[clamp(1rem,0.95vw,1.12rem)] leading-[1.62] text-foreground/80 min-[1360px]:text-[clamp(1.12rem,1.02vw,1.28rem)]">
            {tx("Choose the journey that fits your role. Whether you are buying property, brokering clients, administering a unit, or bringing projects to market, the process is structured, transparent, and digitally managed.")}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-4 min-[1360px]:gap-6">
          {journeys.map((j, i) => (
            <motion.button
              key={j.role}
              onClick={() => openJourney(j)}
              className="scroll-reveal mac-card group flex min-h-[21rem] flex-col justify-between p-8 text-left lg:min-h-[20rem] lg:p-6 min-[1360px]:min-h-[22rem] min-[1360px]:p-9"
              whileHover={premiumSurfaceHover}
              whileTap={premiumPress}
            >
              <div>
                <p className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground min-[1360px]:text-[0.82rem] min-[1360px]:tracking-[0.18em]">{tx(j.tag ?? `Journey 0${i + 1}`)}</p>
                <h3 className="font-display mt-3 text-[clamp(1.42rem,1.25vw,1.58rem)] leading-[1.1] [overflow-wrap:anywhere] min-[1360px]:mt-4 min-[1360px]:text-[clamp(1.7rem,1.45vw,2.05rem)] min-[1360px]:leading-[1.08]">{tx(j.role)}</h3>
                <p className="mt-3 text-[clamp(0.96rem,0.9vw,1.05rem)] leading-[1.6] text-foreground/78 min-[1360px]:mt-4 min-[1360px]:text-[clamp(1.06rem,0.98vw,1.18rem)] min-[1360px]:leading-[1.7]">{tx(j.summary)}</p>
              </div>
              <div className="mt-6 flex items-center justify-between min-[1360px]:mt-8">
                <span className="sr-only">{tx(j.role)}</span>
                <ArrowUpRight className="h-5 w-5 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
            </motion.button>
          ))}
        </div>

        <div className="scroll-reveal mt-8 flex flex-wrap gap-3">
          <a href="#partners" onClick={handlePartnersClick} className="btn-ghost-gold">
            {tx("Our Partners")}
          </a>
          <button type="button" onClick={openRegister} className="btn-gold">
            {tx("Register")}
          </button>
        </div>
      </div>
    </section>
  );
}
