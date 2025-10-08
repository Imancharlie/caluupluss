import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// Temporarily suppress toast notifications during splash screen loading
import { useToast } from "@/hooks/use-toast";

const SplashScreen = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [startAnimation, setStartAnimation] = useState(false);
  const [animationCompleted, setAnimationCompleted] = useState(false);

  // Suppress toast notifications during splash screen
  useEffect(() => {
    const originalToast = toast;
    // Override toast methods to prevent showing errors during splash
    Object.keys(toast).forEach(key => {
      if (typeof toast[key] === 'function') {
        toast[key] = () => {}; // No-op function
      }
    });

    return () => {
      // Restore original toast methods when component unmounts
      Object.assign(toast, originalToast);
    };
  }, [toast]);

  useEffect(() => {
    const animationTimeout = setTimeout(() => {
      setStartAnimation(true);
    }, 700); // slightly slower start

    const completionTimeout = setTimeout(() => {
      setAnimationCompleted(true);
    }, 6500); // extend total duration slightly

    return () => {
      clearTimeout(animationTimeout);
      clearTimeout(completionTimeout);
    };
  }, []);

  // Navigate after animation completes: dashboard if authenticated, otherwise login
  useEffect(() => {
    if (!animationCompleted || loading) return;
    if (user) {
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [animationCompleted, loading, user, navigate]);

  // Enhanced floating particles with better visibility (slower)
  const particles = Array.from({ length: 15 }).map((_, i) => (
    <motion.div
      key={i}
      className="absolute rounded-full"
      style={{
        width: Math.random() * 10 + 6,
        height: Math.random() * 10 + 6,
        left: `${Math.random() * 80 + 10}%`,
        top: `${Math.random() * 80 + 10}%`,
        background: i % 3 === 0 
          ? "rgba(59, 130, 246, 0.35)" 
          : i % 3 === 1 
          ? "rgba(251, 191, 36, 0.25)" 
          : "rgba(147, 197, 253, 0.3)",
        boxShadow: "0 0 15px rgba(59, 130, 246, 0.25)",
      }}
      initial={{ opacity: 0 }}
      animate={{
        opacity: startAnimation ? [0, 0.6, 0] : 0,
        y: startAnimation ? [0, -60] : 0,
        x: startAnimation ? [0, Math.random() * 30 - 15] : 0,
      }}
      transition={{
        duration: 5 + Math.random() * 3, // 5-8s
        repeat: Infinity,
        delay: Math.random() * 2.5,
        ease: "easeInOut",
      }}
    />
  ));

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-amber-50">
      {/* Enhanced background with multiple glows */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-200/20 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-amber-200/15 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-300/10 blur-[120px]" />
      </div>

      {/* Animated floating particles */}
      {particles}

      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-transparent rounded-br-full" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-amber-200/20 to-transparent rounded-tl-full" />

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
            duration: 1.1, // slower
            ease: "easeOut" 
          }}
          className="mb-8 relative"
        >
          {/* Golden yellow sparkle effect */}
          <motion.div
            className="absolute -top-4 -right-4"
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ 
              opacity: startAnimation ? [0, 1, 0.8, 1, 0] : 0,
              rotate: startAnimation ? [0, 180, 360] : 0,
              scale: startAnimation ? [0.8, 1.3, 1, 1.2, 0.8] : 0.8
            }}
            transition={{ 
              duration: 4, // slower sparkle
              repeat: Infinity,
              repeatDelay: 0.8,
              ease: "easeInOut"
            }}
          >
            <Sparkles className="text-amber-400 w-8 h-8 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
          </motion.div>
          
          {/* Secondary sparkle for extra magic */}
          <motion.div
            className="absolute -bottom-2 -left-3"
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ 
              opacity: startAnimation ? [0, 0.7, 0] : 0,
              rotate: startAnimation ? [0, -45] : 0,
              scale: startAnimation ? [0.5, 1, 0.5] : 0.5
            }}
            transition={{ 
              duration: 3.5, // slower
              repeat: Infinity,
              repeatDelay: 1.8,
              delay: 0.7
            }}
          >
            <Sparkles className="text-amber-300 w-5 h-5 drop-shadow-[0_0_6px_rgba(252,211,77,0.5)]" />
          </motion.div>
        </motion.div>

        {/* Title with enhanced staggered animation */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: startAnimation ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-2 tracking-tight relative">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: startAnimation ? 1 : 0, 
                y: startAnimation ? 0 : 20 
              }}
              transition={{ duration: 1.0, delay: 0.6 }}
              className="inline-block bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent drop-shadow-sm"
              style={{
                filter: "drop-shadow(0 2px 4px rgba(59, 130, 246, 0.1))"
              }}
            >
              CALUU+
            </motion.span>
          </h1>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: startAnimation ? 1 : 0 }}
              transition={{ duration: 0.8, delay: 0.8, type: "spring" }}
            >
              <GraduationCap className="text-blue-600 w-5 h-5" />
            </motion.div>
            <motion.p 
              className="text-lg md:text-xl text-gray-600 font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: startAnimation ? 1 : 0, 
                y: startAnimation ? 0 : 20 
              }}
              transition={{ duration: 0.9, delay: 1.0 }}
            >
              your academic Best friend
            </motion.p>
          </div>
        </motion.div>

        {/* Enhanced loading indicator */}
        <motion.div 
          className="mt-6 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: startAnimation ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto shadow-inner">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-amber-400 relative"
              initial={{ width: "0%" }}
              animate={{ width: startAnimation ? "100%" : "0%" }}
              transition={{ 
                duration: 3.8, // slower fill
                delay: 1.0, 
                ease: "easeInOut" 
              }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ["-100%", "200%"]
                }}
                transition={{
                  duration: 2.2, // slower shimmer
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </motion.div>
          </div>
          
          <motion.p
            className="text-center mt-3 text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: startAnimation ? [0, 1, 0.7] : 0 }}
            transition={{ duration: 1.2, delay: 1.6 }}
          >
            Preparing your learning experience...
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default SplashScreen;