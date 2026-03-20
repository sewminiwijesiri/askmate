"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const RobotIcon = () => (
    <svg viewBox="0 0 100 100" className="w-24 h-24 transition-transform group-hover:scale-110 drop-shadow-2xl">
        {/* Bobbing Animation - controlled by CSS class */}
        <g className="animate-robot-bob">
            {/* Robot Shadow */}
            <ellipse cx="50" cy="85" rx="20" ry="5" fill="black" opacity="0.1" />

            {/* Body */}
            <path d="M35 55 C35 45, 65 45, 65 55 L65 75 C65 85, 35 85, 35 75 Z" fill="white" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="35" y="62" width="30" height="8" fill="#3b82f6" opacity="0.8" /> {/* Blue decorative band */}

            {/* Head */}
            <path d="M32 42 C32 30, 68 30, 68 42 L68 52 C68 58, 32 58, 32 52 Z" fill="white" stroke="#e2e8f0" strokeWidth="1" />

            {/* Face Screen */}
            <rect x="38" y="38" width="24" height="14" rx="4" fill="#1a1a1a" />

            {/* Eyes */}
            <path d="M43 45 C43 43, 47 43, 47 45" stroke="#22d3ee" strokeWidth="1.5" fill="none" strokeLinecap="round" className="animate-pulse" />
            <path d="M53 45 C53 43, 57 43, 57 45" stroke="#22d3ee" strokeWidth="1.5" fill="none" strokeLinecap="round" className="animate-pulse" />

            {/* Headphones */}
            <path d="M30 45 C30 25, 70 25, 70 45" fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
            <circle cx="28" cy="45" r="5" fill="#3b82f6" />
            <circle cx="72" cy="45" r="5" fill="#3b82f6" />

            {/* Arm holding bulb */}
            <path d="M65 65 L75 55" stroke="#333" strokeWidth="3" strokeLinecap="round" />

            {/* Lightbulb */}
            <g className="animate-bulb-glow">
                <circle cx="78" cy="50" r="6" fill="#fde047" className="blur-[1px]" />
                <path d="M78 56 L78 60" stroke="#94a3b8" strokeWidth="3" />
                <circle cx="78" cy="50" r="10" fill="#fde047" opacity="0.3" className="animate-ping" />
            </g>
        </g>

        <style jsx>{`
      @keyframes robot-bob {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }
      @keyframes bulb-glow {
        0%, 100% { opacity: 0.8; filter: drop-shadow(0 0 5px #fde047); }
        50% { opacity: 1; filter: drop-shadow(0 0 15px #fde047); }
      }
      .animate-robot-bob {
        animation: robot-bob 3s ease-in-out infinite;
      }
      .animate-bulb-glow {
        animation: bulb-glow 2s ease-in-out infinite;
      }
    `}</style>
    </svg>
);

const AiFloatingButton = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            setIsLoggedIn(!!token);
        };

        checkAuth();
        window.addEventListener("storage", checkAuth);
        window.addEventListener("loginStateChange", checkAuth);

        return () => {
            window.removeEventListener("storage", checkAuth);
            window.removeEventListener("loginStateChange", checkAuth);
        };
    }, []);

    // Only show if logged in AND on the student dashboard
    if (!isLoggedIn || pathname !== "/dashboard") return null;

    return (
        <Link
            href="/student/assistant"
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center transition-all group active:scale-95"
            title="AI Student Assistant"
        >
            <div className="relative flex items-center justify-center">
                {/* 1. Permanent Pulsing Aura (Highly visible) */}
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 to-purple-500 blur-3xl rounded-full scale-150 opacity-20 animate-pulse duration-[3000ms] group-hover:opacity-40 transition-opacity" />

                {/* 2. Rotating Glowing Ring */}
                <div className="absolute w-28 h-28 rounded-full border border-cyan-400/30 border-t-cyan-400/80 animate-spin duration-[4000ms] group-hover:border-cyan-400" />

                {/* 3. Outer Beacon Pulse (Ring expanding out) */}
                <div className="absolute inset-0 rounded-full border-2 border-cyan-400/50 animate-beacon group-hover:hidden" />

                <div className="relative z-10">
                    <RobotIcon />
                </div>

                {/* 4. Prompt Badge (Visible by default, highlighted on hover) */}
                <div className="absolute -top-1 right-0 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg border border-white/20 animate-bounce group-hover:animate-none">
                    ASK AI
                </div>

                <span className="absolute -top-14 right-6 bg-black/80 backdrop-blur-md text-white text-[11px] font-bold px-4 py-2 rounded-2xl border border-white/20 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 whitespace-nowrap shadow-2xl">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        Hi! I'm your AI Tutor
                    </div>
                </span>

                <style jsx>{`
                    @keyframes beacon {
                        0% { transform: scale(1); opacity: 0.8; }
                        100% { transform: scale(1.8); opacity: 0; }
                    }
                    .animate-beacon {
                        animation: beacon 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                    }
                `}</style>
            </div>
        </Link>
    );
};

export default AiFloatingButton;
