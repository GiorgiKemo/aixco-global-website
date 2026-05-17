"use client";

import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { Logo } from "./Logo";
import { useI18n, LANGS } from "@/i18n/I18nProvider";
import { useUI } from "@/components/ui-state";
import { getActiveSectionHash, replaceLocationHash, syncLocationHashToActiveSection } from "@/lib/section-hash";
import { scrollToHash, scrollToPageTop } from "@/lib/smooth-scroll";

const NAV = [
  { key: "nav.home", to: "/", hash: "" },
  { key: "nav.about", to: "/", hash: "#about" },
  { key: "nav.dubai", to: "/", hash: "#dubai" },
  { key: "nav.batumi", to: "/", hash: "#batumi" },
  { key: "nav.participate", to: "/", hash: "#participate" },
  { key: "nav.how", to: "/", hash: "#how" },
  { key: "nav.contact", to: "/", hash: "#contact" },
];
const MORE_NAV = [
  { key: "nav.philosophy", to: "/aixco-philosophy", hash: "" },
  { key: "nav.team", to: "/", hash: "#team" },
  { key: "nav.partners", to: "/", hash: "#partners" },
  { key: "nav.faqs", to: "/", hash: "#faqs" },
];
const ALL_NAV = [...NAV, ...MORE_NAV];
const STARTING_FROM_NAV_TARGET = MORE_NAV.find((item) => item.key === "nav.faqs") ?? MORE_NAV[MORE_NAV.length - 1];
const HOME_SECTION_IDS = ["about", "dubai", "batumi", "participate", "how", "team", "partners", "faqs", "contact"] as const;
const NAV_HASH_STABILIZE_DELAYS = [120, 320, 700, 1100] as const;
const HOME_RETURN_HASH_SYNC_LOCK_MS = 1800;
let pendingNavScrollTimers: number[] = [];
type BrowserLocationState = {
  pathname: string;
  hash: string;
};

function getBrowserLocation(): BrowserLocationState {
  if (typeof window === "undefined") {
    return { pathname: "/", hash: "" };
  }

  return {
    pathname: window.location.pathname || "/",
    hash: window.location.hash,
  };
}

const DESKTOP_NAV_LABELS: Record<string, Record<string, string>> = {
  ka: {
    "nav.about": "AIXCO",
    "nav.participate": "გზები",
    "nav.how": "პროცესი",
    "nav.team": "გუნდი",
    "nav.faqs": "FAQ",
  },
};

function getDesktopNavLabel(lang: string, key: string, fallback: string) {
  return DESKTOP_NAV_LABELS[lang]?.[key] ?? fallback;
}

function clearPendingNavScrollTimers() {
  pendingNavScrollTimers.forEach((timer) => window.clearTimeout(timer));
  pendingNavScrollTimers = [];
}

function scrollToNavHash(hash: string) {
  clearPendingNavScrollTimers();
  replaceLocationHash(hash);
  scrollToHash(hash);

  pendingNavScrollTimers = NAV_HASH_STABILIZE_DELAYS.map((delay) =>
    window.setTimeout(() => {
      replaceLocationHash(hash);
      scrollToHash(hash, "auto");
    }, delay),
  );
}

