"use client";

import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";
import { aixcoLiveLogos } from "@/lib/aixco-live-assets";
import { replaceLocationHash } from "@/lib/section-hash";
import { scrollToPageTop } from "@/lib/smooth-scroll";

type LogoProps = {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  onHomeClick?: () => void;
  preloadMark?: boolean;
  ariaLabel?: string;
};

function normalizePath(path: string) {
  return path === "/" ? path : path.replace(/\/+$/, "");
}

export function Logo({
  className = "",
  iconClassName = "",
  textClassName = "",
  onHomeClick,
  preloadMark = false,
  ariaLabel = "AIXCO.GLOBAL home",
}: LogoProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return;

    const homePath = "/";

    if (normalizePath(window.location.pathname) === normalizePath(homePath)) {
      event.preventDefault();
      onHomeClick?.();
      replaceLocationHash("");
      scrollToPageTop();
    }
  };

  return (
    <Link
      href="/"
      prefetch={false}
      aria-label={ariaLabel}
      onClick={handleClick}
      className={`inline-flex min-h-11 shrink-0 items-center text-foreground ${className}`}
    >
      <Image
        src={aixcoLiveLogos.aixcoHorizontalDark}
        alt=""
        aria-hidden
        className={`h-auto w-[9.5rem] shrink-0 object-contain md:w-[10.5rem] ${iconClassName}`}
        width={1600}
        height={333}
        sizes="(min-width: 768px) 168px, 152px"
        loading={preloadMark ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={preloadMark ? "high" : "auto"}
      />
      <span className={`sr-only ${textClassName}`}>AIXCO.GLOBAL</span>
    </Link>
  );
}
