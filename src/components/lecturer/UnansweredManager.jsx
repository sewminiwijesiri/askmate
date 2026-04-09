"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  BookOpen,
  HelpCircle,
  ChevronRight,
  Clock,
  CheckCircle,
  X,
  ArrowRight,
  Zap,
  GraduationCap,
  AlignLeft,
  Tag
} from "lucide-react";
import GuidanceForm from "./GuidanceForm";

export default function UnansweredManager({ user }) {
  const [selectedYear, setSelectedYear] = useState(1);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);
  const [activeView, setActiveView] = useState("modules"); // "modules" | "questions"
  const [searchQuery, setSearchQuery] = useState("");
  const [questions, setQuestions] = useState([]);
  const [qLoading, setQLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [ansLoading, setAnsLoading] = useState(false);

  // Fetch modules from the correct established endpoint
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/academic");
        if (res.ok) {
          const data = await res.json();
          setModules(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error fetching modules:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  // Fetch Questions (locally filtered for unanswered)
  const fetchUnansweredQuestions = useCallback((moduleName) => {
    setQLoading(true);
    fetch(`/api/questions?module=${encodeURIComponent(moduleName)}`)
      .then((res) => {
        if (!res.ok) throw new Error("API Error");
        return res.json();
      })
      .then((data) => {
        const questionsList = Array.isArray(data) ? data : [];
        // Filter for unanswered: answersCount === 0
        setQuestions(questionsList.filter(q => (q.answersCount || 0) === 0));
        setQLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching questions:", err);
        setQLoading(false);
      });
  }, []);

  const fetchAnswers = useCallback((questionId) => {
    setAnsLoading(true);
    fetch(`/api/answers?questionId=${questionId}`)
      .then((res) => {
        if (!res.ok) throw new Error("API Error");
        return res.json();
      })
      .then((data) => {
        setAnswers(Array.isArray(data) ? data : []);
        setAnsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching answers:", err);
        setAnsLoading(false);
      });
  }, []);

  const handleModuleClick = (mod) => {
    setSelectedModule(mod);
  };

  const handleViewQuestions = () => {
    if (selectedModule) {
      setActiveView("questions");
      fetchUnansweredQuestions(selectedModule.moduleName);
    }
  };

  const handleQuestionClick = (q) => {
    setSelectedQuestion(q);
    fetchAnswers(q._id);
  };

  const closeQuestion = () => {
    setSelectedQuestion(null);
    setAnswers([]);
  };

  const timeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "just now";
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
  };

  const filteredModules = modules.filter(m => 
    Number(m.year) === Number(selectedYear) && 
    Number(m.semester) === Number(selectedSemester) &&
    (m.moduleName.toLowerCase().includes(searchQuery.toLowerCase()) || 
     m.moduleCode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (activeView === "questions") {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between mb-8">
            <button 
                onClick={() => { setActiveView("modules"); setQuestions([]); }}
                className="flex items-center gap-2 text-slate-500 hover:text-[#002147] font-bold text-sm transition-all"
            >
                <ChevronRight size={18} className="rotate-180" /> Back to Modules
            </button>
            <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase border border-orange-100 shadow-sm">
                    {selectedModule?.moduleCode}
                </span>
                <h2 className="text-xl font-bold text-[#002147]">Unanswered Questions</h2>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {qLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
          ) : questions.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
              <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#002147]">Clean Slate!</h3>
              <p className="text-slate-500 mt-2">All questions in this module have received guidance.</p>
            </div>
          ) : (
            questions.map((q) => (
              <div
                key={q._id}
                onClick={() => handleQuestionClick(q)}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-orange-200 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-500 rounded-lg text-[9px] font-black uppercase border border-orange-100">
                          <Clock size={10} /> Pending
                       </span>
                       <span className="text-[10px] text-slate-400 font-bold">{timeSince(q.createdAt)}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#002147] group-hover:text-blue-600 transition-colors">{q.title}</h3>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2">{q.description}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#002147] group-hover:text-white transition-all">
                    <ArrowRight size={18} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedQuestion && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-4xl h-[85vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/20">
                {/* Modal Header */}
                <div className="h-[80px] px-8 border-b border-slate-100 bg-white flex-none flex items-center justify-between w-full z-10 relative">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex flex-none items-center justify-center text-orange-500 shadow-inner">
                            <HelpCircle size={20} />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xl font-black text-[#002147] truncate">{selectedQuestion.title}</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedQuestion.module} • Academic Segment</p>
                        </div>
                    </div>
                    <button onClick={closeQuestion} className="w-10 h-10 flex-none flex items-center justify-center bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-90">
                        <X size={20} />
                    </button>
                </div>

                {/* Single-Column Centered Layout */}
                <div className="flex-auto overflow-y-auto custom-scrollbar flex flex-col bg-slate-50/50 w-full relative">
                    {/* Top Panel: Question Details */}
                    <div className="w-full p-8 sm:p-10 space-y-8 bg-slate-50/50 border-b border-slate-100 shrink-0">
                        <div className="space-y-6">
                             {/* Author & Urgency Card */}
                            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#002147] text-white flex items-center justify-center font-black text-xs">
                                        {(selectedQuestion.student?.name || selectedQuestion.student?.studentId || "S")[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inquirer</p>
                                        <h4 className="text-sm font-bold text-[#002147]">{selectedQuestion.student?.name || selectedQuestion.student?.studentId}</h4>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    {selectedQuestion.urgencyLevel === "Urgent" && (
                                        <span className="px-2 py-0.5 bg-red-50 text-red-500 rounded-lg text-[8px] font-black uppercase border border-red-100">Urgent</span>
                                    )}
                                    <span className="text-[10px] font-bold text-slate-400">{timeSince(selectedQuestion.createdAt)}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[11px] font-black text-[#002147] uppercase tracking-[0.2em] flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                    The Core Inquiry
                                </h4>
                                <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm text-sm text-slate-600 leading-relaxed font-semibold">
                                    {selectedQuestion.description}
                                </div>
                            </div>

                            {selectedQuestion.whatIveTried && (
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-black text-orange-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Zap size={14} /> Stuck Context
                                    </h4>
                                    <div className="p-6 bg-orange-50/50 rounded-[2rem] border border-orange-100/50 text-xs text-slate-600 italic leading-relaxed font-medium">
                                        "{selectedQuestion.whatIveTried}"
                                    </div>
                                </div>
                            )}

                            {selectedQuestion.topic && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200/60 rounded-xl w-fit shadow-sm">
                                    <Tag size={12} className="text-blue-500" />
                                    <span className="text-[10px] font-black text-[#002147] uppercase tracking-widest">{selectedQuestion.topic}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Panel: Guidance Studio */}
                    <div className="w-full bg-white relative shrink-0 pt-6 sm:pt-8">
                        <GuidanceForm
                            selectedQuestion={selectedQuestion}
                            user={user}
                            onSuccess={() => {
                                fetchUnansweredQuestions(selectedModule.moduleName);
                                closeQuestion();
                            }}
                            timeSince={timeSince}
                            answers={answers}
                        />
                    </div>
                </div>
              </div>
            </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-64 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">Academic Year</h3>
            <div className="space-y-1">
              {[1, 2, 3, 4].map((year) => (
                <button
                  key={year}
                  onClick={() => { setSelectedYear(year); setSelectedModule(null); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-[13px] transition-all ${selectedYear === year
                    ? "bg-[#002147] text-white shadow-md font-black"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                >
                  <span>Year {year}</span>
                  <ChevronRight size={14} className={selectedYear === year ? "opacity-100" : "opacity-0"} />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">Semester</h3>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2].map((sem) => (
                <button
                  key={sem}
                  onClick={() => { setSelectedSemester(sem); setSelectedModule(null); }}
                  className={`py-4 rounded-xl font-bold text-sm transition-all text-center flex flex-col items-center gap-1 ${selectedSemester === sem
                    ? "bg-orange-50 text-orange-600 border border-orange-200 ring-2 ring-orange-400/10"
                    : "bg-slate-50 text-slate-500 border border-transparent hover:bg-slate-100"
                    }`}
                >
                  <span className="text-[9px] opacity-60 uppercase">Sem</span>
                  <span className="text-lg leading-none font-black">{sem}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modules List */}
        <div className="flex-1">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm min-h-[500px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
              <div>
                <h2 className="text-2xl font-bold text-[#002147] tracking-tight">Unanswered Questions Portal</h2>
                <p className="text-slate-500 text-sm mt-1">Year {selectedYear} • Semester {selectedSemester}</p>
              </div>

              <div className="relative w-full sm:w-64 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Filter local modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-[300px]">
                <div className="w-8 h-8 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-xs text-slate-400 font-bold mt-4 uppercase tracking-widest">Loading Modules...</p>
              </div>
            ) : filteredModules.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-center p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                <BookOpen size={40} className="text-slate-200 mb-4" />
                <h3 className="text-lg font-bold text-[#002147] mb-1">No modules found</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">Select a different academic segment to find questions.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredModules.map((module) => (
                  <div
                    key={module._id}
                    onClick={() => handleModuleClick(module)}
                    className={`flex flex-col p-6 rounded-2xl transition-all cursor-pointer group border-2 ${selectedModule?._id === module._id ? 'bg-white border-blue-500 shadow-xl shadow-blue-900/5' : 'bg-slate-50 border-slate-100 hover:border-blue-200'}`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${selectedModule?._id === module._id ? 'bg-blue-600 text-white' : 'bg-white border border-slate-100 text-[#002147]'}`}>
                        {module.moduleCode}
                      </div>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${selectedModule?._id === module._id ? 'bg-blue-600 text-white' : 'bg-white text-slate-300 group-hover:bg-[#002147] group-hover:text-white'}`}>
                        <ArrowRight size={16} />
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-[#002147] mb-2">{module.moduleName}</h4>
                    
                    {selectedModule?._id === module._id && (
                        <div className="mt-5 pt-4 border-t border-blue-100 animate-in fade-in slide-in-from-top-1 duration-300">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewQuestions();
                                }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-900/10 active:scale-95"
                            >
                                <HelpCircle size={14} /> View Unanswered Questions
                            </button>
                        </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
