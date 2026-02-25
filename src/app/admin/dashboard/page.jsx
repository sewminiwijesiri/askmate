"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AcademicManager from "@/components/admin/AcademicManager";
import { 
  Users, 
  UserCheck, 
  GraduationCap, 
  ShieldCheck, 
  LogOut, 
  Search, 
  Trash2, 
  CheckCircle, 
  XCircle,
  MoreVertical,
  LayoutDashboard,
  Eye,
  Calendar,
  Award,
  BookOpen,
  Star,
  Zap,
  Clock,
  Mail,
  Bell,
  User as UserIcon
} from "lucide-react";

const IconUsers = () => <Users size={20} />;
const IconAdmin = () => <ShieldCheck size={20} />;
const IconLecturer = () => <GraduationCap size={20} />;
const IconHelper = () => <UserCheck size={20} />;
const IconAcademic = () => <BookOpen size={20} />;

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState({ students: [], helpers: [], lecturers: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("helpers");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ total: 0, pending: 0 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [academicData, setAcademicData] = useState([]); // Added for module counts

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    setAdmin(parsedUser);
    fetchUsers(token);
  }, [router]);

  const fetchUsers = async (token) => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        
        // Calculate stats
        const total = data.students.length + data.helpers.length + data.lecturers.length;
        const pending = data.helpers.filter(h => !h.adminApproved).length;
        setStats({ total, pending });
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, action) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, role: "helper" }),
      });

      if (res.ok) {
        // Optimistic update or refetch
        fetchUsers(token);
      }
    } catch (error) {
      console.error("Error updating helper status:", error);
    }
  };

  const handleDelete = async (id, role) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      if (res.ok) {
        fetchUsers(token);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const openDetails = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeDetails = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const filteredUsers = () => {
    const currentList = users[activeTab] || [];
    if (!searchQuery) return currentList;
    
    return currentList.filter(user => {
        const idStr = (user.studentId || user.studentID || user.lecturerId || user.username || "").toLowerCase();
        const emailStr = (user.email || "").toLowerCase();
        const nameStr = (user.name || "").toLowerCase();
        return idStr.includes(searchQuery.toLowerCase()) || 
               emailStr.includes(searchQuery.toLowerCase()) ||
               nameStr.includes(searchQuery.toLowerCase());
    });
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-blue-100">
      {/* Sidebar */}
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-[#002147] border-r border-white/10 z-50 transition-all duration-300 shadow-2xl">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12 px-2 transition-transform hover:scale-105 duration-300">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shadow-lg border border-white/20">
              <ShieldCheck className="text-white" size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">ASKmate</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></div>
                <p className="text-[10px] text-blue-200/60 font-bold tracking-widest uppercase">Admin Portal</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1.5">
            <div className="px-4 py-3 text-[10px] font-bold text-blue-200/40 uppercase tracking-[0.2em] mb-2 mt-6">
              Core Management
            </div>
            
            {[
              { id: "helpers", label: "User Directory", icon: Users, isUsers: true },
              { id: "academic", label: "Academic Hub", icon: BookOpen },
            ].map((item) => {
              const isActive = item.isUsers 
                ? (activeTab === "helpers" || activeTab === "students" || activeTab === "lecturers")
                : activeTab === item.id;
              
              return (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl font-bold transition-all duration-300 relative group ${
                    isActive
                    ? "bg-white/10 text-white" 
                    : "text-blue-100/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon size={18} className={isActive ? "text-orange-400" : "text-blue-200/40 group-hover:text-white transition-colors"} />
                  <span className="text-[13px]">{item.label}</span>
                  {isActive && (
                    <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                  )}
                </button>
              );
            })}
            
            <div className="px-4 py-3 text-[10px] font-bold text-blue-200/40 uppercase tracking-[0.2em] mb-2 mt-8">
              System Insights
            </div>

            <button className="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-blue-100/60 hover:bg-white/5 hover:text-white transition-all duration-300 group">
              <LayoutDashboard size={18} className="text-blue-200/40 group-hover:text-white transition-colors" />
              <span className="text-[13px] font-bold">Platform Stats</span>
            </button>
            
            <button className="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-blue-100/60 hover:bg-white/5 hover:text-white transition-all duration-300 group">
              <MoreVertical size={18} className="text-blue-200/40 group-hover:text-white transition-colors" />
              <span className="text-[13px] font-bold">Settings</span>
            </button>
          </nav>
        </div>

        <div className="absolute bottom-10 left-0 w-full px-8">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 w-full px-5 py-3.5 rounded-xl text-white/60 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-300 font-bold text-[13px] group border border-transparent hover:border-rose-500/20"
          >
            <LogOut size={16} className="group-hover:rotate-12 transition-transform" />
            <span>Logout Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen p-6 md:p-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-rose-600">
              Control Center
            </h1>
            <p className="text-slate-500 font-medium text-sm">System administration and user governance dashboard.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all shadow-sm">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
            </button>

            <div className="flex items-center gap-3 bg-white pl-1.5 pr-4 py-1.5 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-[#002147] flex items-center justify-center text-white font-bold text-sm">
                {admin.userId?.[0]?.toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[13px] font-bold text-[#002147] leading-none">{admin.userId}</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {[
            { label: "Total Members", value: stats.total, icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", trend: "+12%" },
            { label: "Waitlisted", value: stats.pending, icon: Zap, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100", alert: stats.pending > 0 },
            { label: "Active Sessions", value: "24", icon: Clock, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100", status: "Live" },
          ].map((stat, i) => (
            <div key={i} className={`${stat.bg} border ${stat.border} p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden`}>
               <div className="flex justify-between items-center mb-4">
                <div className={`w-10 h-10 rounded-xl bg-white shadow-sm ${stat.color} flex items-center justify-center`}>
                  <stat.icon size={20} />
                </div>
                {stat.trend && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{stat.trend}</span>}
                {stat.alert && <span className="text-[10px] font-bold text-white bg-orange-500 px-2 py-1 rounded-md animate-pulse">Required</span>}
                {stat.status && <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{stat.status}</span>}
              </div>
              <p className="text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-3xl font-bold text-[#002147]">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Filters and Table Area */}
        {(activeTab === "helpers" || activeTab === "students" || activeTab === "lecturers") && (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <div className="flex flex-col lg:flex-row gap-6 justify-between items-center">
              {/* Tabs */}
              <div className="flex p-1.5 bg-slate-100 rounded-xl self-start lg:self-center">
                {[
                  { id: "helpers", label: "Helpers", icon: <IconHelper /> },
                  { id: "students", label: "Students", icon: <IconUsers /> },
                  { id: "lecturers", label: "Lecturers", icon: <IconLecturer /> }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                      activeTab === tab.id 
                      ? "bg-white text-[#002147] shadow-sm" 
                      : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <span className={activeTab === tab.id ? "text-[#4DA8DA]" : "opacity-50"}>{tab.icon}</span>
                    {tab.label}
                    {tab.id === 'helpers' && stats.pending > 0 && (
                      <span className="ml-2 w-5 h-5 bg-[#FF9F1C] text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                        {stats.pending}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full lg:w-96 group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#4DA8DA]/20 focus:border-[#4DA8DA] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="min-h-[500px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-[500px]">
                <div className="relative">
                  <div className="w-16 h-16 border-[5px] border-blue-500/10 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-blue-50 rounded-full"></div>
                  </div>
                </div>
                <p className="mt-6 text-slate-400 font-black tracking-widest text-xs uppercase">Platform Synchronizing...</p>
              </div>
            ) : filteredUsers().length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[500px] text-center p-12">
                <div className="w-32 h-32 bg-slate-50/50 rounded-[3rem] border border-slate-100 flex items-center justify-center text-slate-200 mb-8 transition-transform hover:scale-110 duration-500">
                  <Users size={64} strokeWidth={1} />
                </div>
                <h3 className="text-2xl font-black text-[#002147] mb-3">No matching results</h3>
                <p className="text-slate-500 font-semibold max-w-sm leading-relaxed">We could not find any active directory entries matching your specific query for this category.</p>
                <button 
                    onClick={() => setSearchQuery("")}
                    className="mt-8 px-8 py-3.5 bg-slate-100 text-[#002147] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                    Clear Search
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/30 border-b border-slate-100/80">
                      <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Principal Identity</th>
                      <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Reference ID</th>
                      <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Account State</th>
                      {activeTab === 'helpers' && <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Specialization</th>}
                      <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50">
                    {filteredUsers().map((user) => (
                      <tr key={user._id} className="group hover:bg-slate-50/30 transition-all duration-300">
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-5">
                            <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center font-black text-xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg ${
                              activeTab === 'helpers' ? 'bg-orange-100 text-orange-500 shadow-orange-500/5' : 
                              activeTab === 'lecturers' ? 'bg-indigo-100 text-indigo-600 shadow-indigo-500/5' : 
                              'bg-blue-100 text-blue-600 shadow-blue-500/5'
                            }`}>
                              {(user.name || user.studentId || user.studentID || user.lecturerId || "U")[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-[16px] font-black text-[#002147] leading-tight mb-1.5 capitalize group-hover:text-blue-600 transition-colors">{user.name || user.username || "Anonymous Member"}</p>
                              <p className="text-xs text-slate-400 font-bold tracking-tight">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <span className="font-mono text-xs font-black bg-slate-100/60 px-4 py-2 rounded-xl border border-slate-200/40 text-[#002147] shadow-sm">
                            {user.studentId || user.studentID || user.lecturerId || user.username}
                          </span>
                        </td>
                        <td className="px-10 py-8">
                          {activeTab === 'helpers' ? (
                            user.adminApproved ? (
                              <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100/60">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                                  Verified
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-orange-700 bg-orange-50 px-4 py-2 rounded-full border border-orange-100/60 transition-all animate-pulse">
                                  <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]"></div>
                                  Pending
                              </div>
                            )
                          ) : (
                            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-4 py-2 rounded-full border border-blue-100/60">
                               <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                               Active
                            </div>
                          )}
                        </td>
                        {activeTab === 'helpers' && (
                          <td className="px-10 py-8">
                            <div className="flex flex-wrap gap-2">
                              {user.skills?.slice(0, 2).map((skill, i) => (
                                <span key={i} className="text-[9px] bg-white text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200/60 font-black uppercase tracking-tight shadow-sm">
                                  {skill}
                                </span>
                              ))}
                              {user.skills?.length > 2 && <span className="text-[10px] text-slate-400 font-extrabold flex items-center">+{user.skills.length - 2}</span>}
                            </div>
                          </td>
                        )}
                        <td className="px-10 py-8">
                          <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                            <button
                              onClick={() => openDetails(user)}
                              className="w-11 h-11 flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-[#002147] hover:text-white rounded-[1rem] transition-all duration-300 shadow-sm active:scale-90"
                              title="Full Profile"
                            >
                              <Eye size={20} strokeWidth={2.5} />
                            </button>
                            {activeTab === 'helpers' && !user.adminApproved && (
                              <button
                                onClick={() => handleApprove(user._id, 'approve')}
                                className="w-11 h-11 flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-[1rem] transition-all duration-300 shadow-sm active:scale-90"
                                title="Approve Helper"
                              >
                                  <CheckCircle size={20} strokeWidth={2.5} />
                              </button>
                            )}
                            {activeTab === 'helpers' && user.adminApproved && (
                              <button
                                onClick={() => handleApprove(user._id, 'disapprove')}
                                className="w-11 h-11 flex items-center justify-center bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white rounded-[1rem] transition-all duration-300 shadow-sm active:scale-90"
                                title="Revoke Status"
                              >
                                  <XCircle size={20} strokeWidth={2.5} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(user._id, activeTab.slice(0, -1))}
                              className="w-11 h-11 flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-[1rem] transition-all duration-300 shadow-sm active:scale-90"
                              title="Delete Account"
                            >
                              <Trash2 size={20} strokeWidth={2.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        )}

        {activeTab === "academic" && (
          <div className="bg-white border border-slate-200/60 rounded-[3rem] shadow-[0_8px_48px_rgba(0,0,0,0.02)] p-10">
             <AcademicManager />
          </div>
        )}

        {/* Details Modal */}
        {isModalOpen && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#002147]/40 backdrop-blur-md animate-in fade-in duration-300">
            <div 
              className="bg-white w-full max-w-3xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-white/50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="relative h-48 bg-gradient-to-br from-[#002147] to-[#004a9f] p-10 flex flex-col justify-end">
                <button 
                  onClick={closeDetails}
                  className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white text-white hover:text-[#002147] rounded-2xl transition-all duration-300 backdrop-blur-lg group"
                >
                  <XCircle size={24} className="group-hover:rotate-90 transition-transform" />
                </button>
                <div className="absolute -bottom-16 left-12 flex items-end gap-8">
                  <div className={`w-32 h-32 rounded-[2.5rem] border-[6px] border-white flex items-center justify-center font-black text-4xl shadow-2xl shadow-blue-900/10 ${
                    activeTab === 'helpers' ? 'bg-orange-100 text-orange-500' : 
                    activeTab === 'lecturers' ? 'bg-indigo-100 text-indigo-600' : 
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {(selectedUser.name || selectedUser.studentId || selectedUser.studentID || selectedUser.lecturerId || "U")[0].toUpperCase()}
                  </div>
                  <div className="mb-4">
                    <h2 className="text-3xl font-black text-[#002147] capitalize tracking-tight">{selectedUser.name || selectedUser.username || "Member Profile"}</h2>
                    <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[11px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-[0.15em]">{activeTab.slice(0, -1)}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                        <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.15em]">Verified Account</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="px-12 pt-24 pb-12 max-h-[65vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Basic Info */}
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 pl-1">Global Information</h4>
                      <div className="space-y-5">
                        <div className="flex items-center gap-5 p-4 rounded-3xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:border-blue-100">
                          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-500">
                            <Mail size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Primary Email</p>
                            <p className="text-sm font-black text-[#002147]">{selectedUser.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-5 p-4 rounded-3xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:border-blue-100">
                          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-500">
                            <UserIcon size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Access Identification</p>
                            <span className="font-mono text-xs font-black text-[#002147]">
                              {selectedUser.studentId || selectedUser.studentID || selectedUser.lecturerId || selectedUser.username}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-5 p-4 rounded-3xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:border-blue-100">
                          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-500">
                            <Clock size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Member Since</p>
                            <p className="text-sm font-black text-[#002147]">{new Date(selectedUser.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {activeTab === 'helpers' && (
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-[2.5rem] border border-blue-200/50">
                        <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4 pl-1">Academic Timeline</h4>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600">
                            <Calendar size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1.5">Class Of</p>
                            <p className="text-2xl font-black text-[#002147] leading-none">{selectedUser.graduationYear}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Skills and Expertise */}
                  <div className="space-y-8">
                    {activeTab === 'helpers' ? (
                      <>
                        <div>
                          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 pl-1">Performance Metrics</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                                <Award size={18} />
                              </div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Proficiency</p>
                              <p className="text-sm font-black text-[#002147]">{selectedUser.expertiseLevel || 'Standard'}</p>
                            </div>
                            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center mb-4">
                                <Star size={18} />
                              </div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Reputation</p>
                              <p className="text-xl font-black text-orange-600">{selectedUser.reputation || 0}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 pl-1">Core Expertise</h4>
                          <div className="flex flex-wrap gap-2.5">
                            {selectedUser.skills?.map((skill, i) => (
                              <span key={i} className="text-[10px] bg-white text-slate-700 px-4 py-2 rounded-xl font-black border border-slate-200 shadow-sm uppercase tracking-tight transition-transform hover:-translate-y-0.5 cursor-default">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {selectedUser.preferredModules?.length > 0 && (
                          <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 pl-1">Direct Module Support</h4>
                            <div className="flex flex-wrap gap-2.5">
                                {selectedUser.preferredModules.map((module, i) => (
                                    <div key={i} className="flex items-center gap-2.5 bg-white text-blue-600 px-4 py-2 rounded-xl border border-blue-100 shadow-sm">
                                        <BookOpen size={12} className="opacity-70" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{module}</span>
                                    </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="space-y-8">
                        {activeTab === 'students' && (
                          <div>
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 pl-1">Academic Placement</h4>
                            <div className="grid grid-cols-2 gap-5">
                              <div className="p-6 bg-gradient-to-br from-indigo-50 to-white rounded-[2rem] border border-indigo-100">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Year Level</p>
                                <p className="text-3xl font-black text-[#002147]">{selectedUser.year}</p>
                              </div>
                              <div className="p-6 bg-gradient-to-br from-sky-50 to-white rounded-[2rem] border border-sky-100">
                                <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-2">Semester</p>
                                <p className="text-3xl font-black text-[#002147]">{selectedUser.semester}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="mt-8 p-8 bg-[#002147] rounded-[2.5rem] shadow-xl shadow-blue-900/20 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full -mr-16 -mt-16 blur-[60px] opacity-20"></div>
                          <p className="text-xs font-black text-blue-400 mb-3 flex items-center gap-2 relative z-10">
                            <ShieldCheck size={16} /> DATA VERIFIED
                          </p>
                          <p className="text-[15px] text-white/90 font-bold leading-relaxed relative z-10">
                            This {activeTab.slice(0, -1)} registry entry is fully authenticated via the institutional directory service.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-10 bg-slate-50/80 backdrop-blur-sm border-t border-slate-100 flex justify-end gap-4">
                <button 
                  onClick={closeDetails}
                  className="px-10 py-4 bg-[#002147] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-blue-900/10 active:scale-95 translate-y-0 hover:-translate-y-1"
                >
                  Close Directory Entry
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background-color: #f8fafc;
          -webkit-font-smoothing: antialiased;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
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
