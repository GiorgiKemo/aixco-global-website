import { ArrowUpRight } from "lucide-react";
import { useSiteContent } from "@/data/site-content-context";
import type { SiteContent } from "@/lib/backend/site-content";
import { getSafeAixcoNewsUrl } from "@/lib/security/urls";
import { useI18n } from "@/i18n/I18nProvider";

type NewsTickerItem = SiteContent["newsTickerItems"][number];

export function NewsTicker() {
  const { newsTickerItems } = useSiteContent();
  const { tx } = useI18n();

  return (
    <section
      aria-label={tx("Latest news")}
      data-section="news-ticker"
      className="news-ticker relative isolate overflow-hidden border-y border-white/10"
    >
      <div className="container-x">
        <div className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:gap-5">
          <div className="flex shrink-0 items-center gap-3">
            <span className="news-ticker-badge">{tx("Latest")}</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/58">
              {tx("Agency feed")}
            </span>
          </div>

          <div className="news-ticker-marquee min-w-0 flex-1" aria-live="polite">
            <div className="news-ticker-track">
              {[false, true].map((isClone) => (
                <div
                  key={isClone ? "clone" : "primary"}
                  data-testid="news-ticker-set"
                  className="news-ticker-set"
                  aria-hidden={isClone ? "true" : undefined}
                >
                  {newsTickerItems.map((item) => (
                    <NewsTickerLink key={`${isClone ? "clone" : "primary"}-${item.id}`} item={item} isClone={isClone} tx={tx} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NewsTickerLink({ item, isClone, tx }: { item: NewsTickerItem; isClone: boolean; tx: (copy: string) => string }) {
  const href = getSafeAixcoNewsUrl(item.href, "https://www.aixco.global/op2/");

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      tabIndex={isClone ? -1 : undefined}
      className="news-ticker-card group"
    >
      <span className="news-ticker-meta">
        {tx(item.source)}
        <span aria-hidden="true">/</span>
        {item.date}
      </span>
      <span className="news-ticker-title">{tx(item.title)}</span>
      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-primary-glow/80 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </a>
  );
}
