import { useEffect, useState } from "react";

type CancelIdleWork = () => void;

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

const noop: CancelIdleWork = () => undefined;

export function scheduleIdleWork(callback: () => void, timeout = 1800): CancelIdleWork {
  if (typeof window === "undefined") return noop;

  const idleWindow = window as IdleWindow;
  if (typeof idleWindow.requestIdleCallback === "function") {
    const handle = idleWindow.requestIdleCallback(callback, { timeout });
    return () => idleWindow.cancelIdleCallback?.(handle);
  }

  const handle = window.setTimeout(callback, Math.min(timeout, 900));
  return () => window.clearTimeout(handle);
}

export function useDelayedIdleReady(startupDelay: number, idleTimeout = 1800) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return noop;

    setIsReady(false);
    let cancelIdleWork: CancelIdleWork = noop;
    const startupDelayHandle = window.setTimeout(() => {
      cancelIdleWork = scheduleIdleWork(() => setIsReady(true), idleTimeout);
    }, startupDelay);

    return () => {
      window.clearTimeout(startupDelayHandle);
      cancelIdleWork();
    };
  }, [idleTimeout, startupDelay]);

  return isReady;
}
