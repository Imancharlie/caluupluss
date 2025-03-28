import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface FloatingElement {
  id: string;
  type: "circle" | "square" | "triangle";
  size: number;
  color: string;
  x: number;
  y: number;
  rotation: number;
}

const colors = [
  "#4ade80", // green
  "#a78bfa", // purple
  "#facc15", // yellow
  "#f472b6", // pink
  "#fb923c", // orange
  "#22d3ee", // cyan
  "#f87171", // red
  "#60a5fa", // blue
];

const AnimatedBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<FloatingElement[]>([]);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 200]);

  useEffect(() => {
    // Generate initial elements
    const initialElements = Array.from({ length: 20 }, (_, i) => ({
      id: `element-${i}`,
      type: ["circle", "square", "triangle"][Math.floor(Math.random() * 3)] as "circle" | "square" | "triangle",
      size: Math.random() * 100 + 50,
      color: colors[Math.floor(Math.random() * colors.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      rotation: Math.random() * 360,
    }));
    setElements(initialElements);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-caluu-blue-dark/90 to-caluu-blue-dark/70" />
      
      {/* Animated Elements */}
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute"
          style={{
            width: element.size,
            height: element.size,
            left: `${element.x}%`,
            top: `${element.y}%`,
            rotate: element.rotation,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [element.rotation, element.rotation + 10, element.rotation],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        >
          {element.type === "circle" && (
            <div
              className="absolute inset-0 rounded-full opacity-20 blur-xl"
              style={{ backgroundColor: element.color }}
            />
          )}
          {element.type === "square" && (
            <div
              className="absolute inset-0 rounded-lg opacity-20 blur-xl"
              style={{ backgroundColor: element.color }}
            />
          )}
          {element.type === "triangle" && (
            <div
              className="absolute inset-0 opacity-20 blur-xl"
              style={{
                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                backgroundColor: element.color,
              }}
            />
          )}
        </motion.div>
      ))}

      {/* Interactive Grid */}
      <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-12 gap-4 p-4 opacity-10">
        {Array.from({ length: 72 }).map((_, i) => (
          <motion.div
            key={i}
            className="border border-white/10 rounded-lg"
            animate={{
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Glowing Lines */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 1,
          }}
        />
      </div>

      {/* Floating Text Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {["First Class", "Merit", "Found", "Coding", "Design", "Marketing"].map((text, i) => (
          <motion.div
            key={text}
            className="absolute text-white/5 text-4xl md:text-6xl font-bold whitespace-nowrap"
            style={{
              left: `${(i * 20) % 100}%`,
              top: `${(i * 15) % 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{
              duration: 5 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          >
            {text}
          </motion.div>
        ))}
      </div>

      {/* Interactive Particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: `radial-gradient(circle at center, ${colors[i % colors.length]} 0%, transparent 70%)`,
            filter: 'blur(2px)',
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, 100, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground; 