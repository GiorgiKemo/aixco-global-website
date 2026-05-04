import type { MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { aixcoLiveLogos } from "@/lib/aixco-live-assets";
import { replaceLocationHash } from "@/lib/section-hash";
import { scrollToPageTop } from "@/lib/smooth-scroll";

type LogoProps = {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  onHomeClick?: () => void;
};

export function Logo({
  className = "",
  iconClassName = "[filter:brightness(0)_saturate(100%)]",
  textClassName = "",
  onHomeClick,
}: LogoProps) {
  const navigate = useNavigate();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return;

    const homePath = new URL(import.meta.env.BASE_URL, window.location.origin).pathname;

    if (window.location.pathname === homePath) {
      event.preventDefault();
      onHomeClick?.();
      replaceLocationHash("");
      scrollToPageTop();
      return;
    }

    event.preventDefault();
    navigate("/");
  };

  return (
    <Link
      to="/"
      aria-label="AIXCO Global home"
      onClick={handleClick}
      className={`inline-flex min-h-11 shrink-0 items-center gap-2.5 text-foreground ${className}`}
    >
      <img
        src={aixcoLiveLogos.aixcoMark}
        alt=""
        aria-hidden
        className={`h-8 w-8 shrink-0 object-contain md:h-9 md:w-9 ${iconClassName}`}
        width={780}
        height={704}
        decoding="async"
        fetchpriority="high"
      />
      <span className={`whitespace-nowrap text-sm font-medium tracking-[-0.02em] md:text-[15px] ${textClassName}`}>
        AIXCO.GLOBAL
      </span>
    </Link>
  );
}
