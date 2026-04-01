"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, AlertCircle, Loader2, Trash2, Sparkles } from "lucide-react";

const AiChat = ({ selectedModule, onCitationsFound }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [chatId, setChatId] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const chatEndRef = useRef(null);

    // Persist chat history
    useEffect(() => {
        const savedMessages = localStorage.getItem("ai_chat_messages");
        const savedChatId = localStorage.getItem("ai_chat_id");

        if (savedMessages) {
            try {
                const parsed = JSON.parse(savedMessages);
                setMessages(parsed);

                // Re-trigger citations for the latest assistant message if present
                const lastAssistantMsg = [...parsed]
                    .reverse()
                    .find((m) => m.role === "assistant" && m.citations?.length > 0);
                
                if (lastAssistantMsg && onCitationsFound) {
                    onCitationsFound(lastAssistantMsg.citations);
                }
            } catch (err) {
                console.error("Failed to parse saved chat messages:", err);
            }
        }

        if (savedChatId) {
            setChatId(savedChatId);
        }
        setIsLoaded(true);
    }, [onCitationsFound]);

    useEffect(() => {
        if (!isLoaded) return;

        if (messages.length > 0) {
            localStorage.setItem("ai_chat_messages", JSON.stringify(messages));
        } else {
            localStorage.removeItem("ai_chat_messages");
        }

        if (chatId) {
            localStorage.setItem("ai_chat_id", chatId);
        } else {
            localStorage.removeItem("ai_chat_id");
        }
    }, [messages, chatId, isLoaded]);

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

    const handleClearChat = () => {
        if (messages.length === 0) return;
        if (window.confirm("Are you sure you want to clear this chat session?")) {
            setMessages([]);
            setChatId(null);
            localStorage.removeItem("ai_chat_messages");
            localStorage.removeItem("ai_chat_id");
            if (onCitationsFound) onCitationsFound([]);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white relative overflow-hidden">
            {/* Header / Module Indicator */}
            <div className="px-8 py-5 bg-white border-b border-slate-100 flex items-center justify-between z-10 shadow-sm shadow-slate-100/50">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#002147] flex items-center justify-center shadow-lg shadow-blue-900/10">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-[#002147] uppercase tracking-widest">ASKmate <span className="text-[#4DA8DA]">Assistant</span></h4>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                               {selectedModule ? `Active Context: ${selectedModule.moduleCode}` : "Waiting for module selection..."}
                           </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleClearChat}
                        disabled={messages.length === 0}
                        className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-95 disabled:opacity-0"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Reset</span>
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30 scrollbar-hide">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-5 max-w-sm mx-auto">
                        <div className="w-20 h-20 rounded-[2.5rem] bg-white shadow-2xl shadow-blue-900/5 flex items-center justify-center text-blue-100 border border-slate-50">
                           <Sparkles className="w-10 h-10 text-[#4DA8DA]" />
                        </div>
                        <div className="space-y-2">
                            <h5 className="text-lg font-black text-[#002147]">Start your session</h5>
                            <p className="text-xs text-slate-400 font-bold leading-relaxed uppercase tracking-wide">
                                Select a module from the left to unlock specialized academic guidance.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <div className="px-4 py-2 bg-white rounded-xl border border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Hint Mode</div>
                            <div className="px-4 py-2 bg-white rounded-xl border border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Concept Analysis</div>
                        </div>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex gap-4 ${msg.role === "student" ? "flex-row-reverse" : "flex-row"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                        <div className={`w-9 h-9 rounded-2xl shrink-0 flex items-center justify-center shadow-md ${
                            msg.role === "student" ? "bg-[#FF9F1C]" : "bg-[#002147]"
                        }`}>
                            {msg.role === "student" ? (
                                <User className="w-5 h-5 text-white" />
                            ) : (
                                <Bot className="w-5 h-5 text-white" />
                            )}
                        </div>

                        <div className={`flex flex-col gap-2 max-w-[82%] ${msg.role === "student" ? "items-end" : "items-start"}`}>
                            <div
                                className={`p-5 rounded-[2rem] shadow-sm ${msg.role === "student"
                                    ? "bg-gradient-to-br from-[#002147] to-[#003366] text-white rounded-tr-none shadow-blue-900/10"
                                    : msg.role === "system"
                                        ? "bg-amber-50 text-amber-900 border border-amber-200 text-center w-full shadow-none italic font-bold text-[11px] uppercase tracking-widest"
                                        : "bg-white text-[#002147] border border-slate-100 rounded-tl-none font-medium shadow-xl shadow-slate-200/20"
                                    }`}
                            >
                                <div className="text-[14px] whitespace-pre-wrap leading-relaxed">
                                    {msg.content}
                                </div>
                                
                                {msg.role === "assistant" && msg.citations && msg.citations.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-slate-50 flex flex-wrap gap-2">
                                        <p className="w-full text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                           <div className="w-1.5 h-1.5 rounded-full bg-[#FF9F1C]" />
                                           Sourced from Knowledge Base
                                        </p>
                                        {msg.citations.map((c, ci) => (
                                            <div key={ci} className="inline-flex items-center px-3 py-1 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black text-[#4DA8DA] uppercase tracking-tighter hover:bg-blue-50 transition-colors cursor-default">
                                                {c.title}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 opacity-60">
                                {msg.role === "student" ? "Your Inquiry" : "AI Intelligence"} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start gap-4 animate-pulse">
                        <div className="w-9 h-9 rounded-2xl shrink-0 flex items-center justify-center bg-[#002147]">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-white p-5 rounded-[2rem] rounded-tl-none border border-slate-100 shadow-sm">
                            <Loader2 className="w-4 h-4 text-[#4DA8DA] animate-spin" />
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Action Area */}
            <div className="p-8 bg-white border-t border-slate-100 shadow-[0_-4px_20px_-10px_rgba(0,33,71,0.05)]">
                <form
                    onSubmit={handleSend}
                    className="max-w-3xl mx-auto relative"
                >
                    <div className="relative group">
                        <textarea
                            rows={1}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                            placeholder={selectedModule ? `Message about ${selectedModule.moduleCode}...` : "Please select a context from the sidebar"}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-6 pr-16 py-4 text-sm font-bold text-[#002147] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-[#4DA8DA] transition-all shadow-inner resize-none overflow-hidden"
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim() || !selectedModule}
                            className={`absolute right-2 top-2 p-3 rounded-xl transition-all shadow-xl shadow-blue-900/10 active:scale-95 ${
                                !input.trim() || !selectedModule 
                                ? 'bg-slate-100 text-slate-300' 
                                : 'bg-[#002147] text-white hover:bg-slate-800'
                            }`}
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </div>
                    <div className="flex items-center justify-between mt-4 px-2">
                        <div className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-slate-300" />
                            Use Shift+Enter for new line
                        </div>
                        <p className="text-[9px] text-slate-300 font-extrabold uppercase tracking-widest">
                            ASKmate Intelligence v1.0
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AiChat;
