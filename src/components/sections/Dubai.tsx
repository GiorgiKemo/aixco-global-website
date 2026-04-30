import { dubaiFunds } from "@/data/site";
import edenHouse from "@/assets/dubai-eden-house.jpg";
import healthcare from "@/assets/dubai-healthcare.jpg";
import { ArrowUpRight } from "lucide-react";

const imageMap: Record<string, string> = {
  "dubai-eden": edenHouse,
  "dubai-healthcare": healthcare,
};

export function Dubai() {
  return (
    <section id="dubai" className="relative py-28 md:py-36 scroll-mt-24 bg-surface/40">
      <div className="container-x">
        <div className="scroll-reveal flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <p className="eyebrow">Dubai · Funds</p>
            <h2 className="heading-section mt-5 max-w-2xl">
              Branded residences and regulated districts, <span className="text-gold italic">curated</span>.
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Two live AIXCO funds give participants exposure to two of Dubai's strongest growth corridors —
            the Water Canal and the regulated Healthcare City free zone.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {dubaiFunds.map((f, idx) => (
            <article key={f.id} className="scroll-reveal mac-card group relative overflow-hidden">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={imageMap[f.image]}
                  alt={`${f.name} — ${f.location}`}
                  loading="lazy"
                  width={1536}
                  height={960}
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-[1.035]"
                />
                <span className={`absolute top-4 left-4 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest shadow-soft ${f.status === "Live" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                  {f.status}
                </span>
                <span className="absolute top-4 right-4 font-display text-5xl text-primary/70 drop-shadow-[0_2px_12px_rgb(255_255_255/0.45)]">0{idx + 1}</span>
              </div>
              <div className="p-7 md:p-8">
                <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">{f.location}</p>
                <h3 className="font-display text-3xl md:text-4xl mt-2">{f.name}</h3>
                <p className="mt-4 text-sm text-foreground/80 leading-relaxed">{f.summary}</p>
                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border/60 pt-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Target return</p>
                    <p className="font-display text-xl text-gold mt-1">{f.targetReturn}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Horizon</p>
                    <p className="font-display text-xl mt-1">{f.horizon}</p>
                  </div>
                </div>
                <a href="#contact" className="mt-6 inline-flex items-center gap-2 text-sm text-primary link-underline">
                  Request the prospectus <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
