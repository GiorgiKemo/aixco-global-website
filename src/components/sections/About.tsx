import { metrics } from "@/data/site";
import { CountUpText } from "@/components/CountUpText";
import { aixcoLiveImages } from "@/lib/aixco-live-assets";

export function About() {
  return (
    <section id="about" className="relative py-28 md:py-36 scroll-mt-24">
      <div className="motion-accent-line absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="container-x grid gap-16 lg:grid-cols-12">
        <div className="scroll-reveal lg:col-span-5 lg:sticky lg:top-28 self-start">
          <p className="eyebrow">About AIXCO</p>
          <h2 className="heading-section mt-5">
            A product powerhouse in private real estate{" "}
            <span className="text-gold italic">
              since <CountUpText value="2009" />
            </span>
            .
          </h2>
          <p className="mt-6 text-foreground/80 leading-relaxed">
            From our headquarters in Vienna and offices in Dubai and Batumi, AIXCO Global designs,
            structures and distributes private real-estate participations. Sixteen years, three offices,
            one discipline: institutional standards, made accessible.
          </p>
          <div className="mac-card mt-8 overflow-hidden">
            <img src={aixcoLiveImages.aboutArchitecture} alt="Batumi skyline and landmark towers from the live AIXCO site" loading="lazy" className="w-full h-72 object-cover" width={790} height={1024}/>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="scroll-reveal grid sm:grid-cols-2 gap-px overflow-hidden rounded-lg bg-border/50">
            {metrics.map((m, i) => (
              <div key={i} className="mac-tile p-7 md:p-8">
                <p className="font-display text-4xl md:text-5xl text-gold leading-none">
                  <CountUpText value={m.value} />
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 grid sm:grid-cols-3 gap-4">
            {["Vienna", "Dubai", "Batumi"].map((city) => (
              <div key={city} className="scroll-reveal data-panel">
                <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Office</p>
                <p className="mt-2 font-display text-2xl">{city}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
