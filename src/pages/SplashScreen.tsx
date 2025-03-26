
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, GraduationCap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const SplashScreen = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [startAnimation, setStartAnimation] = useState(false);
  const [animationCompleted, setAnimationCompleted] = useState(false);

  useEffect(() => {
    // Trigger animation after a short delay
    const animationTimeout = setTimeout(() => {
      setStartAnimation(true);
    }, 300);

    // Set animation completed after animation time
    const completionTimeout = setTimeout(() => {
      setAnimationCompleted(true);
    }, 3000);

    return () => {
      clearTimeout(animationTimeout);
      clearTimeout(completionTimeout);
    };
  }, []);

  // Handle navigation after animation and auth check
  useEffect(() => {
    // Only navigate when both animation is completed and auth check is not loading
    if (animationCompleted && !loading) {
      console.log('SplashScreen: Animation completed, auth status:', user ? 'authenticated' : 'unauthenticated');
      
      if (user) {
        navigate("/selection");
      } else {
        navigate("/login");
      }
    }
  }, [navigate, user, loading, animationCompleted]);

  // Floating particles animation
  const particles = Array.from({ length: 12 }).map((_, i) => (
    <motion.div
      key={i}
      className="absolute rounded-full bg-white/30"
      style={{
        width: Math.random() * 8 + 4,
        height: Math.random() * 8 + 4,
        left: `${Math.random() * 80 + 10}%`,
        top: `${Math.random() * 80 + 10}%`,
      }}
      initial={{ opacity: 0 }}
      animate={{
        opacity: startAnimation ? [0, 0.6, 0] : 0,
        y: startAnimation ? [0, -40] : 0,
      }}
      transition={{
        duration: 2 + Math.random() * 2,
        repeat: Infinity,
        delay: Math.random() * 2,
      }}
    />
  ));

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-caluu-blue-dark to-[#102841]">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-caluu-blue/20 blur-[120px] opacity-60" />
      </div>

      {/* Animated floating particles */}
      {particles}

      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4">
        {/* Logo with enhanced animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: startAnimation ? 1 : 0.8, 
            opacity: startAnimation ? 1 : 0 
          }}
          transition={{ 
            duration: 0.7, 
            ease: "easeOut" 
          }}
          className="mb-8 relative"
        >
          
          {/* Sparkle effect */}
          <motion.div
            className="absolute -top-2 -right-2"
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ 
              opacity: startAnimation ? [0, 1, 0] : 0,
              rotate: startAnimation ? [0, 15] : 0,
              scale: startAnimation ? [0.8, 1.2, 0.8] : 0.8
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatDelay: 1
            }}
          >
            <Sparkles className="text-yellow-300 w-6 h-6" />
          </motion.div>
        </motion.div>

        {/* Title with enhanced staggered animation */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: startAnimation ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-3 tracking-tight relative">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: startAnimation ? 1 : 0, 
                y: startAnimation ? 0 : 20 
              }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="inline-block bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent"
            >
              CALUU
            </motion.span>
          </h1>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="text-caluu-blue/90 w-5 h-5" />
            <motion.p 
              className="text-xl text-white/90 font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: startAnimation ? 1 : 0, 
                y: startAnimation ? 0 : 20 
              }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              your academic Best friend
            </motion.p>
          </div>
        </motion.div>

        {/* Enhanced loading indicator */}
        <motion.div 
          className="mt-12 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: startAnimation ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden mx-auto backdrop-blur-sm">
            <motion.div 
              className="h-full bg-gradient-to-r from-caluu-blue via-caluu-blue to-caluu-blue-light"
              initial={{ width: "0%" }}
              animate={{ width: startAnimation ? "100%" : "0%" }}
              transition={{ 
                duration: 2.5, 
                delay: 0.8, 
                ease: "easeInOut" 
              }}
              onAnimationComplete={() => {
                console.log("Loading animation completed");
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SplashScreen;
