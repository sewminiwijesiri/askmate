"use client";

import { Suspense } from "react";
import LoginForm from "../../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <Suspense fallback={
          <div className="p-8 text-center animate-pulse text-[#002147] font-medium">
            Loading login form...
          </div>
        }>
          <LoginForm 
            onSuccess={() => {}} 
            onSwitchToRegister={() => window.location.href = '/register'}
          />
        </Suspense>
      </div>
    </div>
  );
}
