import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AxiosError } from 'axios';

interface ApiError {
  error?: string;
  detail?: string;
  non_field_errors?: string[];
}

const Register = () => {
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/selection");
    }
  }, [user, navigate]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    if (email.length > 150) {
      return "Email address is too long (maximum 150 characters)";
    }
    return null;
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const validateName = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return "Please enter your name";
    }
    if (!trimmedName.includes(' ')) {
      return "Please enter your full name (first and last name)";
    }
    if (trimmedName.length > 150) {
      return "Name is too long (maximum 150 characters)";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic field validation
    if (!email || !password || !name) {
      toast.error("Please fill in all fields");
      return;
    }

    // Specific validation with detailed messages
    const emailError = validateEmail(email);
    if (emailError) {
      toast.error(emailError);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    const nameError = validateName(name);
    if (nameError) {
      toast.error(nameError);
      return;
    }
    
    setIsLoading(true);
    console.log("Starting registration process...");
    
    try {
      console.log("Calling signUp with:", { email, name });
      const user = await signUp(email, password, name);
      console.log("Registration successful, user:", user);
      
      // Show success message and navigate
      toast.success("Account created successfully! Welcome to CALUU.");
      navigate("/activate");
    } catch (error) {
      console.error("Registration error:", error);
      
      if (error instanceof Error) {
        const errorMessage = error.message;
        
        // Handle specific error cases
        if (errorMessage.includes("already registered")) {
          toast.error("This email is already registered. Please use a different email or sign in.");
        } else if (errorMessage.includes("try signing in manually")) {
          toast.error("Registration completed but automatic sign in failed. Please try signing in manually.");
          navigate("/login");
        } else if (errorMessage.includes("Network error")) {
          toast.error("Network error: Please check your internet connection and try again.");
        } else if (errorMessage.includes("Server error")) {
          toast.error("Server error: Something went wrong on our end. Please try again later.");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Registration failed. Please try again later.");
      }
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
          onClick={() => navigate("/login")}
          className="flex items-center text-white opacity-70 hover:opacity-100 transition-opacity"
        >
          <ChevronLeft size={20} />
          <span>Back to Login</span>
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

            <motion.h1 
              className="text-3xl font-bold text-white mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              Create Account
            </motion.h1>
            
            <motion.p 
              className="text-white/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              Join us to start your academic journey
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
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-caluu-blue focus:border-transparent outline-none"
                  placeholder="Enter your full name"
                  disabled={isLoading}
                  required
                  autoComplete="name"
                />
              </div>

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
                    autoComplete="new-password"
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
                {isLoading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          </motion.div>
          
          <motion.div 
            className="mt-4 text-center text-white/60 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            <p>Already have an account?{" "}
              <button 
                onClick={() => navigate("/login")}
                className="text-white hover:underline"
              >
                Login 
              </button>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
