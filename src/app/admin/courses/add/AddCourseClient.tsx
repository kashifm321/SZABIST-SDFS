'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addCourse, updateCourse, deleteCourse } from '@/app/actions/course';
import { Search, Plus, Pencil, Trash2, X, BookOpen, GraduationCap, Clock, Loader2 } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

type Course = {
  id: number;
  code: string;
  name: string;
  prerequisite: string;
  creditHours: number;
};

export default function AddCourseClient({ initialCourses }: { initialCourses: Course[] }) {
  const router = useRouter();
  const [courses, setCourses] = useState(initialCourses);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Simple local filter for live data
  const filtered = initialCourses.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (formData: FormData) => {
    setErrorMsg('');
    setSuccessMsg('');
    startTransition(async () => {
      const result = await addCourse(null, formData);
      if (result?.error) {
        setErrorMsg(result.error);
      } else {
        setSuccessMsg('Course registered successfully!');
        setTimeout(() => {
          setShowModal(false);
          setSuccessMsg('');
          router.refresh();
        }, 1200);
      }
    });
  };

  const handleUpdate = (formData: FormData) => {
    if (!editingCourse) return;
    setErrorMsg('');
    setSuccessMsg('');
    startTransition(async () => {
      const result = await updateCourse(editingCourse.id, formData);
      if (result?.error) {
        setErrorMsg(result.error);
      } else {
        setSuccessMsg('Course updated successfully!');
        setTimeout(() => {
          setEditingCourse(null);
          setSuccessMsg('');
          router.refresh();
        }, 1200);
      }
    });
  };

  const handleDelete = () => {
    if (!deletingId) return;
    startTransition(async () => {
      const result = await deleteCourse(deletingId);
      if (result?.error) {
        alert(result.error);
      }
      setDeletingId(null);
      setShowConfirm(false);
      router.refresh();
    });
  };

  return (
    <div className="p-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-extrabold text-[#071a4a] tracking-tight">Academic Courses</h1>
        
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-[#071a4a] transition-colors" />
            <input
              type="text"
              placeholder="Search course by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#071a4a]/10 focus:border-[#071a4a] w-64 shadow-sm transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                title="Clear Search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#071a4a] hover:bg-[#050f2e] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#071a4a]/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Create Course
          </button>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="szabist-table text-left min-w-[550px]">
            <thead>
              <tr>
                <th className="px-6 py-4 text-[13px] font-black text-gray-700 uppercase tracking-widest text-center">Course Code</th>
                <th className="px-6 py-4 text-[13px] font-black text-gray-700 uppercase tracking-widest">Course Name</th>
                <th className="px-6 py-4 text-[13px] font-black text-gray-700 uppercase tracking-widest text-center">Pre-requisite</th>
                <th className="px-6 py-4 text-[13px] font-black text-gray-700 uppercase tracking-widest text-center">Credit Hour</th>
                <th className="px-6 py-4 text-[13px] font-black text-gray-700 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No courses found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4 font-bold text-[#071a4a] text-sm text-center">{course.code}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-800">{course.name}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-sm font-bold uppercase tracking-tight ${course.prerequisite === 'Null' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {course.prerequisite}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 grayscale opacity-60">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-sm font-bold">{course.creditHours}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end transition-all">
                        <button 
                          onClick={() => { setEditingCourse(course); setErrorMsg(''); setSuccessMsg(''); }}
                          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all" 
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setDeletingId(course.id); setShowConfirm(true); }}
                          className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all" 
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showModal || editingCourse) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in zoom-in duration-200">
            <div className="bg-[#071a4a] p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-extrabold">{editingCourse ? 'Edit Course' : 'Register New Course'}</h2>
                <p className="text-blue-200 text-xs mt-0.5 uppercase tracking-widest font-bold">Academic curriculum registration</p>
              </div>
              <button 
                onClick={() => { setShowModal(false); setEditingCourse(null); }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form action={editingCourse ? handleUpdate : handleAdd} className="p-8 space-y-5">
              {errorMsg && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl font-bold text-center">{errorMsg}</div>}
              {successMsg && <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-xl font-bold text-center">{successMsg}</div>}
              
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-extrabold text-gray-700 uppercase tracking-widest mb-2">Course Code</label>
                  <input name="code" type="text" required defaultValue={editingCourse?.code} placeholder="CSC 3202" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[#071a4a]/10 focus:border-[#071a4a] outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[13px] font-extrabold text-gray-700 uppercase tracking-widest mb-2">Credit Hours</label>
                  <input name="creditHours" type="number" required defaultValue={editingCourse?.creditHours} placeholder="3" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[#071a4a]/10 focus:border-[#071a4a] outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-extrabold text-gray-700 uppercase tracking-widest mb-2">Course Name</label>
                <input name="name" type="text" required defaultValue={editingCourse?.name} placeholder="Design and Analysis of Algorithm" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[#071a4a]/10 focus:border-[#071a4a] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[13px] font-extrabold text-gray-700 uppercase tracking-widest mb-2">Pre-requisite</label>
                <input name="prerequisite" type="text" defaultValue={editingCourse?.prerequisite || ''} placeholder="add if any" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-[#071a4a]/10 focus:border-[#071a4a] outline-none transition-all" />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => { setShowModal(false); setEditingCourse(null); }}
                  className="flex-1 px-4 py-3 text-[#071a4a] font-bold text-sm hover:bg-gray-50 rounded-xl transition-all"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-[#071a4a] text-white font-bold text-sm px-4 py-3 rounded-xl shadow-xl shadow-[#071a4a]/20 hover:bg-[#050f2e] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingCourse ? 'Save Changes' : 'Confirm Entry')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => { setShowConfirm(false); setDeletingId(null); }}
        onConfirm={handleDelete}
        isPending={isPending}
        title="Delete Course?"
        message="Are you sure you want to remove this course from the list? All associated records might be affected."
        confirmText="Remove Course"
        type="danger"
      />
    </div>
  );
}
