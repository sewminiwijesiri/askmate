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
        <div className="flex flex-col h-full space-y-5 overflow-hidden">
            {/* Citations / Resources */}
            <div className="flex-1 flex flex-col min-h-0 space-y-3">
                <div className="space-y-0.5 ml-1">
                    <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Context</h3>
                    <p className="text-xs font-black text-[#002147] tracking-tight truncate">
                         {selectedModule ? selectedModule.moduleName : "No Module Selected"}
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-hide">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-4 bg-[#FF9F1C] rounded-full" />
                        <h3 className="text-[9px] font-black text-[#002147] uppercase tracking-widest mt-0.5">Key Citations</h3>
                    </div>

                    {citations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 px-3 bg-slate-50/50 border border-dashed border-slate-200 rounded-[1.5rem] text-center">
                             <BookOpen size={18} className="text-slate-200 mb-1" />
                             <p className="text-slate-400 text-[9px] font-bold uppercase tracking-tight max-w-[100px]">References show up here</p>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {citations.slice(0, 5).map((cit, idx) => (
                                <div key={idx} className="group p-3 bg-white border border-slate-100 rounded-[1.2rem] shadow-sm hover:border-[#4DA8DA]/30 hover:shadow-lg transition-all animate-in fade-in slide-in-from-right-4 duration-300">
                                    <p className="text-[#002147] text-[11px] font-bold leading-snug mb-2 line-clamp-1 italic">"{cit.title}"</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-1">
                                            {cit.page && <span className="text-[7.5px] bg-orange-50 text-orange-600 font-black px-1.5 py-0.5 rounded-md border border-orange-100 uppercase">P.{cit.page}</span>}
                                            {cit.slide && <span className="text-[7.5px] bg-blue-50 text-blue-600 font-black px-1.5 py-0.5 rounded-md border border-blue-100 uppercase">S.{cit.slide}</span>}
                                        </div>
                                        <BookOpen size={10} className="text-slate-300 group-hover:text-[#4DA8DA]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Escalation Area */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="space-y-0.5 ml-1">
                    <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Connect</h3>
                    <p className="text-[11px] font-bold text-slate-500">Human expertise?</p>
                </div>
                
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-[1.5rem] relative overflow-hidden group">
                    <button
                        onClick={handleEscalate}
                        disabled={!selectedModule || escalating || success}
                        className={`w-full py-2.5 rounded-[1rem] flex items-center justify-center gap-2 font-black text-[9px] uppercase tracking-[0.15em] transition-all shadow-lg active:scale-95 z-10 relative ${
                            success
                            ? "bg-emerald-500 text-white"
                            : "bg-[#002147] hover:bg-slate-800 text-white shadow-blue-900/10 disabled:bg-slate-200 disabled:text-slate-400"
                        }`}
                    >
                        {escalating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : success ? (
                            <>
                                <CheckCircle2 size={12} />
                                <span>Sent</span>
                            </>
                        ) : (
                            <>
                                <HelpCircle size={12} className="text-[#FF9F1C]" />
                                <span>Consult</span>
                            </>
                        )}
                    </button>
                    <p className="text-center text-[8px] text-slate-400 font-bold mt-2 uppercase tracking-tighter opacity-70">
                        Post to Community Hub
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RelevantResources;
