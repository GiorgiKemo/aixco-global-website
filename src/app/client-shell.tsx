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

const Modals = lazy(() => import("@/components/Modals").then((module) => ({ default: module.Modals })));
const ChatWidget = lazy(() => import("@/components/ChatWidget").then((module) => ({ default: module.ChatWidget })));

const queryClient = new QueryClient();

export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <SiteContentProvider>
        <UIProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <ScrollManager />
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
