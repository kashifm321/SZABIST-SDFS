'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { addStudent, deleteStudent, updateStudent } from '@/app/actions/student';
import { Search, Plus, Pencil, Trash2, X, Loader2, Eye, EyeOff } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

type Student = {
  id: number;
  name: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  registrationNumber?: string;
};

export default function ManageStudentsClient({ students }: { students: Student[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const editFormRef = useRef<HTMLFormElement>(null);

  const filtered = students.filter(
    (s) =>
      s.firstName.toLowerCase().includes(search.toLowerCase()) ||
      s.lastName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.registrationNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (formData: FormData) => {
    setErrorMsg('');
    setSuccessMsg('');
    startTransition(async () => {
      const result = await addStudent(null, formData);
      if (result?.error) {
        setErrorMsg(result.error);
      } else {
        setSuccessMsg('Student added successfully!');
        formRef.current?.reset();
        setTimeout(() => {
          setShowModal(false);
          setSuccessMsg('');
          router.refresh();
        }, 1200);
      }
    });
  };

  const handleUpdate = (formData: FormData) => {
    if (!editingStudent) return;
    setErrorMsg('');
    setSuccessMsg('');
    
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const registrationNumber = formData.get('registrationNumber') as string;

    startTransition(async () => {
      const result = await updateStudent(editingStudent.id, firstName, lastName, email, registrationNumber);
      if (result?.error) {
        setErrorMsg(result.error);
      } else {
        setSuccessMsg('Student updated successfully!');
        setTimeout(() => {
          setEditingStudent(null);
          setSuccessMsg('');
          router.refresh();
        }, 1200);
      }
    });
  };

  const handleDelete = () => {
    if (!deletingId) return;
    startTransition(async () => {
      await deleteStudent(deletingId);
      setDeletingId(null);
      setShowConfirm(false);
      router.refresh();
    });
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Student List</h1>
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#071a4a] w-52 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5 hover:bg-gray-100 rounded-full"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => { setShowModal(true); setErrorMsg(''); setSuccessMsg(''); }}
            className="flex items-center gap-2 bg-[#071a4a] hover:bg-[#050f2e] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Reg #</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">First Name</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Last Name</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Email</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Role</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                  {students.length === 0 ? 'No students added yet.' : 'No results found.'}
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 text-gray-800 font-medium">{s.registrationNumber || 'N/A'}</td>
                  <td className="px-5 py-3.5 text-gray-700">{s.firstName}</td>
                  <td className="px-5 py-3.5 text-gray-700">{s.lastName}</td>
                  <td className="px-5 py-3.5 text-gray-600">{s.email}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium">
                      STUDENT
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setEditingStudent(s); setErrorMsg(''); setSuccessMsg(''); }}
                        className="flex items-center gap-1 bg-[#071a4a] hover:bg-[#050f2e] text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => { setDeletingId(s.id); setShowConfirm(true); }}
                        disabled={deletingId === s.id && isPending}
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-60"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">Add Student</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form ref={formRef} action={handleAdd} className="p-6 space-y-4">
              {errorMsg && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">{errorMsg}</div>}
              {successMsg && <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg">{successMsg}</div>}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name</label>
                  <input name="firstName" type="text" required 
                    className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#071a4a]/20 focus:border-[#071a4a] transition-all" 
                    placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name</label>
                  <input name="lastName" type="text" required 
                    className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#071a4a]/20 focus:border-[#071a4a] transition-all" 
                    placeholder="Doe" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Registration Number</label>
                  <input name="registrationNumber" type="text" required 
                    className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#071a4a]/20 focus:border-[#071a4a] transition-all" 
                    placeholder="Reg #" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                  <input name="email" type="email" required 
                    className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#071a4a]/20 focus:border-[#071a4a] transition-all" 
                    placeholder="student@szabist-isb.edu.pk" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input name="password" type={showPassword ? "text" : "password"} required minLength={6} 
                    className="w-full px-4 pr-12 py-2.5 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#071a4a]/20 focus:border-[#071a4a] transition-all" 
                    placeholder="••••••••" />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isPending}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2 
                    ${isPending ? 'bg-[#071a4a]/60 cursor-not-allowed' : 'bg-[#071a4a] hover:bg-[#050f2e]'}`}>
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">Edit Student</h2>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form ref={editFormRef} action={handleUpdate} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg">
                  {successMsg}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name</label>
                  <input name="firstName" type="text" required defaultValue={editingStudent.firstName}
                    className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#071a4a]/20 focus:border-[#071a4a] transition-all"
                    placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name</label>
                  <input name="lastName" type="text" required defaultValue={editingStudent.lastName}
                    className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#071a4a]/20 focus:border-[#071a4a] transition-all"
                    placeholder="Doe" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Registration Number</label>
                  <input name="registrationNumber" type="text" required defaultValue={editingStudent.registrationNumber}
                    className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#071a4a]/20 focus:border-[#071a4a] transition-all"
                    placeholder="Reg #" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                  <input name="email" type="email" required defaultValue={editingStudent.email}
                    className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#071a4a]/20 focus:border-[#071a4a] transition-all"
                    placeholder="student@szabist.edu.pk" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingStudent(null)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isPending}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2 
                    ${isPending ? 'bg-[#071a4a]/60 cursor-not-allowed' : 'bg-[#071a4a] hover:bg-[#050f2e]'}`}>
                  {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : 'Update Changes'}
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
        title="Confirm Deletion"
        message="Are you sure you want to delete this student? This action cannot be revoked."
        confirmText="Remove Now"
        type="danger"
      />
    </div>
  );
}
