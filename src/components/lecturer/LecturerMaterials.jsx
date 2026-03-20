"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, ExternalLink, FileText, Trash2, Search } from "lucide-react";

export default function LecturerMaterials({ user }) {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchResources();
    }, [statusFilter]);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/resources?status=${statusFilter}`);
            if (res.ok) {
                const data = await res.json();
                setResources(data);
            }
        } catch (error) {
            console.error("Error fetching resources:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`/api/resources/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                fetchResources();
            }
        } catch (error) {
            console.error(`Error changing resource status to ${newStatus}:`, error);
        }
    };

    const handleDeleteResource = async (id) => {
        if (!confirm("Are you sure you want to delete this resource?")) return;
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`/api/resources/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) fetchResources();
        } catch (error) {
            console.error("Error deleting resource:", error);
        }
    };

    const filteredResources = resources.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.module?.moduleName?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-[#002147]">Manage Course Materials</h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">
                            Review and approve resources uploaded by students or manage existing files.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 pb-6 border-b border-slate-100 mb-6">
                    <div className="flex flex-wrap gap-2">
                        {['all', 'pending', 'approved', 'rejected'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${statusFilter === status
                                    ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full xl:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={16} strokeWidth={2.5} />
                        <input
                            type="text"
                            placeholder="Search by title or module..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[300px]">
                        <div className="w-8 h-8 border-3 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-3"></div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Loading resources...</p>
                    </div>
                ) : filteredResources.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                        <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center text-slate-300 mb-4">
                            <FileText size={30} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">No resources found</h3>
                        <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
                            There are no {statusFilter !== 'all' ? statusFilter : ''} resources matching your criteria.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredResources.map((res) => (
                            <div key={res._id} className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${res.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        res.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                            'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                        {res.status}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        {res.uploaderRole === 'student' && (
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded mr-2">
                                                Student
                                            </span>
                                        )}
                                        <button onClick={() => handleDeleteResource(res._id)} className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <h4 className="text-base font-bold text-[#002147] leading-snug mb-1 line-clamp-1">
                                    {res.title}
                                </h4>

                                <p className="text-xs font-bold text-slate-500 mb-3 truncate">
                                    {res.module?.moduleCode} - {res.module?.moduleName}
                                </p>

                                <div className="flex items-center justify-between pt-3 border-t border-slate-100 mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                                            By: {res.uploaderName || 'Unknown'}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                                        {res.category || "General"}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <a
                                        href={res.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors"
                                    >
                                        View Material <ExternalLink size={12} />
                                    </a>

                                    {res.status === "pending" && (
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={() => handleStatusChange(res._id, "approved")}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500 text-white rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-emerald-600 transition-colors"
                                            >
                                                <CheckCircle size={14} /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(res._id, "rejected")}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-rose-500 text-white rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-rose-600 transition-colors"
                                            >
                                                <XCircle size={14} /> Reject
                                            </button>
                                        </div>
                                    )}

                                    {res.status === "rejected" && (
                                        <button
                                            onClick={() => handleStatusChange(res._id, "approved")}
                                            className="w-full mt-2 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-emerald-100 transition-colors"
                                        >
                                            Approve Instead
                                        </button>
                                    )}

                                    {res.status === "approved" && (
                                        <button
                                            onClick={() => handleStatusChange(res._id, "pending")}
                                            className="w-full mt-2 flex items-center justify-center gap-1.5 py-2.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-amber-100 transition-colors"
                                        >
                                            Revert to Pending
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
