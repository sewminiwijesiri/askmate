"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, BookOpen, GraduationCap, Calendar, ChevronRight } from "lucide-react";

export default function AcademicManager() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(1);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newModule, setNewModule] = useState({ moduleName: "", moduleCode: "", description: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/academic");
      if (res.ok) {
        const data = await res.json();
        setModules(data);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/academic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newModule, year: selectedYear, semester: selectedSemester }),
      });
      if (res.ok) {
        fetchModules();
        setNewModule({ moduleName: "", moduleCode: "", description: "" });
        setIsAddingMode(false);
      }
    } catch (error) {
      console.error("Error adding module:", error);
    }
  };

  const handleDeleteModule = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/admin/academic/${id}`, { method: "DELETE" });
      if (res.ok) fetchModules();
    } catch (error) {
      console.error("Error deleting module:", error);
    }
  };

  const filteredModules = modules.filter(
    (m) => m.year === selectedYear && m.semester === selectedSemester
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Navigation Sidebar for Years/Semesters */}
        <div className="w-full lg:w-72 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-black text-[#002147] uppercase tracking-wider mb-6 flex items-center gap-2">
              <GraduationCap size={18} className="text-blue-500" />
              Academic Year
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {[1, 2, 3, 4].map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${
                    selectedYear === year
                      ? "bg-blue-50 text-[#002147] border border-blue-100"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span>Year {year}</span>
                  {selectedYear === year && <ChevronRight size={16} />}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-black text-[#002147] uppercase tracking-wider mb-6 flex items-center gap-2">
              <Calendar size={18} className="text-orange-500" />
              Semester
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2].map((sem) => (
                <button
                  key={sem}
                  onClick={() => setSelectedSemester(sem)}
                  className={`px-4 py-3 rounded-xl font-bold transition-all text-center ${
                    selectedSemester === sem
                      ? "bg-orange-50 text-orange-700 border border-orange-100"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  Sem {sem}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modules List */}
        <div className="flex-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm min-h-[500px]">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-2xl font-black text-[#002147]">
                  Year {selectedYear}, Semester {selectedSemester} Modules
                </h2>
                <p className="text-slate-500 font-medium mt-1">
                  Manage modules for this academic period.
                </p>
              </div>
              <button
                onClick={() => setIsAddingMode(true)}
                className="flex items-center gap-2 px-6 py-3 bg-[#002147] text-white rounded-2xl font-black text-sm hover:bg-[#003d82] transition-all shadow-lg shadow-blue-900/10 active:scale-95"
              >
                <Plus size={18} />
                Add Module
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-[300px]">
                <div className="w-10 h-10 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-bold">Loading modules...</p>
              </div>
            ) : filteredModules.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-center border-2 border-dashed border-slate-100 rounded-3xl">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                  <BookOpen size={32} />
                </div>
                <h3 className="text-xl font-extrabold text-[#002147] mb-2">No modules found</h3>
                <p className="text-slate-500 font-medium max-w-xs mx-auto">
                  Start by adding the first module for Year {selectedYear} Semester {selectedSemester}.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredModules.map((module) => (
                  <div
                    key={module._id}
                    className="group bg-slate-50 border border-slate-100 p-6 rounded-3xl hover:bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-blue-500 font-black text-xs shadow-sm group-hover:bg-blue-50 transition-colors">
                        {module.moduleCode}
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-blue-500 transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteModule(module._id)}
                          className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <h4 className="text-lg font-black text-[#002147] mb-2 group-hover:text-blue-600 transition-colors">
                      {module.moduleName}
                    </h4>
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed font-medium">
                      {module.description || "No description provided for this module."}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Module Modal */}
      {isAddingMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100">
              <h2 className="text-2xl font-black text-[#002147]">Add New Module</h2>
              <p className="text-slate-500 font-medium">Year {selectedYear}, Semester {selectedSemester}</p>
            </div>
            <form onSubmit={handleAddModule} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Module Name</label>
                <input
                  type="text"
                  required
                  value={newModule.moduleName}
                  onChange={(e) => setNewModule({ ...newModule, moduleName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-6 text-sm font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="e.g., Advanced Database Systems"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Module Code</label>
                <input
                  type="text"
                  required
                  value={newModule.moduleCode}
                  onChange={(e) => setNewModule({ ...newModule, moduleCode: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-6 text-sm font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="e.g., CS401"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description (Optional)</label>
                <textarea
                  value={newModule.description}
                  onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-6 text-sm font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all h-28 resize-none"
                  placeholder="Brief overview of the module content..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddingMode(false)}
                  className="flex-1 px-6 py-4 border border-slate-200 text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-[#002147] text-white rounded-2xl font-black text-sm hover:bg-[#003d82] transition-all shadow-lg shadow-blue-900/10"
                >
                  Create Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
