'use client';

import { useState, useEffect } from 'react';
import { useDashboard } from '@/components/layout/DashboardContext';
import { updateModuleRecapSheet, getModuleOutline } from '@/app/actions/module';
import { 
  FileText, 
  Upload, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  X,
  Plus,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import DocumentViewer from '@/components/ui/DocumentViewer';

export default function RecapSheetPage() {
  const { selectedModuleId, setHeaderExtra } = useDashboard();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [module, setModule] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [viewFileUrl, setViewFileUrl] = useState<string | null>(null);

  useEffect(() => {
    if (module) {
      setHeaderExtra(
        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 transition-all">
          <div className="h-4 w-[2px] bg-gray-200 mx-2 hidden sm:block"></div>
          <div className="bg-[#071a4a] text-white px-5 py-2 rounded-full shadow-md flex items-center gap-2.5 border border-blue-400/20">
            <span className="text-[11px] font-black uppercase tracking-widest text-blue-300 opacity-80">Selected Course:</span>
            <span className="text-sm font-bold tracking-tight">{module?.course?.name || module?.name}</span>
          </div>
        </div>
      );
    }
    return () => setHeaderExtra(null);
  }, [module, setHeaderExtra]);

  useEffect(() => {
    if (!selectedModuleId) {
      setLoading(false);
      return;
    }

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const res = await getModuleOutline(Number(selectedModuleId));
        if (res.success) setModule(res.module);
        else if (res.error) setError(res.error);
      } catch (err) {
        setError('Failed to load recap sheet data.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [selectedModuleId]);

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are allowed.');
      setPendingFile(null);
      return;
    }

    setPendingFile(file);
    setError(null);
    setSuccess(null);
  };

  const handleUpload = async () => {
    if (!pendingFile || !selectedModuleId) return;

    setUpdating(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('moduleId', String(selectedModuleId));
    formData.append('fileData', pendingFile);
    formData.append('fileName', pendingFile.name);

    try {
      const res = await updateModuleRecapSheet(formData);
      if (res.success) {
        setModule((prev: any) => ({ 
          ...prev, 
          recapSheetName: pendingFile.name, 
          recapSheetUrl: `/uploads/recap_sheets/${pendingFile.name}` 
        }));
        setPendingFile(null);
        setSuccess(`Recap sheet uploaded: ${pendingFile.name}`);
      } else {
        setError(res.error || 'Upload failed');
      }
    } catch (err) {
      setError('An error occurred during upload.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedModuleId) return;
    setUpdating(true);
    setError(null);

    const formData = new FormData();
    formData.append('moduleId', String(selectedModuleId));
    formData.append('fileName', '');

    try {
      const res = await updateModuleRecapSheet(formData);
      if (res.success) {
        setModule((prev: any) => ({ ...prev, recapSheetName: null, recapSheetUrl: null }));
        setPendingFile(null);
        setSuccess('Recap sheet deleted successfully.');
        setIsDeleteModalOpen(false);
      } else {
        setError(res.error || 'Delete failed');
      }
    } catch (err) {
      setError('An error occurred during deletion.');
    } finally {
      setUpdating(false);
    }
  };

  if (!selectedModuleId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
          <FileSpreadsheet className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2 tracking-tight">No Course Selected</h2>
        <p className="text-gray-500 max-w-sm text-sm font-medium">Please select a course from the Dashboard to manage its Recap Sheets.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#071a4a]" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
      
      {/* Premium Headerpattern */}
      <div className="bg-[#071a4a] p-10 rounded-[48px] shadow-2xl shadow-blue-900/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-blue-400/20 transition-all duration-700"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
           <div className="flex items-center gap-6">
             <div className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] flex items-center justify-center shadow-lg">
               <FileSpreadsheet className="w-10 h-10 text-white" />
             </div>
             <div>
               <h2 className="text-4xl font-black text-white tracking-tight">Recap <span className="text-blue-400">Hub</span></h2>
               <p className="text-blue-100/60 text-[10px] font-black uppercase tracking-[4px] mt-2">Comprehensive Academic Recap System</p>
             </div>
           </div>
           {!module?.recapSheetName && (
             <button 
              onClick={() => document.getElementById('recap-upload')?.click()}
              className="bg-white text-[#071a4a] px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
             >
               <Plus className="w-5 h-5" />
               Upload Sheet
             </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        
        {/* Main Doc Card */}
        <div className="md:col-span-8">
          <div 
            onClick={() => !module?.recapSheetName && document.getElementById('recap-upload')?.click()}
            className={`h-full min-h-[400px] border-4 border-dashed rounded-[48px] transition-all relative overflow-hidden flex flex-col items-center justify-center p-12
              ${module?.recapSheetName 
                ? 'border-green-100 bg-white shadow-xl shadow-green-900/5' 
                : 'border-gray-100 bg-gray-50/50 hover:bg-white hover:border-blue-200 cursor-pointer group'}`}
          >
            {module?.recapSheetName ? (
              <div className="flex flex-col items-center text-center gap-6">
                <div className="w-24 h-24 bg-green-500 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-green-500/40 relative">
                   <CheckCircle2 className="w-12 h-12" />
                   <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-xl shadow-lg">
                      <ShieldCheck className="w-5 h-5 text-green-500" />
                   </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-[#071a4a] tracking-tight">{module.recapSheetName}</h3>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 text-[10px] font-black rounded-full uppercase tracking-widest border border-green-100">
                    System Verified • Secured
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setViewFileUrl(module.recapSheetUrl)} className="bg-[#071a4a] text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-[#071a4a]/30 hover:scale-105 transition-all flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Preview
                  </button>
                  <button onClick={() => setIsDeleteModalOpen(true)} className="bg-gray-50 text-gray-400 hover:text-red-600 px-6 py-3.5 rounded-2xl font-black text-xs transition-all hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : pendingFile ? (
              <div className="flex flex-col items-center text-center gap-6 animate-in zoom-in-95 duration-300">
                 <div className="w-24 h-24 bg-[#071a4a] rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-blue-500/40">
                   <FileText className="w-12 h-12" />
                 </div>
                 <div className="space-y-2">
                   <h3 className="text-2xl font-black text-[#071a4a] tracking-tight">{pendingFile.name}</h3>
                   <p className="text-gray-400 text-[10px] font-black uppercase tracking-[4px]">Ready for submission</p>
                 </div>
                 <button onClick={handleUpload} disabled={updating} className="bg-[#071a4a] text-white px-12 py-4 rounded-2xl font-black shadow-2xl shadow-blue-900/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                   {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                   Submit to Academic Server
                 </button>
                 <button onClick={() => setPendingFile(null)} className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors">Discard & Try Again</button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center gap-6 text-gray-400 transition-all group-hover:scale-105">
                 <div className="w-24 h-24 bg-white rounded-[32px] border border-gray-100 flex items-center justify-center shadow-sm group-hover:shadow-xl group-hover:border-blue-100 transition-all">
                   <Upload className="w-10 h-10 opacity-20 group-hover:opacity-100 group-hover:text-blue-500" />
                 </div>
                 <div className="space-y-1">
                   <h3 className="text-xl font-black text-gray-500 group-hover:text-[#071a4a] transition-colors">Select Recap Sheet</h3>
                   <p className="text-[10px] font-black uppercase tracking-[4px] opacity-60">PDF Protocol • Maximum 20MB</p>
                 </div>
                 <ArrowRight className="w-6 h-6 opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all mt-4" />
              </div>
            )}
            <input type="file" id="recap-upload" className="hidden" accept=".pdf" onChange={handleFileSelection} />
          </div>
        </div>

        {/* Sidebar Status */}
        <div className="md:col-span-4 space-y-8">
           <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
              <h4 className="text-[11px] font-black text-[#071a4a] uppercase tracking-[4px] border-b border-gray-50 pb-4">Compliance Status</h4>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400">Document Type</span>
                    <span className="text-xs font-black text-[#071a4a]">System PDF</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400">Verification</span>
                    <span className="px-3 py-1 bg-blue-50 text-[10px] font-black text-blue-600 rounded-lg uppercase">Cloud Sync</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400">Finality</span>
                    <span className="text-xs font-black text-green-500">Live</span>
                 </div>
              </div>
           </div>

           {(error || success) && (
             <div className={`p-6 rounded-[32px] border animate-in slide-in-from-right-4 duration-500 break-words ${
               success ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
             }`}>
                <div className="flex items-start gap-4">
                   <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${success ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                      {success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                   </div>
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{success ? 'System Alert' : 'Upload Error'}</p>
                     <p className="text-sm font-bold line-clamp-3">{success || error}</p>
                   </div>
                </div>
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

      {/* --- MODALS --- */}
      <DocumentViewer url={viewFileUrl} onClose={() => setViewFileUrl(null)} />

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#071a4a]/60 backdrop-blur-md animate-in fade-in" onClick={() => setIsDeleteModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-[48px] p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-gray-100 animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
             <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[32px] flex items-center justify-center mb-8 shadow-xl shadow-red-100/30">
                <Trash2 className="w-12 h-12" />
             </div>
             <h3 className="text-2xl font-black text-gray-900 mb-2">Delete Recap Sheet?</h3>
             <p className="text-gray-500 text-sm font-bold mb-10 leading-relaxed px-4">This sheet will be permanently removed from the system archives.</p>
             <div className="flex gap-4 w-full">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-400 text-xs font-black transition-all">Cancel</button>
                <button onClick={handleDelete} disabled={updating} className="flex-1 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2">
                   {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
