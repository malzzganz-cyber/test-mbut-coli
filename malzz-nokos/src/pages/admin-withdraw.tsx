import React, { useState } from "react";
import { motion } from "framer-motion";
import { AdminOnly } from "@/components/AdminOnly";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListRekening } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import toast from "react-hot-toast";

export default function AdminWithdraw() {
  const { user } = useAuth();
  const { data: banksData } = useListRekening();
  const [bank, setBank] = useState("");
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkedName, setCheckedName] = useState("");

  const handleCheck = async () => {
    if (!bank || !account) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/withdraw/check?bank_code=${bank}&account_number=${account}`);
      const data = await res.json();
      if (data.success) {
        setCheckedName(data.account_name);
        toast.success("Account verified!");
      } else {
        toast.error("Account not found");
        setCheckedName("");
      }
    } catch (err) {
      toast.error("Error checking account");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!bank || !account || !amount || !checkedName) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/withdraw/create?target=${account}&id=${bank}&user_uid=${user?.uid}&amount=${amount}`);
      const data = await res.json();
      if (data.success) {
        toast.success("Withdrawal created successfully!");
        setBank("");
        setAccount("");
        setAmount("");
        setCheckedName("");
      } else {
        toast.error(data.error || "Withdrawal failed");
      }
    } catch (err) {
      toast.error("Error processing withdrawal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminOnly>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-background pb-32">
        <div className="max-w-[420px] mx-auto p-4 pt-8 flex flex-col gap-6">
          <h1 className="text-3xl font-black border-b-4 border-black pb-2 inline-block self-start">Withdraw</h1>
          
          <div className="brutal-card bg-white p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-bold">Bank</label>
              <Select onValueChange={setBank} value={bank}>
                <SelectTrigger className="h-14 border-4 border-black rounded-xl font-bold bg-white text-lg">
                  <SelectValue placeholder="Select Bank" />
                </SelectTrigger>
                <SelectContent className="border-4 border-black rounded-xl">
                  {banksData?.data?.map((b: any) => (
                    <SelectItem key={b.id} value={b.id} className="font-bold">{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold">Account Number</label>
              <Input 
                type="text" 
                value={account} 
                onChange={(e) => setAccount(e.target.value)} 
                className="border-4 border-black rounded-xl h-14 font-black text-xl"
              />
            </div>

            <Button onClick={handleCheck} disabled={loading || !bank || !account} className="brutal-btn bg-accent text-black h-12 mt-2">
              Check Account
            </Button>

            {checkedName && (
              <div className="p-3 bg-green-100 border-2 border-black rounded-xl text-black font-bold text-center mt-2">
                Verified: {checkedName}
              </div>
            )}

            <div className="flex flex-col gap-2 mt-4">
              <label className="font-bold">Amount (Rp)</label>
              <Input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                className="border-4 border-black rounded-xl h-14 font-black text-xl"
              />
            </div>

            <Button onClick={handleWithdraw} disabled={loading || !checkedName || !amount} className="brutal-btn bg-secondary text-black h-14 text-xl mt-2">
              {loading ? "Processing..." : "Withdraw"}
            </Button>
          </div>
        </div>
      </motion.div>
    </AdminOnly>
  );
}
