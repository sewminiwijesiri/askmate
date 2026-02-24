"use client";

import { 
  Home, 
  BookOpen, 
  MessageSquare, 
  FileText, 
  User, 
  Settings, 
  LogOut, 
  GraduationCap,
  LayoutDashboard,
  Award,
  Zap
} from "lucide-react";

export default function StudentSidebar({ activeTab, setActiveTab, user, onLogout }) {
  const menuItems = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "academic", label: "Academic Hub", icon: GraduationCap },
    { id: "resources", label: "Resources", icon: FileText },
    { id: "qa", label: "Ask & Answer", icon: MessageSquare },
    { id: "profile", label: "My Profile", icon: User },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r border-slate-200/60 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] hidden lg:flex flex-col">
      <div className="p-10">
        <div className="flex items-center gap-4 mb-12 px-2 hover:scale-105 transition-transform duration-300 cursor-pointer">
          <div className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-tr from-[#002147] to-[#004a9f] flex items-center justify-center shadow-xl shadow-blue-900/20 ring-4 ring-blue-50">
            <GraduationCap className="text-white" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#002147] tracking-tight">ASKmate</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF9F1C] animate-pulse"></div>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Student Portal</p>
            </div>
          </div>
        </div>

        <nav className="space-y-2">
          <div className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
            Navigation
          </div>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-300 relative group ${
                activeTab === item.id
                  ? "bg-[#002147] text-white shadow-2xl shadow-blue-900/10 scale-[1.02]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-[#002147]"
              }`}
            >
              <item.icon 
                size={20} 
                className={activeTab === item.id ? "text-white" : "text-slate-400 group-hover:text-[#002147] transition-colors"} 
              />
              <span className="text-sm">{item.label}</span>
              {activeTab === item.id && (
                <div className="absolute right-6 w-1.5 h-1.5 rounded-full bg-[#FF9F1C] shadow-[0_0_8px_rgba(251,146,60,0.6)]"></div>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-10 space-y-4">
        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Growth</p>
              <p className="text-xs font-black text-[#002147]">Premium Helper</p>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="w-2/3 h-full bg-[#FF9F1C] rounded-full"></div>
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-3">67% to next level</p>
        </div>

        <button 
          onClick={onLogout}
          className="flex items-center justify-center gap-3 w-full px-6 py-4 rounded-2xl text-rose-500 bg-rose-50/50 hover:bg-rose-500 hover:text-white transition-all duration-300 border border-rose-100/50 font-bold text-sm group"
        >
          <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
          <span>Exit Portal</span>
        </button>
      </div>
    </aside>
  );
}
