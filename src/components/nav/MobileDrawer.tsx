"use client";

import type { MouseEvent } from "react";
import { ALL_NAV, type NavItem } from "./nav-data";

type MobileDrawerProps = {
  compactNav: boolean;
  isNavItemActive: (item: NavItem) => boolean;
  open: boolean;
  t: (key: string) => string;
  onLogin: () => void;
  onRegister: () => void;
  onNavClick: (event: MouseEvent<HTMLAnchorElement>, item: NavItem) => void;
};

export function MobileDrawer({ compactNav, isNavItemActive, open, t, onLogin, onRegister, onNavClick }: MobileDrawerProps) {
  return (
    <div
      data-mobile-drawer
      aria-hidden={open ? undefined : true}
      inert={open ? undefined : true}
      className={`${compactNav ? "" : "2xl:hidden"} transition-[max-height] duration-300 ${
        open ? "max-h-[calc(100svh-4rem)] overflow-y-auto" : "max-h-0 overflow-hidden"
      }`}
    >
      {open && (
        <div className="container-x pb-6 pt-2">
          <nav
            aria-label="Mobile"
            className="flex flex-col gap-0.5 rounded-xl border border-white/10 bg-background/95 p-2 shadow-2xl backdrop-blur-xl"
          >
            {ALL_NAV.map((item) => {
              const isActive = isNavItemActive(item);
              return (
                <a
                  key={item.key}
                  href={`${item.to}${item.hash}`}
                  aria-current={isActive ? "page" : undefined}
                  onClick={(event) => onNavClick(event, item)}
                  className={`w-full rounded-lg px-4 py-2.5 text-[15px] font-medium transition-colors duration-200 ${
                    isActive ? "bg-primary/15 text-primary" : "text-foreground/80 hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  {t(item.key)}
                </a>
              );
            })}
          </nav>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button onClick={onLogin} className="btn-ghost-gold w-full justify-center text-center leading-tight">
              {t("cta.login")}
            </button>
            <button onClick={onRegister} className="btn-gold w-full justify-center text-center leading-tight">
              {t("cta.register")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
