"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { aixcoLiveLogos } from "@/lib/aixco-live-assets";
import styles from "./InitialSiteAnimation.module.css";

const INTRO_FAILSAFE_MS = 5_500;
const REDUCED_MOTION_VISIBLE_MS = 700;
const INTRO_FADE_MS = 450;
const INTRO_DESKTOP_VIDEO = "/aixco-global-op2/media/aixco-intro-black-1080.mp4";
const INTRO_PORTRAIT_VIDEO = "/aixco-global-op2/media/aixco-intro-black-portrait-1080.mp4";

type IntroPhase = "visible" | "fading" | "hidden";

/**
 * Plays the original four-second AIXCO logo assembly over black on the public
 * landing page only.
 *
 * Separate landscape and portrait compositions preserve the complete motion
 * at every viewport size without cropping or enlarging the mark on phones.
 */
export function InitialSiteAnimation() {
  const [phase, setPhase] = useState<IntroPhase>("visible");

  const closeIntro = useCallback(() => {
    setPhase((currentPhase) => (currentPhase === "visible" ? "fading" : currentPhase));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.siteIntro = "active";

    const visibleDuration = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? REDUCED_MOTION_VISIBLE_MS
      : INTRO_FAILSAFE_MS;

    // performance.now() is measured from navigation start. This safety timer
    // only handles stalled playback; the four-second video closes onEnded.
    const remainingTime = Math.max(0, visibleDuration - performance.now());
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
      className={`${styles.overlay} ${phase === "fading" ? styles.fading : ""}`}
      role="status"
    >
      <video
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        className={styles.video}
        onEnded={closeIntro}
        onError={closeIntro}
      >
        <source
          media="(max-width: 767px), (orientation: portrait) and (max-width: 1023px)"
          src={INTRO_PORTRAIT_VIDEO}
          type="video/mp4"
        />
        <source src={INTRO_DESKTOP_VIDEO} type="video/mp4" />
      </video>
      <Image
        src={aixcoLiveLogos.aixcoHorizontalLight}
        alt=""
        width={1600}
        height={333}
        sizes="78vw"
        loading="eager"
        fetchPriority="high"
        decoding="sync"
        className={styles.reducedMotionLogo}
        aria-hidden="true"
      />
      <span className="sr-only">Loading AIXCO.Global</span>
    </div>
  );
}
