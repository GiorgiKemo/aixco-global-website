"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { legacyTimelineChapters } from "@/data/legacy-timeline";
import { useI18n } from "@/i18n/I18nProvider";
import { replaceLocationHash } from "@/lib/section-hash";
import { scrollToHash } from "@/lib/smooth-scroll";
import type { MouseEvent } from "react";

function chapterAnchor(id: string) {
  if (id === "dubai") return "#dubai";
  if (id === "batumi") return "#batumi";
  return undefined;
}

export function LegacyTimeline() {
  const { tx } = useI18n();

  const handleChapterNav = (event: MouseEvent<HTMLAnchorElement>, hash: string) => {
    event.preventDefault();
    replaceLocationHash(hash);
    scrollToHash(hash);
  };

  return (
    <section
      id="legacy"
      aria-label="AIXCO legacy journey"
      className="relative scroll-mt-16 border-y border-border/70 bg-surface/30 py-16 md:scroll-mt-20 md:py-20 lg:py-24"
    >
      <div className="motion-accent-line absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
      <div className="container-x">
        <div className="scroll-reveal mb-10 max-w-3xl md:mb-12">
          <p className="eyebrow">{tx("Our journey")}</p>
          <h2 className="heading-section mt-4 max-w-2xl [overflow-wrap:anywhere]">
            {tx("From Switzerland to Dubai to Batumi")}
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/80 md:text-lg">
            {tx(
              "AIXCO buys, sells, and brokers real estate across markets. Our legacy track record in Switzerland and Dubai supports today's focus on Batumi apartment sales and property services.",
            )}
          </p>
        </div>

        <ol className="grid gap-6 lg:gap-8">
          {legacyTimelineChapters.map((chapter, index) => {
            const anchor = chapterAnchor(chapter.id);
            const isCurrent = chapter.status === "current";

            return (
              <li
                key={chapter.id}
                className={`scroll-reveal mac-card grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-start md:gap-8 md:p-8 lg:p-9 ${
                  isCurrent ? "border-primary/25 ring-1 ring-primary/15" : ""
                }`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="eyebrow">{tx(chapter.eyebrow)}</p>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${
                        isCurrent ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isCurrent ? tx("Current focus") : tx("Legacy")}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-[clamp(1.65rem,2.8vw,2.35rem)] leading-[1.08] [overflow-wrap:anywhere]">
                    {tx(chapter.title)}
                  </h3>
                  <p className="mt-3 font-display text-2xl text-gold md:text-3xl">{tx(chapter.highlight)}</p>
                  <p className="mt-4 max-w-xl text-[clamp(0.98rem,0.95vw,1.08rem)] leading-[1.65] text-foreground/80">
                    {tx(chapter.body)}
                  </p>
                  {chapter.link ? (
                    <a
                      href={chapter.link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex max-w-full items-center gap-2 text-sm font-medium text-primary link-underline [overflow-wrap:anywhere]"
                    >
                      {tx(chapter.link.label)}
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    </a>
                  ) : null}
                  {anchor ? (
                    <Link
                      href={anchor}
                      onClick={(event) => handleChapterNav(event, anchor)}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-foreground/90 transition-colors hover:text-primary"
                    >
                      {chapter.id === "batumi" ? tx("View Batumi opportunities") : tx("View Dubai legacy portfolio")}
                      <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                    </Link>
                  ) : null}
                </div>

                <dl className="grid min-w-0 grid-cols-1 gap-px overflow-hidden rounded-lg bg-border/50 sm:grid-cols-2 lg:grid-cols-3 [&>*]:min-w-0">
                  {chapter.stats.map((stat) => (
                    <div key={`${chapter.id}-${stat.label}`} className="mac-tile min-h-[6.25rem] min-w-0 p-4 sm:min-h-[5.75rem] md:min-h-[6rem] md:p-5">
                      <dt className="font-display text-[clamp(1.25rem,2vw,1.85rem)] leading-none text-gold [overflow-wrap:anywhere]">{tx(stat.value)}</dt>
                      <dd className="mt-2 text-[0.62rem] uppercase leading-[1.45] tracking-[0.1em] text-muted-foreground [overflow-wrap:anywhere] sm:text-[0.68rem] sm:tracking-[0.12em]">
                        {tx(stat.label)}
                      </dd>
                    </div>
                  ))}
                </dl>

                {index < legacyTimelineChapters.length - 1 ? (
                  <div
                    className="col-span-full hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block"
                    aria-hidden
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
