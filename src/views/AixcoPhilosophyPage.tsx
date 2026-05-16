import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, CircleDollarSign, Globe2, ShieldCheck } from "lucide-react";
import aboutArchitecture from "@/assets/about-architecture.jpg";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import {
  philosophyHero,
  philosophyPrinciples,
  philosophySections,
  philosophyStats,
} from "@/data/aixco-philosophy";

const statIcons = [Building2, ShieldCheck, Globe2, CircleDollarSign] as const;

export function AixcoPhilosophyPage() {
  return (
    <>
      <Nav />
      <main className="bg-background">
        <section className="relative isolate min-h-svh overflow-hidden bg-[#10110f] pt-24 text-white md:pt-28 lg:pt-32">
          <Image
            src={aboutArchitecture}
            alt="AIXCO real estate architecture"
            fill
            preload
            sizes="100vw"
            className="absolute inset-0 -z-20 object-cover opacity-40"
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(16,17,15,0.58)_0%,rgba(16,17,15,0.78)_54%,rgba(16,17,15,0.96)_100%)]" />
          <div className="container-x flex min-h-[calc(100svh-6rem)] flex-col justify-end gap-6 pb-8 md:min-h-[calc(100svh-7rem)] md:justify-between md:gap-10 md:pb-10 md:pt-16 lg:min-h-[calc(100svh-8rem)] lg:pt-20">
            <div className="max-w-5xl">
              <p className="eyebrow text-primary-glow">{philosophyHero.eyebrow}</p>
              <h1 className="mt-6 text-4xl font-semibold leading-[1.08] text-white md:mt-8 md:text-6xl md:leading-[1.12]">
                {philosophyHero.title}
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-white/80 md:mt-9 md:text-xl md:leading-10">
                {philosophyHero.summary}
              </p>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-2 md:mt-8 md:gap-3 lg:grid-cols-4">
              {philosophyStats.map((stat, index) => {
                const Icon = statIcons[index];

                return (
                  <div
                    key={stat.label}
                    className="group min-h-24 rounded-lg border border-white/15 bg-[#151820]/92 p-3 shadow-[0_18px_46px_-34px_rgb(0_0_0/0.8)] backdrop-blur-md transition-colors duration-300 hover:border-primary/55 md:min-h-0 md:p-5"
                  >
                    <dt className="grid grid-cols-[1rem_minmax(0,1fr)] gap-2 text-[0.62rem] font-semibold uppercase leading-4 tracking-[0.16em] text-white/65 md:grid-cols-[1.25rem_minmax(0,1fr)] md:text-xs md:leading-5 md:tracking-[0.32em]">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 justify-self-start text-primary-glow md:mt-[0.125rem]" aria-hidden />
                      <span className="text-left">{stat.label}</span>
                    </dt>
                    <dd className="mt-2 text-[1.95rem] font-semibold leading-none tracking-normal text-primary md:mt-5 md:text-5xl">{stat.value}</dd>
                    <div className="mt-2 h-px w-full bg-primary/75 transition-colors duration-300 group-hover:bg-primary md:mt-4" aria-hidden />
                  </div>
                );
              })}
            </dl>
          </div>
        </section>

        <article className="container-x py-16 md:py-24">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-28 lg:h-fit">
              <p className="eyebrow">Investment philosophy</p>
              <h2 className="mt-5 max-w-xl text-3xl font-semibold leading-tight text-foreground md:text-5xl">
                A platform built around endurance, income, and responsible ownership.
              </h2>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {philosophyPrinciples.map((principle) => (
                  <li
                    key={principle}
                    className="flex min-h-14 items-center gap-3 rounded-lg border border-border/70 bg-surface-elevated/70 px-4 py-3 text-sm font-semibold text-foreground shadow-soft"
                  >
                    <ShieldCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    {principle}
                  </li>
                ))}
              </ul>
            </aside>

            <div className="space-y-12">
              {philosophySections.map((section) => (
                <section key={section.title} className="border-t border-border/70 pt-8 first:border-t-0 first:pt-0">
                  <p className="text-sm font-semibold uppercase text-primary">{section.eyebrow}</p>
                  <h3 className="mt-3 text-2xl font-semibold leading-tight text-foreground md:text-3xl">
                    {section.title}
                  </h3>
                  <div className="mt-5 space-y-5 text-foreground/75">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </article>

        <section className="border-y border-border/70 bg-surface/40">
          <div className="container-x grid gap-8 py-14 md:grid-cols-[1fr_auto] md:items-center md:py-20">
            <div>
              <p className="eyebrow">Next step</p>
              <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-foreground md:text-5xl">
                Explore the projects shaped by this philosophy.
              </h2>
              <p className="mt-5 max-w-2xl text-foreground/70">
                Learn how AIXCO applies disciplined asset management across selected real estate opportunities in Dubai and Batumi.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <Link href="/#participate" className="btn-gold">
                Ways to participate
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/#contact" className="btn-ghost-gold">
                Contact AIXCO
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
