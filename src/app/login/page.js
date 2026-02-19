"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Toast from "../../components/Toast";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="animate-pulse text-primary font-medium">Loading login form...</div>
    </div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState("student");

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "student" || roleParam === "lecturer") {
      setRole(roleParam);
    }
  }, [searchParams]);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "student" || roleParam === "lecturer") {
      setRole(roleParam);
      setIsAdmin(false);
    } else if (roleParam === "admin") {
      setIsAdmin(true);
      setRole("admin");
    }
  }, [searchParams]);

  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let error = "";
    if (name === "id") {
      if (!value) {
        error = isAdmin ? "Username is required" : "ID is required";
      } else if (!isAdmin) {
        if (role === "student") {
          if (!/^IT\d{8}$/i.test(value)) error = "Invalid Student ID (e.g., IT12345678)";
        } else {
          if (!/^LC\d{8}$/i.test(value)) error = "Invalid Lecturer ID (e.g., LC12345678)";
        }
      }
    } else if (name === "password") {
         if (!value) error = "Password is required";
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setToast({ ...toast, message: "" });

    // Validate
    const newErrors = {};
    if (!id) {
        newErrors.id = isAdmin ? "Username is required" : "ID is required";
    } else if (!isAdmin) {
        if (role === "student" && !/^IT\d{8}$/i.test(id)) newErrors.id = "Invalid Student ID (e.g., IT12345678)";
        else if (role === "lecturer" && !/^LC\d{8}$/i.test(id)) newErrors.id = "Invalid Lecturer ID (e.g., LC12345678)";
    }

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
        body: JSON.stringify({ role: isAdmin ? "admin" : role, id, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setToast({ message: data.message || "Login successful!", type: "success" });
        if (data.token) {
          localStorage.setItem("token", data.token);
          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        }
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setToast({ message: data.message || "Login failed.", type: "error" });
      }
    } catch (error) {
      setToast({ message: "Invalid credentials. Please try again.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isAdmin ? "Admin Login" : "Welcome Back"}
          </h1>
          <p className="text-gray-500">
            {isAdmin ? "Manage the AskMate platform" : "Sign in to your AskMate account"}
          </p>
        </div>

        {!isAdmin && (
          <div className="mb-6 flex p-1 bg-gray-100 rounded-lg">
              <button
                  type="button"
                  onClick={() => {
                    setRole("student");
                    setErrors({});
                    setToast({ ...toast, message: "" });
                  }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      role === "student" 
                      ? "bg-white text-primary shadow-sm ring-1 ring-gray-200" 
                      : "text-gray-500 hover:text-gray-900"
                  }`}
              >
                  Student
              </button>
              <button
                  type="button"
                  onClick={() => {
                    setRole("lecturer");
                    setErrors({});
                    setToast({ ...toast, message: "" });
                  }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      role === "lecturer" 
                      ? "bg-white text-primary shadow-sm ring-1 ring-gray-200" 
                      : "text-gray-500 hover:text-gray-900"
                  }`}
              >
                  Lecturer
              </button>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isAdmin ? "Username" : (role === "student" ? "Student ID" : "Lecturer ID")}
            </label>
            <input
              type="text"
              name="id"
              placeholder={isAdmin ? "admin_username" : (role === "student" ? "ITXXXXXXXX" : "LCXXXXXXXX")}
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
            className={`w-full py-3 px-4 ${isAdmin ? 'bg-gray-900 hover:bg-gray-800' : 'bg-primary hover:bg-blue-900'} text-white font-semibold rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed`}
          >
            {isLoading ? "Signing In..." : (isAdmin ? "Login as Admin" : "Login")}
          </button>
        </form>

        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, message: "" })} 
        />

        <div className="mt-6 text-center text-sm text-gray-500 space-y-4">
          {!isAdmin && (
            <div>
              Don't have an account?{" "}
              <Link href="/register" className="text-secondary hover:text-blue-600 font-medium">
                Register
              </Link>
            </div>
          )}
          
          <div className={`${!isAdmin ? 'pt-4 border-t border-gray-100' : ''}`}>
            <button 
              onClick={() => {
                setIsAdmin(!isAdmin);
                setErrors({});
                setId("");
                setPassword("");
                setToast({ ...toast, message: "" });
              }}
              className="text-secondary hover:text-blue-600 font-medium transition-colors"
            >
              {isAdmin ? "← Back to User Login" : "Login as Admin"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
