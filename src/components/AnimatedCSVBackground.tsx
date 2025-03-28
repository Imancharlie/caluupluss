import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface CSVRow {
  id: string;
  name: string;
  gpa: string;
  semester: string;
  status: string;
  category: string;
}

const generateRandomData = (): CSVRow[] => {
  const names = ["Samia", "Mo", "Heslb", "John", "Sarah", "Michael", "Emma", "David", "Lisa", "James", "Anna"];
  const statuses = [
    { text: "First Class", color: "text-green-400" },
    { text: "Upper Second", color: "text-blue-400" },
    { text: "Merit", color: "text-purple-400" },
    { text: "Found", color: "text-yellow-400" },
    { text: "Coding", color: "text-pink-400" },
    { text: "Graphic Design", color: "text-orange-400" },
    { text: "Digital Marketing", color: "text-cyan-400" },
    { text: "Exhibitions", color: "text-red-400" }
  ];
  
  return Array.from({ length: 8 }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    return {
      id: (i + 1).toString(),
      name: names[Math.floor(Math.random() * names.length)],
      gpa: (Math.random() * 2 + 1.5).toFixed(2),
      semester: (Math.floor(Math.random() * 8) + 1).toString(),
      status: status.text,
      category: status.color
    };
  });
};

const AnimatedCSVBackground = () => {
  const [data, setData] = useState<CSVRow[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setData(generateRandomData());
        setIsVisible(true);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-caluu-blue-dark/90 to-caluu-blue-dark/70" />
      
      {/* CSV Header */}
      <motion.div 
        className="absolute top-4 left-4 text-white/30 font-mono text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex gap-8">
          <span>ID</span>
          <span>NAME</span>
          <span>GPA</span>
          <span>SEM</span>
          <span>STATUS</span>
        </div>
      </motion.div>

      {/* Animated Data Rows */}
      <AnimatePresence>
        {isVisible && data.map((row, index) => (
          <motion.div
            key={row.id}
            className="absolute left-4 text-white/20 font-mono text-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.1,
              ease: "easeOut"
            }}
            style={{ top: `${(index + 1) * 40}px` }}
          >
            <div className="flex gap-8">
              <span>{row.id}</span>
              <span>{row.name}</span>
              <span>{row.gpa}</span>
              <span>{row.semester}</span>
              <span className={row.category}>
                {row.status}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Decorative Elements */}
      <div className="absolute inset-0">
        {/* Grid Lines */}
        <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-4 opacity-10">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="border border-white/10 rounded-lg" />
          ))}
        </div>

        {/* Border Glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />

        {/* Animated Particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
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
    </div>
  );
};

export default AnimatedCSVBackground; 