import { team } from "@/data/site";
import { useUI } from "../ui-state";
import { motion } from "framer-motion";
import { premiumPress, premiumSurfaceHover } from "@/lib/motion";
import { aixcoLiveImages } from "@/lib/aixco-live-assets";
import { useI18n } from "@/i18n/I18nProvider";

const imageMap: Record<string, string> = {
  "team-benjamin": aixcoLiveImages.teamBenjamin,
  "team-owais": aixcoLiveImages.teamOwais,
  "team-walter": aixcoLiveImages.teamWalter,
};

export function Team() {
  const { openTeam } = useUI();
  const { tx } = useI18n();

  return (
    <section id="team" className="relative scroll-mt-16 bg-surface/40 py-16 md:scroll-mt-20 md:py-20 lg:py-24">
      <div className="container-x">
        <div className="scroll-reveal mb-16 max-w-4xl">
          <p className="eyebrow">{tx("Our Team")}</p>
          <h2 className="heading-section mt-5">{tx("Our Team")}</h2>
          <p className="mt-6 max-w-3xl text-[clamp(1.12rem,1.02rem+0.42vw,1.34rem)] leading-relaxed text-foreground/82">
            {tx("Meet the leadership team shaping AIXCO’s strategic direction, partnerships, and distribution platform.")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {team.map((m) => (
            <motion.button
              key={m.name}
              onClick={() => openTeam(m)}
              className="scroll-reveal mac-card group overflow-hidden text-left"
              whileHover={premiumSurfaceHover}
              whileTap={premiumPress}
            >
              <div className="relative aspect-[9/10] overflow-hidden bg-muted">
                <img
                  src={imageMap[m.image]}
                  alt={m.name}
                  loading="lazy"
                  decoding="async"
                  width={832}
                  height={1024}
                  className="h-full w-full object-cover grayscale transition-[filter,transform] [transition-duration:400ms] group-hover:grayscale-0 group-hover:scale-[1.025]"
                />
              </div>
              <div className="p-6">
                <p className="font-display text-2xl">{m.name}</p>
                <p className="text-sm text-primary mt-1">{tx(m.role)}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{tx(m.summary)}</p>
                <span className="mt-5 inline-flex text-xs uppercase tracking-widest text-primary">{tx("View profile")}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
