"use client";

import { Children, useEffect, useState, type ReactNode } from "react";
import { motion, type Variants } from "@/lib/framer-motion";
import { imageSettleTransition, premiumEase, reducedMotionTransition, revealTransition } from "@/lib/motion";
import { useHydratedReducedMotion } from "@/hooks/use-hydrated-reduced-motion";

export const scrollRevealViewport = {
  once: true,
  amount: 0.2 as const,
};

export const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: revealTransition,
  },
};

export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: revealTransition,
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.06,
    },
  },
};

export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: revealTransition,
  },
};

type MotionRevealProps = {
  children: ReactNode;
  className?: string;
  variant?: "fadeUp" | "fadeIn";
  delay?: number;
};

export function MotionReveal({
  children,
  className,
  variant = "fadeUp",
  delay = 0,
}: MotionRevealProps) {
  const shouldReduceMotion = useHydratedReducedMotion();
  const variants = variant === "fadeIn" ? fadeIn : fadeUp;

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={scrollRevealViewport}
      transition={shouldReduceMotion ? reducedMotionTransition : { ...revealTransition, delay }}
    >
      {children}
    </motion.div>
  );
}

type MotionRevealStaggerProps = {
  children: ReactNode;
  className?: string;
};

export function MotionRevealStagger({ children, className }: MotionRevealStaggerProps) {
  const shouldReduceMotion = useHydratedReducedMotion();

  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={scrollRevealViewport}
      transition={shouldReduceMotion ? reducedMotionTransition : undefined}
    >
      {children}
    </motion.div>
  );
}

type MotionRevealItemProps = {
  children: ReactNode;
  className?: string;
};

export function MotionRevealItem({ children, className }: MotionRevealItemProps) {
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
}

type StorySceneRevealProps = {
  children: ReactNode;
  isActive: boolean;
  className?: string;
};

export const storyMediaReveal: Variants = {
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

export const storyMediaRevealReverse: Variants = {
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
  const [hasRevealed, setHasRevealed] = useState(isActive);

  useEffect(() => {
    if (isActive) {
      setHasRevealed(true);
    }
  }, [isActive]);

  const variants = reverse ? storyMediaRevealReverse : storyMediaReveal;

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      animate={hasRevealed ? "visible" : "hidden"}
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
  const shouldReduceMotion = useHydratedReducedMotion();
  const [hasRevealed, setHasRevealed] = useState(isActive);

  useEffect(() => {
    if (isActive) {
      setHasRevealed(true);
    }
  }, [isActive]);

  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      animate={hasRevealed ? "visible" : "hidden"}
      transition={
        shouldReduceMotion
          ? reducedMotionTransition
          : {
              staggerChildren: 0.1,
              delayChildren: 0.08,
              ease: premiumEase,
            }
      }
    >
      {Children.map(children, (child, index) => (
        <motion.div key={index} variants={staggerItem}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
