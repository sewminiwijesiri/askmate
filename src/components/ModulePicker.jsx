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
        <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-4 bg-orange-500 rounded-full" />
                <h3 className="text-[11px] font-black text-[#002147] uppercase tracking-[0.15em]">Module Scope</h3>
            </div>

            <div className="grid grid-cols-1 gap-2">
                {error ? (
                    <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-[10px] text-rose-600 font-bold flex items-center gap-2">
                        <div className="shrink-0 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        {error}
                    </div>
                ) : loading ? (
                    <div className="animate-pulse bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center gap-2">
                        <div className="w-3 h-3 bg-slate-200 rounded-full" />
                        <div className="h-2 w-24 bg-slate-100 rounded" />
                    </div>
                ) : (
                    <>
                        {/* Year & Semester Row */}
                        <div className="flex gap-2 text-red-500">
                            <select
                                value={selectedYear}
                                onChange={(e) => {
                                    setSelectedYear(e.target.value);
                                    setSelectedSemester("");
                                    setSelectedModule("");
                                }}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-bold text-slate-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Year</option>
                                {years.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>

                            <select
                                value={selectedSemester}
                                disabled={!selectedYear}
                                onChange={(e) => {
                                    setSelectedSemester(e.target.value);
                                    setSelectedModule("");
                                }}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-bold text-slate-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer disabled:opacity-30"
                            >
                                <option value="">Sem</option>
                                {filteredSemesters.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        {/* Module Dropdown */}
                        <select
                            value={selectedModule}
                            disabled={!selectedSemester}
                            onChange={(e) => handleModuleSelect(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[11px] font-bold text-slate-700 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer disabled:opacity-30"
                        >
                            <option value="">Select Course Module</option>
                            {filteredModules.map((m) => (
                                <option key={m._id} value={m._id}>
                                    {m.moduleCode} - {m.moduleName}
                                </option>
                            ))}
                        </select>
                    </>
                )}
            </div>
        </div>
    );
};

export default ModulePicker;
