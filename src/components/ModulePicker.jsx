"use client";

import React, { useState, useEffect } from "react";

const ModulePicker = ({ onModuleChange }) => {
    const [modules, setModules] = useState([]);
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("");
    const [selectedModule, setSelectedModule] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const fetchModules = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch("/api/admin/academic");
                
                if (!res.ok) {
                    throw new Error(`Failed to fetch modules: ${res.status} ${res.statusText}`);
                }
                
                const data = await res.json();
                setModules(data);

                // Load saved selection
                const savedYear = localStorage.getItem("selected_year");
                const savedSemester = localStorage.getItem("selected_semester");
                const savedModuleId = localStorage.getItem("selected_module_id");

                if (savedYear) setSelectedYear(savedYear);
                if (savedSemester) setSelectedSemester(savedSemester);
                if (savedModuleId) {
                    setSelectedModule(savedModuleId);
                    const mod = data.find((m) => m._id === savedModuleId);
                    if (mod) onModuleChange(mod);
                }
                setIsLoaded(true);
            } catch (err) {
                console.error("Failed to fetch modules", err);
                setError(err.message || "Failed to connect to the academic database.");
            } finally {
                setLoading(false);
            }
        };
        fetchModules();
    }, []);


    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem("selected_year", selectedYear);
        localStorage.setItem("selected_semester", selectedSemester);
        localStorage.setItem("selected_module_id", selectedModule);
    }, [selectedYear, selectedSemester, selectedModule, isLoaded]);

    const years = [...new Set(modules.map((m) => m.year))].sort();
    const filteredSemesters = [...new Set(modules.filter((m) => m.year == selectedYear).map((m) => m.semester))].sort();
    const filteredModules = modules.filter(
        (m) => m.year == selectedYear && m.semester == selectedSemester
    );

    const handleModuleSelect = (moduleId) => {
        setSelectedModule(moduleId);
        localStorage.setItem("selected_module_id", moduleId);
        const mod = modules.find((m) => m._id === moduleId);
        onModuleChange(mod);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-5 bg-gradient-to-b from-[#FF9F1C] to-orange-600 rounded-full shadow-[0_0_8px_rgba(255,159,28,0.4)]" />
                <h3 className="text-[12px] font-black text-[#002147] uppercase tracking-[0.2em] leading-none">Module Scope</h3>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {error ? (
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-[10px] text-rose-600 font-bold flex items-center gap-3 animate-in shake duration-500">
                        <div className="shrink-0 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                        {error}
                    </div>
                ) : loading ? (
                    <div className="animate-pulse space-y-3">
                        <div className="flex gap-2">
                            <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl flex-1" />
                            <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl flex-1" />
                        </div>
                        <div className="h-12 bg-slate-50 border border-slate-100 rounded-xl w-full" />
                    </div>
                ) : (
                    <>
                        {/* Year & Semester Row */}
                        <div className="flex gap-2">
                            <div className="relative flex-1 group">
                                <select
                                    value={selectedYear}
                                    onChange={(e) => {
                                        setSelectedYear(e.target.value);
                                        setSelectedSemester("");
                                        setSelectedModule("");
                                    }}
                                    className="w-full bg-white/50 backdrop-blur-sm border-2 border-orange-100/30 rounded-xl px-4 py-3 text-[11px] font-black text-slate-700 focus:ring-4 focus:ring-orange-500/5 focus:border-[#FF9F1C]/40 outline-none transition-all appearance-none cursor-pointer group-hover:bg-white/80"
                                >
                                    <option value="">Year</option>
                                    {years.map((y) => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-hover:text-orange-400 transition-colors">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>

                            <div className="relative flex-1 group">
                                <select
                                    value={selectedSemester}
                                    disabled={!selectedYear}
                                    onChange={(e) => {
                                        setSelectedSemester(e.target.value);
                                        setSelectedModule("");
                                    }}
                                    className="w-full bg-white/50 backdrop-blur-sm border-2 border-orange-100/30 rounded-xl px-4 py-3 text-[11px] font-black text-slate-700 focus:ring-4 focus:ring-orange-500/5 focus:border-[#FF9F1C]/40 outline-none transition-all appearance-none cursor-pointer disabled:opacity-30 group-hover:bg-white/80"
                                >
                                    <option value="">Sem</option>
                                    {filteredSemesters.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-hover:text-orange-400 transition-colors">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Module Dropdown */}
                        <div className="relative group">
                            <select
                                value={selectedModule}
                                disabled={!selectedSemester}
                                onChange={(e) => handleModuleSelect(e.target.value)}
                                className="w-full bg-white/50 backdrop-blur-sm border-2 border-orange-100/30 rounded-xl px-4 py-3.5 text-[11px] font-black text-slate-700 focus:ring-4 focus:ring-orange-500/5 focus:border-[#FF9F1C]/40 outline-none transition-all appearance-none cursor-pointer disabled:opacity-30 group-hover:bg-white/80"
                            >
                                <option value="">Select Course Module</option>
                                {filteredModules.map((m) => (
                                    <option key={m._id} value={m._id}>
                                        {m.moduleCode} - {m.moduleName}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-hover:text-orange-400 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ModulePicker;
