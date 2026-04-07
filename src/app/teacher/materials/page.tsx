'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDashboard } from '@/components/layout/DashboardContext';
import { getModuleOutline } from '@/app/actions/module';
import { getMaterials, createMaterial, deleteMaterial } from '@/app/actions/material';
import { 
  FileText, 
  Upload, 
  Trash2,
  Edit2,
  RefreshCw,
  Loader2, 
  AlertCircle,
  X,
  Plus,
  BookOpen,
  CheckCircle2,
  FileBox,
  MonitorPlay,
  Eye,
  Calendar,
  Layers,
  Search,
  ChevronRight
} from 'lucide-react';
import DocumentViewer from '@/components/ui/DocumentViewer';

export default function MaterialsPage() {
  const { selectedModuleId, setHeaderExtra } = useDashboard();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [module, setModule] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editModalItem, setEditModalItem] = useState<any>(null);
  
  // Viewing state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [viewModalTitle, setViewModalTitle] = useState<string>('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Delete state
  const [deleteModalItem, setDeleteModalItem] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadData = useCallback(async (showRefreshIndicator = false) => {
    if (!selectedModuleId) {
      setLoading(false);
      return;
    }

    if (showRefreshIndicator) setRefreshing(true);
    else setLoading(true);
    
    setError(null);
    try {
      const [modRes, matRes] = await Promise.all([
        getModuleOutline(Number(selectedModuleId)),
        getMaterials(Number(selectedModuleId))
      ]);

      if (modRes.success) setModule(modRes.module);
      
      if (matRes.success) {
        setMaterials(matRes.materials || []);
      } else {
        setError(matRes.error || 'Failed to load materials.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedModuleId]);

  useEffect(() => {
    if (module) {
      setHeaderExtra(
        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 transition-all">
          <div className="h-4 w-[2px] bg-gray-200 mx-2 hidden sm:block"></div>
          <div className="bg-[#071a4a] text-white px-5 py-2 rounded-full shadow-md flex items-center gap-2.5 border border-blue-400/20">
            <span className="text-[11px] font-black uppercase tracking-widest text-blue-300 opacity-80">Managing:</span>
            <span className="text-sm font-bold tracking-tight">{module?.course?.name || module?.name}</span>
          </div>
        </div>
      );
    }
    return () => setHeaderExtra(null);
  }, [module, setHeaderExtra]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith('.pdf') && !lowerName.endsWith('.ppt') && !lowerName.endsWith('.pptx')) {
      setError('Only PDF and PPT/PPTX files are allowed.');
      return;
    }

    setPendingFile(file);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTitleInput('');
    setPendingFile(null);
    setEditModalItem(null);
  };

  const handleEditClick = (mat: any) => {
    setEditModalItem(mat);
    setTitleInput(mat.title);
    setPendingFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!titleInput.trim()) {
      setError('Please enter a lecture title.');
      return;
    }
    if (!editModalItem && !pendingFile) {
      setError('Please select a file to upload.');
      return;
    }
    if (!selectedModuleId) return;

    setSubmitting(true);
    setError(null);
    
    try {
      if (editModalItem) {
        let fileUrlToUpdate = undefined;
        if (pendingFile) {
           fileUrlToUpdate = `/materials/${Date.now()}_${pendingFile.name}`;
        }
        const { updateMaterial } = await import('@/app/actions/material');
        const res = await updateMaterial(editModalItem.id, titleInput, fileUrlToUpdate);
        
        if (res.success) {
          setSuccess('Material updated successfully!');
          closeModal();
          loadData(true);
        } else {
          setError(res.error || 'Failed to update material');
        }
      } else {
        const dummyUrl = `/materials/${Date.now()}_${pendingFile!.name}`;
        const res = await createMaterial(Number(selectedModuleId), titleInput, dummyUrl);
        if (res.success) {
          setSuccess('Material uploaded successfully!');
          closeModal();
          loadData(true);
        } else {
          setError(res.error || 'Failed to upload material');
        }
      }
    } catch(err) {
      setError('An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleView = (mat: any) => {
    setPreviewUrl(mat.fileUrl);
    setViewModalTitle(mat.title);
    setIsViewModalOpen(true);
  };

  const executeDelete = async () => {
    if (!deleteModalItem) return;
    const id = deleteModalItem.id;
    setDeletingId(id);
    const res = await deleteMaterial(id);
    if (res.success) {
      setSuccess('Material deleted successfully.');
      loadData(true);
      setDeleteModalItem(null);
    } else {
      alert(res.error || 'Failed to delete material');
    }
    setDeletingId(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getFileIcon = (url: string) => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.endsWith('.ppt') || lowerUrl.endsWith('.pptx')) {
      return <MonitorPlay className="w-5 h-5 text-orange-500" />;
    }
    return <FileText className="w-5 h-5 text-red-500" />;
  };

  if (!selectedModuleId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-4">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-2">
          <BookOpen className="w-10 h-10 opacity-20" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">No Course Selected</h2>
        <p className="text-gray-500 max-w-sm text-sm">Please select a course from the Dashboard to manage academic materials.</p>
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
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      
      {/* Premium Headerpattern */}
      <div className="bg-[#071a4a] p-12 rounded-[48px] shadow-2xl shadow-blue-900/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/10 rounded-full -mr-40 -mt-40 blur-3xl group-hover:bg-blue-400/20 transition-all duration-700"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
           <div className="flex items-center gap-6">
             <div className="w-24 h-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] flex items-center justify-center shadow-lg">
               <Layers className="w-12 h-12 text-white" />
             </div>
             <div>
               <h2 className="text-4xl font-black text-white tracking-tight leading-tight">Course <span className="text-blue-400">Library</span></h2>
               <p className="text-blue-100/60 text-[10px] font-black uppercase tracking-[4px] mt-2">Lecture Notes & Resources Management</p>
             </div>
           </div>
           
           <div className="flex gap-4">
              <button 
                onClick={() => { setEditModalItem(null); setTitleInput(''); setPendingFile(null); setIsModalOpen(true); }}
                className="bg-white text-[#071a4a] px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
              >
                <Plus className="w-5 h-5" /> Add Material
              </button>
              <button 
                onClick={() => loadData(true)}
                disabled={refreshing}
                className="bg-white/10 text-white p-4 rounded-2xl hover:bg-white/20 transition-all active:rotate-180 duration-500"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        <div className="bg-white border border-gray-100 rounded-[48px] shadow-xl shadow-gray-200/30 overflow-hidden">
          {/* Table Toolbar */}
          <div className="px-10 py-8 bg-gray-50/50 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm">
                   <Search className="w-4 h-4 text-gray-300" />
                   <input type="text" placeholder="Filter materials..." className="bg-transparent text-sm font-bold text-[#071a4a] outline-none w-48" />
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-4 py-2 rounded-xl">{materials.length} Items Total</span>
             </div>
             
             {(error || success) && (
               <div className={`px-6 py-2.5 rounded-2xl text-[11px] font-black flex items-center gap-3 animate-in fade-in slide-in-from-right-4 ${
                 success ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
               }`}>
                 {success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                 {success || error}
               </div>
             )}
          </div>

          <div className="p-10 pt-4">
            {materials.length === 0 ? (
              <div className="py-32 flex flex-col items-center justify-center space-y-4">
                <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center border border-gray-100 italic">
                  <FileBox className="w-10 h-10 text-gray-200" />
                </div>
                <p className="text-gray-400 text-xs font-black uppercase tracking-[4px]">Library is currently empty</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-0">
                  <thead>
                    <tr className="uppercase tracking-[2px] text-[10px] font-black text-[#071a4a]/40 bg-gray-50/30">
                      <th className="py-6 px-8 border-b border-gray-50 rounded-tl-3xl">LECT No.</th>
                      <th className="py-6 px-8 border-b border-gray-50">Content Title</th>
                      <th className="py-6 px-8 border-b border-gray-50 text-center">Date Published</th>
                      <th className="py-6 px-8 border-b border-gray-50 text-center">Doc Type</th>
                      <th className="py-6 px-8 border-b border-gray-50 rounded-tr-3xl text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {materials.map((mat, index) => (
                      <tr key={mat.id} className="group hover:bg-blue-50/20 transition-all duration-300">
                        <td className="py-8 px-8">
                           <span className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-black text-[#071a4a] text-xs group-hover:bg-[#071a4a] group-hover:text-white transition-all">{index + 1}</span>
                        </td>
                        <td className="py-8 px-8">
                           <div className="flex flex-col gap-1">
                              <span className="text-lg font-black text-[#071a4a] group-hover:text-blue-600 transition-colors uppercase tracking-tight">{mat.title}</span>
                              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic truncate max-w-xs">{mat.fileUrl.split('/').pop()}</span>
                           </div>
                        </td>
                        <td className="py-8 px-8 text-center font-bold text-gray-500 text-sm">
                           {formatDate(mat.createdAt)}
                        </td>
                        <td className="py-8 px-8">
                           <div className="flex items-center justify-center gap-2">
                              {getFileIcon(mat.fileUrl)}
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{mat.fileUrl.toLowerCase().endsWith('.pdf') ? 'Acrobat PDF' : 'PowerPoint'}</span>
                           </div>
                        </td>
                        <td className="py-8 px-8 text-right">
                           <div className="flex items-center justify-end gap-3">
                              <button 
                                onClick={() => handleView(mat)}
                                className="w-12 h-12 rounded-2xl bg-[#071a4a] text-white flex items-center justify-center shadow-lg shadow-blue-900/20 hover:scale-110 active:scale-95 transition-all"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleEditClick(mat)}
                                className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => setDeleteModalItem(mat)}
                                className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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

      {/* 1. UPLOAD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#071a4a]/60 backdrop-blur-md animate-in fade-in" onClick={closeModal}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[48px] shadow-2xl flex flex-col animate-in zoom-in-95 duration-400 overflow-hidden border border-gray-100">
            <div className="bg-[#071a4a] px-10 py-6 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-4 text-white">
                   <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                   </div>
                   <h3 className="text-sm font-black uppercase tracking-[2px]">{editModalItem ? 'Update Item' : 'Secure Upload'}</h3>
                </div>
                <button onClick={closeModal} className="text-white/40 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-12 space-y-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[4px] ml-1">Lecture Designation</label>
                <input 
                  type="text" 
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="e.g., Week 04 - Advanced Networking"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-[#071a4a] outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 transition-all shadow-inner"
                />
              </div>

              <div 
                onClick={() => document.getElementById('material-upload')?.click()}
                className={`border-4 border-dashed rounded-[32px] p-10 text-center cursor-pointer transition-all group relative overflow-hidden flex flex-col items-center gap-4
                  ${pendingFile ? 'border-blue-400 bg-blue-50/30' : 'border-gray-100 bg-gray-50/50 hover:bg-white hover:border-blue-200'}`}
              >
                <input type="file" id="material-upload" className="hidden" accept=".pdf,.ppt,.pptx" onChange={handleFileSelection} />
                
                {pendingFile ? (
                   <div className="animate-in zoom-in-95">
                      <div className="w-20 h-20 bg-[#071a4a] rounded-[24px] flex items-center justify-center text-white mx-auto shadow-xl mb-4">
                         {getFileIcon(pendingFile.name)}
                      </div>
                      <p className="text-sm font-black text-[#071a4a] mb-1">{pendingFile.name}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected Payload</p>
                   </div>
                ) : (
                   <>
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-lg transition-all border border-gray-50">
                        <Upload className="w-6 h-6 text-gray-300 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-black text-gray-500">Link Document</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">PDF or PPT Legacy</p>
                      </div>
                   </>
                )}
              </div>

              <button 
                onClick={handleSubmit}
                disabled={submitting || !titleInput.trim() || (!editModalItem && !pendingFile)}
                className="w-full bg-[#071a4a] hover:bg-[#051133] text-white py-5 rounded-[24px] text-sm font-black shadow-2xl shadow-blue-900/30 transition-all active:scale-95 disabled:grayscale flex items-center justify-center gap-3"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {editModalItem ? 'Commit Changes' : 'Initialize Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. PREVIEW MODAL */}
      <DocumentViewer url={previewUrl} onClose={() => { setPreviewUrl(null); setIsViewModalOpen(false); }} />

      {/* 3. DELETE CONFIRMATION */}
      {deleteModalItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#071a4a]/60 backdrop-blur-md animate-in fade-in" onClick={() => setDeleteModalItem(null)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-[48px] p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-gray-100 animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
             <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[32px] flex items-center justify-center mb-8 shadow-xl shadow-red-100/30">
                <Trash2 className="w-12 h-12" />
             </div>
             <h3 className="text-2xl font-black text-gray-900 mb-2">Erase Material?</h3>
             <p className="text-gray-500 text-sm font-bold mb-10 leading-relaxed px-4 text-center">The selected lecture resource will be permanently removed.</p>
             <div className="flex gap-4 w-full">
                <button onClick={() => setDeleteModalItem(null)} className="flex-1 py-4 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-400 text-xs font-black transition-all">Cancel</button>
                <button onClick={executeDelete} disabled={deletingId !== null} className="flex-1 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2">
                   {deletingId !== null ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
