"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StudentSidebar from "@/components/student/StudentSidebar";
import AcademicBrowser from "@/components/student/AcademicBrowser";
import ProfileSection from "@/components/student/ProfileSection";
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
  User
} from "lucide-react";

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
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
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-[#002147]">
              Welcome back, <span className="text-[#4DA8DA]">{user.userId}</span>
            </h1>
            <p className="text-slate-500 font-medium">
              {user.role === "student" 
                ? `Continue your ${user.year || 1}st year studies` 
                : `Manage your ${user.role} workspace`}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all shadow-sm">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
            </button>

            <div className="flex items-center gap-3 bg-white pl-1.5 pr-4 py-1.5 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-[#002147] flex items-center justify-center text-white font-bold text-sm">
                {user.userId?.[0]?.toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-[13px] font-bold text-[#002147] leading-none">{user.userId}</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Trust Score", value: "850", icon: ShieldCheck, color: "text-[#4DA8DA]" },
                { label: "Answers", value: "12", icon: MessageSquare, color: "text-[#4DA8DA]" },
                { label: "Points", value: "2.4k", icon: Star, color: "text-[#4DA8DA]" },
                { label: "Helper Rank", value: "#42", icon: Award, color: "text-[#4DA8DA]" },
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                   <div className="flex justify-between items-center mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-[#4DA8DA]/5 ${stat.color} flex items-center justify-center`}>
                      <stat.icon size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded-md">
                      Stats
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-[#002147]">{stat.value}</h3>
                </div>
              ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Left Column: Modules & Action */}
              <div className="xl:col-span-2 space-y-8">
                <section>
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-xl font-bold text-[#002147]">Current Modules</h3>
                    <button 
                      onClick={() => setActiveTab("academic")}
                      className="text-[#4DA8DA] font-bold text-sm hover:underline flex items-center gap-1"
                    >
                      View All <ChevronRight size={14} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                            SOFT-10{i}
                          </span>
                          <BookOpen size={18} className="text-slate-300 group-hover:text-[#4DA8DA] transition-colors" />
                        </div>
                        <h4 className="text-lg font-bold text-[#002147] mb-2">Software Engineering {i}</h4>
                        <p className="text-slate-500 text-sm mb-6 line-clamp-2">
                          Master the principles of software architecture and design patterns.
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                          <div className="flex -space-x-2">
                           <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-50 flex items-center justify-center text-[9px] font-bold text-[#4DA8DA]">L1</div>
                           <div className="w-8 h-8 rounded-full border-2 border-white bg-orange-50 flex items-center justify-center text-[9px] font-bold text-[#FF9F1C]">L2</div>
                          </div>
                          <button className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-[#002147] hover:text-white transition-all">
                            <ArrowRight size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="bg-[#002147] p-8 rounded-3xl text-white relative overflow-hidden group">
                  <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">Stuck on a problem?</h3>
                      <p className="text-blue-100 text-sm mb-6 max-w-sm">Our AI-powered assistant and elite helpers are ready to guide you.</p>
                      <button 
                        onClick={() => setActiveTab("qa")}
                        className="px-8 py-3 bg-[#FF9F1C] hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/10 active:scale-95"
                      >
                        Ask Question
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
                      <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                            {helper.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#002147]">{helper.name}</p>
                            <p className="text-[11px] text-slate-400 font-semibold">{helper.points} pts</p>
                          </div>
                        </div>
                        <span className={`text-[11px] font-bold px-2 py-1 rounded-md ${i === 0 ? "bg-orange-50 text-orange-600" : "bg-slate-100 text-slate-500"}`}>
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

        {/* Placeholder tabs */}
        {(activeTab === "resources" || activeTab === "qa") && (
          <div className="bg-white p-12 py-20 rounded-3xl border border-slate-200 border-dashed text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-8">
              <Zap size={32} />
            </div>
            <h3 className="text-2xl font-bold text-[#002147] mb-3">Module Integration</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">
              We're polishing this section to focus on Year {user.year || 1} Semester {user.semester || 1} content.
            </p>
            <button 
              onClick={() => setActiveTab("academic")}
              className="px-8 py-3.5 bg-[#002147] text-white rounded-xl font-bold text-sm hover:translate-y-[-2px] transition-all shadow-md active:scale-95"
            >
              Academic Hub
            </button>
          </div>
        )}
      </main>

      {/* Mobile Nav Placeholder */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full h-20 bg-white border-t border-slate-200 flex items-center justify-around px-6 z-[100]">
        {[LayoutDashboard, GraduationCap, MessageSquare, User].map((Icon, i) => (
          <button key={i} className="p-3 text-slate-400 hover:text-[#002147] transition-colors">
            <Icon size={24} />
          </button>
        ))}
      </div>

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
    </div>
  );
}

