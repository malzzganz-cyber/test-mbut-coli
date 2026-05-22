import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGetMarkup } from "@workspace/api-client-react";
import { AdminOnly } from "@/components/AdminOnly";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import toast from "react-hot-toast";

export default function AdminMarkup() {
  const { user } = useAuth();
  const { data, refetch } = useGetMarkup();
  const [markup, setMarkup] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data?.markup !== undefined) {
      setMarkup(data.markup.toString());
    }
  }, [data]);

  const handleUpdate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/markup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markup: parseInt(markup), admin_uid: user.uid })
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Markup updated successfully");
        refetch();
      } else {
        toast.error("Failed to update markup");
      }
    } catch (error) {
      toast.error("Error updating markup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminOnly>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-background pb-32">
        <div className="max-w-[420px] mx-auto p-4 pt-8 flex flex-col gap-6">
          <h1 className="text-3xl font-black border-b-4 border-black pb-2 inline-block self-start">Markup</h1>
          
          <div className="brutal-card bg-white p-6 flex flex-col gap-4">
            <label className="font-bold text-lg">Global Markup (Rp)</label>
            <Input 
              type="number" 
              value={markup} 
              onChange={(e) => setMarkup(e.target.value)} 
              className="border-4 border-black rounded-xl h-16 font-black text-2xl text-center"
            />
            <Button onClick={handleUpdate} disabled={loading} className="brutal-btn bg-primary text-black h-14 text-xl">
              {loading ? "Updating..." : "Save Markup"}
            </Button>
          </div>
        </div>
      </motion.div>
    </AdminOnly>
  );
}
