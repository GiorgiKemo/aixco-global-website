import type { Variants } from "@/lib/framer-motion";

export const heroEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const heroIntroText =
  "Buy, sell, and broker real estate with AIXCO—from apartment purchases in Batumi to end-to-end property administration.";

export const heroPriceText = "Starting from \u20ac10,000";

export const headlineVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.22,
      staggerChildren: 0.24,
    },
  },
};

export const headlineLineVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    scale: 0.992,
    filter: "blur(16px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 1.18,
      ease: heroEase,
    },
  },
};

export const reducedLineVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};
