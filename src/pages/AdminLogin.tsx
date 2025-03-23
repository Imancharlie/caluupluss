
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle login submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter both username and password.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Mock API call - replace with actual authentication API
    setTimeout(() => {
      // For demo purposes, use a simple check
      if (username === "admin" && password === "password") {
        toast({
          title: "Login Successful",
          description: "Welcome to the admin dashboard.",
          variant: "default"
        });
        
        // Store admin auth token in sessionStorage
        sessionStorage.setItem("adminAuth", "true");
        
        // Navigate to admin upload page
        navigate("/admin/upload");
      } else {
        toast({
          title: "Authentication Failed",
          description: "Invalid username or password.",
          variant: "destructive"
        });
      }
      
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-caluu-blue-dark flex flex-col">
      {/* Header with back button */}
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
      
      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-center mb-8">
            <motion.div 
              className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <span className="text-caluu-blue-dark text-4xl font-bold">C</span>
            </motion.div>
            
            <motion.h1 
              className="text-3xl font-bold text-white mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              Admin Access
            </motion.h1>
            
            <motion.p 
              className="text-white/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              Sign in to access the administrative panel
            </motion.p>
          </div>
          
          <motion.div 
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <form onSubmit={handleSubmit} className="p-6">
              {/* Username Input */}
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input"
                  placeholder="Enter your username"
                  disabled={isLoading}
                />
              </div>
              
              {/* Password Input */}
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
                    className="form-input pr-10"
                    placeholder="Enter your password"
                    disabled={isLoading}
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
              
              {/* Submit Button */}
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
          
          {/* Demo credentials */}
          <motion.div 
            className="mt-4 text-center text-white/60 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            <p>Demo credentials: username <span className="font-medium text-white/80">admin</span> / password <span className="font-medium text-white/80">password</span></p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;
