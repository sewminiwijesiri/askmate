"use client";

import React from 'react';
import {
    X, Send, BookOpen, Clock, CheckCircle, Zap, AlignLeft, HelpCircle, Tag, Eye, ExternalLink, MessageSquare, Plus, ArrowRight
} from 'lucide-react';
import GuidanceForm from './GuidanceForm';

export default function ExpertDetailView({
    selectedQuestion,
    user,
    qaLanguage,
    setQaLanguage,
    closeQuestion,
    timeSince,
    answers,
    expertAnswers,
    communityAnswers,
    allResources,
    ansViewerTab,
    setAnsViewerTab,
    fetchAnswers,
    setSelectedQuestion,
    setViewingProfileId
}) {
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl h-[85vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/20">

                {/* MODAL HEADER */}
                <div className="h-[80px] px-8 border-b border-slate-100 bg-white flex-none flex items-center justify-between w-full z-10 relative">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex flex-none items-center justify-center text-blue-600 shadow-inner">
                            <BookOpen size={20} />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xl font-black text-[#002147] truncate">
                                {qaLanguage === "english" ? selectedQuestion.title : (selectedQuestion.translatedVersions?.[qaLanguage] || selectedQuestion.title)}
                            </h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedQuestion.module} • Academic Segment</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={closeQuestion} className="w-10 h-10 flex-none flex items-center justify-center bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-90">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-auto overflow-y-auto custom-scrollbar flex flex-col bg-slate-50/50 w-full relative">
                    {/* TOP: Question Details */}
                    <div className="w-full p-8 sm:p-10 space-y-8 bg-slate-50/50 border-b border-slate-100 shrink-0">
                        <div className="flex items-center justify-between p-5 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-[#002147] text-white flex items-center justify-center font-black text-sm">
                                    {(selectedQuestion.student?.name || selectedQuestion.student?.studentId || "S")[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Inquirer</p>
                                    <button
                                        onClick={() => setViewingProfileId(selectedQuestion.student?._id || selectedQuestion.student?.studentId)}
                                        className="text-sm font-bold text-[#002147] hover:text-blue-600 hover:underline"
                                    >
                                        {selectedQuestion.student?.name || selectedQuestion.student?.studentId || "Student"}
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                {selectedQuestion.urgencyLevel === "Urgent" && (
                                    <span className="px-2 py-0.5 bg-red-50 text-red-500 rounded-lg text-[8px] font-black uppercase border border-red-100 flex items-center gap-1">
                                        <Zap size={10} className="fill-red-500" /> Urgent
                                    </span>
                                )}
                                <span className="text-[10px] font-bold text-slate-400">{timeSince(selectedQuestion.createdAt)}</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <AlignLeft size={80} />
                                </div>
                                <h4 className="text-[11px] font-black text-[#002147] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    Contextual Inquiry
                                </h4>
                                <p className="text-slate-600 leading-relaxed font-semibold text-[15px] whitespace-pre-wrap relative z-10">
                                    {qaLanguage === "english" ? selectedQuestion.description : (selectedQuestion.translatedVersions?.[`${qaLanguage}Description`] || selectedQuestion.description)}
                                </p>
                            </div>

                            {selectedQuestion.whatIveTried && (
                                <div className="p-6 bg-orange-50/50 rounded-[2.5rem] border border-orange-100/50">
                                    <h4 className="text-[11px] font-black text-orange-600 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                        <HelpCircle size={14} /> Stuck Point
                                    </h4>
                                    <p className="text-xs text-slate-600 italic leading-relaxed font-medium bg-white/50 p-4 rounded-2xl border border-orange-100/30">
                                        "{qaLanguage === "english" ? selectedQuestion.whatIveTried : (selectedQuestion.translatedVersions?.[`${qaLanguage}Stuck`] || selectedQuestion.whatIveTried)}"
                                    </p>
                                </div>
                            )}

                            <div className="flex flex-wrap items-center gap-4">
                                {selectedQuestion.topic && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200/60 rounded-xl shadow-sm">
                                        <Tag size={12} className="text-blue-500" />
                                        <span className="text-[10px] font-black text-[#002147] uppercase tracking-widest">{selectedQuestion.topic}</span>
                                    </div>
                                )}
                                <span className="flex items-center gap-1 text-[11px] text-slate-400 font-bold"><Eye size={12} /> {selectedQuestion.views || 0} views</span>
                            </div>
                        </div>
                    </div>


                    {/* BOTTOM: Guidance Studio */}
                    <div className="w-full bg-white relative shrink-0 pt-6 sm:pt-8">
                        <GuidanceForm
                            selectedQuestion={selectedQuestion}
                            user={user}
                            onSuccess={() => {
                                fetchAnswers(selectedQuestion._id);
                                setSelectedQuestion((q) => ({ ...q, answersCount: (q.answersCount || 0) + 1 }));
                            }}
                            timeSince={timeSince}
                            answers={answers}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
