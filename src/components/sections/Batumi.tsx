import { useState } from "react";
import { batumiBenefits, batumiProperties } from "@/data/site";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { premiumPress, premiumSurfaceHover } from "@/lib/motion";
import { aixcoLiveImages, aixcoLiveVideos } from "@/lib/aixco-live-assets";
import { useI18n } from "@/i18n/I18nProvider";
import { LiveVideo } from "@/components/LiveVideo";

const imageMap: Record<string, string> = {
  "batumi-queens": aixcoLiveImages.batumiQueens,
  "batumi-serenade": aixcoLiveImages.batumiSerenade,
};

const propertyVideos = [
  { src: aixcoLiveVideos.tempo, title: "Queens", poster: aixcoLiveImages.batumiQueens },
  { src: aixcoLiveVideos.guru, title: "Serenade", poster: aixcoLiveImages.batumiSerenade },
];

export function Batumi() {
  const [selected, setSelected] = useState(batumiProperties[0].id);
  const { tx } = useI18n();
  const property = batumiProperties.find((item) => item.id === selected) ?? batumiProperties[0];

  return (
    <section id="batumi" className="relative py-28 md:py-36 scroll-mt-24">
      <div className="container-x">
        <div className="scroll-reveal grid gap-12 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-6">
            <p className="eyebrow">{tx("Batumi")}</p>
            <h2 className="heading-section mt-5">{tx("Batumi")}</h2>
            <p className="mt-6 max-w-2xl text-foreground/80 leading-relaxed">
              {tx("Georgia sits at the crossroads of Europe and Asia, maintaining strong relationships with neighboring countries as well as with the EU, the United States, and Asian markets. Batumi offers a rare opportunity to enter an emerging market that is steadily aligning with the highest standards in safety, education, and transparency. At the same time, it benefits from a flexible, low-regulation environment and strong long-term growth potential.")}
            </p>
          </div>
          <div className="lg:col-span-6">
            <LiveVideo
              src={aixcoLiveVideos.batumiOverview}
              title={tx("Batumi")}
              poster={aixcoLiveImages.batumiSerenade}
              className="mb-5 aspect-video"
            />
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg bg-border/50 sm:grid-cols-2">
              {batumiBenefits.map((benefit) => (
                <div key={benefit} className="mac-tile p-5">
                  <p className="text-sm leading-relaxed text-foreground/85">{tx(benefit)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="scroll-reveal lg:col-span-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {batumiProperties.map((item) => {
                const active = item.id === selected;
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    onClick={() => setSelected(item.id)}
                    className={`w-full rounded-lg border p-5 text-left shadow-soft transition-all duration-300 ${
                      active
                        ? "border-primary/60 bg-primary/10"
                        : "border-border/60 bg-background/60 hover:border-primary/40 hover:bg-background/80"
                    }`}
                    whileHover={premiumSurfaceHover}
                    whileTap={premiumPress}
                  >
                    <span className="font-display text-2xl">{tx(item.name)}</span>
                  </motion.button>
                );
              })}
            </div>
            <a
              href={property.url}
              target="_blank"
              rel="noreferrer"
              className="btn-gold mt-6 w-full justify-center sm:w-auto"
            >
              {tx(property.name)} <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="scroll-reveal grid gap-4 lg:col-span-7 md:grid-cols-[1fr_0.84fr]">
            <div className="mac-card relative aspect-[4/5] overflow-hidden md:aspect-[5/4]">
              <img
                key={property.id}
                src={imageMap[property.image]}
                alt={tx(property.name)}
                loading="lazy"
                decoding="async"
                width={1280}
                height={896}
                className="h-full w-full object-cover animate-fade-in"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/72 via-black/36 to-transparent p-6 text-white md:p-8">
                <p className="font-display text-3xl drop-shadow-[0_3px_16px_rgb(0_0_0/0.42)]">{tx(property.name)}</p>
              </div>
            </div>
            <div className="grid gap-4">
              {propertyVideos.map((video) => (
                <LiveVideo
                  key={video.src}
                  src={video.src}
                  title={tx(video.title)}
                  poster={video.poster}
                  className="aspect-video md:min-h-0"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
