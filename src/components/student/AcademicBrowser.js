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
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Module Header */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-60"></div>
          
          <button 
            onClick={resetSelection}
            className="flex items-center gap-2 text-slate-400 hover:text-[#002147] font-bold text-sm mb-6 transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Year {selectedYear} Modules
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#002147] to-[#003d82] flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-900/20">
                {selectedModule.moduleCode}
              </div>
              <div>
                <h2 className="text-3xl font-black text-[#002147] leading-tight mb-1">
                  {selectedModule.moduleName}
                </h2>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-wider">
                    {selectedModule.moduleCode}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                  <span className="text-slate-500 font-bold text-sm">
                    Level {selectedYear} • Semester {selectedSemester}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
            <button 
              onClick={() => setActiveView("resources")}
              className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${
                activeView === "resources" 
                ? "bg-[#002147] text-white border-[#002147] shadow-xl shadow-blue-900/10" 
                : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-white hover:border-blue-200"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeView === "resources" ? "bg-white/10" : "bg-white shadow-sm"}`}>
                <FileText size={22} className={activeView === "resources" ? "text-white" : "text-blue-500"} />
              </div>
              <div className="text-left">
                <p className="text-xs font-black uppercase tracking-widest opacity-60">Study Materials</p>
                <p className="font-black">Access Resources</p>
              </div>
            </button>

            <button 
              onClick={() => setActiveView("qa")}
              className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${
                activeView === "qa" 
                ? "bg-[#002147] text-white border-[#002147] shadow-xl shadow-blue-900/10" 
                : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-white hover:border-blue-200"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeView === "qa" ? "bg-white/10" : "bg-white shadow-sm"}`}>
                <HelpCircle size={22} className={activeView === "qa" ? "text-white" : "text-orange-500"} />
              </div>
              <div className="text-left">
                <p className="text-xs font-black uppercase tracking-widest opacity-60">Peer Discussion</p>
                <p className="font-black">Ask & Answer</p>
              </div>
            </button>

            <button className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 text-slate-600 border border-slate-100 hover:bg-white hover:border-blue-200 transition-all">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-500">
                <Layers size={22} />
              </div>
              <div className="text-left">
                <p className="text-xs font-black uppercase tracking-widest opacity-60">Module Stats</p>
                <p className="font-black">Insights</p>
              </div>
            </button>
          </div>
        </div>

        {/* Dynamic Content Based on activeView */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm min-h-[400px]">
          {activeView === "resources" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-[#002147]">Learning Resources</h3>
                  <p className="text-slate-500 font-medium mt-1">Lecture notes, presentations, and tutorials.</p>
                </div>
                <button 
                  onClick={() => setIsUploadOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-[#002147] text-white rounded-2xl font-black text-sm hover:bg-[#003d82] transition-all shadow-lg shadow-blue-900/10 active:scale-95"
                >
                  <Plus size={18} />
                  Contribute
                </button>
              </div>

              {resLoading ? (
                <div className="flex flex-col items-center justify-center h-[200px]">
                  <div className="w-10 h-10 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              ) : resources.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-center border-2 border-dashed border-slate-100 rounded-3xl p-8">
                   <p className="text-slate-400 font-bold">No resources uploaded yet for this module.</p>
                   <button onClick={() => setIsUploadOpen(true)} className="mt-4 text-blue-600 font-black text-sm hover:underline">Be the first to contribute!</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources.map((res) => (
                    <div key={res._id} className="group p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm ${res.resourceType === 'link' ? 'text-orange-500' : 'text-blue-500'}`}>
                          {res.resourceType === 'link' ? <LinkIcon size={24} /> : <FileIcon size={24} />}
                        </div>
                        <div className="flex items-center gap-1">
                          <a 
                            href={res.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                          >
                            <ExternalLink size={20} />
                          </a>
                          {res.uploadedBy === user.userId && (
                            <>
                              <button onClick={() => startEdit(res)} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                                <Edit2 size={18} />
                              </button>
                              <button onClick={() => handleDeleteResource(res._id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <h4 className="font-black text-[#002147] mb-1 group-hover:text-blue-600 transition-colors">{res.title}</h4>
                      <p className="text-sm text-slate-500 font-medium mb-4 line-clamp-2">{res.description || "No description provided."}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">By {res.uploaderName}</span>
                           <span className="text-[9px] font-bold text-slate-300 uppercase">{new Date(res.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-tight">
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
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-[#002147]">Question & Answer</h3>
                  <p className="text-slate-500 font-medium mt-1">Get help from helpers and lecturers.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-[#FF9F1C] text-white rounded-2xl font-black text-sm hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20">
                  <MessageCircle size={18} />
                  Ask a Question
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center h-[200px] text-center border-2 border-dashed border-slate-100 rounded-3xl p-8">
                   <p className="text-slate-400 font-bold">The Q&A community is growing. Start a discussion!</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Upload/Edit Modal */}
        {(isUploadOpen || editingResource) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-[#002147]">{editingResource ? 'Edit Resource' : 'Share Resource'}</h2>
                  <p className="text-slate-500 font-medium">For {selectedModule.moduleName}</p>
                </div>
                <button onClick={() => { setIsUploadOpen(false); setEditingResource(null); }} className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={editingResource ? handleUpdateResource : handleUploadResource} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                  <input
                    type="text"
                    required
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-6 text-sm font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    placeholder="e.g., Week 1 Algorithms Notes"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                    <select
                      value={uploadData.resourceType}
                      onChange={(e) => setUploadData({ ...uploadData, resourceType: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-6 text-sm font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                    >
                      <option value="link">Useful Link</option>
                      <option value="pdf">PDF Document</option>
                      <option value="word">Word Doc</option>
                      <option value="text">Plain Text</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resource URL</label>
                    <input
                      type="url"
                      required
                      value={uploadData.url}
                      onChange={(e) => setUploadData({ ...uploadData, url: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-6 text-sm font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description (Optional)</label>
                  <textarea
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-6 text-sm font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all h-28 resize-none"
                    placeholder="Provide some context about this resource..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => { setIsUploadOpen(false); setEditingResource(null); }}
                    className="flex-1 px-6 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-4 bg-[#002147] text-white rounded-2xl font-black text-sm hover:bg-[#003d82] transition-all shadow-xl shadow-blue-900/10 active:scale-95"
                  >
                    {editingResource ? 'Save Changes' : 'Upload Resource'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar for Years/Semesters */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#002147]"></div>
            <h3 className="text-xs font-black text-[#002147] uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <GraduationCap size={18} className="text-blue-500" />
              Academic Year
            </h3>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-black text-sm transition-all duration-300 ${
                    selectedYear === year
                      ? "bg-[#002147] text-white shadow-xl shadow-blue-900/20 translate-x-1"
                      : "text-slate-500 hover:bg-slate-50 hover:text-[#002147]"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] ${selectedYear === year ? "bg-white/20" : "bg-slate-100"}`}>
                      Y{year}
                    </span>
                    Year {year}
                  </span>
                  <ChevronRight size={16} className={selectedYear === year ? "opacity-100" : "opacity-0"} />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#FF9F1C]"></div>
            <h3 className="text-xs font-black text-[#002147] uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <Calendar size={18} className="text-orange-500" />
              Semester
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2].map((sem) => (
                <button
                  key={sem}
                  onClick={() => setSelectedSemester(sem)}
                  className={`px-4 py-6 rounded-2xl font-black text-sm transition-all duration-300 text-center flex flex-col items-center gap-2 ${
                    selectedSemester === sem
                      ? "bg-orange-50 text-orange-700 border-2 border-orange-200 shadow-lg shadow-orange-500/5 scale-105"
                      : "bg-slate-50 text-slate-500 border-2 border-transparent hover:bg-slate-100"
                  }`}
                >
                  <span className="text-[10px] opacity-60 uppercase tracking-widest">Sem</span>
                  <span className="text-xl leading-none">{sem}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modules List */}
        <div className="flex-1 space-y-6">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm min-h-[600px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-full -mr-48 -mt-48 blur-3xl opacity-50"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8 relative z-10">
              <div>
                <h2 className="text-4xl font-black text-[#002147] tracking-tight">
                  Academic <span className="text-blue-600">Modules</span>
                </h2>
                <p className="text-slate-500 font-semibold mt-2">
                  Browse Year {selectedYear}, Semester {selectedSemester} resources.
                </p>
              </div>

              <div className="relative w-full md:w-80 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  type="text"
                  placeholder="Filter modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] text-sm font-bold focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100/50 transition-all"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-[400px]">
                <div className="w-16 h-16 border-[6px] border-blue-500/10 border-t-blue-500 rounded-full animate-spin mb-6"></div>
                <p className="text-slate-400 font-black tracking-widest text-xs uppercase">Fetching Modules...</p>
              </div>
            ) : filteredModules.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center p-12 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 mt-4">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-slate-200 mb-8 shadow-sm">
                  <BookOpen size={48} />
                </div>
                <h3 className="text-2xl font-black text-[#002147] mb-3">No modules found</h3>
                <p className="text-slate-500 font-semibold max-w-sm mx-auto leading-relaxed">
                  There are currently no modules listed for Year {selectedYear} Semester {selectedSemester} in our directory.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {filteredModules.map((module) => (
                  <div
                    key={module._id}
                    onClick={() => setSelectedModule(module)}
                    className="group bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem] hover:bg-white hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-[#002147] font-black text-sm shadow-sm group-hover:bg-blue-50 transition-colors group-hover:scale-110 duration-500">
                        {module.moduleCode}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                    <h4 className="text-xl font-black text-[#002147] mb-3 group-hover:text-blue-600 transition-colors">
                      {module.moduleName}
                    </h4>
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed font-medium mb-6">
                      {module.description || "Comprehensive coverage of " + module.moduleName + " principles and practical applications."}
                    </p>
                    <div className="flex items-center gap-4 pt-6 border-t border-slate-200/50">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <FileText size={14} className="text-blue-500" /> Help Resources
                      </div>
                    </div>
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
