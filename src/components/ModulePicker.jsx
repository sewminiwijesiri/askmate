"use client";

import React, { useState, useEffect } from "react";

const ModulePicker = ({ onModuleChange }) => {
    const [modules, setModules] = useState([]);
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("");
    const [selectedModule, setSelectedModule] = useState("");

    useEffect(() => {
        const fetchModules = async () => {
            try {
                const res = await fetch("/api/admin/academic");
                const data = await res.json();
                setModules(data);
            } catch (err) {
                console.error("Failed to fetch modules", err);
            }
        };
        fetchModules();
    }, []);

    const years = [...new Set(modules.map((m) => m.year))].sort();
    const filteredSemesters = [...new Set(modules.filter((m) => m.year == selectedYear).map((m) => m.semester))].sort();
    const filteredModules = modules.filter(
        (m) => m.year == selectedYear && m.semester == selectedSemester
    );

    const handleModuleSelect = (moduleId) => {
        setSelectedModule(moduleId);
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
                {/* Year & Semester Row */}
                <div className="flex gap-2">
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
            </div>
        </div>
    );
};

export default ModulePicker;
