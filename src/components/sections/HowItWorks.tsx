import { journeys } from "@/data/site";
import { useUI } from "../ui-state";
import { ArrowUpRight } from "lucide-react";

export function HowItWorks() {
  const { openJourney } = useUI();
  return (
    <section id="how" className="relative py-28 md:py-36 scroll-mt-24">
      <div className="container-x">
        <div className="scroll-reveal max-w-3xl mb-16">
          <p className="eyebrow">How AIXCO Works</p>
          <h2 className="heading-section mt-5">Four journeys. <span className="text-gold italic">Six steps</span>. Full transparency.</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {journeys.map((j, i) => (
            <button
              key={j.role}
              onClick={() => openJourney(j)}
              className="scroll-reveal mac-card group flex min-h-[260px] flex-col justify-between p-7 text-left"
            >
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Journey 0{i + 1}</p>
                <h3 className="font-display text-2xl mt-3">{j.role}</h3>
                <p className="mt-3 text-sm text-foreground/75 leading-relaxed">{j.summary}</p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-xs text-primary uppercase tracking-widest">View 6 steps</span>
                <ArrowUpRight className="h-4 w-4 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
