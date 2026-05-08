import { lazy, Suspense, useEffect, useRef } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { I18nProvider } from "@/i18n/I18nProvider";
import { UIProvider, useUI } from "@/components/ui-state";
import { ChatWidget } from "@/components/ChatWidget";
import { SiteContentProvider } from "@/data/SiteContentProvider";
import { installGlideScroll, scrollToHash, scrollToPageTop } from "@/lib/smooth-scroll";

const Index = lazy(() => import("./pages/Index.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Modals = lazy(() => import("@/components/Modals").then((module) => ({ default: module.Modals })));

function RouteFallback() {
  return <div className="min-h-screen bg-background" aria-hidden />;
}

function DeferredModals() {
  const { modal } = useUI();
  if (!modal) return null;

  return (
    <Suspense fallback={null}>
      <Modals />
    </Suspense>
  );
}

function ScrollManager() {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined" || !("scrollRestoration" in window.history)) return;

    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => installGlideScroll(), []);

  useEffect(() => {
    const firstRender = isFirstRender.current;
    isFirstRender.current = false;

    const frameIds: number[] = [];

    const runScroll = (attemptsLeft = 12) => {
      if (location.hash) {
        const didScroll = scrollToHash(location.hash, firstRender ? "auto" : undefined);
        if ((!didScroll || firstRender) && attemptsLeft > 0) {
          const frameId = window.requestAnimationFrame(() => runScroll(attemptsLeft - 1));
          frameIds.push(frameId);
        }
        return;
      }

      if (!firstRender) {
        scrollToPageTop();
      }
    };

    const frameId = window.requestAnimationFrame(() => runScroll(firstRender ? 36 : 12));
    frameIds.push(frameId);

    return () => {
      frameIds.forEach((id) => window.cancelAnimationFrame(id));
    };
  }, [location.hash, location.pathname]);

  return null;
}

const App = () => (
  <I18nProvider>
    <SiteContentProvider>
      <UIProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <ScrollManager />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <DeferredModals />
          <ChatWidget />
        </BrowserRouter>
      </UIProvider>
    </SiteContentProvider>
  </I18nProvider>
);

export default App;
