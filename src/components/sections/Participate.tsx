import { Check, ArrowRight } from "lucide-react";
import { participationRoutes } from "@/data/site";
import { useUI } from "../ui-state";
import { motion } from "framer-motion";
import { CountUpText } from "@/components/CountUpText";
import { premiumPress, premiumSurfaceHover } from "@/lib/motion";

export function Participate() {
  const { openRegister } = useUI();
  return (
    <section id="participate" className="relative py-28 md:py-36 scroll-mt-24 bg-surface/40 noise-overlay overflow-hidden">
      <div className="motion-accent-line absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="container-x">
        <div className="scroll-reveal max-w-3xl mb-16">
          <p className="eyebrow">Ways to Participate</p>
          <h2 className="heading-section mt-5">Two routes. One platform. <span className="text-gold italic">Your fit</span>.</h2>
          <p className="mt-6 text-foreground/80 leading-relaxed">
            Choose the structure that matches your horizon, ticket size and risk appetite — bond income from €1,000, or freehold property from €50,000.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {participationRoutes.map((r, i) => (
            <motion.article
              key={r.id}
              className="scroll-reveal mac-card group relative p-8 md:p-10"
              whileHover={premiumSurfaceHover}
              whileTap={premiumPress}
            >
              <div className="flex items-baseline justify-between mb-6">
                <span className="font-display text-6xl text-primary/30">0{i + 1}</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  <CountUpText value={r.term} />
                </span>
              </div>
              <h3 className="font-display text-3xl md:text-4xl">{r.title}</h3>
              <div className="mt-5 flex items-end gap-6 border-y border-border/60 py-5">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Yield</p>
                  <p className="font-display text-3xl text-gold mt-1">
                    <CountUpText value={r.coupon} />
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">From</p>
                  <p className="font-display text-3xl mt-1">
                    <CountUpText value={r.minTicket} />
                  </p>
                </div>
              </div>
              <ul className="mt-6 space-y-3">
                {r.bullets.map((b) => (
                  <li key={b} className="flex gap-3 text-sm text-foreground/85">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <motion.button
                onClick={openRegister}
                className="btn-gold mt-8 w-full sm:w-auto"
                whileHover={{ y: -2, scale: 1.012 }}
                whileTap={premiumPress}
              >
                {r.cta} <ArrowRight className="h-4 w-4" />
              </motion.button>
            </motion.article>
          ))}
        </div>

        <p className="scroll-reveal mt-10 max-w-3xl rounded-lg border border-border/40 bg-background/60 p-4 text-xs leading-relaxed text-muted-foreground shadow-soft backdrop-blur">
          <strong className="text-foreground/80">Important:</strong> Real-estate participation involves risk, including possible loss of capital. Returns are
          not guaranteed and depend on market conditions, project execution, individual tax situation and regulatory suitability.
          Please review the relevant prospectus and obtain advice from a regulated financial advisor before participating.
        </p>
      </div>
    </section>
  );
}
