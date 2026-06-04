"use client";

import { API_BASE_URL } from "@/utils/api";
import { auth } from "@/utils/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2, Sparkles } from "lucide-react";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (localStorage.getItem("hireiq_token")) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          name: user.displayName || user.email?.split("@")[0] || "Google User",
          photo_url: user.photoURL,
        }),
      });

      if (!response.ok) {
        const errDetail = await response.json();
        throw new Error(errDetail.detail || "Failed to sign up with Google.");
      }

      const data = await response.json();
      
      localStorage.setItem("hireiq_token", data.access_token);
      localStorage.setItem("hireiq_user", JSON.stringify(data.user));

      if (data.user && (!data.user.target_role || !data.user.experience_level)) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Google sign in failed. Please try again.";
      if (errorMsg.includes("auth/popup-closed-by-user")) {
        setIsLoading(false);
        return;
      }
      setError(errorMsg);
      setIsLoading(false);
    }
  };


  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
          role: "candidate",
        }),
      });

      if (!response.ok) {
        const errDetail = await response.json();
        throw new Error(errDetail.detail || "Registration failed. Try a different email.");
      }

      // Automatically log in on signup success
      const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (!loginResponse.ok) {
        throw new Error("Registration complete, but login failed.");
      }

      const data = await loginResponse.json();
      
      // Store token
      localStorage.setItem("hireiq_token", data.access_token);
      localStorage.setItem("hireiq_user", JSON.stringify(data.user));

      router.push("/onboarding");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Signup failed. Please ensure the backend server is running.";
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
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Create Account</h2>
          <p className="text-sm text-gray-400">Sign up to benchmark your skills using AI</p>
        </div>

        {error && (
          <div className="p-3 bg-[rgba(239,68,68,0.1)] border border-[#EF4444]/30 rounded-lg text-sm text-[#EF4444] text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-semibold ml-1">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Developer"
                required
                className="w-full bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
              />
            </div>
          </div>

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
            <label className="text-xs text-gray-400 font-semibold ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
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
                <span>Sign Up</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center space-x-3 my-2">
          <div className="h-[1px] bg-white/10 flex-1"></div>
          <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Or continue with</span>
          <div className="h-[1px] bg-white/10 flex-1"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          type="button"
          className="w-full py-3 bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] text-white font-medium rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.107C18.29 1.845 15.538 1 12.24 1 5.926 1 12.24s4.926 11.24 11.24 11.24c6.59 0 11-4.627 11-11.196 0-.752-.08-1.326-.18-1.887H12.24z"
            />
          </svg>
          <span>Sign up with Google</span>
        </button>

        <div className="text-center text-sm text-gray-400 pt-2 border-t border-[rgba(255,255,255,0.05)]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#A855F7] hover:underline font-semibold">
            Log in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
