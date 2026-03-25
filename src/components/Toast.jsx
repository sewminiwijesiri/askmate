"use client";

import { useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

export default function Toast({ message, type = "success", onClose, duration = 4000 }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  const config = {
    success: {
      icon: <CheckCircle2 size={18} className="text-emerald-500" />,
      bg: "bg-emerald-50/90",
      border: "border-emerald-100",
      text: "text-emerald-900",
      accent: "bg-emerald-500"
    },
    error: {
      icon: <AlertCircle size={18} className="text-rose-500" />,
      bg: "bg-rose-50/90",
      border: "border-rose-100",
      text: "text-rose-900",
      accent: "bg-rose-500"
    },
    warning: {
      icon: <AlertTriangle size={18} className="text-amber-500" />,
      bg: "bg-amber-50/90",
      border: "border-amber-100",
      text: "text-amber-900",
      accent: "bg-amber-500"
    },
    info: {
      icon: <Info size={18} className="text-blue-500" />,
      bg: "bg-blue-50/90",
      border: "border-blue-100",
      text: "text-blue-900",
      accent: "bg-blue-500"
    }
  };

  const style = config[type] || config.info;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-[slide-up_0.3s_ease-out]">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${style.bg} ${style.border} shadow-2xl shadow-black/5 backdrop-blur-md min-w-[320px] max-w-[450px]`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-xl bg-white/80 flex items-center justify-center shadow-sm`}>
          {style.icon}
        </div>
        
        <div className="flex-1 mr-2 text-left">
          <p className={`text-[13px] font-bold leading-tight ${style.text}`}>
            {message}
          </p>
        </div>

        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-black/5 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
        >
          <X size={14} />
        </button>

        {/* Progress Bar Container */}
        <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-2xl">
           <div 
             className={`h-full ${style.accent} transition-all duration-100 ease-linear`}
             style={{ 
               width: '100%',
               animationName: 'shrink',
               animationDuration: `${duration}ms`,
               animationTimingFunction: 'linear',
               animationFillMode: 'forwards'
             }}
           />
        </div>
      </div>
    </div>
  );
}
