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
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-50 hidden lg:flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-[#002147] flex items-center justify-center shadow-lg shadow-blue-200">
            <GraduationCap className="text-white" size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#002147] tracking-tight">ASKmate</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user.role} Portal</p>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all relative group ${
                activeTab === item.id
                  ? "bg-[#002147]/5 text-[#002147]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <item.icon 
                size={18} 
                className={activeTab === item.id ? "text-[#002147]" : "text-slate-400 group-hover:text-slate-600 transition-colors"} 
              />
              <span className="text-[13px]">{item.label}</span>
              {activeTab === item.id && (
                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[#FF9F1C]"></div>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-4">
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Level Progress</p>
            <Zap size={14} className="text-[#FF9F1C]" />
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="w-2/3 h-full bg-[#FF9F1C] rounded-full"></div>
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-2">67% to next level</p>
        </div>

        <button 
          onClick={onLogout}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all font-bold text-[13px] border border-transparent hover:border-rose-100"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
