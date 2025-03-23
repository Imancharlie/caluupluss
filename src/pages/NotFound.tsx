
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-caluu-blue-dark p-6">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-white text-9xl font-bold mb-6"
        >
          404
        </motion.div>
        
        <motion.h1 
          className="text-4xl font-bold text-white mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Page Not Found
        </motion.h1>
        
        <motion.p 
          className="text-xl text-white/70 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          The page you are looking for doesn't exist or has been moved.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <button
            onClick={() => navigate("/")}
            className="bg-white text-caluu-blue-dark px-6 py-3 rounded-lg font-medium shadow-lg hover:bg-white/90 transition-colors"
          >
            Return to Home
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
