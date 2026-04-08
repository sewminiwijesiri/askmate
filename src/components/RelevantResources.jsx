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
        <div className="flex flex-col gap-8">
            {/* Citations / Resources */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-5 bg-gradient-to-b from-[#4DA8DA] to-blue-600 rounded-full shadow-[0_0_8px_rgba(77,168,218,0.4)]" />
                    <h3 className="text-[12px] font-black text-[#002147] uppercase tracking-[0.2em] leading-none">Context Sources</h3>
                </div>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin">
                    {citations.length === 0 ? (
                        <div className="text-center py-6 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-2xl group hover:border-blue-100 transition-colors">
                             <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest group-hover:text-blue-300 transition-colors">Awaiting data...</p>
                        </div>
                    ) : (
                        citations.slice(0, 5).map((cit, idx) => (
                            <div key={idx} className="p-3.5 bg-white/80 backdrop-blur-sm border-2 border-white rounded-2xl shadow-sm hover:border-[#FF9F1C]/30 hover:shadow-orange-500/5 transition-all group cursor-default">
                                <p className="text-[#002147] text-[12px] font-bold leading-tight mb-2 line-clamp-2 group-hover:text-[#FF9F1C] transition-colors">{cit.title}</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {cit.page && (
                                        <span className="text-[9px] bg-orange-50 text-orange-600 font-black px-2 py-0.5 rounded-lg border border-orange-100 uppercase tracking-tighter">
                                            Page {cit.page}
                                        </span>
                                    )}
                                    {cit.slide && (
                                        <span className="text-[9px] bg-indigo-50 text-indigo-600 font-black px-2 py-0.5 rounded-lg border border-indigo-100 uppercase tracking-tighter">
                                            Slide {cit.slide}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Escalation Area */}
            <div className="pt-8 border-t border-slate-100 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-5 bg-gradient-to-b from-indigo-500 to-[#002147] rounded-full shadow-[0_0_8px_rgba(0,33,71,0.2)]" />
                    <h3 className="text-[12px] font-black text-indigo-900 uppercase tracking-[0.2em] leading-none">Human Support</h3>
                </div>
                
                <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 border-2 border-indigo-100/30 p-5 rounded-[2rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full -mr-8 -mt-8 blur-xl"></div>
                    
                    <p className="text-[11px] text-indigo-900/60 font-medium mb-4 relative z-10">
                        If the AI cannot resolve your query, our human helpers are ready to assist.
                    </p>

                    <button
                        onClick={handleEscalate}
                        disabled={!selectedModule || escalating || success}
                        className={`w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-[0.15em] transition-all shadow-lg relative z-10 ${success
                                ? "bg-emerald-500 text-white shadow-emerald-500/20"
                                : "bg-[#002147] hover:bg-[#002147]/90 text-white shadow-blue-900/20 active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none"
                            }`}
                    >
                        {escalating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : success ? (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Ticket Created</span>
                            </>
                        ) : (
                            <>
                                <HelpCircle className="w-4 h-4" />
                                <span>Escalate to Human</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RelevantResources;
