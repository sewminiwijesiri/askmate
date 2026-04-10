"use client";

import React, { useState } from 'react';
import {
  Send, Zap, Eye, X, Plus, Clock,
  MessageSquare, ExternalLink, GraduationCap, CheckCircle, ThumbsUp
} from 'lucide-react';

const ONLY_NUMBERS = /^\d+$/;
const HAS_LETTER = /[a-zA-Z]/;
const ONLY_SYMBOLS = /^[^a-zA-Z0-9]+$/;

const isGibberish = (text) => {
  if (!text) return false;
  // Simple heuristic: repeated chars too many times or very low vowel/consonant ratio for English
  const repeatedChar = /(.)\1{4,}/.test(text);
  if (repeatedChar) return true;
  return false;
};

export default function GuidanceForm({
  selectedQuestion,
  user,
  onSuccess,
  timeSince,
  answers = []
}) {
  const [answerContent, setAnswerContent] = useState("");
  const [ansConcept, setAnsConcept] = useState("");
  const [ansHints, setAnsHints] = useState([""]);
  const [ansExamples, setAnsExamples] = useState([""]);
  const [ansResources, setAnsResources] = useState([{ title: "", url: "" }]);
  const [ansActiveTab, setAnsActiveTab] = useState("collective"); // collective | response | guidance | preview
  const [isPostingAnswer, setIsPostingAnswer] = useState(false);
  const [ansErrors, setAnsErrors] = useState({});
  const [ansTouched, setAnsTouched] = useState({});

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

  const isSpam = (text) => {
    if (!text) return false;
    const lower = text.toLowerCase();
    if (lower === 'test' || lower === 'asdfgh' || lower === '12345') return true;
    if (/^(.)\1{4,}$/.test(lower)) return true;
    return false;
  };

  const validateAnswerField = (field, value, index = null, subfield = null) => {
    const trimmed = (value || '').trim().replace(/\s{2,}/g, ' ');

    switch (field) {
      case 'answerContent': {
        if (ansActiveTab === 'guidance') return null;
        if (!trimmed) return 'Total content must not be empty';
        if (trimmed.length < 10) return 'Please provide a more meaningful answer (at least 10 characters)';
        if (trimmed.length > 2000) return 'Answer cannot exceed 2000 characters';
        if (ONLY_NUMBERS.test(trimmed) || ONLY_SYMBOLS.test(trimmed) || !HAS_LETTER.test(trimmed) || isGibberish(trimmed) || isSpam(trimmed)) return 'Must contain meaningful text';
        return null;
      }
      case 'ansConcept': {
        if (!trimmed) return 'Core concept is required';
        if (trimmed.length < 5 || trimmed.length > 200) return 'Must be between 5 and 200 characters';
        if (ONLY_NUMBERS.test(trimmed) || ONLY_SYMBOLS.test(trimmed) || !HAS_LETTER.test(trimmed) || isGibberish(trimmed) || isSpam(trimmed)) return 'Must contain meaningful text';
        return null;
      }
      case 'ansHints': {
        if (!trimmed) return null;
        if (trimmed.length < 5 || trimmed.length > 300) return 'Hint must be at least 5 characters';
        if (ONLY_NUMBERS.test(trimmed) || ONLY_SYMBOLS.test(trimmed) || !HAS_LETTER.test(trimmed) || isGibberish(trimmed) || isSpam(trimmed)) return 'Hint should be meaningful and helpful';
        return null;
      }
      case 'ansExamples': {
        if (!trimmed) {
            if (index === 0) return 'At least one scenario is required';
            return null;
        }
        if (trimmed.length < 10 || trimmed.length > 1000) return 'Scenario must be meaningful and detailed';
        if (ONLY_NUMBERS.test(trimmed) || ONLY_SYMBOLS.test(trimmed) || !HAS_LETTER.test(trimmed) || isGibberish(trimmed) || isSpam(trimmed)) return 'Scenario must be meaningful and detailed';
        return null;
      }
      case 'ansResources': {
        if (subfield === 'url') {
          const currentTitle = ansResources[index]?.title?.trim();
          if (!trimmed) return currentTitle ? 'Enter a valid URL (must start with http/https)' : null;
          const urlRegex = /^(https?:\/\/)[^\s$.?#].[^\s]*$/;
          if (!urlRegex.test(trimmed)) return 'Enter a valid URL (must start with http/https)';
          return null;
        }
        if (subfield === 'title') {
          const currentUrl = ansResources[index]?.url?.trim();
          if (!trimmed) return currentUrl ? 'Resource title is required' : null;
          if (trimmed.length < 3) return 'Resource title is required';
          return null;
        }
        return null;
      }
      default: return null;
    }
  };

  const isFormInvalid = () => {
      if (ansActiveTab === 'response') return !!validateAnswerField('answerContent', answerContent);
      if (ansActiveTab === 'guidance') {
          if (validateAnswerField('ansConcept', ansConcept)) return true;
          if (ansHints.some((h, i) => validateAnswerField('ansHints', h, i))) return true;
          if (ansExamples.some((ex, i) => validateAnswerField('ansExamples', ex, i))) return true;
          if (ansResources.some((r, i) => validateAnswerField('ansResources', r.title, i, 'title') || validateAnswerField('ansResources', r.url, i, 'url'))) return true;
          return false;
      }
      return true;
  };

  const getAnsFieldClasses = (field, index = null) => {
    const fieldKey = index !== null ? `${field}_${index}` : field;
    const hasError = ansErrors[fieldKey];
    const isTouched = ansTouched[fieldKey];
    if (hasError && isTouched) return 'border-red-400 focus:border-red-500 ring-2 ring-red-400/10 bg-red-50/10';
    if (!hasError && isTouched) return 'border-emerald-400 focus:border-emerald-500 ring-2 ring-emerald-400/10 bg-emerald-50/10';
    return 'border-slate-200 focus:border-blue-500';
  };

  const getAnsCharInfo = (field, val) => {
    const len = (val || "").trim().length;
    const max = field === 'answerContent' ? 2000 : field === 'ansConcept' ? 200 : field === 'ansHints' ? 300 : field === 'ansExamples' ? 1000 : 100;
    let color = "text-slate-300";
    if (len > max * 0.9) color = "text-red-500";
    else if (len > max * 0.7) color = "text-amber-500";
    return { len, max, color };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const touchedBatch = { answerContent: true };
    touchedBatch.ansConcept = true;
    ansHints.forEach((_, i) => touchedBatch[`ansHints_${i}`] = true);
    ansExamples.forEach((_, i) => touchedBatch[`ansExamples_${i}`] = true);
    ansResources.forEach((_, i) => {
      touchedBatch[`ansResources_${i}_title`] = true;
      touchedBatch[`ansResources_${i}_url`] = true;
    });
    setAnsTouched(prev => ({ ...prev, ...touchedBatch }));

    const errors = {};
    if (ansActiveTab === 'response') {
        const mainErr = validateAnswerField('answerContent', answerContent);
        if (mainErr) errors.answerContent = mainErr;
    } else if (ansActiveTab === 'guidance') {
        const conceptErr = validateAnswerField('ansConcept', ansConcept);
        if (conceptErr) errors.ansConcept = conceptErr;

        ansHints.forEach((h, i) => {
            const err = validateAnswerField('ansHints', h, i);
            if (err) errors[`ansHints_${i}`] = err;
        });

        ansExamples.forEach((ex, i) => {
            const err = validateAnswerField('ansExamples', ex, i);
            if (err) errors[`ansExamples_${i}`] = err;
        });

        ansResources.forEach((res, i) => {
            const titleErr = validateAnswerField('ansResources', res.title, i, 'title');
            const urlErr = validateAnswerField('ansResources', res.url, i, 'url');
            if (titleErr) errors[`ansResources_${i}_title`] = titleErr;
            if (urlErr) errors[`ansResources_${i}_url`] = urlErr;
        });
    }

    if (Object.keys(errors).length > 0) {
      setAnsErrors(errors);
      return;
    }

    try {
      setIsPostingAnswer(true);
      const res = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: selectedQuestion._id,
          author: user?.id || user?.userId,
          authorType: user?.role === "lecturer" ? "Lecturer" : user?.role === "helper" ? "Helper" : "Student",
          content: answerContent.trim() || ansConcept.trim() || ansHints.find(h => h.trim()) || "Structured Guidance Provided",
          concept: ansConcept.trim(),
          hints: ansHints.filter(h => h.trim()),
          examples: ansExamples.filter(ex => ex.trim()),
          supportingResources: ansResources.filter(r => r.title.trim() && r.url.trim()),
        }),
      });
      if (res.ok) {
        setAnswerContent("");
        setAnsConcept("");
        setAnsHints([""]);
        setAnsExamples([""]);
        setAnsResources([{ title: "", url: "" }]);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Error posting answer:", error);
    } finally {
      setIsPostingAnswer(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 border-t border-slate-100 shrink-0 bg-white">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex p-1 bg-slate-100/80 rounded-2xl mb-4 border border-slate-200/50">
          {[
            { id: 'collective', label: 'Collective Wisdom', icon: GraduationCap },
            { id: 'response', label: 'Quick Response', icon: Send },
            { id: 'guidance', label: 'Structured Guidance', icon: Zap }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAnsActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${ansActiveTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
                }`}
            >
              <tab.icon size={12} className={ansActiveTab === tab.id ? "text-blue-500" : "opacity-40"} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-h-[400px] flex flex-col">
          {ansActiveTab === 'collective' && (
            <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300 max-h-[500px] overflow-y-auto px-1 pr-3 group/scroll">
              <div className="flex items-center justify-between mb-2 px-2">
                <h4 className="text-[11px] font-black text-[#002147] uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  Existing Expert Guidance ({answers.filter(a => ['lecturer', 'helper', 'admin'].includes(a.student?.role?.toLowerCase())).length})
                </h4>
                <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 border border-slate-200/50">
                  Shared Repository
                </div>
              </div>

              {answers.filter(a => ['lecturer', 'helper', 'admin'].includes(a.student?.role?.toLowerCase())).length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/30">
                  <div className="p-4 bg-white rounded-full shadow-sm w-fit mx-auto mb-4">
                    <GraduationCap size={32} className="text-slate-200" />
                  </div>
                  <h3 className="text-sm font-black text-[#002147] mb-1">No guidance yet</h3>
                  <p className="text-[11px] text-slate-400 font-medium max-w-[200px] mx-auto leading-relaxed">Be the first to establish the academic path for this question.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {answers.filter(a => ['lecturer', 'helper', 'admin'].includes(a.student?.role?.toLowerCase())).map((ans) => {
                    const isLec = ans.student?.role?.toLowerCase() === 'lecturer';
                    const isSelf = String(ans.student?._id || ans.student?.studentId) === String(user?.id || user?.userId);

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
                                  {ans.student?.name || ans.student?.studentId}
                                  {isSelf && <span className="text-[9px] text-blue-500 font-black uppercase tracking-tighter bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100">You</span>}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${isLec ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {ans.student?.role || "Expert"}
                                  </span>
                                  <span className="w-0.5 h-0.5 bg-slate-200 rounded-full"></span>
                                  <span className="text-[9px] text-slate-400 font-bold">{timeSince(ans.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                            {ans.concept && (
                              <span className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-500 truncate max-w-[100px]">
                                {ans.concept}
                              </span>
                            )}
                          </div>

                          <div className="relative">
                            <div className="text-[12px] text-slate-600 leading-relaxed font-semibold border-l-2 border-slate-100 pl-4 py-1 whitespace-pre-wrap">
                              {ans.content}
                            </div>
                          </div>

                          {/* Expanded Guidance Details */}
                          {(ans.hints?.length > 0 || ans.examples?.length > 0 || ans.supportingResources?.length > 0) && (
                            <div className="mt-4 space-y-5 pt-4 border-t border-slate-50 transition-all">
                              <div className="grid grid-cols-1 gap-5">
                                {ans.hints?.length > 0 && (
                                  <div className="space-y-2.5">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Incremental Hints</p>
                                    <div className="space-y-2">
                                      {ans.hints.map((h, i) => (
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

                                {ans.examples?.length > 0 && (
                                  <div className="space-y-2.5">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Example Scenarios</p>
                                    <div className="space-y-2">
                                      {ans.examples.map((ex, i) => (
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
              )}
            </div>
          )}

          {ansActiveTab === 'response' && (
            <div className="flex-1 flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="flex-1 relative group">
                <textarea
                  value={answerContent}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/  +/g, ' ');
                    setAnswerContent(cleaned);
                    if (ansTouched.answerContent) {
                      setAnsErrors(prev => ({ ...prev, answerContent: validateAnswerField('answerContent', cleaned) }));
                    }
                  }}
                  onBlur={() => {
                    const trimmed = answerContent.trim().replace(/\s{2,}/g, ' ');
                    setAnswerContent(trimmed);
                    setAnsTouched(prev => ({ ...prev, answerContent: true }));
                    setAnsErrors(prev => ({ ...prev, answerContent: validateAnswerField('answerContent', trimmed) }));
                  }}
                  placeholder={user?.role === "student" ? "Explain your solution clearly..." : "Summarize the key solution or provide bridge notes for your guidance..."}
                  className={`w-full bg-slate-50/30 border rounded-[2rem] p-6 text-sm font-medium text-[#002147] resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all min-h-[250px] placeholder:text-slate-300 ${getAnsFieldClasses('answerContent')}`}
                />
                <div className="absolute bottom-6 right-6 flex items-center gap-2">
                  {getAnsCharInfo('answerContent', answerContent) && (
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg bg-white border border-slate-100 shadow-sm ${getAnsCharInfo('answerContent', answerContent).color}`}>
                      {getAnsCharInfo('answerContent', answerContent).len} / {getAnsCharInfo('answerContent', answerContent).max}
                    </span>
                  )}
                </div>
              </div>
              {ansErrors.answerContent && ansTouched.answerContent && (
                <p className="text-[10px] text-red-500 font-bold ml-2">{ansErrors.answerContent}</p>
              )}
            </div>
          )}

          {ansActiveTab === 'guidance' && (
            <div className="flex-1 space-y-5 animate-in fade-in slide-in-from-right-4 duration-300 max-h-[400px] overflow-y-auto px-1 pr-3 group/scroll">
              <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-[2rem] space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                    <Zap size={12} /> Core Concept
                  </label>
                  {getAnsCharInfo('ansConcept', ansConcept) && (
                    <span className={`text-[9px] font-bold ${getAnsCharInfo('ansConcept', ansConcept).color}`}>
                      {getAnsCharInfo('ansConcept', ansConcept).len}/{getAnsCharInfo('ansConcept', ansConcept).max}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={ansConcept}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/  +/g, ' ');
                    setAnsConcept(cleaned);
                    if (ansTouched.ansConcept) setAnsErrors(prev => ({ ...prev, ansConcept: validateAnswerField('ansConcept', cleaned) }));
                  }}
                  onBlur={() => {
                    const trimmed = ansConcept.trim().replace(/\s{2,}/g, ' ');
                    setAnsConcept(trimmed);
                    setAnsTouched(prev => ({ ...prev, ansConcept: true }));
                    setAnsErrors(prev => ({ ...prev, ansConcept: validateAnswerField('ansConcept', trimmed) }));
                  }}
                  placeholder="e.g., Dijkstra's Algorithm, Big O notation..."
                  className={`w-full bg-white border rounded-2xl py-3 px-4 text-xs font-bold text-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-blue-300/60 ${getAnsFieldClasses('ansConcept')}`}
                />
                {ansErrors.ansConcept && ansTouched.ansConcept && <p className="text-[9px] text-red-500 font-bold ml-1">{ansErrors.ansConcept}</p>}
              </div>

              <div className="p-5 bg-white border border-slate-200 rounded-[2rem] space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incremental Hints</label>
                  <button type="button" onClick={addHint} className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                    <Plus size={10} /> Add Hint
                  </button>
                </div>
                <div className="space-y-3">
                  {ansHints.map((hint, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={hint}
                            onChange={(e) => updateHint(i, e.target.value.replace(/  +/g, ' '))}
                            onBlur={() => {
                              const trimmed = hint.trim().replace(/\s{2,}/g, ' ');
                              updateHint(i, trimmed);
                              setAnsTouched(prev => ({ ...prev, [`ansHints_${i}`]: true }));
                              setAnsErrors(prev => ({ ...prev, [`ansHints_${i}`]: validateAnswerField('ansHints', trimmed) }));
                            }}
                            placeholder={`Hint Step #${i + 1}`}
                            className={`w-full bg-slate-50 border rounded-xl py-3 px-4 text-xs font-bold text-slate-700 focus:outline-none transition-all ${getAnsFieldClasses('ansHints', i)}`}
                          />
                          {getAnsCharInfo('ansHints', hint) && (
                            <span className={`absolute right-3 top-4 text-[8px] font-bold ${getAnsCharInfo('ansHints', hint).color}`}>
                              {getAnsCharInfo('ansHints', hint).len}/{getAnsCharInfo('ansHints', hint).max}
                            </span>
                          )}
                        </div>
                        {ansHints.length > 1 && (
                          <button type="button" onClick={() => removeHint(i)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"><X size={14} /></button>
                        )}
                      </div>
                      {ansErrors[`ansHints_${i}`] && ansTouched[`ansHints_${i}`] && <p className="text-[8px] text-red-500 font-bold ml-1">{ansErrors[`ansHints_${i}`]}</p>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 bg-white border border-slate-200 rounded-[2rem] space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Example Scenarios</label>
                  <button type="button" onClick={addExample} className="text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                    <Plus size={10} /> Add Scenario
                  </button>
                </div>
                <div className="space-y-3">
                  {ansExamples.map((ex, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <textarea
                            value={ex}
                            onChange={(e) => {
                              const cleaned = e.target.value.replace(/  +/g, ' ');
                              updateExample(i, cleaned);
                              if (ansTouched[`ansExamples_${i}`]) {
                                setAnsErrors(prev => ({ ...prev, [`ansExamples_${i}`]: validateAnswerField('ansExamples', cleaned) }));
                              }
                            }}
                            onBlur={() => {
                              const trimmed = ex.trim().replace(/\s{2,}/g, ' ');
                              updateExample(i, trimmed);
                              setAnsTouched(prev => ({ ...prev, [`ansExamples_${i}`]: true }));
                              setAnsErrors(prev => ({ ...prev, [`ansExamples_${i}`]: validateAnswerField('ansExamples', trimmed) }));
                            }}
                            placeholder={`Scenario #${i + 1}`}
                            rows={2}
                            className={`w-full bg-slate-50 border rounded-xl py-3 px-4 text-xs font-bold text-slate-700 resize-none focus:outline-none transition-all ${getAnsFieldClasses('ansExamples', i)}`}
                          />
                          {getAnsCharInfo('ansExamples', ex) && (
                            <span className={`absolute right-3 top-4 text-[8px] font-bold ${getAnsCharInfo('ansExamples', ex).color}`}>
                              {getAnsCharInfo('ansExamples', ex).len}/{getAnsCharInfo('ansExamples', ex).max}
                            </span>
                          )}
                        </div>
                        {ansExamples.length > 1 && (
                          <button type="button" onClick={() => removeExample(i)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"><X size={14} /></button>
                        )}
                      </div>
                      {ansErrors[`ansExamples_${i}`] && ansTouched[`ansExamples_${i}`] && <p className="text-[8px] text-red-500 font-bold ml-1">{ansErrors[`ansExamples_${i}`]}</p>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 bg-white border border-slate-200 rounded-[2rem] space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supporting Resources</label>
                  <button type="button" onClick={addAnsResource} className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                    <Plus size={10} /> Add Resource
                  </button>
                </div>
                <div className="space-y-3">
                  {ansResources.map((res, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Resource #{i + 1}</span>
                        {ansResources.length > 1 && (
                          <button type="button" onClick={() => removeAnsResource(i)} className="text-red-400 hover:text-red-600"><X size={12} /></button>
                        )}
                      </div>
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={res.title}
                          onChange={(e) => {
                              updateAnsResource(i, 'title', e.target.value);
                              if (ansTouched[`ansResources_${i}_title`]) {
                                  setAnsErrors(p => ({ ...p, [`ansResources_${i}_title`]: validateAnswerField('ansResources', e.target.value, i, 'title') }));
                              }
                          }}
                          onBlur={() => {
                            const trimmed = res.title.trim();
                            updateAnsResource(i, 'title', trimmed);
                            setAnsTouched(p => ({ ...p, [`ansResources_${i}_title`]: true }));
                            setAnsErrors(p => ({ ...p, [`ansResources_${i}_title`]: validateAnswerField('ansResources', trimmed, i, 'title') }));
                          }}
                          placeholder="e.g., Module Documentation"
                          className={`w-full bg-white border rounded-lg py-2 px-3 text-[11px] font-bold text-slate-700 transition-all ${getAnsFieldClasses('ansResources', `${i}_title`)}`}
                        />
                        {ansErrors[`ansResources_${i}_title`] && ansTouched[`ansResources_${i}_title`] && <p className="text-[8px] text-red-500 font-bold ml-1">{ansErrors[`ansResources_${i}_title`]}</p>}
                      </div>
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={res.url}
                          onChange={(e) => {
                              updateAnsResource(i, 'url', e.target.value);
                              if (ansTouched[`ansResources_${i}_url`]) {
                                  setAnsErrors(p => ({ ...p, [`ansResources_${i}_url`]: validateAnswerField('ansResources', e.target.value, i, 'url') }));
                              }
                          }}
                          onBlur={() => {
                            const trimmed = res.url.trim();
                            updateAnsResource(i, 'url', trimmed);
                            setAnsTouched(p => ({ ...p, [`ansResources_${i}_url`]: true }));
                            setAnsErrors(p => ({ ...p, [`ansResources_${i}_url`]: validateAnswerField('ansResources', trimmed, i, 'url') }));
                          }}
                          placeholder="https://example.com/..."
                          className={`w-full bg-white border rounded-lg py-2 px-3 text-[11px] font-bold text-slate-700 transition-all ${getAnsFieldClasses('ansResources', `${i}_url`)}`}
                        />
                        {ansErrors[`ansResources_${i}_url`] && ansTouched[`ansResources_${i}_url`] && <p className="text-[8px] text-red-500 font-bold ml-1">{ansErrors[`ansResources_${i}_url`]}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {ansActiveTab === 'preview' && (
            <div className="flex-1 bg-slate-100/50 border border-slate-200/60 rounded-[2.5rem] p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-300 overflow-y-auto max-h-[500px] group/scroll relative shadow-inner">
              {/* Real-time Representation */}
              <div className="absolute top-4 right-6 flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm z-10 scale-90 sm:scale-100">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Real-time Preview</span>
              </div>

              <div className="space-y-6">
                <div className="relative p-0.5 rounded-[2.2rem] bg-gradient-to-br from-slate-200 via-white to-slate-200 shadow-xl border border-white">
                  <div className="bg-white/95 backdrop-blur-2xl rounded-[2.1rem] p-6 sm:p-7 space-y-6 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${user?.role === 'lecturer' ? 'bg-gradient-to-b from-orange-400 to-orange-600' : 'bg-gradient-to-b from-blue-400 to-blue-600'}`} />

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-[1.1rem] flex items-center justify-center text-xs font-black uppercase shadow-inner ${user?.role === 'lecturer' ? 'bg-orange-600 text-white' : 'bg-[#002147] text-white'}`}>
                          {(user?.name || user?.userId || "E")[0]}
                        </div>
                        <div>
                          <p className="text-[15px] font-black text-[#002147] flex items-center gap-2">
                            {user?.name || user?.userId}
                            {user?.role === 'lecturer' && (
                              <span className="p-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100 shadow-sm">
                                <CheckCircle size={10} strokeWidth={3} />
                              </span>
                            )}
                          </p>
                          <div className="flex items-center gap-2.5 mt-1.5">
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${user?.role === 'lecturer' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                              {user?.role || "Expert"}
                            </span>
                            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                            <span className="text-[9px] text-slate-400 font-bold">Just now</span>
                          </div>
                        </div>
                      </div>

                      {ansConcept && (
                        <span className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border shrink-0 ${user?.role === 'lecturer' ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                          {ansConcept}
                        </span>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="relative pt-2">
                        <div className="flex items-center gap-3 mb-4">
                          <h5 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] ml-1">Academic Response</h5>
                          <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent"></div>
                        </div>
                        <div className="group/quote relative">
                          <div className="text-sm text-slate-700 leading-[1.8] font-semibold border-l-4 border-blue-600/20 pl-6 py-2 whitespace-pre-wrap bg-slate-50/30 rounded-r-2xl min-h-[40px]">
                            {answerContent || <span className="text-slate-200 italic font-medium">Drafting response...</span>}
                          </div>
                          <MessageSquare size={40} className="absolute -top-4 -right-2 text-slate-400/5 transition-colors -scale-x-100" />
                        </div>
                      </div>

                      {(ansHints.some(h => h.trim()) || ansExamples.some(e => e.trim())) && (
                        <div className="mt-8 space-y-5 pt-6 border-t border-slate-50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-tr from-blue-600 to-blue-400 text-white rounded-xl shadow-lg shadow-blue-200 scale-90">
                              <GraduationCap size={14} />
                            </div>
                            <h5 className="text-[10px] font-black text-[#002147] uppercase tracking-widest">Expert Guidance Path</h5>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {ansHints.some(h => h.trim()) && (
                              <div className="space-y-2.5">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Incremental Hints</p>
                                <div className="space-y-2">
                                  {ansHints.filter(h => h.trim()).map((h, i) => (
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

                            {ansExamples.some(e => e.trim()) && (
                              <div className="space-y-2.5">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Example Scenarios</p>
                                <div className="space-y-2">
                                  {ansExamples.filter(e => e.trim()).map((ex, i) => (
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
                        </div>
                      )}

                      {ansResources.some(res => res.title.trim() && res.url.trim()) && (
                        <div className="pt-6 border-t border-slate-50">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Learning Resources</p>
                          <div className="flex flex-wrap gap-2">
                            {ansResources.filter(res => res.title.trim() && res.url.trim()).map((res, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2.5 px-3 py-1.5 bg-white border border-slate-200/60 rounded-xl text-[10px] font-black text-blue-600"
                              >
                                <ExternalLink size={10} />
                                {res.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Submit */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${answerContent.length > 20 ? "bg-emerald-500" : "bg-amber-400 animate-pulse"}`} />
            {ansActiveTab === 'response' ? "Required: Explanation" : ansActiveTab === 'guidance' ? "Optional: Expert Fields" : "Review carefully"}
          </div>
          <button
            type="submit"
            disabled={isPostingAnswer || isFormInvalid()}
            className="px-8 py-3 bg-gradient-to-br from-[#002147] to-[#003d7e] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] disabled:opacity-20 disabled:grayscale transition-all hover:shadow-2xl hover:shadow-blue-900/40 hover:-translate-y-1 active:scale-95 flex items-center gap-3 min-w-[200px] justify-center"
          >
            {isPostingAnswer ? (
              <div className="w-4 h-4 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Post Guidance</span>
                <Send size={14} className="opacity-70" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
