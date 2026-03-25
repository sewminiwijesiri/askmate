"use client";

import { useState } from "react";
import { Send, Mic, X, Tag as TagIcon, Sparkles } from "lucide-react";

export default function AskQuestionForm({ user, onSuccess, onCancel }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        module: "",
        year: user?.year || "1",
        semester: user?.semester || "1",
        topic: "",
        difficultyLevel: "Medium",
        urgencyLevel: "Normal",
        tags: "",
        isVoiceQuestion: false,
        originalLanguage: "English"
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await fetch("/api/questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    student: user.id,
                    tags: formData.tags.split(",").map(t => t.trim()).filter(t => t)
                }),
            });

            if (res.ok) {
                onSuccess();
            } else {
                const err = await res.json();
                alert(err.error || "Failed to submit question");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                    <h3 className="text-2xl font-black text-[#002147] tracking-tight">Ask the Community</h3>
                    <p className="text-slate-500 font-medium text-sm">Be specific to get high-quality answers.</p>
                </div>
                <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Content */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-[#002147] uppercase tracking-widest ml-1">Question Title</label>
                            <input
                                type="text"
                                required
                                placeholder="What's your academic challenge?"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-[#4DA8DA] outline-none transition-all font-bold text-[#002147] placeholder:text-slate-300"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-[#002147] uppercase tracking-widest ml-1">Detail Breakdown</label>
                            <textarea
                                required
                                rows={6}
                                placeholder="Explain what you've tried and keep it structured..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#4DA8DA] outline-none transition-all font-medium text-[#002147] placeholder:text-slate-300 resize-none"
                            />
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#4DA8DA] shadow-sm">
                                <Mic size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-[#002147]">Voice Interaction</p>
                                <p className="text-[11px] text-slate-500 font-medium">Record your question for better clarity.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isVoiceQuestion: !formData.isVoiceQuestion })}
                                className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-all ${formData.isVoiceQuestion
                                        ? "bg-[#4DA8DA] text-white"
                                        : "bg-white text-slate-400 border border-slate-200"
                                    }`}
                            >
                                {formData.isVoiceQuestion ? "ON" : "OFF"}
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Metadata */}
                    <div className="space-y-6 bg-slate-50/30 p-6 rounded-3xl border border-slate-100">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Module</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. CS101"
                                    value={formData.module}
                                    onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#4DA8DA] outline-none transition-all font-bold text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Topic</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. React Hooks"
                                    value={formData.topic}
                                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#4DA8DA] outline-none transition-all font-bold text-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Urgency</label>
                                <select
                                    value={formData.urgencyLevel}
                                    onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-sm outline-none"
                                >
                                    <option value="Normal">Normal</option>
                                    <option value="Urgent">Urgent 🔥</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                <TagIcon size={12} /> Tags (comma separated)
                            </label>
                            <input
                                type="text"
                                placeholder="react, frontend, hooks"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[#4DA8DA] outline-none transition-all font-bold text-sm"
                            />
                        </div>

                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-8 py-3.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-100 rounded-xl"
                    >
                        Draft & Exit
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-10 py-3.5 bg-[#002147] hover:bg-blue-900 text-white rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-blue-900/20 active:scale-95 disabled:opacity-50 transition-all"
                    >
                        {loading ? "Launching..." : "Broadcast Question"}
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
}
