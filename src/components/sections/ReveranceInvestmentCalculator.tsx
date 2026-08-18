"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Building2, Download, MoveRight, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { PropertyChrome } from "@/components/property/PropertyChrome";
import { useI18n } from "@/i18n/I18nProvider";
import { aixcoLiveImages } from "@/lib/aixco-live-assets";
import {
  calculateReveranceInvestment,
  defaultReveranceCalculatorInputs,
  reveranceCalculatorAssumptions,
  reveranceCalculatorRanges,
  reveranceUnits,
  type CalculatorInputs,
} from "@/lib/reverance-investment-calculator";
import styles from "./ReveranceInvestmentCalculator.module.css";

const localeFor = (lang: string) => lang === "sl" ? "sl-SI" : lang;

function formatCurrency(value: number, lang: string) {
  return new Intl.NumberFormat(localeFor(lang), {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function currencyParts(value: number, lang: string) {
  return new Intl.NumberFormat(localeFor(lang), {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).formatToParts(value);
}

function CurrencyValue({ value, lang, prefix = "", className = "" }: { value: number; lang: string; prefix?: string; className?: string }) {
  return (
    <span className={`${styles.currencyValue} ${className}`} aria-label={`${prefix}${formatCurrency(value, lang)}`}>
      {prefix ? <span className={styles.currencyPrefix} aria-hidden="true">{prefix}</span> : null}
      {currencyParts(value, lang).map((part, index) => (
        part.type === "currency"
          ? <span key={`${part.type}-${index}`} className={styles.currencyGlyph} aria-hidden="true">{part.value}</span>
          : <span key={`${part.type}-${index}`} aria-hidden="true">{part.value}</span>
      ))}
    </span>
  );
}

function formatNumber(value: number, lang: string, maximumFractionDigits = 1) {
  return new Intl.NumberFormat(localeFor(lang), { maximumFractionDigits }).format(value);
}

function formatPercent(value: number, lang: string) {
  return `${formatNumber(value, lang, 1)}%`;
}

function rangeProgress(value: number, min: number, max: number) {
  return `${((value - min) / (max - min)) * 100}%`;
}

function ControlRange({
  label,
  value,
  min,
  max,
  step,
  display,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: ReactNode;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-3">
      <span className="flex items-baseline justify-between gap-4 text-[0.67rem] font-semibold uppercase tracking-[0.16em] text-[#161616]/70">
        <span>{label}</span>
        <strong className="text-sm tracking-normal text-[#161616]">{display}</strong>
      </span>
      <input
        className={styles.range}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ "--range-progress": rangeProgress(value, min, max) } as CSSProperties}
        aria-label={label}
      />
      <span className="flex justify-between text-[0.62rem] text-[#161616]/70" aria-hidden="true">
        <span>{min}{suffix}</span>
        <span>{max}{suffix}</span>
      </span>
    </label>
  );
}

function OutputCard({ label, value, accent = false }: { label: string; value: ReactNode; accent?: boolean }) {
  return (
    <article className={`flex min-h-[9.5rem] flex-col border border-[#161616]/12 p-5 sm:p-6 ${accent ? "bg-[#002147] text-white" : "bg-white text-[#161616]"}`}>
      <p className={`min-h-[2.2rem] text-[0.62rem] font-semibold uppercase leading-[1.35] tracking-[0.18em] ${accent ? "text-[#E6C767]" : "text-[#161616]/70"}`}>{label}</p>
      <p className={`mt-auto pt-5 font-display text-[clamp(1.8rem,3.6vw,3.2rem)] font-semibold leading-none tracking-[-0.05em] ${accent ? "text-white" : "text-[#161616]"}`}>{value}</p>
    </article>
  );
}

function DetailRow({ label, value, strong = false }: { label: string; value: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-5 border-b border-[#161616]/12 py-4 last:border-b-0">
      <span className="text-sm text-[#161616]/70">{label}</span>
      <strong className={`text-right text-sm ${strong ? "font-semibold text-[#8B6A18]" : "font-medium text-[#161616]"}`}>{value}</strong>
    </div>
  );
}

export function ReveranceInvestmentCalculator() {
  const { lang, tx } = useI18n();
  const [inputs, setInputs] = useState<CalculatorInputs>(defaultReveranceCalculatorInputs);
  const [clientName, setClientName] = useState("");
  const [pdfState, setPdfState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const calculation = useMemo(() => calculateReveranceInvestment(inputs), [inputs]);
  const unit = calculation.unit;

  const updateInput = <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) => {
    setInputs((current) => ({ ...current, [key]: value }));
    setPdfState("idle");
  };

  async function downloadPdf() {
    setPdfState("loading");
    try {
      const response = await fetch("/api/reverance-calculator/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          clientName: clientName.trim() || undefined,
          inputs,
        }),
      });
      if (!response.ok) throw new Error("PDF request failed");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `aixco-reverance-investment-brief-${lang}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      setPdfState("success");
    } catch {
      setPdfState("error");
    }
  }

  return (
    <>
      <PropertyChrome />
      <main id="main-content" className="bg-[#F3EDE1] text-[#161616]">
        <section className={`relative overflow-hidden border-b border-[#161616]/12 ${styles.heroGrid}`}>
          <div className="mx-auto grid w-full max-w-[1600px] gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:gap-16 lg:px-14 lg:py-24">
            <div className="relative z-10">
              <p className="brandbook-eyebrow">01 — {tx("Scenario calculator")}</p>
              <h1 className="mt-8 max-w-[10ch] font-display text-[clamp(3.5rem,7.2vw,7.8rem)] font-medium leading-[0.87] tracking-[-0.075em]">
                {tx("Reverance investment model")}
              </h1>
              <p className="mt-9 max-w-[30rem] text-lg leading-[1.55] text-[#161616]/65 sm:text-xl">
                {tx("A clear view of the numbers before you decide.")}
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#8B6A18]">
                <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#E6C767]" />{tx("Project Reverance · Batumi")}</span>
                <span>{tx("Illustrative only")}</span>
              </div>
            </div>
            <div className={`relative min-h-[22rem] overflow-hidden bg-[#002147] shadow-[0_30px_80px_-50px_rgba(0,33,71,0.7)] sm:min-h-[32rem] lg:min-h-[39rem] ${styles.imageFrame}`}>
              <Image
                src={aixcoLiveImages.currentProjectCleanFacade}
                alt={tx("Project Reverance residential towers in Batumi")}
                fill
                priority
                quality={90}
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover object-center"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#002147]/80 via-[#002147]/5 to-transparent" />
              <div className="absolute bottom-7 left-7 right-7 z-10 flex items-end justify-between gap-4 text-white sm:bottom-10 sm:left-10 sm:right-10">
                <div>
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#E6C767]">{tx("Project Reverance · Batumi")}</p>
                  <p className="mt-2 max-w-[16rem] text-xl font-medium leading-[1.05] tracking-[-0.04em] sm:text-2xl">{tx("A clear view of the numbers before you decide.")}</p>
                </div>
                <Building2 className="h-8 w-8 shrink-0 text-[#E6C767]" strokeWidth={1.1} aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>

        <section id="calculator" className="scroll-mt-24 border-b border-[#161616]/12 bg-[#FAF8F3]">
          <div className="mx-auto w-full max-w-[1600px] px-5 py-14 sm:px-8 sm:py-20 lg:px-14 lg:py-28">
            <div className="flex flex-col justify-between gap-7 border-b border-[#161616]/15 pb-8 lg:flex-row lg:items-end">
              <div>
                <p className="brandbook-eyebrow">02 — {tx("What you control")}</p>
                <h2 className="mt-6 max-w-[13ch] font-display text-[clamp(2.5rem,4.4vw,5rem)] font-medium leading-[0.9] tracking-[-0.065em]">{tx("Your scenario")}</h2>
              </div>
              <p className="max-w-[30rem] text-base leading-[1.55] text-[#161616]/62">{tx("The model translates your inputs into purchase price, financing, net monthly rent and a projected net worth.")}</p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-[0.84fr_1.16fr] lg:gap-8">
              <section className="border border-[#161616]/12 bg-[#F3EDE1] p-6 sm:p-8 lg:p-10" aria-labelledby="calculator-controls-heading">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#75540F]">03 / 05</p>
                    <h3 id="calculator-controls-heading" className="mt-3 font-display text-2xl font-medium tracking-[-0.04em] sm:text-3xl">{tx("Price assumptions")}</h3>
                  </div>
                  <SlidersHorizontal className="h-5 w-5 text-[#8B6A18]" strokeWidth={1.3} aria-hidden="true" />
                </div>

                <label className="mt-10 grid gap-3">
                  <span className="text-[0.67rem] font-semibold uppercase tracking-[0.16em] text-[#161616]/65">{tx("Choose your apartment")}</span>
                  <select
                    value={inputs.unitCode}
                    onChange={(event) => updateInput("unitCode", event.target.value)}
                    className="min-h-14 w-full appearance-none border border-[#161616]/18 bg-[#FAF8F3] px-4 text-base font-medium text-[#161616] outline-none transition-colors focus:border-[#8B6A18] focus:ring-2 focus:ring-[#8B6A18]/20"
                  >
                    {reveranceUnits.map((candidate) => (
                      <option key={candidate.code} value={candidate.code}>
                        {candidate.code} · {tx(candidate.type)} · {formatNumber(candidate.area, lang)} m² · {tx(candidate.orientation)}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="mt-7 grid grid-cols-2 gap-3 border-y border-[#161616]/12 py-5 text-sm">
                  <div><p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#161616]/70">{tx("Area")}</p><p className="mt-2 font-semibold">{formatNumber(unit.area, lang)} m²</p></div>
                  <div><p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#161616]/70">{tx("Orientation")}</p><p className="mt-2 font-semibold">{tx(unit.orientation)}</p></div>
                  <div><p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#161616]/70">{tx("Building")}</p><p className="mt-2 font-semibold">{unit.building}</p></div>
                  <div><p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#161616]/70">{tx("Floor")}</p><p className="mt-2 font-semibold">{unit.floor}</p></div>
                </div>

                <div className="mt-8 grid gap-8">
                  <ControlRange label={tx("Price per m²")} value={inputs.pricePerSquareMetre} min={reveranceCalculatorRanges.pricePerSquareMetre.min} max={reveranceCalculatorRanges.pricePerSquareMetre.max} step={reveranceCalculatorRanges.pricePerSquareMetre.step} display={<CurrencyValue value={inputs.pricePerSquareMetre} lang={lang} />} onChange={(value) => updateInput("pricePerSquareMetre", value)} />
                  <ControlRange label={tx("Financing")} value={inputs.financingPercent} min={reveranceCalculatorRanges.financingPercent.min} max={reveranceCalculatorRanges.financingPercent.max} step={reveranceCalculatorRanges.financingPercent.step} display={formatPercent(inputs.financingPercent, lang)} suffix="%" onChange={(value) => updateInput("financingPercent", value)} />
                  <ControlRange label={tx("Gross rental yield")} value={inputs.grossYieldPercent} min={reveranceCalculatorRanges.grossYieldPercent.min} max={reveranceCalculatorRanges.grossYieldPercent.max} step={reveranceCalculatorRanges.grossYieldPercent.step} display={formatPercent(inputs.grossYieldPercent, lang)} suffix="%" onChange={(value) => updateInput("grossYieldPercent", value)} />
                  <ControlRange label={tx("Annual value growth")} value={inputs.annualGrowthPercent} min={reveranceCalculatorRanges.annualGrowthPercent.min} max={reveranceCalculatorRanges.annualGrowthPercent.max} step={reveranceCalculatorRanges.annualGrowthPercent.step} display={formatPercent(inputs.annualGrowthPercent, lang)} suffix="%" onChange={(value) => updateInput("annualGrowthPercent", value)} />
                  <ControlRange label={tx("Holding period")} value={inputs.holdingYears} min={reveranceCalculatorRanges.holdingYears.min} max={reveranceCalculatorRanges.holdingYears.max} step={reveranceCalculatorRanges.holdingYears.step} display={`${inputs.holdingYears} ${tx(inputs.holdingYears === 1 ? "year" : "years")}`} onChange={(value) => updateInput("holdingYears", value)} />
                </div>
              </section>

              <section className="grid content-start gap-px bg-[#161616]/12" aria-label={tx("Your scenario")}>
                <div className="grid gap-px bg-[#161616]/12 sm:grid-cols-3">
                  <OutputCard label={tx("Invested equity")} value={<CurrencyValue value={calculation.investedEquity} lang={lang} />} />
                  <OutputCard label={tx("Monthly surplus")} value={<CurrencyValue value={Math.abs(calculation.monthlySurplus)} lang={lang} prefix={calculation.monthlySurplus >= 0 ? "+" : "−"} />} accent />
                  <OutputCard label={`${tx("Net worth after")} ${inputs.holdingYears} ${tx(inputs.holdingYears === 1 ? "year" : "years")}`} value={<CurrencyValue value={calculation.holdingProjection.netWorth} lang={lang} />} />
                </div>
                <div className="bg-white p-6 sm:p-8 lg:p-10">
                  <div className="flex flex-col justify-between gap-4 border-b border-[#161616]/12 pb-5 sm:flex-row sm:items-end">
                    <div><p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#8B6A18]">{tx("At completion")}</p><h3 className="mt-3 font-display text-3xl font-medium tracking-[-0.05em]"><CurrencyValue value={calculation.completionValue} lang={lang} /></h3></div>
                    <p className="max-w-[16rem] text-right text-sm leading-5 text-[#161616]/70">{formatPercent(reveranceCalculatorAssumptions.completionUpliftPercent, lang)} {tx("Value uplift to completion").toLowerCase()}</p>
                  </div>
                  <div className="mt-2 grid gap-0 sm:grid-cols-2 sm:gap-x-10">
                    <DetailRow label={tx("Purchase price")} value={<CurrencyValue value={calculation.listPrice} lang={lang} />} />
                    <DetailRow label={tx("Financing amount")} value={<CurrencyValue value={calculation.loanAmount} lang={lang} />} />
                    <DetailRow label={tx("Net monthly rent")} value={<CurrencyValue value={calculation.netMonthlyRent} lang={lang} />} strong />
                    <DetailRow label={tx("Monthly bank payment")} value={<CurrencyValue value={calculation.monthlyBankPayment} lang={lang} prefix="−" />} />
                  </div>
                </div>
                <div className="bg-[#002147] p-6 text-white sm:p-8 lg:p-10">
                  <div className="flex items-start justify-between gap-5"><div><p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#E6C767]">{tx("At your horizon")}</p><h3 className="mt-3 font-display text-3xl font-medium tracking-[-0.05em]"><CurrencyValue value={calculation.holdingProjection.netWorth} lang={lang} /></h3></div><ArrowUpRight className="h-6 w-6 text-[#E6C767]" strokeWidth={1.2} aria-hidden="true" /></div>
                  <div className="mt-8 grid gap-0 sm:grid-cols-3 sm:gap-5">
                    <div className="border-t border-white/20 pt-3"><p className="text-[0.58rem] uppercase tracking-[0.16em] text-white/55">{tx("Property value")}</p><p className="mt-2 text-sm font-semibold"><CurrencyValue value={calculation.holdingProjection.propertyValue} lang={lang} /></p></div>
                    <div className="border-t border-white/20 pt-3"><p className="text-[0.58rem] uppercase tracking-[0.16em] text-white/55">{tx("Remaining debt")}</p><p className="mt-2 text-sm font-semibold"><CurrencyValue value={calculation.holdingProjection.remainingDebt} lang={lang} /></p></div>
                    <div className="border-t border-white/20 pt-3"><p className="text-[0.58rem] uppercase tracking-[0.16em] text-white/55">{tx("Equity multiple")}</p><p className="mt-2 text-sm font-semibold">{formatNumber(calculation.holdingProjection.multiple, lang, 2)}×</p></div>
                  </div>
                </div>

                <div className="grid gap-6 border border-[#002147] bg-[#002147] p-6 text-white sm:p-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-10 lg:p-10">
                  <div>
                    <p className="brandbook-eyebrow brandbook-eyebrow-light max-w-[24ch]">04 — {tx("Download investment brief")}</p>
                    <h3 className="mt-4 max-w-[13ch] font-display text-3xl font-medium leading-[0.92] tracking-[-0.055em] sm:text-4xl">{tx("Download localized PDF brief")}</h3>
                    <p className="mt-5 max-w-[28rem] text-sm leading-6 text-white/62">{tx("The figures are illustrative and depend on unit selection, financing, occupancy, market conditions and delivery.")}</p>
                    <Link href="/reverance-batumi" className="mt-6 inline-flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#E6C767] transition-colors hover:text-white">{tx("Back to Reverance")} <MoveRight size={17} strokeWidth={1.5} /></Link>
                  </div>
                  <div className="border border-white/18 bg-white/[0.035] p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-4 border-b border-white/15 pb-4"><div><p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#E6C767]">{tx("Selected language")}</p><p className="mt-2 text-xl font-medium tracking-[-0.04em]">{lang.toUpperCase()}</p></div><ShieldCheck className="h-6 w-6 text-[#E6C767]" strokeWidth={1.2} aria-hidden="true" /></div>
                    <label className="mt-5 grid gap-2"><span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/58">{tx("Your name (optional)")}</span><input value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder={tx("Used for the cover only")} maxLength={100} className="min-h-12 w-full border border-white/20 bg-white/[0.06] px-4 text-base text-white outline-none placeholder:text-white/35 focus:border-[#E6C767] focus:ring-2 focus:ring-[#E6C767]/30" /></label>
                    <button type="button" onClick={downloadPdf} disabled={pdfState === "loading"} className="relative mt-5 inline-flex min-h-16 w-full items-center justify-center bg-[#E6C767] px-6 py-4 text-[0.65rem] font-semibold uppercase leading-[1.2] tracking-[0.08em] text-[#161616] transition-colors hover:bg-white disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E6C767] focus-visible:ring-offset-2 focus-visible:ring-offset-[#002147]">
                      <Download size={16} className="absolute left-5 top-1/2 -translate-y-1/2" strokeWidth={1.8} aria-hidden="true" /> <span className="min-w-0 flex-1 px-5 text-center">{pdfState === "loading" ? tx("Generating PDF…") : tx("Download localized PDF brief")}</span>
                    </button>
                    <p className="mt-3 min-h-5 text-sm text-white/65" aria-live="polite">{pdfState === "success" ? tx("PDF brief downloaded.") : pdfState === "error" ? tx("Could not generate the PDF. Please try again.") : ""}</p>
                    <div className="mt-4 flex items-start gap-3 border-t border-white/15 pt-4 text-xs leading-5 text-white/52"><ArrowDownRight className="mt-0.5 h-4 w-4 shrink-0 text-[#E6C767]" strokeWidth={1.3} aria-hidden="true" /><span>{tx("This is not financial, legal or tax advice.")}</span></div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>

        <section className="border-b border-[#161616]/12 bg-[#F3EDE1]">
          <div className="mx-auto w-full max-w-[1600px] px-5 py-14 sm:px-8 sm:py-20 lg:px-14 lg:py-28">
            <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
              <div>
                <p className="brandbook-eyebrow">05 — {tx("Projection")}</p>
                <h2 className="mt-7 max-w-[9ch] font-display text-[clamp(3rem,5.5vw,6rem)] font-medium leading-[0.87] tracking-[-0.07em]">{tx("Net worth over time")}</h2>
                <p className="mt-8 max-w-[24rem] text-base leading-[1.6] text-[#161616]/62">{tx("AIXCO models the reference scenario transparently so you can change the assumptions and see the effect.")}</p>
              </div>
              <div>
                <div className="grid gap-px bg-[#161616]/12 sm:grid-cols-2 lg:grid-cols-3">
                  {calculation.milestones.map((milestone) => (
                    <article key={milestone.year} className="bg-[#FAF8F3] p-5 sm:p-6">
                      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-[#8B6A18]">{milestone.year} {tx("year")}</p>
                      <p className="mt-6 font-display text-2xl font-medium tracking-[-0.045em]"><CurrencyValue value={milestone.netWorth} lang={lang} /></p>
                      <div className="mt-4 flex items-center justify-between border-t border-[#161616]/12 pt-3 text-[0.65rem] text-[#161616]/70"><span>{tx("Equity multiple")}</span><strong className="text-[#161616]">{formatNumber(milestone.multiple, lang, 2)}×</strong></div>
                    </article>
                  ))}
                </div>
                <div className="mt-5 border-t border-[#161616]/15 pt-5">
                  <div className="grid gap-0 sm:grid-cols-3 sm:gap-5">
                    <DetailRow label={tx("Property value")} value={<CurrencyValue value={calculation.holdingProjection.propertyValue} lang={lang} />} />
                    <DetailRow label={tx("Remaining debt")} value={<CurrencyValue value={calculation.holdingProjection.remainingDebt} lang={lang} />} />
                    <DetailRow label={tx("Accumulated cash flow")} value={<CurrencyValue value={calculation.holdingProjection.accumulatedCash} lang={lang} />} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
