'use client';

import { useState, useEffect } from 'react';
import { useDashboard } from '@/components/layout/DashboardContext';
import { submitAssessment } from '@/app/actions/submission';
import { getStudentAssessments } from '@/app/actions/student-portal';
import { 
  Download, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  FileText,
  Clock,
  Eye,
  X,
  Plus,
  ShieldCheck,
  FileCheck2,
  Box,
  ClipboardList,
  CalendarDays
} from 'lucide-react';
import DocumentViewer from '@/components/ui/DocumentViewer';

interface AssessmentStudentClientProps {
  type: 'ASSIGNMENT' | 'QUIZ';
  userId: number;
}

export default function AssessmentStudentClient({ type, userId }: AssessmentStudentClientProps) {
  const { selectedModuleId, setHeaderExtra, selectedModuleName } = useDashboard();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // File selection per assessment
  const [pendingFiles, setPendingFiles] = useState<Record<number, File | null>>({});
  
  // Modals
  const [confirmModal, setConfirmModal] = useState<{ id: number; title: string } | null>(null);
  const [viewUrl, setViewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedModuleId) {
      setAssessments([]);
      return;
    }

    async function loadAssessments() {
      setLoading(true);
      setErrorMsg('');
      const res = await getStudentAssessments(userId, Number(selectedModuleId), type);
      if (res.success) {
        setAssessments(res.assessments || []);
      } else {
        setErrorMsg(res.error || 'Failed to load data.');
      }
      setLoading(false);
    }

    loadAssessments();
  }, [selectedModuleId, userId, type]);

  useEffect(() => {
    if (selectedModuleId) {
      setHeaderExtra(
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 transition-all">
          <div className="h-4 w-[2px] bg-gray-200 mx-1 hidden sm:block"></div>
          <div className="bg-[#071a4a]/5 px-3 py-1.5 rounded-full flex items-center gap-2 border border-[#071a4a]/10">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#071a4a] opacity-60 shrink-0">Mode:</span>
            <span className="text-xs font-bold tracking-tight text-[#071a4a] italic">{type}s Portal</span>
          </div>
        </div>
      );
    }
    return () => setHeaderExtra(null);
  }, [selectedModuleId, setHeaderExtra, type]);

  const handleFileChange = (assessmentId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPendingFiles(prev => ({ ...prev, [assessmentId]: e.target.files![0] }));
      setErrorMsg('');
      setSuccessMsg('');
    }
  };

  const isDeadlinePassed = (endDate: string, time: string) => {
    const deadline = new Date(`${endDate}T${time}`);
    return new Date() > deadline;
  };

  const handleOpenConfirm = (id: number, title: string) => {
    if (!pendingFiles[id] && !assessments.find(a => a.id === id)?.submissionStatus) {
       setErrorMsg('Please select a file first.');
       return;
    }
    setConfirmModal({ id, title });
  };

  const handleFinalSubmit = async () => {
    if (!confirmModal || !selectedModuleId) return;
    
    const { id } = confirmModal;
    const file = pendingFiles[id];
    if (!file) {
       setConfirmModal(null);
       return;
    }

    setSubmittingId(id);
    setConfirmModal(null);
    setErrorMsg('');
    setSuccessMsg('');

    const formData = new FormData();
    formData.append('userId', String(userId));
    formData.append('assessmentId', String(id));
    formData.append('moduleId', String(selectedModuleId));
    formData.append('file', file);

    try {
      const res = await submitAssessment(formData);
      if (res.success) {
        setSuccessMsg(`"${file.name}" submitted successfully!`);
        setAssessments(prev => prev.map(a => 
          a.id === id ? { ...a, submissionStatus: 'Submitted', submissionName: file.name, marksObtained: null } : a
        ));
        setPendingFiles(prev => ({ ...prev, [id]: null }));
      } else {
        setErrorMsg(res.error || 'Submission failed');
      }
    } catch (err) {
      setErrorMsg('Server error occurred.');
    } finally {
      setSubmittingId(null);
    }
  };

  if (!selectedModuleId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-gray-50/50 rounded-[32px] m-4">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
          <ClipboardList className="w-8 h-8 text-gray-200" />
        </div>
        <h2 className="text-xl font-black text-[#071a4a] mb-2 tracking-tight">Access Course Portal</h2>
        <p className="text-gray-400 max-w-sm text-[11px] font-bold uppercase tracking-widest">Select a course to view active {type.toLowerCase()}s.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700">
      
      {/* Mini Status Notification */}
      {(errorMsg || successMsg) && (
        <div className={`fixed bottom-6 right-6 z-[200] px-6 py-4 rounded-2xl backdrop-blur-md border shadow-2xl animate-in slide-in-from-bottom-5 duration-500 max-w-md ${
          successMsg ? 'bg-green-500 text-white border-green-400' : 'bg-red-500 text-white border-red-400'
        }`}>
           <div className="flex items-start gap-4">
              {successMsg ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <div>
                <p className="text-[12px] font-black uppercase tracking-widest leading-none mb-1">{successMsg ? 'Success' : 'Attention'}</p>
                <p className="text-[11px] font-bold opacity-90">{successMsg || errorMsg}</p>
              </div>
              <button onClick={() => { setErrorMsg(''); setSuccessMsg(''); }} className="ml-2 hover:opacity-70"><X className="w-4 h-4" /></button>
           </div>
        </div>
      )}

      {/* Grid Cards Container */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#071a4a] opacity-20 mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[4px] text-gray-400">Syncing System</p>
        </div>
      ) : assessments.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center bg-white border-2 border-dashed border-gray-100 rounded-[32px] opacity-40">
            <Box className="w-12 h-12 mb-4" />
            <p className="text-[11px] font-black uppercase tracking-[4px]">No active {type.toLowerCase()}s recorded</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((item) => {
            const isOver = isDeadlinePassed(item.endDate, item.endTime);
            const isSubmitted = item.submissionStatus === 'Submitted';
            const pendingFile = pendingFiles[item.id];

            return (
              <div key={item.id} className="bg-white border border-gray-100 rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group relative">
                
                {/* Status Badge */}
                <div className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                  isSubmitted ? 'bg-green-50 text-green-600 border-green-100' : isOver ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                   {isSubmitted ? 'Completed' : isOver ? 'Expired' : 'Pending'}
                </div>

                <div className="p-6 space-y-5">
                   {/* Title & Seq */}
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm transition-all group-hover:scale-105 ${isSubmitted ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                        {type === 'ASSIGNMENT' ? <FileText className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-lg font-black text-[#071a4a] uppercase tracking-tight leading-tight group-hover:text-blue-600 transition-colors">{item.title}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{type} #{item.sequenceNo || 1}</p>
                      </div>
                   </div>

                   {/* Stats Grid */}
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-50 space-y-1">
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Marks</p>
                         <p className="text-sm font-black text-[#071a4a]">{item.marks}</p>
                      </div>
                      <div className="bg-[#071a4a]/5 p-3 rounded-2xl border border-blue-100 space-y-1 relative overflow-hidden group/marks">
                         <div className="absolute top-0 right-0 w-8 h-8 bg-blue-500/5 rotate-45 -mr-4 -mt-4"></div>
                         <p className="text-[9px] font-black text-[#071a4a]/40 uppercase tracking-widest">Obtained</p>
                         <p className={`text-sm font-black ${item.marksObtained !== null ? 'text-green-600' : 'text-gray-300'}`}>
                           {item.marksObtained !== null ? item.marksObtained : '--'}
                         </p>
                      </div>
                   </div>

                   {/* Dates */}
                   <div className="space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-500">
                         <div className="flex items-center gap-2">
                           <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
                           <span>Start: {item.startDate}</span>
                         </div>
                      </div>
                      <div className={`flex items-center justify-between text-[11px] font-bold ${isOver && !isSubmitted ? 'text-red-500' : 'text-[#071a4a]'}`}>
                         <div className="flex items-center gap-2">
                           <Clock className="w-3.5 h-3.5" />
                           <span>Deadline: {item.endDate}</span>
                         </div>
                         <span className="text-[10px] font-black uppercase opacity-60">@{item.endTime}</span>
                      </div>
                   </div>

                   {/* Actions Area */}
                   <div className="pt-2 space-y-4">
                      {/* Download Question Paper Button */}
                      <a 
                        href={item.fileUrl} 
                        download
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100 bg-gray-50 text-gray-500 hover:bg-[#071a4a] hover:text-white transition-all group-hover:shadow-lg"
                      >
                        <Download className="w-3.5 h-3.5" /> Question Paper
                      </a>

                      {/* Upload Section - HIDDEN IF SUBMITTED */}
                      {!isSubmitted && !isOver ? (
                        <div className="space-y-3">
                           <input 
                            type="file" 
                            id={`upload-${item.id}`} 
                            className="hidden" 
                            onChange={(e) => handleFileChange(item.id, e)} 
                           />
                           <div className="flex gap-2">
                              <button 
                                onClick={() => document.getElementById(`upload-${item.id}`)?.click()}
                                className={`flex-1 h-12 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-2 px-4 shadow-sm
                                  ${pendingFile ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200 hover:bg-gray-50'}`}
                              >
                                {pendingFile ? <FileCheck2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                <span className="text-[10px] font-black uppercase tracking-widest truncate">
                                  {pendingFile ? pendingFile.name : 'Select Solution'}
                                </span>
                              </button>
                              
                              {pendingFile && (
                                <button 
                                  onClick={handleFinalSubmit}
                                  disabled={submittingId === item.id}
                                  className="w-12 h-12 bg-[#071a4a] text-white rounded-xl shadow-lg shadow-blue-900/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                                >
                                  {submittingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                </button>
                              )}
                           </div>
                        </div>
                      ) : isSubmitted ? (
                        <div className="h-12 bg-green-500 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 border border-green-400 animate-in zoom-in-95">
                           <CheckCircle2 className="w-4 h-4" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Final Submission Uploaded</span>
                        </div>
                      ) : (
                        <div className="h-12 bg-gray-50 text-red-500/50 border border-dashed border-red-100 rounded-xl flex items-center justify-center gap-2 grayscale">
                           <Clock className="w-4 h-4" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Gateway Expired</span>
                        </div>
                      )}
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal - Small & Premium */}
      {confirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#071a4a]/40 backdrop-blur-md animate-in fade-in" onClick={() => setConfirmModal(null)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl border border-gray-50 animate-in zoom-in-95 duration-200">
             <div className="w-16 h-16 bg-blue-50 text-[#071a4a] rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <ShieldCheck className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-black text-[#071a4a] mb-2 text-center uppercase tracking-tight">Final Receipt</h3>
             <p className="text-gray-500 text-[11px] font-bold mb-8 leading-relaxed text-center px-4">
                Confirm submission for <span className="text-blue-600">"{confirmModal.title}"</span>? This action is final and documents cannot be modified later.
             </p>
             <div className="flex gap-4">
                <button onClick={() => setConfirmModal(null)} className="flex-1 py-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-400 text-[11px] font-black uppercase tracking-widest transition-all">Abort</button>
                <button 
                  onClick={handleFinalSubmit}
                  className="flex-1 py-3.5 rounded-xl bg-[#071a4a] text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/30 hover:scale-105 active:scale-95 transition-all"
                >
                   Finalize
                </button>
             </div>
          </div>
        </div>
      )}

      <DocumentViewer url={viewUrl} onClose={() => setViewUrl(null)} />
    </div>
  );
}
