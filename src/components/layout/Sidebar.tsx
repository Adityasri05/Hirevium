"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { API_BASE_URL, getAuthHeaders } from "@/utils/api";
import { auth } from "@/utils/firebase";
import { signOut } from "firebase/auth";
import {
  LayoutDashboard,
  Video,
  FileText,
  Search,
  GraduationCap,
  Users,
  Trophy,
  RotateCcw,
  LogOut
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Live Interview", href: "/dashboard/live-interview", icon: Video },
  { name: "Resume Intelligence", href: "/dashboard/resumes", icon: FileText },
  { name: "JD Analyzer", href: "/dashboard/jd-analyzer", icon: Search },
  { name: "Achievements", href: "/dashboard/achievements", icon: Trophy },
  { name: "Career Coach", href: "/dashboard/career-coach", icon: GraduationCap },
  { name: "Recruiter Mode", href: "/dashboard/recruiter", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const [iqScore, setIqScore] = useState<number>(87);

  useEffect(() => {
    async function loadLatestResume() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/resumes/latest`, {
          headers: getAuthHeaders(null)
        });
        if (!response.ok) return;
        const data = await response.json();
        
        // Dynamically set HireIQ score from the parsed resume quality
        if (data.resume_score) {
          setIqScore(Math.round(data.resume_score));
        }
      } catch (e) {
        console.warn("Sidebar: Failed loading latest resume details", e);
      }
    }
    loadLatestResume();
  }, []);

  const handleReset = () => {
    localStorage.removeItem("hireiq_token");
    localStorage.removeItem("hireiq_user");
    window.location.href = "/onboarding";
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Sign out: Firebase sign out failed", e);
    }
    localStorage.removeItem("hireiq_token");
    localStorage.removeItem("hireiq_user");
    window.location.href = "/login";
  };

  return (
    <aside className="w-64 h-screen bg-[#09090B] border-r border-[rgba(255,255,255,0.08)] flex flex-col hidden md:flex fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-[rgba(255,255,255,0.08)]">
        <Link href="/" className="text-2xl font-bold text-gradient-primary tracking-tighter">
          HIREIQ
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive 
                  ? "bg-[rgba(124,58,237,0.15)] text-[#A855F7] border border-[rgba(124,58,237,0.3)]" 
                  : "text-gray-400 hover:text-white hover:bg-[#111827]"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-[rgba(255,255,255,0.08)] space-y-3">
        <div className="glass rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#A855F7] flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(124,58,237,0.5)]">
            <span className="font-bold text-white text-sm">IQ</span>
          </div>
          <p className="text-xs text-gray-400">HireIQ Score</p>
          <p className="text-xl font-bold text-white">{iqScore}<span className="text-sm text-gray-500">/100</span></p>
        </div>
        
        <button 
          onClick={handleReset}
          className="flex items-center justify-center space-x-2 w-full py-2 bg-[rgba(168,85,247,0.08)] hover:bg-[rgba(168,85,247,0.15)] border border-[rgba(168,85,247,0.2)] rounded-lg text-xs text-[#A855F7] transition-colors font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Assessment</span>
        </button>

        <button 
          onClick={handleSignOut}
          className="flex items-center justify-center space-x-2 w-full py-2 bg-[rgba(239,68,68,0.08)] hover:bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.2)] rounded-lg text-xs text-[#EF4444] transition-colors font-medium"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
