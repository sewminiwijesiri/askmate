"use client";

import { useState, useEffect, useCallback } from "react";
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
  AlertCircle,
  ArrowLeft,
  Send,
  Clock,
  Eye,
  ThumbsUp,
  Tag,
  Zap,
} from "lucide-react";
import UserProfileModal from "@/components/shared/UserProfileModal";

export default function AcademicBrowser({ defaultYear, defaultSemester, user, initialView }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const getNum = (val) => parseInt(String(val).replace(/\D/g, "")) || 1;
  const [selectedYear, setSelectedYear] = useState(() => getNum(defaultYear));
  const [selectedSemester, setSelectedSemester] = useState(() => getNum(defaultSemester));
  const [selectedModule, setSelectedModule] = useState(null);
  const [activeView, setActiveView] = useState(initialView || "modules"); // modules, resources, qa
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingProfileId, setViewingProfileId] = useState(null);

  // Resource States
  const [resources, setResources] = useState([]);
  const [resLoading, setResLoading] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadData, setUploadData] = useState({ title: "", description: "", resourceType: "link", category: "Short Note", url: "" });
  const [editingResource, setEditingResource] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [resourceCategory, setResourceCategory] = useState("All");
  const [resourceSearchQuery, setResourceSearchQuery] = useState("");

  // Q&A States
  const [questions, setQuestions] = useState([]);
  const [qaLoading, setQaLoading] = useState(false);
  const [isAskOpen, setIsAskOpen] = useState(false);
  const [askStep, setAskStep] = useState(1);
  const [askData, setAskData] = useState({ 
    title: "", 
    description: "", 
    topic: "", 
    urgencyLevel: "Normal",
    difficultyLevel: "Medium",
    whatIveTried: "",
    assignmentContext: "",
    codeSnippet: ""
  });
  const [askErrors, setAskErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [ansLoading, setAnsLoading] = useState(false);
  const [answerContent, setAnswerContent] = useState("");
  const [isPostingAnswer, setIsPostingAnswer] = useState(false);
  const [qaSearch, setQaSearch] = useState("");
  const [qaFilter, setQaFilter] = useState("all"); // all | open | resolved
  const [submitError, setSubmitError] = useState("");

  // Enhanced Answer States (for Helpers/Lecturers)
  const [ansConcept, setAnsConcept] = useState("");
  const [ansHints, setAnsHints] = useState([""]);
  const [ansExamples, setAnsExamples] = useState([""]);
  const [ansResources, setAnsResources] = useState([{ title: "", url: "" }]);
  const [showExpertMode, setShowExpertMode] = useState(true);

  const addHint = () => setAnsHints([...ansHints, ""]);
  const updateHint = (idx, val) => {
    const newHints = [...ansHints];
    newHints[idx] = val;
    setAnsHints(newHints);
  };
  const removeHint = (idx) => setAnsHints(ansHints.filter((_, i) => i !== idx));

  const addExample = () => setAnsExamples([...ansExamples, ""]);
  const updateExample = (idx, val) => {
    const newExamples = [...ansExamples];
    newExamples[idx] = val;
    setAnsExamples(newExamples);
  };
  const removeExample = (idx) => setAnsExamples(ansExamples.filter((_, i) => i !== idx));

  const addAnsResource = () => setAnsResources([...ansResources, { title: "", url: "" }]);
  const updateAnsResource = (idx, field, val) => {
    const newResources = [...ansResources];
    newResources[idx] = { ...newResources[idx], [field]: val };
    setAnsResources(newResources);
  };
  const removeAnsResource = (idx) => setAnsResources(ansResources.filter((_, i) => i !== idx));

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    if (selectedModule && activeView === "resources") {
      fetchResources();
    }
    if (selectedModule && activeView === "qa") {
      fetchQuestions();
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

  const fetchQuestions = async () => {
    if (!selectedModule) return;
    try {
      setQaLoading(true);
      const res = await fetch(`/api/questions?module=${encodeURIComponent(selectedModule.moduleName)}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setQaLoading(false);
    }
  };

  const fetchAnswers = async (questionId) => {
    try {
      setAnsLoading(true);
      const res = await fetch(`/api/answers?questionId=${questionId}`);
      if (res.ok) {
        const data = await res.json();
        setAnswers(data);
      }
    } catch (error) {
      console.error("Error fetching answers:", error);
    } finally {
      setAnsLoading(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!askData.title.trim()) errors.title = "Question title is required.";
    if (!askData.description.trim()) errors.description = "Problem description is required.";
    
    if (Object.keys(errors).length > 0) {
      setAskErrors(errors);
      return;
    }
    
    setAskErrors({});
    setSubmitError("");
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: askData.title.trim(),
          description: askData.description.trim(),
          topic: askData.topic.trim(),
          urgencyLevel: askData.urgencyLevel,
          difficultyLevel: askData.difficultyLevel,
          whatIveTried: askData.whatIveTried.trim(),
          assignmentContext: askData.assignmentContext.trim(),
          codeSnippet: askData.codeSnippet.trim(),
          module: selectedModule.moduleName,
          year: String(selectedYear),
          semester: String(selectedSemester),
          student: user?.id || user?.userId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Failed to submit question.");
        return;
      }
      setIsAskOpen(false);
      setAskStep(1);
      setAskData({ 
        title: "", description: "", topic: "", urgencyLevel: "Normal",
        difficultyLevel: "Medium", whatIveTried: "", assignmentContext: "",
        codeSnippet: ""
      });
      setAskErrors({});
      fetchQuestions();
    } catch (error) {
      setSubmitError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await fetch(`/api/questions?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        if (selectedQuestion?._id === id) setSelectedQuestion(null);
        fetchQuestions();
      }
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const handleNextStep = () => {
    const errors = {};
    if (askStep === 1 && !askData.topic.trim()) {
      errors.topic = "Topic is required.";
    }
    
    if (Object.keys(errors).length > 0) {
      setAskErrors(errors);
      return;
    }
    
    setAskErrors({});
    setSubmitError("");
    setAskStep(s => Math.min(s + 1, 2));
  };

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!answerContent.trim()) return;
    try {
      setIsPostingAnswer(true);
      const res = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: selectedQuestion._id,
          author: user?.id || user?.userId,
          authorType: user?.role === "lecturer" ? "Lecturer" : user?.role === "helper" ? "Helper" : "Student",
          content: answerContent.trim(),
          concept: (user?.role === "helper" || user?.role === "lecturer") ? ansConcept.trim() : "",
          hints: (user?.role === "helper" || user?.role === "lecturer") ? ansHints.filter(h => h.trim()) : [],
          examples: (user?.role === "helper" || user?.role === "lecturer") ? ansExamples.filter(ex => ex.trim()) : [],
          supportingResources: (user?.role === "helper" || user?.role === "lecturer") ? ansResources.filter(r => r.title.trim() && r.url.trim()) : [],
        }),
      });
      if (res.ok) {
        setAnswerContent("");
        setAnsConcept("");
        setAnsHints([""]);
        setAnsExamples([""]);
        setAnsResources([{ title: "", url: "" }]);
        fetchAnswers(selectedQuestion._id);
        // update local answer count
        setSelectedQuestion((q) => ({ ...q, answersCount: (q.answersCount || 0) + 1 }));
      }
    } catch (error) {
      console.error("Error posting answer:", error);
    } finally {
      setIsPostingAnswer(false);
    }
  };

  const handleUpvote = async (answerId) => {
    try {
      const res = await fetch("/api/answers/upvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerId, userId: user?.id || user?.userId }),
      });
      if (res.ok) {
        // Refresh answers or update local state
        fetchAnswers(selectedQuestion._id);
      }
    } catch (error) {
      console.error("Error upvoting:", error);
    }
  };

  const handleMarkResolved = async (questionId) => {
    try {
      const res = await fetch(`/api/questions/${questionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isResolved: true }),
      });
      if (res.ok) {
        setSelectedQuestion((q) => ({ ...q, isResolved: true }));
        fetchQuestions();
      }
    } catch (error) {
      console.error("Error marking resolved:", error);
    }
  };

  const openQuestion = (q) => {
    setSelectedQuestion(q);
    setAnswerContent("");
    setAnsConcept("");
    setAnsHints([""]);
    setAnsExamples([""]);
    setAnsResources([{ title: "", url: "" }]);
    fetchAnswers(q._id);
    // update view count locally
    setSelectedQuestion(prev => ({ ...prev, views: (prev.views || 0) + 1 }));
  };

  const closeQuestion = () => {
    setSelectedQuestion(null);
    setAnswers([]);
    setAnswerContent("");
  };

  const timeSince = (dateStr) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const handleUploadResource = async (e) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("title", uploadData.title);
      formData.append("description", uploadData.description);
      formData.append("resourceType", uploadData.resourceType);
      formData.append("category", uploadData.category);
      formData.append("module", selectedModule._id);
      formData.append("uploadedBy", user?.userId || "unknown");
      formData.append("uploaderName", user?.name || (user?.role === 'admin' ? 'Administrator' : user?.userId || 'User'));
      formData.append("uploaderRole", user?.role || "student");

      if (selectedFile) {
        formData.append("file", selectedFile);
      } else {
        formData.append("url", uploadData.url);
      }

      const res = await fetch("/api/resources", {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        fetchResources();
        setIsUploadOpen(false);
        setUploadData({ title: "", description: "", resourceType: "link", category: "Short Note", url: "" });
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Error uploading resource:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateResource = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("title", uploadData.title);
      formData.append("description", uploadData.description);
      formData.append("resourceType", uploadData.resourceType);
      formData.append("category", uploadData.category);
      formData.append("userId", user.userId);

      if (selectedFile) {
        formData.append("file", selectedFile);
      } else {
        formData.append("url", uploadData.url);
      }

      const res = await fetch(`/api/resources/${editingResource._id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        fetchResources();
        setEditingResource(null);
        setUploadData({ title: "", description: "", resourceType: "link", category: "Short Note", url: "" });
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Error updating resource:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteResource = async (id) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/resources/${id}?userId=${user.userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
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
      category: resource.category || "Short Note",
      url: resource.url
    });
    setSelectedFile(null);
  };

  const filteredModules = modules.filter(
    (m) =>
      Number(m.year) === Number(selectedYear) &&
      Number(m.semester) === Number(selectedSemester) &&
      (m.moduleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.moduleCode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const resetSelection = () => {
    setSelectedModule(null);
    setActiveView(initialView || "modules");
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
              <div className="w-fit min-w-[4rem] px-5 h-16 rounded-2xl bg-[#002147] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-100">
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
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${activeView === "resources"
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
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${activeView === "qa"
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
                <div className="flex flex-col gap-6">
                  {/* Category Filter & Search */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setResourceCategory("All")}
                        className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${resourceCategory === "All"
                          ? "bg-[#002147] text-white shadow-lg shadow-blue-900/10"
                          : "bg-white border border-slate-100 text-slate-400 hover:bg-slate-50"
                          }`}
                      >
                        All
                      </button>
                      {["Short Note", "Lecture Note", "YouTube Link", "Past Paper", "Tutorial", "Other"].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setResourceCategory(cat)}
                          className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${resourceCategory === cat
                            ? "bg-[#002147] text-white shadow-lg shadow-blue-900/10"
                            : "bg-white border border-slate-100 text-slate-400 hover:bg-slate-50"
                            }`}
                        >
                          {cat}s
                        </button>
                      ))}
                    </div>

                    <div className="relative w-full md:w-64 group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={14} />
                      <input
                        type="text"
                        placeholder="Search materials..."
                        value={resourceSearchQuery}
                        onChange={(e) => setResourceSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[12px] font-bold focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resources
                      .filter(r => r.status === "approved")
                      .filter(r => resourceCategory === "All" || r.category === resourceCategory)
                      .filter(r => r.title.toLowerCase().includes(resourceSearchQuery.toLowerCase()) || (r.description && r.description.toLowerCase().includes(resourceSearchQuery.toLowerCase())))
                      .map((res) => (
                        <div key={res._id} className={`p-6 rounded-[2rem] border transition-all group ${res.status === 'pending' ? 'bg-amber-50/30 border-amber-100' : 'bg-slate-50 border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5'}`}>
                          <div className="flex justify-between items-start mb-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${res.category === 'YouTube Link' ? 'bg-rose-50 text-rose-500' :
                              res.category === 'Lecture Note' ? 'bg-emerald-50 text-emerald-500' :
                                res.category === 'Past Paper' ? 'bg-orange-50 text-orange-500' :
                                  'bg-blue-50 text-blue-500'
                              }`}>
                              {res.resourceType === 'link' ? <LinkIcon size={20} /> : <FileIcon size={20} />}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <a
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2.5 bg-white text-slate-400 hover:text-blue-500 rounded-xl shadow-sm border border-slate-100"
                                title="View Resource"
                              >
                                <ExternalLink size={16} />
                              </a>
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
                                  className="p-2.5 bg-white text-slate-400 hover:text-orange-500 rounded-xl shadow-sm border border-slate-100"
                                  title="Download"
                                >
                                  <Download size={16} />
                                </button>
                              )}
                              {(res.uploadedBy === user.userId || user.role === 'admin') && (
                                <>
                                  <button
                                    onClick={() => startEdit(res)}
                                    className="p-2.5 bg-white text-slate-400 hover:text-emerald-500 rounded-xl shadow-sm border border-slate-100"
                                    title="Edit"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteResource(res._id)}
                                    className="p-2.5 bg-white text-slate-400 hover:text-rose-500 rounded-xl shadow-sm border border-slate-100"
                                    title="Delete"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-black text-[#002147] text-lg lg:text-xl group-hover:text-blue-600 transition-colors leading-tight">{res.title}</h4>
                            {res.status === "pending" && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded-md text-[8px] font-black uppercase tracking-widest border border-amber-200">Pending</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-2 leading-relaxed">
                            {res.description || "No description provided for this learning resource."}
                          </p>

                          <div className="flex items-center justify-between pt-6 border-t border-slate-200/50">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-[#002147] shadow-sm uppercase">
                                {(res.uploaderName || res.uploaderRole || "U")[0].toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Contributor</span>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setViewingProfileId(res.uploadedBy); }}
                                  className="text-[11px] font-bold text-slate-700 leading-none text-left hover:text-blue-600 hover:underline transition-colors focus:outline-none"
                                >
                                  {res.uploadedBy === user.userId ? "Me" : (res.uploaderRole === 'admin' ? 'Administrator' : res.uploaderName)}
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${res.category === 'YouTube Link' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                res.category === 'Lecture Note' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                  res.category === 'Past Paper' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                                    'bg-blue-50 text-blue-600 border border-blue-100'
                                }`}>
                                {res.category || "General"}
                              </span>
                              <span className="px-2.5 py-1 bg-white border border-slate-100 rounded-lg text-[9px] font-bold text-slate-400 uppercase tracking-widest shadow-sm">
                                {res.resourceType}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeView === "qa" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* Q&A Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-[#002147]">Q&amp;A Discussion</h3>
                  <p className="text-slate-500 text-sm mt-1">Ask questions, help peers, get answers.</p>
                </div>
                <button
                  onClick={() => { setIsAskOpen(true); setSubmitError(""); setAskErrors({}); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#FF9F1C] text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-all shadow-md active:scale-95"
                >
                  <Plus size={16} /> Ask Question
                </button>
              </div>

              {/* Filter & Search */}
              <div className="flex flex-col sm:flex-row gap-3 pb-4 border-b border-slate-100">
                <div className="flex gap-2">
                  {["all", "open", "resolved"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setQaFilter(f)}
                      className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                        qaFilter === f
                          ? "bg-[#002147] text-white shadow-lg"
                          : "bg-white border border-slate-100 text-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={qaSearch}
                    onChange={(e) => setQaSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[12px] font-bold focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Questions List */}
              {qaLoading ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 border-3 border-blue-50/10 border-t-[#FF9F1C] rounded-full animate-spin" />
                </div>
              ) : (() => {
                const filtered = questions
                  .filter((q) => qaFilter === "all" ? true : qaFilter === "resolved" ? q.isResolved : !q.isResolved)
                  .filter((q) => !qaSearch || q.title.toLowerCase().includes(qaSearch.toLowerCase()) || q.description.toLowerCase().includes(qaSearch.toLowerCase()));
                return filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                    <HelpCircle size={36} className="text-slate-200 mb-3" />
                    <p className="text-slate-400 font-bold text-sm">No questions yet.</p>
                    <button onClick={() => { setIsAskOpen(true); setSubmitError(""); setAskErrors({}); }} className="mt-2 text-[#FF9F1C] font-bold text-sm hover:underline">Be the first to ask!</button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {filtered.map((q) => (
                      <div
                        key={q._id}
                        role="button"
                        tabIndex={0}
                        onClick={() => openQuestion(q)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openQuestion(q);
                          }
                        }}
                        className="w-full text-left p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-white hover:shadow-lg hover:shadow-blue-900/5 transition-all group cursor-pointer focus:outline-none focus:border-blue-400"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              {q.isResolved ? (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                  <CheckCircle size={10} /> Resolved
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-orange-100">
                                  <Clock size={10} /> Open
                                </span>
                              )}
                              {q.urgencyLevel === "Urgent" && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-red-100">
                                  <Zap size={10} /> Urgent
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-medium">{timeSince(q.createdAt)}</span>
                              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setViewingProfileId(q.student?._id || q.student?.studentId); }}
                                className="text-[10px] text-blue-600/70 font-bold uppercase tracking-widest hover:text-blue-600 hover:underline transition-colors focus:outline-none"
                              >
                                {q.student?.studentId || "Student"}
                              </button>
                            </div>
                            <h4 className="font-bold text-[#002147] text-sm group-hover:text-blue-600 transition-colors leading-snug truncate">{q.title}</h4>
                            <p className="text-[12px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{q.description}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            {(String(q.student?._id) === String(user?.id) || String(q.student?.studentId) === String(user?.userId)) && (
                              <button
                                onClick={(e) => handleDeleteQuestion(e, q._id)}
                                className="p-1.5 text-slate-300 hover:text-red-500 bg-white border border-slate-100 rounded-lg shadow-sm transition-all mb-1 hover:bg-red-50"
                                title="Delete Question"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                            <span className="flex items-center gap-1 text-[11px] text-slate-400 font-bold">
                              <MessageCircle size={12} /> {q.answersCount || 0}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-slate-400 font-bold">
                              <Eye size={12} /> {q.views || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Modal simplified */}
        {
          (isUploadOpen || editingResource) && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-[#002147]">{editingResource ? 'Edit Resource' : 'Share Resource'}</h2>
                  <button onClick={() => { setIsUploadOpen(false); setEditingResource(null); setSelectedFile(null); }} className="p-2 rounded-lg hover:bg-slate-50 text-slate-400">
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
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                        {uploadData.resourceType === 'link' ? 'URL' : 'File'}
                      </label>
                      {uploadData.resourceType === 'link' ? (
                        <input
                          type="url"
                          required
                          value={uploadData.url}
                          onChange={(e) => setUploadData({ ...uploadData, url: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium focus:outline-none focus:border-blue-500 transition-all"
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
                              if (file && !uploadData.title) {
                                setUploadData({ ...uploadData, title: file.name.split('.')[0] });
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            accept={
                              uploadData.resourceType === 'pdf' ? '.pdf' :
                                uploadData.resourceType === 'word' ? '.doc,.docx' :
                                  uploadData.resourceType === 'text' ? '.txt' : '*'
                            }
                          />
                          <div className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium flex items-center gap-2 text-slate-500 group-hover:border-blue-500 transition-all overflow-hidden whitespace-nowrap">
                            <FileIcon size={14} className="text-blue-500 flex-shrink-0" />
                            <span className="truncate text-[11px]">{selectedFile ? selectedFile.name : (editingResource ? 'Change...' : 'Browse...')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Category</label>
                    <select
                      value={uploadData.category}
                      onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="Short Note">Short Note</option>
                      <option value="Lecture Note">Lecture Note</option>
                      <option value="YouTube Link">YouTube Link</option>
                      <option value="Past Paper">Past Paper</option>
                      <option value="Tutorial">Tutorial</option>
                      <option value="Other">Other</option>
                    </select>
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
                    <button type="button" onClick={() => { setIsUploadOpen(false); setEditingResource(null); setSelectedFile(null); }} className="flex-1 py-3 bg-slate-50 text-slate-500 rounded-xl font-bold text-sm">Cancel</button>
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="flex-1 py-3 bg-[#002147] text-white rounded-xl font-bold text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </>
                      ) : (editingResource ? 'Save' : 'Upload')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )
        }

        {/* ── Ask Question Modal ── */}
        {/* ── Ask Question Multi-Step Modal ── */}
        {isAskOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-6 border-b border-slate-100 shrink-0 bg-[#002147] relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Ask a Question</h2>
                    <p className="text-[12px] text-blue-200 flex items-center gap-1.5 font-medium">
                      Step {askStep} of 2 <span className="w-1 h-1 bg-blue-400 rounded-full"></span> {selectedModule?.moduleName}
                    </p>
                  </div>
                  <button onClick={() => setIsAskOpen(false)} className="p-2 rounded-xl hover:bg-white/10 text-white/70 transition-all">
                    <X size={18} />
                  </button>
                </div>
                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-[#001730]">
                  <div className="h-full bg-[#FF9F1C] transition-all duration-300" style={{ width: `${(askStep / 2) * 100}%` }}></div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto w-full flex-1">
                {submitError && (
                  <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[12px] font-bold">
                    <AlertCircle size={14} className="shrink-0" /> {submitError}
                  </div>
                )}

                {askStep === 1 && (
                  <div className="space-y-5 animate-in slide-in-from-right-2 duration-300">
                    <div>
                      <h3 className="text-[#002147] font-bold mb-1">Academic Structure</h3>
                      <p className="text-xs text-slate-500 mb-4">Confirm your academic context before asking.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Year</span>
                        <p className="text-sm font-bold text-[#002147]">{selectedYear}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Semester</span>
                        <p className="text-sm font-bold text-[#002147]">{selectedSemester}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Module</span>
                      <p className="text-sm font-bold text-[#002147]">{selectedModule?.moduleCode} - {selectedModule?.moduleName}</p>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Topic / Sub-topic <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        required
                        value={askData.topic}
                        onChange={(e) => {
                          setAskData({ ...askData, topic: e.target.value });
                          if (askErrors.topic) setAskErrors({ ...askErrors, topic: null });
                        }}
                        className={`w-full bg-slate-50 border rounded-xl py-3 px-4 text-sm font-medium focus:outline-none transition-all focus:bg-white ${askErrors.topic ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400/20' : 'border-slate-200 focus:border-blue-500'}`}
                        placeholder="e.g. Networking Fundamentals"
                        autoFocus
                      />
                      {askErrors.topic && <p className="text-red-500 text-[11px] font-bold mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {askErrors.topic}</p>}
                    </div>
                  </div>
                )}

                {askStep === 2 && (
                  <div className="space-y-5 animate-in slide-in-from-right-2 duration-300">
                    <div>
                      <h3 className="text-[#002147] font-bold mb-1">Enter the Question</h3>
                      <p className="text-xs text-slate-500 mb-4">Provide a clear title and description of your problem.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Question Title <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        required
                        value={askData.title}
                        onChange={(e) => {
                          setAskData({ ...askData, title: e.target.value });
                          if (askErrors.title) setAskErrors({ ...askErrors, title: null });
                        }}
                        maxLength={200}
                        className={`w-full bg-slate-50 border rounded-xl py-3 px-4 text-sm font-medium focus:outline-none transition-all focus:bg-white ${askErrors.title ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400/20' : 'border-slate-200 focus:border-blue-500'}`}
                        placeholder="e.g. What is the difference between TCP and UDP?"
                        autoFocus
                      />
                      {askErrors.title && <p className="text-red-500 text-[11px] font-bold mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {askErrors.title}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Problem Description <span className="text-red-400">*</span></label>
                      <textarea
                        required
                        value={askData.description}
                        onChange={(e) => {
                          setAskData({ ...askData, description: e.target.value });
                          if (askErrors.description) setAskErrors({ ...askErrors, description: null });
                        }}
                        className={`w-full bg-slate-50 border rounded-xl py-3 px-4 text-sm font-medium h-24 resize-none focus:outline-none transition-all focus:bg-white ${askErrors.description ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400/20' : 'border-slate-200 focus:border-blue-500'}`}
                        placeholder="Describe your question in detail..."
                      />
                      {askErrors.description && <p className="text-red-500 text-[11px] font-bold mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {askErrors.description}</p>}
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Where are you stuck?</label>
                      <textarea
                        value={askData.whatIveTried}
                        onChange={(e) => setAskData({ ...askData, whatIveTried: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium h-20 resize-none focus:outline-none focus:border-blue-500 transition-all focus:bg-white"
                        placeholder="Optional: Explain what you've already tried..."
                      />
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Urgency Level</label>
                      <div className="grid grid-cols-2 gap-4">
                        {["Normal", "Urgent"].map(urgency => (
                          <label key={urgency} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${askData.urgencyLevel === urgency ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500 shadow-sm' : 'bg-white border-slate-200 hover:border-amber-300'}`}>
                            <input 
                              type="radio" 
                              name="urgencyLevel" 
                              className="hidden" 
                              value={urgency} 
                              checked={askData.urgencyLevel === urgency} 
                              onChange={(e) => setAskData({ ...askData, urgencyLevel: e.target.value })} 
                            />
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${askData.urgencyLevel === urgency ? 'border-amber-600' : 'border-slate-300'}`}>
                              {askData.urgencyLevel === urgency && <div className="w-2 h-2 rounded-full bg-amber-600"></div>}
                            </div>
                            <span className={`text-sm font-bold ${askData.urgencyLevel === urgency ? 'text-amber-700' : 'text-slate-600'}`}>{urgency}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Controls */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => askStep > 1 ? setAskStep(s => s - 1) : setIsAskOpen(false)}
                  className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all shadow-sm"
                >
                  {askStep > 1 ? "Back" : "Cancel"}
                </button>
                
                {askStep < 2 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-8 py-2.5 bg-[#002147] text-white rounded-xl font-bold text-sm shadow-md hover:bg-blue-900 transition-all flex items-center gap-2"
                  >
                    Next Step <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAskQuestion}
                    disabled={isSubmitting}
                    className="px-8 py-2.5 bg-[#FF9F1C] text-white rounded-xl font-bold text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-all flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /><span>Submitting...</span></>
                    ) : (
                      <><Send size={14} /> Submit Question</>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Question Detail Slide-over ── */}
        {selectedQuestion && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-6 border-b border-slate-100 shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {selectedQuestion.isResolved ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase border border-emerald-100">
                          <CheckCircle size={10} /> Resolved
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-500 rounded-lg text-[9px] font-black uppercase border border-orange-100">
                          <Clock size={10} /> Open
                        </span>
                      )}
                      {selectedQuestion.urgencyLevel === "Urgent" && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-500 rounded-lg text-[9px] font-black uppercase border border-red-100">
                          <Zap size={10} /> Urgent
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">{timeSince(selectedQuestion.createdAt)}</span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setViewingProfileId(selectedQuestion.student?._id || selectedQuestion.student?.studentId); }}
                        className="text-[10px] text-blue-600 font-black uppercase tracking-widest hover:underline transition-colors focus:outline-none"
                      >
                        {selectedQuestion.student?.studentId || "Student"}
                      </button>
                    </div>
                    <h3 className="text-lg font-bold text-[#002147] leading-snug">{selectedQuestion.title}</h3>
                    {selectedQuestion.topic && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-slate-400 font-bold"><Tag size={10} />{selectedQuestion.topic}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {(String(selectedQuestion.student?._id) === String(user?.id) || String(selectedQuestion.student?.studentId) === String(user?.userId)) && (
                      <button
                        onClick={(e) => handleDeleteQuestion(e, selectedQuestion._id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-[11px] border border-red-100 hover:bg-red-100 transition-all"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    )}
                    {!selectedQuestion.isResolved && (String(selectedQuestion.student?._id) === String(user?.id) || String(selectedQuestion.student?.studentId) === String(user?.userId)) && (
                      <button
                        onClick={() => handleMarkResolved(selectedQuestion._id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-[11px] border border-emerald-100 hover:bg-emerald-100 transition-all"
                      >
                        <CheckCircle size={12} /> Mark Resolved
                      </button>
                    )}
                    <button onClick={closeQuestion} className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 transition-all">
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="mt-4 text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {selectedQuestion.description}
                </p>

                <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-400 font-bold">
                  <span className="flex items-center gap-1"><Eye size={12} /> {selectedQuestion.views || 0} views</span>
                  <span className="flex items-center gap-1"><MessageCircle size={12} /> {selectedQuestion.answersCount || 0} answers</span>
                </div>
              </div>

              {/* Answers */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{answers.length} Answer{answers.length !== 1 ? "s" : ""}</h4>
                {ansLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-blue-100 border-t-[#FF9F1C] rounded-full animate-spin" />
                  </div>
                ) : answers.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                    <p className="text-slate-400 font-bold text-sm">No answers yet. Be the first to help!</p>
                  </div>
                ) : (
                  answers.map((ans) => (
                    <div key={ans._id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                      {/* Structured Content (if exists) */}
                      {ans.concept && (
                        <div className="flex items-center gap-3 p-3 bg-white/50 border border-blue-100 rounded-2xl">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Zap size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Concept</p>
                            <p className="text-sm font-bold text-[#002147]">{ans.concept}</p>
                          </div>
                        </div>
                      )}

                      {/* Main Content */}
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">{ans.content}</p>

                      {/* Hints & Examples Grid */}
                      {(ans.hints?.length > 0 || ans.examples?.length > 0) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {ans.hints?.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Guidance Hints</p>
                              <div className="space-y-1.5">
                                {ans.hints.map((h, i) => (
                                  <div key={i} className="flex gap-2 p-2 bg-white rounded-xl border border-slate-100 text-xs text-slate-600 font-medium">
                                    <span className="text-blue-500 font-black">{i + 1}.</span>
                                    {h}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {ans.examples?.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Examples</p>
                              <div className="space-y-1.5">
                                {ans.examples.map((ex, i) => (
                                  <div key={i} className="p-3 bg-slate-100/50 rounded-xl border border-slate-200 text-xs text-slate-600 italic font-medium">
                                    {ex}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Resources */}
                      {ans.supportingResources?.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Supporting Resources</p>
                          <div className="flex flex-wrap gap-2">
                            {ans.supportingResources.map((res, i) => (
                              <a
                                key={i}
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-blue-600 hover:border-blue-300 transition-all shadow-sm"
                              >
                                <ExternalLink size={12} />
                                {res.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-3 pt-4 border-t border-slate-200/50">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setViewingProfileId(ans.student?._id || ans.student?.studentId); }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black uppercase shadow-sm transition-transform hover:scale-105 focus:outline-none ${
                          ans.student?.role === 'lecturer' ? 'bg-orange-600 text-white' : 
                          ans.student?.role === 'helper' ? 'bg-[#002147] text-white' : 
                          'bg-slate-200 text-slate-600'
                        }`}>
                          {((ans.student?.name || ans.student?.studentId || "A")[0]).toUpperCase()}
                        </button>
                        <div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setViewingProfileId(ans.student?._id || ans.student?.studentId); }}
                            className="text-[11px] font-bold text-[#002147] leading-none mb-1 text-left hover:text-blue-600 hover:underline transition-colors focus:outline-none"
                          >
                            {ans.student?.name || ans.student?.studentId || "Anonymous"} 
                            <span className="ml-1 text-[9px] text-slate-400 font-medium">({ans.student?.studentId})</span>
                          </button>
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-black uppercase tracking-widest ${
                              ans.student?.role === 'lecturer' ? 'text-orange-600' : 
                              ans.student?.role === 'helper' ? 'text-blue-600' : 
                              'text-slate-400'
                            }`}>
                              {ans.student?.role || 'User'}
                            </span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="text-[9px] text-slate-400 font-bold">{timeSince(ans.createdAt)}</span>
                          </div>
                        </div>

                        {/* Upvote Button */}
                        <div className="ml-auto flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">{ans.upvotes || 0}</span>
                          <button
                            onClick={() => handleUpvote(ans._id)}
                            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-orange-500 hover:border-orange-200 transition-all shadow-sm"
                            title="Upvote Answer"
                          >
                            <ThumbsUp size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Post Answer */}
              <div className="p-4 sm:p-6 border-t border-slate-100 shrink-0 bg-white">
                {(user?.role?.toLowerCase()?.includes("helper") || user?.role?.toLowerCase()?.includes("lecturer") || user?.role?.toLowerCase()?.includes("admin")) ? (
                  <form onSubmit={handlePostAnswer} className="space-y-4">
                  {(user?.role?.toLowerCase()?.includes("helper") || user?.role?.toLowerCase()?.includes("lecturer")) && (
                    <div className="space-y-3">
                      <button 
                        type="button"
                        onClick={() => setShowExpertMode(!showExpertMode)}
                        className="w-full flex items-center justify-between p-3 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider shadow-sm hover:bg-blue-700 transition-all active:scale-95"
                      >
                        <div className="flex items-center gap-2">
                          <Zap size={14} className={showExpertMode ? "animate-pulse border border-white/30 rounded-full p-0.5" : ""} />
                          {showExpertMode ? "Hide Guidance Builder" : "Open Expert Guidance Builder"}
                        </div>
                        <ChevronRight size={14} className={`transition-transform duration-300 ${showExpertMode ? "rotate-90" : ""}`} />
                      </button>

                      {showExpertMode && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 max-h-[200px] overflow-y-auto shadow-inner">
                            <div className="flex items-center gap-2 text-[#002147] font-bold text-[11px] uppercase tracking-widest sticky top-0 bg-slate-50 pb-2 z-10 border-b border-slate-200">
                              <GraduationCap size={14} className="text-blue-500" />
                              Expert Guidance Content
                            </div>

                            {/* Concept */}
                            <div className="space-y-1.5 pt-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Core Concept</label>
                              <input
                                type="text"
                                value={ansConcept}
                                onChange={(e) => setAnsConcept(e.target.value)}
                                placeholder="The underlying principle"
                                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:outline-none focus:border-blue-400 transition-all placeholder:text-slate-300"
                              />
                            </div>
                            
                            {/* Rest of the Expert Content remains the same but inside this new scrollable container */}
                            {/* Hints */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
                                <span>Step-by-step Hints</span>
                                <button type="button" onClick={addHint} className="text-blue-500 hover:underline text-[9px]">Add Hint</button>
                              </label>
                              {ansHints.map((hint, i) => (
                                <div key={i} className="flex gap-2">
                                  <input
                                    type="text"
                                    value={hint}
                                    onChange={(e) => updateHint(i, e.target.value)}
                                    placeholder={`Hint ${i + 1}...`}
                                    className="flex-1 bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-medium focus:outline-none focus:border-blue-400 transition-all placeholder:text-slate-300"
                                  />
                                  {ansHints.length > 1 && (
                                    <button type="button" onClick={() => removeHint(i)} className="p-1.5 text-slate-300 hover:text-red-500"><X size={12} /></button>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Examples */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
                                <span>Practical Examples</span>
                                <button type="button" onClick={addExample} className="text-blue-500 hover:underline text-[9px]">Add Example</button>
                              </label>
                              {ansExamples.map((ex, i) => (
                                <div key={i} className="flex gap-2">
                                  <textarea
                                    value={ex}
                                    onChange={(e) => updateExample(i, e.target.value)}
                                    placeholder={`Example ${i + 1}...`}
                                    rows={1}
                                    className="flex-1 bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-medium focus:outline-none focus:border-blue-400 transition-all resize-none placeholder:text-slate-300"
                                  />
                                  {ansExamples.length > 1 && (
                                    <button type="button" onClick={() => removeExample(i)} className="p-1.5 text-slate-300 hover:text-red-500"><X size={12} /></button>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Resources */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
                                <span>Supporting Resources</span>
                                <button type="button" onClick={addAnsResource} className="text-blue-500 hover:underline text-[9px]">Add Resource</button>
                              </label>
                              {ansResources.map((res, i) => (
                                <div key={i} className="grid grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    value={res.title}
                                    onChange={(e) => updateAnsResource(i, "title", e.target.value)}
                                    placeholder="Title"
                                    className="bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-medium focus:outline-none focus:border-blue-400 transition-all placeholder:text-slate-300"
                                  />
                                  <div className="flex gap-2">
                                    <input
                                      type="url"
                                      value={res.url}
                                      onChange={(e) => updateAnsResource(i, "url", e.target.value)}
                                      placeholder="URL"
                                      className="flex-1 bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-medium focus:outline-none focus:border-blue-400 transition-all placeholder:text-slate-300"
                                    />
                                    {ansResources.length > 1 && (
                                      <button type="button" onClick={() => removeAnsResource(i)} className="p-1.5 text-slate-300 hover:text-red-500"><X size={12} /></button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-stretch gap-3">
                    <textarea
                      value={answerContent}
                      onChange={(e) => setAnswerContent(e.target.value)}
                      placeholder={user?.role === "student" ? "Write your answer here..." : "Write a summary or additional explanation for your guidance..."}
                      rows={2}
                      required
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-medium resize-none focus:outline-none focus:border-blue-400 transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={isPostingAnswer || !answerContent.trim()}
                      className="px-6 bg-[#002147] text-white rounded-2xl font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-all flex flex-col items-center justify-center gap-1 active:scale-95 shadow-md shadow-blue-900/10 min-w-[100px]"
                    >
                      {isPostingAnswer ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send size={16} />
                          <span>Submit</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
                ) : (
                  <div className="text-center p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <p className="text-sm font-bold text-slate-500">Only lecturers and helpers can post answers.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {viewingProfileId && <UserProfileModal userId={viewingProfileId} currentUser={user} onClose={() => setViewingProfileId(null)} />}
      </div >
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
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-[13px] transition-all ${selectedYear === year
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
                  className={`py-4 rounded-xl font-bold text-sm transition-all text-center flex flex-col items-center gap-1 ${selectedSemester === sem
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
                    onClick={() => {
                      setSelectedModule(module);
                      setActiveView("resources");
                    }}
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
      
      {viewingProfileId && <UserProfileModal userId={viewingProfileId} currentUser={user} onClose={() => setViewingProfileId(null)} />}
    </div>
  );
}
