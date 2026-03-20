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
        <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-cyan-400" />
                        AI Student Assistant
                    </h1>
                    <p className="text-slate-400 mt-2">Your dedicated tutor for every module.</p>
                </div>

                {/* Academic Integrity Banner */}
                <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-200 text-sm max-w-md">
                    <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                    <p>
                        <span className="font-bold">Academic Integrity:</span> I provide guidance and hints, not final answers or assignment solutions.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Module Picker */}
                <div className="lg:col-span-3">
                    <ModulePicker onModuleChange={(mod) => setSelectedModule(mod)} />
                </div>

                {/* Center: Chat UI */}
                <div className="lg:col-span-6">
                    <AiChat
                        selectedModule={selectedModule}
                        onCitationsFound={(cits) => setCitations(cits)}
                    />
                </div>

                {/* Right: Resources & Escalation */}
                <div className="lg:col-span-3">
                    <RelevantResources
                        citations={citations}
                        selectedModule={selectedModule}
                    />
                </div>
            </div>
        </div>
    );
}
