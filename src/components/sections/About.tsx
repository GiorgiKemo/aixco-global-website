import { CountUpText } from "@/components/CountUpText";
import { aixcoLiveImages } from "@/lib/aixco-live-assets";
import { useI18n } from "@/i18n/I18nProvider";
import { useSiteContent } from "@/data/site-content-context";

export function About() {
  const { tx } = useI18n();
  const { metrics } = useSiteContent();

  return (
    <section id="about" className="relative scroll-mt-16 py-16 md:scroll-mt-20 md:py-20 lg:flex lg:min-h-[calc(100svh-5rem)] lg:items-center lg:py-0">
      <div className="motion-accent-line absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div
        data-section-layout="about-balanced-two-column"
        className="container-x grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.28fr)] lg:items-center xl:gap-14"
      >
        <div aria-label="About AIXCO story and media" className="scroll-reveal self-start lg:self-center">
          <p className="eyebrow">{tx("About AIXCO")}</p>
          <h2
            data-scale="reduced"
            className="mt-5 max-w-xl font-display text-[2.35rem] font-semibold leading-[1.04] tracking-normal text-foreground md:text-[2.45rem] lg:text-[clamp(2rem,2.25vw,2.85rem)]"
          >
            {tx("AIXCO - Product Powerhouse")}
          </h2>
          <p className="mt-5 max-w-[38rem] text-base leading-relaxed text-foreground/80 md:text-lg lg:text-[1.05rem]">
            {tx("Established in 2009, AIXCO is a disciplined real estate holding company with a strong track record across property and financial investments. Headquartered in Vienna and operating in Dubai and Batumi, AIXCO Global specializes in structuring and co-investing in portfolios, guided by a commitment to long-term value creation and enduring investor trust.")}
          </p>
          <div className="mac-card mt-7 overflow-hidden lg:mt-6">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/40">
              <img
                src={aixcoLiveImages.aboutArchitecture}
                alt="Batumi skyline and landmark towers from the live AIXCO site"
                data-frame="tall"
                data-image-treatment="fill-card"
                loading="lazy"
                decoding="async"
                className="relative z-10 h-full w-full object-cover object-center"
                width={1448}
                height={1086}
              />
            </div>
          </div>
        </div>

        <div aria-label="AIXCO performance metrics" data-density="compact" className="lg:self-center">
          <div className="scroll-reveal grid gap-px overflow-hidden rounded-lg bg-border/50 sm:grid-cols-2">
            {metrics.map((m, i) => (
              <div key={i} className="mac-tile min-h-[7.2rem] p-5 md:p-6 lg:min-h-[7.6rem] xl:p-7">
                <p className="font-display text-4xl leading-none text-gold md:text-[2.8rem] lg:text-[clamp(2.35rem,3.2vw,3.35rem)]">
                  <CountUpText value={m.value} />
                </p>
                <p className="mt-3 text-xs uppercase leading-relaxed tracking-[0.14em] text-muted-foreground [overflow-wrap:anywhere]">
                  {tx(m.label)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
