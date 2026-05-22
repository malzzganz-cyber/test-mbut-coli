import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useGetPlatformStats } from "@workspace/api-client-react";
import { getReviews } from "@/lib/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Landing() {
  const { data: statsData } = useGetPlatformStats();
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    getReviews(6).then(setReviews);
  }, []);

  const stats = {
    totalUsers: statsData?.totalUsers ?? 0,
    totalOrders: statsData?.totalOrders ?? 0,
    totalDeposits: statsData?.totalDeposits ?? 0,
    totalSuccessOrders: statsData?.totalSuccessOrders ?? 0,
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-background pb-32">
      <div className="max-w-[420px] mx-auto px-4 pt-12 flex flex-col gap-12">
        {/* Hero */}
        <section className="flex flex-col gap-6 text-center mt-8">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <h1 className="text-5xl font-extrabold tracking-tight">Malzz Nokos 🚀</h1>
            <p className="text-lg mt-4 text-gray-700 font-medium">
              Premium virtual numbers for fast, reliable OTPs. Built for serious developers and hustlers.
            </p>
          </motion.div>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex gap-4 justify-center mt-2">
            <Link href="/login" className="brutal-btn bg-primary text-black px-8 py-3 text-lg">
              Get Started
            </Link>
            <Link href="/dashboard" className="brutal-btn bg-white text-black px-8 py-3 text-lg">
              Dashboard
            </Link>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-4">
          {[
            { label: "Active Users", value: stats.totalUsers || "500+" },
            { label: "Orders Done", value: stats.totalSuccessOrders || "10k+" },
            { label: "Total Deposits", value: stats.totalDeposits || "2k+" },
            { label: "Numbers Sold", value: stats.totalOrders || "12k+" },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }} className="brutal-card p-4 bg-accent text-center">
              <h3 className="text-3xl font-black">{stat.value}</h3>
              <p className="text-sm font-bold uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </section>

        {/* Features */}
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold border-b-4 border-black pb-2 inline-block self-start">Features</h2>
          <div className="flex flex-col gap-4">
            <div className="brutal-card p-5 bg-white">
              <h3 className="text-xl font-bold mb-2">⚡ Realtime OTP</h3>
              <p className="font-medium text-gray-700">No waiting. Watch your codes arrive instantly with our direct API bridge.</p>
            </div>
            <div className="brutal-card p-5 bg-secondary">
              <h3 className="text-xl font-bold mb-2">💸 Auto-Deposit QRIS</h3>
              <p className="font-medium text-black">Top up seamlessly using any Indonesian e-wallet or banking app.</p>
            </div>
            <div className="brutal-card p-5 bg-green-300">
              <h3 className="text-xl font-bold mb-2">🌍 Global Providers</h3>
              <p className="font-medium text-black">Access numbers from over 100 countries across 500+ services.</p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        {reviews.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold border-b-4 border-black pb-2 inline-block self-start">Wall of Love</h2>
            <div className="flex flex-col gap-4">
              {reviews.map((r, i) => (
                <motion.div key={r.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }} className="brutal-card p-4 bg-white flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-black">
                      <AvatarImage src={r.photoURL} />
                      <AvatarFallback className="font-bold bg-accent">{r.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold">{r.displayName}</p>
                      <div className="flex text-yellow-400 text-sm">
                        {Array.from({ length: r.rating }).map((_, j) => <span key={j}>★</span>)}
                      </div>
                    </div>
                  </div>
                  <p className="font-medium">"{r.comment}"</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
}
