import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { StudentProvider } from "@/contexts/StudentContext";
import { HelmetProvider } from "react-helmet-async";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/layout/Layout";
import ErrorBoundary from "@/components/ErrorBoundary";
const SplashScreen = lazy(() => import("./pages/SplashScreen"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const EmailVerificationPage = lazy(() => import("./pages/activate_page"));
const SelectionPage = lazy(() => import("./pages/SelectionPage"));
const ElectiveSelection = lazy(() => import("./pages/ElectiveSelection"));
const GpaCalculator = lazy(() => import("./pages/GpaCalculator"));
const AdminUpload = lazy(() => import("./pages/AdminUpload"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./components/ForgotPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogExplore = lazy(() => import("./pages/BlogExplore"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const SendEmail = lazy(() => import("./pages/SendEmail"));
const ExamPreparation = lazy(() => import('./pages/ExamPreparation'));
const ClassesTimetable = lazy(() => import('./pages/ClassesTimetable'));
const Timetable = lazy(() => import('./pages/Timetable'));
const Chatbot = lazy(() => import('./pages/Chatbot'));
const CareerGuidance = lazy(() => import('./pages/CareerGuidance'));
const Workplace = lazy(() => import('./pages/Workplace'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Settings = lazy(() => import('./pages/Settings'));
const Articles = lazy(() => import('./pages/Articles'));
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'));
const SavedArticles = lazy(() => import('./pages/SavedArticles'));
const CompleteProfile = lazy(() => import('./pages/CompleteProfile'));
const Profile = lazy(() => import('./pages/Profile'));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
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
      <Suspense fallback={<div />}> 
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
      </Suspense>
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
