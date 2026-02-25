"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "./Toast";

export default function RegisterForm({ onSuccess, onSwitchToLogin }) {
  const router = useRouter();
  const [role, setRole] = useState("student");
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [skills, setSkills] = useState("");
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
      } else if (role === "lecturer") {
        if (!/^LC\d{8}$/i.test(value)) error = "Invalid Lecturer ID (e.g., LC12345678)";
      } else if (role === "helper") {
        if (!value) error = "Student ID is required";
      }
    } else if (name === "email") {
      if (!value) {
        error = "Email is required";
      } else if (role === "helper") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Invalid email format";
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
    } else if (name === "name" && role === "helper") {
      if (!value) error = "Name is required";
    } else if (name === "year" && role === "student") {
      if (!value) error = "Please select a year";
    } else if (name === "semester" && role === "student") {
      if (!value) error = "Please select a semester";
    } else if (name === "graduationYear" && role === "helper") {
      if (!value) error = "Graduation year is required";
    } else if (name === "skills" && role === "helper") {
      if (!value) error = "Skills are required";
    }
    
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setToast({ ...toast, message: "" });
    
    // Validate all fields
    const newErrors = {};
    
    if (!id) newErrors.id = "ID is required";
    else if (role === "student" && !/^IT\d{8}$/i.test(id)) newErrors.id = "Invalid Student ID (e.g., IT12345678)";
    else if (role === "lecturer" && !/^LC\d{8}$/i.test(id)) newErrors.id = "Invalid Lecturer ID (e.g., LC12345678)";

    if (role === "helper" && !name) newErrors.name = "Name is required";

    if (!email) newErrors.email = "Email is required";
    else if (role === "helper") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Invalid email format";
    } else {
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

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (role === "student") {
      if (!year) newErrors.year = "Please select a year";
      if (!semester) newErrors.semester = "Please select a semester";
    }

    if (role === "helper") {
      if (!graduationYear) newErrors.graduationYear = "Graduation year is required";
      if (!skills) newErrors.skills = "Skills are required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);

    try {
      const skillsArray = role === "helper" ? skills.split(",").map(skill => skill.trim()).filter(skill => skill !== "") : [];
      
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          role, 
          id, 
          email, 
          password, 
          year, 
          semester,
          name,
          graduationYear: graduationYear ? parseInt(graduationYear) : undefined,
          skills: role === "helper" ? skillsArray : undefined
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setToast({ message: data.message || "Registration successful! Redirecting...", type: "success" });
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onSwitchToLogin();
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
    <div className="w-full bg-white p-6 sm:p-8">
      <div className="text-center mb-5">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h1>
        <p className="text-gray-500 text-sm">Join the community</p>
      </div>

      <div className="mb-5 flex p-1 bg-gray-100 rounded-lg">
        <button
          type="button"
          onClick={() => {
            setRole("student");
            setErrors({});
            setToast({ ...toast, message: "" });
          }}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            role === "student"
              ? "bg-white text-[#002147] shadow-sm ring-1 ring-gray-200"
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
              ? "bg-white text-[#002147] shadow-sm ring-1 ring-gray-200"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Lecturer
        </button>
        <button
          type="button"
          onClick={() => {
            setRole("helper");
            setErrors({});
            setToast({ ...toast, message: "" });
          }}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            role === "helper"
              ? "bg-white text-[#002147] shadow-sm ring-1 ring-gray-200"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Helper
        </button>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {role === "helper" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              onBlur={(e) => validateField("name", e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#002147]"
              } bg-gray-50 text-gray-900 focus:ring-2 focus:border-transparent outline-none transition-all`}
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {role === "student" ? "Student ID" : role === "lecturer" ? "Lecturer ID" : "University ID"}
          </label>
          <input
            type="text"
            name="id"
            placeholder={role === "student" ? "ITXXXXXXXX" : role === "lecturer" ? "LCXXXXXXXX" : "ITXXXXXXXX"}
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              if (errors.id) setErrors({ ...errors, id: "" });
            }}
            onBlur={(e) => validateField("id", e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.id ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#002147]"
            } bg-gray-50 text-gray-900 focus:ring-2 focus:border-transparent outline-none transition-all`}
          />
          {errors.id && <p className="text-xs text-red-600 mt-1">{errors.id}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            placeholder={role === "helper" ? "yourname@example.com" : `${role === "student" ? "IT" : "LC"}XXXXXXXX@my.sliit.lk`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: "" });
            }}
            onBlur={(e) => validateField("email", e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#002147]"
            } bg-gray-50 text-gray-900 focus:ring-2 focus:border-transparent outline-none transition-all`}
          />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
        </div>

        {role === "helper" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grad Year
              </label>
              <input
                type="number"
                name="graduationYear"
                placeholder="2024"
                value={graduationYear}
                onChange={(e) => {
                  setGraduationYear(e.target.value);
                  if (errors.graduationYear) setErrors({ ...errors, graduationYear: "" });
                }}
                onBlur={(e) => validateField("graduationYear", e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.graduationYear ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#002147]"
                } bg-gray-50 text-gray-900 focus:ring-2 focus:border-transparent outline-none transition-all`}
              />
              {errors.graduationYear && <p className="text-xs text-red-600 mt-1">{errors.graduationYear}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills
              </label>
              <input
                type="text"
                name="skills"
                placeholder="Java, React"
                value={skills}
                onChange={(e) => {
                  setSkills(e.target.value);
                  if (errors.skills) setErrors({ ...errors, skills: "" });
                }}
                onBlur={(e) => validateField("skills", e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.skills ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#002147]"
                } bg-gray-50 text-gray-900 focus:ring-2 focus:border-transparent outline-none transition-all`}
              />
              {errors.skills && <p className="text-xs text-red-600 mt-1">{errors.skills}</p>}
            </div>
          </div>
        )}

        {role === "student" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <select
                name="year"
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
                  if (errors.year) setErrors({ ...errors, year: "" });
                }}
                onBlur={(e) => validateField("year", e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.year ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#002147]"
                } bg-gray-50 text-gray-900 focus:ring-2 focus:border-transparent outline-none transition-all appearance-none cursor-pointer`}
              >
                <option value="">Select Year</option>
                <option value="Year 1">Year 1</option>
                <option value="Year 2">Year 2</option>
                <option value="Year 3">Year 3</option>
                <option value="Year 4">Year 4</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester
              </label>
              <select
                name="semester"
                value={semester}
                onChange={(e) => {
                  setSemester(e.target.value);
                  if (errors.semester) setErrors({ ...errors, semester: "" });
                }}
                onBlur={(e) => validateField("semester", e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.semester ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#002147]"
                } bg-gray-50 text-gray-900 focus:ring-2 focus:border-transparent outline-none transition-all appearance-none cursor-pointer`}
              >
                <option value="">Select Semester</option>
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
              </select>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
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
                  errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#002147]"
                } bg-gray-50 text-gray-900 focus:ring-2 focus:border-transparent outline-none transition-all pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm
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
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#002147]"
                } bg-gray-50 text-gray-900 focus:ring-2 focus:border-transparent outline-none transition-all pr-11`}
              />
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-[#002147] hover:bg-blue-950 text-white font-semibold rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating Account..." : "Register"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <button 
          onClick={onSwitchToLogin}
          className="text-[#4DA8DA] hover:text-blue-600 font-medium cursor-pointer"
        >
          Sign in
        </button>
      </div>

      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, message: "" })} 
      />
    </div>
  );
}
