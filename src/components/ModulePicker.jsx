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
        <div className="flex flex-col gap-5 p-7 bg-white border border-slate-200 rounded-[2rem] shadow-sm transition-all hover:shadow-md">
            <h3 className="text-xl font-bold text-[#002147] tracking-tight">Select Module</h3>

            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#002147]/60 ml-1">Year</label>
                    <select
                        value={selectedYear}
                        onChange={(e) => {
                            setSelectedYear(e.target.value);
                            setSelectedSemester("");
                            setSelectedModule("");
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none cursor-pointer"
                    >
                        <option value="">Select Year</option>
                        {years.map((y) => (
                            <option key={y} value={y}>Year {y}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#002147]/60 ml-1">Semester</label>
                    <select
                        value={selectedSemester}
                        disabled={!selectedYear}
                        onChange={(e) => {
                            setSelectedSemester(e.target.value);
                            setSelectedModule("");
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none cursor-pointer disabled:opacity-40"
                    >
                        <option value="">Select Semester</option>
                        {filteredSemesters.map((s) => (
                            <option key={s} value={s}>Semester {s}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#002147]/60 ml-1">Module</label>
                    <select
                        value={selectedModule}
                        disabled={!selectedSemester}
                        onChange={(e) => handleModuleSelect(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none cursor-pointer disabled:opacity-40"
                    >
                        <option value="">Select Module</option>
                        {filteredModules.map((m) => (
                            <option key={m._id} value={m._id}>
                                {m.moduleCode} - {m.moduleName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            
            {!selectedModule && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-600 font-medium leading-relaxed">
                    Please select a year and semester to view available course modules.
                </div>
            )}
        </div>
    );
};

export default ModulePicker;
