import { Link } from "react-router-dom";
import aixcoIcon from "@/assets/aixco-icon.png";

type LogoProps = {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
};

export function Logo({
  className = "",
  iconClassName = "[filter:brightness(0)_saturate(100%)]",
  textClassName = "",
}: LogoProps) {
  return (
    <Link
      to="/"
      aria-label="AIXCO Global home"
      className={`inline-flex shrink-0 items-center gap-2.5 text-foreground ${className}`}
    >
      <img
        src={aixcoIcon}
        alt=""
        aria-hidden
        className={`h-8 w-8 shrink-0 object-contain md:h-9 md:w-9 ${iconClassName}`}
        width={780}
        height={704}
      />
      <span className={`whitespace-nowrap text-sm font-medium tracking-[-0.02em] md:text-[15px] ${textClassName}`}>
        AIXCO.GLOBAL
      </span>
    </Link>
  );
}
