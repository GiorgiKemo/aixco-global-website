"use client";

import Link from "next/link";
import { ChevronDown, Globe, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LANGS, useI18n } from "@/i18n/I18nProvider";
import { aixcoLiveLogos } from "@/lib/aixco-live-assets";
import { cn } from "@/lib/utils";

type PropertyNavItem = {
  label: string;
  href: string;
};

type PropertyNavGroup = {
  key: string;
  label: string;
  active?: boolean;
  items: PropertyNavItem[];
};

const navGroups: PropertyNavGroup[] = [
  {
    key: "about-aixco",
    label: "About AIXCO",
    items: [
      { label: "About", href: "/#about" },
      { label: "Philosophy", href: "/#philosophy" },
      { label: "Origins", href: "/#philosophy-origins" },
      { label: "Principles", href: "/#philosophy-platform" },
      { label: "Objectives", href: "/#about-objectives" },
      { label: "Access", href: "/#about-access" },
    ],
  },
  {
    key: "legacy",
    label: "Legacy",
    items: [{ label: "Legacy", href: "/#legacy" }],
  },
  {
    key: "opportunities",
    label: "Opportunities",
    active: true,
    items: [
      { label: "Dubai", href: "/#dubai" },
      { label: "Batumi", href: "/#batumi" },
      { label: "Download Materials", href: "/#materials" },
      { label: "How to work", href: "/#participate" },
      { label: "Journeys", href: "/#how" },
    ],
  },
  {
    key: "company",
    label: "Company",
    items: [
      { label: "Team", href: "/#team" },
      { label: "Partners", href: "/#partners" },
      { label: "FAQs", href: "/#faqs" },
      { label: "Contact", href: "/#contact" },
    ],
  },
];

