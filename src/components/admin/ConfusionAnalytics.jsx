"use client";

import { useState, useEffect } from "react";
import {
  GraduationCap,
  Calendar,
  Thermometer,
  TrendingUp,
  BookOpen
} from "lucide-react";
import TopicConfusionCard from "@/components/analytics/TopicConfusionCard";

export default function ConfusionAnalytics() {
  const [selectedYear, setSelectedYear] = useState(1);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [confusionData, setConfusionData] = useState([]);
  const [loadingConfusion, setLoadingConfusion] = useState(false);
  const [moduleFocus, setModuleFocus] = useState("All Modules");
  const [confusionStats, setConfusionStats] = useState({ 
    totalQuestions: 0, 
    unresolved: 0, 
    avgDifficulty: 0 
  });
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    fetchConfusionData();
  }, [selectedYear, selectedSemester, moduleFocus]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/academic", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setModules(data);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConfusionData = async () => {
    try {
      setLoadingConfusion(true);
      let url = `/api/analytics/confusion?year=${selectedYear}&semester=${selectedSemester}`;
      if (moduleFocus !== "All Modules") {
        url += `&module=${encodeURIComponent(moduleFocus)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        
        // Validation logic to ensure consistent and correct data
        const validData = (data.data || []).filter(item => 
          item && 
          item.topic && 
          item.module && 
          typeof item.confusionScore === 'number' && !isNaN(item.confusionScore) &&
          typeof item.difficultyScore === 'number' && !isNaN(item.difficultyScore) &&
          typeof item.totalQuestions === 'number' && !isNaN(item.totalQuestions) &&
          item.totalQuestions > 0
        );

        setConfusionData(validData);
        
        // Calculate aggregate stats for the grid using only valid data
        const stats = validData.reduce((acc, curr) => ({
          totalQuestions: acc.totalQuestions + curr.totalQuestions,
          unresolved: acc.unresolved + (curr.unresolvedQuestions || 0),
          avgDifficulty: acc.avgDifficulty + curr.difficultyScore
        }), { totalQuestions: 0, unresolved: 0, avgDifficulty: 0 });
        
        if (validData.length > 0) {
          stats.avgDifficulty = stats.avgDifficulty / validData.length;
        }
        setConfusionStats(stats);
      }
    } catch (error) {
      console.error("Error fetching confusion data:", error);
    } finally {
      setLoadingConfusion(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar for Years/Semesters */}
        <div className="w-full lg:w-64 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <GraduationCap size={14} className="text-indigo-500" />
              Academic Year
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${selectedYear === year
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "text-slate-500 border-slate-100 hover:bg-slate-50"
                    }`}
                >
                  Y{year}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Calendar size={14} className="text-amber-500" />
              Semester
            </h3>
            <div className="flex flex-col gap-2">
              {[1, 2].map((sem) => (
                <button
                  key={sem}
                  onClick={() => setSelectedSemester(sem)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border text-left ${selectedSemester === sem
                    ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                    : "text-slate-500 border-slate-100 hover:bg-slate-50"
                    }`}
                >
                  Semester {sem}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#001730] rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-orange-500/20 transition-all"></div>
            <div className="relative z-10">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Thermometer size={16} className="text-orange-500" />
                Live Tracking
              </h3>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                Aggregating real-time Q&A activity to detect academic bottlenecks.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Display Area */}
        <div className="flex-1 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm min-h-[500px]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#002147] flex items-center gap-2">
                  <Thermometer size={24} className="text-orange-500" />
                  {moduleFocus === "All Modules" ? `Y${selectedYear}S${selectedSemester} Module Heatmap` : `${moduleFocus} Topics`}
                </h2>
                <p className="text-slate-500 text-sm font-medium mt-1">
                  Identifying difficult academic areas for technical intervention.
                </p>
              </div>
              <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                <select 
                  value={moduleFocus}
                  onChange={(e) => setModuleFocus(e.target.value)}
                  className="text-[10px] font-bold bg-white border border-slate-200 rounded-lg px-3 py-1 outline-none text-[#002147] cursor-pointer"
                >
                  <option value="All Modules">All Modules</option>
                  {Array.from(new Set(modules.filter(m => m.year === selectedYear && m.semester === selectedSemester).map(m => m.moduleName))).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <div className="flex items-center px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-wider text-[#002147] gap-2 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  Real-time Analytics
                </div>
                <button 
                  onClick={fetchConfusionData} 
                  className="p-1 px-2 hover:bg-slate-200 rounded-md transition-colors text-slate-400 hover:text-[#002147]"
                  title="Refresh Data"
                >
                  <TrendingUp size={14} />
                </button>
              </div>
            </div>

            {/* Stats Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Total Period Activity</p>
                <p className="text-2xl font-black text-[#002147]">{confusionStats.totalQuestions}</p>
              </div>
              <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1">Unresolved Queries</p>
                <p className="text-2xl font-black text-rose-600">{confusionStats.unresolved}</p>
              </div>
              <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Avg Complexity Level</p>
                <p className="text-2xl font-black text-amber-600">{confusionStats.avgDifficulty.toFixed(1)}</p>
              </div>
            </div>

            {/* Multi-Period Selector Bar */}
            <div className="bg-slate-50 p-2 rounded-2xl border border-slate-100 mb-8 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {[1, 2, 3, 4].map(y => (
                  [1, 2].map(s => (
                    <button
                      key={`${y}-${s}`}
                      onClick={() => {
                        setSelectedYear(y);
                        setSelectedSemester(s);
                      }}
                      className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        selectedYear === y && selectedSemester === s
                          ? "bg-[#FF9F1C] text-white border-[#FF9F1C] shadow-lg shadow-orange-500/20"
                          : "bg-white text-slate-500 border-slate-200 hover:border-orange-200 hover:text-orange-600"
                      }`}
                    >
                      Y{y}S{s}
                    </button>
                  ))
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingConfusion ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-48 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse"></div>
                ))
              ) : confusionData.length > 0 ? (
                confusionData.map((data, i) => (
                  <TopicConfusionCard
                    key={i}
                    topic={data.topic}
                    module={data.module}
                    confusionScore={data.confusionScore}
                    unresolvedQuestions={data.unresolvedQuestions}
                    totalQuestions={data.totalQuestions}
                    difficultyScore={data.difficultyScore}
                  />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                  <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center text-slate-300 mb-4 border border-slate-100">
                    <Thermometer size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-[#002147] mb-1">No significant confusion detected</h3>
                  <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
                    Great! Your students seem to be following the course content smoothly.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
