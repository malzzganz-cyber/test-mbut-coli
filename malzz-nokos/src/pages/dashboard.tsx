import React, { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { ShoppingCart, Wallet, Clock, Trophy, Settings, Headset } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Dashboard() {
  const { user, userProfile, refreshProfile } = useAuth();
  
  useEffect(() => {
    refreshProfile();
  }, []);

  const balance = userProfile?.balance || 0;
  const isAdmin = user?.uid === import.meta.env.VITE_ADMIN_UID;

  const actions = [
    { label: "Order Number", icon: ShoppingCart, href: "/order", color: "bg-primary" },
    { label: "Deposit", icon: Wallet, href: "/deposit", color: "bg-green-300" },
    { label: "History", icon: Clock, href: "/history", color: "bg-accent" },
    { label: "Leaderboard", icon: Trophy, href: "/leaderboard", color: "bg-secondary" },
    { label: "Profile", icon: Settings, href: "/profile", color: "bg-white" },
    { label: "Support", icon: Headset, href: "/support", color: "bg-white" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-background pb-32">
      <div className="max-w-[420px] mx-auto p-4 pt-8 flex flex-col gap-8">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-[3px] border-black">
              <AvatarImage src={userProfile?.photoURL} />
              <AvatarFallback className="font-bold bg-accent text-black">
                {userProfile?.displayName?.substring(0, 2).toUpperCase() || "US"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-lg leading-none">{userProfile?.displayName || "User"}</p>
              <p className="text-sm font-medium text-gray-600">ID: {user?.uid.substring(0, 8)}</p>
            </div>
          </div>
          {isAdmin && (
            <Link href="/admin/balance" className="brutal-btn bg-black text-white px-3 py-1 text-xs">Admin</Link>
          )}
        </div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="brutal-card bg-black text-white p-6 flex flex-col gap-2">
          <p className="font-medium text-gray-300 uppercase tracking-widest text-sm">Your Balance</p>
          <h2 className="text-4xl font-black">Rp {balance.toLocaleString("id-ID")}</h2>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          {actions.map((action, i) => (
            <Link key={action.href} href={action.href}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.05 }} className={`brutal-card p-4 flex flex-col items-center justify-center gap-3 ${action.color} cursor-pointer`}>
                <action.icon className="w-8 h-8" />
                <p className="font-bold text-sm">{action.label}</p>
              </motion.div>
            </Link>
          ))}
        </div>

      </div>
    </motion.div>
  );
}
