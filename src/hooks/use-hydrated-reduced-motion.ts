import { useEffect, useState } from "react";
import { getReducedMotionPreference } from "@/lib/motion";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function useHydratedReducedMotion() {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    const reducedMotionPreference = getReducedMotionPreference();

    if (reducedMotionPreference === "never" || typeof window.matchMedia !== "function") {
      setShouldReduceMotion(false);
      return undefined;
    }

    if (reducedMotionPreference === "always") {
      setShouldReduceMotion(true);
      return undefined;
    }

    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const updateMotionPreference = () => {
      setShouldReduceMotion(mediaQuery.matches);
    };

    updateMotionPreference();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateMotionPreference);
      return () => mediaQuery.removeEventListener("change", updateMotionPreference);
    }

    mediaQuery.addListener(updateMotionPreference);
    return () => mediaQuery.removeListener(updateMotionPreference);
  }, []);

  return shouldReduceMotion;
}
