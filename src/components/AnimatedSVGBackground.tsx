import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface Achievement {
  id: string;
  title: string;
  category: string;
  color: string;
  icon: string;
}

const achievements: Achievement[] = [
  { id: "1", title: "First Class", category: "Academic", color: "#4ade80", icon: "🎓" },
  { id: "2", title: "Merit", category: "Academic", color: "#a78bfa", icon: "⭐" },
  { id: "3", title: "Found", category: "Innovation", color: "#facc15", icon: "💡" },
  { id: "4", title: "Coding", category: "Skills", color: "#f472b6", icon: "💻" },
  { id: "5", title: "Graphic Design", category: "Creative", color: "#fb923c", icon: "🎨" },
  { id: "6", title: "Digital Marketing", category: "Business", color: "#22d3ee", icon: "📱" },
  { id: "7", title: "Exhibitions", category: "Events", color: "#f87171", icon: "🎪" },
  { id: "8", title: "Upper Second", category: "Academic", color: "#60a5fa", icon: "🏆" }
];

const AnimatedSVGBackground = () => {
  const [activeAchievements, setActiveAchievements] = useState<Achievement[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        // Randomly select 4-6 achievements
        const shuffled = [...achievements].sort(() => 0.5 - Math.random());
        setActiveAchievements(shuffled.slice(0, Math.floor(Math.random() * 3) + 4));
        setIsVisible(true);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-caluu-blue-dark/90 to-caluu-blue-dark/70" />
      
      {/* SVG Pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Animated Achievements */}
      <AnimatePresence>
        {isVisible && activeAchievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            className="absolute"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              x: `${(index % 3) * 33 + 16}%`,
              z: `${Math.floor(index / 3) * 33 + 16}%`
            }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.1,
              ease: "easeOut"
            }}
          >
            <div className="relative group">
              {/* Achievement Card */}
              <div 
                className="w-32 h-32 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 flex flex-col items-center justify-center"
                style={{ boxShadow: `0 0 20px ${achievement.color}40` }}
              >
                <span className="text-4xl mb-2">{achievement.icon}</span>
                <span className="text-white/90 text-sm font-medium text-center">
                  {achievement.title}
                </span>
                <span className="text-white/50 text-xs mt-1">
                  {achievement.category}
                </span>
              </div>

              {/* Glow Effect */}
              <div 
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ 
                  background: `radial-gradient(circle at center, ${achievement.color}20 0%, transparent 70%)`,
                  filter: 'blur(10px)'
                }}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Floating Particles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: `radial-gradient(circle at center, ${achievements[i % achievements.length].color} 0%, transparent 70%)`,
            filter: 'blur(2px)'
          }}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: 0
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedSVGBackground; 