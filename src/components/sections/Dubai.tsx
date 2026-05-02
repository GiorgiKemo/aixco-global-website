import { dubaiFunds } from "@/data/site";
import { motion } from "framer-motion";
import { premiumPress, premiumSurfaceHover } from "@/lib/motion";
import { aixcoFundGallery, aixcoLiveImages, aixcoLiveVideos } from "@/lib/aixco-live-assets";
import { useI18n } from "@/i18n/I18nProvider";
import { LiveVideo } from "@/components/LiveVideo";

const imageMap: Record<string, string> = {
  "dubai-eden": aixcoLiveImages.dubaiEdenHouse,
  "dubai-healthcare": aixcoLiveImages.dubaiHealthcare,
};

const videoMap: Record<string, string> = {
  fundOne: aixcoLiveVideos.fundOne,
  fundTwo: aixcoLiveVideos.fundTwo,
};

const fundVideos = [
  { src: aixcoLiveVideos.fundOne, title: "Fund I Eden House The Canal & Eden House The Park" },
  { src: aixcoLiveVideos.fundTwo, title: "Fund II Dubai Healthcare City" },
  { src: aixcoLiveVideos.fundThree, title: "Fund I Eden House The Canal & Eden House The Park" },
];

export function Dubai() {
  const { tx } = useI18n();

  return (
    <section id="dubai" className="relative py-28 md:py-36 scroll-mt-24 bg-surface/40">
      <div className="container-x">
        <div className="scroll-reveal mb-14">
          <p className="eyebrow">{tx("Dubai")}</p>
          <h2 className="heading-section mt-5 max-w-2xl">{tx("Dubai")}</h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {dubaiFunds.map((fund, idx) => (
            <motion.article
              key={fund.id}
              className="scroll-reveal mac-card group relative overflow-hidden"
              whileHover={premiumSurfaceHover}
              whileTap={premiumPress}
            >
              <div className="grid overflow-hidden bg-border/50 md:grid-cols-2">
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={imageMap[fund.image]}
                    alt={tx(fund.name)}
                    loading="lazy"
                    width={1536}
                    height={960}
                    className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-[1.035]"
                  />
                </div>
                <LiveVideo
                  src={videoMap[fund.video]}
                  title={tx(fund.name)}
                  poster={imageMap[fund.image]}
                  className="aspect-[16/10] rounded-none shadow-none"
                />
                <span className="absolute right-4 top-4 font-display text-5xl text-primary/70 drop-shadow-[0_2px_12px_rgb(255_255_255/0.45)]">
                  0{idx + 1}
                </span>
              </div>
              <div className="p-7 md:p-8">
                <h3 className="font-display text-3xl md:text-4xl">{tx(fund.name)}</h3>
                <ul className="mt-6 space-y-3 border-t border-border/60 pt-5">
                  {fund.details.map((detail) => (
                    <li key={detail} className="text-sm leading-relaxed text-foreground/80">
                      {tx(detail)}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="scroll-reveal mt-10 grid gap-4 lg:grid-cols-[1fr_0.88fr]">
          <div className="mac-card overflow-hidden p-4">
            <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]" aria-label="Fund I Eden House gallery">
              {aixcoFundGallery.map((src, index) => (
                <img
                  key={src}
                  src={src}
                  alt={`Fund I Eden House gallery ${index + 1}`}
                  loading="lazy"
                  width={320}
                  height={220}
                  className="h-40 w-64 shrink-0 rounded-md object-cover shadow-soft md:h-48 md:w-80"
                />
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {fundVideos.map((video) => (
              <LiveVideo
                key={video.src}
                src={video.src}
                title={tx(video.title)}
                className="aspect-video"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
