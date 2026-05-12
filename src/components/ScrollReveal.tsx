"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useHydratedReducedMotion } from "@/hooks/use-hydrated-reduced-motion";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  rootMargin?: string;
  staggerMs?: number;
  targetSelector?: string;
  threshold?: number;
};

const DEFAULT_TARGET_SELECTOR = '[data-reveal="true"], .scroll-reveal';
const MEDIA_SELECTOR = "img, picture, video";

function getRevealKind(target: HTMLElement) {
  if (target.classList.contains("mac-card") || target.classList.contains("data-panel") || target.matches("article, button, a")) return "card";
  if (target.querySelector(MEDIA_SELECTOR)) return "image";
  return "text";
}

export function ScrollReveal({
  children,
  className = "contents",
  rootMargin = "0px 0px -10% 0px",
  staggerMs = 100,
  targetSelector = DEFAULT_TARGET_SELECTOR,
  threshold = 0.12,
}: ScrollRevealProps) {
  const scope = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useHydratedReducedMotion();
  const targetsRef = useRef<HTMLElement[]>([]);
  const hasPlayedRef = useRef(false);

  const collectTargets = useCallback(() => {
    const root = scope.current;
    if (!root) return [];
    return Array.from(root.querySelectorAll<HTMLElement>(targetSelector));
  }, [scope, targetSelector]);

  useLayoutEffect(() => {
    const targets = collectTargets();
    const mediaTargets: HTMLElement[] = [];
    targetsRef.current = targets;

    targets.forEach((target, index) => {
      const kind = getRevealKind(target);
      target.dataset.motionReveal = "armed";
      target.dataset.motionKind = kind;
      target.style.setProperty("--motion-index", String(index));
      target.style.setProperty("--motion-delay", shouldReduceMotion ? "0ms" : `${Math.min(index * staggerMs, 360)}ms`);

      if (target.matches(MEDIA_SELECTOR)) {
        target.dataset.motionRevealMedia = "true";
        mediaTargets.push(target);
      }

      target.querySelectorAll<HTMLElement>(MEDIA_SELECTOR).forEach((media) => {
        media.dataset.motionRevealMedia = "true";
        mediaTargets.push(media);
      });
    });

    if (!targets.length) return;
  }, [collectTargets, shouldReduceMotion, staggerMs]);

  useEffect(() => {
    const root = scope.current;
    if (!root || typeof window === "undefined") return;

    const targets = targetsRef.current.length ? targetsRef.current : collectTargets();
    if (!targets.length) return;

    const reveal = () => {
      if (hasPlayedRef.current) return;
      hasPlayedRef.current = true;
      root.dataset.motionRevealRoot = "visible";

      targets.forEach((target) => {
        target.dataset.motionReveal = "visible";
      });

    };

    const IntersectionObserverCtor = window.IntersectionObserver;

    if (typeof IntersectionObserverCtor !== "function") {
      reveal();
      return;
    }

    const observer = new IntersectionObserverCtor(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        reveal();
        observer.disconnect();
      },
      { rootMargin, threshold },
    );

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, [collectTargets, rootMargin, threshold]);

  return (
    <div ref={scope} className={className} data-motion-reveal-root="armed">
      {children}
    </div>
  );
}
