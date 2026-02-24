"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, BookOpen, Layers, Calendar, ChevronRight } from "lucide-react";

export default function AcademicManager() {
  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newYear, setNewYear] = useState("");
  const [newSemester, setNewSemester] = useState({ name: "", yearId: "" });
  const [newModule, setNewModule] = useState({ name: "", code: "", semesterId: "", description: "" });

  const [activeYear, setActiveYear] = useState(null);
  const [activeSemester, setActiveSemester] = useState(null);

  useEffect(() => {
    fetchYears();
  }, []);

  const fetchYears = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/admin/academic/years", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setYears(data);
    }
  };

  const fetchSemesters = async (yearId) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/admin/academic/semesters?yearId=${yearId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setSemesters(data);
      setActiveYear(yearId);
      setActiveSemester(null);
      setModules([]);
    }
  };

  const fetchModules = async (semesterId) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/admin/academic/modules?semesterId=${semesterId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setModules(data);
      setActiveSemester(semesterId);
    }
  };

  const handleAddYear = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch("/api/admin/academic/years", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ name: newYear })
    });
    if (res.ok) {
      setNewYear("");
      fetchYears();
    }
  };

  const handleAddSemester = async (e) => {
    e.preventDefault();
    if (!newSemester.yearId) return;
    const token = localStorage.getItem("token");
    const res = await fetch("/api/admin/academic/semesters", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(newSemester)
    });
    if (res.ok) {
      setNewSemester({ ...newSemester, name: "" });
      fetchSemesters(newSemester.yearId);
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!newModule.semesterId) return;
    const token = localStorage.getItem("token");
    const res = await fetch("/api/admin/academic/modules", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(newModule)
    });
    if (res.ok) {
      setNewModule({ name: "", code: "", semesterId: newModule.semesterId, description: "" });
      fetchModules(newModule.semesterId);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Years Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-black text-[#002147] flex items-center gap-2">
              <Calendar size={20} className="text-blue-500" />
              Academic Years
            </h3>
          </div>
          <div className="p-4 border-b border-slate-100">
            <form onSubmit={handleAddYear} className="flex gap-2">
              <input 
                type="text" 
                placeholder="e.g. Year 1" 
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                required
              />
              <button type="submit" className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all">
                <Plus size={20} />
              </button>
            </form>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {years.map(year => (
              <button
                key={year._id}
                onClick={() => fetchSemesters(year._id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  activeYear === year._id 
                  ? "bg-blue-50 border-blue-200 text-[#002147] shadow-sm" 
                  : "bg-white border-slate-100 text-slate-600 hover:border-slate-300"
                }`}
              >
                <span className="font-bold">{year.name}</span>
                <ChevronRight size={18} className={activeYear === year._id ? "text-blue-500" : "text-slate-300"} />
              </button>
            ))}
          </div>
        </div>

        {/* Semesters Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-black text-[#002147] flex items-center gap-2">
              <Layers size={20} className="text-orange-500" />
              Semesters
            </h3>
          </div>
          <div className="p-4 border-b border-slate-100">
            <form onSubmit={handleAddSemester} className="flex gap-2">
              <input 
                type="text" 
                placeholder="e.g. Semester 1" 
                value={newSemester.name}
                onChange={(e) => setNewSemester({ ...newSemester, name: e.target.value, yearId: activeYear })}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                disabled={!activeYear}
                required
              />
              <button 
                type="submit" 
                className="p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all disabled:opacity-50"
                disabled={!activeYear}
              >
                <Plus size={20} />
              </button>
            </form>
            {!activeYear && <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase italic">Select a year first</p>}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {semesters.map(sem => (
              <button
                key={sem._id}
                onClick={() => fetchModules(sem._id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  activeSemester === sem._id 
                  ? "bg-orange-50 border-orange-200 text-[#002147] shadow-sm" 
                  : "bg-white border-slate-100 text-slate-600 hover:border-slate-300"
                }`}
              >
                <span className="font-bold">{sem.name}</span>
                <ChevronRight size={18} className={activeSemester === sem._id ? "text-orange-500" : "text-slate-300"} />
              </button>
            ))}
            {activeYear && semesters.length === 0 && (
              <div className="text-center py-10">
                <p className="text-slate-400 text-sm font-medium">No semesters added yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Modules Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-black text-[#002147] flex items-center gap-2">
              <BookOpen size={20} className="text-emerald-500" />
              Modules
            </h3>
          </div>
          <div className="p-4 border-b border-slate-100 space-y-2">
            <input 
              type="text" 
              placeholder="Module Name" 
              value={newModule.name}
              onChange={(e) => setNewModule({ ...newModule, name: e.target.value, semesterId: activeSemester })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
              disabled={!activeSemester}
            />
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Code" 
                value={newModule.code}
                onChange={(e) => setNewModule({ ...newModule, code: e.target.value })}
                className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                disabled={!activeSemester}
              />
              <button 
                onClick={handleAddModule}
                className="flex-1 bg-emerald-500 text-white rounded-xl py-2 font-bold hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={!activeSemester || !newModule.name || !newModule.code}
              >
                <Plus size={18} /> Add Module
              </button>
            </div>
            {!activeSemester && <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase italic">Select a semester first</p>}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {modules.map(mod => (
              <div
                key={mod._id}
                className="w-full p-4 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider mb-2 inline-block">
                      {mod.code}
                    </span>
                    <h4 className="font-extrabold text-[#002147] leading-tight">{mod.name}</h4>
                  </div>
                  <button className="text-slate-300 hover:text-rose-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {activeSemester && modules.length === 0 && (
              <div className="text-center py-10">
                <p className="text-slate-400 text-sm font-medium">No modules added yet</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
