"use client";

import { useEffect } from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Dubai } from "@/components/sections/Dubai";
import { Batumi } from "@/components/sections/Batumi";
import { Materials } from "@/components/sections/Materials";
import { Participate } from "@/components/sections/Participate";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Team } from "@/components/sections/Team";
import { Partners } from "@/components/sections/Partners";
import { FAQs } from "@/components/sections/FAQs";
import { Contact } from "@/components/sections/Contact";
import { scheduleHashScrollStabilization, scrollToHash } from "@/lib/smooth-scroll";

const deferredSectionHashes = new Set([
  "#dubai",
  "#batumi",
  "#materials",
  "#participate",
  "#how",
  "#team",
  "#partners",
  "#faqs",
  "#contact",
]);
const pendingHashScrollKey = "aixco-pending-hash-scroll";

function readPendingHashScroll() {
  if (typeof window === "undefined") return "";

  try {
    const pendingHash = window.sessionStorage.getItem(pendingHashScrollKey);
    if (pendingHash) return pendingHash;

    const navigationEntry = window.performance
      .getEntriesByType("navigation")
      .at(0) as PerformanceNavigationTiming | undefined;
    if (!navigationEntry?.name) return "";

    return new URL(navigationEntry.name).hash;
  } catch {
    return "";
  }
}

function clearPendingHashScroll() {
  try {
    window.sessionStorage.removeItem(pendingHashScrollKey);
  } catch {
    // Session storage can be unavailable in restricted browser modes.
  }
}

export function DeferredHomeSectionsContent() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash || readPendingHashScroll();
    if (!deferredSectionHashes.has(hash)) return;

    clearPendingHashScroll();
    const frame = window.requestAnimationFrame(() => {
      scrollToHash(hash, "auto");
    });
    const timers = scheduleHashScrollStabilization(hash);

    return () => {
      window.cancelAnimationFrame(frame);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <>
      <ScrollReveal>
        <Dubai />
      </ScrollReveal>
      <ScrollReveal>
        <Batumi />
      </ScrollReveal>
      <ScrollReveal>
        <Materials />
      </ScrollReveal>
      <ScrollReveal>
        <Participate />
      </ScrollReveal>
      <ScrollReveal>
        <HowItWorks />
      </ScrollReveal>
      <ScrollReveal>
        <Team />
      </ScrollReveal>
      <ScrollReveal>
        <Partners />
      </ScrollReveal>
      <ScrollReveal>
        <FAQs />
      </ScrollReveal>
      <ScrollReveal>
        <Contact />
      </ScrollReveal>
    </>
  );
}
