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
            className="bg-white border border-gray-200 rounded-2xl p-6 max-w-lg w-full relative shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
  <HelpCircle className="w-5 h-5 text-caluu-blue" />
  <h2 className="text-xl font-semibold text-gray-900">Need Help?</h2>
</div>

<div className="space-y-4">
  {/* Login Options */}
  <div className="space-y-3">
    <h3 className="text-base font-semibold text-gray-800">Getting Started</h3>
    <div className="grid gap-3">
      <Link
        to="/register"
        className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-caluu-blue/5 rounded-xl transition-colors group border border-gray-100"
      >
        <UserPlus className="w-5 h-5 text-caluu-blue group-hover:scale-110 transition-transform" />
        <div>
          <p className="text-gray-900 text-sm font-medium">Don't have an account?</p>
          <p className="text-gray-600 text-xs">Create one in less than 2 minutes</p>
        </div>
      </Link>

      <Link
        to="/forgot-password"
        className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-caluu-blue/5 rounded-xl transition-colors group border border-gray-100"
      >
        <Key className="w-5 h-5 text-caluu-blue group-hover:scale-110 transition-transform" />
        <div>
          <p className="text-gray-900 text-sm font-medium">Forgot your password?</p>
          <p className="text-gray-600 text-xs">Reset it quickly and securely</p>
        </div>
      </Link>
    </div>
  </div>

  {/* Blog Section */}
  <div className="space-y-2">
    <h3 className="text-base font-semibold text-gray-800">Explore Our Blog</h3>
    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
      <p className="text-gray-700 text-sm mb-2">
        Discover helpful articles about GPA calculation, academic success tips, and more!
      </p>
      <Link
        to="/articles"
        className="inline-flex items-center gap-2 bg-caluu-blue hover:bg-caluu-blue-light text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
      >
        <BookOpen className="w-4 h-4" />
        Visit Blog
      </Link>
    </div>
  </div>

  {/* Security Message */}
  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
    <p className="text-gray-700 text-sm">
      Your security is our priority. Login is required to protect your personal data and ensure a safe experience for all users.
    </p>
    <div className="mt-3">
      <Link to="/help" className="inline-flex items-center gap-2 text-caluu-blue hover:text-caluu-blue-light font-medium">
        <HelpCircle className="w-4 h-4" />
        Visit Help Center
      </Link>
    </div>
  </div>
</div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginHelpPopup; 