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
  Eye
} from 'lucide-react';

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
            <span className="text-[11px] font-black uppercase tracking-widest text-blue-300 opacity-80">Selected Course:</span>
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
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
        // Updating existing material
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
        // Creating new material
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
    // Open the same modal, but internally we'll render differently if it's PPT
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
    return date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getFileIcon = (url: string) => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.endsWith('.ppt') || lowerUrl.endsWith('.pptx')) {
      return <MonitorPlay className="w-4 h-4 text-orange-500" />;
    }
    return <FileText className="w-4 h-4 text-red-500" />;
  };

  if (!selectedModuleId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
          <BookOpen className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Course Selected</h2>
        <p className="text-gray-500 max-w-sm">
          Please select a course from the Dashboard to manage its materials.
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
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 relative">
      
      {/* Messages */}
      {(error || success) && (
        <div className="w-full flex items-center justify-between gap-3 text-sm font-bold bg-white shadow-sm p-4 rounded-2xl border animate-in slide-in-from-top-2">
          {success ? (
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="w-5 h-5 text-green-500" /> {success}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 text-red-500" /> {error}
            </div>
          )}
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white border border-gray-100 rounded-[28px] shadow-xl shadow-gray-200/40 overflow-hidden">
        
        {/* Top Header Row matches exact screenshot style - centered grey box */}
        <div className="p-6">
          <div className="bg-[#e2e6f0] rounded-xl py-3 w-full flex items-center justify-center">
             <h2 className="text-[13px] font-black text-[#071a4a] tracking-wide">
               Material Management
             </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 flex items-center gap-3">
          <button 
            onClick={() => {
              setEditModalItem(null);
              setTitleInput('');
              setPendingFile(null);
              setIsModalOpen(true);
            }}
            className="bg-[#071a4a] hover:bg-[#0a2463] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold shadow-md shadow-[#071a4a]/20 transition-all active:scale-95"
          >
            <Upload className="w-4 h-4" />
            Add Materials
          </button>
          
          <button 
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="bg-[#071a4a] hover:bg-[#0a2463] text-white p-2.5 rounded-lg flex items-center justify-center shadow-md shadow-[#071a4a]/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Table Container */}
        <div className="p-6 mt-2">
          {materials.length === 0 ? (
            <div className="text-center py-16 border rounded-2xl border-gray-100 bg-gray-50/50">
              <FileBox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest">A list of Materials</p>
            </div>
          ) : (
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-center border-collapse">
                <thead className="bg-[#f9fafb] border-b border-gray-200">
                  <tr>
                    <th className="py-4 px-4 text-xs font-bold text-gray-500 border-r border-gray-100 w-[100px]">Lecture<br/>No</th>
                    <th className="py-4 px-4 text-xs font-bold text-gray-500 border-r border-gray-100">Title</th>
                    <th className="py-4 px-4 text-xs font-bold text-gray-500 border-r border-gray-100 w-[150px]">Uploaded Date</th>
                    <th className="py-4 px-4 text-xs font-bold text-gray-500 border-r border-gray-100 w-[120px]">View</th>
                    <th className="py-4 px-4 text-xs font-bold text-gray-500 w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {materials.map((mat, index) => (
                    <tr key={mat.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-4 px-4 text-sm font-bold text-gray-700 border-r border-gray-100">
                        {index + 1}
                      </td>
                      <td className="py-4 px-4 text-sm font-bold text-gray-800 border-r border-gray-100">
                        <div className="flex items-center justify-center gap-2">
                          {getFileIcon(mat.fileUrl)}
                          {mat.title}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[13px] font-semibold text-gray-500 border-r border-gray-100">
                        {formatDate(mat.createdAt)}
                      </td>
                      <td className="py-4 px-4 border-r border-gray-100">
                        <button 
                          onClick={() => handleView(mat)}
                          className="bg-blue-50 text-blue-600 hover:bg-[#071a4a] hover:text-white p-2.5 rounded-xl shadow-sm transition-all mx-auto flex items-center justify-center group/btn"
                          title="View Material"
                        >
                          <Eye className="w-5 h-5 opacity-90 group-hover/btn:scale-110 transition-transform" />
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            onClick={() => handleEditClick(mat)}
                            className="text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50 p-2 rounded-lg" 
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setDeleteModalItem(mat)}
                            disabled={deletingId === mat.id}
                            className="text-gray-400 hover:text-red-600 transition-colors bg-gray-50 hover:bg-red-50 p-2 rounded-lg disabled:opacity-30" 
                            title="Delete"
                          >
                            {deletingId === mat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {materials.length > 0 && (
            <p className="text-center text-xs font-bold text-gray-400 mt-6 tracking-wide">A list of Materials</p>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. ADD MATERIAL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#071a4a]/40 backdrop-blur-sm animate-in fade-in" onClick={closeModal}></div>
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-800 transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-gray-800 font-bold">
                <FileText className="w-5 h-5" />
                <span>{editModalItem ? 'Edit Material' : 'Upload Material'}</span>
              </div>
              <button 
                onClick={handleSubmit}
                disabled={submitting || !titleInput.trim() || (!editModalItem && !pendingFile)}
                className="bg-[#071a4a] hover:bg-[#0a2463] text-white px-5 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {editModalItem ? 'Save Changes' : 'Submit'}
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="block text-center text-sm font-bold text-gray-700">Lecture Title</label>
                <input 
                  type="text" 
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="Enter lecture title"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#071a4a]/20 focus:border-[#071a4a] transition-all outline-none"
                />
              </div>

              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('material-upload')?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  pendingFile ? 'border-[#071a4a] bg-blue-50/30' : 'border-gray-200 hover:border-[#071a4a]/40 bg-gray-50/50'
                }`}
              >
                <input 
                  type="file" 
                  id="material-upload" 
                  className="hidden" 
                  accept=".pdf,.ppt,.pptx" 
                  onChange={handleFileSelection}
                />
                
                {pendingFile ? (
                   <div className="flex flex-col items-center gap-2 text-[#071a4a]">
                     {getFileIcon(pendingFile.name)}
                     <span className="font-bold text-sm tracking-tight">{pendingFile.name}</span>
                     <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ready to upload</span>
                   </div>
                ) : editModalItem ? (
                   <div className="flex flex-col items-center gap-2 text-[#071a4a]">
                     {getFileIcon(editModalItem.fileUrl)}
                     <span className="font-bold text-sm tracking-tight">Keep existing file, or click to replace</span>
                     <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">PDF, PPT, PPTX Allowed</span>
                   </div>
                ) : (
                   <div className="flex flex-col items-center gap-2 text-gray-500">
                     <Upload className="w-6 h-6 mb-1 opacity-50" />
                     <span className="font-bold text-sm text-gray-600">Upload Material File</span>
                     <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">PDF, PPT, PPTX Allowed</span>
                   </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* 2. VIEW MODAL (PREVIEWER) */}
      {isViewModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsViewModalOpen(false)}></div>
          <div className="relative bg-white w-full h-full max-w-[96vw] max-h-[94vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-400 border border-white/10">
            {/* Modal Header */}
            <div className="bg-[#071a4a] px-10 py-5 flex items-center justify-between border-b border-white/10 shrink-0">
               <div className="flex items-center gap-5 text-white">
                 <div className="bg-blue-500/20 p-2.5 rounded-xl">
                   <FileText className="w-6 h-6 text-blue-400" />
                 </div>
                 <div className="flex flex-col">
                   <h3 className="text-sm font-black tracking-[1px] uppercase truncate max-w-xl leading-none mb-1">{viewModalTitle}</h3>
                   <span className="text-[10px] text-blue-300/60 font-black uppercase tracking-[2px]">SECURE DATA STREAM • SZABIST CLOUD</span>
                 </div>
               </div>
               <button 
                onClick={() => setIsViewModalOpen(false)} 
                className="bg-white/10 hover:bg-red-500 hover:text-white px-8 py-3 rounded-2xl text-white font-black text-xs transition-all active:scale-95 uppercase tracking-widest border border-white/5"
               >
                 Exit Viewer
               </button>
            </div>
            {/* Modal Body (REAL PDF VIEWER OR MSG) */}
            <div className="flex-1 bg-gray-900 flex items-center justify-center overflow-hidden">
               {previewUrl ? (
                 previewUrl.toLowerCase().endsWith('.ppt') || previewUrl.toLowerCase().endsWith('.pptx') ? (
                   <div className="w-full h-full relative bg-gray-100 flex flex-col">
                     {previewUrl.startsWith('blob:') || previewUrl.startsWith('/') || previewUrl.includes('localhost') ? (
                       <div className="text-center space-y-6 max-w-lg mx-auto mt-24 p-12">
                         <div className="w-24 h-24 bg-orange-500/10 rounded-3xl flex items-center justify-center mx-auto border border-orange-500/20">
                           <MonitorPlay className="w-12 h-12 text-orange-400" />
                         </div>
                         <h4 className="text-white text-2xl font-black">Local Environment Detected</h4>
                         <p className="text-gray-400 text-sm font-medium leading-relaxed">
                           PowerPoint preview is enabled via Microsoft Office Viewer. However, Microsoft servers cannot read files directly from your <b>localhost</b> or <b>local computer</b>. <br/><br/> Once this portal is hosted online, the PPT will render perfectly right here.
                         </p>
                         <button className="bg-[#071a4a] hover:bg-[#0a2463] text-white px-8 py-3 rounded-xl mx-auto shadow-lg mt-4 font-bold flex items-center gap-2">
                            Download Instead
                         </button>
                       </div>
                     ) : (
                       <iframe 
                         src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`} 
                         className="w-full h-full border-none"
                         title="PPT Viewer"
                       />
                     )}
                   </div>
                 ) : (
                   <iframe 
                     src={previewUrl} 
                     className="w-full h-full border-none bg-white"
                     title="PDF Viewer"
                   />
                 )
               ) : (
                 <div className="text-center space-y-6 max-w-lg p-12">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                      <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                    </div>
                    <div className="space-y-2">
                       <h4 className="text-white text-xl font-black">Loading Document</h4>
                       <p className="text-gray-400 text-sm font-medium">Please wait while the academic server processes the stream.</p>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* 3. DELETE CONFIRMATION MODAL */}
      {deleteModalItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#071a4a]/40 backdrop-blur-md animate-in fade-in" onClick={() => setDeleteModalItem(null)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[32px] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
             <div className="w-24 h-24 bg-[#071a4a]/5 text-[#071a4a] rounded-3xl flex items-center justify-center mb-8 rotate-3 shadow-xl shadow-[#071a4a]/10">
               <Trash2 className="w-12 h-12" />
             </div>
             <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Are you sure?</h3>
             <p className="text-gray-500 font-medium mb-10 leading-relaxed">
               You are about to delete <span className="font-bold text-red-600">"{deleteModalItem.title}"</span>. This action cannot be reversed.
             </p>
             <div className="grid grid-cols-2 gap-4 w-full">
                <button 
                  onClick={() => setDeleteModalItem(null)}
                  className="py-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-black transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={executeDelete}
                  disabled={deletingId !== null}
                  className="py-4 rounded-2xl bg-[#071a4a] hover:bg-[#0a2463] text-white text-sm font-black shadow-xl shadow-[#071a4a]/30 transition-all flex items-center justify-center gap-2"
                >
                  {deletingId !== null ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete
                </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
