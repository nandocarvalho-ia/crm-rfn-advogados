import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import CRM from "./pages/CRM";
import FollowUps from "./pages/FollowUps";
import ChatAoVivo from "./pages/ChatAoVivo";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Redesign Fase 2 — todas as páginas novas sob o AppLayout */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/follow-ups" element={<FollowUps />} />
            <Route path="/chat-ao-vivo" element={<ChatAoVivo />} />
          </Route>

          {/* CRM legacy — acesso temporário ao CRMDashboardReal em produção
              enquanto o novo CRM é finalizado. Fora do AppLayout. */}
          <Route path="/crm-legacy" element={<Index />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
