import Lenis from "lenis";

type GlideScrollOptions = {
  easing?: number;
  multiplier?: number;
  momentum?: number;
  wheelCarry?: number;
  wheelCarryWindowMs?: number;
  storyEasing?: number;
  storyMultiplier?: number;
  storyMomentum?: number;
  storyWheelCarry?: number;
  storyWheelCarryWindowMs?: number;
  signature?: string;
};

type ActiveLenis = InstanceType<typeof Lenis>;

let activeScrollFrame: number | null = null;
let activeScrollCancelCleanup: (() => void) | null = null;
let activeLenis: ActiveLenis | null = null;
let activeLenisFrame: number | null = null;

const HASH_SCROLL_STABILIZE_DELAYS = [120, 320, 700, 1100] as const;
export const glideScrollFrameEvent = "aixco:glide-scroll";

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

function clearGlideScrollDataset() {
  document.documentElement.removeAttribute("data-glide-scroll");
  document.documentElement.removeAttribute("data-glide-scroll-profile");
  document.documentElement.removeAttribute("data-glide-scroll-lerp");
  document.documentElement.removeAttribute("data-glide-scroll-wheel-multiplier");
  document.documentElement.removeAttribute("data-glide-scroll-wheel-carry");
  document.documentElement.removeAttribute("data-glide-scroll-signature");
}

export function installGlideScroll({
  easing = 0.16,
  multiplier = 1.05,
  momentum = 0,
  wheelCarry = 0,
  wheelCarryWindowMs = 420,
  storyEasing,
  storyMultiplier,
  storyMomentum,
  storyWheelCarry,
  storyWheelCarryWindowMs,
  signature,
}: GlideScrollOptions = {}) {
  if (typeof window === "undefined" || typeof document === "undefined") return () => {};
  if (usesCoarsePointer()) return () => {};

  destroyActiveLenis();

  const resolvedEasing = clamp(easing, 0.04, 0.35);
  const resolvedMultiplier = clamp(multiplier, 0.35, 2);
  const resolvedMomentum = clamp(momentum, 0, 1);
  const resolvedWheelCarry = clamp(wheelCarry, 0, 0.7);
  const resolvedWheelCarryWindowMs = clamp(wheelCarryWindowMs, 80, 900);
  const resolvedStoryEasing = clamp(storyEasing ?? resolvedEasing, 0.04, 0.35);
  const resolvedStoryMultiplier = clamp(storyMultiplier ?? resolvedMultiplier, 0.25, 2);
  const resolvedStoryMomentum = clamp(storyMomentum ?? resolvedMomentum, 0, 1);
  const resolvedStoryWheelCarry = clamp(storyWheelCarry ?? resolvedWheelCarry, 0, 0.7);
  const resolvedStoryWheelCarryWindowMs = clamp(storyWheelCarryWindowMs ?? resolvedWheelCarryWindowMs, 80, 900);
  const isStoryExperience = isStoryScrollExperience();
  const activeEasing = isStoryExperience ? resolvedStoryEasing : resolvedEasing;
  const activeMultiplier = isStoryExperience
    ? resolvedStoryMultiplier + resolvedStoryMomentum
    : resolvedMultiplier + resolvedMomentum;
  const activeWheelMultiplier = Number(activeMultiplier.toFixed(3));
  const activeWheelCarry = isStoryExperience ? resolvedStoryWheelCarry : resolvedWheelCarry;
  const activeWheelCarryWindowMs = isStoryExperience ? resolvedStoryWheelCarryWindowMs : resolvedWheelCarryWindowMs;
  let previousWheelTime = 0;
  let previousWheelDeltaY = 0;
  let previousScrollY = window.scrollY;

  activeLenis = new Lenis({
    autoRaf: false,
    lerp: activeEasing,
    smoothWheel: true,
    syncTouch: false,
    touchMultiplier: 1,
    wheelMultiplier: activeWheelMultiplier,
    gestureOrientation: "vertical",
    prevent: (node) => node instanceof HTMLElement && node.matches(nativeScrollSelector),
    virtualScroll: (data) => {
      const { event } = data;
      cancelActiveScroll();
      if (event instanceof WheelEvent) {
        if (shouldUseNativeWheelScroll(event)) return false;

        if (activeWheelCarry > 0 && Math.abs(data.deltaY) >= 1) {
          const now = event.timeStamp || window.performance.now();
          const gap = now - previousWheelTime;
          const rawDeltaY = data.deltaY;
          const direction = Math.sign(rawDeltaY);
          const previousDirection = Math.sign(previousWheelDeltaY);

          if (
            direction !== 0 &&
            direction === previousDirection &&
            gap > 0 &&
            gap <= activeWheelCarryWindowMs
          ) {
            const fade = 1 - gap / activeWheelCarryWindowMs;
            const maxCarry = Math.abs(rawDeltaY) * 0.55;
            const carry = clamp(previousWheelDeltaY * activeWheelCarry * fade, -maxCarry, maxCarry);
            data.deltaY = rawDeltaY + carry;
          }

          previousWheelDeltaY = data.deltaY;
          previousWheelTime = now;
        }

        return true;
      }
      return true;
    },
  });

  const raf = (time: number) => {
    activeLenis?.raf(time);
    const nextScrollY = window.scrollY;
    if (Math.abs(nextScrollY - previousScrollY) >= 0.1) {
      previousScrollY = nextScrollY;
      window.dispatchEvent(new CustomEvent(glideScrollFrameEvent, { detail: { scrollY: nextScrollY } }));
    }
    activeLenisFrame = window.requestAnimationFrame(raf);
  };

  activeLenisFrame = window.requestAnimationFrame(raf);

  document.documentElement.dataset.glideScroll = "enabled";
  document.documentElement.dataset.glideScrollProfile = isStoryExperience ? "story" : "page";
  document.documentElement.dataset.glideScrollLerp = activeEasing.toFixed(3);
  document.documentElement.dataset.glideScrollWheelMultiplier = activeWheelMultiplier.toFixed(3);
  document.documentElement.dataset.glideScrollWheelCarry = activeWheelCarry.toFixed(3);
  if (signature) {
    document.documentElement.dataset.glideScrollSignature = signature;
  } else {
    document.documentElement.removeAttribute("data-glide-scroll-signature");
  }

  return () => {
    clearGlideScrollDataset();
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
