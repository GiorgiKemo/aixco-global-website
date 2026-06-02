import type { TargetAndTransition, Transition } from "framer-motion";

const MOTION_REDUCED_MOTION_WARNING_URL = "https://motion.dev/troubleshooting/reduced-motion-disabled";
let hasInstalledMotionReducedMotionWarningFilter = false;

export type ReducedMotionPreference = "always" | "never" | "user";

export function getReducedMotionPreference(
  nodeEnv = process.env.NODE_ENV,
): ReducedMotionPreference {
  return nodeEnv === "production" ? "user" : "never";
}

export function isMotionReducedMotionDevWarning(value: unknown) {
  return typeof value === "string" && value.includes(MOTION_REDUCED_MOTION_WARNING_URL);
}

export function installMotionReducedMotionDevWarningFilter(nodeEnv = process.env.NODE_ENV) {
  if (
    nodeEnv === "production" ||
    hasInstalledMotionReducedMotionWarningFilter ||
    typeof console === "undefined"
  ) {
    return;
  }

  const originalWarn = console.warn.bind(console);

  console.warn = (...args: unknown[]) => {
    if (args.some(isMotionReducedMotionDevWarning)) return;
    originalWarn(...args);
  };

  hasInstalledMotionReducedMotionWarningFilter = true;
}

export const premiumEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const revealTransition: Transition = {
  duration: 0.72,
  ease: premiumEase,
};

export const scrollRevealTransition: Transition = {
  duration: 0.82,
  ease: premiumEase,
};

export const imageSettleTransition: Transition = {
  duration: 1,
  ease: premiumEase,
};

export const reducedMotionTransition: Transition = {
  duration: 0.24,
  ease: "easeOut",
};

export const premiumSurfaceHover: TargetAndTransition = {
  y: -3,
  transition: { duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] },
};

export const premiumPress: TargetAndTransition = {
  scale: 0.985,
  transition: { duration: 0.08, ease: premiumEase },
};
