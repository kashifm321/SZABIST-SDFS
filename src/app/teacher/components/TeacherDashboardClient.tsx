'use client';

import { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, LayoutDashboard, ChevronRight, Users, GraduationCap, Building2, CalendarDays } from 'lucide-react';
import { useDashboard } from '@/components/layout/DashboardContext';

interface Module {
  id: number;
  name: string;
  semesterLevel: number;
  section: string;
  academicSemester: string;
  department: string;
  course: {
    code: string;
    name: string;
  } | null;
}

interface TeacherDashboardClientProps {
  modules: Module[];
}

export default function TeacherDashboardClient({ modules }: TeacherDashboardClientProps) {
  const { setHeaderExtra, selectedModuleId, setSelectedModuleId } = useDashboard();

  const selectedModule = modules.find((m: Module) => m.id === selectedModuleId);

  // Update header in shell when selection changes
  useEffect(() => {
    if (selectedModule) {
      setHeaderExtra(
        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 transition-all">
          <div className="h-4 w-[2px] bg-gray-200 mx-2 hidden sm:block"></div>
          <div className="bg-[#071a4a] text-white px-5 py-2 rounded-full shadow-md flex items-center gap-2.5 border border-blue-400/20">
            <span className="text-[11px] font-black uppercase tracking-widest text-blue-300 opacity-80">Active Mode:</span>
            <span className="text-sm font-bold tracking-tight">{selectedModule.course?.name || selectedModule.name}</span>
          </div>
        </div>
      );
    } else {
      setHeaderExtra(null);
    }
    
    return () => setHeaderExtra(null);
  }, [selectedModule, setHeaderExtra]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      
      {/* Dynamic Welcome / Header */}
      <div className="relative overflow-hidden bg-[#071a4a] rounded-[48px] p-12 text-white shadow-2xl shadow-blue-900/20 group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full -mr-48 -mt-48 blur-3xl group-hover:bg-blue-400/20 transition-all duration-1000"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/10 rounded-full -ml-32 -mb-32 blur-3xl group-hover:bg-indigo-400/20 transition-all duration-1000"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
              <span className="text-[10px] font-black uppercase tracking-[2px] text-blue-100">Portal Status: Online</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none italic">
               Assigned Classes <span className="text-blue-400">Hub</span>
            </h1>
            <p className="text-blue-100/70 text-sm font-bold uppercase tracking-[4px] max-w-md">
              Academic Session 2024-25 • Department Control Center
            </p>
          </div>
          
          <div className="flex gap-4">
             <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] text-center min-w-[120px]">
                <p className="text-2xl font-black">{modules.length}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-blue-300">Total Courses</p>
             </div>
             <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] text-center min-w-[120px]">
                <p className="text-2xl font-black">{modules.reduce((acc, m) => acc + (m.semesterLevel || 0), 0)}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-blue-300">Level Sum</p>
             </div>
          </div>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {modules.length === 0 ? (
          <div className="lg:col-span-2 py-32 flex flex-col items-center justify-center bg-gray-50 border-4 border-dashed border-gray-100 rounded-[48px]">
            <BookOpen className="w-16 h-16 text-gray-200 mb-4" />
            <p className="text-gray-400 font-black uppercase tracking-[4px] text-sm">No classes assigned yet</p>
          </div>
        ) : (
          modules.map((module) => (
            <div 
              key={module.id}
              onClick={() => setSelectedModuleId(module.id)}
              className={`group relative p-8 rounded-[40px] border transition-all duration-500 cursor-pointer overflow-hidden
                ${selectedModuleId === module.id 
                  ? 'bg-white border-[#071a4a] shadow-2xl shadow-blue-900/10 scale-[1.02]' 
                  : 'bg-white border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 hover:-translate-y-1'}`}
            >
              {/* Highlight Sidebar */}
              <div className={`absolute left-0 top-0 bottom-0 w-2 transition-all duration-500
                ${selectedModuleId === module.id ? 'bg-[#071a4a] opacity-100' : 'bg-gray-100 opacity-0 group-hover:opacity-100'}`}></div>

              <div className="flex flex-col h-full gap-8">
                {/* ID & Section Badge */}
                <div className="flex items-center justify-between">
                  <span className="px-4 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black text-[#071a4a] uppercase tracking-widest">
                    ID: {module.course?.code || `MOD-${module.id}`}
                  </span>
                  <div className={`p-3 rounded-2xl transition-colors ${selectedModuleId === module.id ? 'bg-[#071a4a] text-white shadow-lg shadow-blue-900/20' : 'bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                    <CheckCircle2 className={`w-5 h-5 ${selectedModuleId === module.id ? 'animate-in zoom-in' : ''}`} />
                  </div>
                </div>

                {/* Course Main Info */}
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-[#071a4a] leading-tight tracking-tight group-hover:text-blue-600 transition-colors">
                    {module.course?.name || module.name}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-gray-400 text-[11px] font-bold uppercase tracking-widest border-r pr-3 border-gray-100">
                      <GraduationCap className="w-3.5 h-3.5" /> Level {module.semesterLevel}
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-400 text-[11px] font-bold uppercase tracking-widest border-r pr-3 border-gray-100">
                      <Users className="w-3.5 h-3.5" /> SEC {module.section}
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                      <Building2 className="w-3.5 h-3.5" /> {module.department}
                    </span>
                  </div>
                </div>

                {/* Bottom Stats */}
                <div className="pt-8 border-t border-gray-50 mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#071a4a]">
                    <CalendarDays className="w-4 h-4 opacity-40" />
                    <span className="text-[11px] font-black uppercase tracking-widest opacity-60 italic">{module.academicSemester}</span>
                  </div>
                  
                  <button className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all
                    ${selectedModuleId === module.id ? 'text-[#071a4a]' : 'text-gray-400 group-hover:text-[#071a4a]'}`}>
                    Manage Course <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Decorative Circle */}
              <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full transition-all duration-700
                ${selectedModuleId === module.id ? 'bg-[#071a4a]/5' : 'bg-gray-50/50 group-hover:bg-blue-50/50'}`}></div>
            </div>
          ))
        )}
      </div>

      {/* Footer Branding */}
      <div className="pt-12 flex flex-col items-center justify-center gap-4">
        <div className="h-[1px] w-24 bg-gray-200"></div>
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[12px] text-center pl-[12px]">
          SZABIST CLOUD PORTAL
        </p>
      </div>

    </div>
  );
}
