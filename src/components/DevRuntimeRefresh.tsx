"use client";

import { useEffect } from "react";

const devRuntimeEndpoint = "/api/dev-runtime-version";
const pollIntervalMs = 1200;
const reloadCooldownMs = 5000;
const runtimeStorageKey = "aixco-dev-runtime-version";
const runtimeReloadTokenKey = "aixco-dev-runtime-reload-token";
const runtimeReloadParam = "__aixco_runtime";

type DevRuntimeVersionResponse = {
  version?: string;
};

export function DevRuntimeRefresh() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return undefined;

    let currentVersion: string | null = null;
    let lastReloadAt = 0;
    let disposed = false;
    let checkInFlight = false;

    const cleanRuntimeReloadParam = () => {
      const currentUrl = new URL(window.location.href);
      try {
        window.sessionStorage.removeItem(runtimeReloadTokenKey);
      } catch {
        // Development-only persistence is optional.
      }

      if (!currentUrl.searchParams.has(runtimeReloadParam)) return;

      currentUrl.searchParams.delete(runtimeReloadParam);
      window.history.replaceState(window.history.state, "", currentUrl.toString());
    };

    const forceCacheBustedNavigation = (version: string) => {
      if (Date.now() - lastReloadAt <= reloadCooldownMs) return;

      lastReloadAt = Date.now();
      const reloadToken = String(Date.now());
      try {
        window.sessionStorage.setItem(runtimeStorageKey, version);
        window.sessionStorage.setItem(runtimeReloadTokenKey, reloadToken);
      } catch {
        // Development-only persistence is optional.
      }

      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set(runtimeReloadParam, reloadToken);
      window.location.replace(nextUrl.toString());
    };

    const checkVersion = async () => {
      if (checkInFlight) return;

      checkInFlight = true;
      try {
        const response = await fetch(`${devRuntimeEndpoint}?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!response.ok) return;

        const payload = (await response.json()) as DevRuntimeVersionResponse;
        if (!payload.version) return;

        if (currentVersion === null) {
          currentVersion = payload.version;
          try {
            window.sessionStorage.setItem(runtimeStorageKey, payload.version);
          } catch {
            // Development-only persistence is optional.
          }
          cleanRuntimeReloadParam();
          return;
        }

        if (payload.version !== currentVersion) {
          forceCacheBustedNavigation(payload.version);
          return;
        }

        cleanRuntimeReloadParam();
      } catch {
        // Development-only guard: failed checks should never affect the page.
      } finally {
        checkInFlight = false;
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
