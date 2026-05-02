import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { I18nProvider } from "@/i18n/I18nProvider";
import { UIProvider, useUI } from "@/components/ui-state";
import { ChatWidget } from "@/components/ChatWidget";

const Index = lazy(() => import("./pages/Index.tsx"));
const Insights = lazy(() => import("./pages/Insights.tsx"));
const Article = lazy(() => import("./pages/Article.tsx"));
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

const App = () => (
  <I18nProvider>
    <UIProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/insights/:slug" element={<Article />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <DeferredModals />
        <ChatWidget />
      </BrowserRouter>
    </UIProvider>
  </I18nProvider>
);

export default App;
