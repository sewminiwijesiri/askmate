"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Bell, 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  CheckCircle,
  Pencil,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import ReminderForm from "./ReminderForm";
import Modal from "../Modal";

export default function RemindersSection({ user }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReminders();
  }, [user]);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/reminders?studentId=${user?.userId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setReminders(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch reminders");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate Week Days
  const weekDays = useMemo(() => {
    const days = [];
    const today = new Date();
    // Start from 3 days ago to show a bit of history or just from today? 
    // Image shows a sequence, usually starting from beginning of week or just around current day.
    // Let's go with 3 days before and 3 days after today.
    for (let i = -3; i <= 10; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      days.push({
        full: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateNum: d.getDate(),
        isToday: d.toISOString().split('T')[0] === today.toISOString().split('T')[0]
      });
    }
    return days;
  }, []);

  const filteredReminders = useMemo(() => {
    return reminders.filter(r => new Date(r.deadlineDate).toISOString().split('T')[0] === selectedDate);
  }, [reminders, selectedDate]);

  const hasReminderOnDate = (dateStr) => {
    return reminders.some(r => new Date(r.deadlineDate).toISOString().split('T')[0] === dateStr);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this reminder?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/reminders/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        setReminders(reminders.filter((r) => r._id !== id));
      }
    } catch (err) {
      console.error("Error deleting reminder:", err);
    }
  };

  const handleToggleStatus = async (reminder) => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = reminder.status === "completed" ? "pending" : "completed";
      const res = await fetch(`/api/reminders/${reminder._id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setReminders(reminders.map(r => r._id === reminder._id ? { ...r, status: newStatus } : r));
      }
    } catch (err) {
      console.error("Error updating reminder status:", err);
    }
  };

  const handleOpenEdit = (reminder) => {
    setEditingReminder(reminder);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingReminder(null);
    setIsModalOpen(true);
  };

  const handleSuccess = (data, isEdit) => {
    if (isEdit) {
      setReminders(reminders.map(r => r._id === data._id ? data : r));
    } else {
      setReminders([data, ...reminders]);
    }
    setIsModalOpen(false);
    setEditingReminder(null);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-[#002147] tracking-tight">Today&apos;s Schedule</h2>
          <p className="text-slate-400 font-bold text-sm tracking-wide uppercase mt-1">
            {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-[#002147] text-white p-4 rounded-2xl shadow-xl shadow-blue-900/10 hover:bg-slate-800 transition-all active:scale-95 group"
        >
          <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      {/* Calendar Stripe */}
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
          {weekDays.map((day) => {
            const isSelected = selectedDate === day.full;
            const hasReminders = hasReminderOnDate(day.full);
            
            return (
              <button
                key={day.full}
                onClick={() => setSelectedDate(day.full)}
                className="flex flex-col items-center min-w-[60px] group transition-all"
              >
                <span className={`text-[11px] font-black uppercase tracking-widest mb-3 ${
                  isSelected ? 'text-[#002147]' : 'text-slate-300 group-hover:text-slate-400'
                }`}>
                  {day.dayName}
                </span>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all relative ${
                  isSelected 
                  ? 'bg-[#FF9F1C] text-white shadow-lg shadow-orange-500/30 scale-110' 
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}>
                  {day.dateNum}
                  
                  {/* Event Marker Dot */}
                  {hasReminders && !isSelected && (
                    <div className="absolute -bottom-6 w-1.5 h-1.5 rounded-full bg-[#FF9F1C] animate-pulse" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reminders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-[2rem] border border-dashed border-slate-200">
            <Loader2 size={32} className="text-blue-400 animate-spin mb-4" />
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Sycing with server...</p>
          </div>
        ) : filteredReminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6">
              <Calendar size={40} />
            </div>
            <h3 className="text-xl font-bold text-[#002147] mb-2">Clear Schedule</h3>
            <p className="text-slate-400 text-sm font-medium max-w-[240px] mx-auto">
              No reminders set for this date. Take some time to relax!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredReminders.map((reminder) => (
              <div 
                key={reminder._id} 
                className={`group p-6 rounded-[2rem] border transition-all duration-300 ${
                  reminder.status === 'completed' 
                  ? 'bg-slate-50/50 border-slate-100 opacity-75' 
                  : 'bg-white border-slate-100 hover:border-[#FF9F1C]/30 hover:shadow-xl hover:shadow-orange-900/5'
                }`}
              >
                <div className="flex items-center gap-6">
                  {/* Time Badge */}
                  <div className={`hidden md:flex flex-col items-center justify-center min-w-[80px] py-3 rounded-2xl border ${
                    reminder.status === 'completed' ? 'bg-slate-100/50 border-slate-200 text-slate-400' : 'bg-[#002147] border-[#002147] text-white'
                  }`}>
                    <Clock size={16} className="mb-1 opacity-60" />
                    <span className="text-xs font-black tracking-tight">{reminder.deadlineTime}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className={`text-lg font-bold truncate ${
                        reminder.status === 'completed' ? 'text-slate-300 line-through font-medium' : 'text-[#002147]'
                      }`}>
                        {reminder.title}
                      </h4>
                      {reminder.status === 'completed' && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-md text-[8px] font-black uppercase tracking-widest border border-emerald-200">Done</span>
                      )}
                    </div>
                    <p className={`text-sm line-clamp-1 ${
                      reminder.status === 'completed' ? 'text-slate-300' : 'text-slate-500'
                    }`}>
                      {reminder.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleToggleStatus(reminder)}
                      className={`p-3 rounded-xl transition-all ${
                        reminder.status === 'completed' 
                        ? 'bg-orange-50 text-orange-500' 
                        : 'bg-emerald-50 text-emerald-500'
                      }`}
                    >
                      {reminder.status === 'completed' ? <Clock size={18} /> : <CheckCircle size={18} />}
                    </button>
                    <button 
                      onClick={() => handleOpenEdit(reminder)}
                      className="p-3 bg-blue-50 text-blue-500 rounded-xl"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(reminder._id)}
                      className="p-3 bg-rose-50 text-rose-500 rounded-xl"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Mobile Mobile Time */}
                  <div className="md:hidden flex flex-col items-end gap-1">
                    <span className="text-xs font-black text-[#002147]">{reminder.deadlineTime}</span>
                    <Bell size={12} className={reminder.status === 'completed' ? 'text-slate-300' : 'text-orange-400'} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Global Style for hiding scrollbar */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingReminder(null); }}
        maxWidth="max-w-md"
      >
        <div className="px-6 py-5">
           <ReminderForm 
            onSuccess={handleSuccess} 
            user={user} 
            reminder={editingReminder}
          />
        </div>
      </Modal>
    </div>
  );
}
