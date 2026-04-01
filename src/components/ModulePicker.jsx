"use client";

import React, { useState, useEffect } from "react";

const ModulePicker = ({ onModuleChange }) => {
    const [modules, setModules] = useState([]);
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("");
    const [selectedModule, setSelectedModule] = useState("");
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const fetchModules = async () => {
            try {
                const res = await fetch("/api/admin/academic");
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
            }
        };
        fetchModules();
    }, [onModuleChange]);

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
        <div className="space-y-5">
            <div className="space-y-4">
                {/* Year & Semester Row */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Year</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => {
                                setSelectedYear(e.target.value);
                                setSelectedSemester("");
                                setSelectedModule("");
                            }}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-[#002147] focus:ring-4 focus:ring-blue-500/5 focus:border-[#4DA8DA] outline-none transition-all appearance-none cursor-pointer hover:bg-white hover:border-slate-200"
                        >
                            <option value="">Select Year</option>
                            {years.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Semester</label>
                        <select
                            value={selectedSemester}
                            disabled={!selectedYear}
                            onChange={(e) => {
                                setSelectedSemester(e.target.value);
                                setSelectedModule("");
                            }}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-[#002147] focus:ring-4 focus:ring-blue-500/5 focus:border-[#4DA8DA] outline-none transition-all appearance-none cursor-pointer disabled:opacity-30 hover:bg-white hover:border-slate-200"
                        >
                            <option value="">Select Sem</option>
                            {filteredSemesters.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Module Dropdown */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Module</label>
                    <select
                        value={selectedModule}
                        disabled={!selectedSemester}
                        onChange={(e) => handleModuleSelect(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-xs font-bold text-[#002147] focus:ring-4 focus:ring-blue-500/5 focus:border-[#4DA8DA] outline-none transition-all appearance-none cursor-pointer disabled:opacity-30 hover:bg-white hover:border-slate-200"
                    >
                        <option value="">Select Course Module</option>
                        {filteredModules.map((m) => (
                            <option key={m._id} value={m._id}>
                                {m.moduleCode} — {m.moduleName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default ModulePicker;
