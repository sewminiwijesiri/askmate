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
  X,
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
  const [activeTab, setActiveTab] = useState("stats");
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
    router.push("/");
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
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#002147] text-white z-50 transition-all duration-300 shadow-2xl">
        <div className="flex flex-col h-full">
          <div className="p-8 pt-12">
            <div className="flex items-center gap-3 mb-10 px-2 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight leading-none mb-1">ASKmate</h2>
                <div className="flex items-center gap-1.5 opacity-60">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  <p className="text-[10px] font-bold tracking-widest uppercase">Admin Panel</p>
                </div>
              </div>
            </div>

            <nav className="space-y-1.5">
              <p className="px-4 py-2 text-[10px] font-bold text-blue-300/40 uppercase tracking-[0.2em] mb-2">Main Navigation</p>

              {[
                { id: "stats", label: "Metrics & Logs", icon: LayoutDashboard },
                { id: "helpers", label: "Users & Roles", icon: Users, isUsers: true },
                { id: "academic", label: "Academic Hub", icon: BookOpen },
                { id: "settings", label: "System Config", icon: MoreVertical },
              ].map((item) => {
                const isActive = item.isUsers
                  ? (activeTab === "helpers" || activeTab === "students" || activeTab === "lecturers")
                  : activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 group ${isActive
                      ? "bg-blue-600/10 text-white border border-blue-500/20"
                      : "text-blue-100/50 hover:bg-white/5 hover:text-white"
                      }`}
                  >
                    <item.icon size={18} className={isActive ? "text-blue-400" : "text-blue-100/30 group-hover:text-white transition-colors"} />
                    <span className="text-[13px]">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto p-6 border-t border-white/5">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white text-rose-600 hover:bg-rose-50 transition-all duration-200 font-bold text-[13px] shadow-lg shadow-black/20 group"
            >
              <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 pt-8 pb-4 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              {activeTab === 'stats' ? 'Metrics & Logs' :
                activeTab === 'academic' ? 'Academic Hub' :
                    (activeTab === 'helpers' || activeTab === 'students' || activeTab === 'lecturers') ? 'Users & Roles' :
                      'System Overview'}
            </h1>
            <p className="text-xs text-slate-500 font-medium whitespace-nowrap">Welcome back, {admin.userId}</p>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all shadow-sm">
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 border-2 border-white rounded-full"></span>
            </button>

            <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>

            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-[13px] font-bold text-slate-900 leading-none group-hover:text-indigo-600 transition-colors">{admin.userId}</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1 underline decoration-indigo-200">Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white ring-4 ring-indigo-50 shadow-sm font-bold text-sm">
                {admin.userId?.[0]?.toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 pt-12">

          {/* Stats Overview - Only show on User Management tabs */}
          {(activeTab === "helpers" || activeTab === "students" || activeTab === "lecturers") && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {[
                { label: "Total Members", value: stats.total, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
                { label: "Pending Approval", value: stats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
                { label: "Active Modules", value: "18", icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50" },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} transition-transform group-hover:scale-105`}>
                      <stat.icon size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                      <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* User Directory Section */}
          {(activeTab === "helpers" || activeTab === "students" || activeTab === "lecturers") && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-700">
              <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30">
                <div className="flex flex-col lg:flex-row gap-6 justify-between items-center">
                  {/* Tabs */}
                  <div className="flex p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
                    {[
                      { id: "helpers", label: "Helpers", icon: <IconHelper /> },
                      { id: "students", label: "Students", icon: <IconUsers /> },
                      { id: "lecturers", label: "Lecturers", icon: <IconLecturer /> }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                          }`}
                      >
                        <span className={activeTab === tab.id ? "text-white" : "text-slate-400"}>{tab.icon}</span>
                        {tab.label}
                        {tab.id === 'helpers' && stats.pending > 0 && (
                          <span className={`ml-2 w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black ${activeTab === tab.id ? 'bg-white text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>
                            {stats.pending}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Search */}
                  <div className="relative w-full lg:w-96">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                      <Search size={18} strokeWidth={2.5} />
                    </div>
                    <input
                      type="text"
                      placeholder={`Find a ${activeTab.slice(0, -1)} by name or ID...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-12 pr-4 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-300"
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
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Member</th>
                          <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID Ref</th>
                          <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                          {activeTab === 'helpers' && <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Expertise</th>}
                          <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredUsers().map((user) => (
                          <tr key={user._id} className="group hover:bg-indigo-50/30 transition-all duration-200">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-110 ${activeTab === 'helpers' ? 'bg-amber-100 text-amber-600' :
                                  activeTab === 'lecturers' ? 'bg-indigo-100 text-indigo-600' :
                                    'bg-indigo-50 text-indigo-500'
                                  }`}>
                                  {(user.name || user.username || "U")[0].toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900 leading-tight mb-0.5 group-hover:text-indigo-600 transition-colors">{user.name || user.username || "Anonymous Member"}</p>
                                  <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-100">
                                {user.studentId || user.studentID || user.lecturerId || user.username}
                              </span>
                            </td>
                            <td className="px-10 py-8">
                              {activeTab === 'helpers' ? (
                                user.adminApproved ? (
                                  <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100/60">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    Verified
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-3 py-1 rounded-full border border-orange-100/60">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                                    Pending
                                  </div>
                                )
                              ) : (
                                <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100/60">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
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
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
              <AcademicManager />
            </div>
          )}


          {/* stats Tab Placeholder */}
          {activeTab === "stats" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
                <LayoutDashboard size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Platform Infrastructure Metrics</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto">Full system analytics and traffic distribution models are being synthesized from the core database nodes.</p>
            </div>
          )}

          {/* settings Tab Placeholder */}
          {activeTab === "settings" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                <MoreVertical size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Administrative Configuration</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto">Global system parameters and governance protocols can be refined from this secure terminal access point.</p>
            </div>
          )}

          {/* Details Modal */}
          {isModalOpen && selectedUser && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={closeDetails}>
              <div
                className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-slate-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header/Profile Summary */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between relative bg-gradient-to-r from-indigo-50/50 to-white">
                  <div className="flex items-center gap-6">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-inner ${activeTab === 'helpers' ? 'bg-amber-100 text-amber-600' :
                      activeTab === 'lecturers' ? 'bg-indigo-100 text-indigo-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                      {(selectedUser.name || selectedUser.username || "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{selectedUser.name || selectedUser.username || "Member Details"}</h2>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-bold uppercase tracking-wider border border-indigo-100">
                          {activeTab.slice(0, -1)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                          <span className="text-xs font-medium text-slate-500">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={closeDetails}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Left Column: Essential Info */}
                    <div className="space-y-6">
                      <section>
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Contact & Identity</h4>
                        <div className="space-y-4">
                          <div className="flex gap-4">
                            <Mail size={18} className="text-slate-400 mt-0.5" />
                            <div>
                              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Email Address</p>
                              <p className="text-sm font-medium text-slate-800">{selectedUser.email}</p>
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <UserIcon size={18} className="text-slate-400 mt-0.5" />
                            <div>
                              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Identification</p>
                              <p className="text-sm font-mono font-medium text-slate-800">
                                {selectedUser.studentId || selectedUser.studentID || selectedUser.lecturerId || selectedUser.username}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <Clock size={18} className="text-slate-400 mt-0.5" />
                            <div>
                              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Member Since</p>
                              <p className="text-sm font-medium text-slate-800">{new Date(selectedUser.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</p>
                            </div>
                          </div>
                        </div>
                      </section>

                      {activeTab === 'helpers' && (
                        <section className="pt-4 border-t border-slate-50">
                          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Educational Background</h4>
                          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                            <GraduationCap size={20} className="text-indigo-500" />
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Graduation Class</p>
                              <p className="text-lg font-bold text-slate-800">{selectedUser.graduationYear || '2027'}</p>
                            </div>
                          </div>
                        </section>
                      )}
                    </div>

                    {/* Right Column: Performance & Skills */}
                    <div className="space-y-6">
                      {activeTab === 'helpers' ? (
                        <>
                          <section>
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Performance</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-50 flex flex-col justify-between min-h-[100px]">
                                <Award size={18} className="text-indigo-500" />
                                <div>
                                  <p className="text-[10px] font-bold text-indigo-400 uppercase">Proficiency</p>
                                  <p className="font-bold text-indigo-900">{selectedUser.expertiseLevel || 'Standard'}</p>
                                </div>
                              </div>
                              <div className="p-4 bg-amber-50/30 rounded-2xl border border-amber-50 flex flex-col justify-between min-h-[100px]">
                                <Star size={18} className="text-amber-500" />
                                <div>
                                  <p className="text-[10px] font-bold text-amber-400 uppercase">Reputation</p>
                                  <p className="text-xl font-bold text-amber-700">{selectedUser.reputation || 0}</p>
                                </div>
                              </div>
                            </div>
                          </section>

                          <section>
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Core Expertise</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedUser.skills?.map((skill, i) => (
                                <span key={i} className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:border-indigo-200 hover:text-indigo-600 transition-colors cursor-default">
                                  {skill}
                                </span>
                              ))}
                              {(!selectedUser.skills || selectedUser.skills.length === 0) && (
                                <p className="text-xs text-slate-400 italic">No skills listed</p>
                              )}
                            </div>
                          </section>

                          {selectedUser.preferredModules?.length > 0 && (
                            <section>
                              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Module Support</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedUser.preferredModules.map((module, i) => (
                                  <div key={i} className="flex items-center gap-2 bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-100">
                                    <BookOpen size={12} className="text-slate-400" />
                                    <span className="text-[11px] font-bold tracking-tight">{module}</span>
                                  </div>
                                ))}
                              </div>
                            </section>
                          )}
                        </>
                      ) : (
                        <div className="space-y-6">
                          {activeTab === 'students' && (
                            <section>
                              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Current Placement</h4>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">Year</p>
                                  <p className="text-xl font-bold text-slate-800">{selectedUser.year || '1st'}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">Semester</p>
                                  <p className="text-xl font-bold text-slate-800">{selectedUser.semester || '1st'}</p>
                                </div>
                              </div>
                            </section>
                          )}
                          <div className="p-6 bg-slate-900 rounded-2xl text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full -mr-16 -mt-16 blur-[60px] opacity-20"></div>
                            <div className="flex items-center gap-2 mb-2 text-indigo-400">
                              <ShieldCheck size={16} />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Verified Identity</span>
                            </div>
                            <p className="text-sm font-medium text-slate-300 leading-relaxed relative z-10">
                              This member's information has been authenticated via the system directory.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex justify-end gap-3">
                  <button
                    onClick={closeDetails}
                    className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>
                  {activeTab === 'helpers' && !selectedUser.adminApproved && (
                    <button
                      onClick={() => { handleApprove(selectedUser._id, 'approve'); closeDetails(); }}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      Approve Member
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
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
