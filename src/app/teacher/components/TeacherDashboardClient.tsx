'use client';

import { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2 } from 'lucide-react';
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
        <div className="ml-4 flex items-center gap-2 bg-[#071a4a] text-white px-4 py-1.5 rounded-md shadow-sm animate-in fade-in slide-in-from-left-2 duration-300">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Selected Course:</span>
          <span className="text-xs font-bold">{selectedModule.course?.name || selectedModule.name}</span>
        </div>
      );
    } else {
      setHeaderExtra(null);
    }
    
    // Cleanup on unmount
    return () => setHeaderExtra(null);
  }, [selectedModule, setHeaderExtra]);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Courses List</h1>
        <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-widest">Manage your assigned academic modules</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 uppercase tracking-widest text-[#071a4a]/70">
                <th className="px-6 py-4 text-xs font-black">Course Id</th>
                <th className="px-6 py-4 text-xs font-black">Name</th>
                <th className="px-6 py-4 text-xs font-black text-center">Semester Level</th>
                <th className="px-6 py-4 text-xs font-black text-center">Section</th>
                <th className="px-6 py-4 text-xs font-black text-center">Semester</th>
                <th className="px-6 py-4 text-xs font-black">Department</th>
                <th className="px-6 py-4 text-xs font-black text-center">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {modules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm font-medium">
                    No classes assigned yet. Please contact your administrator.
                  </td>
                </tr>
              ) : (
                modules.map((module: Module) => (
                  <tr 
                    key={module.id} 
                    className={`hover:bg-gray-50 transition-colors group ${selectedModuleId === module.id ? 'bg-blue-50/30' : ''}`}
                  >
                    <td className="px-6 py-4 text-sm font-bold text-gray-700">{module.course?.code || `MOD-${module.id}`}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-[#071a4a] group-hover:underline underline-offset-4 cursor-pointer">
                        {module.course?.name || module.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-600 font-medium">{module.semesterLevel}</td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-bold">{module.section}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-600 font-medium uppercase tracking-tighter">{module.academicSemester}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-black text-gray-400 border border-gray-200 px-2 py-0.5 rounded shadow-sm">{module.department}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => setSelectedModuleId(prev => prev === module.id ? null : module.id)}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 
                          ${selectedModuleId === module.id 
                            ? 'bg-[#071a4a] text-white shadow-lg shadow-[#071a4a]/20' 
                            : 'bg-white border border-gray-200 text-gray-400 hover:border-[#071a4a] hover:text-[#071a4a]'}`}
                      >
                        {selectedModuleId === module.id ? (
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3" /> Selected
                          </span>
                        ) : 'Select'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <p className="mt-6 text-center text-[10px] font-bold text-gray-300 uppercase tracking-[4px]">
        A list of assignments
      </p>
    </div>
  );
}
