"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("AIXCO route render failed.", { digest: error.digest });
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F3EDE1] px-5 py-16 text-[#161616]">
      <section className="w-full max-w-2xl border border-[#161616]/15 bg-white px-7 py-10 sm:px-12 sm:py-14">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#8b6a18]">AIXCO.Global</p>
        <h1 className="mt-5 font-display text-[clamp(2.5rem,7vw,4.5rem)] font-bold leading-none">This page could not be loaded.</h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#55534f]">Your request is safe. Try loading the page again, or return to the homepage.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="inline-flex min-h-11 items-center justify-center bg-[#161616] px-6 text-sm font-bold text-white">
            Try again
          </button>
          <Link href="/" className="inline-flex min-h-11 items-center justify-center border border-[#161616] px-6 text-sm font-bold text-[#161616]">
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}
