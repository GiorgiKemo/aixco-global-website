"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { isAdminAnalyticsExcludedPath } from "@/lib/analytics/routes";
import { WebVitals } from "./web-vitals";

const googleTagManagerId = "GTM-KCZJW8NN";

export function MarketingAnalytics() {
  const pathname = usePathname();

  if (isAdminAnalyticsExcludedPath(pathname)) return null;

  return (
    <>
      {/* Load marketing analytics after the first render and an idle window so
          the public story can paint its hero and intro animation without
          third-party script work on the critical path. The inline route check
          also prevents a queued load after an SPA navigation into /admin. */}
      <Script id="google-tag-manager" strategy="lazyOnload">
        {`(function(w,d,s,l,i){function load(){if(/^\\/admin(?:\\/|$)/.test(w.location.pathname))return;if(w.__aixcoGtmLoaded)return;w.__aixcoGtmLoaded=true;w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);}
if('requestIdleCallback' in w){w.requestIdleCallback(load,{timeout:4000});}else{w.setTimeout(load,4000);}
})(window,document,'script','dataLayer','${googleTagManagerId}');`}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        />
      </noscript>
      <WebVitals />
    </>
  );
}
