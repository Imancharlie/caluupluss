import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { StudentProvider } from "@/contexts/StudentContext";
import { HelmetProvider } from "react-helmet-async";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/layout/Layout";
import ErrorBoundary from "@/components/ErrorBoundary";
import SplashScreen from "./pages/SplashScreen";
import Dashboard from "./pages/Dashboard";
import EmailVerificationPage from "./pages/activate_page"
import SelectionPage from "./pages/SelectionPage";
import ElectiveSelection from "./pages/ElectiveSelection";
import GpaCalculator from "./pages/GpaCalculator";
import AdminUpload from "./pages/AdminUpload";
import AdminLogin from "./pages/AdminLogin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./components/ForgotPassword";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import BlogExplore from "./pages/BlogExplore";
import BlogPost from "./pages/BlogPost";
import AdminPanel from "./pages/AdminPanel";
import SendEmail from "./pages/SendEmail";
import ExamPreparation from './pages/ExamPreparation';
import ClassesTimetable from './pages/ClassesTimetable';
import Timetable from './pages/Timetable';
import Chatbot from './pages/Chatbot';
import Voting from './pages/Voting';
import CareerGuidance from './pages/CareerGuidance';
import Workplace from './pages/Workplace';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import SavedArticles from './pages/SavedArticles';
import CompleteProfile from './pages/CompleteProfile';
import Profile from './pages/Profile';
import HelpCenter from "./pages/HelpCenter";
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

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/explore" element={<BlogExplore />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/activate" element={<EmailVerificationPage />} />
        {/* Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/selection"
          element={
            <ProtectedRoute>
              <Layout>
                <SelectionPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/elective-selection"
          element={
            <ProtectedRoute>
              <Layout>
                <ElectiveSelection />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/calculator"
          element={
            <ProtectedRoute>
              <Layout>
                <GpaCalculator />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/upload"
          element={
            <ProtectedRoute requireAdmin>
              <Layout>
                <AdminUpload />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <Layout>
                <AdminPanel />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/send-email"
          element={
            <ProtectedRoute requireAdmin>
              <Layout>
                <SendEmail />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* New/Updated Pages */}
        <Route
          path="/complete-profile"
          element={
            <ProtectedRoute>
              <Layout>
                <CompleteProfile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/timetable"
          element={
            <ProtectedRoute>
              <Layout>
                <Timetable />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <Layout>
                <Chatbot />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/voting"
          element={
            <ProtectedRoute>
              <Layout>
                <Voting />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/career"
          element={
            <ProtectedRoute>
              <Layout>
                <CareerGuidance />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Keep legacy link accessible for now */}
        <Route path="/udsm-timetable" element={<ExamPreparation />} />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Layout>
                <Notifications />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/articles"
          element={
            <ProtectedRoute>
              <Layout>
                <Articles />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/articles/:id"
          element={
            <Layout>
              <ArticleDetail />
            </Layout>
          }
        />
        <Route
          path="/saved-articles"
          element={
            <ProtectedRoute>
              <Layout>
                <SavedArticles />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/workplace"
          element={
            <ProtectedRoute>
              <Layout>
                <Workplace />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <StudentProvider>
                <ErrorBoundary>
                  <AppRoutes />
                  <Toaster />
                  <Sonner />
                </ErrorBoundary>
              </StudentProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
