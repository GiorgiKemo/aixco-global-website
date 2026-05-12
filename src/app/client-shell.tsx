"use client";

import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { I18nProvider } from "@/i18n/I18nProvider";
import { UIProvider } from "@/components/ui-state";
import { SiteContentProvider } from "@/data/SiteContentProvider";
import { ScrollManager } from "@/components/ScrollManager";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import type { SiteContent, SiteContentResult } from "@/lib/backend/site-content";

const Modals = lazy(() => import("@/components/Modals").then((module) => ({ default: module.Modals })));
const ChatWidget = lazy(() => import("@/components/ChatWidget").then((module) => ({ default: module.ChatWidget })));

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
  return (
    <I18nProvider>
      <SiteContentProvider initialContent={initialSiteContent} initialSource={initialSiteContentSource}>
        <UIProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <ScrollManager />
              <ScrollToTopButton />
              {children}
              <Toaster />
              <Sonner />
              <Suspense fallback={null}>
                <Modals />
                <ChatWidget />
              </Suspense>
            </TooltipProvider>
          </QueryClientProvider>
        </UIProvider>
      </SiteContentProvider>
    </I18nProvider>
  );
}
