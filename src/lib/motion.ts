import type { Transition } from "framer-motion";

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

export const premiumSurfaceHover = {
  y: -5,
  scale: 1.012,
  transition: { duration: 0.32, ease: premiumEase },
};

export const premiumPress = {
  scale: 0.98,
  transition: { duration: 0.12, ease: "easeOut" },
};
