import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useState } from "react";
import { CountUpText } from "@/components/CountUpText";
import heroBatumiCity from "@/assets/hero-batumi-city.jpg";

const heroEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const headlineVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.22,
      staggerChildren: 0.24,
    },
  },
};

const headlineLineVariants: Variants = {
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

const amountVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
    scale: 0.985,
    filter: "blur(14px)",
    textShadow: "0 0 0 rgb(240 189 93 / 0)",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    textShadow: "0 10px 36px rgb(240 189 93 / 0.28)",
    transition: {
      duration: 1.05,
      ease: heroEase,
      delay: 0.5,
    },
  },
};

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const [isHeroReady, setIsHeroReady] = useState(false);
  const hiddenTextState = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(10px)" };

  const reducedLineVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-background">
      <motion.img
        src={heroBatumiCity}
        alt="Panoramic city view of Batumi, Georgia"
        className="absolute inset-0 h-full w-full object-cover object-center"
        width={5630}
        height={2999}
        loading="eager"
        onLoad={() => setIsHeroReady(true)}
        onError={() => setIsHeroReady(true)}
        initial={shouldReduceMotion ? { scale: 1.006, opacity: 0.98 } : { scale: 1.055, opacity: 0.92 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: shouldReduceMotion ? 0.25 : 1.35, ease: heroEase }}
      />

      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.03)_0%,rgb(0_0_0/0.04)_22%,rgb(0_0_0/0.18)_42%,rgb(0_0_0/0.42)_70%,rgb(0_0_0/0.24)_100%)]"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[62%] bg-[radial-gradient(ellipse_at_center,rgb(0_0_0/0.42)_0%,rgb(0_0_0/0.24)_42%,transparent_72%)]"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-[100svh] flex-col items-center px-6 pt-[45vh] text-center md:pt-[48vh]">
        <motion.h1
          className="max-w-[82rem] text-4xl font-semibold leading-[1.04] tracking-[-0.035em] text-white drop-shadow-[0_8px_28px_rgb(0_0_0/0.46)] [perspective:900px] sm:text-5xl md:text-6xl lg:text-[5rem]"
          initial="hidden"
          animate={isHeroReady ? "visible" : "hidden"}
          variants={shouldReduceMotion ? { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } } : headlineVariants}
        >
          <span className="block pb-[0.04em]">
            <motion.span
              className="block origin-bottom will-change-[opacity,transform,filter]"
              variants={shouldReduceMotion ? reducedLineVariants : headlineLineVariants}
            >
              Quality real-estate participation,
            </motion.span>
          </span>
          <span className="block pb-[0.08em]">
            <motion.span
              className="block origin-bottom will-change-[opacity,transform,filter]"
              variants={shouldReduceMotion ? reducedLineVariants : headlineLineVariants}
            >
              opened from{" "}
              <motion.span
                className="relative inline-block whitespace-nowrap font-serif-display italic font-normal text-[#f0bd5d]"
                variants={shouldReduceMotion ? reducedLineVariants : amountVariants}
              >
                <CountUpText value={"\u20ac1,000"} delay={isHeroReady ? 0.7 : 999} duration={1.25} />
              </motion.span>
              .
            </motion.span>
          </span>
        </motion.h1>

        <motion.p
          className="mt-7 max-w-2xl text-base leading-relaxed text-white/85 drop-shadow-[0_3px_18px_rgb(0_0_0/0.42)] md:text-lg"
          initial={hiddenTextState}
          animate={isHeroReady ? { opacity: 1, y: 0, filter: "blur(0px)" } : hiddenTextState}
          transition={{ duration: shouldReduceMotion ? 0.7 : 1.02, ease: shouldReduceMotion ? "easeOut" : heroEase, delay: shouldReduceMotion ? 0.42 : 1.02 }}
        >
          Selected projects in Dubai and Batumi, structured to institutional
          standards. One platform. Two routes. Sixteen years of execution.
        </motion.p>

        <motion.a
          href="#about"
          aria-label="Scroll to About section"
          className="mt-8 inline-flex h-8 w-8 items-center justify-center text-[#f0bd5d] drop-shadow-[0_4px_14px_rgb(0_0_0/0.45)] transition hover:text-[#ffd47a]"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
          animate={isHeroReady ? (shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: [0, 7, 0] }) : { opacity: 0, y: 0 }}
          transition={
            shouldReduceMotion
              ? { duration: 0.5, ease: "easeOut", delay: 0.74 }
              : {
                  opacity: { duration: 0.7, delay: 1.18, ease: heroEase },
                  y: { duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1.34 },
                }
          }
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.94 }}
        >
          <ChevronDown className="h-5 w-5" strokeWidth={2.5} />
        </motion.a>
      </div>
    </section>
  );
}
