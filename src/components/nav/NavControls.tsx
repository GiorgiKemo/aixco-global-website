"use client";

import { ChevronDown, Globe, Menu, X } from "lucide-react";
import type { MouseEvent } from "react";
import { LANGS } from "@/i18n/I18nProvider";
import type { Lang } from "@/i18n/translations";
import { STARTING_FROM_NAV_TARGET, type NavItem } from "./nav-data";

type NavControlsProps = {
  compactNav: boolean;
  controlClass: string;
  controlTextClass: string;
  lang: Lang;
  langOpen: boolean;
  open: boolean;
  setLang: (lang: Lang) => void;
  setLangOpen: (open: boolean | ((value: boolean) => boolean)) => void;
  setOpen: (open: boolean | ((value: boolean) => boolean)) => void;
  showDesktopActions: boolean;
  t: (key: string) => string;
  onLogin: () => void;
  onRegister: () => void;
  onNavClick: (event: MouseEvent<HTMLAnchorElement>, item: NavItem) => void;
};

export function NavControls({
  compactNav,
  controlClass,
  controlTextClass,
  lang,
  langOpen,
  open,
  setLang,
  setLangOpen,
  setOpen,
  showDesktopActions,
  t,
  onLogin,
  onRegister,
  onNavClick,
}: NavControlsProps) {
  const currentLangName = LANGS.find((item) => item.code === lang)?.native ?? lang.toUpperCase();

  return (
    <div className="flex shrink-0 items-center gap-2 md:gap-3">
      <div className="relative">
        <button
          type="button"
          onClick={() => setLangOpen((value) => !value)}
          aria-haspopup="listbox"
          aria-expanded={langOpen}
          aria-label={`${currentLangName} Change language`}
          className={`${controlClass} inline-flex min-h-11 min-w-0 items-center gap-1.5 px-2.5 py-1.5 text-[12px] uppercase tracking-widest ${controlTextClass}`}
        >
          <Globe className="h-3.5 w-3.5" />
          {currentLangName}
          <ChevronDown className="h-3 w-3 opacity-70" />
        </button>
        {langOpen && (
          <ul role="listbox" className="glass absolute right-0 mt-2 w-44 rounded-lg p-1 shadow-elegant animate-scale-in">
            {LANGS.map((option) => (
              <li key={option.code}>
                <button
                  role="option"
                  data-lang={option.code}
                  aria-selected={option.code === lang}
                  onClick={() => {
                    setLang(option.code);
                    setLangOpen(false);
                  }}
                  className={`flex min-h-10 w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                    option.code === lang ? "bg-primary/10 text-primary" : "hover:bg-muted/70"
                  }`}
                >
                  <span>{option.label}</span>
                  <span className="text-[12px] uppercase tracking-widest opacity-70">{option.native}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={onLogin}
        className={`${showDesktopActions ? "hidden 2xl:inline-flex" : "hidden"} min-h-11 whitespace-nowrap px-3 py-2 text-sm tracking-wide transition-colors ${controlTextClass}`}
      >
        {t("cta.login")}
      </button>
      <button
        onClick={onRegister}
        className={`${showDesktopActions ? "hidden 2xl:inline-flex" : "hidden"} whitespace-nowrap btn-ghost-gold !border-primary/50 !bg-[#fff8ec] !px-4 !py-2 text-sm font-bold !text-[#7a4a0a] shadow-[0_8px_22px_-18px_rgb(122_74_10/0.7)]`}
      >
        {t("cta.register")}
      </button>
      <a
        href="/#faqs"
        onClick={(event) => onNavClick(event, STARTING_FROM_NAV_TARGET)}
        className={`${showDesktopActions ? "hidden 2xl:inline-flex" : "hidden"} whitespace-nowrap btn-gold !px-4 !py-2 text-sm font-bold !text-white drop-shadow-[0_1px_1px_rgb(76_42_0/0.45)]`}
      >
        {t("cta.start")}
      </a>

      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`${controlClass} ${compactNav ? "" : "hidden"} h-11 w-11 shrink-0`}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
    </div>
  );
}
