"use client";

import { Bell, Search, User, Check, Trash2, FileText, Trophy, GraduationCap, ChevronDown, Menu, X, LayoutDashboard, Video, Users, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { API_BASE_URL, getAuthHeaders } from "@/utils/api";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/utils/firebase";
import { signOut } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Live Interview", href: "/dashboard/live-interview", icon: Video },
  { name: "Resume Intelligence", href: "/dashboard/resumes", icon: FileText },
  { name: "JD Analyzer", href: "/dashboard/jd-analyzer", icon: Search },
  { name: "Achievements", href: "/dashboard/achievements", icon: Trophy },
  { name: "Career Coach", href: "/dashboard/career-coach", icon: GraduationCap },
  { name: "Recruiter Mode", href: "/dashboard/recruiter", icon: Users },
];

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

export function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [candidateName, setCandidateName] = useState<string>("Alex D.");
  const [candidateEmail, setCandidateEmail] = useState<string>("guest@hireiq.ai");
  const [candidateRole, setCandidateRole] = useState<string>("Frontend Engineer");
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [iqScore, setIqScore] = useState<number>(87);

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("hireiq_notifications");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }
    return [
      {
        id: "1",
        title: "Resume Analyzed",
        desc: "Your resume was parsed successfully. HireIQ Score set to 87/100.",
        time: "2 mins ago",
        read: false,
      },
      {
        id: "2",
        title: "Achievements Unlocked",
        desc: "You unlocked the 'Ready to Interview' badge!",
        time: "1 hour ago",
        read: false,
      },
      {
        id: "3",
        title: "Career Roadmap Ready",
        desc: "AI has generated your SQLAlchemy 2.0 Async Guide learning roadmap.",
        time: "2 hours ago",
        read: true,
      },
    ];
  });

  // Sync notifications to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hireiq_notifications", JSON.stringify(notifications));
    }
  }, [notifications]);

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#notification-btn") && !target.closest("#notification-dropdown")) {
        setShowNotifications(false);
      }
      if (!target.closest("#profile-btn") && !target.closest("#profile-dropdown")) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  useEffect(() => {
    // Load local storage profile data initially
    const stored = localStorage.getItem("hireiq_user");
    if (stored) {
      try {
        const parsedUser = JSON.parse(stored);
        if (parsedUser.name) setCandidateName(parsedUser.name);
        if (parsedUser.email) setCandidateEmail(parsedUser.email);
        if (parsedUser.target_role) setCandidateRole(parsedUser.target_role);
      } catch {}
    }

    async function loadLatestResume() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/resumes/latest`, {
          headers: getAuthHeaders(null)
        });
        if (!response.ok) return;
        
        const data = await response.json();
        if (data.resume_score) {
          setIqScore(Math.round(data.resume_score));
        }
        let parsed = data.parsed_content;
        if (parsed) {
          if (typeof parsed === "string") {
            try {
              parsed = JSON.parse(parsed);
            } catch (e) {}
          }
          if (parsed.name && parsed.name !== "Candidate's Full Name") {
            const parsedName = parsed.name;
            setCandidateName(parsedName);
            
            // Sync local storage user model
            const storedUser = localStorage.getItem("hireiq_user");
            if (storedUser) {
              const parsedUser = JSON.parse(storedUser);
              parsedUser.name = parsedName;
              if (data.target_role) parsedUser.target_role = data.target_role;
              localStorage.setItem("hireiq_user", JSON.stringify(parsedUser));
            }
          }
        }
      } catch (e) {
        console.warn("TopNav: Failed sync user name", e);
      }
    }

    loadLatestResume();
  }, []);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
  };


  const handleMobileSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Sign out: Firebase sign out failed", e);
    }
    localStorage.removeItem("hireiq_token");
    localStorage.removeItem("hireiq_user");
    window.location.href = "/";
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <header className="h-16 border-b border-[rgba(255,255,255,0.08)] bg-[#09090B]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
        <div className="flex-1 flex items-center">
          <button
            id="mobile-menu-btn"
            onClick={() => setShowMobileMenu(true)}
            className="p-2 -ml-2 mr-2 text-gray-400 hover:text-white rounded-lg hover:bg-[rgba(255,255,255,0.05)] md:hidden cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="relative w-64 md:w-96 hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search candidates, skills, or jobs..." 
            className="w-full bg-[#111827] border border-[rgba(255,255,255,0.05)] rounded-full pl-10 pr-4 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4 relative">
        {/* Notifications Dropdown Toggle */}
        <div className="relative">
          <button 
            id="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-[rgba(255,255,255,0.05)] ${showNotifications ? "bg-[rgba(255,255,255,0.05)] text-white" : ""}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#EF4444] rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div 
              id="notification-dropdown"
              className="absolute right-0 mt-2 w-80 sm:w-96 glass rounded-xl shadow-[0_10px_32px_rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.08)] z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between bg-[#0F0F13]">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-sm text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-[#7C3AED]/20 text-[#A855F7] text-xs px-2 py-0.5 rounded-full font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button 
                    onClick={handleClearAll}
                    className="text-xs text-gray-400 hover:text-[#EF4444] transition-colors flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear all</span>
                  </button>
                )}
              </div>

              <div className="max-h-[300px] overflow-y-auto divide-y divide-[rgba(255,255,255,0.05)] bg-[#09090B]">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => handleMarkAsRead(n.id)}
                      className={`p-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer flex items-start justify-between space-x-3 ${!n.read ? "bg-[rgba(124,58,237,0.03)]" : ""}`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-semibold ${!n.read ? "text-[#A855F7]" : "text-gray-300"}`}>
                            {n.title}
                          </span>
                          {!n.read && <span className="w-1.5 h-1.5 bg-[#A855F7] rounded-full"></span>}
                        </div>
                        <p className="text-xs text-gray-400 leading-normal">{n.desc}</p>
                        <span className="text-[10px] text-gray-500 block">{n.time}</span>
                      </div>
                      
                      {!n.read && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(n.id);
                          }}
                          className="p-1 rounded bg-[rgba(255,255,255,0.05)] hover:bg-[#7C3AED]/20 text-gray-400 hover:text-[#A855F7] transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 space-y-2">
                    <Bell className="w-8 h-8 mx-auto opacity-30" />
                    <p className="text-sm">All caught up!</p>
                    <p className="text-xs text-gray-600">No new notifications to display.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="h-8 w-px bg-[rgba(255,255,255,0.08)] mx-2"></div>

        {/* Profile Dropdown Toggle */}
        <div className="relative">
          <button 
            id="profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`flex items-center space-x-2.5 p-1 pr-3 rounded-full border border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors ${showProfileMenu ? "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.15)]" : ""}`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#A855F7] flex items-center justify-center shadow-[0_0_10px_rgba(124,58,237,0.3)]">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-300 hidden md:inline">{candidateName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500 hidden md:inline" />
          </button>

          {/* Profile Dropdown Panel */}
          {showProfileMenu && (
            <div 
              id="profile-dropdown"
              className="absolute right-0 mt-2 w-72 glass rounded-xl shadow-[0_10px_32px_rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.08)] z-50 overflow-hidden"
            >
              {/* Profile Card Header */}
              <div className="p-4 bg-[#0F0F13] border-b border-[rgba(255,255,255,0.08)] space-y-2.5">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white text-sm shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                    {candidateName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">{candidateName}</h4>
                    <p className="text-xs text-gray-400">{candidateEmail}</p>
                  </div>
                </div>
                <div className="bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-lg px-2.5 py-1 text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Target Position</p>
                  <p className="text-xs font-semibold text-[#A855F7]">{candidateRole}</p>
                </div>
              </div>

              {/* Navigation Shortcuts */}
              <div className="p-2 bg-[#09090B] space-y-0.5">
                <Link 
                  href="/dashboard/resumes"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 text-xs text-gray-300 hover:text-white rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                >
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span>Resume Intelligence</span>
                </Link>
                <Link 
                  href="/dashboard/achievements"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 text-xs text-gray-300 hover:text-white rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                >
                  <Trophy className="w-4 h-4 text-gray-400" />
                  <span>Achievements</span>
                </Link>
                <Link 
                  href="/dashboard/career-coach"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 text-xs text-gray-300 hover:text-white rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                >
                  <GraduationCap className="w-4 h-4 text-gray-400" />
                  <span>Career Coaching</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>

    {/* Mobile Drawer Navigation */}
    <AnimatePresence>
      {showMobileMenu && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMobileMenu(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] md:hidden"
          />

          {/* Sidebar Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 w-64 h-screen bg-[#09090B] border-r border-[rgba(255,255,255,0.08)] flex flex-col z-[1000] md:hidden"
          >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-[rgba(255,255,255,0.08)]">
              <Link href="/" className="text-2xl font-bold text-gradient-primary tracking-tighter" onClick={() => setShowMobileMenu(false)}>
                HIREIQ
              </Link>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setShowMobileMenu(false)}
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

            {/* Footer */}
            <div className="p-4 border-t border-[rgba(255,255,255,0.08)] space-y-3">
              <div className="glass rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#A855F7] flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(124,58,237,0.5)]">
                  <span className="font-bold text-white text-sm">IQ</span>
                </div>
                <p className="text-xs text-gray-400">HireIQ Score</p>
                <p className="text-xl font-bold text-white">{iqScore}<span className="text-sm text-gray-500">/100</span></p>
              </div>
              
              <button 
                onClick={handleMobileSignOut}
                className="flex items-center justify-center space-x-2 w-full py-2 bg-[rgba(239,68,68,0.08)] hover:bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.2)] rounded-lg text-xs text-[#EF4444] transition-colors font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  </>
  );
}
