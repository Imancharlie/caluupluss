import { motion, AnimatePresence } from "framer-motion";
import { X, HelpCircle, UserPlus, Key, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

interface LoginHelpPopupProps {
  isVisible: boolean;
  onClose: () => void;
}

const LoginHelpPopup = ({ isVisible, onClose }: LoginHelpPopupProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-caluu-blue-dark border border-white/10 rounded-2xl p-6 max-w-lg w-full relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="w-6 h-6 text-caluu-blue" />
              <h2 className="text-2xl font-bold text-white">Need Help?</h2>
            </div>

            <div className="space-y-6">
              {/* Login Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white/90">Getting Started</h3>
                <div className="grid gap-4">
                  <Link
                    to="/register"
                    className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group"
                  >
                    <UserPlus className="w-5 h-5 text-caluu-blue group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="text-white font-medium">Don't have an account?</p>
                      <p className="text-white/60 text-sm">Create one in less than 2 minutes</p>
                    </div>
                  </Link>

                  <Link
                    to="/forgot-password"
                    className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group"
                  >
                    <Key className="w-5 h-5 text-caluu-blue group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="text-white font-medium">Forgot your password?</p>
                      <p className="text-white/60 text-sm">Reset it quickly and securely</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Blog Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white/90">Explore Our Blog</h3>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-white/80 mb-4">
                    Discover helpful articles about GPA calculation, academic success tips, and more!
                  </p>
                  <Link
                    to="/blog"
                    className="inline-flex items-center gap-2 bg-caluu-blue hover:bg-caluu-blue/90 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    Visit Blog
                  </Link>
                </div>
              </div>

              {/* Security Message */}
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/80 text-sm">
                  Your security is our priority. Login is required to protect your personal data and ensure a safe experience for all users.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginHelpPopup; 