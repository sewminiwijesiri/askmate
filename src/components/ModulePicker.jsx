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
        <div className="flex flex-col gap-4 p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl transition-all hover:bg-white/15">
            <h3 className="text-xl font-bold text-white mb-2">Select Module</h3>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Year</label>
                <select
                    value={selectedYear}
                    onChange={(e) => {
                        setSelectedYear(e.target.value);
                        setSelectedSemester("");
                        setSelectedModule("");
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                    <option value="" className="bg-gray-800">Select Year</option>
                    {years.map((y) => (
                        <option key={y} value={y} className="bg-gray-800">Year {y}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Semester</label>
                <select
                    value={selectedSemester}
                    disabled={!selectedYear}
                    onChange={(e) => {
                        setSelectedSemester(e.target.value);
                        setSelectedModule("");
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50"
                >
                    <option value="" className="bg-gray-800">Select Semester</option>
                    {filteredSemesters.map((s) => (
                        <option key={s} value={s} className="bg-gray-800">Semester {s}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Module</label>
                <select
                    value={selectedModule}
                    disabled={!selectedSemester}
                    onChange={(e) => handleModuleSelect(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50"
                >
                    <option value="" className="bg-gray-800">Select Module</option>
                    {filteredModules.map((m) => (
                        <option key={m._id} value={m._id} className="bg-gray-800">
                            {m.moduleCode} - {m.moduleName}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default ModulePicker;
