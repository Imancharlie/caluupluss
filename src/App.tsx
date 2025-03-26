
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import SplashScreen from "./pages/SplashScreen";
import SelectionPage from "./pages/SelectionPage";
import ElectiveSelection from "./pages/ElectiveSelection";
import GpaCalculator from "./pages/GpaCalculator";
import AdminUpload from "./pages/AdminUpload";
import AdminLogin from "./pages/AdminLogin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<SplashScreen />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/selection" 
                element={
                  <ProtectedRoute>
                    <SelectionPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/elective-selection" 
                element={
                  <ProtectedRoute>
                    <ElectiveSelection />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/calculator" 
                element={
                  <ProtectedRoute>
                    <GpaCalculator />
                  </ProtectedRoute>
                } 
              />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route 
                path="/admin/upload" 
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminUpload />
                  </ProtectedRoute>
                } 
              />
              {/* Fallback route for unknown paths */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </AuthProvider>
      </BrowserRouter>
      <Sonner position="top-right" />
      <Toaster />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
