"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ModulePicker from "@/components/ModulePicker";
import AiChat from "@/components/AiChat";
import RelevantResources from "@/components/RelevantResources";
import { ShieldAlert, Sparkles, ArrowLeft } from "lucide-react";

export default function AiAssistantPage() {
    const router = useRouter();
    const [selectedModule, setSelectedModule] = useState(null);
    const [citations, setCitations] = useState([]);

    const handleCitationsFound = useCallback((cits) => {
        setCitations(cits);
    }, []);

    const handleModuleChange = useCallback((mod) => {
        setSelectedModule(mod);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        
        if (!token || !["student", "helper", "lecturer", "admin"].includes(user.role)) {
            router.push("/");
        }
    }, [router]);

    return (
        <div className="h-screen flex flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden">
            {/* Minimal Header / Top Nav */}
            <header className="px-8 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-6">
                    <Link 
                        href="/dashboard"
                        className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:text-orange-600 hover:border-orange-200 transition-all active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-[#002147] tracking-tight leading-none">
                            AI Student <span className="text-orange-500">Assistant</span>
                        </h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Your Academic Tutor</p>
                    </div>
                </div>

                {/* Compact Integrity Banner */}
                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <ShieldAlert className="w-4 h-4 text-orange-500" />
                    <p className="text-[10px] text-slate-500 font-bold max-w-[280px] leading-tight italic">
                        Guidance and hints only. No direct solutions.
                    </p>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Left Drawer: Configuration */}
                <aside className="w-80 h-full bg-white border-r border-slate-200 overflow-y-auto p-6 space-y-8 scrollbar-hide shrink-0">
                    <ModulePicker onModuleChange={handleModuleChange} />
                    
                    <div className="pt-2 border-t border-slate-100">
                        <RelevantResources
                            citations={citations}
                            selectedModule={selectedModule}
                        />
                    </div>
                </aside>

                {/* Primary Interaction Area: Chat */}
                <section className="flex-1 h-full bg-slate-50/50 relative overflow-hidden flex flex-col p-6">
                    <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
                        <AiChat
                            selectedModule={selectedModule}
                            onCitationsFound={handleCitationsFound}
                        />
                    </div>
                </section>
            </main>
        </div>
    );
}
