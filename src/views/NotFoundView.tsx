"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { aixcoLiveLogos } from "@/lib/aixco-live-assets";
import { I18nProvider, useI18n } from "@/i18n/I18nProvider";

function NotFoundContent() {
  const { tx } = useI18n();

  return (
    <>
      <a href="#main-content" className="skip-link">{tx("Skip to main content")}</a>
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#11100e]/80 pb-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] pt-[max(0.75rem,env(safe-area-inset-top,0px))] text-white backdrop-blur-xl">
        <Link href="/" aria-label={tx("AIXCO.GLOBAL home")} className="inline-flex min-w-0 items-center gap-2">
          <Image src={aixcoLiveLogos.aixcoHorizontalLight} alt="" aria-hidden="true" width={1600} height={333} sizes="10rem" unoptimized className="h-auto w-40 shrink-0 object-contain" />
          <span className="sr-only">AIXCO.GLOBAL</span>
        </Link>
      </header>
      <main id="main-content" tabIndex={-1} className="relative isolate flex min-h-screen min-h-[100dvh] items-center overflow-hidden bg-[#11100e] pb-[max(7rem,env(safe-area-inset-bottom,0px))] pl-[max(1.5rem,env(safe-area-inset-left,0px))] pr-[max(1.5rem,env(safe-area-inset-right,0px))] pt-[max(7rem,env(safe-area-inset-top,0px))] text-white md:pl-[max(2rem,env(safe-area-inset-left,0px))] md:pr-[max(2rem,env(safe-area-inset-right,0px))]">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_28%_22%,rgba(188,128,39,0.22),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.06),transparent_42%)]" />
        <section className="mx-auto w-full max-w-3xl break-words text-center [overflow-wrap:anywhere]">
          <p className="eyebrow text-primary">404</p>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-white md:text-6xl">
            {tx("This page is not available.")}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-white/72 md:text-lg">
            {tx("The page may have moved, or the address may be incorrect. Return to AIXCO.Global to continue exploring selected real estate services.")}
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/" className="btn-gold">
              {tx("Return to Home")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

const NotFound = () => (
  <I18nProvider>
    <NotFoundContent />
  </I18nProvider>
);

export default NotFound;
