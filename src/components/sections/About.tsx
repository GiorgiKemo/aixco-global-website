import { metrics } from "@/data/site";
import { CountUpText } from "@/components/CountUpText";
import { aixcoLiveImages } from "@/lib/aixco-live-assets";
import { useI18n } from "@/i18n/I18nProvider";

export function About() {
  const { tx } = useI18n();

  return (
    <section id="about" className="relative py-28 md:py-36 scroll-mt-24">
      <div className="motion-accent-line absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="container-x grid gap-16 lg:grid-cols-12">
        <div className="scroll-reveal lg:col-span-5 lg:sticky lg:top-28 self-start">
          <p className="eyebrow">{tx("About AIXCO")}</p>
          <h2 className="heading-section mt-5">{tx("AIXCO - Product Powerhouse")}</h2>
          <p className="mt-6 text-foreground/80 leading-relaxed">
            {tx("Established in 2009, AIXCO is a disciplined real estate holding company with a strong track record across property and financial investments. Headquartered in Vienna and operating in Dubai and Batumi, AIXCO Global specializes in structuring and co-investing in portfolios, guided by a commitment to long-term value creation and enduring investor trust.")}
          </p>
          <div className="mac-card mt-8 overflow-hidden">
            <img src={aixcoLiveImages.aboutArchitecture} alt="Batumi skyline and landmark towers from the live AIXCO site" loading="lazy" decoding="async" className="w-full h-72 object-cover" width={790} height={1024}/>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="scroll-reveal grid sm:grid-cols-2 gap-px overflow-hidden rounded-lg bg-border/50">
            {metrics.map((m, i) => (
              <div key={i} className="mac-tile p-7 md:p-8">
                <p className="font-display text-4xl md:text-5xl text-gold leading-none">
                  <CountUpText value={m.value} />
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">{tx(m.label)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
