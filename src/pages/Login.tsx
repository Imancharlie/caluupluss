
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const { signInWithEmail, user } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/selection");
    }
  }, [user, navigate]);

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
      console.log("Login successful, navigating to /selection");
      navigate("/selection");
    } catch (error) {
      console.error("Login error:", error);
      // Toast is already shown in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-caluu-blue-dark flex flex-col">
      <motion.div 
        className="p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button 
          onClick={() => navigate("/")}
          className="flex items-center text-white opacity-70 hover:opacity-100 transition-opacity"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>
      </motion.div>
      
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-center mb-8">
            <motion.div 
              className="mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <img
                src="/lovable-uploads/1d1159cc-5ad8-47f9-a69b-b6624cac259b.png"
                alt="CALUU Logo"
                className="w-32 h-32 object-contain mx-auto drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              />
            </motion.div>
            
            <motion.h1 
              className="text-3xl font-bold text-white mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              Welcome Back
            </motion.h1>
            
            <motion.p 
              className="text-white/70"
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
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-caluu-blue focus:border-transparent outline-none"
                  placeholder="Enter your email"
                  disabled={isLoading}
                  required
                  autoComplete="email"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-caluu-blue focus:border-transparent outline-none pr-10"
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
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 bg-caluu-blue text-white font-medium rounded-lg shadow-md transition-all duration-300 ${
                  isLoading 
                    ? "opacity-70 cursor-not-allowed" 
                    : "hover:bg-caluu-blue-light hover:shadow-lg"
                }`}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </motion.div>
          
          <motion.div 
            className="mt-4 text-center text-white/60 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            <p>Don't have an account?{" "}
              <button 
                onClick={() => navigate("/register")}
                className="text-white hover:underline"
              >
                Sign up
              </button>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
