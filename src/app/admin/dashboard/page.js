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
  LayoutDashboard
} from "lucide-react";

const IconUsers = () => <Users size={20} />;
const IconAdmin = () => <ShieldCheck size={20} />;
const IconLecturer = () => <GraduationCap size={20} />;
const IconHelper = () => <UserCheck size={20} />;

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState({ students: [], helpers: [], lecturers: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("helpers");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ total: 0, pending: 0 });

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
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 z-50 transition-all duration-300">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <IconAdmin />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">ASKmate</h2>
              <p className="text-xs text-slate-500 font-medium tracking-wider uppercase">Admin Panel</p>
            </div>
          </div>

          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-600/10 text-indigo-400 font-medium group transition-all border border-indigo-600/20">
              <IconUsers />
              <span>User Management</span>
            </a>
            {/* Placeholders for other nav items */}
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all group">
              <div className="opacity-50 group-hover:opacity-100 transition-opacity">
                <LayoutDashboard size={20} />
              </div>
              <span>Analytics</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all group">
                <div className="opacity-50 group-hover:opacity-100 transition-opacity">
                    <MoreVertical size={20} />
                </div>
              <span>Settings</span>
            </a>
          </nav>
        </div>

        <div className="absolute bottom-8 left-0 w-full px-6">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
            <p className="text-slate-400">Overview and control of all registered platform users.</p>
          </div>
          <div className="flex items-center gap-4 bg-slate-800/40 p-2 rounded-2xl border border-slate-700/50">
            <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center font-bold text-indigo-400 shadow-inner">
              {admin.userId?.[0]?.toUpperCase()}
            </div>
            <div className="pr-4">
              <p className="text-sm font-semibold text-white leading-tight">{admin.userId}</p>
              <p className="text-xs text-indigo-400 font-medium">System Administrator</p>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-600/20 transition-all duration-500"></div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Users</p>
            <div className="flex items-end gap-3">
              <h3 className="text-4xl font-bold text-white">{stats.total}</h3>
              <span className="text-emerald-400 text-sm font-medium mb-1.5">+12.5%</span>
            </div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-amber-600/20 transition-all duration-500"></div>
            <p className="text-sm font-medium text-slate-500 mb-1">Pending Approvals</p>
            <div className="flex items-end gap-3">
              <h3 className="text-4xl font-bold text-white">{stats.pending}</h3>
              <span className="text-amber-400 text-sm font-medium mb-1.5 flex items-center gap-1 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                Action required
              </span>
            </div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-violet-600/20 transition-all duration-500"></div>
            <p className="text-sm font-medium text-slate-500 mb-1">Active Now</p>
            <div className="flex items-end gap-3">
              <h3 className="text-4xl font-bold text-white">4</h3>
              <span className="text-slate-600 text-sm font-medium mb-1.5">Live platform usage</span>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-3xl mb-6">
          <div className="flex flex-col lg:flex-row gap-6 justify-between items-center">
            {/* Tabs */}
            <div className="flex p-1 bg-slate-950/50 rounded-2xl border border-slate-800/50 self-start lg:self-center">
              {[
                { id: "helpers", label: "Helpers", icon: <IconHelper /> },
                { id: "students", label: "Students", icon: <IconUsers /> },
                { id: "lecturers", label: "Lecturers", icon: <IconLecturer /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    activeTab === tab.id 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                    : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className={activeTab === tab.id ? "text-white" : "opacity-50"}>{tab.icon}</span>
                  {tab.label}
                  {tab.id === 'helpers' && stats.pending > 0 && (
                    <span className="ml-1 w-5 h-5 bg-amber-500 text-slate-900 rounded-full text-[10px] flex items-center justify-center font-bold">
                      {stats.pending}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-96 group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder={`Search ${activeTab.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[400px]">
              <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-medium">Loading records...</p>
            </div>
          ) : filteredUsers().length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center p-10">
              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center text-slate-600 mb-6">
                <IconUsers />
              </div>
              <h3 className="text-xl font-bold text-slate-300 mb-2">No {activeTab} found</h3>
              <p className="text-slate-500 max-w-xs">We couldn't find any users matching your current search or filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-950/30 border-b border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Identifier</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    {activeTab === 'helpers' && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Skills</th>}
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredUsers().map((user) => (
                    <tr key={user._id} className="group hover:bg-slate-800/20 transition-all duration-200">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                            activeTab === 'helpers' ? 'bg-amber-500/10 text-amber-500' : 
                            activeTab === 'lecturers' ? 'bg-indigo-500/10 text-indigo-500' : 
                            'bg-violet-500/10 text-violet-500'
                          }`}>
                            {(user.name || user.studentId || user.studentID || user.lecturerId || "U")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white leading-none mb-1 capitalize">{user.name || user.username || "Registered User"}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-mono text-xs bg-slate-950 px-2 py-1 rounded border border-slate-800 text-slate-400">
                          {user.studentId || user.studentID || user.lecturerId || user.username}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {activeTab === 'helpers' ? (
                          user.adminApproved ? (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                Approved
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                Pending
                            </span>
                          )
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-800/50 px-2.5 py-1 rounded-full border border-slate-700">
                            Active
                          </span>
                        )}
                      </td>
                      {activeTab === 'helpers' && (
                        <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-1">
                            {user.skills?.slice(0, 2).map((skill, i) => (
                              <span key={i} className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-tight">
                                {skill}
                              </span>
                            ))}
                            {user.skills?.length > 2 && <span className="text-[10px] text-slate-600">+{user.skills.length - 2} more</span>}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {activeTab === 'helpers' && !user.adminApproved && (
                            <button
                              onClick={() => handleApprove(user._id, 'approve')}
                              className="p-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-lg transition-all"
                              title="Approve Helper"
                            >
                                <CheckCircle size={16} strokeWidth={2.5} />
                            </button>
                          )}
                          {activeTab === 'helpers' && user.adminApproved && (
                            <button
                              onClick={() => handleApprove(user._id, 'disapprove')}
                              className="p-2 bg-amber-600/20 text-amber-400 hover:bg-amber-600 hover:text-white rounded-lg transition-all"
                              title="Disapprove Helper"
                            >
                                <XCircle size={16} strokeWidth={2.5} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(user._id, activeTab.slice(0, -1))}
                            className="p-2 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg transition-all"
                            title="Delete User"
                          >
                            <Trash2 size={16} strokeWidth={2.5} />
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
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0f172a;
        }
        ::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
}
