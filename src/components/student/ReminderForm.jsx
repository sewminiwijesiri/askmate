"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Bell, 
  Calendar, 
  Clock, 
  Type, 
  AlignLeft, 
  Loader2, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";

/**
 * Zod schema for Reminder Form validation
 */
const reminderSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(5, "Description must be at least 5 characters").max(500),
  deadlineDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
  deadlineTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  notificationTime: z.string().min(1, "Please select a notification time"),
});

export default function ReminderForm({ onSuccess, user }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      notificationTime: "1 hour before",
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        ...data,
        studentId: user?.userId,
      };

      const token = localStorage.getItem("token");
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create reminder");
      }

      reset();
      if (onSuccess) onSuccess(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const notificationOptions = [
    "No notification",
    "At time of event",
    "5 minutes before",
    "15 minutes before",
    "30 minutes before",
    "1 hour before",
    "2 hours before",
    "1 day before",
  ];

  return (
    <div className="bg-white p-1 rounded-2xl">
      <div className="flex flex-col gap-1 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 mb-2">
          <Bell size={24} className="animate-pulse" />
        </div>
        <h2 className="text-2xl font-black text-[#002147] tracking-tight">Set a New Reminder</h2>
        <p className="text-slate-500 text-sm font-medium">We'll notify you before your deadline approaching.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in fade-in slide-in-from-top-1">
            <AlertCircle size={18} />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Title Field */}
          <div className="group">
            <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
              <Type size={12} className="text-slate-300" />
              Reminder Title
            </label>
            <div className={`relative transition-all duration-300 ${errors.title ? 'ring-2 ring-rose-500/20' : 'group-focus-within:ring-4 group-focus-within:ring-blue-500/10'}`}>
              <input
                {...register("title")}
                type="text"
                placeholder="e.g., Submit Operating Systems Assignment"
                className={`w-full bg-slate-50 border ${errors.title ? 'border-rose-300' : 'border-slate-100 group-hover:border-slate-200'} rounded-2xl py-4 px-5 text-sm font-bold text-[#002147] placeholder:text-slate-300 placeholder:font-medium focus:outline-none focus:border-blue-400 focus:bg-white transition-all`}
              />
            </div>
            {errors.title && (
              <p className="mt-1.5 ml-1 text-xs font-bold text-rose-500 flex items-center gap-1 leading-none">
                <span className="w-1 h-1 rounded-full bg-rose-500"></span> {errors.title.message}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div className="group">
            <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
              <AlignLeft size={12} className="text-slate-300" />
              Description
            </label>
            <div className={`relative transition-all duration-300 ${errors.description ? 'ring-2 ring-rose-500/20' : 'group-focus-within:ring-4 group-focus-within:ring-blue-500/10'}`}>
              <textarea
                {...register("description")}
                placeholder="What details should we remind you about?"
                rows={3}
                className={`w-full bg-slate-50 border ${errors.description ? 'border-rose-300' : 'border-slate-100 group-hover:border-slate-200'} rounded-2xl py-4 px-5 text-sm font-bold text-[#002147] placeholder:text-slate-300 placeholder:font-medium focus:outline-none focus:border-blue-400 focus:bg-white transition-all resize-none`}
              />
            </div>
            {errors.description && (
              <p className="mt-1.5 ml-1 text-xs font-bold text-rose-500 flex items-center gap-1 leading-none">
                <span className="w-1 h-1 rounded-full bg-rose-500"></span> {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Deadline Date */}
            <div className="group">
              <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                <Calendar size={12} className="text-slate-300" />
                Deadline Date
              </label>
              <div className={`relative transition-all duration-300 ${errors.deadlineDate ? 'ring-2 ring-rose-500/20' : 'group-focus-within:ring-4 group-focus-within:ring-blue-500/10'}`}>
                <input
                  {...register("deadlineDate")}
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full bg-slate-50 border ${errors.deadlineDate ? 'border-rose-300' : 'border-slate-100 group-hover:border-slate-200'} rounded-2xl py-4 px-5 text-sm font-bold text-[#002147] focus:outline-none focus:border-blue-400 focus:bg-white transition-all appearance-none cursor-pointer`}
                />
              </div>
              {errors.deadlineDate && (
                <p className="mt-1.5 ml-1 text-xs font-bold text-rose-500 flex items-center gap-1 leading-none">
                  <span className="w-1 h-1 rounded-full bg-rose-500"></span> {errors.deadlineDate.message}
                </p>
              )}
            </div>

            {/* Deadline Time */}
            <div className="group">
              <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                <Clock size={12} className="text-slate-300" />
                Deadline Time
              </label>
              <div className={`relative transition-all duration-300 ${errors.deadlineTime ? 'ring-2 ring-rose-500/20' : 'group-focus-within:ring-4 group-focus-within:ring-blue-500/10'}`}>
                <input
                  {...register("deadlineTime")}
                  type="time"
                  className={`w-full bg-slate-50 border ${errors.deadlineTime ? 'border-rose-300' : 'border-slate-100 group-hover:border-slate-200'} rounded-2xl py-4 px-5 text-sm font-bold text-[#002147] focus:outline-none focus:border-blue-400 focus:bg-white transition-all appearance-none cursor-pointer`}
                />
              </div>
              {errors.deadlineTime && (
                <p className="mt-1.5 ml-1 text-xs font-bold text-rose-500 flex items-center gap-1 leading-none">
                  <span className="w-1 h-1 rounded-full bg-rose-500"></span> {errors.deadlineTime.message}
                </p>
              )}
            </div>
          </div>

          {/* Notify Before */}
          <div className="group">
            <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
              <Bell size={12} className="text-orange-400" />
              Notify Before
            </label>
            <div className={`relative transition-all duration-300 ${errors.notificationTime ? 'ring-2 ring-rose-500/20' : 'group-focus-within:ring-4 group-focus-within:ring-blue-500/10'}`}>
              <select
                {...register("notificationTime")}
                className={`w-full bg-slate-50 border ${errors.notificationTime ? 'border-rose-300' : 'border-slate-100 group-hover:border-slate-200'} rounded-2xl py-4 px-5 text-sm font-bold text-[#002147] focus:outline-none focus:border-blue-400 focus:bg-white transition-all appearance-none cursor-pointer`}
              >
                {notificationOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Clock size={16} />
              </div>
            </div>
            {errors.notificationTime && (
              <p className="mt-1.5 ml-1 text-xs font-bold text-rose-500 flex items-center gap-1 leading-none">
                <span className="w-1 h-1 rounded-full bg-rose-500"></span> {errors.notificationTime.message}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-[#002147] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-900/10 hover:bg-slate-800 hover:shadow-2xl hover:shadow-blue-900/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Creating Reminder...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
              <span>Set Reminder</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
