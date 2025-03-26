
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, GraduationCap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const SplashScreen = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    // Don't proceed with navigation until auth check is complete
    if (loading) return;

    // Trigger animation after a short delay
    const animationTimeout = setTimeout(() => {
      setStartAnimation(true);
    }, 500);

    // Navigate to appropriate page after splash screen
    const navigationTimeout = setTimeout(() => {
      if (user) {
        navigate("/selection");
      } else {
        navigate("/login");
      }
    }, 4000);

    return () => {
      clearTimeout(animationTimeout);
      clearTimeout(navigationTimeout);
    };
  }, [navigate, user, loading]);

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
          <img 
            src="/lovable-uploads/1d1159cc-5ad8-47f9-a69b-b6624cac259b.png" 
            alt="CALUU Logo" 
            className="w-32 h-32 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          />
          
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
              your academic journey simplified
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
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SplashScreen;
