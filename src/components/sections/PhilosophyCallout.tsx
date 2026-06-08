"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

export function PhilosophyCallout() {
  const { tx } = useI18n();

  return (
    <section id="philosophy" aria-label="AIXCO Philosophy" className="scroll-mt-16 border-y border-border/70 bg-surface/45 md:scroll-mt-20">
      <div className="container-x grid gap-7 py-10 md:grid-cols-[1fr_auto] md:items-center md:py-12">
        <div>
          <p className="eyebrow">{tx("Our philosophy")}</p>
          <h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight text-foreground md:text-5xl">
            {tx("From Switzerland to Dubai to Batumi—disciplined real estate execution since 2009.")}
          </h2>
          <p className="mt-5 max-w-3xl text-foreground/70">
            {tx("Read how AIXCO’s legacy in Swiss and Gulf markets shapes today’s buy-sell-brokerage focus in Batumi.")}
          </p>
        </div>

        <Link href="#philosophy" prefetch={false} className="btn-gold w-full sm:w-auto">
          <ShieldCheck className="h-4 w-4" aria-hidden />
          {tx("Read AIXCO Philosophy")}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
