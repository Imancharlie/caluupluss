
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const SplashScreen = () => {
  const navigate = useNavigate();
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    // Trigger animation after a short delay
    const animationTimeout = setTimeout(() => {
      setStartAnimation(true);
    }, 500);

    // Navigate to selection page after splash screen
    const navigationTimeout = setTimeout(() => {
      navigate("/selection");
    }, 3500);

    return () => {
      clearTimeout(animationTimeout);
      clearTimeout(navigationTimeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-caluu-blue-dark overflow-hidden">
      <div className="relative flex flex-col items-center justify-center">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: startAnimation ? 1 : 0.8, 
            opacity: startAnimation ? 1 : 0 
          }}
          transition={{ 
            duration: 0.6, 
            ease: "easeOut" 
          }}
          className="mb-6"
        >
          <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-caluu-blue-dark text-5xl font-bold">C</span>
          </div>
        </motion.div>

        {/* Title with staggered animation */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: startAnimation ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: startAnimation ? 1 : 0, y: startAnimation ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="inline-block"
            >
              CALUU
            </motion.span>
          </h1>
          
          <motion.p 
            className="text-xl text-white/80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: startAnimation ? 1 : 0, y: startAnimation ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            your academic journey simplified
          </motion.p>
        </motion.div>

        {/* Animated loading indicator */}
        <motion.div 
          className="mt-12 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: startAnimation ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="w-40 h-1 bg-white/20 rounded-full overflow-hidden mx-auto">
            <motion.div 
              className="h-full bg-white"
              initial={{ width: "0%" }}
              animate={{ width: startAnimation ? "100%" : "0%" }}
              transition={{ duration: 2, delay: 1, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SplashScreen;
