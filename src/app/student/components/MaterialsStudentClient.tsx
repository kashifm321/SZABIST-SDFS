'use client';

import { useState, useEffect } from 'react';
import { useDashboard } from '@/components/layout/DashboardContext';
import { getStudentMaterials } from '@/app/actions/student-portal';
import { 
  Download, 
  Eye, 
  Layers, 
  Loader2, 
  Calendar, 
  Clock, 
  FileText,
  Search,
  Box
} from 'lucide-react';
import DocumentViewer from '@/components/ui/DocumentViewer';

export default function MaterialsStudentClient() {
  const { selectedModuleId, setHeaderExtra } = useDashboard();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewUrl, setViewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedModuleId) {
      setMaterials([]);
      return;
    }

    async function loadData() {
      setLoading(true);
      const res = await getStudentMaterials(Number(selectedModuleId));
      if (res.success) setMaterials(res.materials || []);
      setLoading(false);
    }

    loadData();
  }, [selectedModuleId]);

  useEffect(() => {
    if (selectedModuleId) {
      setHeaderExtra(
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 transition-all">
          <div className="h-4 w-[2px] bg-gray-200 mx-1 hidden sm:block"></div>
          <div className="bg-emerald-50 px-3 py-1.5 rounded-full flex items-center gap-2 border border-emerald-100">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 opacity-60 shrink-0">Vault:</span>
            <span className="text-xs font-bold tracking-tight text-emerald-600 italic">Lectures</span>
          </div>
        </div>
      );
    }
    return () => setHeaderExtra(null);
  }, [selectedModuleId, setHeaderExtra]);

  if (!selectedModuleId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-gray-50/50 rounded-[32px] m-4">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
          <Layers className="w-8 h-8 text-gray-200" />
        </div>
        <h2 className="text-xl font-black text-[#071a4a] mb-1 tracking-tight">Access Course Portal</h2>
        <p className="text-gray-400 max-w-sm text-[10px] font-bold uppercase tracking-widest">Select a course to view lecture materials.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700">
      
      {/* Slim Header */}
      <div className="bg-[#071a4a] p-6 sm:p-8 rounded-[24px] shadow-xl shadow-blue-900/10 relative overflow-hidden flex items-center justify-between border border-blue-400/10">
        <div className="relative z-10 flex items-center gap-4">
           <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center shadow-lg">
             <Layers className="w-6 h-6 text-white" />
           </div>
           <div>
             <h2 className="text-xl font-black text-white tracking-tight uppercase italic leading-none">Resource <span className="text-blue-400">Vault</span></h2>
             <p className="text-blue-100/40 text-[9px] font-black uppercase tracking-[2px] mt-1.5">Learning Materials • Full Access</p>
           </div>
        </div>
        <div className="hidden sm:flex bg-white/5 py-2 px-4 rounded-xl border border-white/10 items-center">
            <div className="text-center">
               <p className="text-lg font-black text-white leading-none">{materials.length || 0}</p>
               <p className="text-[8px] font-black uppercase tracking-widest text-blue-300 opacity-60">Items</p>
            </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[28px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          {loading ? (
             <div className="py-16 flex flex-col items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#071a4a] opacity-20 mb-3" />
                <p className="text-[9px] font-black uppercase tracking-[4px] text-gray-400">Syncing Vault</p>
             </div>
          ) : materials.length === 0 ? (
             <div className="py-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[24px] opacity-20 m-6">
                <Box className="w-10 h-10" />
                <p className="text-[10px] font-black uppercase tracking-[4px] mt-3">Library is empty</p>
             </div>
          ) : (
            <table className="w-full text-left border-separate border-spacing-0 min-w-[700px]">
              <thead>
                <tr className="uppercase tracking-[2px] text-[9px] font-black text-gray-400 bg-gray-50/50">
                  <th className="py-4 px-6 border-b border-gray-100">Index</th>
                  <th className="py-4 px-6 border-b border-gray-100">Title</th>
                  <th className="py-4 px-6 border-b border-gray-100 text-center">Date</th>
                  <th className="py-4 px-6 border-b border-gray-100 text-center">Time</th>
                  <th className="py-4 px-6 border-b border-gray-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {materials.map((mat, index) => (
                  <tr key={mat.id} className="group hover:bg-blue-50/30 transition-all duration-300">
                    <td className="py-4 px-6">
                       <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center font-black text-[#071a4a] text-[10px] group-hover:bg-[#071a4a] group-hover:text-white transition-all shadow-sm border border-gray-100">
                         {index + 1}
                       </span>
                    </td>
                    <td className="py-4 px-6">
                       <div className="flex flex-col">
                          <span className="text-sm font-black text-[#071a4a] group-hover:text-blue-600 transition-colors tracking-tight leading-tight uppercase truncate max-w-[200px]">{mat.title}</span>
                          <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-1">Resource Item</span>
                       </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                       <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                          <Calendar className="w-3 h-3 text-blue-400" />
                          <span className="text-[10px] font-black text-[#071a4a]">{mat.uploadedDate}</span>
                       </div>
                    </td>
                    <td className="py-4 px-6 text-center text-[10px] font-bold text-gray-400">
                       {mat.uploadedTime}
                    </td>
                    <td className="py-4 px-6 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setViewUrl(mat.fileUrl)}
                            className="w-9 h-9 rounded-lg bg-[#071a4a] text-white flex items-center justify-center shadow-md shadow-blue-900/10 hover:scale-110 active:scale-95 transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a 
                            href={mat.fileUrl} 
                            download
                            className="w-9 h-9 rounded-lg bg-gray-50 text-gray-400 border border-gray-100 hover:bg-green-500 hover:text-white flex items-center justify-center transition-all shadow-sm"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <DocumentViewer url={viewUrl} onClose={() => setViewUrl(null)} />
    </div>
  );
}
