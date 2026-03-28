"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import Toast from "./Toast";

// --- Form Patterns and Config ---

const roles = [
  { id: "student", label: "Student", idLabel: "Student ID", idPlaceholder: "ITXXXXXXXX" },
  { id: "lecturer", label: "Lecturer", idLabel: "Lecturer ID", idPlaceholder: "LCXXXXXXXX" },
  { id: "helper", label: "Helper", idLabel: "University ID", idPlaceholder: "ITXXXXXXXX" },
];

const registerSchema = z.object({
  role: z.enum(["student", "lecturer", "helper"]),
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  year: z.string().optional(),
  semester: z.string().optional(),
  graduationYear: z.string().optional(),
  skills: z.string().optional(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must include at least one uppercase letter")
    .regex(/[a-z]/, "Must include at least one lowercase letter")
    .regex(/[0-9]/, "Must include at least one number")
    .regex(/[@$!%*?&#]/, "Must include at least one special character (@$!%*?&#)"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).superRefine((data, ctx) => {
  // Conditional Field Validation
  if (data.role === "student") {
    if (!/^IT\d{8}$/i.test(data.id)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid Student ID (e.g., ITXXXXXXXX)", path: ["id"] });
    }
    if (!data.year) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select a year", path: ["year"] });
    if (!data.semester) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select a semester", path: ["semester"] });
    if (!data.email.toLowerCase().endsWith("@my.sliit.lk")) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Must be a valid SLIIT email (@my.sliit.lk)", path: ["email"] });
    } else {
      const expectedEmail = `${data.id.toLowerCase()}@my.sliit.lk`;
      if (data.id && /^IT\d{8}$/i.test(data.id) && data.email.toLowerCase() !== expectedEmail) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Email must be ${expectedEmail}`, path: ["email"] });
      }
    }
  } else if (data.role === "lecturer") {
    if (!/^LC\d{8}$/i.test(data.id)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid Lecturer ID (e.g., LCXXXXXXXX)", path: ["id"] });
    }
    if (!data.email.toLowerCase().endsWith("@my.sliit.lk")) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Must be a valid SLIIT email (@my.sliit.lk)", path: ["email"] });
    } else {
      const expectedEmail = `${data.id.toLowerCase()}@my.sliit.lk`;
      if (data.id && /^LC\d{8}$/i.test(data.id) && data.email.toLowerCase() !== expectedEmail) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Email must be ${expectedEmail}`, path: ["email"] });
      }
    }
  } else if (data.role === "helper") {
    // Removed manual name check as it's now governed by the base schema
    if (!data.graduationYear) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Graduation year is required", path: ["graduationYear"] });
    if (!data.skills) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Skills are required", path: ["skills"] });
  }
});

