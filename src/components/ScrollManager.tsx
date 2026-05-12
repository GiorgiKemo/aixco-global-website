"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  cancelGlideScroll,
  installGlideScroll,
  scrollToHash,
  scrollToPageTop,
} from "@/lib/smooth-scroll";

export function ScrollManager() {
  const pathname = usePathname();
  const firstRenderRef = useRef(true);

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

  useEffect(() => installGlideScroll(), []);

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
    };
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        scrollToHash(hash);
      } else {
        scrollToPageTop();
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return null;
}
