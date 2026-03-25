"use client";

import { useState } from "react";
import QuestionList from "./QuestionList";
import AskQuestionForm from "./AskQuestionForm";
import QuestionDetail from "./QuestionDetail";
import { MessageSquare, Plus, ChevronLeft } from "lucide-react";

export default function QAHub({ user }) {
    const [view, setView] = useState("list"); // list, ask, detail
    const [selectedQuestionId, setSelectedQuestionId] = useState(null);

    const renderView = () => {
        switch (view) {
            case "list":
                return (
                    <QuestionList
                        user={user}
                        onSelectQuestion={(id) => {
                            setSelectedQuestionId(id);
                            setView("detail");
                        }}
                    />
                );
            case "ask":
                return (
                    <AskQuestionForm
                        user={user}
                        onSuccess={() => setView("list")}
                        onCancel={() => setView("list")}
                    />
                );
            case "detail":
                return (
                    <QuestionDetail
                        id={selectedQuestionId}
                        user={user}
                        onBack={() => setView("list")}
                    />
                );
            default:
                return <QuestionList onSelectQuestion={(id) => { setSelectedQuestionId(id); setView("detail"); }} />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header / Sub-navigation */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-10 transition-all">
                <div className="flex items-center gap-4">
                    {view !== "list" && (
                        <button
                            onClick={() => setView("list")}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    )}
                    <h2 className="text-xl font-bold text-[#002147] flex items-center gap-2">
                        <MessageSquare className="text-[#4DA8DA]" size={22} />
                        {view === "list" ? "Consultation Hub" :
                            view === "ask" ? "New Inquiry" :
                                view === "detail" ? "Question Detail" :
                                    "Consultation Detail"}
                    </h2>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {view === "list" && (
                        <>
                            <button
                                onClick={() => setView("ask")}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-[#002147] text-white rounded-xl font-bold text-sm hover:bg-blue-900 transition-all shadow-md shadow-blue-900/10"
                            >
                                <Plus size={18} />
                                Ask Question
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="min-h-[500px]">
                {renderView()}
            </div>
        </div>
    );
}
