"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronDown, Eye, EyeOff, ShieldCheck, User } from "lucide-react";
import Toast from "./Toast";

const loginSchema = z.object({
  role: z.enum(["student", "lecturer", "helper", "admin"]),
  id: z.string().min(1, "ID or Username is required"),
  password: z.string().min(1, "Password is required"),
}).superRefine((data, ctx) => {
  if (data.role === "student") {
    if (!/^IT\d{8}$/i.test(data.id)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid Student ID (e.g., ITXXXXXXXX)", path: ["id"] });
    }
  } else if (data.role === "lecturer") {
    if (!/^LC\d{8}$/i.test(data.id)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid Lecturer ID (e.g., LCXXXXXXXX)", path: ["id"] });
    }
  }
});

export default function LoginForm({ onSuccess, onSwitchToRegister }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      role: "student",
      id: "",
      password: "",
    },
  });

  const selectedRole = watch("role");

  // Handle Admin Mode toggle
  const toggleAdminMode = () => {
    const newMode = !isAdminMode;
    setIsAdminMode(newMode);
    reset({
      role: newMode ? "admin" : "student",
      id: "",
      password: "",
    });
    setToast({ message: "", type: "success" });
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setToast({ message: "", type: "success" });

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        setToast({ message: result.message || "Login successful!", type: "success" });
        if (result.token) {
          localStorage.setItem("token", result.token);
          if (result.user) {
            localStorage.setItem("user", JSON.stringify(result.user));
          }
          window.dispatchEvent(new Event("loginStateChange"));
        }
        setTimeout(() => {
          if (onSuccess) onSuccess();
          if (result.user?.role === "admin") {
            router.push("/admin/dashboard");
          } else {
            router.push("/dashboard");
          }
        }, 1500);
      } else {
        setToast({ message: result.message || "Login failed. Please check your credentials.", type: "error" });
      }
    } catch (error) {
      setToast({ message: "An unexpected error occurred. Please try again.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const getIdLabel = () => {
    if (isAdminMode) return "Username";
    if (selectedRole === "student") return "Student ID";
    if (selectedRole === "lecturer") return "Lecturer ID";
    return "University ID";
  };

  const getIdPlaceholder = () => {
    if (isAdminMode) return "admin_user";
    if (selectedRole === "student") return "ITXXXXXXXX";
    if (selectedRole === "lecturer") return "LCXXXXXXXX";
    return "ITXXXXXXXX";
  };

  return (
    <div className="w-full bg-white p-5 sm:p-6 rounded-3xl">
      <div className="text-center mb-3">
        <h1 className="text-xl font-bold text-[#002147] mb-0.5 tracking-tight">
          {isAdminMode ? "Admin Portal" : "Welcome Back"}
        </h1>
        <p className="text-gray-500 text-xs font-medium">
          {isAdminMode ? "Restricted access area" : "Sign in to continue"}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role Selection (Only if not Admin) */}
        {!isAdminMode && (
          <div className="w-full">
            <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Login as</label>
            <div className="relative">
              <select
                {...register("role")}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:border-[#002147] focus:ring-4 focus:ring-[#002147]/5 outline-none transition-all appearance-none cursor-pointer font-medium"
              >
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="helper">Helper</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#002147]">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>
        )}

        {/* ID / Username Field */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">{getIdLabel()}</label>
          <div className="relative">
            <input
              type="text"
              placeholder={getIdPlaceholder()}
              {...register("id")}
              className={`w-full px-3.5 py-2 rounded-xl border ${errors.id ? "border-red-500 ring-1 ring-red-500" : "border-gray-200 focus:border-[#002147] focus:ring-2 focus:ring-[#002147]/10"
                } bg-gray-50 text-sm text-gray-900 outline-none transition-all pr-10`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {isAdminMode ? <ShieldCheck size={16} /> : <User size={16} />}
            </div>
          </div>
          {errors.id && <p className="text-xs text-red-500 mt-0.5 font-medium ml-1">{errors.id.message}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
              className={`w-full px-3.5 py-2 rounded-xl border ${errors.password ? "border-red-500 ring-1 ring-red-500" : "border-gray-200 focus:border-[#002147] focus:ring-2 focus:ring-[#002147]/10"
                } bg-gray-50 text-sm text-gray-900 outline-none transition-all pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1 hover:text-[#002147] transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-0.5 font-medium ml-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={!isValid || isLoading}
          className={`w-full py-2.5 px-6 ${isAdminMode ? 'bg-gray-900 shadow-gray-200' : 'bg-[#002147] shadow-[#002147]/20'} hover:opacity-90 text-white font-bold rounded-2xl shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0 text-sm`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Signing In...
            </span>
          ) : (isAdminMode ? "Access Admin Dashboard" : "Sign In")}
        </button>
      </form>

      <div className="mt-6 text-center space-y-3">
        {!isAdminMode && (
          <p className="text-gray-500 text-xs font-medium">
            Don't have an account?{" "}
            <button
              onClick={onSwitchToRegister}
              className="text-[#4DA8DA] hover:text-[#002147] font-bold underline decoration-2 underline-offset-4 transition-all"
            >
              Register
            </button>
          </p>
        )}

        <div className={`${!isAdminMode ? 'pt-4 border-t border-gray-100' : ''}`}>
          <button
            onClick={toggleAdminMode}
            className="flex items-center justify-center gap-2 mx-auto text-gray-500 hover:text-[#002147] font-semibold transition-colors text-xs"
          >
            {isAdminMode ? (
              <>← Back to User Login</>
            ) : (
              <>
                <ShieldCheck size={14} />
                <span>Admin Login</span>
              </>
            )}
          </button>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, message: "" })}
      />
    </div>
  );
}
