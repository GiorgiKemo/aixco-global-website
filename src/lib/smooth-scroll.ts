type GlideScrollOptions = {
  easing?: number;
  multiplier?: number;
};

let activeScrollFrame: number | null = null;
let activeScrollCancelCleanup: (() => void) | null = null;
let activeGlideFrame: number | null = null;
let glideCurrentTop = 0;
let glideTargetTop = 0;

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

function getMaxScrollTop() {
  if (typeof document === "undefined" || typeof window === "undefined") return 0;
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
  if (activeGlideFrame !== null) {
    window.cancelAnimationFrame(activeGlideFrame);
    activeGlideFrame = null;
  }

  if (typeof window !== "undefined") {
    glideCurrentTop = window.scrollY;
    glideTargetTop = window.scrollY;
  }
}

function normalizeWheelDelta(event: WheelEvent) {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * 18;
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * window.innerHeight;
  return event.deltaY;
}

function canElementScrollInDirection(element: HTMLElement, deltaY: number) {
  const overflowY = window.getComputedStyle(element).overflowY;
  if (!/(auto|scroll|overlay)/.test(overflowY)) return false;

  const maxScrollTop = element.scrollHeight - element.clientHeight;
  if (maxScrollTop <= 1) return false;

  return deltaY < 0 ? element.scrollTop > 0 : element.scrollTop < maxScrollTop;
}

function shouldUseNativeWheelScroll(event: WheelEvent, deltaY: number) {
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

export function installGlideScroll({ easing = 0.16, multiplier = 1.05 }: GlideScrollOptions = {}) {
  if (typeof window === "undefined" || typeof document === "undefined") return () => {};
  if (usesCoarsePointer()) return () => {};

  const resolvedEasing = clamp(easing, 0.08, 1);
  const resolvedMultiplier = clamp(multiplier, 0.35, 2);

  const step = () => {
    glideCurrentTop += (glideTargetTop - glideCurrentTop) * resolvedEasing;

    if (Math.abs(glideTargetTop - glideCurrentTop) < 0.5) {
      window.scrollTo({ top: glideTargetTop, left: 0, behavior: "auto" });
      activeGlideFrame = null;
      return;
    }

    window.scrollTo({ top: glideCurrentTop, left: 0, behavior: "auto" });
    activeGlideFrame = window.requestAnimationFrame(step);
  };

  const onWheel = (event: WheelEvent) => {
    const deltaY = normalizeWheelDelta(event);
    if (shouldUseNativeWheelScroll(event, deltaY)) return;

    event.preventDefault();
    cancelActiveScroll();

    glideCurrentTop = activeGlideFrame === null ? window.scrollY : glideCurrentTop;
    glideTargetTop = clamp((activeGlideFrame === null ? window.scrollY : glideTargetTop) + deltaY * resolvedMultiplier, 0, getMaxScrollTop());

    if (activeGlideFrame === null) {
      activeGlideFrame = window.requestAnimationFrame(step);
    }
  };

  document.documentElement.dataset.glideScroll = "enabled";
  document.addEventListener("wheel", onWheel, { passive: false });

  return () => {
    document.removeEventListener("wheel", onWheel);
    document.documentElement.removeAttribute("data-glide-scroll");
    cancelGlideScroll();
  };
}

function animateScrollTo(top: number, behavior?: ScrollBehavior) {
  if (typeof window === "undefined") return;

  const resolvedBehavior = getPreferredScrollBehavior(behavior);
  const targetTop = Math.max(0, Math.round(top));

  cancelGlideScroll();
  cancelActiveScroll();

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
