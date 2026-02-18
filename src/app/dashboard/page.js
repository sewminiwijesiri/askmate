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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome, {user.role === 'student' ? 'Student' : 'Lecturer'}!
          </h1>
          <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
            <h2 className="text-xl font-semibold text-indigo-900 mb-4">Profile Details</h2>
            <div className="space-y-2">
              <p className="flex items-center text-gray-700">
                <span className="font-medium w-24">ID:</span> 
                <span className="font-mono bg-white px-2 py-1 rounded border border-gray-200">{user.userId}</span>
              </p>
              <p className="flex items-center text-gray-700">
                <span className="font-medium w-24">Email:</span> 
                <span>{user.email}</span>
              </p>
              <p className="flex items-center text-gray-700">
                <span className="font-medium w-24">Role:</span> 
                <span className="capitalize px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">{user.role}</span>
              </p>
              {user.role === 'student' && (
                <>
                  <p className="flex items-center text-gray-700">
                    <span className="font-medium w-24">Year:</span> 
                    <span>{user.year}</span>
                  </p>
                  <p className="flex items-center text-gray-700">
                    <span className="font-medium w-24">Semester:</span> 
                    <span>{user.semester}</span>
                  </p>
                </>
              )}
            </div>
          </div>
          
          <div className="mt-8">
            <button 
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                router.push("/login");
              }}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
