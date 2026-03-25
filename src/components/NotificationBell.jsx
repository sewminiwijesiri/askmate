"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Clock, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const lastFetchedRef = useRef([]);

  const fetchNotifications = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("/api/notifications", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();
      
      if (res.ok && result.data) {
        const newNotifications = result.data.notifications;
        
        // If silent polling, check if there's a NEW unread notification
        if (silent && newNotifications.length > 0) {
            const latest = newNotifications[0];
            const isTrulyNew = !lastFetchedRef.current.some(n => n._id === latest._id);
            if (isTrulyNew && !latest.isRead) {
                 toast.success(`${latest.title}: ${latest.message}`, {
                    icon: '🔔',
                    duration: 4000,
                    style: {
                      borderRadius: '16px',
                      background: '#002147',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: '700'
                    }
                 });
            }
        }
        
        setNotifications(newNotifications);
        setUnreadCount(result.data.unreadCount);
        lastFetchedRef.current = newNotifications;
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => fetchNotifications(true), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/notifications/read-all`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n._id !== id));
        // If it was unread, decrement the count
        const deletedNotify = notifications.find(n => n._id === id);
        if (deletedNotify && !deletedNotify.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        toast.success("Notification deleted", {
          duration: 2000,
          style: { borderRadius: '12px', background: '#002147', color: '#fff', fontSize: '11px' }
        });
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  return (
    <div className="relative">
      <Toaster position="top-right" />
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all shadow-sm active:scale-95 transition-transform"
      >
        <Bell size={20} className={unreadCount > 0 ? "animate-pulse" : ""} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white font-black px-1 shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/5 md:bg-transparent" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3 w-80 max-h-[480px] bg-white rounded-3xl border border-slate-100 shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 ring-1 ring-[#002147]/5">
            <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-[11px] font-black text-[#002147] uppercase tracking-widest pl-1">Inbox</h3>
              {unreadCount > 0 && (
                <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                  {unreadCount} New Alerts
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto max-h-[350px] scrollbar-hide py-2">
              {notifications.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-3">
                    <Bell size={24} />
                  </div>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n._id}
                    onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                    className={`px-5 py-4 cursor-pointer transition-all border-b border-slate-50/50 last:border-0 ${
                      n.isRead ? 'opacity-50 grayscale-[0.3]' : 'bg-blue-50/20 hover:bg-blue-50/40'
                    }`}
                  >
                    <div className="flex gap-4 group/item relative">
                      <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                        n.isRead ? 'bg-slate-100 text-slate-400' : 'bg-white text-blue-500'
                      }`}>
                        {n.title.toLowerCase().includes('reminder') ? <Clock size={16} /> : <CheckCircle2 size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5 gap-2">
                          <p className={`text-[13px] leading-tight flex-1 ${n.isRead ? 'font-bold text-slate-500' : 'font-black text-[#002147]'}`}>
                           {n.title}
                          </p>
                          <div className="flex items-center gap-2">
                            {!n.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 animate-pulse" />}
                            <button 
                              onClick={(e) => handleDelete(e, n._id)}
                              className="opacity-0 group-hover/item:opacity-100 p-1.5 hover:bg-rose-50 hover:text-rose-500 rounded-lg transition-all text-slate-300"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                        <p className={`text-[12px] line-clamp-2 leading-relaxed ${n.isRead ? 'text-slate-400 font-medium' : 'text-slate-500 font-semibold'}`}>
                          {n.message}
                        </p>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-2 bg-slate-50 w-fit px-1.5 py-0.5 rounded">
                           {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <button 
                onClick={handleMarkAllAsRead}
                className="p-3.5 bg-slate-50/50 border-t border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-500 transition-colors w-full"
            >
              Mark all as read
            </button>
          </div>
        </>
      )}
    </div>
  );
}
