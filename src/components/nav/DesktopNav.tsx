"use client";

import { ChevronDown } from "lucide-react";
import type { MouseEvent } from "react";
import { MORE_NAV, NAV, getDesktopNavLabel, type NavItem } from "./nav-data";

type DesktopNavProps = {
  desktopNavLinkClass: string;
  desktopNavSpacing: string;
  fullNavAvailable: boolean;
  isNavItemActive: (item: NavItem) => boolean;
  lang: string;
  moreOpen: boolean;
  setMoreOpen: (open: boolean | ((value: boolean) => boolean)) => void;
  solidNav: boolean;
  t: (key: string) => string;
  onNavClick: (event: MouseEvent<HTMLAnchorElement>, item: NavItem) => void;
};

export function DesktopNav({
  desktopNavLinkClass,
  desktopNavSpacing,
  fullNavAvailable,
  isNavItemActive,
  lang,
  moreOpen,
  setMoreOpen,
  solidNav,
  t,
  onNavClick,
}: DesktopNavProps) {
  return (
    <nav
      aria-label="Primary"
      className={`${fullNavAvailable ? "hidden xl:flex" : "hidden"} min-w-0 flex-1 items-center justify-center ${desktopNavSpacing}`}
    >
      {NAV.map((item) => {
        const isActive = isNavItemActive(item);
        const href = `${item.to}${item.hash}`;
        const label = t(item.key);
        const desktopLabel = getDesktopNavLabel(lang, item.key, label);

        return (
          <a
            key={item.key}
            href={href}
            title={label}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            onClick={(event) => onNavClick(event, item)}
            className={`shrink-0 whitespace-nowrap rounded-full ${desktopNavLinkClass} leading-none tracking-wide transition-[background-color,color] duration-200 ${
              solidNav
                ? isActive
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/85 hover:bg-background/50 hover:text-foreground"
                : isActive
                  ? "bg-white/[0.08] text-[#f0bd5d] drop-shadow-[0_2px_10px_rgb(0_0_0/0.34)]"
                  : "text-white/90 drop-shadow-[0_2px_10px_rgb(0_0_0/0.34)] hover:bg-white/[0.08] hover:text-[#f0bd5d]"
            }`}
          >
            {desktopLabel}
          </a>
        );
      })}

      <div className="relative" onMouseLeave={() => setMoreOpen(false)}>
        <button
          type="button"
          onMouseEnter={() => setMoreOpen(true)}
          onClick={() => setMoreOpen((value) => !value)}
          className={`flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full ${desktopNavLinkClass} leading-none tracking-wide transition-[background-color,color] duration-200 ${
            solidNav
              ? "text-foreground/85 hover:bg-background/50 hover:text-foreground"
              : "text-white/90 drop-shadow-[0_2px_10px_rgb(0_0_0/0.34)] hover:bg-white/[0.08] hover:text-[#f0bd5d]"
          }`}
        >
          {t("nav.more")} <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </button>
        {moreOpen && (
          <div className="absolute right-0 top-full w-48 pt-2 animate-scale-in">
            <ul className="glass flex flex-col gap-1 rounded-lg p-1.5 shadow-elegant">
              {MORE_NAV.map((item) => {
                const isActive = isNavItemActive(item);
                const label = t(item.key);

                return (
                  <li key={item.key}>
                    <a
                      href={`${item.to}${item.hash}`}
                      onClick={(event) => onNavClick(event, item)}
                      className={`flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors ${
                        isActive ? "bg-primary/10 text-primary" : "text-foreground/85 hover:bg-muted/70 hover:text-foreground"
                      }`}
                    >
                      {label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
