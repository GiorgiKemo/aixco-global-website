"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  cancelGlideScroll,
  installGlideScroll,
  scheduleHashScrollStabilization,
  scrollToHash,
  scrollToPageTop,
} from "@/lib/smooth-scroll";

export function ScrollManager() {
  const pathname = usePathname();
  const firstRenderRef = useRef(true);
  const hashStabilizeTimersRef = useRef<number[]>([]);

  const clearHashStabilizeTimers = useCallback(() => {
    hashStabilizeTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    hashStabilizeTimersRef.current = [];
  }, []);

  const stabilizeHashScroll = useCallback((hash: string) => {
    clearHashStabilizeTimers();
    hashStabilizeTimersRef.current = scheduleHashScrollStabilization(hash);
  }, [clearHashStabilizeTimers]);

  useEffect(() => {
    if (typeof window === "undefined" || !("scrollRestoration" in window.history)) {
      return undefined;
    }

    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useEffect(
    () =>
      installGlideScroll({
        easing: 0.18,
        multiplier: 1,
        storyEasing: 0.18,
        storyMultiplier: 0.52,
        storyMomentum: 0.18,
      }),
    [],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    cancelGlideScroll();
    const isFirstRender = firstRenderRef.current;
    firstRenderRef.current = false;

    const frame = window.requestAnimationFrame(() => {
      const hash = window.location.hash;
      if (hash) {
        const didScroll = scrollToHash(hash, isFirstRender ? "auto" : undefined);
        if (didScroll) {
          stabilizeHashScroll(hash);
        }
        if (!didScroll && isFirstRender) {
          window.scrollTo({ top: 0, left: 0 });
        }
        return;
      }

      if (isFirstRender) {
        window.scrollTo({ top: 0, left: 0 });
      } else {
        scrollToPageTop();
      }
    });

    return () => {
      window.cancelAnimationFrame(frame);
      clearHashStabilizeTimers();
    };
  }, [clearHashStabilizeTimers, pathname, stabilizeHashScroll]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        scrollToHash(hash);
        stabilizeHashScroll(hash);
      } else {
        clearHashStabilizeTimers();
        scrollToPageTop();
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [clearHashStabilizeTimers, stabilizeHashScroll]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const clearOnUserInput = () => clearHashStabilizeTimers();
    const options: AddEventListenerOptions = { capture: true, passive: true };

    window.addEventListener("wheel", clearOnUserInput, options);
    window.addEventListener("touchstart", clearOnUserInput, options);
    window.addEventListener("pointerdown", clearOnUserInput, options);
    window.addEventListener("keydown", clearOnUserInput, { capture: true });

    return () => {
      clearHashStabilizeTimers();
      window.removeEventListener("wheel", clearOnUserInput, options);
      window.removeEventListener("touchstart", clearOnUserInput, options);
      window.removeEventListener("pointerdown", clearOnUserInput, options);
      window.removeEventListener("keydown", clearOnUserInput, { capture: true });
    };
  }, [clearHashStabilizeTimers]);

  return null;
}
