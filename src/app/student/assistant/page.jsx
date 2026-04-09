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
        <div className="h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans overflow-hidden relative">
            {/* Background Decorative Elements - Match Home page style */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-100/50 to-transparent opacity-50 pointer-events-none"></div>
            <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-orange-100/30 rounded-full filter blur-3xl pointer-events-none animate-pulse"></div>

            {/* Header */}
            <header className="px-8 py-5 bg-[#fffcf0]/80 backdrop-blur-md border-b border-orange-100/50 flex items-center justify-between shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-6">
                    <Link 
                        href="/dashboard"
                        className="p-2.5 bg-white/50 backdrop-blur-sm border border-orange-100/50 rounded-xl text-[#002147] hover:text-[#FF9F1C] hover:border-[#FF9F1C]/30 hover:shadow-lg hover:shadow-orange-500/10 transition-all active:scale-95 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    </Link>
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#002147] to-indigo-900 rounded-xl flex items-center justify-center shadow-lg overflow-hidden relative">
                            <div className="absolute inset-0 bg-[#FF9F1C] opacity-10"></div>
                            <svg className="w-6 h-6 text-[#FF9F1C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-[#002147] tracking-tighter uppercase leading-none">
                                ASK<span className="text-[#FF9F1C]">mate</span> <span className="text-slate-400 font-medium ml-2 border-l border-slate-200 pl-2 normal-case tracking-tight">AI Assistant</span>
                            </h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Your Personal Academic Tutor</p>
                        </div>
                    </div>
                </div>

                {/* Compact Integrity Banner */}
                <div className="hidden lg:flex items-center gap-3 px-5 py-2.5 bg-blue-50/50 border border-blue-100/50 rounded-2xl shadow-sm">
                    <div className="bg-orange-100 p-1.5 rounded-lg">
                        <ShieldAlert className="w-4 h-4 text-[#FF9F1C]" />
                    </div>
                    <p className="text-[10px] text-blue-900/70 font-bold max-w-[320px] leading-tight italic">
                        AI provides guidance and hints only. For direct answers, check your lecture materials or contact a lecturer.
                    </p>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden relative z-0">
                {/* Left Drawer: Configuration */}
                <aside className="w-80 h-full bg-[#fffcf0] border-r border-orange-100/50 overflow-y-auto p-8 space-y-10 scrollbar-hide shrink-0 shadow-[4px_0_24px_-12px_rgba(255,159,28,0.1)] relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100/20 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <ModulePicker onModuleChange={handleModuleChange} />
                    </div>
                    
                    <div className="pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        <RelevantResources
                            citations={citations}
                            selectedModule={selectedModule}
                        />
                    </div>
                </aside>

                {/* Primary Interaction Area: Chat */}
                <section className="flex-1 h-full relative overflow-hidden flex flex-col p-6 lg:p-10">
                    {/* Floating Decorative Elements in Chat Area */}
                    <div className="absolute top-20 right-20 w-32 h-32 bg-blue-400/5 rounded-full filter blur-xl animate-pulse"></div>
                    <div className="absolute bottom-20 left-20 w-48 h-48 bg-orange-400/5 rounded-full filter blur-2xl animate-pulse cursor-default"></div>

                    <div className="flex-1 max-w-5xl mx-auto w-full flex flex-col bg-white shadow-[0_32px_64px_-16px_rgba(0,33,71,0.12)] rounded-[3rem] overflow-hidden border border-blue-50/50 animate-in zoom-in-95 duration-700">
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
