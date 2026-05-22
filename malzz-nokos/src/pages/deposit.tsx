import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useCreateDeposit, useGetDepositStatus, getGetDepositStatusQueryKey } from "@workspace/api-client-react";
import { createDepositDoc, updateDepositStatus, updateUserBalance, createTransaction } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import QRCode from "qrcode";
import { motion } from "framer-motion";
import { RefreshCw, Copy } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Deposit() {
  const { user, userProfile, refreshProfile } = useAuth();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [activeDeposit, setActiveDeposit] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const depositStatusParams = { deposit_id: activeDeposit?.deposit_id || "", user_uid: user?.uid || "" };
  const { data: depositStatus } = useGetDepositStatus(
    depositStatusParams,
    { query: { enabled: !!activeDeposit && activeDeposit.status !== "success", refetchInterval: 15000, queryKey: getGetDepositStatusQueryKey(depositStatusParams) } }
  );

  useEffect(() => {
    if (activeDeposit && depositStatus?.success && depositStatus.status === "paid" && activeDeposit.status !== "success") {
      handleDepositSuccess();
    }
  }, [depositStatus]);

  useEffect(() => {
    if (activeDeposit?.qr_string) {
      QRCode.toDataURL(activeDeposit.qr_string, { width: 280, margin: 2 }).then(setQrDataUrl);
    }
  }, [activeDeposit]);

  const handleDepositSuccess = async () => {
    try {
      await updateDepositStatus(activeDeposit.deposit_id, "success");
      await updateUserBalance(user!.uid, (userProfile?.balance || 0) + activeDeposit.amount);
      await createTransaction(user!.uid, { type: "deposit", amount: activeDeposit.amount, description: "Deposit QRIS" });
      await refreshProfile();
      setActiveDeposit({ ...activeDeposit, status: "success" });
      toast.success("Deposit successful!");
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateDeposit = async () => {
    const numAmount = parseInt(amount);
    if (!numAmount || numAmount < 1000) {
      toast.error("Minimum deposit is Rp 1.000");
      return;
    }
    setLoading(true);
    try {
      const url = `/api/deposit/create?amount=${numAmount}&user_uid=${user!.uid}`;
      const r = await fetch(url);
      const res = await r.json();

      if (res.success) {
        const depositData = {
          deposit_id: res.deposit_id,
          amount: res.amount,
          qr_string: res.qr_string,
          payment_name: res.payment_name,
          expired_at: res.expired_at,
          status: "pending"
        };
        await createDepositDoc(user!.uid, depositData);
        setActiveDeposit(depositData);
        toast.success("QRIS generated!");
      } else {
        toast.error(res.error || "Failed to create deposit");
      }
    } catch (e) {
      toast.error("Error creating deposit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-background pb-32">
      <div className="max-w-[420px] mx-auto p-4 pt-8 flex flex-col gap-6">
        <h1 className="text-3xl font-black border-b-4 border-black pb-2 inline-block self-start">Deposit</h1>
        
        {!activeDeposit ? (
          <div className="flex flex-col gap-4">
            <div className="brutal-card p-6 bg-white flex flex-col gap-4">
              <label className="font-bold text-lg">Amount (Rp)</label>
              <Input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="10000"
                className="border-4 border-black rounded-xl h-16 font-black text-2xl text-center"
              />
              <div className="grid grid-cols-3 gap-2">
                {[10000, 25000, 50000].map((val) => (
                  <Button key={val} variant="outline" className="border-2 border-black font-bold" onClick={() => setAmount(val.toString())}>
                    {val / 1000}k
                  </Button>
                ))}
              </div>
            </div>
            <Button onClick={handleCreateDeposit} disabled={loading} className="brutal-btn bg-green-300 text-black h-14 text-xl mt-2 w-full">
              {loading ? "Generating..." : "Create QRIS"}
            </Button>
          </div>
        ) : (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="brutal-card bg-white p-6 flex flex-col items-center gap-6">
            <div className="text-center">
              <h2 className="text-2xl font-black text-black mb-1">Scan to Pay</h2>
              <p className="font-bold text-gray-600">Rp {activeDeposit.amount.toLocaleString("id-ID")}</p>
            </div>

            {activeDeposit.status === "success" ? (
              <div className="flex flex-col items-center gap-4 text-green-600">
                <div className="w-24 h-24 rounded-full border-4 border-black bg-green-300 flex items-center justify-center">
                  <span className="text-4xl">✓</span>
                </div>
                <h3 className="text-2xl font-black">Payment Received!</h3>
                <Button onClick={() => setActiveDeposit(null)} className="brutal-btn bg-black text-white h-12 w-full">
                  New Deposit
                </Button>
              </div>
            ) : (
              <>
                <div className="border-4 border-black rounded-xl p-2 bg-white">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="QRIS" className="w-full max-w-[240px] rounded-lg" />
                  ) : (
                    <div className="w-[240px] h-[240px] flex items-center justify-center bg-gray-100">
                      <RefreshCw className="animate-spin w-8 h-8 text-black/50" />
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-center gap-2 w-full">
                  <div className="flex items-center gap-2 font-bold text-sm bg-accent px-4 py-2 rounded-full border-2 border-black">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Auto-checking status...
                  </div>
                  <Button variant="outline" className="w-full border-2 border-black font-bold mt-2" onClick={() => setActiveDeposit(null)}>
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
