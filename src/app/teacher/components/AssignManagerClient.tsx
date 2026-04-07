'use client';

import { useState, useEffect } from 'react';
import { useDashboard } from '@/components/layout/DashboardContext';
import { getAssignedAssessments, createAssessment, deleteAssessment, editAssessment } from '@/app/actions/assessment';
import { 
  Upload, 
  Trash2, 
  Edit, 
  FileText, 
  AlertCircle, 
  Loader2, 
  Plus, 
  ChevronRight, 
  Calendar, 
  Clock, 
  CheckCircle2,
  X
} from 'lucide-react';
import DocumentViewer from '@/components/ui/DocumentViewer';

type AssignManagerProps = {
  title: string;
  type: string;
};

export default function AssignManagerClient({ title, type }: AssignManagerProps) {
  const { selectedModuleId } = useDashboard();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [viewFileUrl, setViewFileUrl] = useState<string | null>(null);
  
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  useEffect(() => {
    if (selectedModuleId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [selectedModuleId]);

  // Error Timeout
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const loadData = async () => {
    if (!selectedModuleId) return;
    setLoading(true);
    const res = await getAssignedAssessments(Number(selectedModuleId), type);
    if (res.success) setItems(res.assessments || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedModuleId) return;
    
    const formData = new FormData(e.currentTarget);
    formData.append('moduleId', String(selectedModuleId));
    formData.append('type', type);
    formData.append('isAssigned', 'true');

    if (!editingId && !pendingFile) {
      setErrorMsg(`Please upload ${type.toLowerCase()} file.`);
      return;
    }

    if (pendingFile) {
      formData.append('fileData', pendingFile);
      formData.append('fileName', pendingFile.name);
    }

    setSubmitting(true);
    setErrorMsg('');

    let res;
    if (editingId) {
      formData.append('assessmentId', String(editingId));
      res = await editAssessment(formData);
    } else {
      res = await createAssessment(formData);
    }

    if (res?.success) {
      setShowModal(false);
      setEditingId(null);
      setPendingFile(null);
      loadData();
    } else {
      setErrorMsg(res?.error || 'Server error');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    const res = await deleteAssessment(id, type);
    if (res.success) {
      setDeleteConfirmId(null);
      loadData();
    }
  };

  const editingItem = editingId ? items.find(i => i.id === editingId) : null;

  if (!selectedModuleId) {
    return <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">Please select a course.</div>;
  }

  return (
    <div className="p-8 animate-in fade-in duration-500 space-y-10">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-[#071a4a] p-10 rounded-[40px] shadow-2xl shadow-blue-900/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-blue-400/20 transition-all duration-700"></div>
        <div className="relative z-10 flex items-center gap-5">
           <div className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl flex items-center justify-center shadow-lg">
             <FileText className="w-8 h-8 text-white" />
           </div>
           <div>
             <h2 className="text-3xl font-black text-white tracking-tight">Assign {title}</h2>
             <p className="text-blue-200/80 text-sm font-bold uppercase tracking-[4px] mt-1">Student Management</p>
           </div>
        </div>
        <button 
          onClick={() => { setEditingId(null); setShowModal(true); }}
          className="relative z-10 group flex items-center gap-3 bg-white text-[#071a4a] px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          Assign New {title}
        </button>
      </div>

      {/* Modern List View */}
      <div className="grid gap-6">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-900" /></div>
        ) : items.length === 0 ? (
          <div className="py-32 text-center text-gray-300 font-black uppercase tracking-widest text-sm bg-gray-50 rounded-[40px] border-4 border-dashed border-gray-100">
            No {title}s assigned yet.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="group flex flex-col md:flex-row md:items-center gap-8 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-500">
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></span>
                  <h3 className="text-xl font-black text-[#071a4a] tracking-tight">{item.title}</h3>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex items-center gap-3 text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-bold uppercase tracking-widest">{item.marks} Marks</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-black">{new Date(item.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <Clock className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-black">{item.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <FileText className="w-4 h-4 text-orange-400" />
                    <span className="text-[10px] font-black uppercase overflow-hidden truncate max-w-[120px]">{item.fileName}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pr-2">
                <button 
                  onClick={() => setViewFileUrl(item.fileUrl)}
                  className="flex items-center gap-2 bg-[#071a4a]/5 text-[#071a4a] px-6 py-3 rounded-2xl font-black text-xs hover:bg-[#071a4a] hover:text-white transition-all shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" /> View
                </button>
                <div className="w-[1px] h-8 bg-gray-100 mx-2"></div>
                <button 
                  onClick={() => { setEditingId(item.id); setShowModal(true); }}
                  className="p-4 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all shadow-sm"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setDeleteConfirmId(item.id)}
                  className="p-4 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-[2px] animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-in zoom-in-95 duration-300">
            
            {/* Modal Header */}
            <div className="px-10 py-6 border-b border-gray-100 flex items-center justify-between bg-white relative">
              <button 
                onClick={() => { setShowModal(false); setEditingId(null); }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-800 border border-gray-100 shadow-sm">
                   <Plus className="w-5 h-5 text-[#071a4a]" />
                </div>
                <h3 className="text-[15px] font-black text-gray-800 tracking-tight flex items-center gap-2 uppercase">
                  {editingId ? `Update Assigned ${title}` : `Assign New ${title}`}
                </h3>
              </div>

              <button 
                form="assign-form" 
                type="submit" 
                disabled={submitting}
                className="bg-[#071a4a] text-white px-8 py-3 rounded-2xl text-[13px] font-black shadow-xl shadow-[#071a4a]/20 hover:bg-[#051133] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Assigning...</span>
                  </div>
                ) : (editingId ? 'Update' : 'Assign')}
              </button>
            </div>

            <div className="p-10 bg-white overflow-y-auto max-h-[85vh] custom-scrollbar">
              {errorMsg && (
                <div className="mb-8 p-4 text-xs bg-red-50 text-red-700 border border-red-100 rounded-2xl font-bold flex items-center gap-3 animate-in shake duration-500">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" /> {errorMsg}
                </div>
              )}

              <form id="assign-form" onSubmit={handleSubmit} className="space-y-10">
                
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-gray-400 block uppercase tracking-[2px]">Task Title</label>
                      <input 
                        name="title"
                        required
                        placeholder="e.g. Weekly Assignment 1"
                        defaultValue={editingItem?.title || ''}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-gray-400 block uppercase tracking-[2px]">Total Marks</label>
                      <input 
                        name="marks"
                        type="number"
                        step="0.01"
                        required
                        placeholder="10.00"
                        defaultValue={editingItem?.marks || '10'}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm text-center"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-gray-400 block uppercase tracking-[2px]">Start Date</label>
                      <input 
                        name="startDate"
                        type="date"
                        required
                        defaultValue={editingItem?.startDate || ''}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-gray-400 block uppercase tracking-[2px]">End Date</label>
                      <input 
                        name="endDate"
                        type="date"
                        required
                        defaultValue={editingItem?.endDate || ''}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-3 col-span-2 md:col-span-1">
                      <label className="text-[11px] font-black text-gray-400 block uppercase tracking-[2px]">Submission Time</label>
                      <input 
                        name="time"
                        type="time"
                        required
                        defaultValue={editingItem?.time || ''}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-50">
                   <label className="text-[11px] font-black text-gray-400 block uppercase tracking-[3px]">Submission Document</label>
                   <input id="assign-file-upload" type="file" className="hidden" accept=".pdf" onChange={(e) => setPendingFile(e.target.files?.[0] || null)} />
                   <button type="button" onClick={() => document.getElementById('assign-file-upload')?.click()} className="w-full py-10 border-2 border-dashed border-gray-100 rounded-[32px] bg-gray-50/50 hover:bg-white hover:border-blue-300 hover:shadow-xl transition-all flex flex-col items-center justify-center gap-4 group">
                      <div className={`w-16 h-16 rounded-[24px] shadow-lg flex items-center justify-center transition-all group-hover:scale-110 ${pendingFile ? 'bg-green-500 text-white' : 'bg-white text-[#071a4a]'}`}>
                        {pendingFile ? <CheckCircle2 className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                      </div>
                      <div className="text-center">
                        <p className={`text-sm font-black tracking-tight ${pendingFile ? 'text-green-600' : 'text-gray-700'}`}>
                          {pendingFile ? pendingFile.name : `Drop or Upload ${title} Question Paper`}
                        </p>
                        {!pendingFile && <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">PDF Only • Maximum 15MB</p>}
                      </div>
                   </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modern Popover Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#071a4a]/60 backdrop-blur-md animate-in fade-in" onClick={() => setDeleteConfirmId(null)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-[40px] p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-gray-100 animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
             <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[32px] flex items-center justify-center mb-8 shadow-xl shadow-red-100/30">
                <AlertCircle className="w-12 h-12" />
             </div>
             <h3 className="text-2xl font-black text-gray-900 mb-2">Delete {title}?</h3>
             <p className="text-gray-500 text-sm font-bold mb-10 leading-relaxed px-4">This action is irreversible and the task will be removed for all students.</p>
             <div className="flex gap-4 w-full">
                <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-4 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-400 text-xs font-black transition-all">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirmId)} className="flex-1 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-xl shadow-red-600/30 transition-all">Confirm Delete</button>
             </div>
          </div>
        </div>
      )}

      {/* File Viewer */}
      {viewFileUrl && <DocumentViewer url={viewFileUrl} onClose={() => setViewFileUrl(null)} />}

    </div>
  );
}
