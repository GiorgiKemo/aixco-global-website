"use client";

import { useEffect, useRef, useState } from "react";
import { PhoneCall, X } from "lucide-react";
import type { CountryCode } from "libphonenumber-js";
import { useI18n } from "@/i18n/I18nProvider";
import {
  getPhoneCountryFallback,
  toSupportedPhoneCountry,
} from "@/lib/phone-country";
import {
  getContactNudgeDelay,
  markContactNudgeOpenedThisSession,
  recordContactNudgeDismissal,
} from "@/lib/contact-nudge-preferences";
import { useUI } from "./ui-state";

const CONTACT_NUDGE_SCROLL_OFFSET = 120;

function getDetectedCountry(value: unknown) {
  if (!value || typeof value !== "object" || !("country" in value)) return null;
  return toSupportedPhoneCountry(String((value as { country?: unknown }).country ?? ""));
}

export function ContactNudge() {
  const { tx, lang } = useI18n();
  const { modal, openContact } = useUI();
  const [visible, setVisible] = useState(false);
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>(() =>
    getPhoneCountryFallback(lang),
  );
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setPhoneCountry(getPhoneCountryFallback(window.navigator.language, timezone));

    const controller = new AbortController();
    void fetch("/api/location/country", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: unknown) => {
        const country = getDetectedCountry(payload);
        if (country) setPhoneCountry(country);
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const startTimerAfterScroll = () => {
      if (timerRef.current !== null || window.scrollY < CONTACT_NUDGE_SCROLL_OFFSET) return;
      const delay = getContactNudgeDelay();
      if (delay === null) return;

      timerRef.current = window.setTimeout(() => {
        if (getContactNudgeDelay() !== null) setVisible(true);
        timerRef.current = null;
      }, delay);
    };

    window.addEventListener("scroll", startTimerAfterScroll, { passive: true });
    startTimerAfterScroll();

    return () => {
      window.removeEventListener("scroll", startTimerAfterScroll);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    const result = recordContactNudgeDismissal();

    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;

    if (result.shouldRemind && result.delayMs !== null) {
      timerRef.current = window.setTimeout(() => {
        if (getContactNudgeDelay() !== null) setVisible(true);
        timerRef.current = null;
      }, result.delayMs);
    }
  };

  const openContactForm = () => {
    setVisible(false);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    markContactNudgeOpenedThisSession();
    openContact({ kind: "contact-prompt", phoneCountry });
  };

  if (!visible || modal !== null) return null;

  return (
    <aside
      data-contact-nudge="true"
      aria-label={tx("Contact AIXCO")}
      className="contact-nudge fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))] end-[max(1rem,env(safe-area-inset-right,0px))] z-[94] w-[min(21rem,calc(100vw-2rem))] border border-primary/35 bg-surface-elevated/95 p-4 text-foreground shadow-[0_24px_70px_-30px_rgb(17_16_14/0.58)] backdrop-blur-xl sm:p-5"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
          <PhoneCall className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary-text">
            {tx("Personal contact")}
          </p>
          <h2 className="mt-1 font-display text-xl font-semibold leading-tight">
            {tx("Would you like us to contact you?")}
          </h2>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label={tx("Dismiss contact prompt")}
          className="icon-button-glass -me-1 -mt-1 h-9 w-9 shrink-0"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-foreground/70">
        {tx("Share your details and our team will get back to you.")}
      </p>

      <div className="mt-4">
        <button
          type="button"
          onClick={openContactForm}
          className="btn-gold min-h-10 w-full px-4 py-2 text-xs"
        >
          {tx("Contact me")}
        </button>
      </div>
    </aside>
  );
}
