"use client";

import { useLayoutEffect, type Dispatch, type RefObject, type SetStateAction } from "react";

type UseNavResponsiveModeOptions = {
  controlsMeasureRef: RefObject<HTMLDivElement | null>;
  lang: string;
  logoSlotRef: RefObject<HTMLDivElement | null>;
  navMeasureRef: RefObject<HTMLDivElement | null>;
  navRowRef: RefObject<HTMLDivElement | null>;
  setCompactNav: Dispatch<SetStateAction<boolean>>;
  setDesktopActionsAvailable: Dispatch<SetStateAction<boolean>>;
};

const MIN_DESKTOP_NAV_WIDTH = 1180;

export function useNavResponsiveMode({
  controlsMeasureRef,
  lang,
  logoSlotRef,
  navMeasureRef,
  navRowRef,
  setCompactNav,
  setDesktopActionsAvailable,
}: UseNavResponsiveModeOptions) {
  useLayoutEffect(() => {
    const updateCompactMode = () => {
      if (typeof window === "undefined") return;

      if (window.innerWidth < MIN_DESKTOP_NAV_WIDTH) {
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
      const availableWidth = row.clientWidth - Number.parseFloat(rowStyle.paddingLeft) - Number.parseFloat(rowStyle.paddingRight);
      const logoWidth = logo.getBoundingClientRect().width;
      const navWidth = measuredNav.scrollWidth;
      const persistentControls = measuredControls.querySelector<HTMLElement>("[data-nav-persistent]");
      const persistentControlsWidth = persistentControls?.scrollWidth ?? measuredControls.scrollWidth;
      const fullControlsWidth = measuredControls.scrollWidth;
      const horizontalGaps = 32;
      const reserve = 28;
      // Persistent block includes language + Login + Register so inline auth never clips off-screen.
      const coreNavFits = logoWidth + navWidth + persistentControlsWidth + horizontalGaps + reserve <= availableWidth;
      const desktopStartFits =
        window.innerWidth >= 1536 && logoWidth + navWidth + fullControlsWidth + horizontalGaps + reserve <= availableWidth;

      setCompactNav(!coreNavFits);
      setDesktopActionsAvailable(coreNavFits && desktopStartFits);
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
  }, [controlsMeasureRef, lang, logoSlotRef, navMeasureRef, navRowRef, setCompactNav, setDesktopActionsAvailable]);
}
