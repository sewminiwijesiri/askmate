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
    Users,
    Bell,
    Activity,
    Award,
    Thermometer,
    HelpCircle
} from "lucide-react";

export default function LecturerSidebar({ activeTab, setActiveTab, user, onLogout }) {
    const menuItems = [
        { id: "dashboard", label: "Lecturer Overview", icon: LayoutDashboard },
        { id: "modules", label: "Module Management", icon: BookOpen },
        { id: "resources", label: "Course Materials", icon: FileText },
        { id: "students", label: "Unanswered Question", icon: HelpCircle },
        { id: "qa", label: "Q&A Consulting", icon: MessageSquare },
        { id: "heatmap", label: "Confusion Heatmap", icon: Thermometer },
        { id: "profile", label: "My Profile", icon: User },
    ];

    return (
        <aside className="fixed left-0 top-0 h-full w-64 z-50 hidden lg:flex flex-col bg-[#E2EEFF] transition-all duration-300 border-r border-blue-100">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer group">
                    <div className="w-10 h-10 rounded-xl bg-[#002147] flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
                        <GraduationCap className="text-white" size={22} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[#002147] tracking-tight">ASKmate</h2>
                        <div className="flex items-center gap-1.5 opacity-80 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-orange-600">Lecturer Portal</p>
                        </div>
                    </div>
                </div>

                <nav className="space-y-1.5">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all relative group overflow-hidden ${activeTab === item.id
                                ? "bg-white text-[#002147] shadow-sm"
                                : "text-slate-500 hover:bg-white/50 hover:text-slate-800"
                                }`}
                        >
                            <div className="w-5 flex items-center justify-center relative z-10">
                                <item.icon
                                    size={18}
                                    className={activeTab === item.id ? "text-[#002147]" : "text-slate-400 group-hover:text-slate-600 transition-colors"}
                                />
                            </div>
                            <span className={`text-[13px] flex-1 text-left leading-tight relative z-10 ${activeTab === item.id ? 'font-bold' : ''}`}>
                                {item.label}
                            </span>

                            {activeTab === item.id && (
                                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[#FF9F1C]"></div>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-auto p-6 space-y-4">
                {/* System Status / Stats small card */}
                <div className="p-5 bg-white/60 rounded-2xl border border-white relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                        <Activity size={80} className="text-[#002147]" />
                    </div>
                    <div className="flex items-center justify-between mb-3 relative z-10">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Weekly Activity
                        </p>
                        <Activity size={14} className="text-[#FF9F1C]" />
                    </div>
                    <p className="text-lg font-bold text-[#002147] mb-1 relative z-10">High</p>
                    <p className="text-[10px] text-slate-500 font-semibold relative z-10">
                        12 new questions answered
                    </p>
                </div>

                <button
                    onClick={onLogout}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all font-bold text-[13px] border border-transparent hover:border-rose-100 group"
                >
                    <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Secure Logout</span>
                </button>
            </div>
        </aside>
    );
}
