"use client";

import { useLayoutEffect, useRef, type Dispatch, type RefObject, type SetStateAction } from "react";

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
const RESIZE_DEBOUNCE_MS = 120;

export function useNavResponsiveMode({
  controlsMeasureRef,
  lang,
  logoSlotRef,
  navMeasureRef,
  navRowRef,
  setCompactNav,
  setDesktopActionsAvailable,
}: UseNavResponsiveModeOptions) {
  const resizeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    const isCompactViewport = () =>
      typeof window.matchMedia === "function"
        ? window.matchMedia(`(max-width: ${MIN_DESKTOP_NAV_WIDTH - 1}px)`).matches
        : window.innerWidth < MIN_DESKTOP_NAV_WIDTH;

    const updateCompactMode = () => {
      if (typeof window === "undefined") return;

      if (isCompactViewport()) {
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

    const scheduleResizeUpdate = () => {
      if (isCompactViewport()) {
        if (resizeDebounceRef.current) {
          clearTimeout(resizeDebounceRef.current);
          resizeDebounceRef.current = null;
        }
        updateCompactMode();
        return;
      }

      if (resizeDebounceRef.current) clearTimeout(resizeDebounceRef.current);
      resizeDebounceRef.current = setTimeout(() => {
        resizeDebounceRef.current = null;
        updateCompactMode();
      }, RESIZE_DEBOUNCE_MS);
    };

    updateCompactMode();

    const compactMedia = window.matchMedia(`(max-width: ${MIN_DESKTOP_NAV_WIDTH - 1}px)`);
    const onCompactMediaChange = () => scheduleResizeUpdate();
    compactMedia.addEventListener("change", onCompactMediaChange);

    const observer = new ResizeObserver(() => {
      scheduleResizeUpdate();
    });
    [navRowRef.current, logoSlotRef.current, navMeasureRef.current, controlsMeasureRef.current].forEach((element) => {
      if (element) observer.observe(element);
    });

    window.addEventListener("resize", scheduleResizeUpdate);
    if (process.env.NODE_ENV !== "test") {
      document.fonts?.ready.then(updateCompactMode).catch(() => undefined);
    }

    return () => {
      if (resizeDebounceRef.current) clearTimeout(resizeDebounceRef.current);
      compactMedia.removeEventListener("change", onCompactMediaChange);
      observer.disconnect();
      window.removeEventListener("resize", scheduleResizeUpdate);
    };
  }, [controlsMeasureRef, lang, logoSlotRef, navMeasureRef, navRowRef, setCompactNav, setDesktopActionsAvailable]);
}
