"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { scrollToPageTop } from "@/lib/smooth-scroll";
import { useI18n } from "@/i18n/I18nProvider";

const SCROLL_TO_TOP_VISIBILITY_OFFSET = 520;

export function ScrollToTopButton() {
  const { tx } = useI18n();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      setIsVisible(window.scrollY > SCROLL_TO_TOP_VISIBILITY_OFFSET);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });

    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      type="button"
      aria-label={tx("Scroll to top")}
      data-scroll-to-top-button="true"
      onClick={() => scrollToPageTop()}
      className="fixed bottom-5 left-5 z-[94] inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-gold transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background md:bottom-6 md:left-6 md:h-14 md:w-14"
    >
      <ChevronUp aria-hidden="true" className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2.1} />
    </button>
  );
}
