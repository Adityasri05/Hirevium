"use client";

import { API_BASE_URL } from "@/utils/api";


import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2, Sparkles } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (localStorage.getItem("hireiq_token")) {
      router.push("/dashboard");
    }
  }, [router]);




  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (!response.ok) {
        const errDetail = await response.json();
        throw new Error(errDetail.detail || "Invalid email or password.");
      }

      const data = await response.json();
      
      // Store token
      localStorage.setItem("hireiq_token", data.access_token);
      localStorage.setItem("hireiq_user", JSON.stringify(data.user));

      router.push("/dashboard");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Login failed. Please check your credentials and ensure the backend server is running.";
      setError(errorMsg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-[#7C3AED] selection:text-white">
      {/* Background Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7C3AED] blur-[150px] rounded-full"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass rounded-2xl p-8 border border-[rgba(255,255,255,0.05)] relative z-10 space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#A855F7] flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)]">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome to HIREIQ</h2>
          <p className="text-sm text-gray-400">Log in to continue your AI interview journey</p>
        </div>

        {error && (
          <div className="p-3 bg-[rgba(239,68,68,0.1)] border border-[#EF4444]/30 rounded-lg text-sm text-[#EF4444] text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-semibold ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@developer.com"
                required
                className="w-full bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs text-gray-400 font-semibold">Password</label>
              <a href="#" className="text-xs text-[#A855F7] hover:underline">Forgot password?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] disabled:opacity-50 text-white font-medium rounded-xl transition-all shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Log In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>



        <div className="text-center text-sm text-gray-400 pt-2 border-t border-[rgba(255,255,255,0.05)]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#A855F7] hover:underline font-semibold">
            Sign up
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
