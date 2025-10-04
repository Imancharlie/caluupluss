import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import LoginHelpPopup from "@/components/LoginHelpPopup";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithEmail, user, loading } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showHelpPopup, setShowHelpPopup] = useState(false);

  // Get the redirect path from location state or default to /dashboard
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";

  // Show help popup after 30 minutes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHelpPopup(true);
    }, 30 * 1000); // 30 second in milliseconds

    return () => clearTimeout(timer);
  }, []);

  // Only redirect if user is authenticated and not loading
  useEffect(() => {
    if (user && !loading) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    console.log("Starting login process...");
    
    try {
      console.log("Calling signInWithEmail with:", { email });
      await signInWithEmail(email, password);
      console.log("Login successful, navigating to:", from);
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      // Toast is already shown in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex flex-col">
        
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <motion.div 
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="text-center mb-6">
              <motion.h1 
                className="text-3xl font-bold text-gray-900 mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                Welcome to Caluu
              </motion.h1>
              
              <motion.p 
                className="text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                Sign in to continue your academic journey
              </motion.p>
            </div>
            
            <motion.div 
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-5">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-caluu-blue focus:border-transparent outline-none"
                    placeholder="Enter your email"
                    disabled={isLoading}
                    required
                    autoComplete="email"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-caluu-blue focus:border-transparent outline-none pr-10"
                      placeholder="Enter your password"
                      disabled={isLoading}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                      className="text-sm text-caluu-blue hover:text-caluu-blue-light transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-4 px-6 bg-caluu-blue text-white font-semibold text-lg rounded-lg shadow-lg transition-all duration-300 ${
                    isLoading 
                      ? "opacity-70 cursor-not-allowed" 
                      : "hover:bg-caluu-blue-light hover:shadow-xl hover:scale-[1.02]"
                  }`}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            </motion.div>
            
            <motion.div 
              className="mt-4 text-center text-gray-600 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              <p>Don't have an account?{" "}
                <button 
                  onClick={() => navigate("/register")}
                  className="text-caluu-blue hover:text-caluu-blue-light hover:underline font-semibold text-base"
                >
                  Create Account
                </button>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
      <LoginHelpPopup 
        isVisible={showHelpPopup} 
        onClose={() => setShowHelpPopup(false)} 
      />
    </>
  );
};

export default Login;
