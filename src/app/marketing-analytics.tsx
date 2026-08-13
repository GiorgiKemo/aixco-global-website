"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";
import { ANALYTICS_CONSENT_EVENT } from "@/lib/analytics/constants";
import {
  analyticsCollectionAllowed,
} from "@/lib/analytics/client";
import { isAdminAnalyticsExcludedPath } from "@/lib/analytics/routes";
import { WebVitals } from "./web-vitals";

const googleTagManagerId = "GTM-KCZJW8NN";
type GoogleConsentStatus = "granted" | "denied";

function updateGoogleConsent(status: GoogleConsentStatus) {
  if (typeof window === "undefined") return;

  const browserWindow = window as Window & { dataLayer?: unknown[] };
  const dataLayer = browserWindow.dataLayer;
  if (dataLayer || status === "granted") {
    browserWindow.dataLayer = dataLayer ?? [];
    browserWindow.dataLayer.push([
      "consent",
      "update",
      {
        analytics_storage: status,
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      },
    ]);
  }

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

function useGoogleAnalyticsConsent() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => {
      const nextAllowed = analyticsCollectionAllowed();
      setAllowed(nextAllowed);
      updateGoogleConsent(nextAllowed ? "granted" : "denied");
    };

    sync();
    window.addEventListener(ANALYTICS_CONSENT_EVENT, sync);
    return () => window.removeEventListener(ANALYTICS_CONSENT_EVENT, sync);
  }, []);

  return allowed;
}

export function MarketingAnalytics() {
  const pathname = usePathname();
  const googleAnalyticsAllowed = useGoogleAnalyticsConsent();

  if (isAdminAnalyticsExcludedPath(pathname)) return null;

  return (
    <>
      {/* Load marketing analytics after the first render and an idle window so
          the public story can paint its hero and intro animation without
          third-party script work on the critical path. The inline route check
          also prevents a queued load after an SPA navigation into /admin. */}
      {googleAnalyticsAllowed && <Script id="google-tag-manager" strategy="lazyOnload">
        {`(function(w,d,s,l,i){function load(){if(/^\\/admin(?:\\/|$)/.test(w.location.pathname))return;if(w.__aixcoGtmLoaded)return;w.__aixcoGtmLoaded=true;w[l]=w[l]||[];function gtag(){w[l].push(arguments);}gtag('consent','update',{'analytics_storage':'granted','ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied'});w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);}
if('requestIdleCallback' in w){w.requestIdleCallback(load,{timeout:4000});}else{w.setTimeout(load,4000);}
})(window,document,'script','dataLayer','${googleTagManagerId}');`}
      </Script>}
      <WebVitals />
    </>
  );
}