export function Nav() {
  const { t, lang, setLang } = useI18n();
  const { openLogin, openRegister } = useUI();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const [returningHome, setReturningHome] = useState(false);
  const [compactNav, setCompactNav] = useState(false);
  const [desktopActionsAvailable, setDesktopActionsAvailable] = useState(false);
  const [location, setLocation] = useState<BrowserLocationState>({ pathname: "/", hash: "" });
  const navRowRef = useRef<HTMLDivElement | null>(null);
  const logoSlotRef = useRef<HTMLDivElement | null>(null);
  const navMeasureRef = useRef<HTMLDivElement | null>(null);
  const controlsMeasureRef = useRef<HTMLDivElement | null>(null);
  const homeHashSyncLockedUntilRef = useRef(0);
  const solidNav = scrolled || open || langOpen;
  const fullNavAvailable = !compactNav;
  const showDesktopActions = fullNavAvailable && desktopActionsAvailable;
  const compactDesktopLabels = lang === "ka";
  const desktopNavSpacing = compactDesktopLabels ? "gap-1 px-2" : "gap-2 px-3";
  const desktopNavLinkClass = compactDesktopLabels
    ? "inline-flex min-h-10 items-center px-2 py-2 text-[clamp(11.5px,0.66vw,13px)]"
    : "inline-flex min-h-10 items-center px-3 py-2 text-[clamp(12px,0.78vw,14.5px)]";
  const topControlClass =
    "inline-flex items-center justify-center rounded-lg border border-white/25 bg-white/[0.06] text-white/90 shadow-[0_8px_28px_rgb(0_0_0/0.16)] backdrop-blur-md transition-[background-color,border-color,color,box-shadow,translate] duration-200 hover:border-[#f0bd5d]/55 hover:bg-white/[0.12] hover:text-[#f0bd5d]";
  const controlClass = solidNav ? "icon-button-glass" : topControlClass;
  const controlTextClass = solidNav
    ? "text-foreground/85 hover:text-foreground"
    : "text-white/90 drop-shadow-[0_2px_10px_rgb(0_0_0/0.34)] hover:text-[#f0bd5d]";
  const effectiveActiveHash = returningHome ? "" : active || location.hash;
  const isNavItemActive = (item: (typeof ALL_NAV)[number]) =>
    item.hash ? effectiveActiveHash === item.hash : location.pathname === item.to && !effectiveActiveHash;

  const closeNavPanels = () => {
    setLangOpen(false);
    setMoreOpen(false);
    setOpen(false);
  };

  const beginHomeReturn = () => {
    closeNavPanels();
    clearPendingNavScrollTimers();
    homeHashSyncLockedUntilRef.current = window.performance.now() + HOME_RETURN_HASH_SYNC_LOCK_MS;
    setReturningHome(true);
    setActive("");
    replaceLocationHash("");
  };

  const handleLogoHomeClick = beginHomeReturn;

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, item: (typeof ALL_NAV)[number]) => {
    closeNavPanels();
    setReturningHome(false);

    if (location.pathname !== item.to) return;

    event.preventDefault();
    if (item.hash) {
      scrollToNavHash(item.hash);
      setLocation(getBrowserLocation());
    } else {
      beginHomeReturn();
      scrollToPageTop();
      setLocation(getBrowserLocation());
    }
  };

  useEffect(() => {
    const updateLocationState = () => setLocation(getBrowserLocation());

    updateLocationState();
    window.addEventListener("hashchange", updateLocationState);
    window.addEventListener("popstate", updateLocationState);

    return () => {
      window.removeEventListener("hashchange", updateLocationState);
      window.removeEventListener("popstate", updateLocationState);
    };
  }, []);

  useEffect(() => {
    const updateScrollState = (syncUrlHash: boolean) => {
      setScrolled(window.scrollY > 88);
      if (location.pathname !== "/") return;

      if (homeHashSyncLockedUntilRef.current > window.performance.now()) {
        replaceLocationHash("");
        setActive("");
        setReturningHome(true);
        return;
      }

      const current = syncUrlHash
        ? syncLocationHashToActiveSection(HOME_SECTION_IDS)
        : getActiveSectionHash(HOME_SECTION_IDS);
      setReturningHome(false);
      setActive(current);
    };

    const onScroll = () => updateScrollState(true);

    updateScrollState(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  useEffect(() => {
    setOpen(false);
    if (location.hash) setReturningHome(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const cancelPendingSectionScrolls = () => clearPendingNavScrollTimers();
    const options: AddEventListenerOptions = { capture: true, passive: true };

    window.addEventListener("wheel", cancelPendingSectionScrolls, options);
    window.addEventListener("touchstart", cancelPendingSectionScrolls, options);
    window.addEventListener("pointerdown", cancelPendingSectionScrolls, options);
    window.addEventListener("keydown", cancelPendingSectionScrolls, { capture: true });

    return () => {
      clearPendingNavScrollTimers();
      window.removeEventListener("wheel", cancelPendingSectionScrolls, options);
      window.removeEventListener("touchstart", cancelPendingSectionScrolls, options);
      window.removeEventListener("pointerdown", cancelPendingSectionScrolls, options);
      window.removeEventListener("keydown", cancelPendingSectionScrolls, { capture: true });
    };
  }, []);

  useLayoutEffect(() => {
    const updateCompactMode = () => {
      if (typeof window === "undefined") return;

      if (window.innerWidth < 1280) {
        setCompactNav(true);
        setDesktopActionsAvailable(false);
        return;
      }

      const row = navRowRef.current;
      const logo = logoSlotRef.current;
      const measuredNav = navMeasureRef.current;
      const measuredControls = controlsMeasureRef.current;
      if (!row || !logo || !measuredNav || !measuredControls) return;

      const rowStyle = window.getComputedStyle(row);
      const availableWidth =
        row.clientWidth - Number.parseFloat(rowStyle.paddingLeft) - Number.parseFloat(rowStyle.paddingRight);
      const logoWidth = logo.getBoundingClientRect().width;
      const navWidth = measuredNav.scrollWidth;
      const persistentControls = measuredControls.querySelector<HTMLElement>("[data-nav-persistent]");
      const persistentControlsWidth = persistentControls?.scrollWidth ?? measuredControls.scrollWidth;
      const fullControlsWidth = measuredControls.scrollWidth;
      const horizontalGaps = 32;
      const reserve = 28;
      const coreNavFits = logoWidth + navWidth + persistentControlsWidth + horizontalGaps + reserve <= availableWidth;
      const desktopActionsFit =
        window.innerWidth >= 1536 && logoWidth + navWidth + fullControlsWidth + horizontalGaps + reserve <= availableWidth;

      setCompactNav(!coreNavFits);
      setDesktopActionsAvailable(coreNavFits && desktopActionsFit);
    };

    updateCompactMode();

    const observer = new ResizeObserver(updateCompactMode);
    [navRowRef.current, logoSlotRef.current, navMeasureRef.current, controlsMeasureRef.current].forEach((element) => {
      if (element) observer.observe(element);
    });

    window.addEventListener("resize", updateCompactMode);
    if (process.env.NODE_ENV !== "test") {
      document.fonts?.ready.then(updateCompactMode).catch(() => undefined);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateCompactMode);
    };
  }, [lang]);

  return (
    <header dir="ltr" className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ${solidNav ? "border-b border-border/50 bg-background/[0.78] shadow-soft backdrop-blur-2xl" : "border-b border-transparent bg-transparent"}`}>
      <div ref={navRowRef} className="mx-auto flex h-16 w-full max-w-[1760px] items-center justify-between gap-4 px-6 md:h-20 md:px-10">
        <div ref={logoSlotRef} className="shrink-0">
          <Logo
            className={solidNav ? "" : "text-white drop-shadow-[0_3px_14px_rgb(0_0_0/0.34)]"}
            iconClassName={solidNav ? undefined : "[filter:brightness(0)_invert(1)]"}
            onHomeClick={handleLogoHomeClick}
            preloadMark
          />
        </div>

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
                onClick={(event) => handleNavClick(event, item)}
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
          
          {/* "More" Dropdown */}
          <div className="relative" onMouseLeave={() => setMoreOpen(false)}>
            <button
              type="button"
              onMouseEnter={() => setMoreOpen(true)}
              onClick={() => setMoreOpen((v) => !v)}
              className={`shrink-0 whitespace-nowrap rounded-full flex items-center gap-1 ${desktopNavLinkClass} leading-none tracking-wide transition-[background-color,color] duration-200 ${
                solidNav
                  ? "text-foreground/85 hover:bg-background/50 hover:text-foreground"
                  : "text-white/90 drop-shadow-[0_2px_10px_rgb(0_0_0/0.34)] hover:bg-white/[0.08] hover:text-[#f0bd5d]"
              }`}
            >
              {t("nav.more")} <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </button>
            {moreOpen && (
              <div className="absolute top-full right-0 pt-2 w-48 animate-scale-in">
                <ul className="glass rounded-lg p-1.5 shadow-elegant flex flex-col gap-1">
                  {MORE_NAV.map((item) => {
                    const isActive = isNavItemActive(item);
                    const label = t(item.key);
                    return (
                      <li key={item.key}>
                        <a
                          href={`${item.to}${item.hash}`}
                          onClick={(event) => handleNavClick(event, item)}
                          className={`flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors ${
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-foreground/85 hover:bg-muted/70 hover:text-foreground"
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

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          {/* Language switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              aria-label="Change language"
              className={`${controlClass} inline-flex min-h-11 min-w-0 items-center gap-1.5 px-2.5 py-1.5 text-[12px] uppercase tracking-widest ${controlTextClass}`}
            >
              <Globe className="h-3.5 w-3.5" />
              {LANGS.find((l) => l.code === lang)?.native}
              <ChevronDown className="h-3 w-3 opacity-70" />
            </button>
            {langOpen && (
              <ul role="listbox" className="glass absolute right-0 mt-2 w-44 rounded-lg p-1 shadow-elegant animate-scale-in">
                {LANGS.map((l) => (
                  <li key={l.code}>
                    <button
                      role="option"
                      data-lang={l.code}
                      aria-selected={l.code === lang}
                      onClick={() => { setLang(l.code); setLangOpen(false); }}
                      className={`flex min-h-10 w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${l.code === lang ? "bg-primary/10 text-primary" : "hover:bg-muted/70"}`}
                    >
                      <span>{l.label}</span>
                      <span className="text-[12px] uppercase tracking-widest opacity-70">{l.native}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={openLogin}
            className={`${showDesktopActions ? "hidden 2xl:inline-flex" : "hidden"} min-h-11 whitespace-nowrap px-3 py-2 text-sm tracking-wide transition-colors ${controlTextClass}`}
          >
            {t("cta.login")}
          </button>
          <button
            onClick={openRegister}
            className={`${showDesktopActions ? "hidden 2xl:inline-flex" : "hidden"} whitespace-nowrap btn-ghost-gold !border-primary/50 !bg-[#fff8ec] !py-2 !px-4 text-sm font-bold !text-[#7a4a0a] shadow-[0_8px_22px_-18px_rgb(122_74_10/0.7)]`}
          >
            {t("cta.register")}
          </button>
          <a
            href="/#faqs"
            onClick={(event) => handleNavClick(event, STARTING_FROM_NAV_TARGET)}
            className={`${showDesktopActions ? "hidden 2xl:inline-flex" : "hidden"} whitespace-nowrap btn-gold !py-2 !px-4 text-sm font-bold !text-white drop-shadow-[0_1px_1px_rgb(76_42_0/0.45)]`}
          >
            {t("cta.start")}
          </a>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className={`${controlClass} ${compactNav ? "" : "xl:hidden"} h-11 w-11 shrink-0`}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none invisible fixed -left-[9999px] top-0 flex items-center gap-4 whitespace-nowrap"
      >
        <nav ref={navMeasureRef} className={`flex items-center justify-center ${desktopNavSpacing}`}>
          {NAV.map((item) => {
            const label = t(item.key);
            return (
              <span key={item.key} className={`rounded-full ${desktopNavLinkClass} leading-none tracking-wide`}>
                {getDesktopNavLabel(lang, item.key, label)}
              </span>
            );
          })}
          <span className={`rounded-full ${desktopNavLinkClass} leading-none tracking-wide`}>
            {t("nav.more")}
          </span>
        </nav>
        <div ref={controlsMeasureRef} className="flex items-center gap-3">
          <span data-nav-persistent className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] uppercase tracking-widest">
            <Globe className="h-3.5 w-3.5" />
            {LANGS.find((l) => l.code === lang)?.native}
            <ChevronDown className="h-3 w-3" />
          </span>
          <span className="px-3 py-2 text-sm tracking-wide">{t("cta.login")}</span>
          <span className="px-4 py-2 text-sm tracking-wide">{t("cta.register")}</span>
          <span className="px-4 py-2 text-sm tracking-wide">{t("cta.start")}</span>
        </div>
      </div>

      {/* Mobile drawer */}
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
            <nav aria-label="Mobile" className="rounded-xl border border-white/10 bg-background/95 p-2 shadow-2xl backdrop-blur-xl flex flex-col gap-0.5">
              {ALL_NAV.map((item) => {
                const isActive = isNavItemActive(item);
                return (
                  <a
                    key={item.key}
                    href={`${item.to}${item.hash}`}
                    aria-current={isActive ? "page" : undefined}
                    onClick={(event) => handleNavClick(event, item)}
                    className={`rounded-lg px-4 py-2.5 text-[15px] font-medium transition-colors duration-200 ${
                      isActive
                        ? "bg-primary/15 text-primary w-full"
                        : "text-foreground/80 hover:bg-white/5 hover:text-foreground w-full"
                    }`}
                  >
                    {t(item.key)}
                  </a>
                );
              })}
            </nav>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button onClick={openLogin} className="btn-ghost-gold w-full justify-center text-center leading-tight">{t("cta.login")}</button>
              <button onClick={openRegister} className="btn-gold w-full justify-center text-center leading-tight">{t("cta.register")}</button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
