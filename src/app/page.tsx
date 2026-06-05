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
import AuthDrawer from "@/components/layout/AuthDrawer";

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);
  const [authDrawerTab, setAuthDrawerTab] = useState<"signin" | "signup">("signin");

  const checkAuthStatus = () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("hirevium_token");
      const userStr = localStorage.getItem("hirevium_user");
      if (token && token !== "guest-token-12345") {
        setIsLoggedIn(true);
        if (userStr) {
          try {
            setUser(JSON.parse(userStr));
          } catch {
            setUser(null);
          }
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("hirevium_token");
    localStorage.removeItem("hirevium_user");
    // Re-initialize guest credentials so pages don't break
    localStorage.setItem("hirevium_token", "guest-token-12345");
    localStorage.setItem("hirevium_user", JSON.stringify({
      id: "guest-id",
      name: "Alex D.",
      email: "guest@hirevium.ai",
      role: "candidate",
      target_role: "Frontend Engineer",
      experience_level: "Fresher",
      career_goals: "Master frontend frameworks and build premium user interfaces."
    }));
    checkAuthStatus();
    router.refresh();
  };

  const openAuthDrawer = (tab: "signin" | "signup") => {
    setAuthDrawerTab(tab);
    setIsAuthDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-white overflow-hidden selection:bg-primary selection:text-white flex flex-col justify-between relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary blur-[120px] rounded-full"></div>
      </div>

      {/* Premium Sticky Navigation Header */}
      <header className="fixed top-0 left-0 w-full h-20 border-b border-border/65 bg-background/60 backdrop-blur-lg z-50 flex items-center px-6 md:px-12 justify-between">
        <Link href="/" className="flex items-center space-x-2.5">
          <img src="/logo.png" alt="Hirevium Logo" className="w-9 h-9 object-contain" />
          <span className="text-2xl font-bold tracking-tighter text-gradient-primary">HIREVIUM</span>
        </Link>

        <nav className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <div className="hidden md:flex items-center space-x-2 bg-white/5 border border-border px-3.5 py-1.5 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs text-gray-300 font-medium">Logged in as {user?.name || "User"}</span>
              </div>
              <Link 
                href="/dashboard"
                className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover rounded-lg text-sm text-white font-medium transition-all shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)] hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
              >
                Go to Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="p-2.5 bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-400 hover:text-red-300 rounded-lg text-sm transition-all cursor-pointer flex items-center justify-center"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => openAuthDrawer("signin")}
                className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthDrawer("signup")}
                className="px-4 py-2.5 bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover rounded-lg text-sm text-white font-semibold transition-all shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)] hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] cursor-pointer"
              >
                Sign Up
              </button>
            </>
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
            <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-6 border-primary/30">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="text-sm text-gray-300">Hirevium Engine v2.0 is Live</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
              Ace Every Interview with <br />
              <span className="text-gradient-primary">HIREVIUM</span>
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
            className="flex flex-col items-center justify-center space-y-4 pt-4"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <button 
                onClick={() => router.push("/dashboard")}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover text-white rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)] flex items-center justify-center space-x-2 group cursor-pointer"
              >
                <span>{isLoggedIn ? "Go to Dashboard" : "Explore as Guest"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <a 
                href="https://youtu.be/SJ4Q15f2BBY?si=hWcdxcIH48DJdyKV"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 glass hover:bg-white/5 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <PlayCircle className="w-5 h-5 text-gray-400" />
                <span>Video Demo</span>
              </a>
            </div>

            {!isLoggedIn && (
              <p className="text-xs text-gray-400">
                Running in Guest Mode.{" "}
                <button onClick={() => openAuthDrawer("signin")} className="text-secondary hover:text-secondary-hover hover:underline font-semibold cursor-pointer">Sign In</button>
                {" "}or{" "}
                <button onClick={() => openAuthDrawer("signup")} className="text-secondary hover:text-secondary-hover hover:underline font-semibold cursor-pointer">Sign Up</button>
                {" "}to save progress permanently.
              </p>
            )}
          </motion.div>
        </div>

        {/* Hero Visualization Pipeline */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-24 mb-32 relative"
        >
          <div className="absolute top-1/2 left-0 w-full h-1 bg-white/5 -translate-y-1/2 rounded-full hidden md:block"></div>
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6 relative">
            {PIPELINE_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="relative flex flex-col items-center">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1 + index * 0.15, type: "spring" }}
                    className="w-16 h-16 rounded-2xl glass-glow bg-card border border-primary/30 flex items-center justify-center relative z-10 mb-4"
                  >
                    <Icon className={`w-7 h-7 ${index === 5 ? 'text-[#22C55E]' : 'text-secondary'}`} />
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
          className="grid grid-cols-1 md:grid-cols-3 gap-8 py-16 border-y border-border/65"
        >
          <div className="text-center space-y-2">
            <h3 className="text-4xl md:text-5xl font-bold text-white">10,000+</h3>
            <p className="text-gray-400 font-medium">Interviews Completed</p>
          </div>
          <div className="text-center space-y-2 border-y md:border-y-0 md:border-x border-border/65 py-8 md:py-0">
            <h3 className="text-4xl md:text-5xl font-bold text-white">50,000+</h3>
            <p className="text-gray-400 font-medium">Questions Evaluated</p>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-4xl md:text-5xl font-bold text-[#22C55E]">95%</h3>
            <p className="text-gray-400 font-medium">Candidate Satisfaction</p>
          </div>
        </motion.div>
      </main>

      {/* Auth side drawer */}
      <AuthDrawer 
        isOpen={isAuthDrawerOpen} 
        onClose={() => setIsAuthDrawerOpen(false)} 
        initialTab={authDrawerTab}
        onAuthSuccess={checkAuthStatus}
      />
    </div>
  );
}
