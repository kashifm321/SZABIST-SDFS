'use client';

import { useState, useEffect } from 'react';
import { useDashboard } from '@/components/layout/DashboardContext';
import { updateModuleFcar, getModuleOutline } from '@/app/actions/module';
import { 
  FileText, 
  Upload, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

export default function FcarPage() {
  const { selectedModuleId, setHeaderExtra } = useDashboard();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [module, setModule] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

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
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

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
        setError('Failed to load FCAR data.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [selectedModuleId]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are allowed.');
      setPendingFile(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPendingFile(file);
    setError(null);
    setSuccess(null);
  };

  const handleUpload = async () => {
    if (!pendingFile || !selectedModuleId) return;

    setUpdating(true);
    setError(null);
    setSuccess(null);

    const fileName = pendingFile.name;
    const dummyUrl = `/fcar/${fileName}`;

    try {
      const res = await updateModuleFcar(Number(selectedModuleId), fileName, dummyUrl);
      if (res.success) {
        setModule((prev: any) => ({ ...prev, fcarName: fileName, fcarUrl: dummyUrl }));
        setPendingFile(null);
        setSuccess(`FCAR uploaded: ${fileName}`);
        
        const fileInput = document.getElementById('fcar-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setError(res.error || 'Upload failed');
      }
    } catch (err) {
      setError('An error occurred during upload.');
    } finally {
      setUpdating(false);
    }
  };

  const triggerUpload = () => {
    if (module?.fcarName) return; 
    document.getElementById('fcar-upload')?.click();
  };

  const handleDelete = async () => {
    if (!selectedModuleId) return;
    setUpdating(true);
    setError(null);

    try {
      const res = await updateModuleFcar(Number(selectedModuleId), null, null);
      if (res.success) {
        setModule((prev: any) => ({ ...prev, fcarName: null, fcarUrl: null }));
        setPreviewUrl(null);
        setPendingFile(null);
        
        const fileInput = document.getElementById('fcar-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        setSuccess('FCAR deleted successfully.');
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
          <FileText className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Course Selected</h2>
        <p className="text-gray-500 max-w-sm">
          Please select a course from the Dashboard to manage its FCAR file.
        </p>
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
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500 relative">
      
      <div className="bg-white border border-gray-100 rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden">
        {/* Management Hub Row */}
        <div className="bg-gray-50/80 px-8 py-5 border-b border-gray-100">
          <h2 className="text-center text-sm font-black text-[#071a4a] tracking-[2px] uppercase">
            FCAR Management
          </h2>
        </div>

        <div className="p-8 flex flex-col items-center space-y-6">
          {/* Dashed File Container */}
          <div 
            onClick={triggerUpload}
            className={`w-full max-w-md border-2 border-dashed rounded-3xl p-8 transition-all flex flex-col items-center gap-4 ${
              module?.fcarName || pendingFile 
                ? 'border-green-300 bg-green-50/20 shadow-inner' 
                : 'border-gray-200 bg-gray-50/40 hover:border-[#071a4a]/40 hover:bg-[#071a4a]/5 cursor-pointer'
            } group relative overflow-hidden`}
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <FileText className="w-24 h-24 -rotate-12" />
            </div>

            {module?.fcarName ? (
              <div className="flex flex-col items-center gap-4 text-center z-10">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 shadow-md shadow-green-100/50">
                  <CheckCircle2 className="w-8 h-8 animate-in zoom-in duration-300" />
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-black text-[#071a4a] tracking-tight">{module.fcarName}</p>
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-[4px]">System Verified • Live</p>
                </div>
              </div>
            ) : pendingFile ? (
              <div className="flex flex-col items-center gap-4 z-10 animate-in slide-in-from-bottom-4 text-center">
                <div className="w-16 h-16 bg-[#071a4a] rounded-3xl flex items-center justify-center shadow-lg shadow-blue-900/20 mx-auto">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-lg font-black text-[#071a4a] tracking-tight">{pendingFile.name}</p>
                  <div className="inline-block mt-2 px-3 py-1 bg-blue-50 text-[#071a4a] text-[10px] font-black rounded-full uppercase tracking-widest">
                    Pending Submission
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-gray-400 group-hover:text-[#071a4a] transition-all z-10">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all border border-gray-100">
                  <Upload className="w-6 h-6 opacity-40 group-hover:opacity-100 group-hover:text-blue-600" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-black tracking-tight text-gray-500 group-hover:text-[#071a4a]">Upload FCAR File</p>
                  <p className="text-[11px] uppercase tracking-widest opacity-60 mt-1 font-bold">Only PDF files allowed</p>
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="w-full max-w-md min-h-[50px] flex items-center justify-center">
            {success && (
              <div className="w-full flex items-center gap-3 text-sm font-bold text-green-700 bg-green-50 p-3 rounded-xl border border-green-200 animate-in slide-in-from-top-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> {success}
              </div>
            )}
            {error && (
              <div className="w-full flex items-center gap-3 text-sm font-bold text-red-700 bg-red-50 p-3 rounded-xl border border-red-200 animate-in shake duration-500">
                <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
              </div>
            )}
          </div>

          {/* Action Hub */}
          <div className="flex flex-col items-center gap-4 w-full max-w-md pb-4 text-center">
            <input 
              type="file" 
              id="fcar-upload" 
              className="hidden" 
              accept=".pdf" 
              onChange={handleFileSelection}
            />
            
            {module?.fcarName ? (
              <div className="flex gap-4 w-full justify-center animate-in fade-in slide-in-from-bottom-4">
                <button
                  onClick={() => setIsViewModalOpen(true)}
                  className="px-8 bg-[#071a4a] hover:bg-[#051133] text-white py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-xl shadow-[#071a4a]/30 transition-all hover:scale-[1.05] active:scale-95"
                >
                  <Eye className="w-4 h-4" /> View
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-8 bg-[#071a4a] hover:bg-[#0a2463] text-white py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-xl shadow-[#071a4a]/20 transition-all hover:scale-[1.05] active:scale-95"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            ) : (
              <button
                onClick={handleUpload}
                disabled={updating || !pendingFile}
                className="w-full max-w-[200px] bg-[#071a4a] hover:bg-[#051133] text-white py-3 rounded-xl text-sm font-black shadow-xl shadow-[#071a4a]/30 transition-all active:scale-[0.98] disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Submit File
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[8px] pt-12">
        SZABIST Academic Management System
      </p>

      {/* --- MODALS --- */}

      {/* 1. VIEW MODAL (PREVIEWER) */}
      {isViewModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsViewModalOpen(false)}></div>
          <div className="relative bg-white w-full h-full max-w-[96vw] max-h-[94vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-400 border border-white/10">
            {/* Modal Header */}
            <div className="bg-[#071a4a] px-10 py-5 flex items-center justify-between border-b border-white/10 shrink-0">
               <div className="flex items-center gap-5 text-white">
                 <div className="bg-red-500/20 p-2.5 rounded-xl">
                   <FileText className="w-6 h-6 text-red-400" />
                 </div>
                 <div className="flex flex-col">
                   <h3 className="text-sm font-black tracking-[1px] uppercase truncate max-w-xl leading-none mb-1">{module?.fcarName}</h3>
                   <span className="text-[10px] text-blue-300/60 font-black uppercase tracking-[2px]">SECURE PDF STREAM • SZABIST CLOUD</span>
                 </div>
               </div>
               <button 
                onClick={() => setIsViewModalOpen(false)} 
                className="bg-white/10 hover:bg-red-500 hover:text-white px-8 py-3 rounded-2xl text-white font-black text-xs transition-all active:scale-95 uppercase tracking-widest border border-white/5"
               >
                 Exit Viewer
               </button>
            </div>
            {/* Modal Body (REAL PDF VIEWER) */}
            <div className="flex-1 bg-gray-900 flex items-center justify-center overflow-hidden">
               {previewUrl ? (
                 <iframe 
                   src={previewUrl} 
                   className="w-full h-full border-none"
                   title="PDF Viewer"
                 />
               ) : (
                 <div className="text-center space-y-6 max-w-lg p-12">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                      <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                    </div>
                    <div className="space-y-2">
                       <h4 className="text-white text-xl font-black">Decrypting Module Content</h4>
                       <p className="text-gray-400 text-sm font-medium">Please wait while the academic server processes the PDF stream for secure viewing.</p>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* 2. DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#071a4a]/40 backdrop-blur-md animate-in fade-in" onClick={() => setIsDeleteModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[32px] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
             <div className="w-24 h-24 bg-[#071a4a]/5 text-[#071a4a] rounded-3xl flex items-center justify-center mb-8 rotate-3 shadow-xl shadow-[#071a4a]/10">
               <Trash2 className="w-12 h-12" />
             </div>
             <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Are you sure?</h3>
             <p className="text-gray-500 font-medium mb-10 leading-relaxed">
               You are about to delete the FCAR file <span className="font-bold text-red-600">"{module?.fcarName}"</span>. This action cannot be reversed.
             </p>
             <div className="grid grid-cols-2 gap-4 w-full">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="py-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-black transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={updating}
                  className="py-4 rounded-2xl bg-[#071a4a] hover:bg-[#0a2463] text-white text-sm font-black shadow-xl shadow-[#071a4a]/30 transition-all flex items-center justify-center gap-2"
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete
                </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
