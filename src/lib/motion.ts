import type { TargetAndTransition, Transition } from "framer-motion";

export type ReducedMotionPreference = "always" | "never" | "user";

export function getReducedMotionPreference(
  nodeEnv = process.env.NODE_ENV,
): ReducedMotionPreference {
  return nodeEnv === "production" ? "user" : "never";
}

export const premiumEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const revealTransition: Transition = {
  duration: 0.72,
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

export const premiumPress: TargetAndTransition = {
  scale: 0.985,
  transition: { duration: 0.08, ease: premiumEase },
};
