import { useEffect, useState } from "react";

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export function scheduleIdleWork(callback: () => void, timeout = 1800) {
  if (typeof window === "undefined") return () => undefined;

  const idleWindow = window as IdleWindow;
  if (typeof idleWindow.requestIdleCallback === "function") {
    const handle = idleWindow.requestIdleCallback(callback, { timeout });
    return () => idleWindow.cancelIdleCallback?.(handle);
  }

  const handle = window.setTimeout(callback, Math.min(timeout, 900));
  return () => window.clearTimeout(handle);
}

export function useIdleReady(timeout = 1800) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => scheduleIdleWork(() => setIsReady(true), timeout), [timeout]);

  return isReady;
}