export function PropertyChrome() {
  const { lang, setLang, tx } = useI18n();
  const [desktopGroupOpen, setDesktopGroupOpen] = useState<string | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const currentLangName = LANGS.find((option) => option.code === lang)?.native ?? lang.toUpperCase();

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setDesktopGroupOpen(null);
      setLangOpen(false);
      setMobileOpen(false);
    };

    const closeFromOutside = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || headerRef.current?.contains(target)) return;
      setDesktopGroupOpen(null);
      setLangOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("pointerdown", closeFromOutside);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("pointerdown", closeFromOutside);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", mobileOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [mobileOpen]);

  const closeAll = () => {
    setDesktopGroupOpen(null);
    setLangOpen(false);
    setMobileOpen(false);
  };

  const languageOptions = (
    <ul role="listbox" aria-label={tx("Change language")} className="grid gap-1">
      {LANGS.map((option) => (
        <li key={option.code}>
          <button
            type="button"
            role="option"
            data-lang={option.code}
            aria-selected={option.code === lang}
            onClick={() => {
              setLang(option.code);
              setLangOpen(false);
            }}
            className={cn(
              "flex min-h-10 w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45",
              option.code === lang ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/70",
            )}
          >
            <span>{option.label}</span>
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] opacity-65">{option.native}</span>
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <header ref={headerRef} className="sticky inset-x-0 top-0 z-[60] border-b border-[#161616]/10 bg-white/90 text-[#161616] shadow-[0_18px_46px_-42px_rgba(22,22,22,0.45)] backdrop-blur-xl">
        <div className="mx-auto flex min-h-[4.75rem] max-w-[96rem] items-center gap-4 px-4 sm:px-7 xl:min-h-[5.75rem] xl:px-6 2xl:px-8">
          <Link href="/" prefetch={false} onClick={closeAll} aria-label={tx("AIXCO.GLOBAL home")} className="inline-flex min-w-max items-center gap-2 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45">
            <img src={aixcoLiveLogos.aixcoMark} alt="" aria-hidden="true" className="h-auto w-11 shrink-0 object-contain [filter:brightness(0)_saturate(100%)] xl:w-12" />
            <span className="whitespace-nowrap text-[0.78rem] font-semibold tracking-[-0.02em] xl:text-[0.86rem]">AIXCO.GLOBAL</span>
          </Link>

          <nav aria-label={tx("Story navigation")} className="hidden min-w-0 flex-1 items-center gap-1 pl-3 xl:flex">
            <Link href="/" prefetch={false} onClick={closeAll} className="inline-flex min-h-11 items-center px-3 text-[0.7rem] font-semibold uppercase tracking-[0.05em] text-[#161616]/72 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45">
              {tx("AIXCO")}
            </Link>
            {navGroups.map((group) => {
              const menuId = `property-nav-${group.key}`;
              const isOpen = desktopGroupOpen === group.key;

              return (
                <div key={group.key} className="relative">
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                    aria-controls={menuId}
                    onClick={() => {
                      setLangOpen(false);
                      setDesktopGroupOpen((current) => current === group.key ? null : group.key);
                    }}
                    className={cn(
                      "inline-flex min-h-11 items-center gap-1.5 px-3 text-[0.7rem] font-semibold uppercase tracking-[0.05em] transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45",
                      group.active ? "text-primary" : "text-[#161616]/72",
                    )}
                  >
                    {tx(group.label)}
                    <ChevronDown className={cn("h-3 w-3 opacity-70 transition-transform", isOpen && "rotate-180")} aria-hidden />
                  </button>
                  {isOpen ? (
                    <div id={menuId} role="menu" className="absolute left-0 top-[calc(100%+0.35rem)] z-[80] min-w-56 rounded-xl border border-foreground/10 bg-white p-1.5 text-foreground shadow-elegant">
                      {group.items.map((item) => (
                        <Link key={item.href} href={item.href} prefetch={false} role="menuitem" onClick={closeAll} className="flex min-h-10 items-center rounded-lg px-3 py-2 text-sm font-medium text-foreground/75 transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                          {tx(item.label)}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>

          <div className="relative ml-auto hidden xl:block">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              aria-controls="property-language-list"
              aria-label={`${currentLangName} ${tx("Change language")}`}
              onClick={() => {
                setDesktopGroupOpen(null);
                setLangOpen((current) => !current);
              }}
              className="inline-flex min-h-12 items-center gap-2.5 rounded-xl border border-[#161616]/10 bg-white px-4 text-[0.75rem] font-bold uppercase tracking-[0.14em] text-[#161616] shadow-[0_14px_32px_-26px_rgba(22,22,22,0.45)] transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
            >
              <Globe className="h-3.5 w-3.5" aria-hidden />
              {currentLangName}
              <ChevronDown className={cn("h-3 w-3 opacity-70 transition-transform", langOpen && "rotate-180")} aria-hidden />
            </button>
            {langOpen ? (
              <div id="property-language-list" className="absolute right-0 top-[calc(100%+0.5rem)] z-[80] w-64 rounded-xl border border-foreground/10 bg-white p-1.5 shadow-elegant">
                {languageOptions}
              </div>
            ) : null}
          </div>

          <div className="ml-auto flex items-center gap-2 xl:hidden">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              aria-controls="property-mobile-language-list"
              aria-label={`${currentLangName} ${tx("Change language")}`}
              onClick={() => {
                setMobileOpen(false);
                setLangOpen((current) => !current);
              }}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-foreground/10 bg-white px-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
            >
              <Globe className="h-3.5 w-3.5" aria-hidden />
              {currentLangName}
            </button>
            <button
              type="button"
              aria-expanded={mobileOpen}
              aria-controls="property-mobile-menu"
              aria-label={mobileOpen ? tx("Close menu") : tx("Open menu")}
              onClick={() => {
                setLangOpen(false);
                setMobileOpen((current) => !current);
              }}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-foreground/10 bg-white text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
            >
              {mobileOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
          </div>

          {langOpen ? (
            <div id="property-mobile-language-list" className="absolute right-4 top-[calc(100%+0.5rem)] z-[80] w-64 rounded-xl border border-foreground/10 bg-white p-1.5 shadow-elegant xl:hidden">
              {languageOptions}
            </div>
          ) : null}
        </div>
      </header>

      {mobileOpen ? (
        <button type="button" aria-label={tx("Close menu")} onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-foreground/35 backdrop-blur-sm xl:hidden" />
      ) : null}

      {mobileOpen ? (
        <aside id="property-mobile-menu" className="fixed bottom-0 right-0 top-0 z-50 w-[min(22rem,88vw)] overflow-y-auto border-l border-foreground/10 bg-white px-5 pb-8 pt-24 text-foreground shadow-[18px_0_60px_-30px_rgba(0,0,0,0.38)] xl:hidden">
          <nav aria-label={tx("Story navigation")} className="grid gap-2">
            <Link href="/" prefetch={false} onClick={closeAll} className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-muted/70">{tx("AIXCO")}</Link>
            {navGroups.map((group) => (
              <div key={group.key} className="border-t border-foreground/10 pt-2">
                <p className={cn("px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em]", group.active ? "text-primary" : "text-foreground/55")}>{tx(group.label)}</p>
                {group.items.map((item) => (
                  <Link key={item.href} href={item.href} prefetch={false} onClick={closeAll} className="flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-medium text-foreground/78 hover:bg-primary/10 hover:text-primary">
                    {tx(item.label)}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </aside>
      ) : null}
    </>
  );
}
