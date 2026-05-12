let activeScrollFrame: number | null = null;

function getPreferredScrollBehavior(behavior?: ScrollBehavior): ScrollBehavior {
  if (behavior) return behavior;
  if (typeof window === "undefined") return "auto";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

function easeInOutCubic(progress: number) {
  return progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

function cancelActiveScroll() {
  if (activeScrollFrame !== null) {
    window.cancelAnimationFrame(activeScrollFrame);
    activeScrollFrame = null;
  }
}

export function cancelGlideScroll() {
  cancelActiveScroll();
}

function animateScrollTo(top: number, behavior?: ScrollBehavior) {
  if (typeof window === "undefined") return;

  const resolvedBehavior = getPreferredScrollBehavior(behavior);
  const targetTop = Math.max(0, Math.round(top));

  cancelGlideScroll();

  if (resolvedBehavior !== "smooth") {
    window.scrollTo({ top: targetTop, left: 0, behavior: "auto" });
    return;
  }

  const startTop = window.scrollY;
  const distance = targetTop - startTop;

  if (Math.abs(distance) < 2) return;

  const duration = Math.min(1100, Math.max(700, Math.abs(distance) * 0.38));
  const startTime = window.performance.now();

  const step = (time: number) => {
    const progress = Math.min((time - startTime) / duration, 1);
    const nextTop = startTop + distance * easeInOutCubic(progress);
    window.scrollTo({ top: nextTop, left: 0, behavior: "auto" });

    if (progress < 1) {
      activeScrollFrame = window.requestAnimationFrame(step);
    } else {
      activeScrollFrame = null;
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
