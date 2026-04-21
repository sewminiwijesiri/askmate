"use client";

import {
  Bell,
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
  Zap,
  Star,
  Brain,
  Trophy // NEW: Imported Trophy icon for Achievements
} from "lucide-react";
// NEW: Imported Link and usePathname for routing
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StudentSidebar({ activeTab, setActiveTab, user, onLogout }) {
  // NEW: Added usePathname to check the current route
  const pathname = usePathname();

  const menuItems = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "academic", label: "Academic Hub", icon: GraduationCap },
    { id: "resources", label: "Resources", icon: FileText },
    { id: "reminders", label: "Reminders", icon: Bell },
    { id: "qa", label: "Ask & Answer", icon: MessageSquare },
    // NEW: Added Achievements menu item
    { id: "achievements", label: "Achievements", icon: Trophy, href: "/dashboard/achievements" },
    { id: "profile", label: "My Profile", icon: User },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 border-r border-slate-200/50 z-50 hidden lg:flex flex-col transition-colors duration-300 bg-white/60 backdrop-blur-xl">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-[#002147] flex items-center justify-center shadow-lg shadow-blue-200">
            <GraduationCap className="text-white" size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#002147] tracking-tight">ASKmate</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Student Portal</p>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            // NEW: Route detection - active if path matches href or activeTab matches id
            const isActive = item.href ? pathname === item.href : activeTab === item.id;
            
            const btnContent = (
              <>
                <div className="w-5 flex items-center justify-center">
                  <item.icon
                    size={18}
                    className={isActive ? "text-[#FF9F1C]" : "text-slate-400 group-hover:text-slate-600 transition-colors"}
                  />
                </div>
                <span className="text-[13px] flex-1 text-left leading-tight">{item.label}</span>
                {isActive && (
                  <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[#FF9F1C] shadow-[0_0_8px_rgba(255,159,28,0.5)]"></div>
                )}
              </>
            );

            const btnClass = `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all relative group ${isActive
                ? "bg-[#FF9F1C]/10 text-[#FF9F1C]"
                : "text-slate-500 hover:bg-white/40 hover:text-slate-800"
              }`;

            // NEW: Use Link component for items having an href (Achievements)
            if (item.href) {
              return (
                <Link key={item.id} href={item.href} className={btnClass}>
                  {btnContent}
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={btnClass}
              >
                {btnContent}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-4">
        <div className="p-5 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-100/50">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Level Progress
            </p>
            <Zap size={14} className="text-[#FF9F1C]" />
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full w-2/3 bg-[#FF9F1C]"></div>
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-2">
            67% to next level
          </p>
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
