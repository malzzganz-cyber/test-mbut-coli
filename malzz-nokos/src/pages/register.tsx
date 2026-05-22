import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        email: res.user.email,
        displayName: displayName || email.split("@")[0],
        photoURL: null,
        balance: 0,
        totalOrders: 0,
        createdAt: new Date().toISOString()
      });
      toast.success("Account created!");
      setLocation("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[420px] brutal-card bg-white p-8 flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-black mb-2">Register</h1>
          <p className="font-medium text-gray-600">Join the elite</p>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-bold">Username</label>
            <Input 
              type="text" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)} 
              className="border-2 border-black rounded-xl h-12 font-medium"
              required 
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold">Email</label>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="border-2 border-black rounded-xl h-12 font-medium"
              required 
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold">Password</label>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="border-2 border-black rounded-xl h-12 font-medium"
              required 
            />
          </div>
          <Button type="submit" disabled={loading} className="brutal-btn bg-secondary text-black h-12 text-lg mt-2">
            {loading ? "Loading..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center font-medium mt-4">
          Already have an account? <Link href="/login" className="font-bold border-b-2 border-black">Login</Link>
        </p>
      </div>
    </motion.div>
  );
}
