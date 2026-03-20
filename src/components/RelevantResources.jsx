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
            <div className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-xl font-bold text-white">Relevant Resources</h3>
                </div>

                <div className="space-y-3">
                    {citations.length === 0 ? (
                        <p className="text-gray-400 text-sm italic">No resources cited yet. Ask a question to see references.</p>
                    ) : (
                        citations.map((cit, idx) => (
                            <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                                <p className="text-white text-sm font-medium">{cit.title}</p>
                                <div className="flex gap-2 mt-1">
                                    {cit.page && <span className="text-[10px] bg-cyan-900/40 text-cyan-200 px-1.5 py-0.5 rounded border border-cyan-500/30">Page {cit.page}</span>}
                                    {cit.slide && <span className="text-[10px] bg-purple-900/40 text-purple-200 px-1.5 py-0.5 rounded border border-purple-500/30">Slide {cit.slide}</span>}
                                    {cit.section && <span className="text-[10px] bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded border border-white/10">{cit.section}</span>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Escalation */}
            <div className="p-6 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-bold text-white">Still Unclear?</h3>
                </div>
                <p className="text-sm text-gray-300 mb-4">
                    If the AI couldn't fully answer your question, you can send it to our human Helpers.
                </p>

                <button
                    onClick={handleEscalate}
                    disabled={!selectedModule || escalating || success}
                    className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all ${success
                            ? "bg-green-600/60 text-white cursor-default"
                            : "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20 active:scale-95 disabled:opacity-50"
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
                {!selectedModule && <p className="text-[10px] text-amber-300/60 mt-2 text-center">Select a module first</p>}
            </div>
        </div>
    );
};

export default RelevantResources;
