
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import SplashScreen from "./pages/SplashScreen";
import SelectionPage from "./pages/SelectionPage";
import ElectiveSelection from "./pages/ElectiveSelection";
import GpaCalculator from "./pages/GpaCalculator";
import AdminUpload from "./pages/AdminUpload";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/selection" element={<SelectionPage />} />
            <Route path="/elective-selection" element={<ElectiveSelection />} />
            <Route path="/calculator" element={<GpaCalculator />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/upload" element={<AdminUpload />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
