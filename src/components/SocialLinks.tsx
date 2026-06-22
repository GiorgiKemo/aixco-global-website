"use client";

import { Globe2, type LucideIcon } from "lucide-react";
import { aixcoLiveIcons } from "@/lib/aixco-live-assets";
import type { SiteContent } from "@/lib/backend/site-content";
import { getSafeHttpsUrl } from "@/lib/security/urls";
import { cn } from "@/lib/utils";

type Socials = SiteContent["company"]["socials"];

type SocialLink = {
  key: keyof Socials;
  label: string;
  fallback: string;
  allowedHosts: string[];
  allowedPath: string;
  Icon?: LucideIcon;
  iconSrc?: string;
};

type SocialLinksProps = {
  socials: Socials;
  className?: string;
  linkClassName?: string;
  theme?: "dark" | "light";
  "aria-label"?: string;
};

const socialLinks: SocialLink[] = [
  {
    key: "website",
    label: "AIXCO Group website",
    fallback: "https://aixco.group/",
    allowedHosts: ["aixco.group", "www.aixco.group"],
    allowedPath: "/",
    Icon: Globe2,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    fallback: "https://www.linkedin.com/company/aixco",
    allowedHosts: ["linkedin.com", "www.linkedin.com"],
    allowedPath: "/company/aixco",
    iconSrc: aixcoLiveIcons.linkedin,
  },
];

const darkLinkClassName =
  "group relative inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] text-white/82 shadow-[0_18px_46px_-28px_rgba(212,167,68,0.78)] transition duration-300 hover:-translate-y-0.5 hover:border-primary/45 hover:bg-primary/15 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-foreground";

const lightLinkClassName =
  "group relative inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border border-foreground/10 bg-white text-foreground/72 shadow-[0_14px_36px_-28px_hsl(220_28%_18%/0.16)] transition duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/8 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function SocialLinks({
  socials,
  className,
  linkClassName,
  theme = "dark",
  "aria-label": ariaLabel = "AIXCO social media links",
}: SocialLinksProps) {
  const resolvedLinkClassName = linkClassName ?? (theme === "light" ? lightLinkClassName : darkLinkClassName);

  return (
    <div aria-label={ariaLabel} className={cn("flex items-center gap-2", className)}>
      {socialLinks.map(({ key, label, fallback, allowedHosts, allowedPath, Icon, iconSrc }) => {
        const safeHref = getSafeHttpsUrl(socials[key], fallback, allowedHosts);
        const href = new URL(safeHref).pathname.replace(/\/$/, "") === allowedPath.replace(/\/$/, "") ? safeHref : fallback;

        return (
          <a
            key={key}
            aria-label={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            className={resolvedLinkClassName}
          >
            <span
              className={cn(
                "absolute inset-0 bg-gradient-to-br via-transparent to-white/8 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                theme === "light" ? "from-primary/10" : "from-primary/18",
              )}
              aria-hidden
            />
            {iconSrc ? (
              <img src={iconSrc} alt="" aria-hidden="true" className="relative h-5 w-5 object-contain" />
            ) : Icon ? (
              <Icon className="relative h-5 w-5" aria-hidden="true" />
            ) : null}
          </a>
        );
      })}
    </div>
  );
}
