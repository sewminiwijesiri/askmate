import { useState, useEffect } from "react";
import { Flag, ExternalLink, Trash2, CheckCircle, ShieldAlert, ImageIcon } from "lucide-react";

export default function UserReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/admin/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) fetchReports();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const deleteReport = async (id) => {
    if (!confirm("Are you sure you want to dismiss and delete this report?")) return;
    try {
      const res = await fetch(`/api/admin/reports?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchReports();
    } catch (error) {
      console.error("Failed to delete report:", error);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[500px]">
      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );

  const groupedReports = Object.values(reports.reduce((acc, report) => {
    const key = report.reportedUserId;
    if (!acc[key]) {
      acc[key] = {
        reportedUserId: report.reportedUserId,
        reportedUserName: report.reportedUserName,
        reportedUserRole: report.reportedUserRole,
        reports: []
      };
    }
    acc[key].reports.push(report);
    return acc;
  }, {}));

  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shadow-sm">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#002147] leading-tight">User Reports & Moderation</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Review and action user-submitted community reports.</p>
          </div>
        </div>
        
        <div className="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
           <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">Total Reports</p>
           <p className="text-lg font-black text-[#002147]">{reports.length}</p>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
          <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center mb-6 border border-slate-100 animate-bounce cursor-pointer">
             <Flag className="text-emerald-500" size={32} />
          </div>
          <h3 className="text-xl font-black text-[#002147]">No Reports Found</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-sm">Hooray! The community is currently peaceful and there are no active moderation reports.</p>
        </div>
      ) : (
        <div className="grid gap-12">
          {groupedReports.map(group => (
            <div key={group.reportedUserId} className="bg-slate-50/50 border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-lg transition-all">
               <div className="bg-gradient-to-r from-red-50 to-white p-8 border-b border-red-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-red-600 text-xl font-black shadow-sm border border-red-100 uppercase">
                      {(group.reportedUserName || group.reportedUserId)[0]}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-red-400 tracking-widest uppercase mb-1 flex items-center gap-2">
                        <Flag size={10} /> Reported Member
                      </p>
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-black text-red-950 leading-none">{group.reportedUserName || group.reportedUserId}</h3>
                        <span className="px-2.5 py-1 text-[9px] bg-red-100 text-red-700 rounded-lg uppercase tracking-wider font-bold shadow-sm">{group.reportedUserRole || "Unknown Role"}</span>
                      </div>
                    </div>
                 </div>
                 <div className="px-6 py-3 bg-white border border-red-100 rounded-2xl shadow-sm flex flex-col items-center justify-center min-w-[120px]">
                    <span className="text-2xl font-black text-red-600 leading-none">{group.reports.length}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Reports</span>
                 </div>
               </div>
               
               <div className="p-8 grid gap-8 bg-slate-50/30">
                 {group.reports.map((report, index) => (
                    <div key={report._id} className="relative p-6 bg-white border border-slate-200 rounded-3xl hover:border-indigo-200 transition-all shadow-sm flex flex-col xl:flex-row gap-8 items-start group/card">
                      
                      <div className="flex-1 space-y-5 w-full">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                          <div className="flex items-center gap-3">
                            <span className={`px-4 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-xl border-2 flex items-center gap-1.5 shadow-sm ${
                              report.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              report.status === 'Reviewed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {report.status === 'Pending' && <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                              {report.status.replace('_', ' ')}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-bold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">{new Date(report.createdAt).toLocaleString()}</span>
                        </div>

                        <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-100 rounded-full blur-2xl -mr-4 -mt-4 opacity-70"></div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 relative z-10">Filed By</p>
                          <p className="text-sm font-bold text-slate-800 break-all relative z-10">{report.reporterName || report.reporterId}</p>
                        </div>

                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                             <Flag size={12} className="text-red-400" /> Alleged Violation & Context
                          </p>
                          <p className="text-sm text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">{report.reason}</p>
                        </div>
                      </div>

                      <div className="w-full xl:w-72 flex flex-col gap-5">
                         {report.evidence && (
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                  <ImageIcon size={14} className="text-indigo-400" /> Uploaded Evidence
                               </p>
                               <a href={report.evidence} target="_blank" rel="noreferrer" className="block relative rounded-xl overflow-hidden border border-slate-200 group/img cursor-pointer bg-slate-900 ring-4 ring-transparent hover:ring-indigo-100 transition-all shadow-md">
                                  <img src={report.evidence} alt="Evidence" className="w-full h-36 object-cover opacity-90 group-hover/img:opacity-40 transition-all duration-500 group-hover/img:scale-110" />
                                  <div className="absolute inset-0 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                     <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 text-white shadow-lg">
                                        <ExternalLink size={20} />
                                     </div>
                                     <span className="text-[10px] font-black text-white tracking-widest uppercase">Inspect Picture</span>
                                  </div>
                               </a>
                            </div>
                         )}
                         
                         <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col gap-2 shadow-sm relative overflow-hidden">
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-slate-200 rounded-full blur-3xl -mr-10 -mb-10 opacity-50"></div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Resolution Console</p>
                            
                            {report.status !== 'Reviewed' && (
                               <button onClick={() => updateStatus(report._id, 'Reviewed')} className="w-full relative z-10 py-3 bg-white text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-slate-200 hover:border-indigo-600 shadow-sm active:scale-95">
                                  <CheckCircle size={14}/> Mark as Investigated
                               </button>
                            )}
                            
                            {report.status !== 'Action_Taken' && (
                               <button onClick={() => updateStatus(report._id, 'Action_Taken')} className="w-full relative z-10 py-3 bg-white text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-slate-200 hover:border-emerald-600 shadow-sm mt-1 active:scale-95">
                                  <ShieldAlert size={14}/> Action Enforced
                               </button>
                            )}
                            
                            <button onClick={() => deleteReport(report._id)} className="w-full relative z-10 py-3 bg-white text-rose-500 rounded-xl text-xs font-bold hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all flex items-center justify-center gap-2 shadow-sm mt-2 active:scale-95">
                               <Trash2 size={14}/> Dismiss Report
                            </button>
                         </div>
                      </div>

                    </div>
                 ))}
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
