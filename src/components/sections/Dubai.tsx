import { dubaiFunds } from "@/data/site";
import { motion, useReducedMotion } from "framer-motion";
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
  { src: aixcoLiveVideos.fundOne, title: "Fund I Eden House The Canal & Eden House The Park", poster: aixcoLiveImages.dubaiEdenHouse },
  { src: aixcoLiveVideos.fundTwo, title: "Fund II Dubai Healthcare City", poster: aixcoLiveImages.dubaiHealthcare },
  { src: aixcoLiveVideos.fundThree, title: "Fund I Eden House The Canal & Eden House The Park", poster: aixcoLiveImages.dubaiEdenHouse },
];

const fundImageAspectClass: Record<string, string> = {
  "dubai-eden": "aspect-video",
  "dubai-healthcare": "aspect-[2/3]",
};

function galleryAspectClass(src: string) {
  if (src.endsWith("/fund1.png")) return "aspect-[2/3]";
  if (src.endsWith("/fund8.jpeg") || src.endsWith("/fund20.jpeg")) return "aspect-[9/16]";
  if (src.endsWith("/fund4.jpeg")) return "aspect-[4/3]";
  return "aspect-video";
}

export function Dubai() {
  const { tx } = useI18n();
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="dubai" className="relative py-20 md:py-28 lg:py-36 scroll-mt-0 bg-surface/40">
      <div className="container-x">
        <div className="scroll-reveal mb-14">
          <p className="eyebrow">{tx("Dubai")}</p>
          <h2 className="heading-section mt-5 max-w-2xl">{tx("Dubai")}</h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          {dubaiFunds.map((fund, idx) => (
            <motion.article
              key={fund.id}
              className="scroll-reveal mac-card group relative overflow-hidden"
              whileHover={premiumSurfaceHover}
              whileTap={premiumPress}
            >
              <div className="grid overflow-hidden bg-border/50 md:grid-cols-2">
                <div className={`relative overflow-hidden bg-muted ${fundImageAspectClass[fund.image] ?? "aspect-video"}`}>
                  <img
                    src={imageMap[fund.image]}
                    alt={tx(fund.name)}
                    loading="lazy"
                    decoding="async"
                    width={1536}
                    height={960}
                    className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-[1.02]"
                  />
                </div>
                <LiveVideo
                  src={videoMap[fund.video]}
                  title={tx(fund.name)}
                  poster={imageMap[fund.image]}
                  className={`${fund.image === "dubai-healthcare" ? "aspect-[2/3]" : "aspect-video"} rounded-none shadow-none`}
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

        <div className="scroll-reveal mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.18fr)_minmax(300px,0.82fr)] lg:items-start">
          <div
            className="columns-1 gap-4 sm:columns-2"
            aria-label="Fund I Eden House gallery"
            data-layout="dense-masonry"
          >
            {aixcoFundGallery.map((src, index) => (
              <motion.figure
                key={src}
                className={`group mb-4 break-inside-avoid overflow-hidden rounded-lg bg-background shadow-soft ${galleryAspectClass(src)}`}
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.985 }}
                whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.22, margin: "0px 0px -10% 0px" }}
                transition={{
                  duration: shouldReduceMotion ? 0.35 : 0.72,
                  ease: shouldReduceMotion ? "easeOut" : [0.16, 1, 0.3, 1],
                  delay: shouldReduceMotion ? 0 : (index % 3) * 0.05,
                }}
              >
                <img
                  src={src}
                  alt={`Fund I Eden House gallery ${index + 1}`}
                  loading="lazy"
                  decoding="async"
                  width={1280}
                  height={720}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              </motion.figure>
            ))}
          </div>
          <div
            className="grid grid-cols-3 gap-3 lg:sticky lg:top-24 lg:h-[calc(100svh-8rem)] lg:max-h-[calc(100svh-8rem)] lg:grid-cols-1 lg:grid-rows-3"
            aria-label="Dubai fund videos"
            data-layout="viewport-fit-video-rail"
          >
            {fundVideos.map((video) => (
              <LiveVideo
                key={video.src}
                src={video.src}
                title={tx(video.title)}
                poster={video.poster}
                className="aspect-video lg:aspect-auto lg:h-full lg:min-h-0"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
