"use client";

import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/i18n/I18nProvider";
import { UIProvider } from "@/components/ui-state";
import { SiteContentProvider } from "@/data/SiteContentProvider";
import { ScrollManager } from "@/components/ScrollManager";
import { useIdleReady } from "@/hooks/use-idle-ready";
import type { SiteContent, SiteContentResult } from "@/lib/backend/site-content";

const Modals = lazy(() => import("@/components/Modals").then((module) => ({ default: module.Modals })));
const ChatWidget = lazy(() => import("@/components/ChatWidget").then((module) => ({ default: module.ChatWidget })));
const ScrollToTopButton = lazy(() =>
  import("@/components/ScrollToTopButton").then((module) => ({ default: module.ScrollToTopButton })),
);
const Toaster = lazy(() => import("@/components/ui/toaster").then((module) => ({ default: module.Toaster })));
const Sonner = lazy(() => import("@/components/ui/sonner").then((module) => ({ default: module.Toaster })));

const queryClient = new QueryClient();

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
  const idleUiReady = useIdleReady(1200);

  return (
    <I18nProvider>
      <SiteContentProvider initialContent={initialSiteContent} initialSource={initialSiteContentSource}>
        <UIProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <ScrollManager />
              {children}
              {idleUiReady && (
                <Suspense fallback={null}>
                  <ScrollToTopButton />
                  <Toaster />
                  <Sonner />
                  <Modals />
                  <ChatWidget />
                </Suspense>
              )}
            </TooltipProvider>
          </QueryClientProvider>
        </UIProvider>
      </SiteContentProvider>
    </I18nProvider>
  );
}
