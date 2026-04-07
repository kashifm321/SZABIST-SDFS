'use client';

import { useState, useEffect } from 'react';
import { useDashboard } from '@/components/layout/DashboardContext';
import { getStudentAnnouncements } from '@/app/actions/student-portal';
import { 
  Megaphone, 
  Loader2, 
  Calendar, 
  Clock, 
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Inbox,
  Bell
} from 'lucide-react';

export default function AnnouncementsStudentClient() {
  const { selectedModuleId, setHeaderExtra } = useDashboard();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedModuleId) {
      setAnnouncements([]);
      return;
    }

    async function loadData() {
      setLoading(true);
      const res = await getStudentAnnouncements(Number(selectedModuleId));
      if (res.success) {
        setAnnouncements(res.announcements || []);
        if (res.announcements?.length > 0) {
          setExpandedId(res.announcements[0].id);
        }
      }
      setLoading(false);
    }

    loadData();
  }, [selectedModuleId]);

  useEffect(() => {
    if (selectedModuleId) {
      setHeaderExtra(
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 transition-all">
          <div className="h-4 w-[2px] bg-gray-200 mx-1 hidden sm:block"></div>
          <div className="bg-blue-50 px-3 py-1.5 rounded-full flex items-center gap-2 border border-blue-100">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 opacity-60 shrink-0">Feed:</span>
            <span className="text-xs font-bold tracking-tight text-blue-600 italic">Broadcasts</span>
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
          <Megaphone className="w-8 h-8 text-gray-200" />
        </div>
        <h2 className="text-xl font-black text-[#071a4a] mb-1 tracking-tight">Access Course Portal</h2>
        <p className="text-gray-400 max-w-sm text-[10px] font-bold uppercase tracking-widest">Select a course to view official announcements.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-700">
      
      {/* Mini Header */}
      <div className="bg-[#071a4a] p-6 sm:p-8 rounded-[24px] shadow-xl shadow-blue-900/10 relative overflow-hidden flex items-center justify-between border border-blue-400/10">
        <div className="relative z-10 flex items-center gap-4">
           <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center shadow-lg">
             <Bell className="w-6 h-6 text-white" />
           </div>
           <div>
             <h2 className="text-xl font-black text-white tracking-tight uppercase italic leading-none">Course <span className="text-blue-400">Updates</span></h2>
             <p className="text-blue-100/40 text-[9px] font-black uppercase tracking-[2px] mt-1.5">Module Broadcast System • 2024-25</p>
           </div>
        </div>
        <div className="hidden sm:flex bg-white/5 py-2 px-4 rounded-xl border border-white/10 items-center gap-3">
            <div className="text-center">
               <p className="text-lg font-black text-white leading-none">{announcements.length}</p>
               <p className="text-[8px] font-black uppercase tracking-widest text-blue-300 opacity-60">Total</p>
            </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
           <div className="py-16 flex flex-col items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#071a4a] opacity-20 mb-3" />
              <p className="text-[9px] font-black uppercase tracking-[4px] text-gray-400">Syncing Feed</p>
           </div>
        ) : announcements.length === 0 ? (
           <div className="py-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[24px] opacity-20">
              <Inbox className="w-10 h-10" />
              <p className="text-[10px] font-black uppercase tracking-[4px] mt-3">Zero broadcasts found</p>
           </div>
        ) : (
          announcements.map((ann) => (
            <div 
              key={ann.id} 
              className={`bg-white border rounded-[20px] transition-all duration-300 overflow-hidden ${expandedId === ann.id ? 'border-blue-400/50 shadow-lg shadow-blue-900/5' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/30'}`}
            >
               <div 
                onClick={() => setExpandedId(expandedId === ann.id ? null : ann.id)}
                className="p-4 sm:p-5 cursor-pointer flex items-center justify-between group"
               >
                  <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${expandedId === ann.id ? 'bg-[#071a4a] text-white' : 'bg-gray-50 text-gray-400'}`}>
                        <MessageSquare className="w-4 h-4" />
                     </div>
                     <div className="flex flex-col">
                        <h4 className="text-sm font-black text-[#071a4a] tracking-tight leading-tight uppercase truncate max-w-[200px] sm:max-w-md">{ann.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">
                           <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> {ann.date}</span>
                           <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                           <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {ann.time}</span>
                        </div>
                     </div>
                  </div>
                  <div className={`w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[#071a4a] transition-all duration-300 ${expandedId === ann.id ? 'rotate-180 bg-[#071a4a] text-white shadow-md' : 'group-hover:bg-[#071a4a] group-hover:text-white'}`}>
                     <ChevronDown className="w-4 h-4 font-black" />
                  </div>
               </div>
               
               {expandedId === ann.id && (
                 <div className="px-5 pb-5 pt-0 animate-in slide-in-from-top-2 duration-300">
                    <div className="h-[1px] w-full bg-gray-50 mb-4"></div>
                    <div className="bg-gray-50/50 rounded-[16px] p-5">
                       <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-wrap italic">
                         {ann.content}
                       </p>
                       
                       <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between opacity-30">
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Type: Formal Notice</p>
                          <div className="flex items-center gap-1.5">
                             <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                             <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">System Authenticated</span>
                          </div>
                       </div>
                    </div>
                 </div>
               )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
