"use client";

import { useState, useEffect } from "react";
import { 
  BookOpen, 
  ChevronRight, 
  FileText, 
  MessageSquare, 
  Search, 
  GraduationCap, 
  Calendar,
  Layers,
  Plus,
  ArrowRight,
  Download,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  MoreVertical,
  Edit2,
  Trash2,
  X,
  Link as LinkIcon,
  File as FileIcon,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function AcademicBrowser({ defaultYear, defaultSemester, user }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(defaultYear || 1);
  const [selectedSemester, setSelectedSemester] = useState(defaultSemester || 1);
  const [selectedModule, setSelectedModule] = useState(null);
  const [activeView, setActiveView] = useState("modules"); // modules, resources, qa
  const [searchQuery, setSearchQuery] = useState("");
  
  // Resource States
  const [resources, setResources] = useState([]);
  const [resLoading, setResLoading] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadData, setUploadData] = useState({ title: "", description: "", resourceType: "link", url: "" });
  const [editingResource, setEditingResource] = useState(null);

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    if (selectedModule && activeView === "resources") {
      fetchResources();
    }
  }, [selectedModule, activeView]);

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

  const handleUploadResource = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...uploadData,
        module: selectedModule._id,
        uploadedBy: user.userId,
        uploaderName: user.name || user.userId,
        uploaderRole: user.role
      };

      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        fetchResources();
        setIsUploadOpen(false);
        setUploadData({ title: "", description: "", resourceType: "link", url: "" });
      }
    } catch (error) {
      console.error("Error uploading resource:", error);
    }
  };

  const handleUpdateResource = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/resources/${editingResource._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...uploadData, userId: user.userId })
      });

      if (res.ok) {
        fetchResources();
        setEditingResource(null);
        setUploadData({ title: "", description: "", resourceType: "link", url: "" });
      }
    } catch (error) {
      console.error("Error updating resource:", error);
    }
  };

  const handleDeleteResource = async (id) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    try {
      const res = await fetch(`/api/resources/${id}?userId=${user.userId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchResources();
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  };

  const startEdit = (resource) => {
    setEditingResource(resource);
    setUploadData({
      title: resource.title,
      description: resource.description,
      resourceType: resource.resourceType,
      url: resource.url
    });
  };

  const filteredModules = modules.filter(
    (m) => 
      m.year === selectedYear && 
      m.semester === selectedSemester &&
      (m.moduleName.toLowerCase().includes(searchQuery.toLowerCase()) || 
       m.moduleCode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const resetSelection = () => {
    setSelectedModule(null);
    setActiveView("modules");
  };

  if (selectedModule) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* Module Header */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <button 
            onClick={resetSelection}
            className="flex items-center gap-2 text-slate-400 hover:text-[#002147] font-bold text-sm mb-6 transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Modules
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-[#002147] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-100">
                {selectedModule.moduleCode}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#002147] mb-1">
                  {selectedModule.moduleName}
                </h2>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                    {selectedModule.moduleCode}
                  </span>
                  <span className="text-slate-400 text-sm font-medium">
                    Year {selectedYear} • Sem {selectedSemester}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <button 
              onClick={() => setActiveView("resources")}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                activeView === "resources" 
                ? "bg-[#002147] text-white border-[#002147] shadow-lg shadow-blue-100" 
                : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-white hover:border-[#4DA8DA]/30"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeView === "resources" ? "bg-white/10" : "bg-white shadow-sm"}`}>
                <FileText size={20} className={activeView === "resources" ? "text-white" : "text-[#4DA8DA]"} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Resources</p>
                <p className="font-bold text-sm">Study Materials</p>
              </div>
            </button>

            <button 
              onClick={() => setActiveView("qa")}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                activeView === "qa" 
                ? "bg-[#002147] text-white border-[#002147] shadow-lg shadow-blue-100" 
                : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-white hover:border-[#4DA8DA]/30"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeView === "qa" ? "bg-white/10" : "bg-white shadow-sm"}`}>
                <HelpCircle size={20} className={activeView === "qa" ? "text-white" : "text-[#FF9F1C]"} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Consultation</p>
                <p className="font-bold text-sm">Q&A Hub</p>
              </div>
            </button>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 text-slate-600 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-500">
                <Layers size={20} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Status</p>
                <p className="font-bold text-sm">Insights</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[400px]">
          {activeView === "resources" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-[#002147]">Learning Resources</h3>
                  <p className="text-slate-500 text-sm mt-1">Shared materials for this module.</p>
                </div>
                <button 
                  onClick={() => setIsUploadOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#002147] text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-md active:scale-95"
                >
                  <Plus size={16} />
                  Contribute
                </button>
              </div>

              {resLoading ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 border-3 border-blue-50/10 border-t-[#FF9F1C] rounded-full animate-spin"></div>
                </div>
              ) : resources.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                   <p className="text-slate-400 font-bold text-sm">No resources yet.</p>
                   <button onClick={() => setIsUploadOpen(true)} className="mt-2 text-[#4DA8DA] font-bold text-sm hover:underline">Be the first to contribute</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources.map((res) => (
                    <div key={res._id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm ${res.resourceType === 'link' ? 'text-orange-500' : 'text-blue-500'}`}>
                          {res.resourceType === 'link' ? <LinkIcon size={20} /> : <FileIcon size={20} />}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a href={res.url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-[#4DA8DA]"><ExternalLink size={16} /></a>
                          {res.uploadedBy === user.userId && (
                            <>
                              <button onClick={() => startEdit(res)} className="p-2 text-slate-400 hover:text-emerald-500"><Edit2 size={16} /></button>
                              <button onClick={() => handleDeleteResource(res._id)} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
                            </>
                          )}
                        </div>
                      </div>
                      <h4 className="font-bold text-[#002147] mb-1">{res.title}</h4>
                      <p className="text-xs text-slate-500 font-medium mb-4 line-clamp-1">{res.description || "No description."}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">By {res.uploaderName}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-white border border-slate-100 rounded text-[9px] font-bold text-slate-400 uppercase">
                          {res.resourceType}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeView === "qa" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-[#002147]">Q&A Discussion</h3>
                  <p className="text-slate-500 text-sm mt-1">Get help from the community.</p>
                </div>
                <button className="px-5 py-2.5 bg-[#FF9F1C] text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-all shadow-md">
                  Ask Question
                </button>
              </div>
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                 <p className="text-slate-400 font-bold text-sm">No discussions started yet.</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal simplified */}
        {(isUploadOpen || editingResource) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-[#002147]">{editingResource ? 'Edit Resource' : 'Share Resource'}</h2>
                <button onClick={() => { setIsUploadOpen(false); setEditingResource(null); }} className="p-2 rounded-lg hover:bg-slate-50 text-slate-400">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={editingResource ? handleUpdateResource : handleUploadResource} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Title</label>
                  <input
                    type="text"
                    required
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium focus:outline-none focus:border-blue-500 transition-all"
                    placeholder="Resource name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Type</label>
                    <select
                      value={uploadData.resourceType}
                      onChange={(e) => setUploadData({ ...uploadData, resourceType: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="link">Link</option>
                      <option value="pdf">PDF</option>
                      <option value="word">Word</option>
                      <option value="text">Text</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">URL</label>
                    <input
                      type="url"
                      required
                      value={uploadData.url}
                      onChange={(e) => setUploadData({ ...uploadData, url: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium focus:outline-none focus:border-blue-500 transition-all"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Description</label>
                  <textarea
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium h-24 resize-none focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setIsUploadOpen(false); setEditingResource(null); }} className="flex-1 py-3 bg-slate-50 text-slate-500 rounded-xl font-bold text-sm">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-[#002147] text-white rounded-xl font-bold text-sm shadow-md">{editingResource ? 'Save' : 'Upload'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-64 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">Academic Year</h3>
            <div className="space-y-1">
              {[1, 2, 3, 4].map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-[13px] transition-all ${
                    selectedYear === year
                      ? "bg-[#002147] text-white shadow-md"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <span>Year {year}</span>
                  <ChevronRight size={14} className={selectedYear === year ? "opacity-100" : "opacity-0"} />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">Semester</h3>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2].map((sem) => (
                <button
                  key={sem}
                  onClick={() => setSelectedSemester(sem)}
                  className={`py-4 rounded-xl font-bold text-sm transition-all text-center flex flex-col items-center gap-1 ${
                    selectedSemester === sem
                      ? "bg-orange-50 text-orange-600 border border-orange-200"
                      : "bg-slate-50 text-slate-500 border border-transparent hover:bg-slate-100"
                  }`}
                >
                  <span className="text-[9px] opacity-60 uppercase">Sem</span>
                  <span className="text-lg leading-none">{sem}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modules List */}
        <div className="flex-1">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm min-h-[500px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
              <div>
                <h2 className="text-2xl font-bold text-[#002147] tracking-tight">Academic Hub</h2>
                <p className="text-slate-500 text-sm mt-1">Year {selectedYear} • Semester {selectedSemester}</p>
              </div>

              <div className="relative w-full sm:w-64 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text"
                  placeholder="Search modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-[300px]">
                <div className="w-8 h-8 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : filteredModules.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-center p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                <BookOpen size={40} className="text-slate-200 mb-4" />
                <h3 className="text-lg font-bold text-[#002147] mb-1">No modules found</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">Try selecting a different year or semester.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredModules.map((module) => (
                  <div
                    key={module._id}
                    onClick={() => setSelectedModule(module)}
                    className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="px-2 py-1 bg-white border border-slate-100 rounded text-[10px] font-bold text-[#002147] uppercase">
                        {module.moduleCode}
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-300 group-hover:bg-[#002147] group-hover:text-white transition-all">
                        <ArrowRight size={16} />
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-[#002147] mb-2">{module.moduleName}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {module.description || "Browse resources and discussions for " + module.moduleName}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
