"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Clock, MessageSquare, Tag, User, ChevronRight, Speaker } from "lucide-react";

export default function QuestionList({ user, onSelectQuestion }) {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState({
        module: "",
    });

    useEffect(() => {
        fetchQuestions();
    }, [filter]);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filter.module) params.append("module", filter.module);
            if (search) params.append("q", search);

            const res = await fetch(`/api/questions?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setQuestions(data);
            }
        } catch (err) {
            console.error("Error fetching questions:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchQuestions();
    };

    return (
        <div className="space-y-6">
            {/* Filters & Search */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <form onSubmit={handleSearch} className="md:col-span-2 relative">
                    <input
                        type="text"
                        placeholder="Search questions by title or tags..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-12 py-3.5 focus:ring-2 focus:ring-[#4DA8DA] outline-none transition-all shadow-sm font-medium"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <button type="submit" className="hidden">Search</button>
                </form>

                <div className="flex justify-end">
                    <button className="p-3.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm text-slate-500">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Questions Feed */}
            <div className="space-y-4">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-white border border-slate-100 p-6 rounded-2xl animate-pulse h-40"></div>
                    ))
                ) : questions.length > 0 ? (
                    questions.map((q) => (
                        <div
                            key={q._id}
                            onClick={() => onSelectQuestion(q._id)}
                            className="bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                        >
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="space-y-3 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                            {q.module}
                                        </span>
                                        {q.isVoiceQuestion && (
                                            <span className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-bold flex items-center gap-1.5">
                                                <Speaker size={12} /> Voice
                                            </span>
                                        )}
                                        {q.isResolved && (
                                            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                                Resolved
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold text-[#002147] group-hover:text-[#4DA8DA] transition-colors leading-tight">
                                        {q.title}
                                    </h3>

                                    <p className="text-slate-500 text-sm line-clamp-2 font-medium">
                                        {q.description}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-4 pt-2">
                                        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                                            <User size={14} className="text-slate-300" />
                                            {q.student?.email || "Anonymous"}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                                            <Clock size={14} className="text-slate-300" />
                                            {new Date(q.createdAt).toLocaleDateString()}
                                        </div>
                                        {q.tags?.map((tag, i) => (
                                            <div key={i} className="flex items-center gap-1 text-[#4DA8DA] text-xs font-bold bg-blue-50/50 px-2.5 py-1 rounded-md">
                                                <Tag size={12} /> {tag}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex md:flex-col justify-between items-center md:items-end gap-4 min-w-[100px]">
                                    <div className="flex items-center gap-4">
                                        <div className="text-center">
                                            <p className="text-lg font-black text-[#002147] leading-none">{q.upvotes || 0}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Votes</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-black text-[#002147] leading-none">{q.answersCount || 0}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Answers</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-slate-300 group-hover:text-[#002147] group-hover:translate-x-1 transition-all" size={24} />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center bg-white border border-slate-200 border-dashed rounded-3xl">
                        <MessageSquare size={48} className="text-slate-200 mx-auto mb-4" />
                        <h4 className="text-lg font-bold text-slate-400">No questions found</h4>
                        <p className="text-slate-300 text-sm">Try adjusting your filters or search query.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
