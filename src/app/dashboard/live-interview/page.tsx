"use client";

import { API_BASE_URL, getAuthHeaders } from "@/utils/api";


import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, 
  Video, 
  Monitor, 
  StopCircle, 
  AlertOctagon,
  Activity,
  Brain,
  MessageSquare,
  Clock,
  ThumbsDown,
  ArrowRight,
  Play,
  Loader2,
  ChevronRight
} from "lucide-react";

interface QuestionData {
  id: string;
  question_text: string;
  difficulty: string;
  category: string;
  topic: string;
  knowledge_node: string;
  order_index: number;
}

export default function LiveInterview() {
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [interviewStatus, setInterviewStatus] = useState<"idle" | "starting" | "active" | "submitting" | "completed" | "terminated">("idle");
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [answer, setAnswer] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [averageScore, setAverageScore] = useState<number>(0);
  const [questionsAnswered, setQuestionsAnswered] = useState<number>(0);
  const [showTermination, setShowTermination] = useState(false);
  const [terminationReason, setTerminationReason] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  
  // Real-time evaluation metrics
  const [metrics, setMetrics] = useState({
    technical_score: 70,
    communication_score: 70,
    confidence_score: 70,
    pressure_score: 70,
    time_efficiency_score: 70,
    skill_verification_score: 70,
    hireiq_score: 70,
    hire_probability: 70,
    recommendation: "Borderline"
  });

  const [waves, setWaves] = useState([1, 1, 1, 1, 1]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Simulated AI voice waves animation
  useEffect(() => {
    const waveInterval = setInterval(() => {
      if (interviewStatus === "active") {
        setWaves(Array.from({ length: 5 }, () => Math.random() * 0.8 + 0.2));
      } else {
        setWaves([0.2, 0.2, 0.2, 0.2, 0.2]);
      }
    }, 150);
    return () => clearInterval(waveInterval);
  }, [interviewStatus]);

  // Duration Timer
  useEffect(() => {
    if (interviewStatus === "active") {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [interviewStatus]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleStartInterview = async () => {
    setInterviewStatus("starting");
    try {
      // 1. Fetch latest resume to inject as context
      let resumeId = null;
      try {
        const resumeRes = await fetch(`${API_BASE_URL}/api/resumes/latest`, {
          headers: getAuthHeaders(null)
        });
        if (resumeRes.ok) {
          const resumeData = await resumeRes.json();
          resumeId = resumeData.id;
        }
      } catch (e) {
        console.warn("No resume found, starting general interview", e);
      }

      // 2. Start the AI Adaptive Interview
      const response = await fetch(`${API_BASE_URL}/api/interviews/start`, {
        method: "POST",
        headers: getAuthHeaders("application/json"),
        body: JSON.stringify({
          resume_id: resumeId,
          interview_type: "technical",
          difficulty: "Medium"
        })
      });

      if (!response.ok) {
        throw new Error("Failed to start AI interview.");
      }

      const data = await response.json();
      setInterviewId(data.interview_id);
      setQuestion(data.first_question);
      setDifficulty(data.first_question.difficulty);
      setInterviewStatus("active");
    } catch (e) {
      console.error(e);
      setInterviewStatus("idle");
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !interviewId) return;

    setInterviewStatus("submitting");
    try {
      const response = await fetch(`${API_BASE_URL}/api/interviews/${interviewId}/answer`, {
        method: "POST",
        headers: getAuthHeaders("application/json"),
        body: JSON.stringify({
          answer_text: answer,
          response_time_seconds: 30.0 // average benchmark
        })
      });

      if (!response.ok) {
        throw new Error("Failed to process answer.");
      }

      const data = await response.json();
      
      // Update Live Evaluation Metrics
      if (data.updated_metrics) {
        setMetrics(data.updated_metrics);
        setAverageScore(data.updated_metrics.hireiq_score);
      }

      setQuestionsAnswered(prev => prev + 1);

      // Handle termination or completion conditions
      if (data.interview_terminated) {
        setInterviewStatus("terminated");
        setTerminationReason(data.termination_reason || "Fundamental skill gap identified.");
        setShowTermination(true);
        return;
      }

      if (data.interview_completed) {
        setInterviewStatus("completed");
        setShowCompleted(true);
        return;
      }

      // Load next question
      if (data.next_question) {
        setQuestion(data.next_question);
        setDifficulty(data.next_question.difficulty);
        setAnswer("");
        setInterviewStatus("active");
      }
    } catch (e) {
      console.error(e);
      setInterviewStatus("active");
    }
  };

  const handleEndInterview = async () => {
    if (!interviewId) return;
    try {
      await fetch(`${API_BASE_URL}/api/interviews/${interviewId}/end`, {
        method: "POST",
        headers: getAuthHeaders("application/json")
      });
      setInterviewStatus("completed");
      setShowCompleted(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4 relative">
      {/* Top Control Bar */}
      <div className="flex items-center justify-between bg-[#111827] border border-[rgba(255,255,255,0.05)] p-4 rounded-xl">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${interviewStatus === "active" ? 'bg-[#EF4444] animate-pulse' : 'bg-gray-500'}`}></div>
            <span className="text-white font-medium">AI Adaptive Technical Interview</span>
          </div>
          {interviewStatus === "active" && (
            <>
              <div className="h-4 w-px bg-[rgba(255,255,255,0.1)]"></div>
              <span className="text-[#A855F7] text-sm font-medium">{formatTime(timeElapsed)}</span>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {interviewStatus === "active" && (
            <>
              <button 
                onClick={handleEndInterview}
                className="px-3 py-1.5 bg-[rgba(239,68,68,0.1)] text-[#EF4444] border border-[rgba(239,68,68,0.3)] rounded-lg text-sm hover:bg-[rgba(239,68,68,0.2)] transition-colors flex items-center space-x-1"
              >
                <span>End Session</span>
              </button>
              
              <button className="p-2 bg-[rgba(255,255,255,0.05)] rounded-lg text-gray-400 hover:text-white transition-colors">
                <Mic className="w-5 h-5" />
              </button>
              <button className="p-2 bg-[rgba(255,255,255,0.05)] rounded-lg text-gray-400 hover:text-white transition-colors">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2 bg-[rgba(255,255,255,0.05)] rounded-lg text-gray-400 hover:text-white transition-colors">
                <Monitor className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {interviewStatus === "idle" || interviewStatus === "starting" ? (
        <div className="flex-1 glass rounded-xl border border-[rgba(255,255,255,0.05)] flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#A855F7] flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.4)]">
              <Brain className="w-12 h-12 text-white animate-pulse" />
            </div>
          </div>
          <div className="text-center max-w-md space-y-2">
            <h2 className="text-2xl font-bold text-white">Interactive Adaptive Interview</h2>
            <p className="text-sm text-gray-400">
              Benchmark your capabilities using our AI Adaptive Interview Engine. We&apos;ll customize questions in real time based on your target role and resume profile.
            </p>
          </div>
          <button
            onClick={handleStartInterview}
            disabled={interviewStatus === "starting"}
            className="px-8 py-4 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] disabled:opacity-50 text-white font-medium rounded-xl transition-all shadow-[0_0_15px_rgba(124,58,237,0.3)] flex items-center space-x-2"
          >
            {interviewStatus === "starting" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Blueprint...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Start Live Session</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="flex-1 flex gap-4 overflow-hidden relative">
          {/* Main Interview Area */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            
            {/* AI Interviewer Component */}
            <div className="flex-1 glass rounded-xl border border-[rgba(255,255,255,0.05)] relative overflow-hidden flex flex-col items-center justify-center bg-[rgba(17,24,39,0.8)] p-6">
              <div className="absolute top-4 left-4 bg-[rgba(0,0,0,0.5)] px-3 py-1 rounded-full border border-[rgba(255,255,255,0.1)] flex items-center space-x-2">
                <Brain className="w-4 h-4 text-[#A855F7]" />
                <span className="text-xs text-white">HireIQ Adaptive Engine</span>
              </div>

              {/* Simulated Avatar / Waveform */}
              <div className="relative flex items-center justify-center h-32 w-full">
                <div className="absolute w-24 h-24 bg-[#7C3AED] rounded-full blur-[60px] opacity-35"></div>
                <div className="flex items-center space-x-2 z-10">
                  {waves.map((scale, i) => (
                    <motion.div
                      key={i}
                      className="w-3 bg-gradient-to-t from-[#7C3AED] to-[#A855F7] rounded-full"
                      animate={{ height: scale * 60 + 20 }}
                      transition={{ type: "spring", bounce: 0, duration: 0.15 }}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6 text-center max-w-lg">
                {interviewStatus === "submitting" ? (
                  <div className="flex flex-col items-center space-y-3">
                    <Loader2 className="w-8 h-8 text-[#A855F7] animate-spin" />
                    <p className="text-gray-400 text-sm italic">AI technical evaluator checking correctness...</p>
                  </div>
                ) : (
                  <p className="text-base text-white font-medium leading-relaxed">
                    {question?.question_text || "Preparing next technical query..."}
                  </p>
                )}
              </div>
            </div>

            {/* Candidate View / Code Editor */}
            <div className="h-[45%] glass rounded-xl border border-[rgba(255,255,255,0.05)] p-4 flex flex-col bg-[#09090B]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Solution Editor / Technical Answer</span>
                <span className="text-xs text-[#22C55E] flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-ping"></span>
                  <span>Interactive Node</span>
                </span>
              </div>
              <textarea 
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={interviewStatus === "submitting"}
                className="flex-1 bg-transparent text-gray-300 font-mono text-sm focus:outline-none resize-none disabled:opacity-50"
                placeholder="// Write your answer here. Provide real-world examples and sample snippets where applicable..."
                spellCheck="false"
              />
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={interviewStatus === "submitting" || !answer.trim()}
                  className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-gray-800 text-white font-medium rounded-lg text-sm transition-all flex items-center space-x-2"
                >
                  <span>Submit Answer</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Real-Time Metrics & Knowledge Graph */}
          <div className="w-80 flex flex-col gap-4 overflow-y-auto pr-2 flex-shrink-0">
            
            {/* Adaptive Tracker */}
            <div className="glass rounded-xl p-4 border border-[rgba(255,255,255,0.05)]">
              <h3 className="text-sm font-semibold text-white mb-3">Adaptive Difficulty</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Current Level</span>
                <span className="text-xs font-bold text-[#F59E0B]">{difficulty}</span>
              </div>
              <div className="flex space-x-1 h-2">
                <div className={`flex-1 rounded-l-full ${difficulty === "Easy" || difficulty === "Medium" || difficulty === "Hard" || difficulty === "Expert" ? 'bg-[#22C55E]' : 'bg-[rgba(255,255,255,0.1)]'}`}></div>
                <div className={`flex-1 ${difficulty === "Medium" || difficulty === "Hard" || difficulty === "Expert" ? 'bg-[#F59E0B] animate-pulse' : 'bg-[rgba(255,255,255,0.1)]'}`}></div>
                <div className={`flex-1 ${difficulty === "Hard" || difficulty === "Expert" ? 'bg-[#EF4444]' : 'bg-[rgba(255,255,255,0.1)]'}`}></div>
                <div className={`flex-1 rounded-r-full ${difficulty === "Expert" ? 'bg-[#EF4444] animate-ping' : 'bg-[rgba(255,255,255,0.1)]'}`}></div>
              </div>
            </div>

            {/* Real-Time Metrics Guages */}
            <div className="glass rounded-xl p-4 border border-[rgba(255,255,255,0.05)]">
              <h3 className="text-sm font-semibold text-white mb-4">Live Performance</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400 flex items-center space-x-1"><Brain className="w-3 h-3"/> <span>Technical Score</span></span>
                    <span className="text-white font-bold">{Math.round(metrics.technical_score)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                    <div className="h-full bg-[#A855F7] transition-all duration-500" style={{ width: `${metrics.technical_score}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400 flex items-center space-x-1"><MessageSquare className="w-3 h-3"/> <span>Clarity</span></span>
                    <span className="text-white font-bold">{Math.round(metrics.communication_score)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                    <div className="h-full bg-[#22C55E] transition-all duration-500" style={{ width: `${metrics.communication_score}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400 flex items-center space-x-1"><Activity className="w-3 h-3"/> <span>Time Efficiency</span></span>
                    <span className="text-white font-bold">{Math.round(metrics.time_efficiency_score)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                    <div className="h-full bg-[#F59E0B] transition-all duration-500" style={{ width: `${metrics.time_efficiency_score}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Knowledge Graph Snapshot */}
            <div className="glass rounded-xl p-4 border border-[rgba(255,255,255,0.05)] flex-1">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
                <Brain className="w-4 h-4 text-[#A855F7]" />
                <span>Topic Mastery Graph</span>
              </h3>
              
              <div className="space-y-2 mt-4 relative pl-4 border-l border-[rgba(255,255,255,0.1)]">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#22C55E]"></div>
                  <p className="text-sm text-gray-300">Topic: {question?.topic || "Technical core"}</p>
                  <p className="text-xs text-[#22C55E] mt-0.5">Confidence: {Math.round(metrics.skill_verification_score)}%</p>
                </div>
                <div className="relative pt-3">
                  <div className="absolute -left-[21px] top-4 w-2.5 h-2.5 rounded-full bg-[#F59E0B] shadow-[0_0_8px_#F59E0B]"></div>
                  <p className="text-sm text-white font-medium">Path: {question?.knowledge_node || "Core Engine"}</p>
                  <p className="text-xs text-[#F59E0B] mt-0.5">Current Focus</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Early Termination Overlay */}
      <AnimatePresence>
        {showTermination && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-[rgba(9,9,11,0.95)] backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full bg-[#111827] border border-[#EF4444] rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.2)] p-8 text-center"
            >
              <div className="w-16 h-16 bg-[rgba(239,68,68,0.1)] rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertOctagon className="w-8 h-8 text-[#EF4444]" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Session Terminated</h2>
              
              <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-gray-300 font-medium mb-1">Reason:</p>
                <p className="text-sm text-[#EF4444] mb-3">{terminationReason}</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  The HireIQ early termination guard triggered automatically due to consecutive answer scores falling below threshold metrics. Let&apos;s build a customized learning plan to strengthen these areas.
                </p>
              </div>

              <button 
                onClick={() => window.location.href = '/dashboard/career-coach'}
                className="w-full py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <span>View Career Coach Roadmap</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completed Success Overlay */}
      <AnimatePresence>
        {showCompleted && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-[rgba(9,9,11,0.95)] backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full bg-[#111827] border border-[#22C55E] rounded-2xl shadow-[0_0_50px_rgba(34,197,94,0.2)] p-8 text-center"
            >
              <div className="w-16 h-16 bg-[rgba(34,197,94,0.1)] rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-[#22C55E]" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Session Completed!</h2>
              <p className="text-sm text-gray-400 mb-6">
                Outstanding! You have successfully completed the technical evaluation benchmark.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[rgba(255,255,255,0.02)] p-3 rounded-lg border border-[rgba(255,255,255,0.05)]">
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">Final Score</p>
                  <p className="text-2xl font-bold text-white mt-1">{Math.round(metrics.hireiq_score)}</p>
                </div>
                <div className="bg-[rgba(255,255,255,0.02)] p-3 rounded-lg border border-[rgba(255,255,255,0.05)]">
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">Verdict</p>
                  <p className="text-sm font-semibold text-[#22C55E] mt-2">{metrics.recommendation}</p>
                </div>
              </div>

              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="w-full py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <span>View Dashboard Analytics</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
