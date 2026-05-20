import { motion } from "@/lib/framer-motion";
import type { Translate } from "./dubai-data";

type DubaiStatCardProps = {
  label: string;
  value: string;
  subtext?: string;
  highlight?: boolean;
  compact?: boolean;
  tx: Translate;
};

export function DubaiStatCard({
  label,
  value,
  subtext,
  highlight = false,
  compact = false,
  tx,
}: DubaiStatCardProps) {
  return (
    <motion.div
      data-fund-highlight-tile
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`group flex flex-col justify-between border transition-[background-color,border-color,box-shadow,color] duration-200 ${
        compact ? "min-h-[6.25rem] min-w-0 p-3.5 md:min-h-[6.45rem] lg:min-h-[6.6rem] lg:p-4" : "min-h-[8.8rem] min-w-0 p-5 md:min-h-[9.4rem] lg:p-6"
      } ${
        highlight
          ? "border-foreground bg-foreground text-background"
          : "border-foreground/10 bg-white hover:bg-surface/45"
      }`}
    >
      <div>
        <span
          className={`${compact ? "mb-3.5 text-[0.68rem]" : "mb-5 text-[0.72rem]"} block max-w-full font-bold uppercase leading-[1.35] tracking-[0.14em] [overflow-wrap:anywhere] min-[1280px]:tracking-[0.18em] min-[1440px]:tracking-[0.22em] ${
            highlight ? "text-primary-glow" : "text-muted-foreground"
          }`}
        >
          {tx(label)}
        </span>
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-1">
          {value && (
            <span
              className={`font-display ${
                compact ? "text-[clamp(2.18rem,3vw,3.12rem)]" : "text-[clamp(2.55rem,3.6vw,3.75rem)]"
              } font-semibold leading-none tracking-tight ${highlight ? "text-primary-glow" : "text-foreground"}`}
            >
              {tx(value)}
            </span>
          )}
          {subtext && (
            <span className={`text-sm font-medium leading-none ${highlight ? "text-background/70" : "text-foreground/60"}`}>
              {tx(subtext)}
            </span>
          )}
        </div>
      </div>
      <div className={`${compact ? "mt-3" : "mt-7"} h-px w-8 transition-[width,background-color] [transition-duration:400ms] group-hover:w-full ${highlight ? "bg-primary-glow" : "bg-foreground/20"}`} />
    </motion.div>
  );
}
