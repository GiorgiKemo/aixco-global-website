"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

type AdminErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminError({ error, reset }: AdminErrorProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    console.error("AIXCO admin route render failed.", {
      digest: error.digest,
    });
  }, [error]);

  return (
    <main
      className="grid min-h-[100dvh] place-items-center bg-[#f8f6f1] px-5 py-8 pb-[max(2rem,env(safe-area-inset-bottom,0px))] pl-[max(1.25rem,env(safe-area-inset-left,0px))] pr-[max(1.25rem,env(safe-area-inset-right,0px))] pt-[max(2rem,env(safe-area-inset-top,0px))]"
      aria-labelledby="admin-error-title"
      aria-describedby="admin-error-description"
    >
      <section className="w-full max-w-lg rounded-xl border border-[#d8d2c6] bg-white p-6 shadow-xl sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#735a20]">
          Secure admin workspace
        </p>
        <h1
          className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-[#27241f] outline-none sm:text-3xl"
          id="admin-error-title"
          ref={titleRef}
          tabIndex={-1}
        >
          This admin screen could not be loaded
        </h1>
        <p
          className="mt-4 max-w-prose text-sm leading-6 text-[#625d54] sm:text-base"
          id="admin-error-description"
        >
          Try again. If the problem continues, return to the admin home or the
          public website.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#27241f] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#443f36] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5d17] focus-visible:ring-offset-2"
            type="button"
            onClick={reset}
          >
            Try again
          </button>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#8a8275] bg-white px-5 py-2.5 text-sm font-semibold text-[#27241f] transition-colors hover:bg-[#f3f0e9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5d17] focus-visible:ring-offset-2"
            href="/admin"
          >
            Admin home
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-[#554f45] underline decoration-[#a69a84] underline-offset-4 transition-colors hover:text-[#27241f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5d17] focus-visible:ring-offset-2"
            href="/"
          >
            Public website
          </Link>
        </div>
      </section>
    </main>
  );
}
