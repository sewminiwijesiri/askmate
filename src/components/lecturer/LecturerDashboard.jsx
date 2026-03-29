"use client";

import { useState, useEffect } from "react";
import LecturerSidebar from "./LecturerSidebar";
import LecturerMaterials from "./LecturerMaterials";
import ProfileSection from "@/components/student/ProfileSection";
import AcademicBrowser from "@/components/student/AcademicBrowser";
import {
    Bell,
    BookOpen,
    Clock,
    Users,
    CheckCircle,
    Plus,
    FileText,
    BarChart,
    Search,
    MessageSquare,
    TrendingUp,
    Award,
    AlertCircle,
    Thermometer
} from "lucide-react";
import TopicConfusionCard from "@/components/analytics/TopicConfusionCard";

export default function LecturerDashboard({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [dashData, setDashData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confusionData, setConfusionData] = useState([]);
    const [loadingConfusion, setLoadingConfusion] = useState(false);
    const [selectedYear, setSelectedYear] = useState("1");
    const [selectedSemester, setSelectedSemester] = useState("1");
    const [moduleFocus, setModuleFocus] = useState("All Modules");

    useEffect(() => {
        if (activeTab === "dashboard") {
            setLoading(true);
            fetch("/api/lecturer/dashboard")
                .then(res => res.json())
                .then(resData => {
                    if (resData.success) {
                        setDashData(resData.data);
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Dashboard fetch error:", err);
                    setLoading(false);
                });
        }
    }, [activeTab]);

    useEffect(() => {
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

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-orange-100">
            <LecturerSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                user={user}
                onLogout={onLogout}
            />

            <main className="lg:ml-64 min-h-screen p-6 md:p-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    {activeTab === "dashboard" ? (
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold text-[#002147] flex flex-wrap items-center gap-3">
                                Welcome back, Lecturer <span className="text-[#FF9F1C]">{user.name || user.userId}</span>
                                <span className="text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-[0.15em] font-black border shadow-sm bg-orange-50 text-orange-600 border-orange-100">
                                    {user.role}
                                </span>
                            </h1>
                            <p className="text-slate-500 font-medium">
                                Manage your modules, monitor students, and track engagement.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold text-[#FF9F1C] capitalize">
                                {activeTab === "modules" ? "Module Management" :
                                    activeTab === "resources" ? "Course Materials" :
                                        activeTab === "students" ? "Student Engagement" :
                                            activeTab === "qa" ? "Consultation Hub" :
                                                activeTab === "heatmap" ? "Confusion Analytics" :
                                                    activeTab === "profile" ? "Lecturer Profile" : activeTab}
                            </h1>
                            <p className="text-slate-500 font-medium">
                                Lecturer Portal • {activeTab === "modules" ? "View and edit classes" :
                                    activeTab === "resources" ? "Upload and manage materials" :
                                        activeTab === "students" ? "Track performance metrics" :
                                            activeTab === "heatmap" ? "Identify difficult academic areas" :
                                                activeTab === "profile" ? "Account Settings" : "Workspace"}
                            </p>
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <button className="relative w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-orange-500 transition-all shadow-sm">
                            <Bell size={20} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
                        </button>

                        <div className="flex items-center gap-3 bg-white pl-1.5 pr-4 py-1.5 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-orange-200 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-[#001730] flex items-center justify-center text-white font-bold text-sm">
                                {(user.name || user.userId || "L")[0].toUpperCase()}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-[13px] font-bold text-[#002147] leading-none">{user.userId}</p>
                                <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5 text-orange-500">
                                    Faculty
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {activeTab === "dashboard" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* KPI Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: "Active Modules", value: dashData ? dashData.stats.activeModules : "-", icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
                                { label: "Total Students", value: dashData ? dashData.stats.totalStudents : "-", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
                                { label: "Pending Queries", value: dashData ? dashData.stats.pendingQueries : "-", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
                                { label: "Avg. Engagement", value: dashData ? dashData.stats.engagement : "-", icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
                            ].map((stat, i) => (
                                <div key={i} className={`${stat.bg} border ${stat.border} p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-between`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-10 h-10 rounded-xl bg-white shadow-sm ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                            <stat.icon size={20} />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-extrabold text-[#002147] tracking-tight">{stat.value}</h3>
                                        <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{stat.label}</p>
                                    </div>
                                    <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <stat.icon size={64} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left col - 2/3 width */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Modules View */}
                                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-[#002147] flex items-center gap-2">
                                            <BookOpen size={20} className="text-orange-500" />
                                            Active Modules Stream
                                        </h3>
                                        <button className="text-sm font-bold text-blue-600 hover:text-blue-800">View All</button>
                                    </div>

                                    <div className="space-y-4">
                                        {loading ? (
                                            <div className="text-center p-8 text-slate-500 font-bold border rounded-xl animate-pulse bg-slate-50">Synchronizing Module Data...</div>
                                        ) : dashData?.activeModules?.length > 0 ? (
                                            dashData.activeModules.map((mod, i) => (
                                                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-orange-200 hover:shadow-sm transition-all gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center font-bold text-orange-600 text-sm border border-orange-100 shadow-sm">
                                                            {mod.code.slice(0, 2)}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-[#002147]">{mod.code} - {mod.name}</h4>
                                                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                                                                <span className="flex items-center gap-1"><Users size={12} /> {mod.students} Enrolled</span>
                                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                                <span className="flex items-center gap-1 text-rose-500"><MessageSquare size={12} /> {mod.queries} Queries</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-2 sm:w-32">
                                                        <div className="flex justify-between text-xs font-bold text-slate-500">
                                                            <span>Syllabus</span>
                                                            <span>{mod.progress}%</span>
                                                        </div>
                                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-orange-500 rounded-full" style={{ width: `${mod.progress}%` }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center p-6 text-slate-500 font-bold border border-slate-100 rounded-xl bg-slate-50">
                                                No active modules found.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Resources Quick Add */}
                                <div className="bg-[#001730] rounded-2xl p-8 relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-orange-500/20 transition-all"></div>
                                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-2">Share Course Material</h3>
                                            <p className="text-slate-400 text-sm max-w-md">
                                                Upload lecture slides, reading materials, or assignments. They will be automatically processed by the AI Assistant for student queries.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab("resources")}
                                            className="px-6 py-3 bg-[#FF9F1C] hover:bg-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-transform active:scale-95 flex items-center gap-2 whitespace-nowrap"
                                        >
                                            <Plus size={18} /> Upload Resource
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right col - 1/3 width */}
                            <div className="space-y-8">
                                {/* Top Helpers in class */}
                                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-[#002147] mb-4 flex items-center gap-2">
                                        <Award size={18} className="text-emerald-500" />
                                        Platform Top Peers
                                    </h3>
                                    <p className="text-xs text-slate-500 mb-4 font-medium">Students providing the most valuable answers across the platform.</p>

                                    <div className="space-y-3">
                                        {loading ? (
                                            <div className="text-center p-4 text-slate-500 font-bold border rounded-xl animate-pulse bg-slate-50">Syncing rankings...</div>
                                        ) : dashData?.topPeers?.length > 0 ? (
                                            dashData.topPeers.map((helper, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-[#002147] text-white flex items-center justify-center font-bold text-xs uppercase">
                                                            {(helper.name || "U")[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-[#002147] leading-tight">{helper.name}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold">{helper.id}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                                        {helper.pts} pts
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center p-4 text-slate-500 font-bold border border-slate-100 rounded-xl bg-slate-50 text-xs">
                                                No peers found.
                                            </div>
                                        )}
                                    </div>
                                    <button className="w-full mt-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors">
                                        View Leaderboard
                                    </button>
                                </div>

                                {/* Notifications */}
                                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-[#002147] mb-4 flex items-center gap-2">
                                        <Bell size={18} className="text-blue-500" />
                                        Recent Activity
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 mt-1.5 rounded-full bg-orange-500 shrink-0"></div>
                                            <div>
                                                <p className="text-sm font-bold text-[#002147]">High unread query volume</p>
                                                <p className="text-xs text-slate-500 mt-0.5">Platform has {dashData?.stats?.pendingQueries || 0} unanswered student queries.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                                            <div>
                                                <p className="text-sm font-bold text-[#002147]">System Health</p>
                                                <p className="text-xs text-slate-500 mt-0.5">Automated knowledge agents are running normally.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0"></div>
                                            <div>
                                                <p className="text-sm font-bold text-[#002147]">Module Integration</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{dashData?.stats?.activeModules || 0} active modules tracked locally.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "heatmap" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* Confusion Heatmap Section */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-[#002147] flex items-center gap-2">
                                        <Thermometer size={24} className="text-orange-500" />
                                        {moduleFocus === "All Modules" ? `Y${selectedYear}S${selectedSemester} Module Heatmap` : `${moduleFocus} Topics`}
                                    </h3>
                                    <p className="text-slate-500 text-sm font-medium">
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
                                        {dashData?.activeModules?.map(m => (
                                            <option key={m.name} value={m.name}>{m.name}</option>
                                        ))}
                                    </select>
                                    <div className="flex items-center px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-wider text-[#002147] gap-2 shadow-sm">
                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                        Real-time Analytics
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
                                            className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                                selectedYear === y.toString() && selectedSemester === s.toString()
                                                    ? "bg-[#FF9F1C] text-white border-[#FF9F1C] shadow-lg shadow-orange-500/20"
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
                                        <div key={i} className="h-48 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse"></div>
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
                                <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4 border border-slate-100">
                                        <Thermometer size={24} />
                                    </div>
                                    <h4 className="text-lg font-bold text-[#002147]">No significant confusion detected</h4>
                                    <p className="text-slate-500 text-sm max-w-xs mx-auto">Great! Your students seem to be following the course content smoothly.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Placeholder for other tabs */}
                {activeTab !== "dashboard" && activeTab !== "profile" && activeTab !== "resources" && activeTab !== "qa" && activeTab !== "heatmap" && (
                    <div className="bg-white p-12 py-20 rounded-3xl border border-slate-200 border-dashed text-center animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 mx-auto mb-8">
                            {activeTab === "modules" ? <BookOpen size={32} /> :
                                <Users size={32} />}
                        </div>
                        <h3 className="text-2xl font-bold text-[#002147] mb-3 capitalize">
                            {activeTab} Workspace
                        </h3>
                        <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">
                            This section is reserved for dedicated {activeTab} management functions for lecturers. Tools and analytics will appear here.
                        </p>
                        <button
                            onClick={() => setActiveTab("dashboard")}
                            className="px-8 py-3.5 bg-[#001730] text-white rounded-xl font-bold text-sm hover:translate-y-[-2px] transition-all shadow-md active:scale-95"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                )}

                {activeTab === "resources" && (
                    <LecturerMaterials user={user} />
                )}

                {activeTab === "qa" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <AcademicBrowser
                            defaultYear={1}
                            defaultSemester={1}
                            user={user}
                            initialView="qa"
                            setActiveTab={setActiveTab}
                        />
                    </div>
                )}

                {activeTab === "profile" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <ProfileSection
                            user={user}
                            onUpdate={() => { }} // Hooked up properly in full system
                            onDelete={onLogout}
                        />
                    </div>
                )}

            </main>

            <style jsx global>{`
        body { background-color: #f8fafc; }
      `}</style>
        </div>
    );
}
