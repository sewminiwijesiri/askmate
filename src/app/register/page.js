"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Toast from "../../components/Toast";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState("student");
  const [id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [toast, setToast] = useState({ message: "", type: "success" });
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
    } else if (name === "email") {
      if (!value) {
        error = "Email is required";
      } else {
         const idPattern = role === "student" ? /^IT\d{8}$/i : /^LC\d{8}$/i;
         if (id && idPattern.test(id)) {
            const expectedEmail = `${id.toLowerCase()}@my.sliit.lk`;
            if (value.toLowerCase() !== expectedEmail) {
                error = `Email must be ${expectedEmail}`;
            }
         } else if (!/@my\.sliit\.lk$/i.test(value)) {
             error = "Must be a valid SLIIT email (@my.sliit.lk)";
         }
      }
    } else if (name === "password") {
       if (!value) error = "Password is required";
       else if (value.length < 6) error = "Password must be at least 6 characters";
    } else if (name === "confirmPassword") {
       if (value !== password) error = "Passwords do not match";
    } else if (name === "year" && role === "student") {
       if (!value) error = "Please select a year";
    } else if (name === "semester" && role === "student") {
       if (!value) error = "Please select a semester";
    }
    
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setToast({ ...toast, message: "" });
    
    // Validate all fields
    const newErrors = {};
    
    // ID Validation
    if (!id) newErrors.id = "ID is required";
    else if (role === "student" && !/^IT\d{8}$/i.test(id)) newErrors.id = "Invalid Student ID (e.g., IT12345678)";
    else if (role === "lecturer" && !/^LC\d{8}$/i.test(id)) newErrors.id = "Invalid Lecturer ID (e.g., LC12345678)";

    // Email Validation
    if (!email) newErrors.email = "Email is required";
    else {
        const idPattern = role === "student" ? /^IT\d{8}$/i : /^LC\d{8}$/i;
        if (id && idPattern.test(id)) {
             const expectedEmail = `${id.toLowerCase()}@my.sliit.lk`;
             if (email.toLowerCase() !== expectedEmail) {
                 newErrors.email = `Email must be ${expectedEmail}`;
             }
        } else if (!/@my\.sliit\.lk$/i.test(email)) {
             newErrors.email = "Must be a valid SLIIT email (@my.sliit.lk)";
        }
    }

    // Password Validation
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    // Student fields
    if (role === "student") {
        if (!year) newErrors.year = "Please select a year";
        if (!semester) newErrors.semester = "Please select a semester";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
        return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role, id, email, password, year, semester }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setToast({ message: data.message || "Registration successful! Redirecting...", type: "success" });
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        setToast({ message: data.message || "Registration failed.", type: "error" });
      }
    } catch (error) {
      setToast({ message: "An error occurred. Please try again.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="text-center mb-5">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h1>
          <p className="text-gray-500 text-sm">Join the AskMate community</p>
        </div>

        <div className="mb-4 flex p-1 bg-gray-100 rounded-lg">
            <button
                type="button"
                onClick={() => {
                  setRole("student");
                  setErrors({});
                  setToast({ ...toast, message: "" });
                }}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
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
                  setToast({ ...toast, message: "" });
                }}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                    role === "lecturer" 
                    ? "bg-white text-indigo-600 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
            >
                Lecturer
            </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
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
              className={`w-full px-3 py-1.5 text-sm rounded-lg border ${
                errors.id ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
              } bg-white text-gray-900 focus:ring-2 focus:border-transparent outline-none transition-all`}
            />
            {errors.id && <p className="text-xs text-red-600 mt-1">{errors.id}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder={role === "student" ? "ITXXXXXXXX@my.sliit.lk" : "LCXXXXXXXX@my.sliit.lk"}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              onBlur={(e) => validateField("email", e.target.value)}
              className={`w-full px-3 py-1.5 text-sm rounded-lg border ${
                errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
              } bg-white text-gray-900 focus:ring-2 focus:border-transparent outline-none transition-all`}
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>

          {role === "student" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Year
                </label>
                <div className="relative">
                  <select
                    name="year"
                    value={year}
                    onChange={(e) => {
                      setYear(e.target.value);
                      if (errors.year) setErrors({ ...errors, year: "" });
                    }}
                    onBlur={(e) => validateField("year", e.target.value)}
                    className={`w-full px-3 py-1.5 text-sm rounded-lg border ${
                      errors.year ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                    } bg-white text-gray-900 focus:ring-2 focus:border-transparent outline-none transition-all appearance-none cursor-pointer`}
                  >
                    <option value="">Select Year</option>
                    <option value="Year 1">Year 1</option>
                    <option value="Year 2">Year 2</option>
                    <option value="Year 3">Year 3</option>
                    <option value="Year 4">Year 4</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
                {errors.year && <p className="text-xs text-red-600 mt-1">{errors.year}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Semester
                </label>
                <div className="relative">
                  <select
                    name="semester"
                    value={semester}
                    onChange={(e) => {
                      setSemester(e.target.value);
                      if (errors.semester) setErrors({ ...errors, semester: "" });
                    }}
                    onBlur={(e) => validateField("semester", e.target.value)}
                    className={`w-full px-3 py-1.5 text-sm rounded-lg border ${
                      errors.semester ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                    } bg-white text-gray-900 focus:ring-2 focus:border-transparent outline-none transition-all appearance-none cursor-pointer`}
                  >
                    <option value="">Select Semester</option>
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
                {errors.semester && <p className="text-xs text-red-600 mt-1">{errors.semester}</p>}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                className={`w-full px-3 py-1.5 text-sm rounded-lg border ${
                  errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                } bg-white text-gray-900 focus:ring-2 focus:border-transparent outline-none transition-all pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                    <line x1="2" x2="22" y1="2" y2="22"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                }}
                onBlur={(e) => validateField("confirmPassword", e.target.value)}
                className={`w-full px-3 py-1.5 text-sm rounded-lg border ${
                  errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                } bg-white text-gray-900 focus:ring-2 focus:border-transparent outline-none transition-all pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                    <line x1="2" x2="22" y1="2" y2="22"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, message: "" })} 
        />

        <div className="mt-4 text-center text-xs text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