export default function RegisterForm({ onSuccess, onSwitchToLogin }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    resetField,
    unregister,
    formState: { errors, isValid, isDirty, touchedFields, isSubmitted },
    setValue,
    trigger,
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      role: "student",
      id: "",
      name: "",
      email: "",
      year: "",
      semester: "",
      graduationYear: "",
      skills: "",
      password: "",
      confirmPassword: "",
    },
  });

  const selectedRole = watch("role");

  // Clear role-specific fields when role changes
  useEffect(() => {
    const fieldsToClear = ["id", "name", "year", "semester", "graduationYear", "skills"];
    fieldsToClear.forEach(field => {
      resetField(field, { defaultValue: "" });
    });
    // Trigger validation to clear errors if the form was already interacted with
    if (isDirty) {
      trigger();
    }
  }, [selectedRole, resetField, trigger, isDirty]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setToast({ message: "", type: "success" });

    try {
      const skillsArray = data.role === "helper"
        ? data.skills.split(",").map(skill => skill.trim()).filter(Boolean)
        : [];

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          graduationYear: data.graduationYear ? parseInt(data.graduationYear) : undefined,
          skills: data.role === "helper" ? skillsArray : undefined,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setToast({ message: result.message || "Registration successful! Redirecting...", type: "success" });
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onSwitchToLogin();
        }, 1500);
      } else {
        setToast({ message: result.message || "Registration failed.", type: "error" });
      }
    } catch (error) {
      setToast({ message: "An error occurred. Please try again.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const currentRoleConfig = roles.find(r => r.id === selectedRole) || roles[0];

  const InputField = ({ label, name, placeholder, type = "text", options = null }) => {
    const error = errors[name];
    const isTouched = touchedFields[name];
    const shouldShowError = !!error && (isTouched || isSubmitted);
    const isInvalid = shouldShowError;

    return (
      <div className="w-full">
        <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">
          {label}
        </label>
        <div className="relative">
          {options ? (
            <select
              {...register(name)}
              className={`w-full px-3.5 py-2 rounded-xl border ${isInvalid ? "border-red-500 ring-1 ring-red-500" : "border-gray-200 focus:border-[#002147] focus:ring-2 focus:ring-[#002147]/10"
                } bg-gray-50 text-sm text-gray-900 outline-none transition-all appearance-none cursor-pointer pr-10`}
            >
              <option value="">{placeholder}</option>
              {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              placeholder={placeholder}
              {...register(name)}
              className={`w-full px-3.5 py-2 rounded-xl border ${isInvalid ? "border-red-500 ring-1 ring-red-500" : "border-gray-200 focus:border-[#002147] focus:ring-2 focus:ring-[#002147]/10"
                } bg-gray-50 text-sm text-gray-900 outline-none transition-all`}
            />
          )}
          {options && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronDown size={18} />
            </div>
          )}
        </div>
        {shouldShowError && <p className="text-xs text-red-500 mt-1 font-medium">{error.message}</p>}
      </div>
    );
  };

  return (
    <div className="w-full bg-white p-5 sm:p-6 rounded-3xl">
      <div className="text-center mb-3">
        <h1 className="text-xl font-bold text-[#002147] mb-0.5 tracking-tight">Create Account</h1>
        <p className="text-gray-500 text-xs font-medium">Join our community today</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Role Selection Dropdown */}
        <div className="w-full">
          <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">I am a...</label>
          <div className="relative">
            <select
              {...register("role")}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:border-[#002147] focus:ring-4 focus:ring-[#002147]/5 outline-none transition-all appearance-none cursor-pointer font-medium"
            >
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#002147]">
              <ChevronDown size={20} />
            </div>
          </div>
        </div>

        {/* Dynamic Fields */}
        <InputField label="Full Name" name="name" placeholder="John Doe" />

        <div className="grid grid-cols-1 gap-3">
          <InputField
            label={currentRoleConfig.idLabel}
            name="id"
            placeholder={currentRoleConfig.idPlaceholder}
          />

          <InputField
            label="Email Address"
            name="email"
            type="email"
            placeholder={selectedRole === "helper" ? "name@example.com" : `${currentRoleConfig.idPlaceholder}@my.sliit.lk`}
          />
        </div>

        {selectedRole === "student" && (
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Year"
              name="year"
              placeholder="Select Year"
              options={["Year 1", "Year 2", "Year 3", "Year 4"]}
            />
            <InputField
              label="Semester"
              name="semester"
              placeholder="Select Semester"
              options={["Semester 1", "Semester 2"]}
            />
          </div>
        )}

        {selectedRole === "helper" && (
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Grad Year" name="graduationYear" placeholder="2024" type="number" />
            <InputField label="Skills" name="skills" placeholder="Java, React, Node" />
          </div>
        )}

        {/* Shared Password Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                className={`w-full px-3.5 py-2 rounded-xl border ${errors.password && (touchedFields.password || isSubmitted) ? "border-red-500 ring-1 ring-red-500" : "border-gray-200 focus:border-[#002147] focus:ring-2 focus:ring-[#002147]/10"
                  } bg-gray-50 text-sm text-gray-900 outline-none transition-all pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1 hover:text-[#002147] transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (touchedFields.password || isSubmitted) && <p className="text-xs text-red-500 mt-1 font-medium">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Confirm</label>
            <input
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              className={`w-full px-3.5 py-2 rounded-xl border ${errors.confirmPassword && (touchedFields.confirmPassword || isSubmitted) ? "border-red-500 ring-1 ring-red-500" : "border-gray-200 focus:border-[#002147] focus:ring-2 focus:ring-[#002147]/10"
                } bg-gray-50 text-sm text-gray-900 outline-none transition-all`}
            />
            {errors.confirmPassword && (touchedFields.confirmPassword || isSubmitted) && <p className="text-[10px] text-red-500 mt-0.5 font-medium">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-6 bg-[#002147] hover:bg-[#002147]/90 text-white font-bold rounded-2xl shadow-xl shadow-[#002147]/20 hover:shadow-[#002147]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0 text-sm"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating Account...
            </span>
          ) : "Register"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-gray-500 text-xs font-medium">
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-[#4DA8DA] hover:text-[#002147] font-bold underline decoration-2 underline-offset-4 transition-all"
          >
            Sign in
          </button>
        </p>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, message: "" })}
      />
    </div>
  );
}
