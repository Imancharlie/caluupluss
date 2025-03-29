import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Eye } from "lucide-react";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

const UsageStats = () => {
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalPageViews: 0
  });

  useEffect(() => {
    const metricsRef = ref(db, "analytics/metrics");
    const unsubscribe = onValue(metricsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStats({
          totalSessions: data.totalSessions || 0,
          totalPageViews: data.totalPageViews || 0
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Use the larger number between sessions and page views
  const displayCount = Math.max(stats.totalSessions, stats.totalPageViews);

  return (
    <motion.div 
      className="mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
    >
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-caluu-blue" />
          <Eye className="w-5 h-5 text-caluu-blue" />
        </div>
        <div>
          <div className="text-sm text-white/60">App Visits</div>
          <div className="text-xl font-semibold text-white">{displayCount}</div>
        </div>
      </div>
    </motion.div>
  );
};

export default UsageStats; 