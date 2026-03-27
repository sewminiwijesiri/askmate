import { useState, useEffect } from 'react';
import { X, Flag, AlertTriangle, User, Mail, Award, BookOpen, Clock, ImageIcon } from 'lucide-react';

export default function UserProfileModal({ userId, currentUser, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportMode, setReportMode] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidencePreview, setEvidencePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/user/profile?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else {
          setError("User not found");
        }
      } catch (err) {
        setError("Error fetching profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleReport = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return;

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("reporterId", currentUser.id || currentUser.userId);
      formData.append("reportedUserId", profile._id || profile.studentId || profile.lecturerId);
      formData.append("reportedUserRole", profile.role);
      formData.append("reason", reportReason.trim());
      
      if (evidenceFile) {
        formData.append("file", evidenceFile);
      }

      const res = await fetch("/api/reports", {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        setReportSuccess(true);
        setTimeout(() => onClose(), 2000);
      } else {
        setError("Failed to submit report");
      }
    } catch (err) {
      setError("Error submitting report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name, id) => {
    if (name) return name[0].toUpperCase();
    if (id) return String(id)[0].toUpperCase();
    return "U";
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {loading ? (
          <div className="p-8 flex justify-center items-center">
            <div className="w-8 h-8 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : error && !profile ? (
          <div className="p-8 text-center text-red-500 font-bold">
            {error}
            <button onClick={onClose} className="mt-4 block w-full py-2 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-all">Close</button>
          </div>
        ) : (
          <>
            <div className="relative h-24 bg-gradient-to-r from-[#002147] to-blue-800">
              <button 
                onClick={onClose} 
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all z-10"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="px-6 pb-6 relative pt-12">
              <div className="absolute -top-12 left-6 w-24 h-24 rounded-2xl bg-white p-1.5 shadow-lg">
                <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-3xl font-black text-[#002147]">
                  {getInitials(profile.name, profile.studentId || profile.lecturerId)}
                </div>
              </div>

              {!reportMode ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="flex justify-between items-start pt-2">
                    <div>
                      <h2 className="text-xl font-bold text-[#002147]">
                        {profile.name || profile.studentId || profile.lecturerId}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                           <User size={12}/> {profile.role || "User"}
                        </span>
                      </div>
                    </div>
                    {String(profile._id) !== String(currentUser.id) && String(profile.studentId) !== String(currentUser.userId) && (
                      <button 
                        onClick={() => setReportMode(true)}
                        className="p-2.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl shadow-sm border border-red-100 transition-all font-bold text-xs flex items-center gap-1.5"
                      >
                        <Flag size={14}/> Report
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-6">
                    {profile.email && (
                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="p-2 bg-white rounded-xl shadow-sm text-blue-500"><Mail size={16}/></div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</p>
                          <p className="text-sm font-bold text-slate-700">{profile.email}</p>
                        </div>
                      </div>
                    )}
                    
                    {profile.role === 'student' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="p-2 bg-white rounded-xl shadow-sm text-emerald-500"><BookOpen size={16}/></div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Year</p>
                            <p className="text-sm font-bold text-slate-700">{profile.year || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                          <div className="p-2 bg-white rounded-xl shadow-sm text-orange-500"><Clock size={16}/></div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Semester</p>
                            <p className="text-sm font-bold text-slate-700">{profile.semester || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {(profile.role === 'lecturer' || profile.role === 'helper') && (
                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50 border border-amber-100">
                        <div className="p-2 bg-white rounded-xl shadow-sm text-amber-500"><Award size={16}/></div>
                        <div>
                          <p className="text-[10px] font-bold text-amber-600/70 uppercase tracking-widest">Reputation</p>
                          <p className="text-sm font-black text-amber-700">{profile.reputation || 0} Points</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-4 pt-4">
                  <div className="flex items-center gap-2 text-red-600 mb-2">
                    <AlertTriangle size={20} />
                    <h3 className="font-bold">Report User</h3>
                  </div>
                  
                  {reportSuccess ? (
                    <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl font-bold text-sm text-center border border-emerald-100">
                      Report submitted successfully. Thank you.
                    </div>
                  ) : (
                    <form onSubmit={handleReport} className="space-y-4">
                      <p className="text-sm text-slate-600 font-medium">
                        Why are you reporting <span className="font-bold text-[#002147]">{profile.name || profile.studentId || profile.lecturerId}</span>?
                      </p>
                      
                      <textarea
                        required
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        placeholder="Please provide specifics about the abusive or inappropriate behavior..."
                        className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-red-400 resize-none transition-all"
                      />
                      
                      <div className="flex flex-col gap-2 border border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                        <span className="text-xs font-bold text-slate-500">Provide Evidence (Optional)</span>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-50 transition-all shadow-sm">
                            <ImageIcon size={14} className="text-blue-500" />
                            {evidenceFile ? 'Change Image' : 'Upload Image'}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setEvidenceFile(file);
                                  setEvidencePreview(URL.createObjectURL(file));
                                }
                              }}
                            />
                          </label>
                          {evidencePreview && (
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200">
                              <img src={evidencePreview} alt="Preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => { setEvidenceFile(null); setEvidencePreview(null); }}
                                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px]"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          )}
                          <span className="text-[10px] text-slate-400 ml-auto leading-tight text-right w-20">JPG, PNG<br/>up to 5MB</span>
                        </div>
                      </div>

                      {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
                      
                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setReportMode(false)}
                          className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting || !reportReason.trim()}
                          className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-red-500/20"
                        >
                          {isSubmitting ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          ) : "Submit Report"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
