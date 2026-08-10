"use client";

import { useCallback, useEffect, useState } from "react";

const INTRO_POSTER = "/animation-samples/w-logo-blue-yellow-dot-poster.webp";
const INTRO_FAILSAFE_MS = 6_000;
const INTRO_FADE_MS = 500;

type IntroPhase = "visible" | "fading" | "hidden";

/**
 * Plays the approved four-second W logo over the public landing page only.
 *
 * The responsive video sources are rendered in the initial HTML so the
 * browser can start the visible animation before React hydrates. The page
 * itself still loads underneath it; heavyweight scene videos are held back
 * until this overlay finishes.
 */
export function InitialSiteAnimation() {
  const [phase, setPhase] = useState<IntroPhase>("visible");

  const closeIntro = useCallback(() => {
    setPhase((currentPhase) => (currentPhase === "visible" ? "fading" : currentPhase));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.siteIntro = "active";

    // performance.now() is measured from navigation start. This prevents a
    // slow hydration from extending the short intro safety limit indefinitely.
    const remainingTime = Math.max(0, INTRO_FAILSAFE_MS - performance.now());
    const timeoutId = window.setTimeout(closeIntro, remainingTime);

    return () => window.clearTimeout(timeoutId);
  }, [closeIntro]);

  useEffect(() => {
    if (phase !== "fading") return undefined;

    document.documentElement.dataset.siteIntro = "complete";
    window.dispatchEvent(new Event("aixco:site-intro-complete"));
    const removalTimer = window.setTimeout(() => setPhase("hidden"), INTRO_FADE_MS);

    return () => window.clearTimeout(removalTimer);
  }, [phase]);

  if (phase === "hidden") return null;

  return (
    <div
      data-site-intro=""
      aria-label="AIXCO.Global loading animation"
      aria-live="polite"
      className={`fixed inset-0 z-[10000] bg-[#071c2d] transition-opacity duration-500 ${
        phase === "fading" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
    >
      <video
        autoPlay
        muted
        playsInline
        poster={INTRO_POSTER}
        preload="auto"
        aria-hidden="true"
        className="initial-site-animation-video h-full w-full object-cover object-center"
        onEnded={closeIntro}
        onError={closeIntro}
      >
        <source
          media="(max-width: 767px), (orientation: portrait) and (max-width: 1023px)"
          src="/animation-samples/w-logo-blue-yellow-dot-portrait-720.mp4"
          type="video/mp4"
        />
        <source src="/animation-samples/w-logo-blue-yellow-dot.webm" type="video/webm" />
        <source src="/animation-samples/w-logo-blue-yellow-dot-1080.mp4" type="video/mp4" />
      </video>
      <span className="sr-only">Loading AIXCO.Global</span>
    </div>
  );
}
