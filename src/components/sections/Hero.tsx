import { ChevronDown } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type Variants } from "framer-motion";
import { useState, type MouseEvent } from "react";
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
    y: 32,
    z: -72,
    rotateX: 11,
    scale: 0.94,
    filter: "blur(18px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    z: 42,
    rotateX: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 1.22,
      ease: heroEase,
    },
  },
};

const amountVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 22,
    z: -44,
    rotateX: 9,
    scale: 0.92,
    filter: "blur(14px)",
    textShadow: "0 0 0 rgb(240 189 93 / 0)",
  },
  visible: {
    opacity: 1,
    y: 0,
    z: 58,
    rotateX: 0,
    scale: 1,
    filter: "blur(0px)",
    textShadow: "0 4px 0 rgb(122 76 18 / 0.22), 0 16px 42px rgb(240 189 93 / 0.38), 0 34px 76px rgb(0 0 0 / 0.5)",
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
  const kickerText = tx("Quality Real Estate Participation");
  const headlineText = tx("AIXCO Global");
  const popoutAmountText = tx("Starting from \u20ac1,000");
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothPointerX = useSpring(pointerX, { stiffness: 100, damping: 24, mass: 0.35 });
  const smoothPointerY = useSpring(pointerY, { stiffness: 100, damping: 24, mass: 0.35 });
  const heroRotateY = useTransform(smoothPointerX, [-1, 1], shouldReduceMotion ? [0, 0] : [-5, 5]);
  const heroRotateX = useTransform(smoothPointerY, [-1, 1], shouldReduceMotion ? [0, 0] : [4, -4]);
  const heroLift = useTransform(smoothPointerY, [-1, 1], shouldReduceMotion ? [0, 0] : [10, -10]);
  const hiddenTextState = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(10px)" };

  const handleHeroMouseMove = (event: MouseEvent<HTMLElement>) => {
    if (shouldReduceMotion) return;

    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 2);
    pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 2);
  };

  const handleHeroMouseLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  const reducedLineVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <section
      className="hero-reference-font relative isolate min-h-[100svh] overflow-hidden bg-background"
      onMouseMove={handleHeroMouseMove}
      onMouseLeave={handleHeroMouseLeave}
    >
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
        <motion.div
          className="hero-popout-stage"
          style={shouldReduceMotion ? undefined : { rotateX: heroRotateX, rotateY: heroRotateY, y: heroLift }}
        >
        <motion.p
          className="mb-4 text-xs font-medium uppercase tracking-normal text-[#f0bd5d] drop-shadow-[0_3px_14px_rgb(0_0_0/0.5)]"
          initial={hiddenTextState}
          animate={isHeroReady ? { opacity: 1, y: 0, filter: "blur(0px)" } : hiddenTextState}
          transition={{ duration: shouldReduceMotion ? 0.6 : 0.9, ease: shouldReduceMotion ? "easeOut" : heroEase, delay: 0.12 }}
        >
          {kickerText}
        </motion.p>
        <motion.h1
          className="hero-popout-title hero-reference-font max-w-[82rem] text-4xl font-semibold leading-[0.95] tracking-normal text-white sm:text-5xl md:text-6xl lg:text-[5rem]"
          initial="hidden"
          animate={isHeroReady ? "visible" : "hidden"}
          variants={shouldReduceMotion ? { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } } : headlineVariants}
        >
          <span className="block pb-[0.04em]">
            <motion.span
              className="hero-popout-line block origin-bottom will-change-[opacity,transform,filter]"
              data-popout-text={headlineText}
              variants={shouldReduceMotion ? reducedLineVariants : headlineLineVariants}
            >
              {headlineText}
            </motion.span>
          </span>
          <span className="block pb-[0.08em]">
            <motion.span
              className="hero-reference-font block origin-bottom text-2xl font-normal tracking-normal text-white/88 will-change-[opacity,transform,filter] md:text-4xl"
              variants={shouldReduceMotion ? reducedLineVariants : headlineLineVariants}
            >
              <motion.span
                className="hero-popout-line hero-popout-line-gold hero-reference-font relative inline-block whitespace-nowrap italic font-normal text-[#f0bd5d]"
                data-popout-text={popoutAmountText}
                variants={shouldReduceMotion ? reducedLineVariants : amountVariants}
              >
                {popoutAmountText}
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
        </motion.div>

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
