"use client";

import RegisterForm from "../../components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <RegisterForm 
          onSuccess={() => {}} 
          onSwitchToLogin={() => window.location.href = '/login'}
        />
      </div>
    </div>
  );
}
