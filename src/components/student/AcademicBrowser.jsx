"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  Mic,
  Languages,
  Volume2,
  AlignLeft,
  Check,
  Loader2,
} from "lucide-react";
import UserProfileModal from "@/components/shared/UserProfileModal";
import ExpertDetailView from "@/components/helper/ExpertDetailView";
import VoiceInteractionModal from "./VoiceInteractionModal";

export default function AcademicBrowser({ defaultYear, defaultSemester, user, initialView, initialQaFilter, setActiveTab }) {
  const isLecturerLike = user?.role?.toLowerCase()?.includes("helper") || user?.role?.toLowerCase()?.includes("lecturer") || user?.role?.toLowerCase()?.includes("admin");
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
  const [comfortableLanguage, setComfortableLanguage] = useState("en-US"); // State for speech recognition
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
  const [askTouched, setAskTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationTab, setTranslationTab] = useState("english");
  const [sinhalaData, setSinhalaData] = useState({ title: "", description: "", stuck: "" });
  const [tamilData, setTamilData] = useState({ title: "", description: "", stuck: "" });
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [activeDictationField, setActiveDictationField] = useState(null);
  const dictationRecognitionRef = useRef(null);

  const startDictation = (field) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSubmitError("This browser does not support voice recognition.");
      return;
    }

    setActiveDictationField(field);
    setSubmitError(""); // Clear any previous errors

    if (dictationRecognitionRef.current) dictationRecognitionRef.current.stop();

    const recognition = new SpeechRecognition();
    recognition.lang = comfortableLanguage; // Dynamically set based on user selection
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = async (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (transcript) {
        if (translationTab === "sinhala") {
          setSinhalaData(prev => ({
            ...prev,
            [field === "whatIveTried" ? "stuck" : field]: prev[field === "whatIveTried" ? "stuck" : field] ? prev[field === "whatIveTried" ? "stuck" : field] + " " + transcript : transcript
          }));
        } else if (translationTab === "tamil") {
          setTamilData(prev => ({
            ...prev,
            [field === "whatIveTried" ? "stuck" : field]: prev[field === "whatIveTried" ? "stuck" : field] ? prev[field === "whatIveTried" ? "stuck" : field] + " " + transcript : transcript
          }));
        } else {
          // Default to English askData
          handleFieldChange(field, askData[field] ? askData[field] + " " + transcript : transcript);
        }
      }
    };

    recognition.onend = () => setActiveDictationField(null);
    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setSubmitError("Microphone permission denied.");
      } else {
        setSubmitError("Voice could not be recognized. Please try again.");
      }
      setActiveDictationField(null);
    };

    dictationRecognitionRef.current = recognition;
    recognition.start();
  };

  const stopDictation = () => {
    dictationRecognitionRef.current?.stop();
    setActiveDictationField(null);
  };

  const handleDraftVoiceQuestion = (draft) => {
    // Prioritize English version for the main submission fields
    const englishVer = draft.translations?.["en-US"] || draft.translations?.["English"] || draft.title;

    setAskData({
      ...askData,
      title: englishVer || draft.originalTranscript,
      description: englishVer || draft.originalTranscript,
      topic: englishVer || draft.originalTranscript,
      originalTranscript: draft.originalTranscript,
      originalLanguage: draft.language,
      isVoiceQuestion: true,
      translatedVersions: draft.translations || {}
    });
    setAskStep(2);
    setIsAskOpen(true);
  };

  // ── Inline Validation Utilities ──
  const TOPIC_ALLOWED_PATTERN = /^[\p{L}0-9\s/,.\-&()]+$/u;
  const ONLY_NUMBERS = /^[0-9\s]+$/;
  const ONLY_SYMBOLS = /^[^\p{L}0-9]+$/u;
  const HAS_LETTER = /[\p{L}]/u;
  const GIBBERISH_WORDS = [
    'test', 'testing', 'asdf', 'asdfg', 'asdfgh', 'asdfghjk', 'qwerty', 'qwer',
    'abcd', 'abcde', 'abc', 'aaa', 'bbb', 'ccc', 'xxx', 'zzz', 'hello',
    'hi', 'help', 'pls', 'plz', 'lol', 'idk', 'na', 'none', 'nil', 'nothing',
    'random', 'stuff', 'thing', 'things', 'something', 'anything', 'blah',
    'foo', 'bar', 'baz', 'temp', 'tmp', 'sample', 'example', 'demo',
  ];

  const isGibberish = (text) => {
    const t = text.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!t) return false;
    // Exact match against known gibberish words
    if (GIBBERISH_WORDS.includes(t)) return true;
    // Only repeated chars: aaa, bbbbb, etc.
    if (/^(.)\1+$/.test(t.replace(/\s/g, ''))) return true;
    // Mostly repeated chars (e.g. "aaabbb", "xxxyyyzzz")
    const stripped = t.replace(/\s/g, '');
    const unique = new Set(stripped.split('')).size;
    if (stripped.length >= 6 && unique <= 2) return true;
    // Keyboard-walk patterns (horizontal and vertical simplified)
    const walks = [
      'asdfgh', 'qwerty', 'zxcvbn', 'qazwsx', 'edcrfv', 'tgbyhn', 'ujmikol',
      '123456', '654321', '012345', 'poiuyt', 'lkjhgf', 'mnbvcx'
    ];
    if (walks.some(walk => stripped.includes(walk))) return true;
    // All same words repeated: "test test test"
    const words = t.split(' ').filter(Boolean);
    if (words.length >= 2 && new Set(words).size === 1 && GIBBERISH_WORDS.includes(words[0])) return true;
    return false;
  };

  const validateField = (field, value) => {
    const trimmed = (value || '').trim().replace(/\s{2,}/g, ' ');
    switch (field) {
      case 'topic': {
        if (!trimmed) return 'Topic / Sub-topic is required';
        if (trimmed.length < 3) return 'Topic must be at least 3 characters';
        if (trimmed.length > 100) return 'Topic / Sub-topic cannot exceed 100 characters';
        if (!TOPIC_ALLOWED_PATTERN.test(trimmed)) return 'Topic / Sub-topic contains invalid characters';
        if (ONLY_NUMBERS.test(trimmed)) return 'Topic must contain letters, not only numbers';
        if (!HAS_LETTER.test(trimmed)) return 'Topic must contain at least one letter';
        if (ONLY_SYMBOLS.test(trimmed)) return 'Please enter a meaningful topic / sub-topic';
        if (isGibberish(trimmed)) return 'Please enter a meaningful topic / sub-topic';
        return null;
      }
      case 'title': {
        if (!trimmed) return 'Question title is required';
        if (trimmed.length < 10) return 'Question title must be at least 10 characters';
        if (trimmed.length > 150) return 'Question title cannot exceed 150 characters';
        if (!HAS_LETTER.test(trimmed) || ONLY_NUMBERS.test(trimmed) || ONLY_SYMBOLS.test(trimmed) || isGibberish(trimmed)) {
          return 'Please enter a meaningful question title';
        }
        return null;
      }
      case 'description': {
        if (!trimmed) return 'Problem description is required';
        if (trimmed.length < 20) return 'Problem description must be at least 20 characters';
        if (trimmed.length > 1000) return 'Problem description cannot exceed 1000 characters';
        if (!HAS_LETTER.test(trimmed) || ONLY_SYMBOLS.test(trimmed) || isGibberish(trimmed)) {
          return 'Please enter a clear and meaningful problem description';
        }
        return null;
      }
      case 'whatIveTried': {
        if (!trimmed) return null; // optional
        if (trimmed.length < 5 || !HAS_LETTER.test(trimmed) || isGibberish(trimmed)) {
          return 'Please explain a little more about where you are stuck';
        }
        if (trimmed.length > 500) return 'Where Are You Stuck? cannot exceed 500 characters';
        return null;
      }
      default:
        return null;
    }
  };

  const closeAskModal = () => {
    setIsAskOpen(false);
    setAskStep(1);
    setAskData({
      title: "", description: "", topic: "", urgencyLevel: "Normal",
      difficultyLevel: "Medium", whatIveTried: "", assignmentContext: "",
      codeSnippet: ""
    });
    setAskErrors({});
    setAskTouched({});
    setSubmitError("");
  };

  const cleanFieldValue = (field, value) => {
    // Replace multiple consecutive spaces with a single space for all fields
    let cleaned = value.replace(/  +/g, ' ');
    // For topic, also strip disallowed chars live (keep the cursor smooth)
    return cleaned;
  };

  const handleFieldChange = (field, value) => {
    const cleaned = cleanFieldValue(field, value);
    setAskData(prev => ({ ...prev, [field]: cleaned }));
    // Real-time validation only if field was already touched (blur or submit attempt)
    if (askTouched[field]) {
      const error = validateField(field, cleaned);
      setAskErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleFieldBlur = (field) => {
    setAskTouched(prev => ({ ...prev, [field]: true }));
    // Trim leading/trailing whitespace on blur
    setAskData(prev => ({ ...prev, [field]: (prev[field] || '').trim().replace(/\s{2,}/g, ' ') }));
    const error = validateField(field, askData[field]);
    setAskErrors(prev => ({ ...prev, [field]: error }));
  };

  const getCharInfo = (field, value) => {
    const limits = { topic: { min: 3, max: 100 }, title: { min: 10, max: 150 }, description: { min: 20, max: 1000 }, whatIveTried: { min: 5, max: 500 } };
    const l = limits[field];
    if (!l) return null;
    const len = (value || '').trim().length;
    const isOptional = field === 'whatIveTried';
    if (isOptional && len === 0) return { len, max: l.max, color: 'text-slate-400', min: l.min };
    if (len > l.max) return { len, max: l.max, color: 'text-red-500', min: l.min };
    if (len < l.min) return { len, max: l.max, color: 'text-amber-500', min: l.min };
    return { len, max: l.max, color: 'text-emerald-500', min: l.min };
  };

  // Helper: border + ring class based on error/success state
  const getFieldClasses = (field) => {
    const hasError = askErrors[field];
    const isTouched = askTouched[field];
    const value = (askData[field] || '').trim();
    const isValid = isTouched && !hasError && value.length > 0;
    if (hasError) return 'border-red-400 focus:border-red-500 ring-1 ring-red-400/20';
    if (isValid) return 'border-emerald-400 focus:border-emerald-500 ring-1 ring-emerald-400/20';
    return 'border-slate-200 focus:border-blue-500';
  };
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [ansLoading, setAnsLoading] = useState(false);
  const [qaSearch, setQaSearch] = useState("");
  const [qaFilter, setQaFilter] = useState(initialQaFilter || "all"); // all | open | unanswered | resolved
  const [submitError, setSubmitError] = useState("");

  const [qaLanguage, setQaLanguage] = useState("english"); // english | sinhala | tamil
  const [showExpertMode, setShowExpertMode] = useState(true);
  const [ansViewerTab, setAnsViewerTab] = useState("expert"); // expert | community | resources

  // ── Answer Translation State ──
  const [translatedAnswersCache, setTranslatedAnswersCache] = useState({}); // { "answerId_lang": { content, concept, hints, examples } }
  const [ansTranslatingIds, setAnsTranslatingIds] = useState({}); // { "answerId_lang": true }

  const translateSingleAnswer = async (ans, lang) => {
    const cacheKey = `${ans._id}_${lang}`;
    if (translatedAnswersCache[cacheKey]) return; // already cached
    if (ansTranslatingIds[cacheKey]) return; // already in progress

    setAnsTranslatingIds(prev => ({ ...prev, [cacheKey]: true }));
    try {
      const res = await fetch("/api/ai/translate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: ans.content || "",
          concept: ans.concept || "",
          hints: ans.hints || [],
          examples: ans.examples || [],
          targetLang: lang
        })
      });
      if (res.ok) {
        const data = await res.json();
        setTranslatedAnswersCache(prev => ({ ...prev, [cacheKey]: data }));
      }
    } catch (err) {
      console.error("Answer translation error:", err);
    } finally {
      setAnsTranslatingIds(prev => ({ ...prev, [cacheKey]: false }));
    }
  };

  const translateAllVisibleAnswers = async (lang) => {
    if (lang === "english") return;
    for (const ans of answers) {
      const cacheKey = `${ans._id}_${lang}`;
      if (!translatedAnswersCache[cacheKey] && !ansTranslatingIds[cacheKey]) {
        translateSingleAnswer(ans, lang);
      }
    }
  };

  const getTranslatedAnswer = (ans) => {
    if (qaLanguage === "english") return null;
    const cacheKey = `${ans._id}_${qaLanguage}`;
    return translatedAnswersCache[cacheKey] || null;
  };

  const isAnswerTranslating = (ans) => {
    if (qaLanguage === "english") return false;
    const cacheKey = `${ans._id}_${qaLanguage}`;
    return !!ansTranslatingIds[cacheKey];
  };

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
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/academic", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
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

  const handleAutoTranslate = async () => {
    // 1. Mark fields as touched
    setAskTouched(prev => ({ ...prev, title: true, description: true }));

    // 2. We remove strict length/regex validateField() constraints here, 
    // to allow pure Sinhala or sparse notes to naturally trigger translation!
    if (!askData.title || !askData.description) {
      setSubmitError("Please provide a title and description before translating.");
      return;
    }

    try {
      setIsTranslating(true);
      setSubmitError("");
      const res = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: askData.title,
          description: askData.description,
          stuck: askData.whatIveTried
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Translation failed");

      setSinhalaData(data.sinhala);
      setTamilData(data.tamil);
      setTranslationTab("sinhala"); // Auto-switch to show results
    } catch (error) {
      console.error("Translation Error:", error);
      setSubmitError("AI Translation service is temporarily unavailable. You can still submit in English.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleGlobalAutoFill = async () => {
    const sourceData = translationTab === 'sinhala' ? sinhalaData : translationTab === 'tamil' ? tamilData : askData;

    if (!sourceData.title || !sourceData.description) {
      setSubmitError(`Please provide a title and description in ${translationTab} for the AI to analyze.`);
      return;
    }

    try {
      setIsTranslating(true);
      setSubmitError("");

      // Advanced: Call a consolidated translation & enhancement endpoint
      const res = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: sourceData.title,
          description: sourceData.description,
          stuck: sourceData.stuck || sourceData.whatIveTried,
          enhance: true // Request AI enhancement
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Global sync failed");

      // Update all datasets
      if (data.enhancedEnglish) {
        setAskData(prev => ({
          ...prev,
          title: data.enhancedEnglish.title || prev.title,
          description: data.enhancedEnglish.description || prev.description,
          whatIveTried: data.enhancedEnglish.stuck || prev.whatIveTried
        }));
      }

      setSinhalaData(data.sinhala);
      setTamilData(data.tamil);

      // Visual feedback
      setTranslationTab("sinhala");
    } catch (error) {
      console.error("Global Auto-Fill Error:", error);
      setSubmitError("Advanced AI Sync failed. Proceeding with manual translation...");
      // Fallback to basic translate
      handleAutoTranslate();
    } finally {
      setIsTranslating(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    // Mark all step 2 fields as touched
    setAskTouched(prev => ({ ...prev, title: true, description: true, whatIveTried: true }));

    const errors = {};
    const titleErr = validateField('title', askData.title);
    const descErr = validateField('description', askData.description);
    const stuckErr = validateField('whatIveTried', askData.whatIveTried);
    if (titleErr) errors.title = titleErr;
    if (descErr) errors.description = descErr;
    if (stuckErr) errors.whatIveTried = stuckErr;

    if (Object.keys(errors).length > 0) {
      setAskErrors(prev => ({ ...prev, ...errors }));
      return;
    }

    setAskErrors({});
    setSubmitError("");
    try {
      setIsSubmitting(true);

      // Determine main submission data based on user's selected language
      let mainData = askData;
      let langLabel = "English";

      if (comfortableLanguage === "si-LK" || translationTab === "sinhala") {
        if (sinhalaData.title && sinhalaData.description) {
          mainData = { ...sinhalaData, whatIveTried: sinhalaData.stuck };
          langLabel = "Sinhala";
        }
      } else if (comfortableLanguage === "ta-LK" || translationTab === "tamil") {
        if (tamilData.title && tamilData.description) {
          mainData = { ...tamilData, whatIveTried: tamilData.stuck };
          langLabel = "Tamil";
        }
      }

      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: (mainData.title || askData.title).trim(),
          description: (mainData.description || askData.description).trim(),
          topic: askData.topic.trim(),
          urgencyLevel: askData.urgencyLevel,
          difficultyLevel: askData.difficultyLevel,
          whatIveTried: (mainData.whatIveTried || askData.whatIveTried).trim(),
          assignmentContext: askData.assignmentContext.trim(),
          codeSnippet: askData.codeSnippet.trim(),
          module: selectedModule.moduleName,
          year: String(selectedYear),
          semester: String(selectedSemester),
          student: user?.id || user?.userId,
          originalLanguage: langLabel,
          translatedVersions: (sinhalaData.title || tamilData.title) ? {
            english: askData.title.trim(),
            sinhala: sinhalaData.title.trim(),
            tamil: tamilData.title.trim(),
            sinhalaDescription: sinhalaData.description.trim(),
            tamilDescription: tamilData.description.trim(),
            sinhalaStuck: sinhalaData.stuck.trim(),
            tamilStuck: tamilData.stuck.trim()
          } : null
        }),
      });
      console.log("Submission Status:", res.status);
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
      setAskTouched({});
      setSinhalaData({ title: "", description: "", stuck: "" });
      setTamilData({ title: "", description: "", stuck: "" });
      setTranslationTab("english");
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
    if (askStep === 1) {
      // Mark topic as touched
      setAskTouched(prev => ({ ...prev, topic: true }));
      // Trim the topic value
      const trimmedTopic = askData.topic.trim().replace(/  +/g, ' ');
      setAskData(prev => ({ ...prev, topic: trimmedTopic }));

      const topicErr = validateField('topic', trimmedTopic);
      if (topicErr) {
        setAskErrors(prev => ({ ...prev, topic: topicErr }));
        return;
      }
    }

    setAskErrors({});
    setSubmitError("");
    setAskStep(s => Math.min(s + 1, 2));
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
    setQaLanguage("english"); // Default to English when opening a new question
    fetchAnswers(q._id);
    // update view count locally
    setSelectedQuestion(prev => ({ ...prev, views: (prev.views || 0) + 1 }));
  };
  const closeQuestion = () => {
    setSelectedQuestion(null);
    setAnswers([]);
    setTranslatedAnswersCache({});
    setAnsTranslatingIds({});
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
        if (setActiveTab) setActiveTab("resources");
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
                {user?.role?.toLowerCase() !== "lecturer" && user?.role?.toLowerCase() !== "helper" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setIsAskOpen(true); setSubmitError(""); setAskErrors({}); }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#FF9F1C] text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-all shadow-md active:scale-95"
                    >
                      <Plus size={16} /> Ask Question
                    </button>
                  </div>
                )}
              </div>

              {/* Filter & Search */}
              <div className="flex flex-col sm:flex-row gap-3 pb-4 border-b border-slate-100">
                <div className="flex gap-2">
                  {["all", "open", "unanswered", "resolved"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setQaFilter(f)}
                      className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${qaFilter === f
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
                  .filter((q) => qaFilter === "all" ? true : qaFilter === "unanswered" ? (q.answersCount || 0) === 0 : qaFilter === "resolved" ? (q.answersCount || 0) > 0 : !q.isResolved)
                  .filter((q) => !qaSearch || q.title.toLowerCase().includes(qaSearch.toLowerCase()) || q.description.toLowerCase().includes(qaSearch.toLowerCase()));
                return filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                    <HelpCircle size={36} className="text-slate-200 mb-3" />
                    <p className="text-slate-400 font-bold text-sm">No questions yet.</p>
                    {user?.role?.toLowerCase() !== "lecturer" && (
                      <button onClick={() => { setIsAskOpen(true); setSubmitError(""); setAskErrors({}); }} className="mt-2 text-[#FF9F1C] font-bold text-sm hover:underline">Be the first to ask!</button>
                    )}
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
                  <button onClick={closeAskModal} className="p-2 rounded-xl hover:bg-white/10 text-white/70 transition-all">
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
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-[#002147] font-bold mb-1">Academic Structure</h3>
                        <p className="text-xs text-slate-500">Confirm your academic context before asking.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsVoiceModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest border border-blue-100 hover:bg-blue-100 transition-all active:scale-95 shadow-sm"
                      >
                        <Mic size={14} /> Voice Assistant
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-center">
                        <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase mb-1">Academic Year</span>
                        <p className="text-base font-black text-[#002147]">{selectedYear}</p>
                      </div>
                      <div className="p-4 bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-center">
                        <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase mb-1">Semester</span>
                        <p className="text-base font-black text-[#002147]">{selectedSemester}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-center relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 transition-transform group-hover:scale-110 group-hover:rotate-12 duration-500">
                        <BookOpen size={40} className="text-blue-600" />
                      </div>
                      <span className="text-[9px] font-black tracking-widest text-blue-500 uppercase mb-1 relative z-10">Selected Module</span>
                      <p className="text-sm font-bold text-[#002147] relative z-10">{selectedModule?.moduleCode} - {selectedModule?.moduleName}</p>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between pl-1">
                        <label className="text-[11px] font-black text-slate-600 uppercase tracking-wide">Topic / Sub-topic <span className="text-red-400">*</span></label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => activeDictationField === 'topic' ? stopDictation() : startDictation('topic')}
                            className={`p-2 rounded-xl transition-all ${activeDictationField === 'topic' ? 'bg-red-50 text-red-500 animate-pulse border border-red-200' : 'bg-slate-50 text-slate-400 border border-transparent hover:bg-white hover:border-blue-200 hover:text-blue-500 hover:shadow-sm'}`}
                            title="Voice Dictation"
                          >
                            <Mic size={14} className={activeDictationField === 'topic' ? "scale-110" : ""} />
                          </button>
                          {(() => { const c = getCharInfo('topic', askData.topic); return c && (askTouched.topic || askData.topic.trim().length > 0) ? <span className={`text-[10px] font-bold ${c.color} tabular-nums px-2 py-1 bg-slate-50 rounded-lg border border-slate-100`}>{c.len} / {c.max}</span> : null; })()}
                        </div>
                      </div>
                      <input
                        type="text"
                        value={askData.topic}
                        onChange={(e) => handleFieldChange('topic', e.target.value)}
                        onBlur={() => handleFieldBlur('topic')}
                        maxLength={100}
                        className={`w-full bg-slate-50/50 border rounded-2xl py-3.5 px-5 text-sm font-semibold focus:outline-none transition-all focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 shadow-sm ${getFieldClasses('topic')}`}
                        placeholder="e.g. Networking Fundamentals"
                        autoFocus
                      />
                      {askErrors.topic && <p className="text-red-500 text-[11px] font-bold mt-1.5 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200"><AlertCircle size={12} /> {askErrors.topic}</p>}
                      {!askErrors.topic && askTouched.topic && askData.topic.trim().length >= 3 && <p className="text-emerald-500 text-[10px] font-bold mt-1 flex items-center gap-1"><CheckCircle size={11} /> Looks good!</p>}
                    </div>
                  </div>
                )}

                {askStep === 2 && (
                  <div className="space-y-6 animate-in slide-in-from-right-2 duration-300">
                    {/* ── Step 2 Header ── */}
                    <div>
                      <h3 className="text-[#002147] font-bold mb-1">Enter the Question</h3>
                      <p className="text-xs text-slate-500 mb-5">Provide a clear title and description. Use voice or type in your preferred language.</p>
                    </div>

                    {/* ── Unified Language & Voice Control Bar ── */}
                    <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50/30 border border-slate-200/60 rounded-[2rem] shadow-sm space-y-4">
                      {/* Language Tabs – controls both voice recognition & content tab */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex bg-white p-1 rounded-2xl border border-slate-200/50 shadow-inner w-full sm:w-auto">
                          {[
                            { id: "english", speechId: "en-US", label: "English", icon: "EN" },
                            { id: "sinhala", speechId: "si-LK", label: "සිංහල", icon: "සිං" },
                            { id: "tamil",   speechId: "ta-LK", label: "தமிழ்",  icon: "த" }
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => {
                                setTranslationTab(tab.id);
                                setComfortableLanguage(tab.speechId);
                              }}
                              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${translationTab === tab.id
                                ? "bg-[#002147] text-white shadow-lg shadow-blue-900/20 active:scale-95"
                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                }`}
                            >
                              <span className={translationTab === tab.id ? "text-blue-300" : "opacity-40"}>{tab.icon}</span>
                              <span>{tab.label}</span>
                            </button>
                          ))}
                        </div>

                        {/* AI Sync Button */}
                        <button
                          type="button"
                          onClick={handleGlobalAutoFill}
                          disabled={isTranslating || (!askData.title && !sinhalaData.title && !tamilData.title)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.12em] shadow-lg shadow-blue-500/20 hover:scale-[1.03] transition-all disabled:opacity-30 disabled:grayscale active:scale-95 whitespace-nowrap"
                        >
                          {isTranslating ? (
                            <><Loader2 size={14} className="animate-spin" /> Translating...</>
                          ) : (
                            <><Zap size={14} className="fill-white/30" /> Translate All</>
                          )}
                        </button>
                      </div>

                      {/* Voice Status Indicator */}
                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                          {activeDictationField ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-full border border-red-200 animate-pulse">
                              <div className="flex items-center gap-0.5 h-3">
                                {[1, 2, 3, 4, 3, 2, 1].map((h, i) => (
                                  <div
                                    key={i}
                                    className="w-0.5 bg-red-400 rounded-full animate-voice-pulse"
                                    style={{ height: `${h * 25}%`, animationDelay: `${i * 0.1}s` }}
                                  />
                                ))}
                              </div>
                              <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Recording • {activeDictationField}</span>
                              <button type="button" onClick={stopDictation} className="ml-1 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-all">
                                <X size={10} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Voice Ready • {comfortableLanguage === "en-US" ? "English" : comfortableLanguage === "si-LK" ? "සිංහල" : "தமிழ்"}</span>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsVoiceModalOpen(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl font-black text-[9px] uppercase tracking-widest border border-blue-100 hover:bg-blue-50 hover:border-blue-200 transition-all active:scale-95 shadow-sm"
                        >
                          <Mic size={13} /> Voice Assistant
                        </button>
                      </div>
                    </div>
                    <style jsx>{`
                      @keyframes voice-pulse {
                        0%, 100% { transform: scaleY(1); opacity: 0.5; }
                        50% { transform: scaleY(2.5); opacity: 1; }
                      }
                      .animate-voice-pulse {
                        animation: voice-pulse 1s ease-in-out infinite;
                      }
                    `}</style>

                    {/* ── Language-Specific Content Wrapper ── */}
                    <div className="space-y-5">
                      {/* ── English Tab (Primary Source) ── */}
                      {translationTab === "english" && (
                        <>
                          {/* ── Question Title ── */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between pl-1">
                              <label className="text-[11px] font-black text-slate-600 uppercase tracking-wide flex items-center gap-2">
                                <FileText size={14} className="text-blue-500" />
                                Question Title <span className="text-red-400">*</span>
                              </label>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => activeDictationField === 'title' ? stopDictation() : startDictation('title')}
                                  className={`p-2 rounded-xl transition-all ${activeDictationField === 'title' ? 'bg-red-50 text-red-500 animate-pulse border border-red-200' : 'bg-slate-50 text-slate-400 hover:text-blue-500 hover:bg-white border border-transparent hover:border-blue-200 hover:shadow-sm'}`}
                                  title="Voice Dictation"
                                >
                                  <Mic size={14} className={activeDictationField === 'title' ? "scale-110" : ""} />
                                </button>
                                {(() => { const c = getCharInfo('title', askData.title); return c && (askTouched.title || askData.title.trim().length > 0) ? <span className={`text-[10px] font-bold ${c.color} tabular-nums px-2 py-1 bg-slate-50 rounded-lg border border-slate-100`}>{c.len} / {c.max}</span> : null; })()}
                              </div>
                            </div>
                            <input
                              type="text"
                              value={askData.title}
                              onChange={(e) => handleFieldChange('title', e.target.value)}
                              onBlur={() => handleFieldBlur('title')}
                              maxLength={160}
                              className={`w-full bg-white border border-slate-200/80 rounded-2xl py-4 px-5 text-sm font-bold text-slate-700 focus:outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 shadow-sm ${getFieldClasses('title')}`}
                              placeholder="e.g. What is the difference between TCP and UDP?"
                              autoFocus
                            />
                            {askErrors.title && <p className="text-red-500 text-[11px] font-bold mt-2 flex items-center gap-1.5 animate-in slide-in-from-top-1 duration-200"><AlertCircle size={14} /> {askErrors.title}</p>}
                          </div>

                          {/* ── Problem Description ── */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between pl-1">
                              <label className="text-[11px] font-black text-slate-600 uppercase tracking-wide flex items-center gap-2">
                                <AlignLeft size={14} className="text-blue-500" />
                                Problem Description <span className="text-red-400">*</span>
                              </label>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => activeDictationField === 'description' ? stopDictation() : startDictation('description')}
                                  className={`p-2 rounded-xl transition-all ${activeDictationField === 'description' ? 'bg-red-50 text-red-500 animate-pulse border border-red-200' : 'bg-slate-50 text-slate-400 border border-transparent hover:bg-white hover:border-blue-200 hover:text-blue-500 hover:shadow-sm'}`}
                                >
                                  <Mic size={14} className={activeDictationField === 'description' ? "scale-110" : ""} />
                                </button>
                                {(() => { const c = getCharInfo('description', askData.description); return c && (askTouched.description || askData.description.trim().length > 0) ? <span className={`text-[10px] font-bold ${c.color} tabular-nums px-2 py-1 bg-slate-50 rounded-lg border border-slate-100`}>{c.len} / {c.max}</span> : null; })()}
                              </div>
                            </div>
                            <textarea
                              value={askData.description}
                              onChange={(e) => handleFieldChange('description', e.target.value)}
                              onBlur={() => handleFieldBlur('description')}
                              maxLength={1050}
                              className={`w-full bg-white border border-slate-200/80 rounded-3xl py-4 px-6 text-[13px] leading-relaxed font-medium text-slate-700 h-36 resize-none focus:outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 shadow-sm ${getFieldClasses('description')}`}
                              placeholder="Describe your question in detail..."
                            />
                            {askErrors.description && <p className="text-red-500 text-[11px] font-bold mt-2 flex items-center gap-1.5 animate-in slide-in-from-top-1 duration-200"><AlertCircle size={14} /> {askErrors.description}</p>}
                          </div>

                          {/* ── Where Are You Stuck? ── */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-2">
                                <HelpCircle size={12} className="text-blue-500" />
                                Where are you stuck? <span className="text-slate-300 normal-case font-medium">(optional)</span>
                              </label>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => activeDictationField === 'whatIveTried' ? stopDictation() : startDictation('whatIveTried')}
                                  className={`p-1.5 rounded-lg transition-all ${activeDictationField === 'whatIveTried' ? 'bg-red-50 text-red-500 animate-pulse border border-red-200' : 'text-slate-400 hover:bg-blue-50 hover:text-blue-500'}`}
                                >
                                  <Mic size={14} />
                                </button>
                                {(() => { const c = getCharInfo('whatIveTried', askData.whatIveTried); return c && askData.whatIveTried.trim().length > 0 ? <span className={`text-[10px] font-bold ${c.color} tabular-nums px-2 py-0.5 bg-slate-50 rounded-md border border-slate-100`}>{c.len} / {c.max}</span> : null; })()}
                              </div>
                            </div>
                            <textarea
                              value={askData.whatIveTried}
                              onChange={(e) => handleFieldChange('whatIveTried', e.target.value)}
                              onBlur={() => handleFieldBlur('whatIveTried')}
                              maxLength={520}
                              className={`w-full bg-slate-50/50 border rounded-2xl py-3 px-5 text-sm font-medium h-20 resize-none focus:outline-none transition-all focus:bg-white focus:ring-4 focus:ring-blue-500/5 ${getFieldClasses('whatIveTried')}`}
                              placeholder="Explain what you've already tried..."
                            />
                          </div>
                        </>
                      )}

                      {/* ── Sinhala TabContent ── */}
                      {translationTab === "sinhala" && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-300">
                          <div className="p-5 bg-blue-50/40 rounded-[2rem] border border-blue-100/50 space-y-5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                              <Languages size={80} />
                            </div>
                            <div className="space-y-1.5 relative z-10">
                              <div className="flex items-center justify-between pl-1">
                                <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                  Question Title (සිංහල)
                                  {sinhalaData.title && <span className="px-2 py-0.5 bg-blue-600 text-white rounded-lg text-[8px] font-black uppercase tracking-tighter">AI Localized</span>}
                                </label>
                                <button
                                  type="button"
                                  onClick={() => activeDictationField === 'title' ? stopDictation() : startDictation('title')}
                                  className={`p-1.5 rounded-lg transition-all ${activeDictationField === 'title' ? 'bg-red-50 text-red-500 animate-pulse border border-red-200' : 'text-blue-400 hover:bg-blue-100 hover:text-blue-600'}`}
                                >
                                  <Mic size={14} />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={sinhalaData.title}
                                onChange={(e) => setSinhalaData({ ...sinhalaData, title: e.target.value })}
                                className="w-full bg-white border border-blue-200/60 rounded-2xl py-3.5 px-5 text-sm font-bold text-[#002147] focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                                placeholder="ප්‍රශ්නයේ මාතෘකාව මෙහි ඇතුළත් කරන්න..."
                              />
                            </div>
                            <div className="space-y-1.5 relative z-10">
                              <div className="flex items-center justify-between pl-1">
                                <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Problem Description (සිංහල)</label>
                                <button
                                  type="button"
                                  onClick={() => activeDictationField === 'description' ? stopDictation() : startDictation('description')}
                                  className={`p-1.5 rounded-lg transition-all ${activeDictationField === 'description' ? 'bg-red-50 text-red-500 animate-pulse border border-red-200' : 'text-blue-400 hover:bg-blue-100 hover:text-blue-600'}`}
                                >
                                  <Mic size={14} />
                                </button>
                              </div>
                              <textarea
                                value={sinhalaData.description}
                                onChange={(e) => setSinhalaData({ ...sinhalaData, description: e.target.value })}
                                className="w-full bg-white border border-blue-200/60 rounded-2xl py-4 px-5 text-sm font-medium text-[#002147] h-36 resize-none focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                                placeholder="ඔබේ ප්‍රශ්නය විස්තර කරන්න..."
                              />
                            </div>
                            <div className="space-y-1.5 relative z-10">
                              <div className="flex items-center justify-between pl-1">
                                <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Where I&apos;m Stuck (සිංහල)</label>
                                <button
                                  type="button"
                                  onClick={() => activeDictationField === 'whatIveTried' ? stopDictation() : startDictation('whatIveTried')}
                                  className={`p-1.5 rounded-lg transition-all ${activeDictationField === 'whatIveTried' ? 'bg-red-50 text-red-500 animate-pulse border border-red-200' : 'text-blue-400 hover:bg-blue-100 hover:text-blue-600'}`}
                                >
                                  <Mic size={14} />
                                </button>
                              </div>
                              <textarea
                                value={sinhalaData.stuck}
                                onChange={(e) => setSinhalaData({ ...sinhalaData, stuck: e.target.value })}
                                className="w-full bg-white border border-blue-200/60 rounded-2xl py-3 px-5 text-[13px] font-medium text-[#002147] h-16 resize-none focus:outline-none focus:border-blue-500/50 transition-all shadow-sm"
                                placeholder="ඔබ උත්සාහ කළ දේ..."
                              />
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium italic text-center px-4">
                            Note: The English version remains the primary submission for search and indexing.
                          </p>
                        </div>
                      )}

                      {/* ── Tamil Tab Content ── */}
                      {translationTab === "tamil" && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-300">
                          <div className="p-5 bg-emerald-50/40 rounded-[2rem] border border-emerald-100/50 space-y-5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                              <Languages size={80} className="text-emerald-500" />
                            </div>
                            <div className="space-y-1.5 relative z-10">
                              <div className="flex items-center justify-between pl-1">
                                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                  Question Title (தமிழ்)
                                  {tamilData.title && <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-lg text-[8px] font-black uppercase tracking-tighter">AI Localized</span>}
                                </label>
                                <button
                                  type="button"
                                  onClick={() => activeDictationField === 'title' ? stopDictation() : startDictation('title')}
                                  className={`p-1.5 rounded-lg transition-all ${activeDictationField === 'title' ? 'bg-red-50 text-red-500 animate-pulse border border-red-200' : 'text-emerald-400 hover:bg-emerald-100 hover:text-emerald-600'}`}
                                >
                                  <Mic size={14} />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={tamilData.title}
                                onChange={(e) => setTamilData({ ...tamilData, title: e.target.value })}
                                className="w-full bg-white border border-emerald-200/60 rounded-2xl py-3.5 px-5 text-sm font-bold text-[#002147] focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-sm"
                                placeholder="கேள்வியின் தலைப்பை இங்கே உள்ளிடவும்..."
                              />
                            </div>
                            <div className="space-y-1.5 relative z-10">
                              <div className="flex items-center justify-between pl-1">
                                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Problem Description (தமிழ்)</label>
                                <button
                                  type="button"
                                  onClick={() => activeDictationField === 'description' ? stopDictation() : startDictation('description')}
                                  className={`p-1.5 rounded-lg transition-all ${activeDictationField === 'description' ? 'bg-red-50 text-red-500 animate-pulse border border-red-200' : 'text-emerald-400 hover:bg-emerald-100 hover:text-emerald-600'}`}
                                >
                                  <Mic size={14} />
                                </button>
                              </div>
                              <textarea
                                value={tamilData.description}
                                onChange={(e) => setTamilData({ ...tamilData, description: e.target.value })}
                                className="w-full bg-white border border-emerald-200/60 rounded-2xl py-4 px-5 text-sm font-medium text-[#002147] h-36 resize-none focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-sm"
                                placeholder="உங்கள் கேள்வியை விவரிக்கவும்..."
                              />
                            </div>
                            <div className="space-y-1.5 relative z-10">
                              <div className="flex items-center justify-between pl-1">
                                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Where I&apos;m Stuck (தமிழ்)</label>
                                <button
                                  type="button"
                                  onClick={() => activeDictationField === 'whatIveTried' ? stopDictation() : startDictation('whatIveTried')}
                                  className={`p-1.5 rounded-lg transition-all ${activeDictationField === 'whatIveTried' ? 'bg-red-50 text-red-500 animate-pulse border border-red-200' : 'text-emerald-400 hover:bg-emerald-100 hover:text-emerald-600'}`}
                                >
                                  <Mic size={14} />
                                </button>
                              </div>
                              <textarea
                                value={tamilData.stuck}
                                onChange={(e) => setTamilData({ ...tamilData, stuck: e.target.value })}
                                className="w-full bg-white border border-emerald-200/60 rounded-2xl py-3 px-5 text-[13px] font-medium text-[#002147] h-16 resize-none focus:outline-none focus:border-emerald-500/50 transition-all shadow-sm"
                                placeholder="நீங்கள் ஏற்கனவே முயற்சித்ததை விவரிக்கவும்..."
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ── Urgency Level (Global for all languages) ── */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-2">
                          <Zap size={14} className="text-amber-500" />
                          Urgency Level <span className="text-red-400">*</span>
                        </label>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter bg-slate-100 px-2 py-0.5 rounded">Selection Required</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {["Normal", "Urgent"].map(urgency => (
                          <label key={urgency} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${askData.urgencyLevel === urgency ? 'bg-amber-50/50 border-amber-500 ring-4 ring-amber-500/5 shadow-md active:scale-[0.98]' : 'bg-white border-slate-100 hover:border-amber-200 hover:bg-slate-50/30'}`}>
                            <input
                              type="radio"
                              name="urgencyLevel"
                              className="hidden"
                              value={urgency}
                              checked={askData.urgencyLevel === urgency}
                              onChange={(e) => setAskData({ ...askData, urgencyLevel: e.target.value })}
                            />
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${askData.urgencyLevel === urgency ? 'border-amber-600 bg-amber-600' : 'border-slate-300'}`}>
                              {askData.urgencyLevel === urgency && <Check size={14} className="text-white" />}
                            </div>
                            <div className="flex flex-col">
                              <span className={`text-sm font-black ${askData.urgencyLevel === urgency ? 'text-amber-700' : 'text-slate-600'}`}>{urgency}</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{urgency === 'Urgent' ? 'Priority Response' : 'Standard Queue'}</span>
                            </div>
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
                  onClick={() => askStep > 1 ? setAskStep(s => s - 1) : closeAskModal()}
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

        {/* ── Question Detail Component ── */}
        {selectedQuestion && (
          isLecturerLike ? (
            <ExpertDetailView
              selectedQuestion={selectedQuestion}
              user={user}
              qaLanguage={qaLanguage}
              setQaLanguage={setQaLanguage}
              closeQuestion={closeQuestion}
              timeSince={timeSince}
              answers={answers}
              expertAnswers={answers.filter(a => ['lecturer', 'helper', 'admin'].includes(a.student?.role?.toLowerCase()))}
              communityAnswers={answers.filter(a => !['lecturer', 'helper', 'admin'].includes(a.student?.role?.toLowerCase()))}
              allResources={answers.flatMap(a => a.supportingResources || []).filter(r => r.title && r.url)}
              ansViewerTab={ansViewerTab}
              setAnsViewerTab={setAnsViewerTab}
              fetchAnswers={fetchAnswers}
              setSelectedQuestion={setSelectedQuestion}
              setViewingProfileId={setViewingProfileId}
            />
          ) : (
            <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white w-full sm:max-w-4xl h-full sm:h-[85vh] rounded-t-3xl sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
                <div className="px-8 py-5 border-b border-slate-100 shrink-0 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-1 rounded-xl">
                        {["english", "sinhala", "tamil"].map((lang) => (
                          <button key={lang} onClick={() => setQaLanguage(lang)} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${qaLanguage === lang ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"}`}>{lang === "english" ? "EN" : lang === "sinhala" ? "සිං" : "த"}</button>
                        ))}
                      </div>
                      <button onClick={closeQuestion} className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"><X size={20} /></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar group/scroll">
                        <div className="p-8 sm:p-10 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
                            <div className="flex items-center gap-3 mb-4">
                               {selectedQuestion.isResolved ? (
                                 <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase border border-emerald-100">
                                   <CheckCircle size={10} /> Resolved
                                 </span>
                               ) : (
                                 <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-500 rounded-lg text-[9px] font-black uppercase border border-orange-100">
                                   <Clock size={10} /> Open
                                 </span>
                               )}
                               <span className="text-[10px] text-slate-400">{timeSince(selectedQuestion.createdAt)}</span>
                            </div>
                            <h3 className="text-2xl font-black text-[#002147] mb-6">
                                {qaLanguage === "english" ? selectedQuestion.title : (selectedQuestion.translatedVersions?.[qaLanguage] || selectedQuestion.title)}
                            </h3>

                            <div className="mt-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                <p className="text-slate-600 leading-relaxed font-medium">
                                    {qaLanguage === "english" ? selectedQuestion.description : (selectedQuestion.translatedVersions?.[`${qaLanguage}Description`] || selectedQuestion.description)}
                                </p>
                            </div>

                            {selectedQuestion.whatIveTried && (
                                <div className="mt-4 p-5 bg-orange-50/30 rounded-[2rem] border border-orange-100/50 text-xs italic text-slate-600">
                                    <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Stuck Context</h4>
                                    "{qaLanguage === "english" ? selectedQuestion.whatIveTried : (selectedQuestion.translatedVersions?.[`${qaLanguage}Stuck`] || selectedQuestion.whatIveTried)}"
                                </div>
                            )}
                        </div>

                        <div className="p-8 space-y-8">
                             <div className="flex items-center gap-4 mb-8 flex-wrap">
                               <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit">
                                  {['expert', 'community'].map(tab => (
                                      <button key={tab} onClick={() => setAnsViewerTab(tab)} className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${ansViewerTab === tab ? "bg-[#002147] text-white" : "text-slate-400"}`}>{tab}</button>
                                  ))}
                               </div>
                               {qaLanguage !== "english" && (
                                 <button
                                   onClick={() => translateAllVisibleAnswers(qaLanguage)}
                                   disabled={Object.values(ansTranslatingIds).some(v => v)}
                                   className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-105 transition-all disabled:opacity-50 disabled:grayscale active:scale-95"
                                 >
                                   {Object.values(ansTranslatingIds).some(v => v) ? (
                                     <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Translating...</>
                                   ) : (
                                     <><Zap size={12} className="fill-white/30" /> Translate All to {qaLanguage === "sinhala" ? "සිංහල" : "தமிழ்"}</>
                                   )}
                                 </button>
                               )}
                             </div>
                             
                             <div className="space-y-6">
                                {(ansViewerTab === 'expert' ? answers.filter(a => ['lecturer', 'helper', 'admin'].includes(a.student?.role?.toLowerCase())) : answers.filter(a => !['lecturer', 'helper', 'admin'].includes(a.student?.role?.toLowerCase()))).map(ans => {
                                  const isLec = ans.student?.role?.toLowerCase() === 'lecturer';
                                  const isSelf = String(ans.student?._id || ans.student?.studentId) === String(user?.id || user?.userId);
                                  const translated = getTranslatedAnswer(ans);
                                  const translating = isAnswerTranslating(ans);
                                  const displayContent = translated?.content || ans.content;
                                  const displayConcept = translated?.concept || ans.concept;
                                  const displayHints = (translated?.hints?.length > 0) ? translated.hints : (ans.hints || []);
                                  const displayExamples = (translated?.examples?.length > 0) ? translated.examples : (ans.examples || []);

                                  return (
                                    <div key={ans._id} className={`relative group/guidance p-px rounded-[2rem] bg-gradient-to-br transition-all duration-300 ${isSelf ? 'from-blue-200 via-white to-blue-200 ring-2 ring-blue-500/20' : 'from-slate-200 via-white to-slate-200'}`}>
                                      <div className="bg-white/95 backdrop-blur-2xl rounded-[1.9rem] p-5 sm:p-6 space-y-5 relative overflow-hidden">
                                        <div className={`absolute top-0 left-0 w-1 h-full ${isLec ? 'bg-orange-500' : 'bg-blue-600'}`} />
                                        
                                        <div className="flex items-start justify-between gap-4">
                                          <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black uppercase shadow-inner ${isLec ? 'bg-orange-600 text-white' : 'bg-[#002147] text-white'}`}>
                                              {(ans.student?.name || ans.student?.studentId || "E")[0]}
                                            </div>
                                            <div>
                                              <p className="text-[13px] font-black text-[#002147] flex items-center gap-2">
                                                {ans.student?.name || ans.student?.studentId || "Anonymous"}
                                                {isSelf && <span className="text-[9px] text-blue-500 font-black uppercase tracking-tighter bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100">You</span>}
                                              </p>
                                              <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${isLec ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                                                  {ans.student?.role || (ansViewerTab === 'expert' ? "Expert" : "Student")}
                                                </span>
                                                <span className="w-0.5 h-0.5 bg-slate-200 rounded-full"></span>
                                                <span className="text-[9px] text-slate-400 font-bold">{timeSince(ans.createdAt)}</span>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0">
                                            {displayConcept && (
                                              <span className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-500 truncate max-w-[120px]">
                                                {displayConcept}
                                              </span>
                                            )}
                                            {qaLanguage !== "english" && !translated && !translating && (
                                              <button
                                                onClick={(e) => { e.stopPropagation(); translateSingleAnswer(ans, qaLanguage); }}
                                                className="p-1.5 bg-blue-50 text-blue-500 hover:bg-blue-100 rounded-lg transition-all text-[8px] font-black border border-blue-100"
                                                title={`Translate to ${qaLanguage}`}
                                              >
                                                <Languages size={12} />
                                              </button>
                                            )}
                                            {translating && (
                                              <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-lg border border-blue-100">
                                                <div className="w-3 h-3 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                                                <span className="text-[8px] font-black text-blue-500">Translating</span>
                                              </div>
                                            )}
                                            {qaLanguage !== "english" && translated && (
                                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[7px] font-black uppercase tracking-widest border border-emerald-100">
                                                {qaLanguage === "sinhala" ? "සිංහල" : "தமிழ்"}
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        <div className="relative">
                                          <div className="text-[12px] text-slate-600 leading-relaxed font-semibold border-l-2 border-slate-100 pl-4 py-1 whitespace-pre-wrap">
                                            {displayContent}
                                          </div>
                                        </div>

                                        {(displayHints.length > 0 || displayExamples.length > 0) && (
                                          <div className="pt-4 border-t border-slate-50 grid grid-cols-2 gap-4">
                                            {displayHints.length > 0 && (
                                              <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-md bg-blue-50 flex items-center justify-center text-blue-500">
                                                  <Zap size={10} />
                                                </div>
                                                <span className="text-[9px] font-black text-slate-400">{displayHints.length} Hints</span>
                                              </div>
                                            )}
                                            {displayExamples.length > 0 && (
                                              <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-500">
                                                  <GraduationCap size={10} />
                                                </div>
                                                <span className="text-[9px] font-black text-slate-400">{displayExamples.length} Examples</span>
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {/* Show actual hints and examples and resources to the student view so they can see them! */}
                                        {(displayHints.length > 0 || displayExamples.length > 0 || ans.supportingResources?.length > 0) && (
                                          <div className="mt-4 space-y-5 pt-4 border-t border-slate-50 transition-all">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                              {displayHints.length > 0 && (
                                                <div className="space-y-2.5">
                                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Incremental Hints</p>
                                                  <div className="space-y-2">
                                                    {displayHints.map((h, i) => (
                                                      <div key={i} className="group/hint p-3.5 bg-slate-50/40 rounded-2xl border border-slate-100 transition-colors relative overflow-hidden">
                                                        <div className="absolute top-0 left-0 w-0.5 h-full bg-blue-200" />
                                                        <div className="flex gap-2.5">
                                                          <span className="text-[9px] font-black text-blue-500 bg-blue-50 w-4 h-4 rounded flex items-center justify-center shrink-0">
                                                            {i + 1}
                                                          </span>
                                                          <p className="text-xs text-slate-600 font-bold leading-relaxed">{h}</p>
                                                        </div>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}

                                              {displayExamples.length > 0 && (
                                                <div className="space-y-2.5">
                                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Example Scenarios</p>
                                                  <div className="space-y-2">
                                                    {displayExamples.map((ex, i) => (
                                                      <div key={i} className="p-3.5 bg-blue-50/10 border border-blue-100/30 rounded-2xl text-[10px] text-slate-500 font-bold italic leading-relaxed relative">
                                                        <div className="absolute -top-1.5 -left-1.5 p-0.5 bg-white border border-blue-100 rounded shadow-xs">
                                                          <Zap size={8} className="text-blue-500" />
                                                        </div>
                                                        "{ex}"
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}
                                            </div>

                                            {ans.supportingResources?.length > 0 && (
                                              <div className="pt-4 border-t border-slate-50">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Learning Resources</p>
                                                <div className="flex flex-wrap gap-2">
                                                  {ans.supportingResources.map((res, i) => (
                                                    <a
                                                      key={i}
                                                      href={res.url}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="flex items-center gap-2.5 px-3 py-1.5 bg-white border border-slate-200/60 hover:border-blue-300 rounded-xl text-[10px] font-black text-blue-600 shadow-sm transition-all hover:-translate-y-0.5"
                                                    >
                                                      <ExternalLink size={10} />
                                                      {res.title}
                                                    </a>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                             </div>
                        </div>
                </div>
              </div>
            </div>
          )
        )}


        <VoiceInteractionModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          selectedModule={selectedModule}
          user={user}
          onDraftQuestion={handleDraftVoiceQuestion}
        />

        {viewingProfileId && <UserProfileModal userId={viewingProfileId} currentUser={user} onClose={() => setViewingProfileId(null)} />}
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
                      setActiveView("qa");
                    }}
                    className="flex flex-col p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all cursor-pointer group"
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
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed flex-1">
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
      <style jsx global>{`
        .group\\/scroll::-webkit-scrollbar {
          width: 5px;
        }
        .group\\/scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .group\\/scroll::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .group\\/scroll::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
