import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { Logo } from "./Logo";
import { useI18n, LANGS } from "@/i18n/I18nProvider";
import { useUI } from "@/components/ui-state";
import { getActiveSectionHash, syncLocationHashToActiveSection } from "@/lib/section-hash";
import { scrollToHash, scrollToPageTop } from "@/lib/smooth-scroll";

const NAV = [
  { key: "nav.home", to: "/", hash: "" },
  { key: "nav.about", to: "/", hash: "#about" },
  { key: "nav.dubai", to: "/", hash: "#dubai" },
  { key: "nav.batumi", to: "/", hash: "#batumi" },
  { key: "nav.participate", to: "/", hash: "#participate" },
  { key: "nav.how", to: "/", hash: "#how" },
  { key: "nav.team", to: "/", hash: "#team" },
  { key: "nav.partners", to: "/", hash: "#partners" },
  { key: "nav.faqs", to: "/", hash: "#faqs" },
  { key: "nav.contact", to: "/", hash: "#contact" },
];
const HOME_SECTION_IDS = ["about", "dubai", "batumi", "participate", "how", "team", "partners", "faqs", "contact"] as const;
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

export function Nav() {
  const { t, lang, setLang } = useI18n();
  const { openLogin, openRegister } = useUI();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const [compactNav, setCompactNav] = useState(false);
  const navRowRef = useRef<HTMLDivElement | null>(null);
  const logoSlotRef = useRef<HTMLDivElement | null>(null);
  const navMeasureRef = useRef<HTMLDivElement | null>(null);
  const controlsMeasureRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const solidNav = scrolled || open || langOpen;
  const fullNavAvailable = !compactNav;
  const compactDesktopLabels = lang === "ka";
  const desktopNavSpacing = compactDesktopLabels ? "gap-1 px-2" : "gap-2 px-3";
  const desktopNavLinkClass = compactDesktopLabels
    ? "px-2 py-1.5 text-[clamp(11.5px,0.66vw,13px)]"
    : "px-2.5 py-1.5 text-[clamp(12px,0.72vw,13.5px)]";
  const topControlClass =
    "inline-flex items-center justify-center rounded-lg border border-white/25 bg-white/[0.06] text-white/90 shadow-[0_8px_28px_rgb(0_0_0/0.16)] backdrop-blur-md transition-all duration-300 hover:border-[#f0bd5d]/55 hover:bg-white/[0.12] hover:text-[#f0bd5d]";
  const controlClass = solidNav ? "icon-button-glass" : topControlClass;
  const controlTextClass = solidNav
    ? "text-foreground/85 hover:text-foreground"
    : "text-white/90 drop-shadow-[0_2px_10px_rgb(0_0_0/0.34)] hover:text-[#f0bd5d]";
  const effectiveActiveHash = active || location.hash;
  const isNavItemActive = (item: (typeof NAV)[number]) =>
    item.hash ? effectiveActiveHash === item.hash : location.pathname === item.to && !effectiveActiveHash;

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, item: (typeof NAV)[number]) => {
    setLangOpen(false);
    setOpen(false);

    if (location.pathname !== item.to || location.hash !== item.hash) return;

    event.preventDefault();
    if (item.hash) {
      scrollToHash(item.hash);
    } else {
      scrollToPageTop();
    }
  };

  useEffect(() => {
    const updateScrollState = (syncUrlHash: boolean) => {
      setScrolled(window.scrollY > 88);
      if (location.pathname !== "/") return;
      const current = syncUrlHash
        ? syncLocationHashToActiveSection(HOME_SECTION_IDS)
        : getActiveSectionHash(HOME_SECTION_IDS);
      setActive(current);
    };

    const onScroll = () => updateScrollState(true);

    updateScrollState(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  useEffect(() => { setOpen(false); }, [location.pathname, location.hash]);

  useLayoutEffect(() => {
    const updateCompactMode = () => {
      if (typeof window === "undefined") return;

      if (window.innerWidth < 1280) {
        setCompactNav(true);
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
      const controlsWidth =
        window.innerWidth >= 1536 ? measuredControls.scrollWidth : persistentControls?.scrollWidth ?? measuredControls.scrollWidth;
      const horizontalGaps = 32;
      const reserve = 28;

      setCompactNav(logoWidth + navWidth + controlsWidth + horizontalGaps + reserve > availableWidth);
    };

    updateCompactMode();

    const observer = new ResizeObserver(updateCompactMode);
    [navRowRef.current, logoSlotRef.current, navMeasureRef.current, controlsMeasureRef.current].forEach((element) => {
      if (element) observer.observe(element);
    });

    window.addEventListener("resize", updateCompactMode);
    document.fonts?.ready.then(updateCompactMode).catch(() => undefined);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateCompactMode);
    };
  }, [lang]);

  return (
    <header dir="ltr" className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${solidNav ? "border-b border-border/50 bg-background/[0.78] shadow-soft backdrop-blur-2xl" : "border-b border-transparent bg-transparent"}`}>
      <div ref={navRowRef} className="mx-auto flex h-16 w-full max-w-[1760px] items-center justify-between gap-4 px-6 md:h-20 md:px-10">
        <div ref={logoSlotRef} className="shrink-0">
          <Logo
            className={solidNav ? "" : "text-white drop-shadow-[0_3px_14px_rgb(0_0_0/0.34)]"}
            iconClassName={solidNav ? undefined : "[filter:brightness(0)_invert(1)]"}
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
              <Link
                key={item.key}
                to={href}
                title={label}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
                onClick={(event) => handleNavClick(event, item)}
                className={`shrink-0 whitespace-nowrap rounded-full ${desktopNavLinkClass} leading-none tracking-wide transition-all duration-300 ${
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
              </Link>
            );
          })}
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
                      className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${l.code === lang ? "bg-primary/10 text-primary" : "hover:bg-muted/70"}`}
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
            className={`${fullNavAvailable ? "hidden 2xl:inline-flex" : "hidden"} min-h-11 whitespace-nowrap px-3 py-2 text-sm tracking-wide transition-colors ${controlTextClass}`}
          >
            {t("cta.login")}
          </button>
          <button
            onClick={openRegister}
            className={`${fullNavAvailable ? "hidden 2xl:inline-flex" : "hidden"} whitespace-nowrap btn-ghost-gold !py-2 !px-4 text-sm`}
          >
            {t("cta.register")}
          </button>
          <Link
            to="/#participate"
            onClick={(event) => handleNavClick(event, NAV[4])}
            className={`${fullNavAvailable ? "hidden 2xl:inline-flex" : "hidden"} whitespace-nowrap btn-gold !py-2 !px-4 text-sm`}
          >
            {t("cta.start")}
          </Link>

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
        className={`${compactNav ? "" : "2xl:hidden"} transition-[max-height] duration-500 ${
          open ? "max-h-[calc(100svh-4rem)] overflow-y-auto" : "max-h-0 overflow-hidden"
        }`}
      >
        <div className="container-x pb-6 pt-2">
          <nav aria-label="Mobile" className="glass grid gap-1 rounded-lg p-2">
            {NAV.map((item) => {
              const isActive = isNavItemActive(item);
              return (
                <Link
                  key={item.key}
                  to={`${item.to}${item.hash}`}
                  aria-current={isActive ? "page" : undefined}
                  onClick={(event) => handleNavClick(event, item)}
                  className={`rounded-md px-3 py-3 text-base leading-snug transition ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/85 hover:bg-muted/70 hover:text-foreground"
                  }`}
                >
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button onClick={openLogin} className="btn-ghost-gold w-full justify-center text-center leading-tight">{t("cta.login")}</button>
            <button onClick={openRegister} className="btn-gold w-full justify-center text-center leading-tight">{t("cta.register")}</button>
          </div>
        </div>
      </div>
    </header>
  );
}
