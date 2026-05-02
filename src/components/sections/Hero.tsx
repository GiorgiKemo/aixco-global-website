import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useState, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/i18n/I18nProvider";
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
  const { tx } = useI18n();
  const navigate = useNavigate();
  const hiddenTextState = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(10px)" };

  const handleAboutClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    navigate("/#about");
  };

  const reducedLineVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <section className="hero-reference-font relative isolate min-h-[100svh] overflow-hidden bg-background">
      <motion.img
        src={heroBatumiCity}
        alt="Panoramic city view of Batumi, Georgia"
        className="absolute inset-0 h-full w-full object-cover object-center"
        width={5630}
        height={2999}
        loading="eager"
        decoding="async"
        fetchpriority="high"
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
        <motion.p
          className="mb-4 text-xs font-medium uppercase tracking-normal text-[#f0bd5d] drop-shadow-[0_3px_14px_rgb(0_0_0/0.5)]"
          initial={hiddenTextState}
          animate={isHeroReady ? { opacity: 1, y: 0, filter: "blur(0px)" } : hiddenTextState}
          transition={{ duration: shouldReduceMotion ? 0.6 : 0.9, ease: shouldReduceMotion ? "easeOut" : heroEase, delay: 0.12 }}
        >
          {tx("Quality Real Estate Participation")}
        </motion.p>
        <motion.h1
          className="hero-reference-font max-w-[90rem] text-[clamp(2.55rem,13vw,3.75rem)] font-semibold leading-[0.95] tracking-normal text-white drop-shadow-[0_18px_42px_rgba(0,0,0,0.38)] [perspective:900px] sm:text-6xl md:text-7xl lg:text-[5.75rem]"
          initial="hidden"
          animate={isHeroReady ? "visible" : "hidden"}
          variants={shouldReduceMotion ? { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } } : headlineVariants}
        >
          <span className="block pb-[0.04em]">
            <motion.span
              className="block origin-bottom whitespace-nowrap will-change-[opacity,transform,filter]"
              variants={shouldReduceMotion ? reducedLineVariants : headlineLineVariants}
            >
              {tx("AIXCO Global")}
            </motion.span>
          </span>
          <span className="block pb-[0.08em]">
            <motion.span
              className="hero-reference-font block origin-bottom text-3xl font-normal tracking-normal text-white/88 will-change-[opacity,transform,filter] md:text-5xl"
              variants={shouldReduceMotion ? reducedLineVariants : headlineLineVariants}
            >
              <motion.span
                className="hero-reference-font relative inline-block whitespace-nowrap italic font-normal text-[#f0bd5d]"
                variants={shouldReduceMotion ? reducedLineVariants : amountVariants}
              >
                {tx("Starting from €1,000")}
              </motion.span>
            </motion.span>
          </span>
        </motion.h1>

        <motion.p
          className="hero-reference-font mt-7 max-w-2xl text-base leading-7 text-white/85 drop-shadow-[0_3px_18px_rgb(0_0_0/0.42)] md:text-lg"
          initial={hiddenTextState}
          animate={isHeroReady ? { opacity: 1, y: 0, filter: "blur(0px)" } : hiddenTextState}
          transition={{ duration: shouldReduceMotion ? 0.7 : 1.02, ease: shouldReduceMotion ? "easeOut" : heroEase, delay: shouldReduceMotion ? 0.42 : 1.02 }}
        >
          {tx("Participate where growth, stability, and long term value creation meet. AIXCO gives private partners a simple and transparent way to join selected real estate projects, starting from €1,000.")}
        </motion.p>

        <motion.a
          href="#about"
          onClick={handleAboutClick}
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
