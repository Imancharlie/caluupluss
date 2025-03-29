import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { HelmetProvider } from "react-helmet-async";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAnalytics } from "@/hooks/useAnalytics";
import SplashScreen from "./pages/SplashScreen";
import SelectionPage from "./pages/SelectionPage";
import ElectiveSelection from "./pages/ElectiveSelection";
import GpaCalculator from "./pages/GpaCalculator";
import AdminUpload from "./pages/AdminUpload";
import AdminLogin from "./pages/AdminLogin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import './styles/globals.css';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Analytics wrapper component
const AnalyticsWrapper = ({ children }: { children: React.ReactNode }) => {
  useAnalytics(); // This will track page views and sessions
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <HelmetProvider>
        <div className="min-h-screen bg-background dark">
          <BrowserRouter>
            <AuthProvider>
              <AnalyticsWrapper>
                <Routes>
                  <Route path="/" element={<SplashScreen />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
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
              </AnalyticsWrapper>
            </AuthProvider>
          </BrowserRouter>
        </div>
      </HelmetProvider>
      <Sonner />
      <Toaster />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
