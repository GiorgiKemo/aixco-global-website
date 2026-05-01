import { useState } from "react";
import { batumiBenefits, batumiProperties } from "@/data/site";
import { MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { CountUpText } from "@/components/CountUpText";
import { premiumPress, premiumSurfaceHover } from "@/lib/motion";
import { aixcoLiveImages } from "@/lib/aixco-live-assets";

const imageMap: Record<string, string> = {
  "batumi-queens": aixcoLiveImages.batumiQueens,
  "batumi-serenade": aixcoLiveImages.batumiSerenade,
};

export function Batumi() {
  const [selected, setSelected] = useState(batumiProperties[0].id);
  const property = batumiProperties.find((p) => p.id === selected)!;

  return (
    <section id="batumi" className="relative py-28 md:py-36 scroll-mt-24">
      <div className="container-x">
        <div className="scroll-reveal grid lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-7">
            <p className="eyebrow">Batumi · Georgia</p>
            <h2 className="heading-section mt-5">
              The Black Sea's most <span className="text-gold italic">tax-efficient</span> coastal market.
            </h2>
            <p className="mt-6 text-foreground/80 leading-relaxed max-w-2xl">
              Batumi combines real tourism cash flow with one of the friendliest ownership regimes in Europe:
              full foreign ownership, capital gains exemption after two years, and rental tax of just 1% up to €180,000 of annual revenue.
            </p>
          </div>
          <div className="lg:col-span-5 grid grid-cols-3 gap-px overflow-hidden rounded-lg bg-border/50 self-start shadow-soft">
            {[
              { v: "€1.4k", l: "/m² prime" },
              { v: "76%", l: "occupancy" },
              { v: "+€78", l: "ADR" },
            ].map((s) => (
              <div key={s.l} className="mac-tile p-5 text-center">
                <p className="font-display text-2xl text-gold">
                  <CountUpText value={s.v} />
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits grid */}
        <div className="scroll-reveal grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-px overflow-hidden rounded-lg bg-border/50 mb-16 shadow-soft">
          {batumiBenefits.map((b) => (
            <div key={b.label} className="mac-tile p-5">
              <p className="font-display text-3xl text-gold leading-none">
                <CountUpText value={b.stat} />
              </p>
              <p className="mt-2 text-[11px] uppercase tracking-widest text-foreground/85">{b.label}</p>
              <p className="mt-1 text-[10px] text-muted-foreground leading-snug">{b.note}</p>
            </div>
          ))}
        </div>

        {/* Property selector */}
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="scroll-reveal lg:col-span-5">
            <p className="eyebrow mb-4">Featured properties</p>
            <h3 className="font-display text-3xl mb-6">Queens or Serenade.</h3>
            <div className="space-y-3">
              {batumiProperties.map((p) => {
                const active = p.id === selected;
                return (
                  <motion.button
                    key={p.id}
                    onClick={() => setSelected(p.id)}
                    className={`w-full rounded-lg border p-5 text-left shadow-soft transition-all duration-300 ${active ? "border-primary/60 bg-primary/10" : "border-border/60 bg-background/60 hover:border-primary/40 hover:bg-background/80"}`}
                    whileHover={premiumSurfaceHover}
                    whileTap={premiumPress}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-display text-2xl">{p.name}</p>
                        <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {p.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">From</p>
                        <p className="font-display text-xl text-gold">
                          <CountUpText value={p.priceFrom} />
                        </p>
                      </div>
                    </div>
                    {active && <p className="mt-4 text-sm text-foreground/80 leading-relaxed">{p.description}</p>}
                  </motion.button>
                );
              })}
            </div>
          </div>
          <div className="scroll-reveal lg:col-span-7">
            <div className="mac-card relative overflow-hidden aspect-[4/5] md:aspect-[5/4]">
              <img
                key={property.id}
                src={imageMap[property.image]}
                alt={`${property.name} in ${property.location}`}
                loading="lazy"
                width={1280}
                height={896}
                className="h-full w-full object-cover animate-fade-in"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/72 via-black/36 to-transparent p-6 text-white md:p-8">
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.28em] text-[#f0bd5d]">
                      <CountUpText value={property.delivery} />
                    </p>
                    <p className="font-display mt-1 text-3xl drop-shadow-[0_3px_16px_rgb(0_0_0/0.42)]">{property.name}</p>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-white/64">Net yield</p>
                      <p className="font-display text-2xl text-[#f0bd5d]">
                        <CountUpText value={property.yield} />
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-white/64">From</p>
                      <p className="font-display text-2xl">
                        <CountUpText value={property.priceFrom} />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
