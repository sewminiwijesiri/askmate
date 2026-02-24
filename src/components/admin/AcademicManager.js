"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  ChevronRight, 
  FileText, 
  Link as LinkIcon, 
  ExternalLink,
  ChevronLeft,
  X,
  File as FileIcon
} from "lucide-react";

export default function AcademicManager() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(1);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newModule, setNewModule] = useState({ moduleName: "", moduleCode: "", description: "" });
  const [editingId, setEditingId] = useState(null);

  // Resource Management States
  const [selectedModule, setSelectedModule] = useState(null);
  const [resources, setResources] = useState([]);
  const [resLoading, setResLoading] = useState(false);
  const [isResModalOpen, setIsResModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [resData, setResData] = useState({ title: "", description: "", resourceType: "link", url: "" });

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    if (selectedModule) {
      fetchResources();
    }
  }, [selectedModule]);

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

  const fetchResources = async () => {
    try {
      setResLoading(true);
      const res = await fetch(`/api/resources?moduleId=${selectedModule._id}`);
      if (res.ok) {
        const data = await res.json();
        setResources(data);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setResLoading(false);
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
    if (!confirm("Are you sure? This will delete all associated data.")) return;
    try {
      const res = await fetch(`/api/admin/academic/${id}`, { method: "DELETE" });
      if (res.ok) fetchModules();
    } catch (error) {
      console.error("Error deleting module:", error);
    }
  };

  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const adminUser = JSON.parse(localStorage.getItem("user"));
    
    try {
      const method = editingResource ? "PATCH" : "POST";
      const url = editingResource ? `/api/resources/${editingResource._id}` : "/api/resources";
      
      const payload = {
        ...resData,
        module: selectedModule._id,
        uploadedBy: adminUser.userId,
        uploaderName: adminUser.name || adminUser.userId,
        uploaderRole: "admin"
      };

      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        fetchResources();
        setIsResModalOpen(false);
        setEditingResource(null);
        setResData({ title: "", description: "", resourceType: "link", url: "" });
      }
    } catch (error) {
      console.error("Error managing resource:", error);
    }
  };

  const handleDeleteResource = async (id) => {
    if (!confirm("Delete this resource?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchResources();
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  };

  const startEditResource = (resource) => {
    setEditingResource(resource);
    setResData({
      title: resource.title,
      description: resource.description,
      resourceType: resource.resourceType,
      url: resource.url
    });
    setIsResModalOpen(true);
  };

  const filteredModules = modules.filter(
    (m) => m.year === selectedYear && m.semester === selectedSemester
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Navigation Sidebar for Years/Semesters */}
        {!selectedModule && (
          <div className="w-full lg:w-72 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <GraduationCap size={16} className="text-blue-500" />
                Academic Year
              </h3>
              <div className="space-y-1">
                {[1, 2, 3, 4].map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${
                      selectedYear === year
                        ? "bg-[#002147] text-white shadow-lg shadow-blue-900/10"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <span>Year {year}</span>
                    {selectedYear === year && <ChevronRight size={16} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Calendar size={16} className="text-orange-500" />
                Semester
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2].map((sem) => (
                  <button
                    key={sem}
                    onClick={() => setSelectedSemester(sem)}
                    className={`py-3.5 rounded-xl font-bold transition-all text-center ${
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
        )}

        {/* Dynamic Display Area */}
        <div className="flex-1 space-y-6">
          {!selectedModule ? (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm min-h-[500px]">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-2xl font-black text-[#002147]">
                    Year {selectedYear}, Semester {selectedSemester}
                  </h2>
                  <p className="text-slate-500 font-medium mt-1">
                    Manage modules for this academic period.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingMode(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-[#002147] text-white rounded-2xl font-black text-sm hover:bg-[#003d82] transition-all shadow-lg shadow-blue-900/10 active:scale-95 translate-y-0 hover:-translate-y-1"
                >
                  <Plus size={18} />
                  New Module
                </button>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center h-[300px]">
                  <div className="w-10 h-10 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing Modules...</p>
                </div>
              ) : filteredModules.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-center bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                  <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center text-slate-200 mb-6">
                    <BookOpen size={40} />
                  </div>
                  <h3 className="text-xl font-extrabold text-[#002147] mb-2">Academic Void</h3>
                  <p className="text-slate-500 font-medium max-w-xs mx-auto">
                    Start building the curriculum by adding the first module.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredModules.map((module) => (
                    <div
                      key={module._id}
                      onClick={() => setSelectedModule(module)}
                      className="group bg-slate-50 border border-slate-100 p-6 rounded-[2rem] hover:bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500 cursor-pointer relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-blue-600 font-black text-sm shadow-sm group-hover:scale-110 transition-transform">
                          {module.moduleCode}
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteModule(module._id); }}
                            className="p-3 text-slate-300 hover:text-rose-500 transition-colors bg-white rounded-xl shadow-sm hover:shadow-md"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <h4 className="text-lg font-black text-[#002147] mb-2 group-hover:text-blue-600 transition-colors">
                        {module.moduleName}
                      </h4>
                      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed font-medium">
                        {module.description || "Comprehensive curriculum details for this specialized module."}
                      </p>
                      <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                         <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Manage Resources →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm min-h-[600px] animate-in slide-in-from-right-4 duration-500">
              <button 
                onClick={() => setSelectedModule(null)}
                className="flex items-center gap-2 text-slate-400 hover:text-[#002147] font-black text-xs uppercase tracking-widest mb-10 transition-all hover:-translate-x-1"
              >
                <ChevronLeft size={16} /> Back to Modules
              </button>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-[1.75rem] bg-[#002147] flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-blue-900/20">
                    {selectedModule.moduleCode}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-[#002147] tracking-tight mb-2">{selectedModule.moduleName}</h2>
                    <div className="flex items-center gap-3">
                       <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-blue-100">
                        {selectedModule.moduleCode}
                       </span>
                       <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                       <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Resources Repository</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsResModalOpen(true)}
                  className="flex items-center gap-2 px-8 py-4 bg-[#002147] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-blue-900/10 active:scale-95 translate-y-0 hover:-translate-y-1"
                >
                  <Plus size={18} />
                  Add Resource
                </button>
              </div>

              {resLoading ? (
                 <div className="flex flex-col items-center justify-center h-[300px]">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-orange-500 rounded-full animate-spin"></div>
                 </div>
              ) : resources.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[350px] text-center bg-slate-50/30 border-2 border-dashed border-slate-100 rounded-[3rem]">
                   <div className="w-24 h-24 bg-white shadow-sm rounded-[2rem] flex items-center justify-center text-slate-200 mb-8">
                     <FileText size={48} />
                   </div>
                   <h3 className="text-2xl font-black text-[#002147] mb-3">Resource Vault Empty</h3>
                   <p className="text-slate-500 font-semibold max-w-sm mx-auto leading-relaxed">
                     This module currently has no shared materials. Upload administrative or learning resources.
                   </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {resources.map((res) => (
                    <div key={res._id} className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-300 group">
                      <div className="flex justify-between items-start mb-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${res.resourceType === 'link' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
                          {res.resourceType === 'link' ? <LinkIcon size={24} /> : <FileIcon size={24} />}
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEditResource(res)} className="p-3 text-slate-400 bg-white rounded-xl shadow-sm hover:text-emerald-500 transition-colors">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDeleteResource(res._id)} className="p-3 text-slate-400 bg-white rounded-xl shadow-sm hover:text-rose-500 transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <h4 className="text-lg font-black text-[#002147] mb-2 group-hover:text-blue-600 transition-colors">{res.title}</h4>
                      <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-2 leading-relaxed">{res.description || "Administrative documentation for this module."}</p>
                      
                      <div className="flex items-center justify-between pt-6 border-t border-slate-200/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[10px] font-black text-[#002147] shadow-sm uppercase">
                             {(res.uploaderName || "A")[0]}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Uploaded By</p>
                            <p className="text-xs font-black text-slate-700 leading-none">{res.uploaderName}</p>
                          </div>
                        </div>
                        <a 
                          href={res.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#002147] rounded-xl font-black text-[10px] uppercase tracking-widest border border-slate-100 hover:bg-[#002147] hover:text-white transition-all shadow-sm"
                        >
                          View Resource <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Module Modal */}
      {isAddingMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#002147]/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-[#002147]">New Academic Module</h2>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Year {selectedYear} • Semester {selectedSemester}</p>
              </div>
              <button onClick={() => setIsAddingMode(false)} className="p-3 rounded-2xl hover:bg-slate-50 text-slate-400 transition-all">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddModule} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Module Name</label>
                <input
                  type="text"
                  required
                  value={newModule.moduleName}
                  onChange={(e) => setNewModule({ ...newModule, moduleName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-300"
                  placeholder="e.g., Quantum Computing Fundamentals"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Module Code</label>
                <input
                  type="text"
                  required
                  value={newModule.moduleCode}
                  onChange={(e) => setNewModule({ ...newModule, moduleCode: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-300"
                  placeholder="e.g., CS-Q402"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Abstract (Optional)</label>
                <textarea
                  value={newModule.description}
                  onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all h-32 resize-none placeholder:text-slate-300"
                  placeholder="The primary focus of this unit is..."
                />
              </div>
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setIsAddingMode(false)}
                  className="flex-1 px-8 py-4 bg-slate-100 text-[#002147] rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-8 py-4 bg-[#002147] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-blue-900/10"
                >
                  Confirm Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resource Modal */}
      {isResModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#002147]/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-2xl font-black text-[#002147]">{editingResource ? 'Modify Resource' : 'Archive Resource'}</h2>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  Global repository update for {selectedModule.moduleCode}
                </p>
              </div>
              <button onClick={() => { setIsResModalOpen(false); setEditingResource(null); }} className="p-3 rounded-2xl hover:bg-white text-slate-400 transition-all shadow-sm">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleResourceSubmit} className="p-10 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resource Title</label>
                <input
                  type="text"
                  required
                  value={resData.title}
                  onChange={(e) => setResData({ ...resData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-blue-500 transition-all"
                  placeholder="Material identification"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Media Format</label>
                  <select
                    value={resData.resourceType}
                    onChange={(e) => setResData({ ...resData, resourceType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-black focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="link">Hyperlink</option>
                    <option value="pdf">PDF Document</option>
                    <option value="word">MS Word Document</option>
                    <option value="text">Raw Text File</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access URL</label>
                  <input
                    type="url"
                    required
                    value={resData.url}
                    onChange={(e) => setResData({ ...resData, url: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-blue-500 transition-all"
                    placeholder="https://cloud.storage/res"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Administrative Note</label>
                <textarea
                  value={resData.description}
                  onChange={(e) => setResData({ ...resData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold h-32 resize-none focus:outline-none focus:border-blue-500 transition-all"
                  placeholder="Contextual information for students..."
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => { setIsResModalOpen(false); setEditingResource(null); }} className="flex-1 py-4 bg-slate-100 text-[#002147] rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Discard</button>
                <button type="submit" className="flex-1 py-4 bg-[#002147] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-900/10 transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
