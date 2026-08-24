"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./InitialSiteAnimation.module.css";

// The supplied motion is exactly four seconds. Keep the fallback close to the
// media duration so a stalled video cannot hold the page's first paint open.
const INTRO_FAILSAFE_MS = 4_400;
const REDUCED_MOTION_VISIBLE_MS = 0;
const INTRO_FADE_MS = 360;
const INTRO_POSTER = "/aixco-global-op2/media/aixco-intro-black-poster-hd.webp";
const INTRO_DESKTOP_VIDEO = "/aixco-global-op2/media/aixco-intro-black-1080.mp4";
const INTRO_PORTRAIT_VIDEO = "/aixco-global-op2/media/aixco-intro-black-portrait-1080.mp4";
const INTRO_STORAGE_KEY = "aixco-site-intro-v1";

function hasSeenIntro() {
  try {
    if (
      window.localStorage.getItem(INTRO_STORAGE_KEY) === "seen" ||
      window.localStorage.getItem("aixco-lang") !== null
    ) {
      return true;
    }
  } catch {
    // Persistent storage can be unavailable in hardened/private contexts.
  }

  try {
    return window.sessionStorage.getItem(INTRO_STORAGE_KEY) === "seen";
  } catch {
    return false;
  }
}

function rememberIntro() {
  try {
    window.localStorage.setItem(INTRO_STORAGE_KEY, "seen");
    return;
  } catch {
    // Fall back to the current tab when persistent storage is unavailable.
  }

  try {
    window.sessionStorage.setItem(INTRO_STORAGE_KEY, "seen");
  } catch {
    // The intro still works when all browser storage is unavailable.
  }
}

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
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const visibleUntilRef = useRef(0);

  const closeIntro = useCallback(() => {
    setPhase((currentPhase) => (currentPhase === "visible" ? "fading" : currentPhase));
  }, []);

  const requestCloseIntro = useCallback(() => {
    const remaining = visibleUntilRef.current - performance.now();
    if (remaining > 0) {
      window.setTimeout(closeIntro, remaining);
      return;
    }

    closeIntro();
  }, [closeIntro]);

  useEffect(() => {
    const introAlreadyPlayed =
      document.documentElement.dataset.siteIntroSeen === "true" || hasSeenIntro();

    if (introAlreadyPlayed) {
      // Migrate the former session-only marker to persistent storage without
      // replaying the animation for visitors who already saw it.
      rememberIntro();
      document.documentElement.dataset.siteIntro = "complete";
      window.dispatchEvent(new Event("aixco:site-intro-complete"));
      setPhase("hidden");
      return undefined;
    }

    rememberIntro();

    document.documentElement.dataset.siteIntro = "active";

    const visibleDuration = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? REDUCED_MOTION_VISIBLE_MS
      : INTRO_FAILSAFE_MS;
    visibleUntilRef.current = performance.now() + visibleDuration;

    // The safety timer starts when the intro mounts. Using navigation-time
    // performance.now() here could make a slow hydration skip the animation
    // entirely before the video has a chance to play.
    const timeoutId = window.setTimeout(closeIntro, visibleDuration);

    return () => window.clearTimeout(timeoutId);
  }, [closeIntro]);

  useEffect(() => {
    if (phase !== "visible") return undefined;

    // Keep the server-rendered shell free of a full-viewport video LCP
    // candidate. The poster background is visible immediately; mounting the
    // decoder on the first client frame preserves the animation without
    // delaying the page shell's first meaningful paint.
    const frameId = window.requestAnimationFrame(() => setVideoReady(true));
    return () => window.cancelAnimationFrame(frameId);
  }, [phase]);

  useEffect(() => {
    if (!videoReady) return undefined;

    const video = videoRef.current;
    if (!video) return undefined;

    // Some mobile browsers ignore the initial autoPlay attribute until the
    // element has entered the document. Explicitly request playback after the
    // first frame so the intro remains animated instead of freezing on its
    // poster frame.
    const playPromise = video.play();
    playPromise?.catch(() => {
      // The muted poster remains a safe fallback when autoplay is blocked.
    });

    return undefined;
  }, [videoReady]);

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
      <Image
        src={INTRO_POSTER}
        alt=""
        fill
        sizes="100vw"
        preload
        decoding="async"
        className={styles.poster}
        aria-hidden="true"
      />
      {videoReady ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          preload="auto"
          poster={INTRO_POSTER}
          aria-hidden="true"
          className={styles.video}
          onEnded={requestCloseIntro}
          onError={requestCloseIntro}
        >
          <source
            media="(max-width: 767px), (orientation: portrait) and (max-width: 1023px)"
            src={INTRO_PORTRAIT_VIDEO}
            type="video/mp4"
          />
          <source src={INTRO_DESKTOP_VIDEO} type="video/mp4" />
        </video>
      ) : null}
      <span className="sr-only">Loading AIXCO.Global</span>
    </div>
  );
}
