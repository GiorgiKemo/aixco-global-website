"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import { I18nProvider, useI18n } from "@/i18n/I18nProvider";
import { UIProvider, useUI } from "@/components/ui-state";
import { SiteContentProvider } from "@/data/SiteContentProvider";
import { ScrollManager } from "@/components/ScrollManager";
import { useDelayedIdleReady } from "@/hooks/use-idle-ready";
import type { SiteContent, SiteContentResult } from "@/lib/backend/site-content";

const Modals = lazy(() => import("@/components/Modals").then((module) => ({ default: module.Modals })));
const ChatWidget = lazy(() => import("@/components/ChatWidget").then((module) => ({ default: module.ChatWidget })));
const ContactNudge = lazy(() =>
  import("@/components/ContactNudge").then((module) => ({ default: module.ContactNudge })),
);
const ScrollToTopButton = lazy(() =>
  import("@/components/ScrollToTopButton").then((module) => ({ default: module.ScrollToTopButton })),
);
const mobileNonCriticalUiDelayMs = 6500;
const desktopNonCriticalUiDelayMs = 2200;
const interactiveUiDelayMs = 3200;

function useNonCriticalUiReady() {
  const [startupDelay, setStartupDelay] = useState(mobileNonCriticalUiDelayMs);

  useEffect(() => {
    setStartupDelay(window.innerWidth < 768 ? mobileNonCriticalUiDelayMs : desktopNonCriticalUiDelayMs);
  }, []);

  return useDelayedIdleReady(startupDelay, 1800);
}

function DeferredShellUi() {
  const interactiveUiReady = useDelayedIdleReady(interactiveUiDelayMs, 1200);
  const nonCriticalUiReady = useNonCriticalUiReady();
  const { modal } = useUI();

  return (
    <>
      {(interactiveUiReady || modal !== null) && (
        <Suspense fallback={null}>
          <Modals />
        </Suspense>
      )}
      {nonCriticalUiReady && (
        <Suspense fallback={null}>
          <ScrollToTopButton />
          <ContactNudge />
          <ChatWidget />
        </Suspense>
      )}
    </>
  );
}

function SkipToContentLink() {
  const { tx } = useI18n();
  return <a href="#main-content" className="skip-link">{tx("Skip to main content")}</a>;
}

type ClientShellProps = {
  children: React.ReactNode;
  initialSiteContent?: SiteContent;
  initialSiteContentSource?: SiteContentResult["source"];
};

export function ClientShell({
  children,
  initialSiteContent,
  initialSiteContentSource,
}: ClientShellProps) {
  return (
    <I18nProvider>
      <SiteContentProvider initialContent={initialSiteContent} initialSource={initialSiteContentSource}>
        <UIProvider>
          <ScrollManager />
          <SkipToContentLink />
          {children}
          <DeferredShellUi />
        </UIProvider>
      </SiteContentProvider>
    </I18nProvider>
  );
}
