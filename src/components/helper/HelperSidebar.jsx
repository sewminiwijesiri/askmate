"use client";

import {
  Bell,
  Home,
  BookOpen,
  MessageSquare,
  FileText,
  User,
  LogOut,
  GraduationCap,
  LayoutDashboard,
  Star,
  Brain,
  ShieldCheck,
  Award
} from "lucide-react";

export default function HelperSidebar({ activeTab, setActiveTab, user, onLogout }) {
  const menuItems = [
    { id: "dashboard", label: "Helper Overview", icon: LayoutDashboard },
    { id: "academic", label: "Academic Hub", icon: GraduationCap },
    { id: "resources", label: "Resources", icon: FileText },
    { id: "qa", label: "Recommended Hub", icon: Brain },
    { id: "profile", label: "Academic Profile", icon: User },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-72 z-50 hidden lg:flex flex-col bg-[#e0f2fe]/60 backdrop-blur-3xl border-r border-blue-100/50 transition-all duration-300">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-12 px-2 cursor-pointer group">
          <div className="w-12 h-12 rounded-2xl bg-[#002147] flex items-center justify-center shadow-xl shadow-blue-200 group-hover:rotate-12 transition-transform duration-500">
            <GraduationCap className="text-white" size={26} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#002147] tracking-tighter">ASKmate</h2>
            <div className="flex items-center gap-1.5 opacity-80 mt-0.5">
                <ShieldCheck size={10} className="text-orange-500" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">Expert Helper</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-black transition-all relative group overflow-hidden ${activeTab === item.id
                ? "bg-white text-[#002147] shadow-lg shadow-blue-900/5"
                : "text-slate-500 hover:bg-white/40 hover:text-slate-800"
                }`}
            >
              <div className="w-6 flex items-center justify-center relative z-10">
                <item.icon
                  size={20}
                  className={activeTab === item.id ? "text-orange-500" : "text-slate-400 group-hover:text-slate-600 transition-colors"}
                />
              </div>
              <span className={`text-[13px] flex-1 text-left leading-tight tracking-wide relative z-10 ${activeTab === item.id ? 'font-black' : 'font-bold'}`}>
                {item.label}
              </span>

              {activeTab === item.id && (
                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50 animate-pulse"></div>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-8 space-y-5">
        <div className="p-6 bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white shadow-sm hover:shadow-lg transition-all duration-500 group">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Authority Index
            </p>
            <Award size={16} className="text-orange-500 group-hover:scale-125 transition-transform" />
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner flex items-center">
             <div className="h-full w-3/4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full shadow-lg" />
          </div>
          <div className="flex justify-between mt-3">
              <p className="text-[10px] text-slate-500 font-bold">Silver Tier</p>
              <p className="text-[10px] text-orange-600 font-black">750 / 1000</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center justify-center gap-3 w-full px-5 py-4 rounded-2xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all font-black text-xs uppercase tracking-[0.2em] border border-transparent hover:border-rose-100 group shadow-sm hover:shadow-md"
        >
          <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Exit Workspace</span>
        </button>
      </div>
    </aside>
  );
}
