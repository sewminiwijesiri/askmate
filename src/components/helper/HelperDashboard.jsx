"use client";

import { useState, useEffect } from "react";
import HelperSidebar from "./HelperSidebar";
import AcademicBrowser from "@/components/student/AcademicBrowser";
import ProfileSection from "@/components/student/ProfileSection";
import MyResources from "@/components/student/MyResources";
import {
    Bell,
    Brain,
    Star,
    Trophy,
    Hourglass,
    MessageSquare,
    BookOpen,
    ArrowRight,
    Search,
    ChevronRight,
    ShieldCheck,
    Thermometer
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import TopicConfusionCard from "@/components/analytics/TopicConfusionCard";

export default function HelperDashboard({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [modules, setModules] = useState([]);
    const [modulesLoading, setModulesLoading] = useState(true);
    const [confusionData, setConfusionData] = useState([]);
    const [loadingConfusion, setLoadingConfusion] = useState(false);
    const [selectedYear, setSelectedYear] = useState(user?.year || "1");
    const [selectedSemester, setSelectedSemester] = useState(user?.semester || "1");
    const [moduleFocus, setModuleFocus] = useState("All Modules");

    useEffect(() => {
        if (activeTab === "dashboard") {
            fetchCurrentModules();
        }
        if (activeTab === "heatmap") {
            setLoadingConfusion(true);
            let url = `/api/analytics/confusion?year=${selectedYear}&semester=${selectedSemester}`;
            if (moduleFocus !== "All Modules") {
                url += `&module=${encodeURIComponent(moduleFocus)}`;
            }
            fetch(url)
                .then(res => res.json())
                .then(resData => {
                    if (resData.success) {
                        setConfusionData(resData.data);
                    }
                    setLoadingConfusion(false);
                })
                .catch(err => {
                    console.error("Confusion fetch error:", err);
                    setLoadingConfusion(false);
                });
        }
    }, [activeTab, selectedYear, selectedSemester, moduleFocus]);

    const fetchCurrentModules = async () => {
        try {
            setModulesLoading(true);
            const res = await fetch("/api/admin/academic");
            if (res.ok) {
                const data = await res.json();
                const getNum = (val) => parseInt(String(val).replace(/\D/g, "")) || 1;
                const filtered = data.filter(m =>
                    Number(m.year) === getNum(user.year) &&
                    Number(m.semester) === getNum(user.semester)
                ).slice(0, 2);
                setModules(filtered);
            }
        } catch (error) {
            console.error("Error fetching modules:", error);
        } finally {
            setModulesLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f3f3] text-slate-800 font-sans selection:bg-blue-100">
            <HelperSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                user={user}
                onLogout={onLogout}
            />

            <main className="lg:ml-72 min-h-screen p-6 md:p-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-[#002147] flex flex-wrap items-center gap-3">
                            Helper Workspace: <span className="text-[#002147]">{user.userId}</span>
                            <span className="text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-[0.15em] font-black border shadow-sm bg-orange-50 text-orange-600 border-orange-100">
                                {user.role}
                            </span>
                        </h1>
                        <p className="text-slate-500 font-medium">
                            Empowering peers through academic excellence and guidance.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <NotificationBell user={user} />

                        <div className="flex items-center gap-3 bg-white pl-1.5 pr-4 py-1.5 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-orange-200 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-[#001730] flex items-center justify-center text-white font-bold text-sm">
                                {user.userId?.[0]?.toUpperCase()}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-[13px] font-bold text-[#002147] leading-none">{user.userId}</p>
                                <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5 text-orange-500">
                                    Academic Elite
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {activeTab === "dashboard" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* High-Fidelity Helper Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: "Questions Answered", value: "24", icon: Brain, color: "text-blue-600", bg: "bg-white", border: "border-blue-100" },
                                { label: "Reputation Points", value: "1.2k", icon: Star, color: "text-orange-600", bg: "bg-white", border: "border-orange-100" },
                                { label: "Helper Rank", value: "#12", icon: Trophy, color: "text-emerald-600", bg: "bg-white", border: "border-emerald-100" },
                                { label: "Pending Recommends", value: "5", icon: Hourglass, color: "text-amber-600", bg: "bg-white", border: "border-amber-100" },
                            ].map((stat, i) => (
                                <div key={i} className={`${stat.bg} border ${stat.border} p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between min-h-[160px]`}>
                                    <div className="flex justify-between items-start">
                                        <div className={`w-12 h-12 rounded-2xl bg-white shadow-sm ${stat.color} flex items-center justify-center group-hover:rotate-12 transition-transform duration-500`}>
                                            <stat.icon size={24} />
                                        </div>
                                        <div className="flex gap-1">
                                            {[1, 2, 3].map(dot => <div key={dot} className={`w-1 h-1 rounded-full ${stat.color} opacity-20`} />)}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest leading-none">{stat.label}</p>
                                        <h3 className="text-3xl font-black text-[#002147] tracking-tight">{stat.value}</h3>
                                    </div>
                                    <div className={`absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity duration-500`}>
                                        <stat.icon size={84} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            <div className="xl:col-span-2 space-y-8">
                                {/* Skilled Modules Section */}
                                <section className="bg-white border border-slate-200/60 p-8 rounded-[2.5rem] shadow-sm">
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h3 className="text-xl font-black text-[#002147] tracking-tight">Expertise Domains</h3>
                                            <p className="text-slate-400 text-xs font-bold mt-1">Modules where you provide elite guidance</p>
                                        </div>
                                        <button onClick={() => setActiveTab("academic")} className="p-2.5 bg-slate-50 text-slate-400 hover:bg-[#002147] hover:text-white rounded-xl transition-all shadow-sm">
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {modulesLoading ? (
                                            Array(2).fill(0).map((_, i) => (
                                                <div key={i} className="h-48 bg-slate-50 rounded-2xl animate-pulse" />
                                            ))
                                        ) : modules.map((module, i) => (
                                            <div key={module._id} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all group relative overflow-hidden">
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-[#002147] uppercase tracking-wider">
                                                        {module.moduleCode}
                                                    </span>
                                                    <ShieldCheck size={18} className="text-emerald-500" />
                                                </div>
                                                <h4 className="text-lg font-bold text-[#002147] mb-4">{module.moduleName}</h4>
                                                
                                                <div className="grid grid-cols-2 gap-3 mb-6">
                                                    <div className="bg-white p-3 rounded-xl border border-slate-100/50">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <MessageSquare size={12} className="text-blue-500" />
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Guidance</span>
                                                        </div>
                                                        <p className="text-lg font-black text-[#002147] leading-none">12</p>
                                                    </div>
                                                    <div className="bg-white p-3 rounded-xl border border-slate-100/50">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Star size={12} className="text-orange-500" />
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Impact</span>
                                                        </div>
                                                        <p className="text-lg font-black text-[#002147] leading-none">4.9</p>
                                                    </div>
                                                </div>

                                                <button onClick={() => setActiveTab("academic")} className="w-full py-2.5 bg-[#002147] text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-orange-500 transition-all shadow-md">
                                                    Enter Workspace
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Productivity Banner */}
                                <div className="bg-[#002147] p-10 rounded-[2.5rem] text-white relative overflow-hidden group shadow-xl">
                                    <div className="absolute right-0 top-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-orange-500/20 transition-all" />
                                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-black mb-3 tracking-tight">Earn Reputation by Answering Questions</h3>
                                            <p className="text-blue-100/80 text-sm mb-8 max-w-md font-medium leading-relaxed">
                                                The "Recommended" portal has 5 new queries matching your expertise areas. Help your colleagues and ascend the leaderboard.
                                            </p>
                                            <button
                                                onClick={() => setActiveTab("qa")}
                                                className="px-8 py-3.5 bg-[#FF9F1C] hover:bg-orange-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-3"
                                            >
                                                Open Recommended Hub <ArrowRight size={16} />
                                            </button>
                                        </div>
                                        <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-md">
                                            <Brain size={64} className="text-[#FF9F1C] animate-pulse-subtle" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Extras */}
                            <div className="space-y-8">
                                <div className="bg-white border border-slate-200/60 p-8 rounded-[2.5rem] shadow-sm">
                                    <h3 className="text-lg font-black text-[#002147] mb-6 flex items-center gap-2">
                                        <Trophy size={20} className="text-orange-500" />
                                        Peer Leaderboard
                                    </h3>
                                    <div className="space-y-4">
                                        {[
                                            { name: "Alex Chen", points: "4.8k", rank: 1, trend: 'up' },
                                            { name: "Sarah Smith", points: "3.2k", rank: 2, trend: 'down' },
                                            { name: "Mike Ross", points: "2.9k", rank: 3, trend: 'stable' },
                                        ].map((helper, i) => (
                                            <div key={i} className={`flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-100 ${i === 0 ? 'bg-orange-50/30' : ''}`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl ${i === 0 ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'} flex items-center justify-center font-black text-sm shadow-sm`}>
                                                        {helper.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-[#002147]">{helper.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{helper.points} Points</p>
                                                    </div>
                                                </div>
                                                <div className={`px-2 py-1 rounded-lg text-[10px] font-black ${i === 0 ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                    #{helper.rank}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="w-full mt-8 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl transition-all border border-slate-100">
                                        View Global Rankings
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "heatmap" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* Confusion Heatmap Section */}
                        <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-[#002147] flex items-center gap-2">
                                        <Thermometer size={24} className="text-orange-500" />
                                        {moduleFocus === "All Modules" ? `Y${selectedYear}S${selectedSemester} Module Heatmap` : `${moduleFocus} Topics`}
                                    </h3>
                                    <p className="text-slate-500 text-sm font-medium">
                                        Detecting academic confusion trends for peer guidance intervention.
                                    </p>
                                </div>
                                <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                                    <select 
                                        value={moduleFocus}
                                        onChange={(e) => setModuleFocus(e.target.value)}
                                        className="text-[10px] font-bold bg-white border border-slate-200 rounded-lg px-3 py-1 outline-none text-[#002147] cursor-pointer"
                                    >
                                        <option value="All Modules">All Modules</option>
                                        {modules.map(m => (
                                            <option key={m.moduleName} value={m.moduleName}>{m.moduleName}</option>
                                        ))}
                                    </select>
                                    <div className="flex items-center px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-wider text-[#002147] gap-2 shadow-sm">
                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                        Expert View
                                    </div>
                                </div>
                            </div>

                            {/* Period Selector Grid */}
                            <div className="flex flex-wrap gap-2 mb-8">
                                {[1, 2, 3, 4].map(y => (
                                    [1, 2].map(s => (
                                        <button
                                            key={`${y}-${s}`}
                                            onClick={() => {
                                                setSelectedYear(y.toString());
                                                setSelectedSemester(s.toString());
                                            }}
                                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                                selectedYear === y.toString() && selectedSemester === s.toString()
                                                    ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20"
                                                    : "bg-white text-slate-500 border-slate-200 hover:border-orange-200 hover:text-orange-600"
                                            }`}
                                        >
                                            Y{y}S{s}
                                        </button>
                                    ))
                                ))}
                            </div>

                            {loadingConfusion ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-48 bg-slate-50 border border-slate-100 rounded-[2rem] animate-pulse"></div>
                                    ))}
                                </div>
                            ) : confusionData.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {confusionData.map((data, i) => (
                                        <TopicConfusionCard
                                            key={i}
                                            topic={data.topic}
                                            module={data.module}
                                            confusionScore={data.confusionScore}
                                            unresolvedQuestions={data.unresolvedQuestions}
                                            totalQuestions={data.totalQuestions}
                                            difficultyScore={data.difficultyScore}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-[2.5rem]">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4 border border-slate-100 shadow-sm">
                                        <Thermometer size={24} />
                                    </div>
                                    <h4 className="text-lg font-bold text-[#002147]">No significant confusion detected</h4>
                                    <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium">Your peers seem to be following the course content smoothly.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "academic" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <AcademicBrowser
                            defaultYear={user.year}
                            defaultSemester={user.semester}
                            user={user}
                            setActiveTab={setActiveTab}
                        />
                    </div>
                )}

                {activeTab === "qa" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <AcademicBrowser
                            defaultYear={user.year || 1}
                            defaultSemester={user.semester || 1}
                            user={user}
                            initialView="qa"
                            initialQaFilter="unanswered"
                            setActiveTab={setActiveTab}
                        />
                    </div>
                )}

                {activeTab === "profile" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <ProfileSection
                            user={user}
                            onUpdate={() => { }}
                            onDelete={onLogout}
                        />
                    </div>
                )}

                {activeTab === "resources" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <MyResources user={user} />
                    </div>
                )}
            </main>

            <style jsx global>{`
                @keyframes pulse-subtle {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.05); }
                }
                .animate-pulse-subtle {
                    animation: pulse-subtle 3s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
}
