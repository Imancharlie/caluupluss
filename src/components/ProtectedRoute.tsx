import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading, checkAuth } = useAuth();
  const location = useLocation();

  // Check auth status when component mounts or location changes
  useEffect(() => {
    const validateAuth = async () => {
      if (!user && !loading) {
        await checkAuth();
      }
    };
    validateAuth();
  }, [user, loading, checkAuth, location]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex items-center justify-center">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-caluu-blue border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  // If no user and not loading, redirect to login
  if (!user) {
    // Save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If admin is required and user is not admin, redirect to dashboard
  if (requireAdmin && !user.is_staff) {
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated and admin check passes (if required), render children
  return <>{children}</>;
};

export default ProtectedRoute;
