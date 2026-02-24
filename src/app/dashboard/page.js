"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for token
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Get user data from local storage if available
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 p-10 border border-slate-100 relative overflow-hidden">
          {/* Decorative background blur */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-50 rounded-full blur-3xl opacity-60"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-10">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#002147] to-[#003d82] flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-900/20">
                {user.userId?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-black text-[#002147] mb-1">
                  Welcome, <span className="text-[#4DA8DA]">{user.userId}</span>
                </h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Active {user.role} Account
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200/60 mb-8">
              <h2 className="text-lg font-black text-[#002147] mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#FF9F1C] rounded-full"></span>
                Account Credentials
              </h2>
              
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-slate-200/50">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
                  <span className="text-[#002147] font-extrabold">{user.email}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-slate-200/50">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Access Role</span>
                  <span className="capitalize px-4 py-1.5 bg-blue-100 text-[#002147] rounded-full text-xs font-black shadow-sm border border-blue-200/50">
                    {user.role}
                  </span>
                </div>

                {user.role === 'student' && (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-slate-200/50">
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Academic Year</span>
                      <span className="text-[#002147] font-extrabold">{user.year || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3">
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Semester</span>
                      <span className="text-[#002147] font-extrabold">{user.semester || 'N/A'}</span>
                    </div>
                  </>
                )}
              </div>

              {user.role === 'admin' && (
                <div className="mt-8 p-6 bg-orange-50 rounded-2xl border border-orange-100 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-orange-800 font-black text-sm uppercase tracking-tight mb-1">Administrative Access</h3>
                    <p className="text-orange-600/80 text-xs font-bold leading-relaxed">Secure panel for platform management is ready.</p>
                  </div>
                  <button 
                    onClick={() => router.push("/admin/dashboard")}
                    className="flex-shrink-0 px-5 py-2.5 bg-[#FF9F1C] hover:bg-orange-600 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                  >
                    Control Panel
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <button 
                onClick={() => router.push("/")}
                className="text-slate-400 hover:text-[#002147] font-black text-sm transition-colors flex items-center gap-2 group"
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Home
              </button>
              
              <button 
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  router.push("/login");
                }}
                className="px-8 py-3 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white font-black rounded-2xl transition-all border border-rose-100 active:scale-95 shadow-sm"
              >
                Terminate Session
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background-color: #f8fafc;
        }
      `}</style>
    </div>
  );
}
