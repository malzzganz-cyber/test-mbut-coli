import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { getUserProfile } from "@/lib/firestore";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back!");
      setLocation("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const profile = await getUserProfile(res.user.uid);
      if (!profile) {
        await setDoc(doc(db, "users", res.user.uid), {
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName || "User",
          photoURL: res.user.photoURL,
          balance: 0,
          totalOrders: 0,
          createdAt: new Date().toISOString()
        });
      }
      toast.success("Welcome!");
      setLocation("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[420px] brutal-card bg-white p-8 flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-black mb-2">Login</h1>
          <p className="font-medium text-gray-600">Enter your cockpit</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
          <Button type="submit" disabled={loading} className="brutal-btn bg-primary text-black h-12 text-lg mt-2">
            {loading ? "Loading..." : "Login"}
          </Button>
        </form>

        <div className="relative border-b-2 border-black my-2">
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 font-bold text-sm">OR</span>
        </div>

        <Button onClick={handleGoogleLogin} disabled={loading} variant="outline" className="brutal-btn border-2 bg-accent text-black h-12 text-lg">
          Google
        </Button>

        <p className="text-center font-medium mt-4">
          New here? <Link href="/register" className="font-bold border-b-2 border-black">Create account</Link>
        </p>
      </div>
    </motion.div>
  );
}
