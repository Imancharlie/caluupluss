import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AxiosError } from "axios";

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
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // After successful registration (auto-login), send users to complete profile
  useEffect(() => {
    if (user) {
      navigate("/complete-profile", { replace: true });
    }
  }, [user, navigate]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    if (email.length > 150) return "Email address is too long";
    return null;
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain a number";
    return null;
  };

  const validatePasswordConfirm = (pass: string, confirm: string) => {
    if (confirm.trim().length === 0) return 'Please confirm your password';
    if (pass !== confirm) return 'Passwords do not match';
    return null;
  };

  const validateName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return "Please enter your name";
    if (!trimmed.includes(" ")) return "Please enter your full name";
    if (trimmed.length > 150) return "Name is too long";
    return null;
  };

  const validatePhone = (phoneNumber: string) => {
    const p = phoneNumber.trim();
    if (!p) return null;
    if (!/^\+?[0-9]{7,15}$/.test(p)) return 'Please enter a valid phone number';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const nameError = validateName(name);
    const phoneError = validatePhone(phone);
    const confirmError = validatePasswordConfirm(password, passwordConfirm);

    if (emailError || passwordError || nameError || phoneError || confirmError) {
      toast.error(emailError || passwordError || nameError || phoneError || confirmError || "Invalid input");
      return;
    }

    setIsLoading(true);

    try {
      await signUp(email, password, passwordConfirm, name, gender || undefined, phone || undefined);
      // store optional extras for profile bootstrap (fallback if backend ignores)
      localStorage.setItem('pending_profile_extras', JSON.stringify({ gender, phone }));
      navigate('/complete-profile');
      
    } catch (error) {
      const errorMessage = (error as Error).message;
      
      // Show specific error message for email already exists
      if (errorMessage.includes("already registered")) {
        toast.error(errorMessage, {
          action: {
            label: "Sign In",
            onClick: () => navigate("/login")
          }
        });
      } else {
        toast.error(errorMessage);
      }
      
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex flex-col">
      
      <div className="h-8"></div>

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
              Create Account
            </motion.h1>

            <motion.p
              className="text-gray-600"
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
              <div className="mb-5">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-caluu-blue focus:border-transparent outline-none"
                  placeholder="Enter your full name"
                  disabled={isLoading}
                  required
                />
              </div>

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
                />
              </div>

              <div className="mb-5">
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
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="mb-5">
                <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="password_confirm"
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-caluu-blue focus:border-transparent outline-none"
                  placeholder="Re-enter your password"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-caluu-blue focus:border-transparent outline-none">
                    <option value="">----</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone number</label>
                  <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-caluu-blue focus:border-transparent outline-none" placeholder="e.g., +255712345678" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 px-6 bg-caluu-blue text-white font-semibold text-lg rounded-lg shadow-lg transition-all duration-300 ${
                  isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-caluu-blue-light hover:shadow-xl hover:scale-[1.02]"
                }`}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          </motion.div>

          <motion.div
            className="mt-4 text-center text-gray-600 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            <p>
              Already have an account?{" "}
              <button 
                onClick={() => navigate("/login")} 
                className="text-caluu-blue hover:text-caluu-blue-light hover:underline font-medium"
                disabled={isLoading}
              >
                Login
              </button>
            </p> <div className="h-8"></div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
