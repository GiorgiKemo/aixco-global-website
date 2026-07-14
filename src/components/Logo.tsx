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
  iconClassName = "[filter:brightness(0)_saturate(100%)]",
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
      className={`inline-flex min-h-11 shrink-0 items-center gap-2.5 text-foreground ${className}`}
    >
      <Image
        src={aixcoLiveLogos.aixcoMark}
        alt=""
        aria-hidden
        className={`h-8 w-8 shrink-0 object-contain md:h-9 md:w-9 ${iconClassName}`}
        width={780}
        height={704}
        sizes="36px"
        loading={preloadMark ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={preloadMark ? "high" : "auto"}
      />
      <span className={`whitespace-nowrap text-sm font-medium tracking-[-0.02em] md:text-[15px] ${textClassName}`}>
        AIXCO.GLOBAL
      </span>
    </Link>
  );
}
