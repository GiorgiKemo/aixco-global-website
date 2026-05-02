import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/i18n/I18nProvider";
import { UIProvider } from "@/components/ui-state";
import { Modals } from "@/components/Modals";
import { ChatWidget } from "@/components/ChatWidget";
import Index from "./pages/Index.tsx";
import Insights from "./pages/Insights.tsx";
import Article from "./pages/Article.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <UIProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/insights/:slug" element={<Article />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Modals />
            <ChatWidget />
          </BrowserRouter>
        </TooltipProvider>
      </UIProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
