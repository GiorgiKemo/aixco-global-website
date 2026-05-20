import type { LucideIcon } from "lucide-react";
import type { Translate } from "./dubai-data";

type DubaiHighlightItemProps = {
  icon: LucideIcon;
  title: string;
  content: string;
  compact?: boolean;
  tx: Translate;
};

export function DubaiHighlightItem({
  icon: Icon,
  title,
  content,
  compact = false,
  tx,
}: DubaiHighlightItemProps) {
  return (
    <li className={`${compact ? "space-y-2.5" : "space-y-3"} min-w-0`}>
      <div className="flex min-w-0 items-start gap-3">
        <span data-fund-detail-icon className="flex size-7 shrink-0 items-center justify-center rounded-full border border-foreground/10 bg-white/70">
          <Icon size={14} className="text-primary" strokeWidth={1.9} />
        </span>
        <span className={`${compact ? "text-[0.68rem]" : "text-[0.72rem]"} min-w-0 font-bold uppercase leading-[1.35] tracking-[0.12em] text-muted-foreground [overflow-wrap:anywhere] min-[1280px]:tracking-[0.16em] min-[1440px]:tracking-[0.18em]`}>
          {tx(title)}
        </span>
      </div>
      <p className={`max-w-full font-medium text-foreground/78 [overflow-wrap:anywhere] ${compact ? "text-[0.92rem] leading-[1.48]" : "text-[0.98rem] leading-relaxed"}`}>
        {tx(content)}
      </p>
    </li>
  );
}
