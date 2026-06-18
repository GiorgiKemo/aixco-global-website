import type { Variants } from "@/lib/framer-motion";

export const heroEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const heroIntroText =
  "";

export const heroOpportunityText = "Emerging Market Opportunities with AIXCO";
export const heroOpportunityFootnote =
  "Own property in some of the world's fastest-growing destinations.";

export const heroStoryStatementLines = [
  "Emerging Market Opportunities",
  "with AIXCO",
] as const;

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
