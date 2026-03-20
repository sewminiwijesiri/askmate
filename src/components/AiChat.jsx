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
        <div className="flex flex-col h-[600px] bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                        <Bot className="w-12 h-12 opacity-20" />
                        <p className="text-sm">Ask me anything about your module resources!</p>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === "student" ? "justify-end" : "justify-start"
                            }`}
                    >
                        <div
                            className={`max-w-[80%] p-4 rounded-2xl ${msg.role === "student"
                                ? "bg-cyan-600/60 text-white rounded-tr-none"
                                : msg.role === "system"
                                    ? "bg-amber-500/20 text-amber-200 border border-amber-500/30 text-center w-full"
                                    : "bg-white/10 text-gray-100 border border-white/10 rounded-tl-none"
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                {msg.role === "student" ? (
                                    <User className="w-3 h-3 text-cyan-200" />
                                ) : msg.role === "assistant" ? (
                                    <Bot className="w-3 h-3 text-purple-300" />
                                ) : (
                                    <AlertCircle className="w-3 h-3 text-amber-300" />
                                )}
                                <span className="text-[10px] uppercase tracking-wider opacity-60">
                                    {msg.role === "student" ? "You" : msg.role === "assistant" ? "Assistant" : "System"}
                                </span>
                            </div>
                            <div className="text-sm whitespace-pre-wrap leading-relaxed">
                                {msg.content}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none border border-white/10">
                            <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form
                onSubmit={handleSend}
                className="p-4 bg-white/5 border-t border-white/10 flex gap-2"
            >
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={selectedModule ? `Ask about ${selectedModule.moduleCode}...` : "Ask a question..."}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 text-white p-2 rounded-xl transition-colors"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};

export default AiChat;
