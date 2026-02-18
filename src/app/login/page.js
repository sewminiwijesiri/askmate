"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState("student");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let error = "";
    if (name === "id") {
      if (!value) {
        error = "ID is required";
      } else if (role === "student") {
        if (!/^IT\d{8}$/i.test(value)) error = "Invalid Student ID (e.g., IT12345678)";
      } else {
        if (!/^LC\d{8}$/i.test(value)) error = "Invalid Lecturer ID (e.g., LC12345678)";
      }
    } else if (name === "password") {
         if (!value) error = "Password is required";
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    // Validate
    const newErrors = {};
    if (!id) newErrors.id = "ID is required";
    else if (role === "student" && !/^IT\d{8}$/i.test(id)) newErrors.id = "Invalid Student ID (e.g., IT12345678)";
    else if (role === "lecturer" && !/^LC\d{8}$/i.test(id)) newErrors.id = "Invalid Lecturer ID (e.g., LC12345678)";

    if (!password) newErrors.password = "Password is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role, id, password }),
      });

      const data = await res.json();
      setMessage(data.message);

      if (res.ok) {
        if (data.token) {
          localStorage.setItem("token", data.token);
          // Store user info if needed
          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        }
        setTimeout(() => {
          router.push("/dashboard"); // Redirect to dashboard or home
        }, 1500);
      }
    } catch (error) {
      setMessage("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-500">Sign in to your AskMate account</p>
        </div>

        <div className="mb-6 flex p-1 bg-gray-100 rounded-lg">
            <button
                type="button"
                onClick={() => {
                  setRole("student");
                  setErrors({});
                  setMessage("");
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    role === "student" 
                    ? "bg-white text-indigo-600 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
            >
                Student
            </button>
            <button
                type="button"
                onClick={() => {
                  setRole("lecturer");
                  setErrors({});
                  setMessage("");
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    role === "lecturer" 
                    ? "bg-white text-indigo-600 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
            >
                Lecturer
            </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {role === "student" ? "Student ID" : "Lecturer ID"}
            </label>
            <input
              type="text"
              name="id"
              placeholder={role === "student" ? "ITXXXXXXXX" : "LCXXXXXXXX"}
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                if (errors.id) setErrors({ ...errors, id: "" });
              }}
              onBlur={(e) => validateField("id", e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.id ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
              } bg-white text-gray-900 focus:ring-2 focus:border-transparent outline-none transition-all`}
            />
            {errors.id && <p className="text-sm text-red-600 mt-1">{errors.id}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                onBlur={(e) => validateField("password", e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                } bg-white text-gray-900 focus:ring-2 focus:border-transparent outline-none transition-all pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                    <line x1="2" x2="22" y1="2" y2="22"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing In..." : "Login"}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm text-center ${message.includes("success") || message.includes("successful") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link href="/register" className="text-indigo-600 hover:text-indigo-500 font-medium">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
