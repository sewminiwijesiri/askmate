"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  User as UserIcon,
  Shapes
} from "lucide-react";
import AcademicManager from "@/components/admin/AcademicManager";

const IconUsers = () => <Users size={20} />;
const IconAdmin = () => <ShieldCheck size={20} />;
const IconLecturer = () => <GraduationCap size={20} />;
const IconHelper = () => <UserCheck size={20} />;
const IconAcademic = () => <Shapes size={20} />;

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
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-50 transition-all duration-300 shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#002147] to-[#003d82] flex items-center justify-center shadow-lg shadow-blue-900/10">
              <IconAdmin />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#002147]">ASKmate</h2>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Management</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab("helpers")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all group ${
                activeTab === "helpers" || activeTab === "students" || activeTab === "lecturers"
                ? "bg-blue-50 text-[#002147]" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <IconUsers />
              <span>User Management</span>
            </button>
            
            <button 
              onClick={() => setActiveTab("academic")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all group ${
                activeTab === "academic"
                ? "bg-blue-50 text-[#002147]" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <IconAcademic />
              <span>Academic Structure</span>
            </button>
            
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-800 transition-all group">
              <div className="opacity-50 group-hover:opacity-100 transition-opacity">
                <LayoutDashboard size={20} />
              </div>
              <span className="font-semibold">Analytics</span>
            </button>
            
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-800 transition-all group">
              <div className="opacity-50 group-hover:opacity-100 transition-opacity">
                <MoreVertical size={20} />
              </div>
              <span className="font-semibold">Settings</span>
            </button>
          </nav>
        </div>

        <div className="absolute bottom-8 left-0 w-full px-6">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
          >
            <LogOut size={20} />
            <span className="font-bold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8 lg:p-12">
        <header className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-[#002147] mb-2">Admin Dashboard</h1>
            <p className="text-slate-500 font-medium">Welcome back! Manage your platform users and approval requests.</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-1.5 pr-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center font-bold text-[#002147] shadow-inner border border-blue-100">
              {admin.userId?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-[#002147] leading-tight">{admin.userId}</p>
              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter">Chief Administrator</p>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-blue-100 transition-all duration-500"></div>
            <p className="text-sm font-bold text-slate-400 mb-1 uppercase tracking-wider">Total Users</p>
            <div className="flex items-end gap-3">
              <h3 className="text-4xl font-extrabold text-[#002147]">{stats.total}</h3>
              <span className="text-emerald-500 text-sm font-bold mb-1.5 bg-emerald-50 px-2 py-0.5 rounded-lg">+12.5%</span>
            </div>
          </div>
          
          <div className="bg-white border border-slate-200 p-6 rounded-3xl relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-orange-100 transition-all duration-500"></div>
            <p className="text-sm font-bold text-slate-400 mb-1 uppercase tracking-wider">Pending Approvals</p>
            <div className="flex items-end gap-3">
              <h3 className="text-4xl font-extrabold text-[#002147]">{stats.pending}</h3>
              {stats.pending > 0 && (
                <span className="text-orange-500 text-xs font-bold mb-2 flex items-center gap-1.5 animate-pulse bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                  Review Required
                </span>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-sky-100 transition-all duration-500"></div>
            <p className="text-sm font-bold text-slate-400 mb-1 uppercase tracking-wider">Active Sessions</p>
            <div className="flex items-end gap-3">
              <h3 className="text-4xl font-extrabold text-[#002147]">24</h3>
              <span className="text-slate-400 text-sm font-medium mb-1.5 italic">Real-time</span>
            </div>
          </div>
        </div>

        {/* Filters and Table Area */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <div className="flex flex-col lg:flex-row gap-6 justify-between items-center">
              {/* Tabs */}
              <div className="flex p-1.5 bg-slate-100 rounded-2xl self-start lg:self-center">
                {[
                  { id: "helpers", label: "Helpers", icon: <IconHelper /> },
                  { id: "students", label: "Students", icon: <IconUsers /> },
                  { id: "lecturers", label: "Lecturers", icon: <IconLecturer /> }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                      activeTab === tab.id 
                      ? "bg-white text-[#002147] shadow-sm border border-slate-200/50" 
                      : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <span className={activeTab === tab.id ? "text-blue-500" : "opacity-50"}>{tab.icon}</span>
                    {tab.label}
                    {tab.id === 'helpers' && stats.pending > 0 && (
                      <span className="ml-1 w-5 h-5 bg-[#FF9F1C] text-white rounded-full text-[10px] flex items-center justify-center font-black">
                        {stats.pending}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full lg:w-96 group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder={`Search by name, email or ID...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-slate-700 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Table Container/Academic Manager */}
          <div className="min-h-[400px]">
            {activeTab === "academic" ? (
              <AcademicManager />
            ) : loading ? (
              <div className="flex flex-col items-center justify-center h-[400px]">
                <div className="w-12 h-12 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-bold tracking-tight">Syncing records...</p>
              </div>
            ) : filteredUsers().length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center p-10">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                  <Users size={32} />
                </div>
                <h3 className="text-xl font-extrabold text-[#002147] mb-2">No results found</h3>
                <p className="text-slate-500 font-medium max-w-xs">We couldn't find any {activeTab} matching your current search parameters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Profile Information</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identifier</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                      {activeTab === 'helpers' && <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Core Skills</th>}
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Utility</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredUsers().map((user) => (
                      <tr key={user._id} className="group hover:bg-blue-50/30 transition-all duration-200">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-transform group-hover:scale-110 ${
                              activeTab === 'helpers' ? 'bg-orange-100 text-[#FF9F1C]' : 
                              activeTab === 'lecturers' ? 'bg-blue-100 text-[#002147]' : 
                              'bg-sky-100 text-sky-600'
                            }`}>
                              {(user.name || user.studentId || user.studentID || user.lecturerId || "U")[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-[15px] font-extrabold text-[#002147] leading-none mb-1.5 capitalize">{user.name || user.username || "Registered Member"}</p>
                              <p className="text-xs text-slate-500 font-medium">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="font-mono text-xs font-bold bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-[#002147] shadow-sm">
                            {user.studentId || user.studentID || user.lecturerId || user.username}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          {activeTab === 'helpers' ? (
                            user.adminApproved ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                  Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100 shadow-sm animate-pulse">
                                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                  Awaiting
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                              Verified
                            </span>
                          )}
                        </td>
                        {activeTab === 'helpers' && (
                          <td className="px-8 py-6">
                            <div className="flex flex-wrap gap-1.5">
                              {user.skills?.slice(0, 2).map((skill, i) => (
                                <span key={i} className="text-[9px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md uppercase font-black tracking-tight border border-slate-200/50">
                                  {skill}
                                </span>
                              ))}
                              {user.skills?.length > 2 && <span className="text-[9px] text-slate-400 font-bold">+{user.skills.length - 2}</span>}
                            </div>
                          </td>
                        )}
                        <td className="px-8 py-6">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                            <button
                              onClick={() => openDetails(user)}
                              className="p-2.5 bg-blue-50 text-blue-500 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-95"
                              title="View Full Details"
                            >
                              <Eye size={18} strokeWidth={2.5} />
                            </button>
                            {activeTab === 'helpers' && !user.adminApproved && (
                              <button
                                onClick={() => handleApprove(user._id, 'approve')}
                                className="p-2.5 bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm active:scale-95"
                                title="Approve Identity"
                              >
                                  <CheckCircle size={18} strokeWidth={2.5} />
                              </button>
                            )}
                            {activeTab === 'helpers' && user.adminApproved && (
                              <button
                                onClick={() => handleApprove(user._id, 'disapprove')}
                                className="p-2.5 bg-orange-50 text-orange-500 hover:bg-[#FF9F1C] hover:text-white rounded-xl transition-all shadow-sm active:scale-95"
                                title="Revoke Approval"
                              >
                                  <XCircle size={18} strokeWidth={2.5} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(user._id, activeTab.slice(0, -1))}
                              className="p-2.5 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm active:scale-95"
                              title="Delete Account"
                            >
                              <Trash2 size={18} strokeWidth={2.5} />
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

        {/* Details Modal */}
        {isModalOpen && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="relative h-32 bg-gradient-to-r from-[#002147] to-[#003d82] p-8">
                <button 
                  onClick={closeDetails}
                  className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                >
                  <XCircle size={24} />
                </button>
                <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                  <div className={`w-24 h-24 rounded-3xl border-4 border-white flex items-center justify-center font-black text-3xl shadow-xl ${
                    activeTab === 'helpers' ? 'bg-orange-100 text-[#FF9F1C]' : 
                    activeTab === 'lecturers' ? 'bg-blue-100 text-[#002147]' : 
                    'bg-sky-100 text-sky-600'
                  }`}>
                    {(selectedUser.name || selectedUser.studentId || selectedUser.studentID || selectedUser.lecturerId || "U")[0].toUpperCase()}
                  </div>
                  <div className="mb-2">
                    <h2 className="text-2xl font-black text-[#002147] capitalize">{selectedUser.name || selectedUser.username || "Registered Member"}</h2>
                    <p className="text-slate-500 font-bold text-sm tracking-wide uppercase">{activeTab.slice(0, -1)} Profile</p>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8 pt-16 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Basic Info */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Identification</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-slate-700">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                            <Mail size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 leading-none mb-1">Email Address</p>
                            <p className="text-sm font-bold">{selectedUser.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-slate-700">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                            <UserIcon size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 leading-none mb-1">System Identifier</p>
                            <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-[#002147]">
                              {selectedUser.studentId || selectedUser.studentID || selectedUser.lecturerId || selectedUser.username}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-slate-700">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                            <Clock size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 leading-none mb-1">Member Since</p>
                            <p className="text-sm font-bold">{new Date(selectedUser.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {activeTab === 'helpers' && (
                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Academic Info</h4>
                        <div className="flex items-center gap-3 text-slate-700">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                            <Calendar size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 leading-none mb-1">Graduation Year</p>
                            <p className="text-sm font-extrabold text-[#002147]">{selectedUser.graduationYear}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Skills and Expertise */}
                  <div className="space-y-6">
                    {activeTab === 'helpers' ? (
                      <>
                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Expertise & Status</h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-400">
                                <Award size={16} />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 leading-none mb-1">Proficiency Level</p>
                                <span className={`text-xs font-black uppercase px-2 py-0.5 rounded ${
                                  selectedUser.expertiseLevel === 'Expert' ? 'bg-purple-100 text-purple-600' :
                                  selectedUser.expertiseLevel === 'Intermediate' ? 'bg-blue-100 text-blue-600' :
                                  'bg-slate-100 text-slate-600'
                                }`}>
                                  {selectedUser.expertiseLevel || 'Beginner'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-400">
                                <Star size={16} />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 leading-none mb-1">Platform Reputation</p>
                                <p className="text-sm font-black text-emerald-600">{selectedUser.reputation || 0} Points</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-400">
                                <Zap size={16} />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 leading-none mb-1">Availability</p>
                                <p className="text-sm font-bold">
                                  {selectedUser.availableForUrgentHelp ? 
                                    <span className="text-amber-600">Flash Responder ⚡</span> : 
                                    <span className="text-slate-500">Standard Support</span>
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Core Skillset</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedUser.skills?.map((skill, i) => (
                              <span key={i} className="text-[10px] bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl font-black border border-slate-100 uppercase tracking-tight">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {selectedUser.preferredModules?.length > 0 && (
                          <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Preferred Modules</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedUser.preferredModules.map((module, i) => (
                                <div key={i} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-100">
                                  <BookOpen size={10} />
                                  <span className="text-[10px] font-black uppercase tracking-tight">{module}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div>
                        {activeTab === 'students' && (
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Academic Year</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Year</p>
                                <p className="text-lg font-black text-[#002147]">{selectedUser.year}</p>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Semester</p>
                                <p className="text-lg font-black text-[#002147]">{selectedUser.semester}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="mt-8 p-6 bg-blue-50/50 border border-blue-100 rounded-3xl">
                          <p className="text-xs font-bold text-blue-600 mb-2 flex items-center gap-2">
                            <ShieldCheck size={14} /> Account Status Verified
                          </p>
                          <p className="text-sm text-slate-600 font-medium leading-relaxed">
                            This {activeTab.slice(0, -1)} has a verified academic identity and is currently active on the platform.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={closeDetails}
                  className="px-8 py-3 bg-[#002147] text-white rounded-2xl font-black text-sm hover:bg-[#003d82] transition-all shadow-lg shadow-blue-900/10 active:scale-95"
                >
                  Close Profile
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
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 20px;
          border: 3px solid #f1f5f9;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
