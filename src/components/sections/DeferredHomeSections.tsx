"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useDelayedIdleReady } from "@/hooks/use-idle-ready";
import { HASH_REPLACED_EVENT } from "@/lib/section-hash";
import { scrollToHash } from "@/lib/smooth-scroll";

const DeferredHomeSectionsContent = dynamic(
  () =>
    import("@/components/sections/DeferredHomeSectionsContent").then(
      (module) => module.DeferredHomeSectionsContent,
    ),
  {
    loading: () => <DeferredHomeSectionsFallback />,
  },
);

const deferredSectionPlaceholders = [
  { id: "dubai", label: "Dubai legacy portfolio", surface: true, height: "h-[min(74svh,42rem)]" },
  { id: "batumi", label: "Emerging market opportunities", surface: true, height: "h-[min(74svh,42rem)]" },
  { id: "materials", label: "Materials and downloads", surface: false, height: "h-[min(56svh,34rem)]" },
  { id: "participate", label: "How to work with AIXCO", surface: true, height: "h-[min(64svh,38rem)]" },
  { id: "how", label: "How AIXCO works", surface: false, height: "h-[min(56svh,34rem)]" },
  { id: "team", label: "Our team", surface: false, height: "h-[min(50svh,30rem)]" },
  { id: "partners", label: "Partners", surface: false, height: "h-[min(44svh,26rem)]" },
  { id: "faqs", label: "Frequently asked questions", surface: false, height: "h-[min(48svh,28rem)]" },
  { id: "contact", label: "Contact AIXCO", surface: true, height: "h-[min(62svh,36rem)]" },
] as const;

const immediateSectionHashes = new Set(deferredSectionPlaceholders.map((section) => `#${section.id}`));
const hashReadyEventNames = ["hashchange", HASH_REPLACED_EVENT] as const;

function DeferredHomeSectionsFallback() {
  return (
    <div className="contents" data-deferred-home-sections="loading">
      {deferredSectionPlaceholders.map((section) => (
        <section
          key={section.id}
          id={section.id}
          aria-label={section.label}
          className={`relative scroll-mt-16 py-12 md:scroll-mt-20 md:py-16 ${section.surface ? "bg-surface/40" : ""}`}
        >
          <div className="container-x" aria-hidden="true">
            <div className={`${section.height} rounded-lg bg-white/55`} />
          </div>
        </section>
      ))}
    </div>
  );
}

function useDeferredHomeSectionsReady() {
  const delayedReady = useDelayedIdleReady(3200, 1200);
  const [hashReady, setHashReady] = useState(false);

  useEffect(() => {
    const updateHashReady = () => {
      setHashReady(immediateSectionHashes.has(window.location.hash));
    };

    updateHashReady();
    hashReadyEventNames.forEach((eventName) => window.addEventListener(eventName, updateHashReady));
    return () => {
      hashReadyEventNames.forEach((eventName) => window.removeEventListener(eventName, updateHashReady));
    };
  }, []);

  return delayedReady || hashReady;
}

export function DeferredHomeSections() {
  const ready = useDeferredHomeSectionsReady();

  useEffect(() => {
    if (!ready || typeof window === "undefined" || !immediateSectionHashes.has(window.location.hash)) return;

    const hash = window.location.hash;
    const timers = [0, 120, 320, 700].map((delay) =>
      window.setTimeout(() => {
        scrollToHash(hash, "auto");
      }, delay),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [ready]);

  return ready ? <DeferredHomeSectionsContent /> : <DeferredHomeSectionsFallback />;
}
