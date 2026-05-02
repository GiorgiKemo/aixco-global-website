import { useEffect, useState, type MouseEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { Logo } from "./Logo";
import { useI18n, LANGS } from "@/i18n/I18nProvider";
import { useUI } from "@/components/ui-state";
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

export function Nav() {
  const { t, lang, setLang } = useI18n();
  const { openLogin, openRegister } = useUI();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const location = useLocation();
  const solidNav = scrolled || open || langOpen;
  const topControlClass =
    "inline-flex items-center justify-center rounded-lg border border-white/25 bg-white/[0.06] text-white/90 shadow-[0_8px_28px_rgb(0_0_0/0.16)] backdrop-blur-md transition-all duration-300 hover:border-[#f0bd5d]/55 hover:bg-white/[0.12] hover:text-[#f0bd5d]";
  const controlClass = solidNav ? "icon-button-glass" : topControlClass;
  const controlTextClass = solidNav
    ? "text-foreground/85 hover:text-foreground"
    : "text-white/90 drop-shadow-[0_2px_10px_rgb(0_0_0/0.34)] hover:text-[#f0bd5d]";

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
    const onScroll = () => {
      setScrolled(window.scrollY > 88);
      // active section
      if (location.pathname !== "/") return;
      const sections = ["about", "dubai", "batumi", "participate", "how", "team", "partners", "faqs", "contact"];
      let current = "";
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) current = `#${id}`;
        }
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  useEffect(() => { setOpen(false); }, [location.pathname, location.hash]);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${solidNav ? "border-b border-border/50 bg-background/[0.78] shadow-soft backdrop-blur-2xl" : "border-b border-transparent bg-transparent"}`}>
      <div className="mx-auto flex h-16 w-full max-w-[1760px] items-center justify-between gap-4 px-6 md:h-20 md:px-10">
        <Logo
          className={solidNav ? "" : "text-white drop-shadow-[0_3px_14px_rgb(0_0_0/0.34)]"}
          iconClassName={solidNav ? undefined : "[filter:brightness(0)_invert(1)]"}
        />

        <nav aria-label="Primary" className="hidden min-w-0 flex-1 items-center justify-center gap-2.5 px-4 2xl:flex">
          {NAV.map((item) => {
            const isActive = item.hash ? active === item.hash : location.pathname === item.to && !active;
            const href = `${item.to}${item.hash}`;
            return (
              <Link
                key={item.key}
                to={href}
                onClick={(event) => handleNavClick(event, item)}
                className={`shrink-0 rounded-full px-2.5 py-1.5 text-[12px] tracking-wide transition-all duration-300 ${
                  solidNav
                    ? isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/85 hover:bg-background/50 hover:text-foreground"
                    : isActive
                      ? "bg-white/[0.08] text-[#f0bd5d] drop-shadow-[0_2px_10px_rgb(0_0_0/0.34)]"
                      : "text-white/90 drop-shadow-[0_2px_10px_rgb(0_0_0/0.34)] hover:bg-white/[0.08] hover:text-[#f0bd5d]"
                }`}
              >
                {t(item.key)}
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
              className={`${controlClass} inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] uppercase tracking-widest ${controlTextClass}`}
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
                      <span className="text-[10px] uppercase tracking-widest opacity-70">{l.native}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={openLogin}
            className={`hidden px-3 py-2 text-[13px] tracking-wide transition-colors 2xl:inline-flex ${controlTextClass}`}
          >
            {t("cta.login")}
          </button>
          <button onClick={openRegister} className="hidden xl:inline-flex btn-ghost-gold !py-2 !px-4 text-[12px]">
            {t("cta.register")}
          </button>
          <Link
            to="/#participate"
            onClick={(event) => handleNavClick(event, NAV[4])}
            className="hidden xl:inline-flex btn-gold !py-2 !px-4 text-[12px]"
          >
            {t("cta.start")}
          </Link>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className={`${controlClass} 2xl:hidden h-10 w-10`}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`lg:hidden overflow-hidden transition-[max-height] duration-500 ${open ? "max-h-[80vh]" : "max-h-0"}`}>
        <div className="container-x pb-6 pt-2">
          <nav aria-label="Mobile" className="glass grid gap-1 rounded-lg p-2">
            {NAV.map((item) => (
              <Link
                key={item.key}
                to={`${item.to}${item.hash}`}
                onClick={(event) => handleNavClick(event, item)}
                className="rounded-md px-3 py-3 text-base text-foreground/85 hover:bg-muted/70 hover:text-foreground"
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button onClick={openLogin} className="btn-ghost-gold">{t("cta.login")}</button>
            <button onClick={openRegister} className="btn-gold">{t("cta.register")}</button>
          </div>
        </div>
      </div>
    </header>
  );
}
