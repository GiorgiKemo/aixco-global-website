"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";
import { ANALYTICS_CONSENT_EVENT } from "@/lib/analytics/constants";
import {
  analyticsCollectionAllowed,
} from "@/lib/analytics/client";
import { isAnalyticsExcludedPath } from "@/lib/analytics/routes";
import { WebVitals } from "./web-vitals";

const googleTagManagerId = "GTM-KCZJW8NN";
type GoogleConsentStatus = "granted" | "denied";
type GoogleConsentValues = {
  analytics_storage: GoogleConsentStatus;
  ad_storage: "denied";
  ad_user_data: "denied";
  ad_personalization: "denied";
};
type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  __aixcoGoogleConsentDefaulted?: boolean;
};

const deniedGoogleConsent = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
} as const;

function queueGoogleConsent(
  dataLayer: unknown[],
  action: "default" | "update",
  values: GoogleConsentValues,
) {
  function gtag(..._command: unknown[]) {
    // GTM consent commands require the native Arguments object used by Google's gtag stub.
    // eslint-disable-next-line prefer-rest-params
    dataLayer.push(arguments);
  }

  gtag("consent", action, values);
}

function updateGoogleConsent(status: GoogleConsentStatus) {
  if (typeof window === "undefined") return;

  const browserWindow = window as AnalyticsWindow;
  const dataLayer = browserWindow.dataLayer ?? [];
  browserWindow.dataLayer = dataLayer;
  if (!browserWindow.__aixcoGoogleConsentDefaulted) {
    queueGoogleConsent(dataLayer, "default", deniedGoogleConsent);
    browserWindow.__aixcoGoogleConsentDefaulted = true;
  }
  queueGoogleConsent(dataLayer, "update", { ...deniedGoogleConsent, analytics_storage: status });

  if (status !== "denied") return;

  const cookieNames = document.cookie
    .split(";")
    .map((cookie) => cookie.trim().split("=", 1)[0])
    .filter((name) => /^(?:_ga(?:_.+)?|_gid|_gat(?:_.+)?|_gcl_au)$/i.test(name));
  for (const name of cookieNames) {
    document.cookie = `${name}=; Max-Age=0; path=/`;
    document.cookie = `${name}=; Max-Age=0; path=/; domain=${window.location.hostname}`;
  }
}

function useGoogleAnalyticsConsent(excludedRoute: boolean) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => {
      const nextAllowed = !excludedRoute && analyticsCollectionAllowed();
      setAllowed(nextAllowed);
      updateGoogleConsent(nextAllowed ? "granted" : "denied");
    };

    sync();
    window.addEventListener(ANALYTICS_CONSENT_EVENT, sync);
    return () => {
      window.removeEventListener(ANALYTICS_CONSENT_EVENT, sync);
      if (isAnalyticsExcludedPath(window.location.pathname)) {
        updateGoogleConsent("denied");
      }
    };
  }, [excludedRoute]);

  return allowed;
}

export function MarketingAnalytics() {
  const pathname = usePathname();
  const excludedRoute = isAnalyticsExcludedPath(pathname);
  const googleAnalyticsAllowed = useGoogleAnalyticsConsent(excludedRoute);

  if (excludedRoute) return null;

  return (
    <>
      {/* Next.js already defers lazyOnload scripts until browser idle. The inline
          route check prevents a queued load after an SPA navigation into a
          private or non-page route. */}
      {googleAnalyticsAllowed && <Script id="google-tag-manager" strategy="lazyOnload">
        {`(function(w,d,s,l,i){function load(){if(/^\\/(?:admin|api|portal)(?:\\/|$)/.test(w.location.pathname))return;if(w.__aixcoGtmLoaded)return;w.__aixcoGtmLoaded=true;w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);}
load();
})(window,document,'script','dataLayer','${googleTagManagerId}');`}
      </Script>}
      <WebVitals />
    </>
  );
}
