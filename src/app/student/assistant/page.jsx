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

    useEffect(() => {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        
        if (!token || !["student", "helper", "lecturer", "admin"].includes(user.role)) {
            router.push("/");
        }
    }, [router]);

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-100 via-[#f8fafc] to-orange-100 text-slate-900 font-sans selection:bg-blue-100 overflow-hidden">
            {/* Premium Header */}
            <header className="px-8 py-5 bg-white/70 backdrop-blur-md border-b border-white/20 flex items-center justify-between shrink-0 shadow-sm z-50">
                <div className="flex items-center gap-6">
                    <Link 
                        href="/dashboard"
                        className="p-3 bg-white border border-slate-100 rounded-2xl text-[#002147] hover:text-[#4DA8DA] hover:border-[#4DA8DA]/30 shadow-sm transition-all active:scale-95 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-6 bg-[#FF9F1C] rounded-full" />
                           <h1 className="text-2xl font-black text-[#002147] tracking-tight leading-none">
                               AI Student <span className="text-[#4DA8DA]">Assistant</span>
                           </h1>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1.5 ml-4">Advanced Academic Tutor</p>
                    </div>
                </div>

                {/* Compact Integrity Banner */}
                <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-[#002147] rounded-2xl shadow-xl shadow-blue-900/10">
                    <Sparkles className="w-4 h-4 text-[#FF9F1C] animate-pulse" />
                    <p className="text-[11px] text-blue-50 font-black tracking-wide uppercase">
                        AI Guidance Mode Active
                    </p>
                </div>
            </header>

            <main className="flex-1 flex gap-8 p-8 overflow-hidden">
                {/* Left Floating sidebar */}
                <aside className="w-85 flex flex-col gap-6 shrink-0 animate-in fade-in slide-in-from-left-4 duration-700">
                    {/* Config Card */}
                    <div className="bg-white/80 backdrop-blur-xl border border-white p-7 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 space-y-8">
                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-[#002147]">Personalize</h3>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-none">Setup your learning context</p>
                        </div>
                        
                        <ModulePicker onModuleChange={(mod) => setSelectedModule(mod)} />
                    </div>

                    {/* Resources Card - Only takes remaining height if needed, but fits content */}
                    <div className="flex-1 min-h-0 bg-white/60 backdrop-blur-lg border border-white/40 p-7 rounded-[2.5rem] shadow-xl shadow-blue-900/5 overflow-hidden flex flex-col">
                        <RelevantResources
                            citations={citations}
                            selectedModule={selectedModule}
                        />
                    </div>
                </aside>

                {/* Primary Interaction Area: Chat */}
                <section className="flex-1 h-full relative overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                    <div className="flex-1 w-full flex flex-col shadow-2xl shadow-blue-900/10 rounded-[3rem] overflow-hidden bg-white border border-white ring-8 ring-slate-100/30">
                        <AiChat
                            selectedModule={selectedModule}
                            onCitationsFound={handleCitationsFound}
                        />
                    </div>
                    
                    <div className="flex items-center justify-center gap-6 mt-6 opacity-40">
                         <div className="flex items-center gap-2">
                            <ShieldAlert size={12} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">No Direct Solutions</span>
                         </div>
                         <div className="w-1 h-1 rounded-full bg-slate-300" />
                         <div className="flex items-center gap-2">
                            <Sparkles size={12} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Powered by AskMate AI</span>
                         </div>
                    </div>
                </section>
            </main>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                
                body {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }
                
                ::-webkit-scrollbar {
                    width: 6px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
}
