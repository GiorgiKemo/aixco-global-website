import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { aixcoLiveLogos } from "@/lib/aixco-live-assets";
import { Tx } from "@/components/i18n/Tx";

const NotFound = () => {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#11100e]/80 px-4 py-3 text-white backdrop-blur-xl">
        <Link href="/" prefetch={false} className="inline-flex min-w-0 items-center gap-2">
          <img src={aixcoLiveLogos.aixcoMark} alt="" aria-hidden="true" className="h-auto w-11 shrink-0 object-contain" />
          <span className="truncate text-sm font-semibold tracking-[-0.02em]">AIXCO.GLOBAL</span>
        </Link>
      </header>
      <main className="relative isolate flex min-h-screen items-center overflow-hidden bg-[#11100e] px-6 py-28 text-white md:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_28%_22%,rgba(188,128,39,0.22),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.06),transparent_42%)]" />
        <section className="mx-auto w-full max-w-3xl text-center">
          <p className="eyebrow text-primary">404</p>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-white md:text-6xl">
            <Tx>This page is not available.</Tx>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-white/72 md:text-lg">
            <Tx>The page may have moved, or the address may be incorrect. Return to AIXCO.Global to continue exploring selected real estate services.</Tx>
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/" prefetch={false} className="btn-gold">
              <Tx>Return to Home</Tx>
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
};

export default NotFound;
