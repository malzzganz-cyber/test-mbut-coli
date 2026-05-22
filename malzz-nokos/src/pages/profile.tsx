import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";
import { LogOut, Save } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Profile() {
  const { user, userProfile, signOut, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(userProfile?.displayName || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { displayName });
      await refreshProfile();
      toast.success("Profile updated");
    } catch (e) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-background pb-32">
      <div className="max-w-[420px] mx-auto p-4 pt-8 flex flex-col gap-6">
        <h1 className="text-3xl font-black border-b-4 border-black pb-2 inline-block self-start">Profile</h1>

        <div className="brutal-card bg-white p-6 flex flex-col items-center text-center gap-4">
          <Avatar className="w-24 h-24 border-[4px] border-black">
            <AvatarImage src={userProfile?.photoURL} />
            <AvatarFallback className="font-bold bg-accent text-3xl text-black">
              {userProfile?.displayName?.substring(0, 2).toUpperCase() || "US"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col gap-2 w-full mt-4">
            <label className="font-bold text-left text-sm text-gray-600">Email</label>
            <Input disabled value={user?.email || ""} className="border-2 border-black rounded-xl h-12 font-medium bg-gray-100" />
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="font-bold text-left text-sm text-gray-600">Username</label>
            <Input 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)}
              className="border-2 border-black rounded-xl h-12 font-bold" 
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="brutal-btn bg-primary text-black w-full h-12 mt-2">
            <Save className="mr-2 w-5 h-5" /> Save Changes
          </Button>
        </div>

        <Button onClick={signOut} variant="outline" className="brutal-btn border-2 border-black bg-white text-destructive hover:bg-destructive hover:text-white mt-4 h-12 w-full">
          <LogOut className="mr-2 w-5 h-5" /> Sign Out
        </Button>
      </div>
    </motion.div>
  );
}
