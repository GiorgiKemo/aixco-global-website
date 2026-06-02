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
  staggerMs = 130,
  targetSelector = DEFAULT_TARGET_SELECTOR,
  threshold = 0.12,
}: ScrollRevealProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useHydratedReducedMotion();
  const targetsRef = useRef<HTMLElement[]>([]);
  const revealedCountRef = useRef(0);

  const collectTargets = useCallback(() => {
    const root = rootRef.current;
    if (!root) return [];
    return Array.from(root.querySelectorAll<HTMLElement>(targetSelector));
  }, [targetSelector]);

  useLayoutEffect(() => {
    const targets = collectTargets();
    targetsRef.current = targets;

    targets.forEach((target, index) => {
      const kind = getRevealKind(target);
      target.dataset.motionReveal = "armed";
      target.dataset.motionKind = kind;
      target.style.setProperty("--motion-index", String(index));
      target.style.setProperty("--motion-delay", `${index * staggerMs}ms`);

      if (target.matches(MEDIA_SELECTOR)) {
        target.dataset.motionRevealMedia = "true";
      }

      target.querySelectorAll<HTMLElement>(MEDIA_SELECTOR).forEach((media) => {
        media.dataset.motionRevealMedia = "true";
        media.style.setProperty("--motion-delay", `${index * staggerMs}ms`);
      });
    });
  }, [collectTargets, staggerMs]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === "undefined") return;
    root.dataset.motionPreference = shouldReduceMotion ? "reduced" : "standard";

    const targets = targetsRef.current.length ? targetsRef.current : collectTargets();
    if (!targets.length) return;

    const revealAll = () => {
      root.dataset.motionRevealRoot = "visible";
      targets.forEach((target) => {
        target.dataset.motionReveal = "visible";
      });
      revealedCountRef.current = targets.length;
    };

    const revealTarget = (target: HTMLElement) => {
      if (target.dataset.motionReveal === "visible") return;
      target.dataset.motionReveal = "visible";
      root.dataset.motionRevealRoot = "visible";
      revealedCountRef.current += 1;
    };

    const IntersectionObserverCtor = window.IntersectionObserver;

    if (typeof IntersectionObserverCtor !== "function") {
      revealAll();
      return;
    }

    const observer = new IntersectionObserverCtor(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          revealTarget(entry.target as HTMLElement);
        });

        if (revealedCountRef.current >= targets.length) {
          observer.disconnect();
        }
      },
      { rootMargin, threshold },
    );

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, [collectTargets, rootMargin, shouldReduceMotion, threshold]);

  return (
    <div ref={rootRef} className={className} data-motion-reveal-root="armed">
      {children}
    </div>
  );
}
