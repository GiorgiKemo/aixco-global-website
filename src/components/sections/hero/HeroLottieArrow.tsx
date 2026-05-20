import { useEffect, useRef } from "react";
import type { AnimationItem } from "lottie-web";

export function getHeroLottieArrowPath(baseUrl: string) {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return `${normalizedBase}animations/arrow-down-gold.json`;
}

const arrowLottiePath = getHeroLottieArrowPath(process.env.NEXT_PUBLIC_BASE_PATH ?? "/");

export function HeroLottieArrow() {
  const containerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || process.env.NODE_ENV === "test" || process.env.VITEST === "true") return;

    let animation: AnimationItem | null = null;
    let cancelled = false;

    import("lottie-web/build/player/lottie_light").then(({ default: lottie }) => {
      if (cancelled || !containerRef.current) return;

      animation = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: arrowLottiePath,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid meet",
        },
      });
    });

    return () => {
      cancelled = true;
      animation?.destroy();
    };
  }, []);

  return (
    <span
      ref={containerRef}
      aria-hidden="true"
      data-hero-lottie-arrow="true"
      className="block h-[5.5rem] w-[5.5rem] md:landscape:!h-12 md:landscape:!w-12 [&_svg]:!block [&_svg]:!h-full [&_svg]:!w-full"
    />
  );
}
