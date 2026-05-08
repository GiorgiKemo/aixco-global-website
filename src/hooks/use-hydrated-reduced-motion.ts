import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export function useHydratedReducedMotion() {
  const shouldReduceMotion = useReducedMotion();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated && shouldReduceMotion === true;
}
