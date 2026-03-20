"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, AlertCircle, Loader2 } from "lucide-react";

const AiChat = ({ selectedModule, onCitationsFound }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [chatId, setChatId] = useState(null);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: "student", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setLoading(true);
        setInput("");

        try {
            const token = localStorage.getItem("token"); // Assuming token is stored here
            const res = await fetch("/api/ai/ask", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    question: input,
                    selectedModuleId: selectedModule?._id || null,
                    chatId: chatId,
                }),
            });

            const data = await res.json();

            if (data.needsModule) {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "system",
                        content: "Please select a specific module from the sidebar to get better answers!",
                    },
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: data.answer, citations: data.citations },
                ]);
                setChatId(data.chatId);
                if (data.citations) {
                    onCitationsFound(data.citations);
                }
            }
        } catch (error) {
            console.error("AI Chat Error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "system", content: "Sorry, I'm having trouble connecting. Please try again later." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm shadow-slate-200/50">
            {/* Header / Module Indicator */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#002147] flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-[#002147] uppercase tracking-widest">Assistant</h4>
                        <p className="text-[10px] text-slate-500 font-bold">
                            {selectedModule ? `Active: ${selectedModule.moduleCode}` : "Select a module to begin"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Online</span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white scrollbar-hide">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-xs mx-auto">
                        <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300">
                           <Bot className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                            <h5 className="text-sm font-bold text-[#002147]">How can I help you today?</h5>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                Choose a module from the sidebar and ask me anything about its content.
                            </p>
                        </div>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex gap-3 ${msg.role === "student" ? "flex-row-reverse" : "flex-row"}`}
                    >
                        <div className={`w-8 h-8 rounded-2xl shrink-0 flex items-center justify-center ${
                            msg.role === "student" ? "bg-orange-500" : "bg-[#002147]"
                        }`}>
                            {msg.role === "student" ? (
                                <User className="w-4 h-4 text-white" />
                            ) : (
                                <Bot className="w-4 h-4 text-white" />
                            )}
                        </div>

                        <div
                            className={`max-w-[85%] p-4 rounded-3xl shadow-sm ${msg.role === "student"
                                ? "bg-orange-50 text-orange-950 rounded-tr-none border border-orange-100"
                                : msg.role === "system"
                                    ? "bg-amber-50 text-amber-900 border border-amber-200 text-center w-full mx-8"
                                    : "bg-slate-50 text-[#002147] border border-slate-100 rounded-tl-none font-medium text-[13px]"
                                }`}
                        >
                            <div className="text-sm whitespace-pre-wrap leading-relaxed">
                                {msg.content}
                            </div>
                            
                            {msg.role === "assistant" && msg.citations && msg.citations.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-wrap gap-2">
                                    {msg.citations.map((c, ci) => (
                                        <span key={ci} className="inline-flex items-center px-2 py-0.5 rounded bg-white border border-slate-200 text-[9px] font-bold text-slate-500">
                                            Ref: {c.title.split(' ')[0]}...
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start gap-3">
                        <div className="w-8 h-8 rounded-2xl shrink-0 flex items-center justify-center bg-[#002147] animate-pulse">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-slate-50 p-4 rounded-3xl rounded-tl-none border border-slate-100">
                            <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Action Area */}
            <form
                onSubmit={handleSend}
                className="p-6 bg-slate-50 border-t border-slate-200"
            >
                <div className="relative group">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={selectedModule ? `Ask about ${selectedModule.moduleCode}...` : "Welcome! Please select a module."}
                        className="w-full bg-white border border-slate-200 rounded-2xl pl-5 pr-14 py-3.5 text-sm font-semibold text-[#002147] placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all shadow-sm"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim() || !selectedModule}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-center text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-tighter">
                    Always cross-check information with your lecture notes
                </p>
            </form>
        </div>
    );
};

export default AiChat;
