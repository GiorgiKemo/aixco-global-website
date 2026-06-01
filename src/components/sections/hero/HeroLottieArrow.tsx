export function getHeroLottieArrowPath(baseUrl: string) {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return `${normalizedBase}animations/arrow-down-gold.json`;
}

export function HeroLottieArrow() {
  return (
    <span
      aria-hidden="true"
      data-hero-lottie-arrow="true"
      className="block h-[5.5rem] w-[5.5rem] md:landscape:!h-12 md:landscape:!w-12 [&_svg]:!block [&_svg]:!h-full [&_svg]:!w-full"
    >
      <svg className="hero-arrow-svg" viewBox="0 0 96 96" focusable="false" role="presentation">
        <path
          d="M48 12v60m0 0 24-24M48 72 24 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
