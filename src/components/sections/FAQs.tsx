import { useState } from "react";
import { faqGroups } from "@/data/site";
import { Plus } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { useUI } from "../ui-state";

export function FAQs() {
  const [openId, setOpenId] = useState<string | null>("Customer-0");
  const { tx } = useI18n();
  const { openLogin, openRegister } = useUI();

  return (
    <section id="faqs" className="relative py-28 md:py-36 scroll-mt-24">
      <div className="container-x grid lg:grid-cols-12 gap-12">
        <div className="scroll-reveal lg:col-span-4 lg:sticky lg:top-28 self-start">
          <p className="eyebrow">{tx("FAQs")}</p>
          <h2 className="heading-section mt-5">{tx("FAQs - Frequently Asked Questions")}</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={openRegister} className="btn-gold !py-2 !px-4 text-[12px]">
              {tx("Register Now")}
            </button>
            <button type="button" onClick={openLogin} className="btn-ghost-gold !py-2 !px-4 text-[12px]">
              {tx("Login")}
            </button>
            <a href="tel:+995500556602" className="btn-ghost-gold !py-2 !px-4 text-[12px]">
              {tx("Call AIXCO")}
            </a>
          </div>
        </div>
        <div className="lg:col-span-8 space-y-12">
          {faqGroups.map((g) => (
            <div key={g.group} className="scroll-reveal">
              <p className="text-[11px] uppercase tracking-[0.3em] text-primary mb-2">{tx(g.group)}</p>
              <p className="mb-4 text-sm text-muted-foreground">{tx(g.description)}</p>
              <div className="glass overflow-hidden rounded-lg">
                {g.items.map((it, i) => {
                  const id = `${g.group}-${i}`;
                  const isOpen = openId === id;
                  return (
                    <div key={id} className="border-b border-border/50 last:border-b-0">
                      <button
                        aria-expanded={isOpen}
                        onClick={() => setOpenId(isOpen ? null : id)}
                        className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left transition-colors hover:bg-background/50"
                      >
                        <span className="font-display text-lg md:text-xl">{tx(it.q)}</span>
                        <Plus className={`h-5 w-5 text-primary shrink-0 transition-transform duration-500 ${isOpen ? "rotate-45" : ""}`} />
                      </button>
                      <div className={`grid px-5 transition-all duration-500 ${isOpen ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"}`}>
                        <div className="overflow-hidden">
                          <p className="text-sm text-foreground/80 leading-relaxed max-w-2xl">{tx(it.a)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
