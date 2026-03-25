"use client";

import { useState, useEffect } from "react";
import { MessageSquare, User, Clock, CheckCircle2, Send, ChevronLeft, Speaker, ThumbsUp, Trash2, Edit2, Save, X } from "lucide-react";

export default function QuestionDetail({ id, user, onBack }) {
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [newAnswer, setNewAnswer] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ title: "", description: "" });
    const [editingAnswerId, setEditingAnswerId] = useState(null);
    const [editAnswerContent, setEditAnswerContent] = useState("");

    useEffect(() => {
        fetchQuestionDetail();
    }, [id]);

    const fetchQuestionDetail = async () => {
        try {
            setLoading(true);
            const qRes = await fetch(`/api/questions/${id}`);
            const aRes = await fetch(`/api/answers?questionId=${id}`);

            if (qRes.ok && aRes.ok) {
                const qData = await qRes.json();
                setQuestion(qData);
                setAnswers(await aRes.json());
                setEditData({ title: qData.title, description: qData.description });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSubmit = async (e) => {
        e.preventDefault();
        if (!newAnswer.trim()) return;

        try {
            setSubmitting(true);
            const res = await fetch("/api/answers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: id,
                    student: user.id,
                    content: newAnswer
                }),
            });

            if (res.ok) {
                setNewAnswer("");
                fetchQuestionDetail();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleAcceptAnswer = async (answerId) => {
        try {
            const res = await fetch(`/api/answers/${answerId}/accept`, {
                method: "PATCH"
            });
            if (res.ok) fetchQuestionDetail();
        } catch (err) {
            console.error(err);
        }
    };
    
    const handleDeleteQuestion = async () => {
        if (!confirm("Are you sure you want to delete this question? This action cannot be undone.")) return;
        try {
            const res = await fetch(`/api/questions/${id}`, { method: "DELETE" });
            if (res.ok) onBack();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateQuestion = async () => {
        try {
            setSubmitting(true);
            const res = await fetch(`/api/questions/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editData),
            });
            if (res.ok) {
                setIsEditing(false);
                fetchQuestionDetail();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAnswer = async (answerId) => {
        if (!confirm("Delete this solution?")) return;
        try {
            const res = await fetch(`/api/answers/${answerId}`, { method: "DELETE" });
            if (res.ok) fetchQuestionDetail();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateAnswer = async (answerId) => {
        try {
            const res = await fetch(`/api/answers/${answerId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: editAnswerContent }),
            });
            if (res.ok) {
                setEditingAnswerId(null);
                setEditAnswerContent("");
                fetchQuestionDetail();
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-slate-400">Loading discussion...</div>;
    if (!question) return <div className="p-20 text-center">Question not found.</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Question Header */}
            <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
                <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                            {question.module}
                        </span>
                    </div>

                    <div className="flex justify-between items-start gap-4">
                        <h1 className="text-3xl font-black text-[#002147] tracking-tight leading-tight flex-1">
                            {question.title}
                        </h1>

                        {question.student?._id === user.id && !isEditing && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                    title="Edit Question"
                                >
                                    <Edit2 size={20} />
                                </button>
                                <button
                                    onClick={handleDeleteQuestion}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                    title="Delete Question"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-slate-500 text-sm font-bold border-b border-slate-100 pb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#4DA8DA]">
                                <User size={16} />
                            </div>
                            {question.student?.email}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-slate-300" />
                            {new Date(question.createdAt).toLocaleString()}
                        </div>
                    </div>

                    {isEditing ? (
                        <div className="space-y-4 pt-4 animate-in fade-in duration-300">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Update Title</label>
                                <input
                                    type="text"
                                    value={editData.title}
                                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-[#4DA8DA] outline-none transition-all font-bold text-[#002147]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Update Description</label>
                                <textarea
                                    rows={6}
                                    value={editData.description}
                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#4DA8DA] outline-none transition-all font-medium text-[#002147] resize-none"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateQuestion}
                                    disabled={submitting}
                                    className="px-8 py-2 bg-[#002147] text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/10"
                                >
                                    <Save size={16} />
                                    {submitting ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-slate-600 leading-relaxed font-medium text-lg whitespace-pre-wrap">
                            {question.description}
                        </div>
                    )}

                    {question.isVoiceQuestion && (
                        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-purple-600 shadow-sm">
                                <Speaker size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-black text-purple-900 uppercase tracking-widest">Voice Question Attached</p>
                                <p className="text-xs text-purple-400 font-bold">Original: {question.originalLanguage}</p>
                            </div>
                            <button className="ml-auto px-6 py-2 bg-purple-600 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-purple-700 transition-all shadow-md">
                                Listen Now
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Answers Section */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-[#002147] flex items-center gap-2 ml-4">
                    <MessageSquare size={20} className="text-[#4DA8DA]" />
                    Solutions ({answers.length})
                </h3>

                {/* Answer Input */}
                <form onSubmit={handleAnswerSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm focus-within:ring-2 focus-within:ring-[#4DA8DA] transition-all">
                    <textarea
                        placeholder="Type your solution here..."
                        value={newAnswer}
                        onChange={(e) => setNewAnswer(e.target.value)}
                        className="w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:bg-white outline-none transition-all font-medium text-[#002147] resize-none"
                    />
                    <div className="flex justify-between items-center mt-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Be helpful and respectful</p>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-8 py-3 bg-[#002147] text-white rounded-xl font-black text-sm uppercase tracking-wider flex items-center gap-2 hover:bg-blue-900 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? "Posting..." : "Post Solution"}
                            <Send size={18} />
                        </button>
                    </div>
                </form>

                {/* Answers List */}
                <div className="space-y-4">
                    {answers.map((answer) => (
                        <div
                            key={answer._id}
                            className={`bg-white border p-6 rounded-3xl transition-all relative ${answer.isAccepted ? "border-emerald-200 bg-emerald-50/20" : "border-slate-200"
                                }`}
                        >
                            {answer.isAccepted && (
                                <div className="absolute -top-3 left-8 px-4 py-1.5 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-emerald-500/20">
                                    <CheckCircle2 size={12} /> Accepted Solution
                                </div>
                            )}

                            <div className="flex justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-[#002147]">
                                        {answer.student?.email?.[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#002147]">{answer.student?.email}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            {new Date(answer.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Accept Button (Only for question owner) */}
                                {!question.isResolved && question.student?._id === user.id && (
                                    <button
                                        onClick={() => handleAcceptAnswer(answer._id)}
                                        className="px-4 py-2 border border-emerald-500 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all uppercase tracking-wider"
                                    >
                                        Accept
                                    </button>
                                )}
                            </div>

                            <div className="text-slate-600 font-medium whitespace-pre-wrap ml-13">
                                {editingAnswerId === answer._id ? (
                                    <div className="space-y-3 mt-2 animate-in fade-in duration-300">
                                        <textarea
                                            rows={4}
                                            value={editAnswerContent}
                                            onChange={(e) => setEditAnswerContent(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-[#4DA8DA] outline-none transition-all font-medium text-[#002147] resize-none"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => { setEditingAnswerId(null); setEditAnswerContent(""); }}
                                                className="px-5 py-1.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleUpdateAnswer(answer._id)}
                                                className="px-6 py-1.5 bg-[#002147] text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-900 transition-all"
                                            >
                                                <Save size={14} /> Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    answer.content
                                )}
                            </div>

                            <div className="flex items-center gap-6 mt-6 ml-13 pt-4 border-t border-slate-50">
                                <button className="flex items-center gap-1.5 text-slate-400 hover:text-blue-500 transition-colors">
                                    <ThumbsUp size={16} /> <span className="text-xs font-bold">{answer.upvotes || 0}</span>
                                </button>
                                {answer.student?._id === user.id && editingAnswerId !== answer._id && (
                                    <>
                                        <button
                                            onClick={() => { setEditingAnswerId(answer._id); setEditAnswerContent(answer.content); }}
                                            className="flex items-center gap-1.5 text-slate-400 hover:text-blue-500 transition-colors"
                                        >
                                            <Edit2 size={16} /> <span className="text-xs font-bold uppercase tracking-widest">Edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAnswer(answer._id)}
                                            className="flex items-center gap-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                                        >
                                            <Trash2 size={16} /> <span className="text-xs font-bold uppercase tracking-widest">Delete</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}

                    {answers.length === 0 && (
                        <div className="py-20 text-center bg-slate-50/50 border border-slate-100 rounded-3xl border-dashed">
                            <p className="text-slate-400 font-bold">No solutions yet. Be the first to help!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
