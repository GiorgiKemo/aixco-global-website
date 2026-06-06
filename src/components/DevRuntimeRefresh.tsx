"use client";

import { useEffect } from "react";

const devRuntimeEndpoint = "/api/dev-runtime-version";
const pollIntervalMs = 1400;
const reloadCooldownMs = 5000;

type DevRuntimeVersionResponse = {
  version?: string;
};

export function DevRuntimeRefresh() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return undefined;

    let currentVersion: string | null = null;
    let lastReloadAt = 0;
    let disposed = false;

    const checkVersion = async () => {
      try {
        const response = await fetch(`${devRuntimeEndpoint}?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!response.ok) return;

        const payload = (await response.json()) as DevRuntimeVersionResponse;
        if (!payload.version) return;

        if (currentVersion === null) {
          currentVersion = payload.version;
          return;
        }

        if (payload.version !== currentVersion && Date.now() - lastReloadAt > reloadCooldownMs) {
          lastReloadAt = Date.now();
          window.location.reload();
        }
      } catch {
        // Development-only guard: failed checks should never affect the page.
      }
    };

    void checkVersion();
    const interval = window.setInterval(() => {
      if (!disposed) void checkVersion();
    }, pollIntervalMs);

    window.addEventListener("focus", checkVersion);
    window.addEventListener("pageshow", checkVersion);

    return () => {
      disposed = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", checkVersion);
      window.removeEventListener("pageshow", checkVersion);
    };
  }, []);

  return null;
}
