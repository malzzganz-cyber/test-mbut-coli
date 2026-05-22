import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getLeaderboard } from "@/lib/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard().then((data) => {
      setLeaders(data);
      setLoading(false);
    });
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  const getRankColor = (index: number) => {
    if (index === 0) return "bg-yellow-400";
    if (index === 1) return "bg-gray-300";
    if (index === 2) return "bg-amber-600";
    return "bg-white";
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-background pb-32">
      <div className="max-w-[420px] mx-auto p-4 pt-8 flex flex-col gap-6">
        <h1 className="text-3xl font-black border-b-4 border-black pb-2 inline-block self-start">Leaderboard</h1>

        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-4">
            {leaders.map((leader, i) => (
              <motion.div key={leader.id} variants={item} className={`brutal-card ${getRankColor(i)} p-4 flex items-center gap-4 relative overflow-hidden`}>
                <div className="w-8 h-8 rounded-full bg-black text-white font-black flex items-center justify-center shrink-0">
                  {i + 1}
                </div>
                <Avatar className="w-12 h-12 border-2 border-black shrink-0 bg-white">
                  <AvatarImage src={leader.photoURL} />
                  <AvatarFallback className="font-bold text-black bg-white">{leader.displayName?.substring(0, 2).toUpperCase() || "US"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate text-lg">{leader.displayName}</p>
                  <p className="text-sm font-medium text-black/70">{leader.totalOrders || 0} Orders</p>
                </div>
                {i < 3 && <Trophy className="absolute -right-4 -bottom-4 w-20 h-20 text-black/10" />}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
