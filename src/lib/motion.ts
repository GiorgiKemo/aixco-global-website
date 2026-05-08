import type { TargetAndTransition, Transition } from "framer-motion";

export const premiumEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const revealTransition: Transition = {
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
