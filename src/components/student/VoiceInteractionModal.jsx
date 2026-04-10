"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  X,
  Languages,
  Play,
  Square,
  Bot,
  Volume2,
  VolumeX,
  Globe,
  CornerUpRight,
  Loader2,
  Zap
} from "lucide-react";

const LOCALES = [
  { id: "en-US", name: "English", flag: "🇺🇸", short: "en" },
  { id: "si-LK", name: "Sinhala", flag: "🇱🇰", short: "si" },
  { id: "ta-LK", name: "Tamil", flag: "🇮🇳", short: "ta" },
];

export default function VoiceInteractionHub({ isOpen, onClose, selectedModule, user, onDraftQuestion }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [targetLocale, setTargetLocale] = useState(LOCALES[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hubResult, setHubResult] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = targetLocale.id;

        recognitionRef.current.onresult = (e) => {
          let fullTranscript = "";
          for (let i = 0; i < e.results.length; i++) {
            fullTranscript += e.results[i][0].transcript;
          }
          setTranscript(fullTranscript);
        };
        recognitionRef.current.onend = () => {
          if (isRecording) {
            // If it stopped but we think we're still recording, restart
            try { recognitionRef.current.start(); } catch(e) {}
          }
        };
      }
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      recognitionRef.current?.stop();
      synthRef.current?.cancel();
    };
  }, [targetLocale]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      if (transcript) handleHubProcess(transcript);
    } else {
      setTranscript("");
      setHubResult(null);
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleHubProcess = async (text) => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/ai/voice-process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: text,
          moduleId: selectedModule?._id,
          userId: user?.id,
          targetLocale: targetLocale.id
        })
      });
      const data = await res.json();
      setHubResult(data);
      // Auto-speak if target locale matches
      if (data.targetText) speakText(data.targetText);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = (text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLocale.id;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-lg animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border border-white/20">

        {/* Hub Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Bot className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">Interaction Hub</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Intelligent Academic Concierge</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-200 text-slate-400 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">

          {/* Language Preference */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Language</label>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
              {LOCALES.map(loc => (
                <button
                  key={loc.id}
                  onClick={() => setTargetLocale(loc)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase transition-all ${targetLocale.id === loc.id ? "bg-white text-blue-600 shadow-md scale-100" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <span>{loc.flag}</span>
                  <span>{loc.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interaction Zone */}
          <div className="relative pt-10">
            <div className={`min-h-[160px] p-8 rounded-[2.5rem] border-2 border-dashed flex items-center justify-center text-center transition-all ${isRecording ? "border-blue-400 bg-blue-50/50" : "border-slate-100 bg-slate-50"}`}>
              {isProcessing ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  <p className="text-sm font-bold text-blue-600">Syncing with AI Knowledge Base...</p>
                </div>
              ) : (
                <p className={`text-lg font-bold ${transcript ? "text-slate-700" : "text-slate-300"}`}>
                  {transcript || "Tap the mic and ask your question..."}
                </p>
              )}
            </div>

            {/* Micro-Interaction Button */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
              <button
                onClick={toggleRecording}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl ${isRecording ? "bg-red-500 scale-110" : "bg-blue-600 hover:scale-105"}`}
              >
                {isRecording ? <MicOff className="text-white" /> : <Mic className="text-white" />}
                {isRecording && <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />}
              </button>
            </div>
          </div>

          {/* Dual Text Display (Results) */}
          {hubResult && (
            <div className="mt-12 space-y-6 animate-in slide-in-from-bottom-5 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Source View */}
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Student Ingest</span>
                  <p className="text-xs font-bold text-slate-600 italic">"{hubResult.sourceText}"</p>
                </div>
                {/* Metadata View */}
                <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest block">LLM Processing</span>
                    <p className="text-[10px] font-bold text-blue-600">English Synthesis Complete</p>
                  </div>
                  <Zap className="text-blue-500 fill-blue-500/20" size={20} />
                </div>
              </div>

              {/* Question Translation Area */}
              {hubResult.detectedLang !== 'en' && hubResult.translatedQuestion && (
                <div className="p-6 bg-amber-50/80 rounded-[2rem] border border-amber-100/50 space-y-3 animate-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center">
                      <Languages size={12} className="text-white" />
                    </div>
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Formal English Translation</span>
                  </div>
                  <p className="text-sm font-bold text-amber-900 leading-relaxed italic">
                    "{hubResult.translatedQuestion}"
                  </p>
                  <p className="text-[9px] font-bold text-amber-500 uppercase tracking-tight">This version will be used for the official submission.</p>
                </div>
              )}

              {/* Target Response Area */}
              <div className="bg-[#002147] text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                      <Globe size={18} className="text-blue-400" />
                      Localized AI Insight
                    </h3>
                    <button
                      onClick={() => isSpeaking ? synthRef.current?.cancel() : speakText(hubResult.targetText)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isSpeaking ? "bg-white text-blue-900 animate-pulse" : "bg-white/10 hover:bg-white/20 border border-white/10"}`}
                    >
                      {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                  </div>
                  <p className="text-sm leading-relaxed text-blue-50/90 font-medium italic decoration-blue-500/30">
                    {hubResult.targetText}
                  </p>
                  <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                    <button
                      onClick={() => onDraftQuestion?.({ 
                        title: hubResult.translatedQuestion || hubResult.sourceText, 
                        description: hubResult.translatedQuestion || hubResult.sourceText,
                        originalTranscript: hubResult.sourceText,
                        language: hubResult.detectedLang,
                        translations: {
                          "en-US": hubResult.translatedQuestion || hubResult.sourceText
                        }
                      })}
                      className="flex items-center gap-2 text-[11px] font-black uppercase text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <CornerUpRight size={14} /> Send to Submission Form
                    </button>
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Locale: {targetLocale.id}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Brand Footer */}
        <div className="p-6 border-t border-slate-50 bg-slate-50/30 flex justify-center">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] italic">ASKmate Intelligent Hub • Powered by Gemini Flash</p>
        </div>
      </div>
    </div>
  );
}
