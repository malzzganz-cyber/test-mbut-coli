import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { getTransactions } from "@/lib/firestore";
import { ArrowDownLeft, ArrowUpRight, Clock } from "lucide-react";
import { format } from "date-fns";

export default function History() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getTransactions(user.uid, 50).then((data) => {
        setTransactions(data);
        setLoading(false);
      });
    }
  }, [user]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-background pb-32">
      <div className="max-w-[420px] mx-auto p-4 pt-8 flex flex-col gap-6">
        <h1 className="text-3xl font-black border-b-4 border-black pb-2 inline-block self-start">History</h1>

        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="brutal-card bg-white p-8 flex flex-col items-center text-center gap-2">
            <Clock className="w-12 h-12 text-gray-400 mb-2" />
            <h3 className="font-bold text-lg">No transactions yet</h3>
            <p className="text-sm text-gray-500 font-medium">Your activity will show up here</p>
          </div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-4">
            {transactions.map((tx) => (
              <motion.div key={tx.id} variants={item} className="brutal-card bg-white p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full border-2 border-black flex items-center justify-center shrink-0 ${tx.amount > 0 ? "bg-green-300" : "bg-destructive text-white"}`}>
                  {tx.amount > 0 ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{tx.description}</p>
                  <p className="text-xs font-medium text-gray-500">{format(new Date(tx.createdAt), "dd MMM yyyy, HH:mm")}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-black ${tx.amount > 0 ? "text-green-600" : "text-black"}`}>
                    {tx.amount > 0 ? "+" : ""}Rp {Math.abs(tx.amount).toLocaleString("id-ID")}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
