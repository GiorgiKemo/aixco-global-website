import { team } from '@/data/site';
import { useI18n } from '@/i18n/I18nProvider';
import { aixcoLiveImages } from '@/lib/aixco-live-assets';
import { premiumPress, premiumSurfaceHover } from '@/lib/motion';
import { motion } from 'framer-motion';
import { useUI } from '../ui-state';

const imageMap: Record<string, string> = {
  'team-benjamin': aixcoLiveImages.teamBenjamin,
  'team-owais': aixcoLiveImages.teamOwais,
  'team-walter': aixcoLiveImages.teamWalter,
};

export function Team() {
  const { openTeam } = useUI();
  const { tx } = useI18n();

  return (
    <section
      id="team"
      className="relative scroll-mt-16 bg-surface/40 py-14 md:flex md:min-h-[calc(100svh-5rem)] md:items-center md:scroll-mt-20 md:py-0"
    >
      <div className="container-x md:py-0">
        <div className="scroll-reveal mb-4 max-w-5xl min-[1360px]:mb-5">
          <p className="eyebrow">{tx('Our Team')}</p>
          <h2 className="heading-section mt-4 text-[clamp(2.32rem,3.45vw,3.35rem)] leading-[1.03] min-[1360px]:text-[clamp(2.6rem,3.35vw,3.75rem)]">
            {tx('Our Team')}
          </h2>
          <p className="mt-3 max-w-[56rem] text-[clamp(1rem,0.92vw,1.1rem)] leading-[1.5] text-foreground/82 min-[1360px]:text-[clamp(1.04rem,0.96vw,1.16rem)]">
            {tx(
              'Meet the leadership team shaping AIXCO’s strategic direction, partnerships, and distribution platform.'
            )}
          </p>
        </div>

      <div className="mx-auto grid max-w-[56rem] gap-5 md:grid-cols-3 min-[1360px]:max-w-[66rem] min-[1536px]:max-w-[72rem] min-[1700px]:max-w-[78rem] min-[1360px]:gap-6">
          {team.map((m) => (
            <motion.button
              key={m.name}
              onClick={() => openTeam(m)}
              className="scroll-reveal mac-card group flex h-full flex-col overflow-hidden text-left"
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
              <div className="p-4 min-[1360px]:p-5">
                <p className="font-display text-[clamp(1.28rem,1.18vw,1.5rem)] leading-[1.12] min-[1360px]:text-[clamp(1.38rem,1.24vw,1.62rem)]">
                  {m.name}
                </p>
                <p className="mt-1.5 text-[0.9rem] text-primary min-[1360px]:text-[1.1rem]">
                  {tx(m.role)}
                </p>
                <p className="mt-2 text-[0.88rem] leading-[1.48] text-muted-foreground min-[1360px]:text-[1rem] min-[1360px]:leading-[1.52]">
                  {tx(m.summary)}
                </p>
                <span className="mt-4 inline-flex text-[0.72rem] uppercase tracking-widest text-primary min-[1360px]:text-[0.9rem]">
                  {tx('View profile')}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
