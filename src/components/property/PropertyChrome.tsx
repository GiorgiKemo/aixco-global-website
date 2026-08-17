"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Download, Globe, Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { useUI } from "@/components/ui-state";
import { DownloadGateLink } from "@/components/downloads/DownloadGateLink";
import { LANGS, useI18n } from "@/i18n/I18nProvider";
import { aixcoLiveLogos, getCurrentProjectBrochureDownload } from "@/lib/aixco-live-assets";
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

const drawerFocusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function keepDrawerFocus(event: KeyboardEvent, container: HTMLElement) {
  if (event.key !== "Tab") return;

  const focusable = Array.from(container.querySelectorAll<HTMLElement>(drawerFocusableSelector)).filter(
    (element) => element.tabIndex >= 0 && element.getAttribute("aria-hidden") !== "true" && !element.closest("[inert]"),
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (!first || !last) {
    event.preventDefault();
    container.focus({ preventScroll: true });
  } else if (event.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) {
    event.preventDefault();
    last.focus({ preventScroll: true });
  } else if (!event.shiftKey && (document.activeElement === last || !container.contains(document.activeElement))) {
    event.preventDefault();
    first.focus({ preventScroll: true });
  }
}

function isolateDrawerLayer(layer: HTMLElement) {
  const previousStates: Array<{ element: HTMLElement; inert: boolean; ariaHidden: string | null }> = [];
  let current: HTMLElement = layer;

  while (current.parentElement) {
    const parent = current.parentElement;
    Array.from(parent.children).forEach((sibling) => {
      if (sibling === current || !(sibling instanceof HTMLElement)) return;
      previousStates.push({ element: sibling, inert: sibling.inert, ariaHidden: sibling.getAttribute("aria-hidden") });
      sibling.inert = true;
      sibling.setAttribute("aria-hidden", "true");
    });
    if (parent === document.body) break;
    current = parent;
  }

  return () => {
    previousStates.reverse().forEach(({ element, inert, ariaHidden }) => {
      element.inert = inert;
      if (ariaHidden === null) element.removeAttribute("aria-hidden");
      else element.setAttribute("aria-hidden", ariaHidden);
    });
  };
}

export function PropertyContactLink({ className, children }: { className?: string; children: ReactNode }) {
  const { openContact } = useUI();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    openContact();
  };

  return (
    <Link href="/?modal=contact" prefetch={false} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}

export function CurrentProjectBrochureLink({
  className,
}: {
  className?: string;
}) {
  const { lang, tx } = useI18n();
  const brochure = getCurrentProjectBrochureDownload(lang, { fallbackToEnglish: false });

  if (!brochure) return null;

  return (
    <DownloadGateLink
      href={brochure.href}
      fileName={brochure.fileName}
      lockedHref="?modal=contact&intent=brochure"
      dataAttributes={{ "data-current-project-brochure": lang }}
      className={className}
    >
      <Download className="h-4 w-4" aria-hidden />
      {tx("Download brochure")}
    </DownloadGateLink>
  );
}

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
    key: "projects",
    label: "Projects",
    active: true,
    items: [{ label: "Current project", href: "/#batumi" }],
  },
  {
    key: "opportunities",
    label: "Opportunities",
    items: [
      { label: "Dubai", href: "/#dubai" },
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
  const mobileLayerRef = useRef<HTMLDivElement | null>(null);
  const mobileDrawerRef = useRef<HTMLElement | null>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const shouldRestoreMobileMenuFocusRef = useRef(true);
  const desktopLanguageButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileLanguageButtonRef = useRef<HTMLButtonElement | null>(null);
  const languageOpenerRef = useRef<HTMLButtonElement | null>(null);
  const currentLangName = LANGS.find((option) => option.code === lang)?.native ?? lang.toUpperCase();

  useEffect(() => {
    const restoreLanguageFocus = () => {
      const opener = languageOpenerRef.current;
      window.requestAnimationFrame(() => {
        if (opener?.isConnected) opener.focus({ preventScroll: true });
      });
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setDesktopGroupOpen(null);
      if (langOpen) {
        setLangOpen(false);
        restoreLanguageFocus();
      }
    };

    const closeFromOutside = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || headerRef.current?.contains(target)) return;
      setDesktopGroupOpen(null);
      if (langOpen) {
        setLangOpen(false);
        restoreLanguageFocus();
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("pointerdown", closeFromOutside);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("pointerdown", closeFromOutside);
    };
  }, [langOpen]);

  useEffect(() => {
    const desktopMedia = window.matchMedia("(min-width: 1280px)");
    const closeMobileUiAtDesktopBreakpoint = () => {
      if (!desktopMedia.matches) return;
      shouldRestoreMobileMenuFocusRef.current = false;
      setMobileOpen(false);
      if (languageOpenerRef.current === mobileLanguageButtonRef.current) setLangOpen(false);
    };

    closeMobileUiAtDesktopBreakpoint();
    desktopMedia.addEventListener("change", closeMobileUiAtDesktopBreakpoint);
    return () => desktopMedia.removeEventListener("change", closeMobileUiAtDesktopBreakpoint);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", mobileOpen);
    document.documentElement.classList.toggle("overflow-hidden", mobileOpen);
    document.body.classList.toggle("property-mobile-menu-open", mobileOpen);
    document.documentElement.classList.toggle("property-mobile-menu-open", mobileOpen);
    return () => {
      document.body.classList.remove("overflow-hidden");
      document.documentElement.classList.remove("overflow-hidden");
      document.body.classList.remove("property-mobile-menu-open");
      document.documentElement.classList.remove("property-mobile-menu-open");
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;

    const drawer = mobileDrawerRef.current;
    const opener = mobileMenuButtonRef.current;
    const restoreIsolation = mobileLayerRef.current ? isolateDrawerLayer(mobileLayerRef.current) : () => undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileOpen(false);
        return;
      }
      if (drawer) keepDrawerFocus(event, drawer);
    };

    window.addEventListener("keydown", handleKeyDown);
    (mobileCloseButtonRef.current ?? drawer)?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      restoreIsolation();
      if (shouldRestoreMobileMenuFocusRef.current && opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [mobileOpen]);

  const closeAll = () => {
    setDesktopGroupOpen(null);
    setLangOpen(false);
    setMobileOpen(false);
  };

  const languageOptions = (
    <ul aria-label={tx("Change language")} className="grid gap-1">
      {LANGS.map((option) => (
        <li key={option.code}>
          <button
            type="button"
            data-lang={option.code}
            aria-current={option.code === lang ? "true" : undefined}
            translate="no"
            onClick={() => {
              setLang(option.code);
              setLangOpen(false);
              window.requestAnimationFrame(() => languageOpenerRef.current?.focus({ preventScroll: true }));
            }}
            className={cn(
              "flex min-h-11 w-full items-center justify-between rounded-md px-3 py-2 text-start text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45",
              option.code === lang ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/70",
            )}
          >
            <span
              lang={option.code}
              translate="no"
              className="language-option-label notranslate"
            >
              {option.label}
            </span>
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] opacity-65">{option.native}</span>
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <header ref={headerRef} data-property-chrome="true" className="property-chrome sticky inset-x-0 top-0 z-[60] border-b border-[#161616]/10 bg-[#F3EDE1]/95 text-[#161616] shadow-[0_18px_46px_-42px_rgba(22,22,22,0.45)] backdrop-blur-xl">
        <div className="property-chrome__inner mx-auto flex min-h-[4.75rem] max-w-[96rem] items-center gap-4 px-4 sm:px-7 xl:min-h-[5.75rem] xl:px-6 2xl:px-8">
          <Link href="/" prefetch={false} onClick={closeAll} aria-label={tx("AIXCO.GLOBAL home")} className="property-chrome__brand inline-flex min-h-11 min-w-0 items-center transition-opacity hover:opacity-72 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45">
            <Image src={aixcoLiveLogos.aixcoHorizontalDark} alt="" aria-hidden="true" width={1600} height={333} sizes="(min-width: 1280px) 10.75rem, 9.5rem" className="h-auto w-[9.5rem] shrink-0 object-contain xl:w-[10.75rem]" />
            <span className="sr-only">AIXCO.GLOBAL</span>
          </Link>

          <nav aria-label={tx("Story navigation")} className="hidden min-w-0 flex-1 items-center gap-1 ps-3 xl:flex">
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
                    <div id={menuId} className="absolute start-0 top-[calc(100%+0.35rem)] z-[80] min-w-56 rounded-sm border border-foreground/10 bg-[#F3EDE1] p-1.5 text-foreground shadow-elegant">
                      {group.items.map((item) => (
                        <Link key={item.href} href={item.href} prefetch={false} onClick={closeAll} className="flex min-h-10 items-center rounded-lg px-3 py-2 text-sm font-medium text-foreground/75 transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                          {tx(item.label)}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>

          <div className="relative ms-auto hidden xl:block">
            <button
              ref={desktopLanguageButtonRef}
              data-language-trigger="true"
              type="button"
              aria-expanded={langOpen}
              aria-controls="property-language-list"
              aria-label={`${currentLangName} ${tx("Change language")}`}
              onClick={(event) => {
                languageOpenerRef.current = event.currentTarget;
                setDesktopGroupOpen(null);
                setLangOpen((current) => !current);
              }}
              className="inline-flex min-h-12 items-center gap-2.5 rounded-sm border border-[#161616]/15 bg-transparent px-4 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-[#161616] transition-colors hover:border-primary/55 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
            >
              <Globe className="h-3.5 w-3.5" aria-hidden />
              {currentLangName}
              <ChevronDown className={cn("h-3 w-3 opacity-70 transition-transform", langOpen && "rotate-180")} aria-hidden />
            </button>
            {langOpen ? (
              <div id="property-language-list" className="absolute end-0 top-[calc(100%+0.5rem)] z-[80] w-64 rounded-sm border border-foreground/10 bg-[#F3EDE1] p-1.5 shadow-elegant">
                {languageOptions}
              </div>
            ) : null}
          </div>

          <div className="ms-auto flex items-center gap-2 xl:hidden">
            <button
              ref={mobileLanguageButtonRef}
              data-language-trigger="true"
              type="button"
              aria-expanded={langOpen}
              aria-controls="property-mobile-language-list"
              aria-label={`${currentLangName} ${tx("Change language")}`}
              onClick={(event) => {
                languageOpenerRef.current = event.currentTarget;
                setMobileOpen(false);
                setLangOpen((current) => !current);
              }}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-sm border border-foreground/15 bg-transparent px-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
            >
              <Globe className="h-3.5 w-3.5" aria-hidden />
              {currentLangName}
            </button>
            <button
              ref={mobileMenuButtonRef}
              type="button"
              aria-expanded={mobileOpen}
              aria-controls="property-mobile-menu"
              aria-label={mobileOpen ? tx("Close menu") : tx("Open menu")}
              onClick={() => {
                setLangOpen(false);
                setMobileOpen((current) => {
                  if (!current) shouldRestoreMobileMenuFocusRef.current = true;
                  return !current;
                });
              }}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm border border-foreground/15 bg-transparent text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
            >
              {mobileOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
          </div>

          {langOpen ? (
            <div id="property-mobile-language-list" className="property-mobile-language-list absolute end-4 top-[calc(100%+0.5rem)] z-[80] max-h-[calc(100dvh-5.5rem)] w-64 overflow-y-auto overscroll-contain rounded-sm border border-foreground/10 bg-[#F3EDE1] p-1.5 shadow-elegant xl:hidden">
              {languageOptions}
            </div>
          ) : null}
        </div>
      </header>

      {mobileOpen ? (
        <div ref={mobileLayerRef} className="fixed inset-0 z-[70] xl:hidden">
          <div aria-hidden="true" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-foreground/35 backdrop-blur-sm" />
          <aside
            ref={mobileDrawerRef}
            id="property-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={tx("Story navigation")}
            tabIndex={-1}
            className="property-mobile-menu absolute bottom-0 end-0 top-0 z-10 max-h-[100dvh] w-[min(22rem,88vw)] overflow-y-auto overscroll-contain border-s border-foreground/10 bg-[#F3EDE1] px-5 pb-8 pt-24 text-foreground shadow-[18px_0_60px_-30px_rgba(0,0,0,0.38)]"
          >
            <button
              ref={mobileCloseButtonRef}
              type="button"
              aria-label={tx("Close menu")}
              onClick={() => setMobileOpen(false)}
              className="property-mobile-menu__close absolute end-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-sm border border-foreground/15 bg-[#F3EDE1] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
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
        </div>
      ) : null}
    </>
  );
}
