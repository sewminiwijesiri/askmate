"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StudentSidebar from "@/components/student/StudentSidebar";
import AcademicBrowser from "@/components/student/AcademicBrowser";
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
          <div className="w-16 h-16 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin mb-4"></div>
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
      <main className="lg:ml-72 p-6 md:p-10 lg:p-12 xl:p-16">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-[#002147] tracking-tight">
              Hello, <span className="text-[#4DA8DA]">{user.userId}</span> 👋
            </h1>
            <p className="text-slate-500 font-semibold text-lg">Ready to conquer your {user.year || 1}st year studies?</p>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative w-14 h-14 rounded-2xl bg-white border border-slate-200/60 flex items-center justify-center text-slate-400 hover:text-[#002147] hover:border-blue-200 hover:shadow-lg transition-all shadow-sm group">
              <Bell size={24} />
              <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full group-hover:scale-125 transition-transform"></span>
            </button>

            <div className="flex items-center gap-5 bg-white p-2.5 pr-8 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-xl transition-all cursor-pointer group">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#002147] to-[#004a9f] flex items-center justify-center font-black text-white border border-blue-200 shadow-inner group-hover:scale-110 transition-transform">
                  {user.userId?.[0]?.toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="hidden sm:block">
                <p className="text-[14px] font-black text-[#002147] leading-none mb-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{user.userId}</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Level {user.year || 1} Student</p>
              </div>
            </div>
          </div>
        </header>

        {activeTab === "dashboard" && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Trust Score", value: "850", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Answers", value: "12", icon: MessageSquare, color: "text-orange-600", bg: "bg-orange-50" },
                { label: "Points", value: "2.4k", icon: Star, color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Helper Rank", value: "#42", icon: Award, color: "text-purple-600", bg: "bg-purple-50" },
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-slate-200/60 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
                   <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <stat.icon size={24} />
                    </div>
                    <div className="text-slate-300 group-hover:text-slate-600 transition-colors">
                      <TrendingUp size={18} />
                    </div>
                  </div>
                  <p className="text-[11px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">{stat.label}</p>
                  <h3 className="text-4xl font-black text-[#002147] tracking-tighter">{stat.value}</h3>
                </div>
              ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
              {/* Recent Activity */}
              <div className="xl:col-span-2 space-y-8">
                <div className="flex justify-between items-center px-2">
                  <h3 className="text-2xl font-black text-[#002147]">Current Modules</h3>
                  <button 
                    onClick={() => setActiveTab("academic")}
                    className="text-blue-600 font-black text-sm hover:underline flex items-center gap-1"
                  >
                    View All Hub <ChevronRight size={16} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {[1, 2].map((i) => (
                    <div key={i} className="group bg-white border border-slate-200/60 p-8 rounded-[2.5rem] hover:shadow-2xl transition-all duration-500 border-l-[6px] border-l-blue-600">
                      <div className="flex justify-between items-start mb-6">
                        <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                          Module Code
                        </div>
                        <BookOpen size={20} className="text-slate-200 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <h4 className="text-xl font-black text-[#002147] mb-4 group-hover:text-blue-600 transition-colors">Software Engineering {i}</h4>
                      <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                        Master the principles of software architecture, design patterns, and agile methodologies.
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-3">
                          {[1, 2, 3].map((j) => (
                            <div key={j} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
                              U{j}
                            </div>
                          ))}
                        </div>
                        <button className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#002147] hover:bg-[#002147] hover:text-white transition-all group-hover:scale-110">
                          <ArrowRight size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-[#002147] p-10 rounded-[3rem] text-white relative overflow-hidden group shadow-2xl shadow-blue-900/20">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full -mr-32 -mt-32 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-1">
                      <h3 className="text-3xl font-black mb-4">Stuck on a problem?</h3>
                      <p className="text-blue-100 font-medium mb-8 text-lg">Our AI-powered assistant and elite helpers are ready to help you thrive in your semester.</p>
                      <button 
                        onClick={() => setActiveTab("qa")}
                        className="px-10 py-4 bg-[#FF9F1C] hover:bg-orange-600 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-orange-500/20 active:scale-95"
                      >
                        Ask a Question
                      </button>
                    </div>
                    <div className="w-48 h-48 bg-white/5 rounded-[2.5rem] border border-white/10 flex items-center justify-center transform rotate-6 border-dashed group-hover:rotate-12 transition-transform duration-500">
                      <Zap size={64} className="text-[#FF9F1C]" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-10">
                <div className="bg-white border border-slate-200/60 p-10 rounded-[3rem] shadow-sm">
                  <h3 className="text-xl font-black text-[#002147] mb-8 flex items-center gap-3">
                    <TrendingUp size={20} className="text-emerald-500" />
                    Top Helpers
                  </h3>
                  <div className="space-y-6">
                    {[
                      { name: "Alex Chen", points: "4.8k", rank: 1 },
                      { name: "Sarah Smith", points: "3.2k", rank: 2 },
                      { name: "Mike Ross", points: "2.9k", rank: 3 },
                    ].map((helper, i) => (
                      <div key={i} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all border border-transparent group-hover:border-blue-100">
                            {helper.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-black text-[#002147]">{helper.name}</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{helper.points} Points</p>
                          </div>
                        </div>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${i === 0 ? "bg-orange-50 text-orange-600" : "bg-slate-50 text-slate-400"}`}>
                          #{helper.rank}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-10 py-4 bg-slate-50 hover:bg-slate-100 text-[#002147] font-black text-xs uppercase tracking-[0.15em] rounded-2xl transition-all">
                    View Leaderboard
                  </button>
                </div>

                <div className="bg-[#FF9F1C] p-10 rounded-[3rem] text-white shadow-xl shadow-orange-500/20">
                  <Clock size={32} className="mb-6" />
                  <h3 className="text-2xl font-black mb-2">Study Session</h3>
                  <p className="text-orange-950/60 font-bold mb-8 text-sm leading-relaxed">Focus mode is active. Join 24 other students currently studying Software Engineering.</p>
                  <button className="w-full py-4 bg-white/20 hover:bg-white/30 text-white font-black text-xs uppercase tracking-[0.15em] rounded-2xl transition-all border border-white/30">
                    Join Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "academic" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <AcademicBrowser 
              defaultYear={user.year} 
              defaultSemester={user.semester} 
              user={user}
            />
          </div>
        )}

        {/* Placeholder tabs */}
        {(activeTab === "resources" || activeTab === "qa" || activeTab === "profile") && (
          <div className="bg-white p-20 rounded-[3rem] border border-slate-200 border-dashed text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-10">
              <Zap size={48} />
            </div>
            <h3 className="text-3xl font-black text-[#002147] mb-4">Module Integration</h3>
            <p className="text-slate-500 font-semibold max-w-md mx-auto mb-12 text-lg">
              We're polishing this section to focus on Year {user.year || 1} Semester {user.semester || 1} content. Please check the Academic Hub in the meantime.
            </p>
            <button 
              onClick={() => setActiveTab("academic")}
              className="px-12 py-5 bg-[#002147] text-white rounded-[2rem] font-black text-sm hover:translate-y-[-4px] transition-all shadow-xl shadow-blue-900/10 active:scale-95"
            >
              Take me to Academic Hub
            </button>
          </div>
        )}
      </main>

      {/* Mobile Nav Placeholder */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full h-20 bg-white border-t border-slate-200 flex items-center justify-around px-6 z-[100]">
        {[LayoutDashboard, GraduationCap, MessageSquare, User].map((Icon, i) => (
          <button key={i} className="p-3 text-slate-400 hover:text-blue-600 transition-colors">
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

