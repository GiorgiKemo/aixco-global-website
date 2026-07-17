"use client";

import { Children, type ReactNode } from "react";
import { motion, type Variants } from "@/lib/framer-motion";
import { imageSettleTransition, premiumEase, reducedMotionTransition } from "@/lib/motion";
import { useHydratedReducedMotion } from "@/hooks/use-hydrated-reduced-motion";

type StorySceneRevealProps = {
  children: ReactNode;
  isActive: boolean;
  className?: string;
};

const storyMediaReveal: Variants = {
  hidden: {
    opacity: 0,
    x: 56,
    scale: 1.05,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 1.05,
      ease: premiumEase,
      delay: 0.1,
    },
  },
};

const storyMediaRevealReverse: Variants = {
  hidden: {
    opacity: 0,
    x: -56,
    scale: 1.05,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 1.05,
      ease: premiumEase,
      delay: 0.1,
    },
  },
};

type StoryMediaRevealProps = {
  children: ReactNode;
  isActive: boolean;
  reverse?: boolean;
  className?: string;
};

export function StoryMediaReveal({ children, isActive, reverse = false, className }: StoryMediaRevealProps) {
  const shouldReduceMotion = useHydratedReducedMotion();
  const variants = reverse ? storyMediaRevealReverse : storyMediaReveal;

  return (
    <motion.div
      className={["story-media-reveal", className].filter(Boolean).join(" ")}
      data-story-media-reveal-active={isActive ? "true" : "false"}
      variants={variants}
      initial="hidden"
      animate={isActive ? "visible" : "hidden"}
      transition={shouldReduceMotion ? reducedMotionTransition : undefined}
    >
      <motion.div
        className="story-media-panel__ken-burns h-full w-full"
        initial={false}
        animate={
          shouldReduceMotion
            ? { scale: 1 }
            : isActive
              ? { scale: 1.04 }
              : { scale: 1.08 }
        }
        transition={
          shouldReduceMotion
            ? reducedMotionTransition
            : isActive
              ? { duration: 14, ease: "linear" }
              : imageSettleTransition
        }
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function StorySceneReveal({ children, isActive, className }: StorySceneRevealProps) {
  return (
    <div
      className={["story-scene-reveal", className].filter(Boolean).join(" ")}
      data-story-scene-reveal-active={isActive ? "true" : "false"}
    >
      {Children.map(children, (child, index) => (
        <div key={index}>{child}</div>
      ))}
    </div>
  );
}
