"use client";

import { Bell, Search, User } from "lucide-react";
import { useState, useEffect } from "react";
import { API_BASE_URL, getAuthHeaders } from "@/utils/api";

export function TopNav() {
  const [candidateName, setCandidateName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("hireiq_user");
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          if (userObj.name) return userObj.name;
        } catch {}
      }
    }
    return "Alex D.";
  });

  useEffect(() => {

    async function loadLatestResume() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/resumes/latest`, {
          headers: getAuthHeaders(null)
        });
        if (!response.ok) return;
        
        const data = await response.json();
        if (data.parsed_content && data.parsed_content.name) {
          const parsedName = data.parsed_content.name;
          if (parsedName !== "Candidate's Full Name") {
            setCandidateName(parsedName);
            
            // Sync local storage user model
            const stored = localStorage.getItem("hireiq_user");
            if (stored) {
              const parsedUser = JSON.parse(stored);
              parsedUser.name = parsedName;
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

  return (
    <header className="h-16 border-b border-[rgba(255,255,255,0.08)] bg-[#09090B]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="flex-1 flex items-center">
        <div className="relative w-64 md:w-96 hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search candidates, skills, or jobs..." 
            className="w-full bg-[#111827] border border-[rgba(255,255,255,0.05)] rounded-full pl-10 pr-4 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-[rgba(255,255,255,0.05)]">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
        </button>
        
        <div className="h-8 w-px bg-[rgba(255,255,255,0.08)] mx-2"></div>

        <button className="flex items-center space-x-2 p-1 pr-3 rounded-full border border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-300">{candidateName}</span>
        </button>
      </div>
    </header>
  );
}
