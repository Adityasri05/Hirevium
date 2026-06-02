"use client";

import { API_BASE_URL, getAuthHeaders } from "@/utils/api";


import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Brain, 
  Target, 
  Activity, 
  MessageSquare,
  Clock,
  ChevronRight,
  Loader2,
  FileText
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

interface SkillMetric {
  subject: string;
  A: number;
  fullMark: number;
}

interface TrendPoint {
  name: string;
  score: number;
}

interface MetricSummary {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
}

export default function Dashboard() {
  const [userName, setUserName] = useState<string>("Alex");
  const [isLoading, setIsLoading] = useState(true);
  
  // Custom resume state parameters
  const [skillsRadar, setSkillsRadar] = useState<SkillMetric[]>([
    { subject: 'Technical', A: 90, fullMark: 100 },
    { subject: 'Communication', A: 88, fullMark: 100 },
    { subject: 'Problem Solving', A: 85, fullMark: 100 },
    { subject: 'System Design', A: 75, fullMark: 100 },
    { subject: 'Pressure Handling', A: 84, fullMark: 100 },
    { subject: 'Leadership', A: 70, fullMark: 100 },
  ]);

  const [scoreTrend, setScoreTrend] = useState<TrendPoint[]>([
    { name: 'Week 1', score: 65 },
    { name: 'Week 2', score: 72 },
    { name: 'Week 3', score: 78 },
    { name: 'Week 4', score: 85 },
    { name: 'Week 5', score: 87 },
  ]);

  const [metrics, setMetrics] = useState<MetricSummary[]>([
    { title: "Hire Probability", value: "91%", icon: TrendingUp, color: "text-[#22C55E]" },
    { title: "Technical Competency", value: "90%", icon: Brain, color: "text-[#A855F7]" },
    { title: "Communication", value: "88%", icon: MessageSquare, color: "text-[#3B82F6]" },
    { title: "Pressure Handling", value: "84%", icon: Activity, color: "text-[#F59E0B]" },
  ]);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      
      // Determine user name
      const storedUser = localStorage.getItem("hireiq_user");
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          if (userObj.name) {
            setUserName(userObj.name.split(" ")[0]);
          }
        } catch {}
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/resumes/latest`, {
          headers: getAuthHeaders(null)
        });
        if (!response.ok) {
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        
        // Customise metrics based on the actual parsed resume intelligence details
        if (data.resume_score) {
          const resScore = Math.round(data.resume_score);
          const trust = Math.round(data.parsed_content?.business_impact_score || 80);
          
          setMetrics([
            { title: "Hire Probability", value: `${Math.round(resScore * 0.95)}%`, icon: TrendingUp, color: "text-[#22C55E]" },
            { title: "Technical Competency", value: `${resScore}%`, icon: Brain, color: "text-[#A855F7]" },
            { title: "Business Impact", value: `${trust}%`, icon: MessageSquare, color: "text-[#3B82F6]" },
            { title: "Skill Confidence", value: `${Math.min(100, Math.round(resScore * 1.15))}%`, icon: Activity, color: "text-[#F59E0B]" },
          ]);

          // Customise skills radar according to actual extracted skills
          const parsed = data.parsed_content || {};
          const conf = parsed.skill_confidence || {};
          
          const radarPoints: SkillMetric[] = [
            { subject: 'Technical', A: resScore, fullMark: 100 },
            { subject: 'Communication', A: 85, fullMark: 100 },
            { subject: 'Problem Solving', A: Math.round(parsed.project_complexity?.overall * 10 || 75), fullMark: 100 },
            { subject: 'Business Impact', A: trust, fullMark: 100 },
            { subject: 'Confidence', A: Math.round(resScore * 0.9), fullMark: 100 },
            { subject: 'Experience Score', A: Math.round(parsed.business_impact_score || 70), fullMark: 100 }
          ];
          setSkillsRadar(radarPoints);

          // Populate line chart trend
          setScoreTrend([
            { name: 'Initial', score: Math.round(resScore * 0.8) },
            { name: 'Analysis', score: Math.round(resScore * 0.9) },
            { name: 'Verification', score: resScore },
          ]);
        }
      } catch (e) {
        console.warn("Failed loading resume analytics", e);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-[#A855F7] animate-spin" />
        <p className="text-gray-400 text-sm">Gathering Candidate Intelligence Profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {userName}</h1>
          <p className="text-gray-400">Here&apos;s your hiring readiness overview for today.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => window.location.href = "/dashboard/resumes"}
            className="px-4 py-2 glass hover:bg-[rgba(255,255,255,0.05)] rounded-lg text-sm text-white transition-colors flex items-center space-x-2"
          >
            <FileText className="w-4 h-4 text-gray-400" />
            <span>View Resume</span>
          </button>
          <button 
            onClick={() => window.location.href = "/dashboard/live-interview"}
            className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg text-sm text-white transition-colors flex items-center space-x-2"
          >
            <Target className="w-4 h-4" />
            <span>New Interview</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <motion.div 
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-5 rounded-xl border border-[rgba(255,255,255,0.05)] hover:border-[rgba(124,58,237,0.3)] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">{metric.title}</p>
                  <h3 className="text-2xl font-bold text-white">{metric.value}</h3>
                </div>
                <div className={`p-2 rounded-lg bg-[rgba(255,255,255,0.05)] ${metric.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Digital Twin Radar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-1 glass rounded-xl p-6 border border-[rgba(255,255,255,0.05)]"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white flex items-center space-x-2">
              <Brain className="w-5 h-5 text-[#A855F7]" />
              <span>Digital Twin Profile</span>
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillsRadar}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <Radar
                  name={userName}
                  dataKey="A"
                  stroke="#A855F7"
                  fill="#7C3AED"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Progress Trend */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 glass rounded-xl p-6 border border-[rgba(255,255,255,0.05)]"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-[#22C55E]" />
              <span>HireIQ Score Trend</span>
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreTrend} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <XAxis dataKey="name" stroke="#4B5563" tick={{ fill: '#9CA3AF' }} />
                <YAxis stroke="#4B5563" tick={{ fill: '#9CA3AF' }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(124,58,237,0.3)', borderRadius: '8px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#A855F7" 
                  strokeWidth={3}
                  dot={{ fill: '#7C3AED', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#fff' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity Timeline */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass rounded-xl p-6 border border-[rgba(255,255,255,0.05)]"
      >
        <h3 className="font-semibold text-white mb-6">Recent Interviews</h3>
        <div className="space-y-4">
          {[
            { role: "Senior Frontend Engineer", type: "Technical", date: "2 days ago", score: 89, status: "Strong Hire" },
            { role: "Frontend Developer", type: "Behavioral", date: "5 days ago", score: 84, status: "Hire" },
            { role: "Full Stack Engineer", type: "System Design", date: "1 week ago", score: 72, status: "Borderline" },
          ].map((interview, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.04)] transition-colors">
              <div className="flex items-start space-x-4">
                <div className="p-2 rounded-lg bg-[rgba(124,58,237,0.1)] text-[#A855F7]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-white">{interview.role}</h4>
                  <p className="text-sm text-gray-400">{interview.type} • {interview.date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right hidden sm:block">
                  <p className="font-bold text-white">{interview.score}/100</p>
                  <p className={`text-xs ${interview.score > 85 ? 'text-[#22C55E]' : interview.score > 75 ? 'text-[#A855F7]' : 'text-[#F59E0B]'}`}>
                    {interview.status}
                  </p>
                </div>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
