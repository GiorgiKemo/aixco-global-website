import { journeys } from "@/data/site";
import { useUI } from "../ui-state";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { premiumPress, premiumSurfaceHover } from "@/lib/motion";
import { useI18n } from "@/i18n/I18nProvider";

export function HowItWorks() {
  const { openJourney, openRegister } = useUI();
  const { tx } = useI18n();
  const navigate = useNavigate();

  const handlePartnersClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    navigate("/#partners");
  };

  return (
    <section id="how" className="relative scroll-mt-16 py-16 md:scroll-mt-20 md:py-20 lg:py-24">
      <div className="container-x">
        <div className="scroll-reveal mb-12 max-w-4xl">
          <p className="eyebrow">{tx("Journeys")}</p>
          <h2 className="heading-section mt-5">{tx("How AIXCO Works")}</h2>
          <p className="mt-6 max-w-3xl text-foreground/80 leading-relaxed">
            {tx("Choose the journey that fits your role. Whether you are investing directly, distributing products, or bringing projects to market, the process is structured, transparent, and digitally managed.")}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {journeys.map((j, i) => (
            <motion.button
              key={j.role}
              onClick={() => openJourney(j)}
              className="scroll-reveal mac-card group flex min-h-[285px] flex-col justify-between p-7 text-left"
              whileHover={premiumSurfaceHover}
              whileTap={premiumPress}
            >
              <div>
                <p className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{tx(j.tag ?? `Journey 0${i + 1}`)}</p>
                <h3 className="font-display mt-3 text-2xl leading-tight [overflow-wrap:anywhere]">{tx(j.role)}</h3>
                <p className="mt-3 text-base leading-relaxed text-foreground/78">{tx(j.summary)}</p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="sr-only">{tx(j.role)}</span>
                <ArrowUpRight className="h-4 w-4 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
            </motion.button>
          ))}
        </div>

        <div className="scroll-reveal mt-10 flex flex-wrap gap-3">
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
