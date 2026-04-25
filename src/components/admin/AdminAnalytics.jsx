"use client";

import { useState, useEffect } from "react";
import { Users, BookOpen, MessageSquare, Clock, BarChart, TrendingUp, Zap, ShieldCheck, PieChart, Activity } from "lucide-react";

export default function AdminAnalytics() {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("/api/admin/analytics", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                if (res.ok) {
                    const json = await res.json();
                    if (json.success) {
                        setAnalyticsData(json.data);
                    }
                }
            } catch (error) {
                console.error("Error fetching admin analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 animate-in fade-in duration-500">
                <div className="relative">
                    <div className="w-16 h-16 border-[5px] border-indigo-500/10 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-indigo-50 rounded-full"></div>
                    </div>
                </div>
                <p className="mt-6 text-indigo-400 font-black tracking-widest text-xs uppercase animate-pulse">Compiling Analytics...</p>
            </div>
        );
    }

    if (!analyticsData) {
        return (
            <div className="p-10 text-center text-slate-400 font-bold border border-slate-100 rounded-2xl bg-white shadow-sm">
                Analytics data unavailable at the moment.
            </div>
        );
    }

    const { users, content, questionsByModule, last7Days, answeredPercentage } = analyticsData;

    // Calculate maximums for simple pseudo-charts
    const maxQuestions = Math.max(...last7Days.map(d => d.count), 1);
    const maxModuleQuestions = Math.max(...questionsByModule.map(m => m.count), 1);

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-700">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Members", value: users.total || 0, icon: Users, color: "bg-blue-600" },
                    { label: "Active Modules", value: content.modules || 0, icon: BookOpen, color: "bg-emerald-600" },
                    { label: "Questions Asked", value: content.questions || 0, icon: MessageSquare, color: "bg-orange-600" },
                    { label: "Answers Given", value: content.answers || 0, icon: Activity, color: "bg-indigo-600" },
                ].map((stat, i) => (
                    <div key={i} className={`bg-white p-7 rounded-[8px] hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[160px]`}>
                      <div className="flex justify-between items-start">
                        <div className={`w-12 h-12 rounded-[6px] text-white ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <stat.icon size={24} />
                        </div>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.15em] bg-slate-50/50 px-3 py-1.5 rounded-full border border-slate-100">
                          Live
                        </span>
                      </div>
                      <div className="mt-6">
                        <p className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider opacity-80">{stat.label}</p>
                        <h3 className="text-3xl font-extrabold text-[#002147] tracking-tight">{stat.value}</h3>
                      </div>
                      <div className={`absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500`}>
                        <stat.icon size={80} />
                      </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weekly Question Volume Trend */}
                <div className="bg-white rounded-[8px] p-8 lg:col-span-2 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <TrendingUp size={20} className="text-indigo-500" />
                                7-Day Activity Trend
                            </h3>
                            <p className="text-sm text-slate-500 font-medium">Daily question volume across all modules</p>
                        </div>
                        <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold border border-indigo-100/50 shadow-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                            Live
                        </div>
                    </div>

                    <div className="h-48 flex flex-col justify-end relative z-10 w-full mt-4 px-2">
                        <div className="flex-1 w-full relative">
                            <svg viewBox="0 0 700 160" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="lineAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <polygon 
                                    points={`0,160 ${last7Days.map((d, i) => `${(i / (last7Days.length - 1 || 1)) * 700},${160 - (d.count / (maxQuestions || 1)) * 140}`).join(' ')} 700,160`} 
                                    fill="url(#lineAreaGradient)" 
                                    className="animate-in fade-in duration-1000" 
                                />
                                <polyline 
                                    points={last7Days.map((d, i) => `${(i / (last7Days.length - 1 || 1)) * 700},${160 - (d.count / (maxQuestions || 1)) * 140}`).join(' ')} 
                                    fill="none" 
                                    stroke="#6366f1" 
                                    strokeWidth="4" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    className="drop-shadow-sm" 
                                />
                                
                                {last7Days.map((d, i) => {
                                    const cx = (i / (last7Days.length - 1 || 1)) * 700;
                                    const cy = 160 - (d.count / (maxQuestions || 1)) * 140;
                                    return (
                                        <g key={i} className="group cursor-pointer">
                                            <circle cx={cx} cy={cy} r="20" fill="transparent" />
                                            <circle 
                                                cx={cx} cy={cy} r="6" 
                                                fill="#ffffff" stroke="#6366f1" strokeWidth="3" 
                                                className="transition-colors duration-300 group-hover:stroke-indigo-400 group-hover:fill-indigo-50" 
                                            />
                                            <text 
                                                x={cx} y={cy - 12} textAnchor="middle" fill="#4f46e5" fontSize="14" fontWeight="900" 
                                                className="opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-sm pointer-events-none"
                                            >
                                                {d.count}
                                            </text>
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>
                        <div className="flex justify-between w-full mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest relative">
                            {last7Days.map((day, i) => (
                                <div key={i} className="text-center w-8 -ml-4 first:ml-0 last:-mr-4">
                                    {day.day}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side Column */}
                <div className="space-y-6">
                    {/* Resolution Rate Circular Visual */}
                    <div className="bg-gradient-to-br from-[#002147] to-[#001730] rounded-[8px] p-8 relative overflow-hidden text-white flex flex-col justify-center items-center min-h-[220px]">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/20 rounded-full blur-[50px] -mr-20 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-[50px] -ml-20 -mb-20"></div>
                        
                        <div className="relative z-10 text-center">
                            <h3 className="text-sm font-black text-blue-200 uppercase tracking-widest mb-4">Query Resolution Rate</h3>
                            <div className="relative inline-flex items-center justify-center mb-2">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
                                    <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="8" fill="transparent" 
                                        strokeDasharray="339.292" 
                                        strokeDashoffset={339.292 - (339.292 * answeredPercentage) / 100}
                                        className="text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)] transition-all duration-1000 ease-out" 
                                    />
                                </svg>
                                <div className="absolute text-3xl font-black text-white">{answeredPercentage}%</div>
                            </div>
                            <p className="text-xs text-blue-200/50 font-bold uppercase tracking-wider">Target: 95%</p>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-[8px] text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Students</p>
                            <p className="text-2xl font-black text-slate-800">{users.students}</p>
                        </div>
                        <div className="bg-white p-5 rounded-[8px] text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lecturers</p>
                            <p className="text-2xl font-black text-slate-800">{users.lecturers}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row - Hot Modules */}
            <div className="bg-white rounded-[8px] p-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Zap size={20} className="text-orange-500" />
                            Most Active Modules
                        </h3>
                        <p className="text-sm text-slate-500 font-medium">Modules experiencing the highest volume of student queries.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {questionsByModule.length > 0 ? (
                        questionsByModule.map((mod, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 font-black flex items-center justify-center shadow-sm text-sm border border-orange-100">
                                    {i + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1.5">
                                        <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{mod._id}</span>
                                        <span className="text-xs font-bold text-slate-500">{mod.count} Queries</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                                        <div 
                                            className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full transition-all duration-1000 ease-out relative" 
                                            style={{ width: `${(mod.count / maxModuleQuestions) * 100}%` }}
                                        >
                                            <div className="absolute top-0 right-0 bottom-0 w-2 bg-white/30 animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center p-6 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 font-bold text-sm">
                            No question data available for modules yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
