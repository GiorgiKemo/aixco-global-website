import Lenis from "lenis";

type GlideScrollOptions = {
  easing?: number;
  multiplier?: number;
  momentum?: number;
  storyEasing?: number;
  storyMultiplier?: number;
  storyMomentum?: number;
};

type ActiveLenis = InstanceType<typeof Lenis>;

let activeScrollFrame: number | null = null;
let activeScrollCancelCleanup: (() => void) | null = null;
let activeLenis: ActiveLenis | null = null;
let activeLenisFrame: number | null = null;

export const HASH_SCROLL_STABILIZE_DELAYS = [120, 320, 700, 1100] as const;

const nativeScrollSelector = [
  "[contenteditable='true']",
  "[data-native-scroll]",
  "[data-glide-scroll-native]",
].join(",");

function getPreferredScrollBehavior(behavior?: ScrollBehavior): ScrollBehavior {
  if (behavior) return behavior;
  if (typeof window === "undefined") return "auto";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

function easeInOutCubic(progress: number) {
  return progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function usesCoarsePointer() {
  return typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
}

function cancelActiveScroll() {
  if (activeScrollFrame !== null) {
    window.cancelAnimationFrame(activeScrollFrame);
    activeScrollFrame = null;
  }

  activeScrollCancelCleanup?.();
  activeScrollCancelCleanup = null;
}

function installActiveScrollUserCancel() {
  if (typeof window === "undefined") return;

  activeScrollCancelCleanup?.();

  const cancelOnUserInput = () => cancelActiveScroll();
  const options: AddEventListenerOptions = { capture: true, passive: true, once: true };

  window.addEventListener("wheel", cancelOnUserInput, options);
  window.addEventListener("touchstart", cancelOnUserInput, options);
  window.addEventListener("pointerdown", cancelOnUserInput, options);
  window.addEventListener("keydown", cancelOnUserInput, { capture: true, once: true });

  activeScrollCancelCleanup = () => {
    window.removeEventListener("wheel", cancelOnUserInput, options);
    window.removeEventListener("touchstart", cancelOnUserInput, options);
    window.removeEventListener("pointerdown", cancelOnUserInput, options);
    window.removeEventListener("keydown", cancelOnUserInput, { capture: true });
  };
}

export function cancelGlideScroll() {
  if (activeLenis) {
    activeLenis.stop();
    activeLenis.start();
  }
}

function canElementScrollInDirection(element: HTMLElement, deltaY: number) {
  const overflowY = window.getComputedStyle(element).overflowY;
  if (!/(auto|scroll|overlay)/.test(overflowY)) return false;

  const maxScrollTop = element.scrollHeight - element.clientHeight;
  if (maxScrollTop <= 1) return false;

  return deltaY < 0 ? element.scrollTop > 0 : element.scrollTop < maxScrollTop;
}

function shouldUseNativeWheelScroll(event: WheelEvent) {
  const deltaY = event.deltaY;
  if (!event.cancelable || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return true;
  if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return true;
  if (Math.abs(deltaY) < 1) return true;

  let node = event.target instanceof Element ? event.target : null;
  while (node && node !== document.documentElement) {
    if (node instanceof HTMLElement) {
      if (node.matches(nativeScrollSelector)) return true;
      if (canElementScrollInDirection(node, deltaY)) return true;
    }
    node = node.parentElement;
  }

  return false;
}

function isStoryScrollExperience() {
  return (
    document.documentElement.dataset.homeExperience === "story" ||
    document.body.classList.contains("home-desktop-story-boot")
  );
}

function destroyActiveLenis() {
  if (activeLenisFrame !== null && typeof window !== "undefined") {
    window.cancelAnimationFrame(activeLenisFrame);
    activeLenisFrame = null;
  }

  activeLenis?.destroy();
  activeLenis = null;
}

export function installGlideScroll({
  easing = 0.16,
  multiplier = 1.05,
  momentum = 0,
  storyEasing,
  storyMultiplier,
  storyMomentum,
}: GlideScrollOptions = {}) {
  if (typeof window === "undefined" || typeof document === "undefined") return () => {};
  if (usesCoarsePointer()) return () => {};

  destroyActiveLenis();

  const resolvedEasing = clamp(easing, 0.04, 0.35);
  const resolvedMultiplier = clamp(multiplier, 0.35, 2);
  const resolvedMomentum = clamp(momentum, 0, 1);
  const resolvedStoryEasing = clamp(storyEasing ?? resolvedEasing, 0.04, 0.35);
  const resolvedStoryMultiplier = clamp(storyMultiplier ?? resolvedMultiplier, 0.25, 2);
  const resolvedStoryMomentum = clamp(storyMomentum ?? resolvedMomentum, 0, 1);
  const isStoryExperience = isStoryScrollExperience();
  const activeEasing = isStoryExperience ? resolvedStoryEasing : resolvedEasing;
  const activeMultiplier = isStoryExperience
    ? resolvedStoryMultiplier + resolvedStoryMomentum
    : resolvedMultiplier + resolvedMomentum;

  activeLenis = new Lenis({
    autoRaf: false,
    lerp: activeEasing,
    smoothWheel: true,
    syncTouch: false,
    touchMultiplier: 1,
    wheelMultiplier: Number(activeMultiplier.toFixed(3)),
    gestureOrientation: "vertical",
    prevent: (node) => node instanceof HTMLElement && node.matches(nativeScrollSelector),
    virtualScroll: ({ event }) => {
      cancelActiveScroll();
      if (event instanceof WheelEvent) {
        return !shouldUseNativeWheelScroll(event);
      }
      return true;
    },
  });

  const raf = (time: number) => {
    activeLenis?.raf(time);
    activeLenisFrame = window.requestAnimationFrame(raf);
  };

  activeLenisFrame = window.requestAnimationFrame(raf);

  document.documentElement.dataset.glideScroll = "enabled";

  return () => {
    document.documentElement.removeAttribute("data-glide-scroll");
    destroyActiveLenis();
  };
}

function animateScrollTo(top: number, behavior?: ScrollBehavior) {
  if (typeof window === "undefined") return;

  const resolvedBehavior = getPreferredScrollBehavior(behavior);
  const targetTop = Math.max(0, Math.round(top));

  cancelGlideScroll();
  cancelActiveScroll();

  if (activeLenis) {
    activeLenis.scrollTo(targetTop, { immediate: resolvedBehavior !== "smooth" });
    return;
  }

  if (resolvedBehavior !== "smooth") {
    window.scrollTo({ top: targetTop, left: 0, behavior: "auto" });
    return;
  }

  const startTop = window.scrollY;
  const distance = targetTop - startTop;

  if (Math.abs(distance) < 2) return;

  const duration = Math.min(1100, Math.max(700, Math.abs(distance) * 0.38));
  const startTime = window.performance.now();
  installActiveScrollUserCancel();

  const step = (time: number) => {
    if (activeScrollFrame === null) return;

    const progress = Math.min((time - startTime) / duration, 1);
    const nextTop = startTop + distance * easeInOutCubic(progress);
    window.scrollTo({ top: nextTop, left: 0, behavior: "auto" });

    if (progress < 1) {
      activeScrollFrame = window.requestAnimationFrame(step);
    } else {
      activeScrollFrame = null;
      activeScrollCancelCleanup?.();
      activeScrollCancelCleanup = null;
    }
  };

  activeScrollFrame = window.requestAnimationFrame(step);
}

export function scrollToPageTop(behavior?: ScrollBehavior) {
  animateScrollTo(0, behavior);
}

export function scrollToHash(hash: string, behavior?: ScrollBehavior) {
  if (typeof document === "undefined") return false;

  const id = decodeURIComponent(hash.replace(/^#/, ""));
  if (!id) {
    scrollToPageTop(behavior);
    return true;
  }

  const target = document.getElementById(id);
  if (!target) return false;

  const scrollMarginTop = Number.parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
  const targetTop = window.scrollY + target.getBoundingClientRect().top - scrollMarginTop;
  animateScrollTo(targetTop, behavior);
  return true;
}

export function scheduleHashScrollStabilization(hash: string) {
  if (typeof window === "undefined") return [];

  return HASH_SCROLL_STABILIZE_DELAYS.map((delay) =>
    window.setTimeout(() => {
      scrollToHash(hash, "auto");
    }, delay),
  );
}
