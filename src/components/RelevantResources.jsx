"use client";

import React, { useState } from "react";
import { BookOpen, HelpCircle, CheckCircle2, Loader2 } from "lucide-react";

const RelevantResources = ({ citations, selectedModule }) => {
    const [escalating, setEscalating] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleEscalate = async () => {
        if (!selectedModule) return;
        setEscalating(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/questions/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: `Help needed with ${selectedModule.moduleName}`,
                    body: "This question was escalated from the AI Student Assistant conversation.",
                    moduleId: selectedModule._id,
                }),
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 5000);
            }
        } catch (err) {
            console.error("Escalation failed", err);
        } finally {
            setEscalating(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Citations / Resources */}
            <div className="p-7 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-[#002147] tracking-tight">Citations</h3>
                </div>

                <div className="space-y-4">
                    {citations.length === 0 ? (
                        <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">No resources cited yet. Ask a question to see references.</p>
                        </div>
                    ) : (
                        citations.map((cit, idx) => (
                            <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-orange-200 transition-all cursor-default shadow-sm shadow-slate-200/20">
                                <p className="text-[#002147] text-sm font-bold leading-snug mb-2 line-clamp-2">{cit.title}</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {cit.page && <span className="text-[10px] bg-white text-orange-600 font-black px-2 py-1 rounded-md border border-orange-100 shadow-sm uppercase tracking-tighter">Page {cit.page}</span>}
                                    {cit.slide && <span className="text-[10px] bg-white text-indigo-600 font-black px-2 py-1 rounded-md border border-indigo-100 shadow-sm uppercase tracking-tighter">Slide {cit.slide}</span>}
                                    {cit.section && <span className="text-[10px] bg-slate-200 text-slate-600 font-black px-2 py-1 rounded-md border border-slate-300 shadow-sm uppercase tracking-tighter overflow-hidden text-ellipsis max-w-[120px] whitespace-nowrap">{cit.section}</span>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Escalation */}
            <div className="p-8 bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100/50 rounded-[2rem] shadow-sm relative overflow-hidden group">
                {/* Decorative Pattern / Accent */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center">
                            <HelpCircle className="w-5 h-5 text-indigo-700" />
                        </div>
                        <h3 className="text-xl font-bold text-[#002147] tracking-tight">Still Unclear?</h3>
                    </div>
                    <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
                        If the AI couldn't fully answer your question, you can send it to our human Helpers.
                    </p>

                    <button
                        onClick={handleEscalate}
                        disabled={!selectedModule || escalating || success}
                        className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-[11px] uppercase tracking-widest transition-all ${success
                                ? "bg-emerald-500 text-white cursor-default shadow-lg shadow-emerald-500/20"
                                : "bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white shadow-lg shadow-orange-500/20 active:scale-[0.98] disabled:bg-slate-200 disabled:opacity-50 disabled:shadow-none"
                            }`}
                    >
                        {escalating ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : success ? (
                            <>
                                <CheckCircle2 className="w-5 h-5" />
                                Sent to Helpers!
                            </>
                        ) : (
                            "Send to Helpers"
                        )}
                    </button>
                    {!selectedModule && <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-4 text-center">Select a module first</p>}
                </div>
            </div>
        </div>
    );
};

export default RelevantResources;
