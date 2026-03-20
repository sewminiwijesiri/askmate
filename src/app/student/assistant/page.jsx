"use client";

import React, { useState } from "react";
import ModulePicker from "@/components/ModulePicker";
import AiChat from "@/components/AiChat";
import RelevantResources from "@/components/RelevantResources";
import { ShieldAlert, Sparkles } from "lucide-react";

export default function AiAssistantPage() {
    const [selectedModule, setSelectedModule] = useState(null);
    const [citations, setCitations] = useState([]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
            {/* Header Area */}
            <div className="max-w-7xl mx-auto mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200 pb-8">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100 mb-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Powered by Gemini</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-[#002147] tracking-tight">
                        AI Student <span className="text-orange-500 underline decoration-4 decoration-orange-500/20 underline-offset-4">Assistant</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg">Your dedicated academic tutor for every module.</p>
                </div>

                {/* Academic Integrity Banner - Premium Style */}
                <div className="flex items-start gap-4 px-6 py-5 bg-white border border-slate-200 rounded-3xl shadow-sm max-w-lg lg:mb-1 hover:border-orange-200 transition-colors group">
                    <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
                        <ShieldAlert className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-[#002147] uppercase tracking-wider">Academic Integrity First</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            I provide guidance, conceptual explanations and hints. I do not provide direct assignment solutions.
                        </p>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Side: Module Configuration */}
                <aside className="lg:col-span-3 space-y-6">
                    <ModulePicker onModuleChange={(mod) => setSelectedModule(mod)} />
                </aside>

                {/* Center: Main Interaction Hub */}
                <section className="lg:col-span-6 min-h-[600px]">
                    <AiChat
                        selectedModule={selectedModule}
                        onCitationsFound={(cits) => setCitations(cits)}
                    />
                </section>

                {/* Right Side: Augmented Context */}
                <aside className="lg:col-span-3 space-y-6">
                    <RelevantResources
                        citations={citations}
                        selectedModule={selectedModule}
                    />
                </aside>
            </main>
        </div>
    );
}
