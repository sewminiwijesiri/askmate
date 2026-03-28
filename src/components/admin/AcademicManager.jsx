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
  File as FileIcon,
  Search,
  Download,
  Thermometer,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  MessageSquare
} from "lucide-react";

export default function AcademicManager() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(1);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newModule, setNewModule] = useState({ moduleName: "", moduleCode: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [moduleErrors, setModuleErrors] = useState({});
  const [touched, setTouched] = useState({});


  // Resource Management States
  const [selectedModule, setSelectedModule] = useState(null);
  const [resources, setResources] = useState([]);
  const [resLoading, setResLoading] = useState(false);
  const [isResModalOpen, setIsResModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [resData, setResData] = useState({ title: "", description: "", resourceType: "link", category: "Short Note", url: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [resourceCategory, setResourceCategory] = useState("All");
  const [resourceSearchQuery, setResourceSearchQuery] = useState("");

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    if (selectedModule) {
      fetchResources();
    }
  }, [selectedModule]);

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
      const res = await fetch(`/api/resources?moduleId=${selectedModule._id}&status=all`);
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

  const startEditModule = (e, module) => {
    e.stopPropagation();
    setEditingModule(module);
    setNewModule({
      moduleName: module.moduleName,
      moduleCode: module.moduleCode,
      description: module.description || ""
    });
    setModuleErrors({});
    setTouched({});
    setIsAddingMode(true);
  };

  const validateModuleForm = () => {
    const errors = {};
    if (!newModule.moduleName || !newModule.moduleName.trim()) {
      errors.moduleName = "Module name is required";
    }
    
    const moduleCodeRegex = /^IT\d{4}$/;
    if (!newModule.moduleCode || !newModule.moduleCode.trim()) {
      errors.moduleCode = "Module code is required";
    } else if (!moduleCodeRegex.test(newModule.moduleCode.trim())) {
      errors.moduleCode = "Module code must follow the pattern ITXXXX (e.g. IT3050)";
    }
    return errors;
  };

  const handleModuleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errors = validateModuleForm();
    setModuleErrors(errors);
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    const errors = validateModuleForm();
    if (Object.keys(errors).length > 0) {
      setModuleErrors(errors);
      setTouched({ moduleName: true, moduleCode: true });
      return;
    }

    try {
      const res = await fetch("/api/admin/academic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newModule, year: selectedYear, semester: selectedSemester }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        fetchModules();
        setNewModule({ moduleName: "", moduleCode: "", description: "" });
        setModuleErrors({});
        setTouched({});
        setIsAddingMode(false);
      } else {
        // Set API error to the specific field if possible
        if (data.error && data.error.toLowerCase().includes("module code")) {
          setModuleErrors({ ...errors, moduleCode: data.error });
        } else {
          setModuleErrors({ ...errors, global: data.error || "Failed to add module" });
        }
      }
    } catch (error) {
      console.error("Error adding module:", error);
      setModuleErrors({ ...errors, global: "Connection error. Please try again." });
    }
  };

  const handleUpdateModule = async (e) => {
    e.preventDefault();
    const errors = validateModuleForm();
    if (Object.keys(errors).length > 0) {
      setModuleErrors(errors);
      setTouched({ moduleName: true, moduleCode: true });
      return;
    }

    try {
      const res = await fetch(`/api/admin/academic/${editingModule._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newModule),
      });

      const data = await res.json();

      if (res.ok) {
        fetchModules();
        setNewModule({ moduleName: "", moduleCode: "", description: "" });
        setEditingModule(null);
        setModuleErrors({});
        setTouched({});
        setIsAddingMode(false);
      } else {
        // Set API error to the specific field if possible
        if (data.error && data.error.toLowerCase().includes("module code")) {
          setModuleErrors({ ...errors, moduleCode: data.error });
        } else {
          setModuleErrors({ ...errors, global: data.error || "Failed to update module" });
        }
      }
    } catch (error) {
      console.error("Error updating module:", error);
      setModuleErrors({ ...errors, global: "Connection error. Please try again." });
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
      setIsUploading(true);
      const method = editingResource ? "PATCH" : "POST";
      const url = editingResource ? `/api/resources/${editingResource._id}` : "/api/resources";

      const formData = new FormData();
      formData.append("title", resData.title);
      formData.append("description", resData.description);
      formData.append("resourceType", resData.resourceType);
      formData.append("category", resData.category);
      formData.append("module", selectedModule._id);
      formData.append("uploadedBy", adminUser?.userId || "admin");
      formData.append("uploaderName", adminUser?.name || (adminUser?.role === 'admin' ? 'Administrator' : adminUser?.userId || 'Admin'));
      formData.append("uploaderRole", adminUser?.role || "admin");

      if (selectedFile) {
        formData.append("file", selectedFile);
      } else {
        formData.append("url", resData.url);
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        fetchResources();
        setIsResModalOpen(false);
        setEditingResource(null);
        setResData({ title: "", description: "", resourceType: "link", category: "Short Note", url: "" });
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Error managing resource:", error);
    } finally {
      setIsUploading(false);
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

  const handleApproveResource = async (id, status = "approved") => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchResources();
    } catch (error) {
      console.error("Error approving resource:", error);
    }
  };

  const startEditResource = (resource) => {
    setEditingResource(resource);
    setResData({
      title: resource.title,
      description: resource.description,
      resourceType: resource.resourceType,
      category: resource.category || "Short Note",
      url: resource.url
    });
    setSelectedFile(null);
    setIsResModalOpen(true);
  };

  const filteredModules = modules.filter(
    (m) => m.year === selectedYear && m.semester === selectedSemester
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar for Years/Semesters */}
        {!selectedModule && (
          <div className="w-full lg:w-64 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <GraduationCap size={14} className="text-indigo-500" />
                Academic Year
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${selectedYear === year
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "text-slate-500 border-slate-100 hover:bg-slate-50"
                      }`}
                  >
                    Y{year}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Calendar size={14} className="text-amber-500" />
                Semester
              </h3>
              <div className="flex flex-col gap-2">
                {[1, 2].map((sem) => (
                  <button
                    key={sem}
                    onClick={() => setSelectedSemester(sem)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border text-left ${selectedSemester === sem
                      ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                      : "text-slate-500 border-slate-100 hover:bg-slate-50"
                      }`}
                  >
                    Semester {sem}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Dynamic Display Area */}
        <div className="flex-1 space-y-6">
          {!selectedModule ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm min-h-[500px]">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-bold text-rose-600">
                    Year {selectedYear} / Sem {selectedSemester}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Managing {filteredModules.length} core subject modules
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingMode(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95"
                >
                  <Plus size={16} />
                  Add Module
                </button>
              </div>


              {loading ? (
                <div className="flex flex-col items-center justify-center h-[300px]">
                  <div className="w-8 h-8 border-3 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin mb-3"></div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Syncing modules...</p>
                </div>
              ) : filteredModules.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                  <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center text-slate-300 mb-4">
                    <BookOpen size={30} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">No modules found</h3>
                  <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
                    Start defining the curriculum for this period.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredModules.map((module) => (
                    <div
                      key={module._id}
                      onClick={() => setSelectedModule(module)}
                      className="group bg-white border border-slate-100 p-6 rounded-xl hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 cursor-pointer relative"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[11px] font-black uppercase tracking-wider">
                          {module.moduleCode}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => startEditModule(e, module)}
                            className="p-2.5 text-slate-300 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                            title="Edit Module"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteModule(module._id); }}
                            className="p-2.5 text-slate-300 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50"
                            title="Delete Module"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                      </div>
                      <h4 className="text-md font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                        {module.moduleName}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                        {module.description || "In-depth study and practical applications for this module segment."}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm min-h-[600px] animate-in slide-in-from-right-2 duration-500">
              <button
                onClick={() => setSelectedModule(null)}
                className="flex items-center gap-1 text-slate-400 hover:text-indigo-600 font-bold text-[11px] uppercase tracking-widest mb-8 transition-all"
              >
                <ChevronLeft size={14} /> Back to Modules
              </button>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div className="flex items-center gap-5">
                  <div className="w-fit min-w-[4rem] px-5 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-100">
                    {selectedModule.moduleCode}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{selectedModule.moduleName}</h2>
                    <div className="flex items-center gap-2.5 mt-1">
                      <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">
                        {selectedModule.moduleCode}
                      </span>
                      <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                      <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">Global Repository</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsResModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                >
                  <Plus size={16} />
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
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 pb-8 border-b border-slate-100">
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setResourceCategory("All")}
                        className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border ${resourceCategory === "All" ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                      >
                        All
                      </button>
                      {["Short Note", "Lecture Note", "YouTube Link", "Past Paper", "Tutorial", "Other"].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setResourceCategory(cat)}
                          className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border ${resourceCategory === cat ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <div className="relative w-full xl:w-80 group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={14} strokeWidth={2.5} />
                      <input
                        type="text"
                        placeholder="Search for materials..."
                        value={resourceSearchQuery}
                        onChange={(e) => setResourceSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {resources
                      .filter(r => resourceCategory === "All" || r.category === resourceCategory)
                      .filter(r => r.title.toLowerCase().includes(resourceSearchQuery.toLowerCase()) || (r.description && r.description.toLowerCase().includes(resourceSearchQuery.toLowerCase())))
                      .map((res) => (
                        <div key={res._id} className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group relative">
                          <div className="flex justify-between items-start mb-6">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${res.category === 'YouTube Link' ? 'bg-rose-50 text-rose-600' : res.category === 'Lecture Note' ? 'bg-emerald-50 text-emerald-600' : res.category === 'Past Paper' ? 'bg-orange-50 text-orange-600' : 'bg-indigo-50 text-indigo-600'}`}>
                              {res.resourceType === 'link' ? <LinkIcon size={20} /> : <FileIcon size={20} />}
                            </div>
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {res.resourceType !== 'link' && (
                                <button
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = res.url;
                                    link.download = res.title || 'download';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                  className="p-2 text-slate-400 hover:text-amber-500 transition-colors rounded-lg hover:bg-amber-50"
                                  title="Download"
                                >
                                  <Download size={16} />
                                </button>
                              )}
                              <button onClick={() => startEditResource(res)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => handleDeleteResource(res._id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          <h4 className="text-lg font-bold text-slate-900 leading-snug mb-2 flex items-center gap-2">
                            {res.title}
                            {res.status === "pending" && <span className="bg-amber-500 w-2 h-2 rounded-full animate-pulse"></span>}
                          </h4>

                          <p className="text-xs text-slate-500 font-medium mb-6 line-clamp-2 leading-relaxed h-8">
                            {res.description || "Core reference material for structural analysis."}
                          </p>

                          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200">
                                {(res.uploaderName || "U")[0].toUpperCase()}
                              </div>
                              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                                {res.uploaderName || 'Admin'}
                              </span>
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${res.category === 'YouTube Link' ? 'bg-rose-50 text-rose-600 border-rose-100' : res.category === 'Lecture Note' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : res.category === 'Past Paper' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                              {res.category || "General"}
                            </span>
                          </div>

                          <div className="mt-6 flex gap-2">
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-600 rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-indigo-600 hover:text-white transition-all"
                            >
                              Access <ExternalLink size={12} />
                            </a>
                            {res.status === "pending" && (
                              <div className="flex gap-2 flex-1">
                                <button
                                  onClick={() => handleApproveResource(res._id, "approved")}
                                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-indigo-700 shadow-sm"
                                >
                                  OK
                                </button>
                                <button
                                  onClick={() => handleApproveResource(res._id, "rejected")}
                                  className="p-2.5 bg-white border border-rose-200 text-rose-500 rounded-lg hover:bg-rose-50"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Module Modal */}
      {isAddingMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{editingModule ? "Update Academic Module" : "New Academic Module"}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Year {selectedYear} • Semester {selectedSemester}</p>
              </div>
              <button onClick={() => { setIsAddingMode(false); setEditingModule(null); setNewModule({ moduleName: "", moduleCode: "", description: "" }); setModuleErrors({}); setTouched({}); }} className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={editingModule ? handleUpdateModule : handleAddModule} className="p-8 space-y-5">
              {moduleErrors.global && (
                <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="text-rose-500 flex-shrink-0" size={18} />
                  <p className="text-xs font-bold text-rose-600">{moduleErrors.global}</p>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">Module Name</label>
                <input
                  type="text"
                  value={newModule.moduleName}
                  onBlur={() => handleModuleBlur("moduleName")}
                  onChange={(e) => {
                    setNewModule({ ...newModule, moduleName: e.target.value });
                    setTouched((prev) => ({ ...prev, moduleName: true }));
                    const errors = validateModuleForm();
                    setModuleErrors(errors);
                  }}
                  className={`w-full bg-slate-50 border ${touched.moduleName && moduleErrors.moduleName ? 'border-rose-500 bg-rose-50/10' : 'border-slate-200'} rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-300`}
                  placeholder="Enter module name"
                />
                {touched.moduleName && moduleErrors.moduleName && (
                  <p className="text-[10px] font-bold text-rose-500 ml-1 mt-1 ring-offset-2 animate-in fade-in slide-in-from-top-1 duration-200">{moduleErrors.moduleName}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">Module Reference Code</label>
                <input
                  type="text"
                  value={newModule.moduleCode}
                  onBlur={() => handleModuleBlur("moduleCode")}
                  onChange={(e) => {
                    setNewModule({ ...newModule, moduleCode: e.target.value });
                    setTouched((prev) => ({ ...prev, moduleCode: true }));
                    const errors = validateModuleForm();
                    setModuleErrors(errors);
                  }}
                  className={`w-full bg-slate-50 border ${touched.moduleCode && moduleErrors.moduleCode ? 'border-rose-500 bg-rose-50/10' : 'border-slate-200'} rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-300`}
                  placeholder="e.g. IT3050"
                />
                {touched.moduleCode && moduleErrors.moduleCode && (
                  <p className="text-[10px] font-bold text-rose-500 ml-1 mt-1 ring-offset-2 animate-in fade-in slide-in-from-top-1 duration-200">{moduleErrors.moduleCode}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center mr-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">Brief Overview</label>
                  <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Optional</span>
                </div>
                <textarea
                  value={newModule.description}
                  onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all h-24 resize-none placeholder:text-slate-300"
                  placeholder="Describe the module focus..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setIsAddingMode(false); setEditingModule(null); setNewModule({ moduleName: "", moduleCode: "", description: "" }); setModuleErrors({}); setTouched({}); }}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                >
                  {editingModule ? "Save Changes" : "Create Module"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resource Modal */}
      {isResModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{editingResource ? 'Update resource' : 'Catalog New Resource'}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                  Modifying repository for {selectedModule.moduleCode}
                </p>
              </div>
              <button onClick={() => { setIsResModalOpen(false); setEditingResource(null); setSelectedFile(null); }} className="p-2 rounded-lg hover:bg-white text-slate-400 transition-all shadow-sm">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleResourceSubmit} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">Resource Name</label>
                <input
                  type="text"
                  required
                  value={resData.title}
                  onChange={(e) => setResData({ ...resData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-indigo-500 transition-all"
                  placeholder="Title for this material"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">Media Type</label>
                  <div className="relative">
                    <select
                      value={resData.resourceType}
                      onChange={(e) => setResData({ ...resData, resourceType: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer pr-10"
                    >
                      <option value="link">Public URL</option>
                      <option value="pdf">PDF File</option>
                      <option value="word">Word Doc</option>
                      <option value="text">Text File</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">{resData.resourceType === 'link' ? 'Source URL' : 'Upload File'}</label>
                  {resData.resourceType === 'link' ? (
                    <input
                      type="url"
                      required
                      value={resData.url}
                      onChange={(e) => setResData({ ...resData, url: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-indigo-500 transition-all"
                      placeholder="https://..."
                    />
                  ) : (
                    <div className="relative group">
                      <input
                        type="file"
                        required={!editingResource}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          setSelectedFile(file);
                          if (file && !resData.title) {
                            setResData({ ...resData, title: file.name.split('.')[0] });
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        accept={resData.resourceType === 'pdf' ? '.pdf' : resData.resourceType === 'word' ? '.doc,.docx' : resData.resourceType === 'text' ? '.txt' : '*'}
                      />
                      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold flex items-center gap-2 text-slate-500 border-dashed group-hover:border-indigo-500 transition-all overflow-hidden whitespace-nowrap">
                        <FileIcon size={14} className="text-indigo-500 flex-shrink-0" />
                        <span className="truncate">{selectedFile ? selectedFile.name : (editingResource ? 'Change...' : 'Browse...')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">Tag Category</label>
                <select
                  value={resData.category}
                  onChange={(e) => setResData({ ...resData, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="Short Note">Short Note</option>
                  <option value="Lecture Note">Lecture Note</option>
                  <option value="YouTube Link">YouTube Link</option>
                  <option value="Past Paper">Past Paper</option>
                  <option value="Tutorial">Tutorial</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">Description</label>
                <textarea
                  value={resData.description}
                  onChange={(e) => setResData({ ...resData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold h-24 resize-none focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300"
                  placeholder="Short description for students..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setIsResModalOpen(false); setEditingResource(null); setSelectedFile(null); }} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-all">Cancel</button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (editingResource ? 'Save' : 'Upload')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
