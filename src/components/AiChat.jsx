"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, AlertCircle, Loader2, Trash2, Sparkles, BookOpen, Lock } from "lucide-react";

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

            if (!res.ok) {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "system",
                        content: data.message || "Something went wrong. Please try again.",
                    },
                ]);
                return;
            }

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
        <div className="flex flex-col h-full bg-white overflow-hidden shadow-2xl">
            {/* Header / Module Indicator */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#002147] to-indigo-900 flex items-center justify-between shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-[#FF9F1C] opacity-5 pointer-events-none"></div>
                <div className="flex items-center gap-3.5 relative z-10">
                    <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                        <Bot className="w-4 h-4 text-[#FF9F1C]" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-widest leading-tight">AI Assistant</h4>
                        <p className="text-[9px] text-blue-200 font-bold uppercase tracking-tight">
                            {selectedModule ? `Module: ${selectedModule.moduleCode}` : "Select Module"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5 relative z-10">
                    <button 
                        onClick={handleClearChat}
                        disabled={messages.length === 0}
                        title="Reset Conversation"
                        className="p-2.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-all active:scale-90 disabled:opacity-0 disabled:pointer-events-none group"
                    >
                        <Trash2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">System Ready</span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 bg-slate-50/20 scrollbar-hide">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-sm mx-auto animate-in fade-in zoom-in-95 duration-1000">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-[#002147] to-indigo-900 flex items-center justify-center text-[#FF9F1C] shadow-xl rotate-3">
                               <Bot className="w-8 h-8" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-[#FF9F1C] flex items-center justify-center text-white shadow-lg -rotate-12">
                                <Sparkles className="w-4 h-4 fill-current" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <h5 className="text-lg font-black text-[#002147] tracking-tight">How can I assist?</h5>
                            <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                                I'm your dedicated AI tutor. <br /> Select a module to begin.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 w-full pt-4">
                            {['Summarize Notes', 'Explain Concept', 'Practice Quiz', 'Resource Search'].map((hint) => (
                                <div key={hint} className="px-4 py-2 bg-white border border-blue-50 rounded-xl text-[10px] font-bold text-blue-900/60 uppercase tracking-widest shadow-sm">
                                    {hint}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex gap-3 ${msg.role === "student" ? "flex-row-reverse" : "flex-row"} animate-in slide-in-from-bottom-2 duration-300`}
                    >
                        <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center shadow-md transform transition-transform hover:scale-105 ${
                            msg.role === "student" 
                                ? "bg-gradient-to-br from-[#FF9F1C] to-orange-600 rotate-3" 
                                : "bg-gradient-to-br from-[#002147] to-indigo-900 -rotate-3"
                        }`}>
                            {msg.role === "student" ? (
                                <User className="w-4 h-4 text-white" />
                            ) : (
                                <Bot className="w-4 h-4 text-[#FF9F1C]" />
                            )}
                        </div>

                        <div
                            className={`max-w-[85%] lg:max-w-[80%] p-4 rounded-3xl shadow-sm transform transition-all relative group ${msg.role === "student"
                                ? "bg-white text-[#002147] rounded-tr-none border-2 border-[#FF9F1C]/10 shadow-orange-500/5"
                                : msg.role === "system"
                                    ? "bg-amber-50 text-amber-900 border border-amber-200 text-center w-full mx-8 rounded-2xl font-bold text-[11px] select-none cursor-not-allowed"
                                    : "bg-white text-[#002147] border-2 border-blue-50 rounded-tl-none font-medium text-[13px] leading-relaxed shadow-blue-500/5 select-none cursor-not-allowed"
                                }`}
                            onContextMenu={(e) => msg.role !== "student" && e.preventDefault()}
                            title={msg.role !== "student" ? "Copying Restricted for Integrity" : ""}
                        >
                            {msg.role !== "student" && msg.role !== "system" && (
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <div className="bg-slate-100 p-1 rounded-lg">
                                        <Lock size={10} className="text-slate-400" />
                                    </div>
                                </div>
                            )}
                            <div className="whitespace-pre-wrap">
                                {msg.content}
                            </div>
                            
                            {msg.role === "assistant" && msg.citations && msg.citations.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                                    <span className="w-full text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">Sources & References:</span>
                                    {msg.citations.map((c, ci) => (
                                        <div key={ci} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-[10px] font-bold text-blue-700 border border-blue-100 hover:bg-blue-100 transition-colors cursor-default">
                                            <BookOpen className="w-3 h-3" />
                                            {c.title.length > 20 ? c.title.substring(0, 20) + '...' : c.title}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start gap-3">
                        <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-gradient-to-br from-[#002147] to-indigo-900 -rotate-3 animate-pulse shadow-md">
                            <Bot className="w-4 h-4 text-[#FF9F1C]" />
                        </div>
                        <div className="bg-white p-4 rounded-3xl rounded-tl-none border-2 border-blue-50 shadow-sm flex items-center gap-3">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-bounce"></span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Action Area */}
            <div className="p-6 lg:p-8 bg-white border-t border-blue-50 relative z-10">
                <form
                    onSubmit={handleSend}
                    className="relative group max-w-4xl mx-auto"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#FF9F1C] to-orange-400 rounded-2xl blur opacity-5 group-focus-within:opacity-10 transition duration-1000"></div>
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={selectedModule ? `Ask anything about ${selectedModule.moduleCode}...` : "Select a module"}
                            className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl pl-6 pr-16 py-3.5 text-sm font-semibold text-[#002147] placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-[#FF9F1C]/40 focus:bg-white transition-all shadow-inner"
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim() || !selectedModule}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#FF9F1C] to-orange-600 disabled:from-slate-200 disabled:to-slate-300 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all shadow-lg active:scale-95 group"
                        >
                            <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </div>
                </form>
                <div className="flex items-center justify-center gap-6 mt-6">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Module Context Active</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">End-to-End Encrypted</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiChat;
