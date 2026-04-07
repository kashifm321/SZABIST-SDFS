'use client';

import { useState, useEffect, useTransition } from 'react';
import { useDashboard } from '@/components/layout/DashboardContext';
import { getEnrolledStudentsForModule, getModuleDetails } from '@/app/actions/student';
import { Loader2, Users, BookOpen, GraduationCap, Calendar, Hash, ClipboardCheck } from 'lucide-react';

export default function CourseInfoPage() {
  const { selectedModuleId } = useDashboard();
  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedModuleId) {
      setLoading(false);
      return;
    }

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [modRes, studRes] = await Promise.all([
          getModuleDetails(selectedModuleId!),
          getEnrolledStudentsForModule(selectedModuleId!)
        ]);

        if (modRes.success) setModule(modRes.module);
        if (studRes.success) setStudents(studRes.students!);
        else if (studRes.error) setError(studRes.error);
      } catch (err) {
        setError('Failed to load course information.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [selectedModuleId]);

  if (!selectedModuleId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
          <BookOpen className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Course Selected</h2>
        <p className="text-gray-500 max-w-sm">
          Please go back to the Dashboard and select a course to view its detailed information and enrolled students.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#071a4a]" />
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Course Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      {/* Course Header Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden p-8">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#071a4a] text-white rounded-xl shadow-lg shadow-[#071a4a]/20">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              {module?.course?.name || module?.name}
            </h1>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 pt-6 border-t border-gray-100">
            <div className="flex flex-col items-center space-y-1 text-center">
              <span className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                COURSE ID
              </span>
              <p className="text-sm font-bold text-gray-700">{module?.course?.code || 'N/A'}</p>
            </div>
            <div className="flex flex-col items-center space-y-1 text-center">
              <span className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <Users className="w-3 h-3" /> Class Section
              </span>
              <p className="text-sm font-bold text-gray-700">{module?.section || 'TBD'}</p>
            </div>
            <div className="flex flex-col items-center space-y-1 text-center">
              <span className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <Calendar className="w-3 h-3" /> Semester Level
              </span>
              <p className="text-sm font-bold text-gray-700">{module?.semesterLevel || 'N/A'}</p>
            </div>
            <div className="flex flex-col items-center space-y-1 text-center">
              <span className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <BookOpen className="w-3 h-3" /> Semester Type
              </span>
              <p className="text-sm font-bold text-gray-700 uppercase">{module?.academicSemester || 'N/A'}</p>
            </div>
            <div className="flex flex-col items-center space-y-1 text-center">
              <span className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <Calendar className="w-3 h-3" /> Semester Year
              </span>
              <p className="text-sm font-bold text-gray-700">2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Students List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Enrolled Students</h2>
          <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black rounded-full uppercase tracking-tighter">
            Total: {students.length}
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
            <table className="w-full text-left border-separate border-spacing-0 relative min-w-[400px]">
              <thead className="sticky top-0 z-10 bg-[#071a4a] text-white">
                <tr className="uppercase tracking-widest">
                  <th className="px-6 py-4 text-xs font-black border-r border-white/10">Roll No</th>
                  <th className="px-6 py-4 text-xs font-black border-r border-white/10">Name</th>
                  <th className="px-6 py-4 text-xs font-black text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400 text-sm italic">
                      No students have been enrolled in this course yet.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-gray-600 border-r border-gray-200">{student.registrationNumber}</td>
                      <td className="px-6 py-4 text-sm font-bold text-[#071a4a] border-r border-gray-200">{student.name}</td>
                      <td className="px-6 py-4 text-center text-xs">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full font-bold shadow-sm border border-green-100">
                          <ClipboardCheck className="w-3.5 h-3.5" />
                          Enrolled
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
