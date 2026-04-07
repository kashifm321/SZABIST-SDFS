'use client';

import { useState, useEffect } from 'react';
import { useDashboard } from '@/components/layout/DashboardContext';
import { getStudentSolutions } from '@/app/actions/student-portal';
import { 
  FileCheck2, 
  Download, 
  Eye, 
  Loader2, 
  FileText, 
  ShieldCheck,
  Search,
  Box
} from 'lucide-react';
import DocumentViewer from '@/components/ui/DocumentViewer';

export default function SolutionsStudentClient() {
  const { selectedModuleId, setHeaderExtra } = useDashboard();
  const [solutions, setSolutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewUrl, setViewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedModuleId) {
      setSolutions([]);
      return;
    }

    async function loadData() {
      setLoading(true);
      const res = await getStudentSolutions(Number(selectedModuleId));
      if (res.success) setSolutions(res.solutions || []);
      setLoading(false);
    }

    loadData();
  }, [selectedModuleId]);

  useEffect(() => {
    if (selectedModuleId) {
      setHeaderExtra(
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 transition-all">
          <div className="h-4 w-[2px] bg-gray-200 mx-1 hidden sm:block"></div>
          <div className="bg-indigo-50 px-3 py-1.5 rounded-full flex items-center gap-2 border border-indigo-100">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 opacity-60 shrink-0">Key:</span>
            <span className="text-xs font-bold tracking-tight text-indigo-600 italic">Solutions</span>
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
          <FileCheck2 className="w-8 h-8 text-gray-200" />
        </div>
        <h2 className="text-xl font-black text-[#071a4a] mb-1 tracking-tight">Access Course Portal</h2>
        <p className="text-gray-400 max-w-sm text-[10px] font-bold uppercase tracking-widest">Select a course to view official solution keys.</p>
      </div>
    );
  }

  const groupedSolutions = {
    ASSIGNMENT: solutions.filter(s => s.type === 'ASSIGNMENT'),
    QUIZ: solutions.filter(s => s.type === 'QUIZ'),
    MID_TERM: solutions.filter(s => s.type === 'MID_TERM'),
    FINAL_TERM: solutions.filter(s => s.type === 'FINAL_TERM'),
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700">
      
      {/* Slim Header */}
      <div className="bg-[#071a4a] p-6 sm:p-8 rounded-[24px] shadow-xl shadow-blue-900/10 relative overflow-hidden flex items-center justify-between border border-blue-400/10">
        <div className="relative z-10 flex items-center gap-4">
           <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center shadow-lg">
             <ShieldCheck className="w-6 h-6 text-white" />
           </div>
           <div>
             <h2 className="text-xl font-black text-white tracking-tight uppercase italic leading-none">Solution <span className="text-blue-400">Archive</span></h2>
             <p className="text-blue-100/40 text-[9px] font-black uppercase tracking-[2px] mt-1.5">Official Answer Keys • Academic Year 2024-25</p>
           </div>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#071a4a] opacity-20 mb-3" />
            <p className="text-[9px] font-black uppercase tracking-[4px] text-gray-400">Verifying Keys</p>
        </div>
      ) : solutions.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[24px] opacity-20 m-6">
           <Box className="w-10 h-10" />
           <p className="text-[10px] font-black uppercase tracking-[4px] mt-3">No solutions released yet</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedSolutions).map(([groupType, items]) => {
            if (items.length === 0) return null;
            return (
              <div key={groupType} className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-3 px-2">
                   <h3 className="text-sm font-black text-[#071a4a] tracking-tight italic uppercase opacity-60">{groupType.replace('_', ' ')}s</h3>
                   <div className="h-[1px] flex-1 bg-gray-100/50"></div>
                </div>

                <div className="bg-white border border-gray-100 rounded-[20px] shadow-sm overflow-hidden">
                   <div className="overflow-x-auto scrollbar-hide">
                     <table className="w-full text-left border-separate border-spacing-0 min-w-[600px]">
                        <thead>
                          <tr className="uppercase tracking-[2px] text-[9px] font-black text-gray-400 bg-gray-50/50">
                            <th className="py-4 px-6 border-b border-gray-100">Index</th>
                            <th className="py-4 px-6 border-b border-gray-100">Title</th>
                            <th className="py-4 px-6 border-b border-gray-100 text-right">Access</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {items.map((item: any) => (
                            <tr key={item.id} className="group hover:bg-indigo-50/30 transition-all duration-300">
                               <td className="py-4 px-6">
                                  <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center font-black text-[#071a4a] text-[10px] group-hover:bg-[#071a4a] group-hover:text-white transition-all shadow-sm border border-gray-100">
                                    {item.sequenceNo || 1}
                                  </span>
                               </td>
                               <td className="py-4 px-6">
                                  <div className="flex flex-col">
                                     <span className="text-sm font-black text-[#071a4a] group-hover:text-indigo-600 transition-colors tracking-tight uppercase truncate max-w-[200px]">{item.title}</span>
                                     <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-1">Verified Key</span>
                                  </div>
                               </td>
                               <td className="py-4 px-6 text-right">
                                  <button 
                                    onClick={() => setViewUrl(item.solutionUrl)}
                                    className="inline-flex items-center gap-2 px-6 py-2 bg-[#071a4a] text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md shadow-blue-900/10 hover:scale-105 active:scale-95 transition-all"
                                  >
                                    <Eye className="w-4 h-4" /> View Key
                                  </button>
                               </td>
                            </tr>
                          ))}
                        </tbody>
                     </table>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DocumentViewer url={viewUrl} onClose={() => setViewUrl(null)} />
    </div>
  );
}
