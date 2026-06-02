"use client";

import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { useUI } from "@/components/ui-state";
import { getActiveSectionHash, replaceLocationHash, syncLocationHashToActiveSection } from "@/lib/section-hash";
import { scrollToPageTop } from "@/lib/smooth-scroll";
import { Logo } from "./Logo";
import { DesktopNav } from "./nav/DesktopNav";
import { MobileDrawer } from "./nav/MobileDrawer";
import { NavControls } from "./nav/NavControls";
import { NavMeasurement } from "./nav/NavMeasurement";
import { getBrowserLocation, type BrowserLocationState } from "./nav/nav-location";
import { clearPendingNavScrollTimers, scrollToNavHash } from "./nav/nav-scroll";
import { useNavResponsiveMode } from "./nav/use-nav-responsive-mode";
import { HOME_RETURN_HASH_SYNC_LOCK_MS, HOME_SECTION_IDS, type NavItem } from "./nav/nav-data";

const desktopStoryNavQuery = "(min-width: 1280px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)";

function shouldHideNavForDesktopStory() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.location.pathname === "/" && window.matchMedia(desktopStoryNavQuery).matches;
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
  const [hideForDesktopStory, setHideForDesktopStory] = useState(false);
  const [location, setLocation] = useState<BrowserLocationState>({ pathname: "/", hash: "" });
  const navRowRef = useRef<HTMLDivElement | null>(null);
  const logoSlotRef = useRef<HTMLDivElement | null>(null);
  const navMeasureRef = useRef<HTMLDivElement | null>(null);
  const controlsMeasureRef = useRef<HTMLDivElement | null>(null);
  const homeHashSyncLockedUntilRef = useRef(0);
  const solidNav = scrolled || open || langOpen;
  const fullNavAvailable = !compactNav;
  // Login/Register stay with the language selector whenever desktop nav is visible (no 2xl gate).
  const showInlineAuth = fullNavAvailable;
  const showDesktopStart = fullNavAvailable && desktopActionsAvailable;
  const showCompactMenu = compactNav;
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
  const isNavItemActive = (item: NavItem) =>
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

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, item: NavItem) => {
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

      const current = syncUrlHash ? syncLocationHashToActiveSection(HOME_SECTION_IDS) : getActiveSectionHash(HOME_SECTION_IDS);
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
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined;

    const mediaQuery = window.matchMedia(desktopStoryNavQuery);
    const updateDesktopStoryVisibility = () => setHideForDesktopStory(shouldHideNavForDesktopStory());

    updateDesktopStoryVisibility();
    mediaQuery.addEventListener("change", updateDesktopStoryVisibility);
    window.addEventListener("popstate", updateDesktopStoryVisibility);
    window.addEventListener("hashchange", updateDesktopStoryVisibility);

    return () => {
      mediaQuery.removeEventListener("change", updateDesktopStoryVisibility);
      window.removeEventListener("popstate", updateDesktopStoryVisibility);
      window.removeEventListener("hashchange", updateDesktopStoryVisibility);
    };
  }, []);

  useEffect(() => {
    setHideForDesktopStory(shouldHideNavForDesktopStory());
  }, [location.pathname]);

  useLayoutEffect(() => {
    const compactMedia = window.matchMedia("(max-width: 1179px)");
    const syncCompactViewport = () => {
      if (!compactMedia.matches) return;
      setCompactNav(true);
      setDesktopActionsAvailable(false);
    };

    syncCompactViewport();
    compactMedia.addEventListener("change", syncCompactViewport);
    return () => compactMedia.removeEventListener("change", syncCompactViewport);
  }, []);

  useNavResponsiveMode({
    controlsMeasureRef,
    lang,
    logoSlotRef,
    navMeasureRef,
    navRowRef,
    setCompactNav,
    setDesktopActionsAvailable,
  });

  if (hideForDesktopStory) return null;

  return (
    <header
      dir="ltr"
      data-nav-compact={compactNav ? "true" : "false"}
      data-nav-inline-auth={showInlineAuth ? "true" : "false"}
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ${
        solidNav ? "border-b border-border/50 bg-background/[0.78] shadow-soft backdrop-blur-2xl" : "border-b border-transparent bg-transparent"
      }`}
    >
      <div ref={navRowRef} className="mx-auto flex h-16 w-full max-w-[1760px] items-center justify-between gap-4 px-6 md:h-20 md:px-10">
        <div ref={logoSlotRef} className="shrink-0">
          <Logo
            className={solidNav ? "" : "text-white drop-shadow-[0_3px_14px_rgb(0_0_0/0.34)]"}
            iconClassName={solidNav ? undefined : "[filter:brightness(0)_invert(1)]"}
            onHomeClick={beginHomeReturn}
          />
        </div>

        <DesktopNav
          desktopNavLinkClass={desktopNavLinkClass}
          desktopNavSpacing={desktopNavSpacing}
          fullNavAvailable={fullNavAvailable}
          isNavItemActive={isNavItemActive}
          lang={lang}
          moreOpen={moreOpen}
          setMoreOpen={setMoreOpen}
          solidNav={solidNav}
          t={t}
          onNavClick={handleNavClick}
        />

        <NavControls
          showCompactMenu={showCompactMenu}
          controlClass={controlClass}
          controlTextClass={controlTextClass}
          lang={lang}
          langOpen={langOpen}
          open={open}
          setLang={setLang}
          setLangOpen={setLangOpen}
          setOpen={setOpen}
          showDesktopStart={showDesktopStart}
          showInlineAuth={showInlineAuth}
          t={t}
          onLogin={openLogin}
          onRegister={openRegister}
          onNavClick={handleNavClick}
        />
      </div>

      <NavMeasurement
        controlsMeasureRef={controlsMeasureRef}
        desktopNavLinkClass={desktopNavLinkClass}
        desktopNavSpacing={desktopNavSpacing}
        lang={lang}
        navMeasureRef={navMeasureRef}
        t={t}
      />

      <MobileDrawer
        showCompactMenu={showCompactMenu}
        isNavItemActive={isNavItemActive}
        open={open}
        t={t}
        onLogin={openLogin}
        onRegister={openRegister}
        onNavClick={handleNavClick}
      />
    </header>
  );
}
