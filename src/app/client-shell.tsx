"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { I18nProvider } from "@/i18n/I18nProvider";
import { UIProvider, useUI } from "@/components/ui-state";
import { SiteContentProvider } from "@/data/SiteContentProvider";
import { DevRuntimeRefresh } from "@/components/DevRuntimeRefresh";
import { ScrollManager } from "@/components/ScrollManager";
import { useDelayedIdleReady } from "@/hooks/use-idle-ready";
import type { SiteContent, SiteContentResult } from "@/lib/backend/site-content";

const Modals = lazy(() => import("@/components/Modals").then((module) => ({ default: module.Modals })));
const ChatWidget = lazy(() => import("@/components/ChatWidget").then((module) => ({ default: module.ChatWidget })));
const ScrollToTopButton = lazy(() =>
  import("@/components/ScrollToTopButton").then((module) => ({ default: module.ScrollToTopButton })),
);
const Toaster = lazy(() => import("@/components/ui/toaster").then((module) => ({ default: module.Toaster })));
const Sonner = lazy(() => import("@/components/ui/sonner").then((module) => ({ default: module.Toaster })));

const queryClient = new QueryClient();
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

function DeferredShellUi({ isAdminRoute }: { isAdminRoute: boolean }) {
  const interactiveUiReady = useDelayedIdleReady(interactiveUiDelayMs, 1200);
  const nonCriticalUiReady = useNonCriticalUiReady();
  const { modal } = useUI();

  if (isAdminRoute) return null;

  return (
    <>
      {(interactiveUiReady || modal !== null) && (
        <Suspense fallback={null}>
          <Toaster />
          <Sonner />
          <Modals />
        </Suspense>
      )}
      {nonCriticalUiReady && (
        <Suspense fallback={null}>
          <ScrollToTopButton />
          <ChatWidget />
        </Suspense>
      )}
    </>
  );
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
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  return (
    <I18nProvider>
      <SiteContentProvider initialContent={initialSiteContent} initialSource={initialSiteContentSource}>
        <UIProvider>
          <QueryClientProvider client={queryClient}>
            <DevRuntimeRefresh />
            {!isAdminRoute && <ScrollManager />}
            {children}
            <DeferredShellUi isAdminRoute={isAdminRoute} />
          </QueryClientProvider>
        </UIProvider>
      </SiteContentProvider>
    </I18nProvider>
  );
}
