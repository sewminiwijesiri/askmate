"use client";

import { useState, useEffect } from "react";
import { 
  Bell, 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  CalendarDays,
  MoreVertical,
  CheckCircle
} from "lucide-react";
import ReminderForm from "./ReminderForm";
import Modal from "../Modal";

export default function RemindersSection({ user }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleSuccess = (newReminder) => {
    setReminders([newReminder, ...reminders]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#002147]">Reminders</h2>
          <p className="text-slate-500 text-sm mt-1">Keep track of your academic deadlines.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#002147] text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-md active:scale-95"
        >
          <Plus size={18} />
          Add Reminder
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm min-h-[400px]">
          <Loader2 size={40} className="text-blue-200 animate-spin mb-4" />
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Loading Reminders...</p>
        </div>
      ) : reminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100 text-center min-h-[400px]">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
            <Bell size={40} />
          </div>
          <h3 className="text-xl font-bold text-[#002147] mb-2">No reminders yet</h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8">
            Start by adding a reminder for your upcoming assignments, exams, or study sessions.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-[#FF9F1C] text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-all shadow-md active:scale-95"
          >
            Create Your First Reminder
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {reminders.map((reminder) => (
            <div 
              key={reminder._id} 
              className={`group p-6 rounded-[2.5rem] border bg-white transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/5 relative overflow-hidden ${
                reminder.status === 'completed' ? 'border-emerald-100 bg-emerald-50/10' : 'border-slate-100 hover:border-blue-200'
              }`}
            >
              {/* Status Indicator */}
              <div className={`absolute top-0 left-0 w-1.5 h-full ${
                reminder.status === 'completed' ? 'bg-emerald-400' : 'bg-orange-400 group-hover:bg-blue-500'
              }`} />

              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                  reminder.status === 'completed' ? 'bg-emerald-50 text-emerald-500' : 'bg-orange-50 text-orange-400'
                }`}>
                  {reminder.status === 'completed' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleToggleStatus(reminder)}
                    className={`p-2 rounded-xl border transition-all ${
                      reminder.status === 'completed' 
                      ? 'bg-orange-50 text-orange-500 border-orange-100 hover:border-orange-200' 
                      : 'bg-emerald-50 text-emerald-500 border-emerald-100 hover:border-emerald-200'
                    }`}
                    title={reminder.status === 'completed' ? "Mark as Pending" : "Mark as Completed"}
                  >
                    {reminder.status === 'completed' ? <Clock size={16} /> : <CheckCircle size={16} />}
                  </button>
                  <button 
                    onClick={() => handleDelete(reminder._id)}
                    className="p-2 bg-rose-50 text-rose-500 rounded-xl border border-rose-100 hover:border-rose-200 transition-all"
                    title="Delete Reminder"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h4 className={`text-xl font-black leading-tight tracking-tight ${
                    reminder.status === 'completed' ? 'text-slate-400 line-through' : 'text-[#002147]'
                  }`}>
                    {reminder.title}
                  </h4>
                </div>
                <p className={`text-[13px] font-medium leading-relaxed line-clamp-2 ${
                  reminder.status === 'completed' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {reminder.description}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar size={14} />
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      {new Date(reminder.deadlineDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock size={14} />
                    <span className="text-[11px] font-bold uppercase tracking-wider">{reminder.deadlineTime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 w-fit">
                  <Bell size={12} className={reminder.notificationSent ? "text-emerald-500" : "text-orange-400"} />
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                    {reminder.notificationTime}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ReminderForm 
          onSuccess={handleSuccess} 
          user={user} 
        />
      </Modal>
    </div>
  );
}
