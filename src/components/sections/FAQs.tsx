"use client";

import { useState } from "react";
import { useSiteContent } from "@/data/site-content-context";
import { ChevronDown } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { useUI } from "../ui-state";

export function FAQs() {
  const [openId, setOpenId] = useState<string | null>(null);
  const { tx } = useI18n();
  const { openLogin, openRegister } = useUI();
  const { faqGroups } = useSiteContent();
  const faqItems = faqGroups.flatMap((group) =>
    group.items.map((item, index) => ({
      group: group.group,
      description: group.description,
      item,
      id: `${group.group}-${index}`,
      panelId: `faq-panel-${group.group.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase()}-${index}`,
    })),
  );
  const firstDescription = faqGroups[0]?.description;

  return (
    <section id="faqs" className="relative scroll-mt-24 py-16 pb-28 md:scroll-mt-28 md:py-20 md:pb-32 lg:py-24 lg:pb-36">
      <div className="container-x">
        <div className="scroll-reveal flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <p className="eyebrow">{tx("FAQs")}</p>
            <h2 className="heading-section mt-5">{tx("FAQs - Frequently Asked Questions")}</h2>
            {firstDescription ? (
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {tx(firstDescription)}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <button type="button" onClick={openRegister} className="btn-gold !px-4 !py-2 text-[12px]">
              {tx("Register Now")}
            </button>
            <button type="button" onClick={openLogin} className="btn-ghost-gold !px-4 !py-2 text-[12px]">
              {tx("Login")}
            </button>
            <a href="tel:+995500556602" className="btn-ghost-gold !px-4 !py-2 text-[12px]">
              {tx("Call AIXCO")}
            </a>
          </div>
        </div>
        <div className="scroll-reveal mt-10 grid gap-4 lg:grid-cols-2 lg:gap-5">
          {faqItems.map(({ group, item, id, panelId }) => {
            const isOpen = openId === id;

            return (
              <article key={id} className="glass min-w-0 overflow-hidden rounded-lg border border-border/60">
                <button
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenId(openId === id ? null : id)}
                  className="flex min-h-[5.25rem] w-full items-center justify-between gap-5 px-5 py-4 text-left transition-colors hover:bg-background/50"
                >
                  <span className="min-w-0">
                    <span aria-hidden="true" className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
                      {tx(group)}
                    </span>
                    <span className="block font-display text-lg leading-tight md:text-xl">{tx(item.q)}</span>
                  </span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-primary transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} strokeWidth={2.5} />
                </button>
                <div id={panelId} className={`grid px-5 transition-[grid-template-rows,opacity,padding-bottom] duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <p className="max-w-2xl text-sm leading-relaxed text-foreground/80">{tx(item.a)}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
