"use client";

import Image from "next/image";
import { aixcoLiveIcons } from "@/lib/aixco-live-assets";
import { useI18n } from "@/i18n/I18nProvider";
import type { SiteContent } from "@/lib/backend/site-content";
import type { MarketWhatsAppContact } from "@/lib/market-whatsapp";
import { getSafeHttpsUrl } from "@/lib/security/urls";
import { cn } from "@/lib/utils";

type Socials = SiteContent["company"]["socials"];

type SocialLink = {
  key: keyof Socials;
  label: string;
  detail?: string;
  fallback: string;
  allowedHosts: string[];
  allowedPath: string;
  iconSrc: string;
};

type SocialLinksProps = {
  socials: Socials;
  className?: string;
  linkClassName?: string;
  theme?: "dark" | "light";
  showLabels?: boolean;
  whatsappContact?: MarketWhatsAppContact | null;
  "aria-label"?: string;
};

const socialLinks: SocialLink[] = [
  {
    key: "website",
    label: "Website",
    fallback: "https://www.aixco.global/",
    allowedHosts: ["aixco.global", "www.aixco.global"],
    allowedPath: "/",
    iconSrc: aixcoLiveIcons.website,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    fallback: "https://www.linkedin.com/company/aixco-global",
    allowedHosts: ["linkedin.com", "www.linkedin.com"],
    allowedPath: "/company/aixco-global",
    iconSrc: aixcoLiveIcons.linkedin,
  },
  {
    key: "instagram",
    label: "Instagram",
    fallback: "https://www.instagram.com/aixco.global/",
    allowedHosts: ["instagram.com", "www.instagram.com"],
    allowedPath: "/aixco.global",
    iconSrc: aixcoLiveIcons.instagram,
  },
  {
    key: "facebook",
    label: "Facebook",
    fallback: "https://www.facebook.com/profile.php?id=61589341472475",
    allowedHosts: ["facebook.com", "www.facebook.com"],
    allowedPath: "/profile.php",
    iconSrc: aixcoLiveIcons.facebook,
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    fallback: "https://wa.me/41798320581",
    allowedHosts: ["wa.me"],
    allowedPath: "/41798320581",
    iconSrc: aixcoLiveIcons.whatsapp,
  },
];

const darkLinkClassName =
  "group relative inline-flex h-[3.35rem] w-[3.35rem] items-center justify-center overflow-hidden rounded-lg border border-white/12 bg-white/[0.08] text-white/90 shadow-[0_18px_46px_-28px_rgba(212,167,68,0.78)] transition duration-300 hover:-translate-y-0.5 hover:border-primary/45 hover:bg-primary/15 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-foreground";

const lightLinkClassName =
  "group relative inline-flex h-[3.35rem] w-[3.35rem] items-center justify-center overflow-hidden rounded-lg border border-primary/20 bg-white text-primary shadow-[0_14px_36px_-28px_hsl(220_28%_18%/0.16)] transition duration-300 hover:-translate-y-0.5 hover:border-primary/45 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const labelledLinkClassName =
  "group relative flex min-w-0 flex-col items-center justify-center gap-2.5 px-3 py-1 text-center text-foreground transition duration-300 hover:-translate-y-0.5 hover:text-primary focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-4 focus-visible:ring-offset-background";

export function SocialLinks({
  socials,
  className,
  linkClassName,
  theme = "dark",
  showLabels = false,
  whatsappContact = null,
  "aria-label": ariaLabel = "AIXCO social media links",
}: SocialLinksProps) {
  const { tx } = useI18n();
  const resolvedLinkClassName =
    linkClassName ?? (showLabels ? labelledLinkClassName : theme === "light" ? lightLinkClassName : darkLinkClassName);

  return (
    <div
      aria-label={ariaLabel}
      className={cn(
        "flex items-center gap-2",
        whatsappContact && "story-contact-social-links--whatsapp",
        className,
      )}
    >
      {socialLinks.filter(({ key }) => key !== "whatsapp" || whatsappContact).map(({ key, label, detail, fallback, allowedHosts, allowedPath, iconSrc }) => {
        const resolvedDetail = key === "whatsapp" ? whatsappContact?.number : detail;
        const resolvedFallback = key === "whatsapp" && whatsappContact ? whatsappContact.href : fallback;
        const resolvedAllowedPath = key === "whatsapp" && whatsappContact ? whatsappContact.allowedPath : allowedPath;
        const socialValue = key === "whatsapp" && whatsappContact ? whatsappContact.href : socials[key];
        const safeHref = getSafeHttpsUrl(socialValue, resolvedFallback, allowedHosts);
        const href = new URL(safeHref).pathname.replace(/\/$/, "") === resolvedAllowedPath.replace(/\/$/, "") ? safeHref : resolvedFallback;

        return (
          <a
            key={key}
            aria-label={resolvedDetail ? `${tx(label)} ${resolvedDetail}` : tx(label)}
            href={href}
            target="_blank"
            rel="noreferrer"
            className={resolvedLinkClassName}
          >
            {showLabels ? (
              <>
                <span className="social-link__icon-tile" aria-hidden="true">
                  <Image
                    src={iconSrc}
                    alt=""
                    width={34}
                    height={34}
                    unoptimized
                    className={cn(
                      "social-link__icon h-[2.1rem] w-[2.1rem] object-contain",
                      key === "whatsapp" && "social-link__icon--whatsapp",
                    )}
                  />
                </span>
                <span className="social-link__label">{tx(label)}</span>
                {key !== "whatsapp" && resolvedDetail ? <span className="social-link__detail">{resolvedDetail}</span> : null}
              </>
            ) : (
              <>
                <span
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br via-transparent to-white/8 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                    theme === "light" ? "from-primary/10" : "from-primary/18",
                  )}
                  aria-hidden
                />
                <Image
                  src={iconSrc}
                  alt=""
                  aria-hidden="true"
                  width={34}
                  height={34}
                  unoptimized
                  className={cn(
                    "social-link__icon relative h-[2.1rem] w-[2.1rem] object-contain",
                    key === "whatsapp" && "social-link__icon--whatsapp",
                  )}
                />
              </>
            )}
          </a>
        );
      })}
    </div>
  );
}
