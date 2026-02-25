"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Calendar, 
  BookOpen, 
  Save, 
  Trash2, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Lock,
  UserCircle
} from "lucide-react";

export default function ProfileSection({ user, onUpdate, onDelete }) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    year: "",
    semester: "",
    graduationYear: "",
    skills: "",
    password: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/user/profile", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setProfileData(data.user);
        setFormData({
          name: data.user.name || "",
          email: data.user.email || "",
          year: data.user.year || "",
          semester: data.user.semester || "",
          graduationYear: data.user.graduationYear || "",
          skills: data.user.skills ? data.user.skills.join(", ") : "",
          password: "", // Don't populate password
        });
      } else {
        setError(data.message || "Failed to fetch profile");
      }
    } catch (err) {
      setError("An error occurred while fetching profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      
      // Prepare data for update (clean up skills if helper)
      const dataToSubmit = { ...formData };
      if (user.role === 'helper' && dataToSubmit.skills) {
        dataToSubmit.skills = dataToSubmit.skills.split(",").map(s => s.trim());
      }
      if (!dataToSubmit.password) delete dataToSubmit.password;

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(dataToSubmit)
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("Profile updated successfully!");
        setProfileData(data.user);
        
        // Update localStorage user data
        const updatedLocalUser = { ...user, ...data.user };
        localStorage.setItem("user", JSON.stringify(updatedLocalUser));
        
        if (onUpdate) onUpdate(updatedLocalUser);
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (err) {
      setError("An error occurred while updating profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/user/profile", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        if (onDelete) onDelete();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete account");
      }
    } catch (err) {
      setError("An error occurred while deleting account");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-[#FF9F1C] animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#002147]">Profile Settings</h2>
          <p className="text-slate-500">Manage your account information and preferences</p>
        </div>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-2 px-4 py-2 text-rose-600 border border-rose-100 bg-rose-50/50 hover:bg-rose-50 rounded-xl font-bold text-sm transition-all"
        >
          <Trash2 size={16} />
          Delete Account
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in shake duration-300">
          <XCircle size={20} />
          <p className="font-bold text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={20} />
          <p className="font-bold text-sm">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="h-24 bg-gradient-to-r from-[#002147] to-[#4DA8DA]"></div>
            <div className="px-6 pb-6 -mt-12 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white border-4 border-white shadow-xl mb-4 overflow-hidden">
                <div className="w-full h-full bg-blue-50 text-[#002147] flex items-center justify-center">
                  <UserCircle size={48} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#002147] mb-1">
                {profileData.name || profileData.studentId || profileData.lecturerId || profileData.username}
              </h3>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-4">
                {profileData.role || user.role}
              </p>
              
              <div className="space-y-3 pt-4 border-t border-slate-50 text-left">
                <div className="flex items-center gap-3 text-slate-500">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                    <Mail size={14} />
                  </div>
                  <span className="text-sm font-medium truncate">{profileData.email}</span>
                </div>
                {profileData.year && (
                  <div className="flex items-center gap-3 text-slate-500">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                      <Calendar size={14} />
                    </div>
                    <span className="text-sm font-medium">Year {profileData.year}, Semester {profileData.semester}</span>
                  </div>
                )}
                {profileData.studentId && (
                  <div className="flex items-center gap-3 text-slate-500">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                      <BookOpen size={14} />
                    </div>
                    <span className="text-sm font-medium">ID: {profileData.studentId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(user.role === 'helper' || user.role === 'admin') && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4DA8DA]/20 focus:border-[#4DA8DA] transition-all text-sm font-medium"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full pl-12 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-sm font-medium cursor-not-allowed"
                    />
                  </div>
                </div>

                {user.role === 'student' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Academic Year</label>
                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium appearance-none"
                      >
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Semester</label>
                      <select
                        name="semester"
                        value={formData.semester}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium appearance-none"
                      >
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                      </select>
                    </div>
                  </>
                )}

                {user.role === 'helper' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Graduation Year</label>
                      <input
                        type="number"
                        name="graduationYear"
                        value={formData.graduationYear}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4DA8DA]/20 focus:border-[#4DA8DA] transition-all text-sm font-medium"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Skills (Comma separated)</label>
                      <input
                        type="text"
                        name="skills"
                        value={formData.skills}
                        onChange={handleInputChange}
                        placeholder="JavaScript, Python, React..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4DA8DA]/20 focus:border-[#4DA8DA] transition-all text-sm font-medium"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">New Password (Optional)</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4DA8DA]/20 focus:border-[#4DA8DA] transition-all text-sm font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 flex justify-end">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex items-center gap-2 px-8 py-3 bg-[#002147] hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                  {updating ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#002147]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300 text-center">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-[#002147] mb-2">Delete Account?</h3>
            <p className="text-slate-500 mb-8">
              This action is permanent and cannot be undone. All your data will be removed from ASKmate.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-rose-500/20 shadow-xl"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
