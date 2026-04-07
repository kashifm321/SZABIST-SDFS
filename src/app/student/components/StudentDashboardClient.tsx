'use client';

import { useEffect, useState } from 'react';
import { useDashboard } from '@/components/layout/DashboardContext';
import { Eye, BookOpen, GraduationCap, Users, Building2, CalendarDays, ChevronRight } from 'lucide-react';

interface StudentDashboardClientProps {
  courses: any[];
}

export default function StudentDashboardClient({ courses }: StudentDashboardClientProps) {
  const { setSelectedModuleId, selectedModuleId, setHeaderExtra, setSelectedModuleName } = useDashboard();

  useEffect(() => {
    const selected = courses.find(c => c.id === selectedModuleId);
    if (selected) {
      setHeaderExtra(
        <div className="flex items-center gap-2 sm:gap-3 animate-in fade-in slide-in-from-left-2 transition-all">
          <div className="h-4 w-[2px] bg-gray-200 mx-1 sm:mx-2 hidden sm:block"></div>
          <div className="bg-[#071a4a] text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-full shadow-md flex items-center gap-2 sm:gap-2.5 border border-blue-400/20">
            <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-blue-300 opacity-80 shrink-0">Selected:</span>
            <span className="text-xs sm:text-sm font-bold tracking-tight truncate max-w-[100px] sm:max-w-none">{selected.name}</span>
          </div>
        </div>
      );
    } else {
      setHeaderExtra(null);
    }
  }, [selectedModuleId, courses, setHeaderExtra]);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-700">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-[#071a4a] rounded-[32px] sm:rounded-[48px] p-8 sm:p-12 text-white shadow-2xl shadow-blue-900/20 group">
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-blue-400/10 rounded-full -mr-32 -mt-32 sm:-mr-48 sm:-mt-48 blur-3xl group-hover:bg-blue-400/20 transition-all duration-1000"></div>
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[1px] sm:tracking-[2px] text-blue-100">Student Enrollment Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none italic">
             Student Enroll <span className="text-blue-400 block sm:inline">Course List</span>
          </h1>
          <p className="text-blue-100/70 text-[10px] sm:text-sm font-bold uppercase tracking-[2px] sm:tracking-[4px]">
            Academic Session 2024-25 • Islamabad
          </p>
        </div>
      </div>

      {/* Course Table - Responsive Wrap */}
      <div className="bg-white border border-gray-100 rounded-[32px] sm:rounded-[48px] shadow-xl shadow-gray-200/40 overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-separate border-spacing-0 min-w-[800px] lg:min-w-full">
            <thead>
              <tr className="uppercase tracking-[2px] text-[10px] font-black text-gray-400 bg-gray-50/50">
                <th className="py-4 sm:py-6 px-6 sm:px-10 border-b border-gray-100">Course Id</th>
                <th className="py-4 sm:py-6 px-6 sm:px-10 border-b border-gray-100">Name</th>
                <th className="py-6 sm:py-8 px-6 sm:px-10 border-b border-gray-100 text-center">Lab</th>
                <th className="py-6 sm:py-8 px-6 sm:px-10 border-b border-gray-100 text-center">Semester Level</th>
                <th className="py-6 sm:py-8 px-6 sm:px-10 border-b border-gray-100 text-center">Section</th>
                <th className="py-6 sm:py-8 px-6 sm:px-10 border-b border-gray-100 text-center">Semester</th>
                <th className="py-6 sm:py-8 px-6 sm:px-10 border-b border-gray-100 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                    No courses enrolled yet
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr 
                    key={course.id} 
                    className={`group transition-all duration-300 hover:bg-blue-50/30 ${selectedModuleId === course.id ? 'bg-blue-50/50' : ''}`}
                  >
                    <td className="py-6 sm:py-8 px-6 sm:px-10">
                      <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-[10px] sm:text-[11px] font-black text-[#071a4a] uppercase tracking-widest group-hover:bg-white transition-colors">
                        {course.courseId}
                      </span>
                    </td>
                    <td className="py-6 sm:py-8 px-6 sm:px-10">
                      <div className="flex flex-col">
                        <span className="text-base sm:text-lg font-black text-[#071a4a] group-hover:text-blue-600 transition-colors tracking-tight">
                          {course.name}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-60">
                          Primary Faculty: {course.teacherName}
                        </span>
                      </div>
                    </td>
                    <td className="py-6 sm:py-8 px-6 sm:px-10 text-center">
                       <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-widest ${course.lab === 'Yes' ? 'text-green-500' : 'text-gray-400'}`}>
                         {course.lab}
                       </span>
                    </td>
                    <td className="py-6 sm:py-8 px-6 sm:px-10 text-center">
                       <span className="text-xs sm:text-sm font-black text-[#071a4a]">LEVEL {course.semesterLevel}</span>
                    </td>
                    <td className="py-6 sm:py-8 px-6 sm:px-10 text-center">
                       <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#071a4a]/5 inline-flex items-center justify-center text-[10px] sm:text-xs font-black text-[#071a4a]">
                         {course.section}
                       </span>
                    </td>
                    <td className="py-4 sm:py-6 px-6 sm:px-10 text-center">
                       <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[1px] sm:tracking-[2px] text-gray-400 italic">
                         {course.semester}
                       </span>
                    </td>
                    <td className="py-4 sm:py-6 px-6 sm:px-10 text-right">
                       <button 
                        onClick={() => {
                          setSelectedModuleId(course.id);
                          setSelectedModuleName(course.name);
                        }}
                        className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all shadow-lg
                          ${selectedModuleId === course.id 
                            ? 'bg-green-500 text-white shadow-green-500/20' 
                            : 'bg-[#071a4a] text-white shadow-blue-900/20 hover:shadow-[#071a4a]/30 hover:scale-105 active:scale-95'}`}
                       >
                         {selectedModuleId === course.id ? 'Active' : 'Select'}
                         <ChevronRight className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${selectedModuleId === course.id ? 'hidden' : ''}`} />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="pt-12 flex flex-col items-center justify-center gap-4 opacity-30">
        <div className="h-[1px] w-24 bg-gray-300"></div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[12px] text-center pl-[12px]">
          SZABIST CLOUD PORTAL
        </p>
      </div>
    </div>
  );
}
