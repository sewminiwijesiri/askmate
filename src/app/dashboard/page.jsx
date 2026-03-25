"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StudentSidebar from "@/components/student/StudentSidebar";
import AcademicBrowser from "@/components/student/AcademicBrowser";
import ProfileSection from "@/components/student/ProfileSection";
import MyResources from "@/components/student/MyResources";
import RemindersSection from "@/components/student/RemindersSection";
import LecturerDashboard from "@/components/lecturer/LecturerDashboard";
import {
  Bell,
  Search,
  Zap,
  Award,
  Clock,
  ChevronRight,
  MessageSquare,
  BookOpen,
  Plus,
  TrendingUp,
  Star,
  Users,
  ShieldCheck,
  ArrowRight,
  LayoutDashboard,
  GraduationCap,
  User,
  Brain,
  Trophy,
  Hourglass,
  MessageCircle,
  Activity
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [modules, setModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(userData));
  }, [router]);

  useEffect(() => {
    if (user && activeTab === "dashboard") {
      fetchCurrentModules();
    }
  }, [user, activeTab]);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("loginStateChange"));
    router.push("/");
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-[#002147]/10 border-t-[#FF9F1C] rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing Portal...</p>
        </div>
      </div>
    );
  }

  if (user.role === "lecturer") {
    return <LecturerDashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-blue-100">
      <StudentSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen p-6 md:p-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          {activeTab === "dashboard" ? (
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-[#002147] flex flex-wrap items-center gap-3">
                Welcome back, <span className="text-[#4DA8DA]">{user.userId}</span>
                <span className={`text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-[0.15em] font-black border shadow-sm ${user.role === 'helper' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                  user.role === 'student' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    'bg-slate-50 text-slate-600 border-slate-100'
                  }`}>
                  {user.role}
                </span>
              </h1>
              <p className="text-slate-500 font-medium">
                {user.role === "student"
                  ? (() => {
                    const yr = parseInt(String(user.year).replace(/\D/g, "")) || 1;
                    return `Continue your ${yr}${yr === 1 ? "st" : yr === 2 ? "nd" : yr === 3 ? "rd" : "th"} year studies`;
                  })()
                  : `Manage your ${user.role} workspace`}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-[#4DA8DA] capitalize">
                {activeTab === "academic" ? "Academic Hub" :
                  activeTab === "resources" ? "My Resources" :
                  activeTab === "reminders" ? "Reminders" :
                    activeTab === "profile" ? "Student Profile" :
                      activeTab === "qa" ? (user.role === "helper" ? "Recommend Questions" : "Consultation Hub") : activeTab}
              </h1>
              <p className="text-slate-500 font-medium">
                Student Portal • {activeTab === "academic" ? "Browse Knowledge" :
                  activeTab === "resources" ? "Manage Contributions" :
                  activeTab === "reminders" ? "Academic Deadlines" :
                    activeTab === "profile" ? "Account Settings" :
                      activeTab === "qa" ? (user.role === "helper" ? "Share Your Expertise" : "Expert Help") : "Workspace"}
              </p>
            </div>
          )}

          <div className="flex items-center gap-4">
            <NotificationBell user={user} />

            <div className="flex items-center gap-3 bg-white pl-1.5 pr-4 py-1.5 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-[#002147] flex items-center justify-center text-white font-bold text-sm">
                {user.userId?.[0]?.toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-[13px] font-bold text-[#002147] leading-none">{user.userId}</p>
                <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${user.role === 'helper' ? 'text-orange-500' : 'text-slate-400'
                  }`}>{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(user.role === "helper" ? [
                { label: "🧠 Questions Answered", value: "24", icon: Brain, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
                { label: "⭐ Reputation Points", value: "1.2k", icon: Star, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
                { label: "🏆 Rank", value: "#12", icon: Trophy, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
                { label: "⏳ Pending Recommended Questions", value: "5", icon: Hourglass, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
              ] : [
                { label: "Trust Score", value: "850", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
                { label: "Answers", value: "12", icon: MessageSquare, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
                { label: "Points", value: "2.4k", icon: Star, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
                { label: "Helper Rank", value: "#42", icon: Award, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
              ]).map((stat, i) => (
                <div key={i} className={`${stat.bg} border ${stat.border} p-7 rounded-[28px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[160px]`}>
                  <div className="flex justify-between items-start">
                    <div className={`w-12 h-12 rounded-2xl bg-white shadow-sm ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon size={24} />
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.15em] bg-slate-50/50 px-3 py-1.5 rounded-full border border-slate-100">
                      Live Stats
                    </span>
                  </div>
                  <div className="mt-6">
                    <p className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider opacity-80">{stat.label}</p>
                    <h3 className="text-3xl font-extrabold text-[#002147] tracking-tight">{stat.value}</h3>
                  </div>
                  {/* Subtle background decoration */}
                  <div className={`absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500`}>
                    <stat.icon size={80} />
                  </div>
                </div>
              ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Left Column: Modules & Action */}
              <div className="xl:col-span-2 space-y-8">
                <section>
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-xl font-bold text-[#002147]">
                      {user.role === "helper" ? "📘 My Skilled Modules" : "Current Modules"}
                    </h3>
                    <button
                      onClick={() => setActiveTab("academic")}
                      className="text-[#4DA8DA] font-bold text-sm hover:underline flex items-center gap-1"
                    >
                      {user.role === "helper" ? "Manage Skills" : "View All"} <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {modulesLoading ? (
                      Array(2).fill(0).map((_, i) => (
                        <div key={i} className="bg-white border border-slate-100 p-6 rounded-2xl animate-pulse">
                          <div className="flex justify-between items-start mb-4">
                            <div className="w-16 h-5 bg-slate-100 rounded"></div>
                            <div className="w-5 h-5 bg-slate-100 rounded"></div>
                          </div>
                          <div className="w-3/4 h-6 bg-slate-100 rounded mb-2"></div>
                          <div className="w-full h-4 bg-slate-50 rounded mb-1"></div>
                          <div className="w-2/3 h-4 bg-slate-50 rounded mb-6"></div>
                          <div className="pt-4 border-t border-slate-50 flex justify-between">
                            <div className="flex -space-x-2">
                              <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white"></div>
                              <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white"></div>
                            </div>
                            <div className="w-8 h-8 bg-slate-50 rounded"></div>
                          </div>
                        </div>
                      ))
                    ) : modules.length > 0 ? (
                      modules.map((module, i) => (
                        <div key={module._id} className={`bg-white border ${i === 0 ? 'border-blue-100 hover:border-blue-200' : 'border-orange-100 hover:border-orange-200'} p-6 rounded-2xl hover:shadow-md transition-all group relative overflow-hidden`}>
                          <div className={`absolute top-0 left-0 w-1 h-full ${i === 0 ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                          <div className="flex justify-between items-start mb-4">
                            <span className={`px-2.5 py-1 ${i === 0 ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'} rounded-lg text-[10px] font-bold uppercase tracking-wider`}>
                              {module.moduleCode}
                            </span>
                            <BookOpen size={18} className={`text-slate-300 group-hover:${i === 0 ? 'text-blue-500' : 'text-orange-500'} transition-colors`} />
                          </div>
                          <h4 className="text-lg font-bold text-[#002147] mb-2">{module.moduleName}</h4>

                          {user.role === "helper" ? (
                            <div className="grid grid-cols-2 gap-3 mb-6">
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                                <div className="flex items-center gap-2 mb-1">
                                  <MessageSquare size={12} className="text-blue-500" />
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Answers</span>
                                </div>
                                <p className="text-lg font-black text-[#002147] leading-none">{module.answersCount || Math.floor(Math.random() * 15) + 5}</p>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                                <div className="flex items-center gap-2 mb-1">
                                  <Star size={12} className="text-orange-500" />
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rating</span>
                                </div>
                                <p className="text-lg font-black text-[#002147] leading-none">{(4 + Math.random()).toFixed(1)}</p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-slate-500 text-sm mb-6 line-clamp-2">
                              {module.description || `Master the principles of ${module.moduleName}.`}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            {user.role === "helper" ? (
                              <button
                                onClick={() => setActiveTab("academic")}
                                className="w-full py-2.5 bg-[#002147] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#4DA8DA] transition-all shadow-sm flex items-center justify-center gap-2 group/btn"
                              >
                                Manage Skills
                                <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                              </button>
                            ) : (
                              <>
                                <div className="flex -space-x-2">
                                  <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-50 flex items-center justify-center text-[9px] font-bold text-[#4DA8DA]">L1</div>
                                  <div className="w-8 h-8 rounded-full border-2 border-white bg-orange-50 flex items-center justify-center text-[9px] font-bold text-[#FF9F1C]">L2</div>
                                </div>
                                <button
                                  onClick={() => {
                                    // Logic to navigate to module in academic hub can be added here if needed
                                    setActiveTab("academic");
                                  }}
                                  className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-[#002147] hover:text-white transition-all"
                                >
                                  <ArrowRight size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 py-10 text-center bg-white border border-slate-100 rounded-2xl">
                        <BookOpen size={32} className="text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 font-bold text-sm">No modules found for your current semester.</p>
                      </div>
                    )}
                  </div>
                </section>



                <div className="bg-[#002147] p-8 rounded-3xl text-white relative overflow-hidden group">
                  <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">{user.role === 'helper' ? 'Ready to share expertise?' : 'Stuck on a problem?'}</h3>
                      <p className="text-blue-100 text-sm mb-6 max-w-sm">
                        {user.role === 'helper'
                          ? 'Browse unanswered questions in your skilled modules and build your reputation today.'
                          : 'Our AI-powered assistant and elite helpers are ready to guide you.'}
                      </p>
                      <button
                        onClick={() => setActiveTab("qa")}
                        className="px-8 py-3 bg-[#FF9F1C] hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/10 active:scale-95"
                      >
                        {user.role === 'helper' ? 'Answer Questions' : 'Ask Question'}
                      </button>
                    </div>
                    <div className="hidden sm:flex w-32 h-32 bg-white/5 rounded-2xl border border-white/10 items-center justify-center transform rotate-6 border-dashed group-hover:rotate-0 transition-transform">
                      <Zap size={48} className="text-[#FF9F1C]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Leaderboard & Extra */}
              <div className="space-y-8">
                <div className="bg-white border border-slate-200 p-8 rounded-2xl">
                  <h3 className="text-lg font-bold text-[#002147] mb-6 flex items-center gap-2">
                    <TrendingUp size={18} className="text-emerald-500" />
                    Top Helpers
                  </h3>
                  <div className="space-y-4">
                    {[
                      { name: "Alex Chen", points: "4.8k", rank: 1 },
                      { name: "Sarah Smith", points: "3.2k", rank: 2 },
                      { name: "Mike Ross", points: "2.9k", rank: 3 },
                    ].map((helper, i) => (
                      <div key={i} className={`flex items-center justify-between p-3 rounded-xl hover:shadow-sm transition-all cursor-pointer ${i === 0 ? 'bg-orange-50/50' : 'hover:bg-slate-50'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${i === 0 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'} flex items-center justify-center font-bold text-sm`}>
                            {helper.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#002147]">{helper.name}</p>
                            <p className="text-[11px] text-slate-400 font-semibold">{helper.points} pts</p>
                          </div>
                        </div>
                        <span className={`text-[11px] font-bold px-2 py-1 rounded-md ${i === 0 ? "bg-orange-500 text-white" :
                          i === 1 ? "bg-slate-200 text-slate-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                          #{helper.rank}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-6 py-3 bg-slate-50 hover:bg-[#4DA8DA]/10 text-[#002147] font-bold text-xs uppercase tracking-wider rounded-xl transition-all">
                    Full Leaderboard
                  </button>
                </div>

                <div className="bg-orange-50 border border-orange-100 p-8 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-orange-500 shadow-sm mb-4">
                    <Clock size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-[#002147] mb-1">Study Session</h3>
                  <p className="text-slate-500 text-sm mb-6">Join 24 other students currently studying SE.</p>
                  <button className="w-full py-3 bg-white text-[#FF9F1C] border border-orange-200 hover:bg-orange-100 font-bold text-xs uppercase tracking-wider rounded-xl transition-all">
                    Join Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "academic" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AcademicBrowser
              defaultYear={user.year}
              defaultSemester={user.semester}
              user={user}
            />
          </div>
        )}

        {activeTab === "profile" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <ProfileSection
              user={user}
              onUpdate={(updatedUser) => setUser(updatedUser)}
              onDelete={handleLogout}
            />
          </div>
        )}

        {activeTab === "reminders" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <RemindersSection user={user} />
          </div>
        )}

        {/* Placeholder tabs */}
        {activeTab === "resources" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <MyResources user={user} />
          </div>
        )}

        {activeTab === "qa" && (
          <div className="bg-white p-12 py-20 rounded-3xl border border-slate-200 border-dashed text-center animate-in fade-in zoom-in-95 duration-500">
            <div className={`w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center ${user.role === 'helper' ? 'text-blue-400' : 'text-slate-300'} mx-auto mb-8`}>
              {user.role === 'helper' ? <Brain size={32} /> : <Zap size={32} />}
            </div>
            <h3 className="text-2xl font-bold text-[#002147] mb-3">
              {user.role === 'helper' ? 'Recommended Questions Hub' : 'Consultation Hub'}
            </h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">
              {user.role === 'helper'
                ? "We're curating the best questions for you to help other students build your reputation."
                : `We're preparing a space for you to ask questions and get expert advice for your Year ${parseInt(String(user.year).replace(/\D/g, "")) || 1} studies.`}
            </p>
            <button
              onClick={() => setActiveTab(user.role === 'helper' ? 'dashboard' : 'academic')}
              className="px-8 py-3.5 bg-[#002147] text-white rounded-xl font-bold text-sm hover:translate-y-[-2px] transition-all shadow-md active:scale-95"
            >
              {user.role === 'helper' ? 'Dashboard' : 'Academic Hub'}
            </button>
          </div>
        )}
      </main>

      {/* Mobile Nav Placeholder */}
      < div className="lg:hidden fixed bottom-0 left-0 w-full h-20 bg-white border-t border-slate-200 flex items-center justify-around px-6 z-[100]" >
        {
          [LayoutDashboard, GraduationCap, MessageSquare, User].map((Icon, i) => (
            <button key={i} className="p-3 text-slate-400 hover:text-[#002147] transition-colors">
              <Icon size={24} />
            </button>
          ))
        }
      </div >

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background-color: #f8fafc;
          -webkit-font-smoothing: antialiased;
        }

        /* Smooth page entrance */
        main {
           animation: fadeIn 0.8s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div >
  );
}

