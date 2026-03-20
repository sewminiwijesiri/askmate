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
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-orange-500 rounded-full" />
                    <h3 className="text-[11px] font-black text-[#002147] uppercase tracking-[0.15em]">Citations</h3>
                </div>

                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                    {citations.length === 0 ? (
                        <div className="text-center py-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
                             <p className="text-slate-400 text-[9px] font-bold uppercase tracking-tight">No references yet</p>
                        </div>
                    ) : (
                        citations.slice(0, 5).map((cit, idx) => (
                            <div key={idx} className="p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-orange-200 transition-all">
                                <p className="text-[#002147] text-[11px] font-bold leading-tight mb-1 line-clamp-1">{cit.title}</p>
                                <div className="flex flex-wrap gap-1">
                                    {cit.page && <span className="text-[8px] bg-orange-50 text-orange-600 font-bold px-1 py-0.5 rounded border border-orange-100 uppercase">P.{cit.page}</span>}
                                    {cit.slide && <span className="text-[8px] bg-indigo-50 text-indigo-600 font-bold px-1 py-0.5 rounded border border-indigo-100 uppercase">S.{cit.slide}</span>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Escalation Area */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                    <h3 className="text-[11px] font-black text-indigo-700 uppercase tracking-[0.15em]">Help Center</h3>
                </div>
                
                <div className="bg-indigo-50/30 border border-indigo-100/50 p-3 rounded-xl">
                    <p className="text-[10px] text-slate-500 font-bold mb-3 italic">
                        Stuck on a concept? Connect with a human.
                    </p>

                    <button
                        onClick={handleEscalate}
                        disabled={!selectedModule || escalating || success}
                        className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 font-black text-[9px] uppercase tracking-[0.12em] transition-all shadow-sm ${success
                                ? "bg-emerald-500 text-white"
                                : "bg-[#002147] hover:bg-[#002147]/90 text-white active:scale-95 disabled:bg-slate-100 disabled:text-slate-300"
                            }`}
                    >
                        {escalating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : success ? "Request Sent" : "Escalate Issue"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RelevantResources;
