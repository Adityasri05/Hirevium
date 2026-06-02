"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Upload, 
  FileSearch, 
  ShieldCheck, 
  BrainCircuit, 
  Activity, 
  Target,
  PlayCircle,
  Sparkles,
  LogOut
} from "lucide-react";

const PIPELINE_STEPS = [
  { id: 1, title: "Resume Upload", icon: Upload },
  { id: 2, title: "JD Analysis", icon: FileSearch },
  { id: 3, title: "Skill Verification", icon: ShieldCheck },
  { id: 4, title: "Adaptive Interview", icon: BrainCircuit },
  { id: 5, title: "Pressure Analysis", icon: Activity },
  { id: 6, title: "Hiring Readiness Score", icon: Target },
];

export default function LandingPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("hireiq_token");
    }
    return false;
  });
  const [userName, setUserName] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("hireiq_user");
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          if (userObj.name) {
            return userObj.name.split(" ")[0];
          }
        } catch {}
      }
    }
    return null;
  });

  const handleStart = () => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/onboarding");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("hireiq_token");
    localStorage.removeItem("hireiq_user");
    setIsAuthenticated(false);
    setUserName(null);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white overflow-hidden selection:bg-[#7C3AED] selection:text-white flex flex-col justify-between">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#7C3AED] blur-[120px] rounded-full"></div>
      </div>

      {/* Premium Sticky Navigation Header */}
      <header className="fixed top-0 left-0 w-full h-20 border-b border-[rgba(255,255,255,0.05)] bg-[#09090B]/60 backdrop-blur-lg z-50 flex items-center px-6 md:px-12 justify-between">
        <Link href="/" className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#7C3AED] to-[#A855F7] flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.4)]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tighter text-gradient-primary">HIREIQ</span>
        </Link>

        <nav className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400 hidden sm:inline">Signed in as <strong className="text-white">{userName}</strong></span>
              <Link 
                href="/dashboard"
                className="px-4 py-2 bg-[rgba(124,58,237,0.1)] hover:bg-[rgba(124,58,237,0.2)] border border-[rgba(124,58,237,0.2)] rounded-lg text-sm text-[#A855F7] font-semibold transition-all"
              >
                Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-[#EF4444] transition-colors rounded-lg"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link 
                href="/login"
                className="px-4 py-2 hover:bg-[rgba(255,255,255,0.05)] rounded-lg text-sm text-gray-300 hover:text-white transition-all"
              >
                Log In
              </Link>
              <Link 
                href="/signup"
                className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg text-sm text-white font-medium transition-all shadow-[0_0_15px_rgba(124,58,237,0.2)] hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* Main Landing View */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-36 pb-24 flex-1">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-6 border-[rgba(124,58,237,0.3)]">
              <span className="w-2 h-2 rounded-full bg-[#A855F7] animate-pulse"></span>
              <span className="text-sm text-gray-300">HireIQ Engine v2.0 is Live</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
              Ace Every Interview with <br />
              <span className="text-gradient-primary">HIREIQ</span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto"
          >
            AI-powered hiring intelligence that analyzes resumes, understands job descriptions, conducts adaptive interviews, verifies skills, evaluates performance, and predicts hiring readiness.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button 
              onClick={handleStart}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] flex items-center justify-center space-x-2 group"
            >
              <span>{isAuthenticated ? "Go to Dashboard" : "Start AI Interview"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="w-full sm:w-auto px-8 py-4 glass hover:bg-[rgba(255,255,255,0.05)] rounded-xl font-medium transition-all flex items-center justify-center space-x-2">
              <PlayCircle className="w-5 h-5 text-gray-400" />
              <span>Watch Demo</span>
            </button>
          </motion.div>
        </div>

        {/* Hero Visualization Pipeline */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-24 mb-32 relative"
        >
          <div className="absolute top-1/2 left-0 w-full h-1 bg-[rgba(255,255,255,0.05)] -translate-y-1/2 rounded-full hidden md:block"></div>
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6 relative">
            {PIPELINE_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="relative flex flex-col items-center">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1 + index * 0.15, type: "spring" }}
                    className="w-16 h-16 rounded-2xl glass-glow bg-[#111827] border border-[rgba(124,58,237,0.3)] flex items-center justify-center relative z-10 mb-4"
                  >
                    <Icon className={`w-7 h-7 ${index === 5 ? 'text-[#22C55E]' : 'text-[#A855F7]'}`} />
                  </motion.div>
                  <p className="text-center text-sm font-medium text-gray-300 max-w-[100px]">
                    {step.title}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Social Proof */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 py-16 border-y border-[rgba(255,255,255,0.05)]"
        >
          <div className="text-center space-y-2">
            <h3 className="text-4xl md:text-5xl font-bold text-white">10,000+</h3>
            <p className="text-gray-400 font-medium">Interviews Completed</p>
          </div>
          <div className="text-center space-y-2 border-y md:border-y-0 md:border-x border-[rgba(255,255,255,0.05)] py-8 md:py-0">
            <h3 className="text-4xl md:text-5xl font-bold text-white">50,000+</h3>
            <p className="text-gray-400 font-medium">Questions Evaluated</p>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-4xl md:text-5xl font-bold text-[#22C55E]">95%</h3>
            <p className="text-gray-400 font-medium">Candidate Satisfaction</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
