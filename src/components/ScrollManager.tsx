'use client';

import {
  cancelGlideScroll,
  installGlideScroll,
  scheduleHashScrollStabilization,
  scrollToHash,
  scrollToPageTop,
} from '@/lib/smooth-scroll';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

const glideScrollOptions = {
  easing: 0.18,
  multiplier: 1,
  storyEasing: 0.14,
  storyMultiplier: 0.86,
  storyMomentum: 0.04,
  storyWheelCarry: 0.1,
  storyWheelCarryWindowMs: 260,
} as const;

const glideScrollConfigSignature = [
  glideScrollOptions.easing,
  glideScrollOptions.multiplier,
  glideScrollOptions.storyEasing,
  glideScrollOptions.storyMultiplier,
  glideScrollOptions.storyMomentum,
  glideScrollOptions.storyWheelCarry,
  glideScrollOptions.storyWheelCarryWindowMs,
].join(':');

const PENDING_HASH_SCROLL_KEY = 'aixco-pending-hash-scroll';

function rememberPendingHashScroll(hash: string) {
  if (!hash) return;

  try {
    window.sessionStorage.setItem(PENDING_HASH_SCROLL_KEY, hash);
  } catch {
    // Session storage can be unavailable in restricted browser modes.
  }
}

function getGlideScrollMode() {
  return document.documentElement.dataset.homeExperience === 'story' ||
    document.body.classList.contains('home-desktop-story-boot')
    ? 'story'
    : 'page';
}

export function ScrollManager() {
  const pathname = usePathname();
  const firstRenderRef = useRef(true);
  const hashStabilizeTimersRef = useRef<number[]>([]);

  const clearHashStabilizeTimers = useCallback(() => {
    hashStabilizeTimersRef.current.forEach((timer) =>
      window.clearTimeout(timer)
    );
    hashStabilizeTimersRef.current = [];
  }, []);

  const stabilizeHashScroll = useCallback(
    (hash: string) => {
      clearHashStabilizeTimers();
      hashStabilizeTimersRef.current = scheduleHashScrollStabilization(hash);
    },
    [clearHashStabilizeTimers]
  );

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('scrollRestoration' in window.history)
    ) {
      return undefined;
    }

    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    let cleanupGlideScroll: (() => void) | null = null;
    let frame: number | null = null;
    let activeSignature = '';

    const installLatestGlideScroll = () => {
      frame = null;

      const mode = getGlideScrollMode();
      const nextSignature = `${mode}:${glideScrollConfigSignature}`;
      if (
        activeSignature === nextSignature &&
        document.documentElement.dataset.glideScrollSignature === nextSignature
      ) {
        return;
      }

      cleanupGlideScroll?.();
      activeSignature = nextSignature;
      cleanupGlideScroll = installGlideScroll({
        ...glideScrollOptions,
        signature: nextSignature,
      });
    };

    const scheduleInstall = () => {
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }
      frame = window.requestAnimationFrame(installLatestGlideScroll);
    };

    scheduleInstall();

    const observer = new MutationObserver(scheduleInstall);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-home-experience'],
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    const devRefreshInterval =
      process.env.NODE_ENV === 'development'
        ? window.setInterval(scheduleInstall, 1000)
        : null;

    window.addEventListener('pageshow', scheduleInstall);

    return () => {
      observer.disconnect();
      window.removeEventListener('pageshow', scheduleInstall);
      if (devRefreshInterval !== null) {
        window.clearInterval(devRefreshInterval);
      }
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }
      cleanupGlideScroll?.();
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    cancelGlideScroll();
    const isFirstRender = firstRenderRef.current;
    firstRenderRef.current = false;

    const frame = window.requestAnimationFrame(() => {
      const hash = window.location.hash;
      if (hash) {
        rememberPendingHashScroll(hash);
        const didScroll = scrollToHash(
          hash,
          isFirstRender ? 'auto' : undefined
        );
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
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        rememberPendingHashScroll(hash);
        scrollToHash(hash);
        stabilizeHashScroll(hash);
      } else {
        clearHashStabilizeTimers();
        scrollToPageTop();
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [clearHashStabilizeTimers, stabilizeHashScroll]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const clearOnUserInput = () => clearHashStabilizeTimers();
    const options: AddEventListenerOptions = { capture: true, passive: true };

    window.addEventListener('wheel', clearOnUserInput, options);
    window.addEventListener('touchstart', clearOnUserInput, options);
    window.addEventListener('pointerdown', clearOnUserInput, options);
    window.addEventListener('keydown', clearOnUserInput, { capture: true });

    return () => {
      clearHashStabilizeTimers();
      window.removeEventListener('wheel', clearOnUserInput, options);
      window.removeEventListener('touchstart', clearOnUserInput, options);
      window.removeEventListener('pointerdown', clearOnUserInput, options);
      window.removeEventListener('keydown', clearOnUserInput, {
        capture: true,
      });
    };
  }, [clearHashStabilizeTimers]);

  return null;
}
