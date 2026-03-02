"use client";

import { useState, useEffect } from "react";
import {
    FileText,
    Search,
    Plus,
    Edit2,
    Trash2,
    ExternalLink,
    Download,
    Link as LinkIcon,
    File as FileIcon,
    AlertCircle,
    CheckCircle,
    Clock,
    MoreVertical,
    X,
    BookOpen,
    Filter
} from "lucide-react";

export default function MyResources({ user }) {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [editData, setEditData] = useState({ title: "", description: "", category: "Short Note" });
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchMyResources();
    }, [user]);

    const fetchMyResources = async () => {
        if (!user?.userId) return;
        try {
            setLoading(true);
            const res = await fetch(`/api/resources?userId=${user.userId}&status=all`);
            if (res.ok) {
                const data = await res.json();
                setResources(data);
            }
        } catch (error) {
            console.error("Error fetching my resources:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this resource?")) return;
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`/api/resources/${id}?userId=${user.userId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                setResources(resources.filter(r => r._id !== id));
            }
        } catch (error) {
            console.error("Error deleting resource:", error);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        try {
            setIsUpdating(true);
            const res = await fetch(`/api/resources/${editingResource._id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...editData,
                    userId: user.userId
                })
            });

            if (res.ok) {
                fetchMyResources();
                setIsEditOpen(false);
                setEditingResource(null);
            }
        } catch (error) {
            console.error("Error updating resource:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const startEdit = (resource) => {
        setEditingResource(resource);
        setEditData({
            title: resource.title,
            description: resource.description,
            category: resource.category || "Short Note"
        });
        setIsEditOpen(true);
    };

    const filteredResources = resources.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (r.module?.moduleName && r.module.moduleName.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === "all" || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-100 border-t-[#002147] rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading your contributions...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-[#002147] mb-1">My Resource Library</h2>
                    <p className="text-slate-500 font-medium">Manage and track your Shared study materials.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 relative z-10 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search your resources..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
                        />
                    </div>

                    <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                        {['all', 'pending', 'approved', 'rejected'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${statusFilter === status
                                        ? "bg-[#002147] text-white shadow-sm"
                                        : "text-slate-400 hover:text-slate-600"
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Background Decor */}
                <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16"></div>
            </div>

            {filteredResources.length === 0 ? (
                <div className="bg-white p-16 rounded-[2rem] border-2 border-dashed border-slate-100 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-6">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-[#002147] mb-2">No resources found</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8">
                        You haven't uploaded any resources that match your criteria.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map((res) => (
                        <div key={res._id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-200 transition-all group relative flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${res.category === 'YouTube Link' ? 'bg-rose-50 text-rose-500' :
                                        res.category === 'Lecture Note' ? 'bg-emerald-50 text-emerald-500' :
                                            res.category === 'Past Paper' ? 'bg-orange-50 text-orange-500' :
                                                'bg-blue-50 text-blue-500'
                                    }`}>
                                    {res.resourceType === 'link' ? <LinkIcon size={20} /> : <FileIcon size={20} />}
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a href={res.url} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-50 text-slate-400 hover:text-blue-500 rounded-xl transition-all border border-slate-100">
                                        <ExternalLink size={14} />
                                    </a>
                                    {res.resourceType !== 'link' && (
                                        <button
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = res.url;
                                                link.download = res.title || 'download';
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }}
                                            className="p-2.5 bg-slate-50 text-slate-400 hover:text-orange-500 rounded-xl transition-all border border-slate-100"
                                        >
                                            <Download size={14} />
                                        </button>
                                    )}
                                    <button onClick={() => startEdit(res)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-emerald-500 rounded-xl transition-all border border-slate-100">
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(res._id)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all border border-slate-100">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4 flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${res.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            res.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                'bg-rose-50 text-rose-600 border-rose-100'
                                        }`}>
                                        {res.status}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[120px]">
                                        {res.module?.moduleCode || "General"}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-[#002147] mb-2 group-hover:text-blue-600 transition-colors leading-tight">
                                    {res.title}
                                </h3>
                                <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed">
                                    {res.description || "No description provided."}
                                </p>
                            </div>

                            <div className="pt-6 border-t border-slate-100 mt-6 flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <BookOpen size={14} className="text-slate-300" />
                                    <span className="text-[11px] font-bold text-slate-600 truncate">
                                        {res.module?.moduleName || "Unassigned Module"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Clock size={12} />
                                        <span className="text-[10px] font-bold">
                                            {new Date(res.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${res.category === 'YouTube Link' ? 'bg-rose-50 text-rose-600' :
                                            res.category === 'Lecture Note' ? 'bg-emerald-50 text-emerald-600' :
                                                res.category === 'Past Paper' ? 'bg-orange-50 text-orange-600' :
                                                    'bg-blue-50 text-blue-600'
                                        }`}>
                                        {res.category}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {isEditOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-[#002147]">Edit Details</h2>
                            <button
                                onClick={() => setIsEditOpen(false)}
                                className="p-2 rounded-lg hover:bg-slate-50 text-slate-400"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={editData.title}
                                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium focus:outline-none focus:border-blue-500 transition-all"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Category</label>
                                <select
                                    value={editData.category}
                                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="Short Note">Short Note</option>
                                    <option value="Lecture Note">Lecture Note</option>
                                    <option value="YouTube Link">YouTube Link</option>
                                    <option value="Past Paper">Past Paper</option>
                                    <option value="Tutorial">Tutorial</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Description</label>
                                <textarea
                                    value={editData.description}
                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium h-32 resize-none focus:outline-none focus:border-blue-500 transition-all"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditOpen(false)}
                                    className="flex-1 py-3 bg-slate-50 text-slate-500 rounded-xl font-bold text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="flex-1 py-3 bg-[#002147] text-white rounded-xl font-bold text-sm shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isUpdating ? (
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : "Update Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
