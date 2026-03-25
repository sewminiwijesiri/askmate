"use client";

import { useState, useEffect } from "react";
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
  AlertCircle,
  Pencil
} from "lucide-react";

/**
 * Zod schema for Reminder Form validation with strict time rules
 */
const reminderSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100),
  description: z.string()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  deadlineDate: z.string().min(1, "Date is required").refine((val) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(val) >= today;
  }, { message: "Date cannot be in the past" }),
  deadlineTime: z.string().min(1, "Time is required").regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  notificationTime: z.string().min(1, "Notification option is required"),
}).superRefine((data, ctx) => {
  const { deadlineDate, deadlineTime, notificationTime } = data;
  
  // Parse target date/time
  const [hours, minutes] = deadlineTime.split(':').map(Number);
  const targetDateTime = new Date(deadlineDate);
  targetDateTime.setHours(hours, minutes, 0, 0);
  
  const now = new Date();
  
  // 1. Check if reminder time is in the future
  if (targetDateTime <= now) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Time must be in the future",
      path: ["deadlineTime"],
    });
    return;
  }
  
  // 2. Check if notification time has already passed
  if (notificationTime !== "No notification") {
    let offsetMinutes = 0;
    if (notificationTime === "5 minutes before") offsetMinutes = 5;
    else if (notificationTime === "15 minutes before") offsetMinutes = 15;
    else if (notificationTime === "30 minutes before") offsetMinutes = 30;
    else if (notificationTime === "1 hour before") offsetMinutes = 60;
    else if (notificationTime === "2 hours before") offsetMinutes = 120;
    else if (notificationTime === "1 day before") offsetMinutes = 1440;
    
    const notificationDateTime = new Date(targetDateTime.getTime() - offsetMinutes * 60000);
    
    if (notificationDateTime <= now && notificationTime !== "At time of event") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Notification time (${notificationTime}) has already passed`,
        path: ["notificationTime"],
      });
    }
  }
});

export default function ReminderForm({ onSuccess, user, reminder }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isEditMode = !!reminder;

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

  // Pre-fill form if editing
  useEffect(() => {
    if (reminder) {
      reset({
        title: reminder.title,
        description: reminder.description,
        deadlineDate: new Date(reminder.deadlineDate).toISOString().split('T')[0],
        deadlineTime: reminder.deadlineTime,
        notificationTime: reminder.notificationTime,
      });
    }
  }, [reminder, reset]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        ...data,
        studentId: user?.userId,
      };

      const token = localStorage.getItem("token");
      const url = isEditMode ? `/api/reminders/${reminder._id}` : "/api/reminders";
      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Failed to ${isEditMode ? 'update' : 'create'} reminder`);
      }

      if (!isEditMode) reset();
      if (onSuccess) onSuccess(result.data, isEditMode);
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
    <div className="bg-white rounded-2xl">
      <div className="flex items-center gap-4 mb-5 border-b border-slate-50 pb-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isEditMode ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}>
          {isEditMode ? <Pencil size={20} /> : <Bell size={20} className="animate-pulse" />}
        </div>
        <div>
          <h2 className="text-xl font-black text-[#002147] tracking-tight">
            {isEditMode ? 'Update Reminder' : 'New Reminder'}
          </h2>
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            {isEditMode ? 'Modify details' : "Set academic deadline"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in fade-in slide-in-from-top-1">
            <AlertCircle size={18} />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Title Field */}
          <div className="group">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
              <Type size={11} className="text-slate-300" />
              Title
            </label>
            <div className={`relative transition-all duration-300 ${errors.title ? 'ring-2 ring-rose-500/20' : 'group-focus-within:ring-4 group-focus-within:ring-blue-500/10'}`}>
              <input
                {...register("title")}
                type="text"
                placeholder="e.g., OS Assignment"
                className={`w-full bg-slate-50 border ${errors.title ? 'border-rose-300' : 'border-slate-100 group-hover:border-slate-200'} rounded-xl py-3 px-4 text-sm font-bold text-[#002147] placeholder:text-slate-300 placeholder:font-medium focus:outline-none focus:border-blue-400 focus:bg-white transition-all`}
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
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
              <AlignLeft size={11} className="text-slate-300" />
              Description
            </label>
            <div className={`relative transition-all duration-300 ${errors.description ? 'ring-2 ring-rose-500/20' : 'group-focus-within:ring-4 group-focus-within:ring-blue-500/10'}`}>
              <textarea
                {...register("description")}
                placeholder="Reminder details..."
                rows={2}
                className={`w-full bg-slate-50 border ${errors.description ? 'border-rose-300' : 'border-slate-100 group-hover:border-slate-200'} rounded-xl py-3 px-4 text-sm font-bold text-[#002147] placeholder:text-slate-300 placeholder:font-medium focus:outline-none focus:border-blue-400 focus:bg-white transition-all resize-none`}
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
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                <Calendar size={11} className="text-slate-300" />
                Date
              </label>
              <div className={`relative transition-all duration-300 ${errors.deadlineDate ? 'ring-2 ring-rose-500/20' : 'group-focus-within:ring-4 group-focus-within:ring-blue-500/10'}`}>
                <input
                  {...register("deadlineDate")}
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full bg-slate-50 border ${errors.deadlineDate ? 'border-rose-300' : 'border-slate-100 group-hover:border-slate-200'} rounded-xl py-3 px-4 text-sm font-bold text-[#002147] focus:outline-none focus:border-blue-400 focus:bg-white transition-all appearance-none cursor-pointer`}
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
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                <Clock size={11} className="text-slate-300" />
                Time
              </label>
              <div className={`relative transition-all duration-300 ${errors.deadlineTime ? 'ring-2 ring-rose-500/20' : 'group-focus-within:ring-4 group-focus-within:ring-blue-500/10'}`}>
                <input
                  {...register("deadlineTime")}
                  type="time"
                  className={`w-full bg-slate-50 border ${errors.deadlineTime ? 'border-rose-300' : 'border-slate-100 group-hover:border-slate-200'} rounded-xl py-3 px-4 text-sm font-bold text-[#002147] focus:outline-none focus:border-blue-400 focus:bg-white transition-all appearance-none cursor-pointer`}
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
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
              <Bell size={11} className="text-orange-400" />
              Notify
            </label>
            <div className={`relative transition-all duration-300 ${errors.notificationTime ? 'ring-2 ring-rose-500/20' : 'group-focus-within:ring-4 group-focus-within:ring-blue-500/10'}`}>
              <select
                {...register("notificationTime")}
                className={`w-full bg-slate-50 border ${errors.notificationTime ? 'border-rose-300' : 'border-slate-100 group-hover:border-slate-200'} rounded-xl py-3 px-4 text-sm font-bold text-[#002147] focus:outline-none focus:border-blue-400 focus:bg-white transition-all appearance-none cursor-pointer`}
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
          className={`w-full py-3.5 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group ${
            isEditMode 
            ? 'bg-blue-600 shadow-blue-900/10 hover:bg-blue-700 hover:shadow-blue-900/20' 
            : 'bg-[#002147] shadow-blue-900/10 hover:bg-slate-800 hover:shadow-blue-900/20'
          } active:scale-[0.98]`}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
              <span>{isEditMode ? 'Save Changes' : 'Set Reminder'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
