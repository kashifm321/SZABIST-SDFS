'use client';

import { useState, useEffect } from 'react';
import { useDashboard } from '@/components/layout/DashboardContext';
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '@/app/actions/announcement';
import { 
  Megaphone, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  AlertCircle,
  X,
  CheckCircle2,
  Calendar,
  MessageSquare,
  ArrowRight,
  Send
} from 'lucide-react';

export default function AnnouncementPage() {
  const { selectedModuleId, setHeaderExtra } = useDashboard();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if (selectedModuleId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [selectedModuleId]);

  const loadData = async () => {
    if (!selectedModuleId) return;
    setLoading(true);
    const res = await getAnnouncements(Number(selectedModuleId));
    if (res.success) setAnnouncements(res.announcements || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedModuleId) return;
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    const formData = new FormData(e.currentTarget);
    formData.append('moduleId', String(selectedModuleId));
    
    let res;
    if (editingId) {
      formData.append('id', String(editingId));
      res = await updateAnnouncement(formData);
    } else {
      res = await createAnnouncement(formData);
    }

    if (res.success) {
      setSuccessMsg(editingId ? 'Announcement updated!' : 'Announcement created!');
      setEditingId(null);
      (e.target as HTMLFormElement).reset();
      loadData();
    } else {
      setErrorMsg(res.error || 'Operation failed');
    }
    setSubmitting(false);
  };

  if (!selectedModuleId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 text-gray-500 font-medium space-y-4">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-2">
           <Megaphone className="w-8 h-8 opacity-20" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">No Course Selected</h2>
        <p className="max-w-xs text-sm">Please select a course to manage and broadcast announcements.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      
      {/* Premium Headerpattern */}
      <div className="bg-[#071a4a] p-12 rounded-[48px] shadow-2xl shadow-blue-900/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/10 rounded-full -mr-40 -mt-40 blur-3xl group-hover:bg-blue-400/20 transition-all duration-700"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
           <div className="flex items-center gap-6">
             <div className="w-24 h-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] flex items-center justify-center shadow-lg">
               <Megaphone className="w-12 h-12 text-white" />
             </div>
             <div>
               <h2 className="text-4xl font-black text-white tracking-tight leading-tight">Broadcast <span className="text-blue-400">Hub</span></h2>
               <p className="text-blue-100/60 text-[10px] font-black uppercase tracking-[4px] mt-2">Instant Academic Announcements</p>
             </div>
           </div>
           
           <div className="flex bg-white/5 p-4 rounded-3xl backdrop-blur-md border border-white/10 gap-6">
              <div className="text-center px-4">
                 <p className="text-2xl font-black text-white">{announcements.length}</p>
                 <p className="text-[9px] font-black uppercase tracking-widest text-blue-300">Active Items</p>
              </div>
              <div className="w-[1px] bg-white/10"></div>
              <div className="text-center px-4">
                 <p className="text-2xl font-black text-white">{announcements.filter(a => new Date(a.createdAt).toDateString() === new Date().toDateString()).length}</p>
                 <p className="text-[9px] font-black uppercase tracking-widest text-blue-300">Posted Today</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        
        {/* Post Announcement Form Card */}
        <div className="xl:col-span-4">
          <div className="bg-white border border-gray-100 rounded-[48px] shadow-xl shadow-gray-200/40 overflow-hidden sticky top-8">
            <div className="bg-gray-50/80 px-10 py-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xs font-black text-[#071a4a] tracking-widest uppercase italic">
                {editingId ? 'Configure Item' : 'Post New Broadcast'}
              </h3>
              {editingId && (
                <button onClick={() => setEditingId(null)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="p-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[4px] ml-1">Title</label>
                  <input 
                    name="title"
                    defaultValue={announcements.find(a => a.id === editingId)?.title || ''}
                    required
                    placeholder="Urgent: Class Schedule..."
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#071a4a] outline-none focus:ring-2 focus:ring-blue-400/20 focus:bg-white focus:border-blue-400 transition-all shadow-inner"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[4px] ml-1">Content</label>
                  <textarea 
                    name="content"
                    defaultValue={announcements.find(a => a.id === editingId)?.content || ''}
                    required
                    rows={6}
                    placeholder="Describe your announcement in detail..."
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#071a4a] outline-none focus:ring-2 focus:ring-blue-400/20 focus:bg-white focus:border-blue-400 transition-all shadow-inner resize-none"
                  />
                </div>

                {(errorMsg || successMsg) && (
                  <div className={`p-5 rounded-2xl text-xs font-black flex items-center gap-4 animate-in slide-in-from-top-2 border ${
                    errorMsg ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
                  }`}>
                    {errorMsg ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                    <span className="leading-tight">{errorMsg || successMsg}</span>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-[#071a4a] hover:bg-[#051133] text-white py-5 rounded-[24px] text-sm font-black shadow-2xl shadow-blue-900/30 transition-all active:scale-95 disabled:grayscale flex items-center justify-center gap-3 group"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                  {editingId ? 'Update Message' : 'Publish Broadcast'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Announcements List Container */}
        <div className="xl:col-span-8 space-y-8">
          <div className="flex items-center justify-between px-4">
             <h3 className="text-xl font-black text-[#071a4a] tracking-tight italic">Broadcast Feed</h3>
             <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-1.5 rounded-full">
                <Calendar className="w-3 h-3" /> Latest Activity
             </div>
          </div>

          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center bg-gray-50/50 rounded-[48px] border-2 border-dashed border-gray-100">
               <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4 opacity-40" />
               <p className="text-gray-400 text-xs font-black uppercase tracking-[4px]">Syncing Cloud Feed</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center bg-gray-50/50 rounded-[48px] border-2 border-dashed border-gray-100 space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                 <MessageSquare className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-400 text-xs font-black uppercase tracking-[4px]">Feed is currently empty</p>
            </div>
          ) : (
            <div className="grid gap-8">
              {announcements.map((ann) => (
                <div key={ann.id} className="bg-white border border-gray-100 p-10 rounded-[48px] shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group flex flex-col md:flex-row items-start gap-8 relative overflow-hidden">
                  {/* Category Accent */}
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                     <Megaphone className="w-32 h-32 -rotate-12" />
                  </div>

                  <div className="w-16 h-16 bg-gray-50 rounded-[28px] flex items-center justify-center text-[#071a4a] shadow-sm border border-gray-100 shrink-0 group-hover:bg-[#071a4a] group-hover:text-white transition-all group-hover:scale-110">
                     <MessageSquare className="w-6 h-6" />
                  </div>

                  <div className="space-y-4 flex-1 relative z-10">
                    <div className="flex items-center gap-4">
                       <h4 className="text-2xl font-black text-[#071a4a] tracking-tight leading-none">{ann.title}</h4>
                       <span className="h-[1px] flex-1 bg-gray-100"></span>
                    </div>
                    <p className="text-gray-500 leading-relaxed text-sm font-medium pr-8 whitespace-pre-wrap">{ann.content}</p>
                    
                    <div className="flex items-center justify-between pt-6">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 border border-blue-100">
                             <Calendar className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {new Date(ann.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </span>
                       </div>
                       
                       <div className="flex gap-2">
                          <button 
                            onClick={() => { setEditingId(ann.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="w-10 h-10 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all shadow-sm flex items-center justify-center border border-transparent hover:border-blue-100"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setDeleteId(ann.id)}
                            className="w-10 h-10 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all shadow-sm flex items-center justify-center border border-transparent hover:border-red-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="pt-20 flex flex-col items-center justify-center gap-4">
        <div className="h-[1px] w-24 bg-gray-200"></div>
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[12px] text-center pl-[12px]">
          SZABIST CLOUD PORTAL
        </p>
      </div>

      {/* Modern Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#071a4a]/60 backdrop-blur-md animate-in fade-in" onClick={() => setDeleteId(null)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-[48px] p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-gray-100 animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
             <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[32px] flex items-center justify-center mb-8 shadow-xl shadow-red-100/30">
                <AlertCircle className="w-12 h-12" />
             </div>
             <h3 className="text-2xl font-black text-gray-900 mb-2">Delete Message?</h3>
             <p className="text-gray-500 text-sm font-bold mb-10 leading-relaxed px-4 text-center">This broadcast will be permanently erased from all student feeds.</p>
             <div className="flex gap-4 w-full">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-4 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-400 text-xs font-black transition-all">Cancel</button>
                <button 
                  onClick={async () => { await deleteAnnouncement(deleteId); setDeleteId(null); loadData(); }} 
                  className="flex-1 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2"
                >
                   Delete
                </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
