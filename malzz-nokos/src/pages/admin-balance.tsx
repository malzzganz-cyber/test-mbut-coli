import React from "react";
import { motion } from "framer-motion";
import { useGetAdminBalance } from "@workspace/api-client-react";
import { AdminOnly } from "@/components/AdminOnly";

export default function AdminBalance() {
  const { data, isLoading } = useGetAdminBalance();

  return (
    <AdminOnly>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-background pb-32">
        <div className="max-w-[420px] mx-auto p-4 pt-8 flex flex-col gap-6">
          <h1 className="text-3xl font-black border-b-4 border-black pb-2 inline-block self-start">Admin Balance</h1>
          
          <div className="brutal-card bg-black text-white p-6 flex flex-col gap-2">
            <p className="font-medium text-gray-300 uppercase tracking-widest text-sm">RumahOTP Balance</p>
            {isLoading ? (
              <div className="h-10 bg-gray-800 rounded animate-pulse" />
            ) : (
              <h2 className="text-4xl font-black">Rp {(data?.balance || 0).toLocaleString("id-ID")}</h2>
            )}
          </div>
        </div>
      </motion.div>
    </AdminOnly>
  );
}
