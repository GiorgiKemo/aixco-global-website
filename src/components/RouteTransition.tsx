"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const VEIL_HIDE_MS = 480;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isInternalPageHref(anchor: HTMLAnchorElement) {
  if (anchor.target === "_blank" || anchor.hasAttribute("download") || anchor.hasAttribute("data-no-route-transition")) {
    return null;
  }

  const rawHref = anchor.getAttribute("href");
  if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(rawHref, window.location.href);
  } catch {
    return null;
  }

  if (url.origin !== window.location.origin) return null;
  if (url.pathname === window.location.pathname && url.search === window.location.search) return null;
  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api") || url.pathname.startsWith("/portal")) {
    return null;
  }

  return url;
}

function activateVeil(veil: HTMLDivElement | null) {
  if (!veil || prefersReducedMotion()) return;

  veil.classList.remove("is-leaving");
  veil.classList.add("is-active");
}

function resetVeil(veil: HTMLDivElement | null) {
  veil?.classList.remove("is-active", "is-leaving");
}

export function RouteTransition() {
  const pathname = usePathname();
  const veilRef = useRef<HTMLDivElement | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const isAppRoute =
      pathname.startsWith("/admin") || pathname.startsWith("/api") || pathname.startsWith("/portal");
    document.documentElement.dataset.routeTransition = isAppRoute ? "app" : "marketing";
    document.documentElement.dataset.routePath = pathname;
  }, [pathname]);

  useEffect(() => {
    const veil = veilRef.current;
    if (!veil) return;

    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (!veil.classList.contains("is-active")) return;

    // Keep the new route covered until its shell has mounted, then reveal it
    // with the same calm timing as the first-paint entrance.
    veil.classList.add("is-leaving");
    hideTimerRef.current = window.setTimeout(() => {
      resetVeil(veil);
      hideTimerRef.current = null;
    }, VEIL_HIDE_MS);

    return () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [pathname]);

  useEffect(() => {
    const handlePointer = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || !isInternalPageHref(anchor)) return;

      activateVeil(veilRef.current);
    };

    const handlePopState = () => activateVeil(veilRef.current);
    const handlePageShow = () => resetVeil(veilRef.current);

    document.addEventListener("click", handlePointer, true);
    window.addEventListener("popstate", handlePopState, true);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      document.removeEventListener("click", handlePointer, true);
      window.removeEventListener("popstate", handlePopState, true);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  return (
    <div ref={veilRef} className="aixco-route-veil" aria-hidden="true">
      <span className="aixco-route-veil__rule" />
    </div>
  );
}
