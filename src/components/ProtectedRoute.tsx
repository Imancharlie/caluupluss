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
      <div className="min-h-screen bg-caluu-blue-dark flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-12 w-12 rounded-full bg-white/20"></div>
        </div>
      </div>
    );
  }

  // If no user and not loading, redirect to login
  if (!user) {
    // Save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If admin is required and user is not admin, redirect to home
  if (requireAdmin && !user.is_staff) {
    return <Navigate to="/" replace />;
  }

  // If authenticated and admin check passes (if required), render children
  return <>{children}</>;
};

export default ProtectedRoute;
