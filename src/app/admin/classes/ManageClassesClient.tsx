'use client';

import { useState, useTransition, useMemo, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Pencil,
  X, 
  Users, 
  BookOpen,
  Clock,
  Search,
  UserCheck,
  UserX,
  CheckCircle2,
  Upload,
  FileSpreadsheet,
  UserPlus,
  RefreshCw,
  AlertCircle,
  Paperclip
} from 'lucide-react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { createModule, deleteModule, assignTeacher, updateModule } from '@/app/actions/module';
import { 
  getEnrolledStudents, 
  enrollStudentByRegistration, 
  enrollStudentsBatch, 
  unenrollStudent 
} from '@/app/actions/student';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

type Course = {
  id: number;
  code: string;
  name: string;
  prerequisite: string;
  creditHours: number;
};

type Teacher = {
  id: number;
  name: string;
  email: string;
};

type EnrolledStudent = {
  id: number;
  name: string;
  email: string;
  registrationNo: string;
  role: string;
};

type CourseClass = {
  id: number;
  courseId: string;
  courseName: string;
  prerequisite: string;
  creditHours: number;
  department: string;
  semesterLevel: string;
  section: string;
  instructor: string;
  status: string;
  totalEnrolled: number;
  academicYear: number;
  academicSemester: string;
};

export default function ManageClassesClient({ 
  initialClasses, 
  availableCourses,
  availableTeachers = []
}: { 
  initialClasses: CourseClass[], 
  availableCourses: Course[],
  availableTeachers?: Teacher[]
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAddStudentsModal, setShowAddStudentsModal] = useState(false);
  const [showUnassignConfirm, setShowUnassignConfirm] = useState(false);
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [showDeleteClassConfirm, setShowDeleteClassConfirm] = useState(false);
  const [classToDelete, setClassToDelete] = useState<CourseClass | null>(null);
  const [classToEdit, setClassToEdit] = useState<CourseClass | null>(null);
  const [editDept, setEditDept] = useState('BSCS');
  const [editLevel, setEditLevel] = useState('1');
  const [editSection, setEditSection] = useState('A');
  const [editSemester, setEditSemester] = useState('Spring');
  const [editYear, setEditYear] = useState('2026');
  const [editName, setEditName] = useState('');
  
  // Selection
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [teacherToUnassign, setTeacherToUnassign] = useState<{ id: number | null, name: string } | null>(null);
  
  // Roster States
  const [studentsRoster, setStudentsRoster] = useState<EnrolledStudent[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [showRoster, setShowRoster] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [resetModules, setResetModules] = useState<Set<number>>(new Set());
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [uploadedModuleFiles, setUploadedModuleFiles] = useState<Map<number, string>>(new Map());
  const [uploadResult, setUploadResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [manualRegNo, setManualRegNo] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  
  // Custom Modals State
  const [showNewStudentModal, setShowNewStudentModal] = useState(false);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<EnrolledStudent | null>(null);
  const [studentToUnenroll, setStudentToUnenroll] = useState<EnrolledStudent | null>(null);
  const [editSName, setEditSName] = useState('');
  const [editSEmail, setEditSEmail] = useState('');
  const [editSRegNo, setEditSRegNo] = useState('');
  
  // Search states
  const [modalSearch, setModalSearch] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');

  // Page Filters
  const [fLevel, setFLevel] = useState('1');
  const [fDept, setFDept] = useState('BSCS');
  const [fSection, setFSection] = useState('A');
  const [fSemester, setFSemester] = useState('Spring');
  const [fYear, setFYear] = useState('2026');

  // Modal Filters (Create)
  const [mLevel, setMLevel] = useState('1');
  const [mDept, setMDept] = useState('BSCS');
  const [mSection, setMSection] = useState('A');
  const [mSemester, setMSemester] = useState('Spring');
  const [mYear, setMYear] = useState('2026');

  // Applied Filters state
  const [appliedFilters, setAppliedFilters] = useState<{
    level: string;
    dept: string;
    section: string;
    semester: string;
    year: string;
  } | null>(null);

  // Client filtering: Main Table
  const filteredClasses = useMemo(() => {
    if (!appliedFilters) return initialClasses;
    
    return initialClasses.filter(c => 
      c.semesterLevel === appliedFilters.level &&
      c.department === appliedFilters.dept &&
      c.section === appliedFilters.section &&
      c.academicSemester === appliedFilters.semester &&
      String(c.academicYear) === appliedFilters.year
    );
  }, [initialClasses, appliedFilters]);

  // Client filtering: Modal Courses
  const filteredCourses = useMemo(() => {
    if (!modalSearch) return availableCourses;
    return availableCourses.filter(c => 
      c.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
      c.code.toLowerCase().includes(modalSearch.toLowerCase())
    );
  }, [availableCourses, modalSearch]);

  // Client filtering: Modal Teachers
  const filteredTeachers = useMemo(() => {
    if (!teacherSearch) return availableTeachers;
    return availableTeachers.filter(t => 
      t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.email.toLowerCase().includes(teacherSearch.toLowerCase())
    );
  }, [availableTeachers, teacherSearch]);

  // ---------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------

  const fetchRoster = async () => {
    if (!selectedModuleId) return;
    setRosterLoading(true);
    const result = await getEnrolledStudents(selectedModuleId);
    if (result.success && result.students) {
      setStudentsRoster(result.students);
    }
    setRosterLoading(false);
  };

  useEffect(() => {
    if (showAddStudentsModal && selectedModuleId) {
      setCurrentFileName(null);
      setUploadStatus('idle');
      setUploadResult(null);
      setStudentsRoster([]);
      setShowRoster(false);
    }
  }, [showAddStudentsModal, selectedModuleId]);

  const handleCreateClass = async (course: Course) => {
    const formData = new FormData();
    formData.append('courseId', course.id.toString());
    formData.append('name', `${course.code} - ${mSection} ${mSemester} ${mYear}`);
    formData.append('semesterLevel', mLevel);
    formData.append('department', mDept);
    formData.append('section', mSection);
    formData.append('academicYear', mYear);
    formData.append('academicSemester', mSemester);

    startTransition(async () => {
      const result = await createModule(formData);
      if (result.success) {
        setShowCreateModal(false);
        router.refresh();
      } else {
        alert(result.error || 'Failed to create class');
      }
    });
  };

  const handleAssignTeacher = async (teacherId: number | null) => {
    if (!selectedModuleId) return;
    
    startTransition(async () => {
      const result = await assignTeacher(selectedModuleId, teacherId);
      if (result.success) {
        setShowAssignModal(false);
        setShowUnassignConfirm(false);
        setSelectedModuleId(null);
        setTeacherToUnassign(null);
        router.refresh();
      } else {
        alert(result.error || 'Failed to assign faculty');
        setShowUnassignConfirm(false);
      }
    });
  };

  const handleManualEnroll = async () => {
    if (!selectedModuleId || !manualRegNo || !manualName || !manualEmail) return;
    
    startTransition(async () => {
      const result = await enrollStudentByRegistration(selectedModuleId, manualRegNo, manualName, manualEmail);
      if (result.success) {
        setManualRegNo('');
        setManualName('');
        setManualEmail('');
        setShowNewStudentModal(false);
        fetchRoster();
        router.refresh();
        // Clear from resetModules so the green status reappears
        setResetModules(prev => {
          const next = new Set(prev);
          next.delete(selectedModuleId);
          return next;
        });
        // Track the upload in local state to bridge the gap until server refresh
        setUploadedModuleFiles(prev => {
          const next = new Map(prev);
          next.set(selectedModuleId, manualName);
          return next;
        });
      } else {
        alert(result.error || 'Student not found or enrollment failed');
      }
    });
  };

  const handleUpdateStudent = async () => {
    if (!studentToEdit) return;
    
    const [firstName, ...rest] = editSName.split(' ');
    const lastName = rest.join(' ');
    
    startTransition(async () => {
      const { updateStudent } = await import('@/app/actions/student');
      const result = await updateStudent(studentToEdit.id, firstName, lastName, editSEmail, editSRegNo);
      if (result.success) {
        setShowEditStudentModal(false);
        setStudentToEdit(null);
        fetchRoster();
        router.refresh();
      } else {
        alert(result.error || 'Failed to update student');
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedModuleId) return;

    setCurrentFileName(file.name);

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExt === 'csv') {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          processBatchEnroll(results.data);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      });
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        processBatchEnroll(data);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsBinaryString(file);
    } else {
      alert('Please upload a .csv or .xlsx file');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const processBatchEnroll = async (data: any[]) => {
    if (!selectedModuleId) return;
    setUploadStatus('uploading');
    startTransition(async () => {
      const result = await enrollStudentsBatch(selectedModuleId, data);
      if (result.success) {
        setUploadStatus('success');
        setUploadResult({
          success: result.count || 0,
          failed: result.failed || 0,
          errors: result.errors || []
        });
        fetchRoster();
        router.refresh();
        // Clear from resetModules so the green status reappears
        setResetModules(prev => {
          const next = new Set(prev);
          next.delete(selectedModuleId);
          return next;
        });
        setUploadedModuleFiles(prev => {
          const next = new Map(prev);
          next.set(selectedModuleId, currentFileName || 'Uploaded File');
          return next;
        });
      } else {
        setUploadStatus('idle');
        setCurrentFileName(null);
        setUploadResult({
          success: 0,
          failed: 1,
          errors: [result.error || 'Batch enrollment failed']
        });
      }
    });
  };

  const handleConfirmUnenrollStudent = async () => {
    if (!selectedModuleId || !studentToUnenroll) return;
    
    startTransition(async () => {
      const result = await unenrollStudent(selectedModuleId, studentToUnenroll.id);
      if (result.success) {
        setStudentToUnenroll(null);
        const rosterResult = await getEnrolledStudents(selectedModuleId);
        if (rosterResult.success && rosterResult.students) {
          setStudentsRoster(rosterResult.students);
          if (rosterResult.students.length === 0) {
            setUploadedModuleFiles(prev => {
              const next = new Map(prev);
              next.delete(selectedModuleId);
              return next;
            });
            setCurrentFileName(null);
            setUploadStatus('idle');
          }
        }
        router.refresh();
      }
    });
  };

  const handleDelete = async () => {
    if (!classToDelete) return;
    startTransition(async () => {
      const result = await deleteModule(classToDelete.id);
      if (result.error) alert(result.error);
      else {
        setShowDeleteClassConfirm(false);
        setClassToDelete(null);
        router.refresh();
      }
    });
  };

  const handleEditClass = async () => {
    if (!classToEdit) return;
    startTransition(async () => {
      const result = await updateModule(classToEdit.id, {
        name: editName,
        semesterLevel: parseInt(editLevel),
        department: editDept,
        section: editSection,
        academicYear: parseInt(editYear),
        academicSemester: editSemester,
      });
      if (result.success) {
        setShowEditClassModal(false);
        setClassToEdit(null);
        router.refresh();
      } else {
        alert(result.error || 'Failed to update class');
      }
    });
  };

  const currentModule = selectedModuleId ? initialClasses.find(c => c.id === selectedModuleId) : null;

  return (
    <div className="p-4 space-y-4">
      {/* Filters Row */}
      <div className="flex flex-wrap items-end gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <label className="block text-[11px] font-black text-[#071a4a] uppercase tracking-wider pl-1">Semester Level</label>
          <select 
            value={fLevel}
            onChange={(e) => setFLevel(e.target.value)}
            className="h-9 px-3 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold focus:bg-white focus:ring-2 focus:ring-[#071a4a]/10 outline-none transition-all cursor-pointer min-w-[100px]"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(lvl => <option key={lvl} value={String(lvl)}>{lvl}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-[11px] font-black text-[#071a4a] uppercase tracking-wider pl-1">Department</label>
          <select 
            value={fDept}
            onChange={(e) => setFDept(e.target.value)}
            className="h-9 px-3 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold focus:bg-white focus:ring-2 focus:ring-[#071a4a]/10 outline-none transition-all cursor-pointer min-w-[100px]"
          >
            <option value="BSCS">BSCS</option>
            <option value="BSSE">BSSE</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-[11px] font-black text-[#071a4a] uppercase tracking-wider pl-1">Section</label>
          <select 
            value={fSection}
            onChange={(e) => setFSection(e.target.value)}
            className="h-9 px-3 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold focus:bg-white focus:ring-2 focus:ring-[#071a4a]/10 outline-none transition-all cursor-pointer min-w-[70px]"
          >
            {['A', 'B', 'C', 'D', 'E'].map(sec => <option key={sec} value={sec}>{sec}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-[11px] font-black text-[#071a4a] uppercase tracking-wider pl-1">Semester</label>
          <select 
            value={fSemester}
            onChange={(e) => setFSemester(e.target.value)}
            className="h-9 px-3 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold focus:bg-white focus:ring-2 focus:ring-[#071a4a]/10 outline-none transition-all cursor-pointer min-w-[100px]"
          >
            <option value="Spring">Spring</option>
            <option value="Fall">Fall</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-[11px] font-black text-[#071a4a] uppercase tracking-wider pl-1">Year</label>
          <select 
            value={fYear}
            onChange={(e) => setFYear(e.target.value)}
            className="h-9 px-3 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold focus:bg-white focus:ring-2 focus:ring-[#071a4a]/10 outline-none transition-all cursor-pointer min-w-[90px]"
          >
            {Array.from({ length: 50 }, (_, i) => 2026 + i).map(year => (
              <option key={year} value={String(year)}>{year}</option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={() => setAppliedFilters({ level: fLevel, dept: fDept, section: fSection, semester: fSemester, year: fYear })}
          className="h-9 px-5 bg-[#071a4a] text-white text-xs font-bold rounded-lg shadow-md hover:bg-blue-900 transition-all active:scale-95"
        >
          Apply Filter
        </button>

        {appliedFilters ? (
          <button 
            onClick={() => setAppliedFilters(null)}
            className="h-9 px-5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-all border border-red-100 flex items-center gap-2"
          >
            <Search className="w-3.5 h-3.5" />
            Disable Filter
          </button>
        ) : (
          <div className="h-9 px-5 bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-green-100 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Showing All
          </div>
        )}

        <button 
          onClick={() => {
            setMLevel(fLevel);
            setMDept(fDept);
            setMSection(fSection);
            setMSemester(fSemester);
            setMYear(fYear);
            setShowCreateModal(true);
          }}
          className="h-9 px-5 bg-[#071a4a] text-white text-xs font-bold rounded-lg shadow-md hover:bg-blue-900 transition-all ml-auto flex items-center gap-2 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create Class
        </button>
      </div>

      {/* Classes Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-4 py-3 text-[11px] font-black text-gray-700 uppercase tracking-widest text-center">Course ID</th>
              <th className="px-4 py-3 text-[11px] font-black text-gray-700 uppercase tracking-widest">Course Name</th>
              <th className="px-4 py-3 text-[11px] font-black text-gray-700 uppercase tracking-widest text-center">Pre-requisite</th>
              <th className="px-4 py-3 text-[11px] font-black text-gray-700 uppercase tracking-widest text-center">Credit Hours</th>
              <th className="px-4 py-3 text-[11px] font-black text-gray-700 uppercase tracking-widest text-center">Dept</th>
              <th className="px-4 py-3 text-[11px] font-black text-gray-700 uppercase tracking-widest text-center">Lvl</th>
              <th className="px-4 py-3 text-[11px] font-black text-gray-700 uppercase tracking-widest text-center">Sec</th>
              <th className="px-4 py-3 text-[11px] font-black text-gray-700 uppercase tracking-widest text-center">Faculty</th>
              <th className="px-4 py-3 text-[11px] font-black text-gray-700 uppercase tracking-widest text-center">Students</th>
              <th className="px-4 py-3 text-[11px] font-black text-gray-700 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredClasses.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No classes found for this session</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredClasses.map((item) => (
                <React.Fragment key={item.id}>
                  <tr 
                    className={`hover:bg-gray-50/80 transition-colors cursor-pointer ${expandedId === item.id ? 'bg-blue-50/30' : ''}`}
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  >
                    <td className="px-4 py-2.5 font-bold text-[#071a4a] text-[13px] text-center">{item.courseId}</td>
                    <td className="px-4 py-2.5 text-[13px] font-bold text-gray-800">{item.courseName}</td>
                    <td className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase text-center">{item.prerequisite}</td>
                    <td className="px-4 py-2.5 text-center text-[13px] font-bold">{item.creditHours}</td>
                    <td className="px-4 py-2.5 text-center text-[13px] font-bold text-gray-500">{item.department}</td>
                    <td className="px-4 py-2.5 text-center text-[13px] font-bold text-gray-500">{item.semesterLevel}</td>
                    <td className="px-4 py-2.5 text-center text-[13px] font-bold text-gray-500">{item.section}</td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedModuleId(item.id); setShowAssignModal(true); }}
                          className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-sm mx-auto ${
                            item.instructor !== 'TBD' 
                            ? 'bg-green-50 text-green-600 border border-green-100' 
                            : 'bg-[#071a4a] text-white hover:bg-blue-900 shadow-blue-900/10'
                          }`}
                        >
                          {item.instructor !== 'TBD' ? 'Assigned' : 'Assign'}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedModuleId(item.id); setShowAddStudentsModal(true); }}
                        className="bg-[#071a4a] text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-900 transition-all shadow-sm active:scale-95"
                      >
                        Add
                      </button>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setClassToEdit(item);
                            setEditName(item.courseName);
                            setEditDept(item.department);
                            setEditLevel(item.semesterLevel);
                            setEditSection(item.section);
                            setEditSemester(item.academicSemester);
                            setEditYear(String(item.academicYear));
                            setShowEditClassModal(true);
                          }}
                          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all" 
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setClassToDelete(item); setShowDeleteClassConfirm(true); }}
                          className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all" 
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === item.id && (
                    <tr onClick={(e) => e.stopPropagation()}>
                      <td colSpan={10} className="px-8 py-0">
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-inner p-6 my-4 space-y-4 relative animate-in slide-in-from-top-2 duration-200">
                          <button 
                            onClick={() => setExpandedId(null)}
                            className="absolute right-4 top-4 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Course Code</label>
                              <p className="font-bold text-[#071a4a]">{item.courseId}</p>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Course Name</label>
                              <p className="font-bold text-gray-800">{item.courseName}</p>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pre-requisite</label>
                              <p className="font-bold text-gray-500">{item.prerequisite}</p>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Credit Hour</label>
                              <p className="font-bold text-gray-700">{item.creditHours}</p>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Instructor</label>
                              <p className="font-bold text-blue-600 uppercase tracking-tight">{item.instructor}</p>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</label>
                              <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase ${item.status === 'ASSIGNED' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                {item.status}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Enroll Students</label>
                              <p className="font-bold text-gray-800">{item.totalEnrolled}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE CLASS MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#071a4a]/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center text-[#071a4a]">
              <div>
                <h2 className="text-xl font-extrabold">Create New Class</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assign course to academic session</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-red-500 transition-all hover:rotate-90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-gray-400 uppercase pl-1">Level</label>
                  <select value={mLevel} onChange={(e) => setMLevel(e.target.value)} className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#071a4a]/10 outline-none transition-all">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(lvl => <option key={lvl} value={String(lvl)}>{lvl}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-gray-400 uppercase pl-1">Dept</label>
                  <select value={mDept} onChange={(e) => setMDept(e.target.value)} className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#071a4a]/10 outline-none transition-all">
                    <option value="BSCS">BSCS</option>
                    <option value="BSSE">BSSE</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-gray-400 uppercase pl-1">Sec</label>
                  <select value={mSection} onChange={(e) => setMSection(e.target.value)} className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#071a4a]/10 outline-none transition-all">
                    {['A', 'B', 'C', 'D', 'E'].map(sec => <option key={sec} value={sec}>{sec}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-gray-400 uppercase pl-1">Semester</label>
                  <select value={mSemester} onChange={(e) => setMSemester(e.target.value)} className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#071a4a]/10 outline-none transition-all">
                    <option value="Spring">Spring</option>
                    <option value="Fall">Fall</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-gray-400 uppercase pl-1">Year</label>
                  <select value={mYear} onChange={(e) => setMYear(e.target.value)} className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#071a4a]/10 outline-none transition-all">
                    {Array.from({ length: 10 }, (_, i) => 2024 + i).map(y => <option key={y} value={String(y)}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#071a4a] transition-colors" />
                <input 
                  type="text" placeholder="Search curriculum courses..." value={modalSearch} onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-[#071a4a]/5 outline-none transition-all"
                />
              </div>

              <div className="border border-gray-100 rounded-2xl overflow-hidden max-h-[400px] overflow-y-auto shadow-inner">
                <table className="w-full text-left">
                  <thead className="bg-[#071a4a] text-white text-[10px] font-black uppercase tracking-widest sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4">Course ID</th>
                      <th className="px-6 py-4">Course Name</th>
                      <th className="px-6 py-4">Pre-requisite</th>
                      <th className="px-6 py-4 text-center">Credit Hours</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredCourses.map(course => (
                      <tr key={course.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4 font-bold text-[#071a4a] text-sm">{course.code}</td>
                        <td className="px-6 py-4 text-sm text-gray-800 font-bold">{course.name}</td>
                        <td className="px-6 py-4 text-[10px] text-gray-400 font-black uppercase">{course.prerequisite}</td>
                        <td className="px-6 py-4 text-center text-sm font-black">{course.creditHours}</td>
                        <td className="px-6 py-4 text-right">
                          <button disabled={isPending} onClick={() => handleCreateClass(course)} className="px-6 py-2 bg-[#071a4a] text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-900 transition-all shadow-md shadow-blue-900/10">
                            Create
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PREMIUM FACULTY MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-[#071a4a]/60 backdrop-blur-xl z-50 flex items-center justify-center p-4 transition-all duration-500 animate-in fade-in">
          <div className="bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(7,26,74,0.3)] w-full max-w-2xl overflow-hidden border border-white/20 animate-in zoom-in slide-in-from-bottom-8 duration-500">
            {/* Premium Header */}
            <div className="p-10 border-b border-gray-100 bg-gradient-to-br from-[#071a4a] via-[#0a2669] to-[#071a4a] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-black tracking-tight leading-none">Assign Faculty</h2>
                  <div className="flex items-center gap-2 mt-4">
                    <span className="px-3 py-1 bg-blue-500/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                      Curriculum: {currentModule?.courseId}
                    </span>
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                      {currentModule?.courseName}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => { setShowAssignModal(false); setSelectedModuleId(null); }}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-red-500 hover:rotate-90 transition-all duration-500 backdrop-blur-md border border-white/10 shadow-xl"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-10 space-y-8 bg-gray-50/50">
              {/* Search Section */}
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#071a4a] transition-all duration-300" />
                <input 
                  type="text" placeholder="Search faculty by name or email..." value={teacherSearch} onChange={(e) => setTeacherSearch(e.target.value)}
                  className="w-full h-16 pl-16 pr-8 bg-white border-2 border-transparent rounded-[24px] text-base font-bold text-gray-800 placeholder:text-gray-400 focus:border-[#071a4a]/10 focus:ring-8 focus:ring-[#071a4a]/5 outline-none transition-all shadow-xl shadow-gray-200/20"
                />
              </div>

              {/* Faculty List Container */}
              <div className="max-h-[380px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
                {filteredTeachers.length === 0 ? (
                  <div className="py-20 text-center space-y-4 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto">
                      <UserX className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No faculty members found</p>
                  </div>
                ) : (
                  filteredTeachers.map(teacher => {
                    const isAssigned = currentModule?.instructor === teacher.name;
                    return (
                      <div 
                        key={teacher.id} 
                        className={`p-5 rounded-[28px] border-2 transition-all duration-300 flex items-center justify-between group cursor-default ${
                          isAssigned 
                          ? 'bg-blue-50/50 border-blue-200 shadow-lg shadow-blue-900/5' 
                          : 'bg-white border-white hover:border-[#071a4a]/10 hover:shadow-2xl hover:shadow-gray-200/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-all duration-500 ${
                            isAssigned 
                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                            : 'bg-gray-50 text-[#071a4a] group-hover:bg-[#071a4a] group-hover:text-white'
                          }`}>
                            {teacher.name[0]}
                          </div>
                          <div>
                            <h4 className="text-base font-black text-gray-800 tracking-tight group-hover:text-[#071a4a] transition-colors">{teacher.name}</h4>
                            <p className="text-xs font-bold text-gray-400">{teacher.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isAssigned ? (
                            <>
                              <div className="flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-600 rounded-xl border border-green-100 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                <CheckCircle2 className="w-4 h-4" />
                                Assigned
                              </div>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Extract the initials for confirmation if needed, though name is used
                                    setTeacherToUnassign({ id: teacher.id, name: teacher.name });
                                    setShowUnassignConfirm(true);
                                  }}
                                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-100 transition-all shadow-sm"
                                  title="Unassign"
                                >
                                  <UserX className="w-5 h-5" />
                                </button>
                            </>
                          ) : (
                            // Only show Assign button if NO teacher is assigned to this module yet
                            currentModule?.instructor === 'TBD' && (
                              <button 
                                disabled={isPending}
                                onClick={() => handleAssignTeacher(teacher.id)}
                                className="px-8 py-3 bg-[#071a4a] text-white text-[11px] font-black uppercase tracking-[2px] rounded-xl hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-30 flex items-center gap-2"
                              >
                                {isPending ? <Clock className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                                Assign
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            
            {/* Subtle Footer Accent */}
            <div className="h-2 bg-gradient-to-r from-[#071a4a] via-blue-600 to-[#071a4a]"></div>
          </div>
        </div>
      )}

      {/* ADD STUDENTS MODAL */}
      {showAddStudentsModal && (
        <div className="fixed inset-0 bg-[#071a4a]/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in duration-300 border border-white/20">
            {/* Header */}
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
              <div>
                <h2 className="text-2xl font-black text-[#071a4a]">Add Students into Course</h2>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">{currentModule?.courseName}</p>
              </div>
              <button onClick={() => setShowAddStudentsModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-400 hover:text-red-500 hover:rotate-90 transition-all shadow-sm">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
              {/* Action Buttons - All in one row */}
              <div className="flex items-center gap-3 flex-wrap">
                <button 
                  onClick={() => setShowNewStudentModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-[#071a4a] text-white shadow-md shadow-blue-900/10 hover:bg-blue-900 active:scale-[0.98]"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Add Student
                </button>
                {(() => {
                  const currentModuleInModal = initialClasses.find(c => c.id === selectedModuleId);
                  const isEnrolled = currentModuleInModal ? currentModuleInModal.totalEnrolled > 0 : false;
                  const isRecentlyUploaded = selectedModuleId ? uploadedModuleFiles.has(selectedModuleId) : false;
                  const hasBeenReset = selectedModuleId ? resetModules.has(selectedModuleId) : false;
                  
                  const alreadyUploaded = (isEnrolled || isRecentlyUploaded) && !hasBeenReset;
                  
                  return (
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadStatus === 'uploading' || alreadyUploaded}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border active:scale-[0.98] ${
                          alreadyUploaded 
                            ? 'bg-emerald-500 text-white border-emerald-600 cursor-not-allowed rounded-r-none shadow-lg shadow-emerald-200' 
                            : 'border-dashed border-gray-300 text-gray-500 hover:border-[#071a4a] hover:text-[#071a4a] hover:bg-gray-50 disabled:opacity-50 bg-white'
                        }`}
                      >
                        {alreadyUploaded && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {!alreadyUploaded && uploadStatus === 'idle' && <Upload className="w-3.5 h-3.5" />}
                        {!alreadyUploaded && uploadStatus === 'uploading' && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        {!alreadyUploaded && uploadStatus === 'success' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        
                        {alreadyUploaded ? 'ASSIGNED' : (currentFileName || 'Import File')}
                      </button>
                      {alreadyUploaded && (
                        <button
                          onClick={() => {
                            if (selectedModuleId) {
                              setResetModules(prev => new Set(Array.from(prev).concat(selectedModuleId)));
                              setUploadedModuleFiles(prev => {
                                const next = new Map(prev);
                                next.delete(selectedModuleId);
                                return next;
                              });
                              setCurrentFileName(null);
                              setUploadStatus('idle');
                            }
                          }}
                          className="px-3 py-2.5 bg-red-500 text-white hover:bg-red-600 rounded-r-xl transition-all shadow-lg shadow-red-200 border border-red-600 border-l-0"
                          title="Reset & re-upload"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })()}
                <input 
                  type="file" 
                  accept=".csv, .xlsx, .xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  ref={fileInputRef}
                />

                <div className="ml-auto">
                  <button 
                    onClick={() => {
                      if (showRoster) {
                        setShowRoster(false);
                      } else {
                        fetchRoster();
                        setShowRoster(true);
                      }
                    }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-[0.98] ${
                      showRoster 
                        ? 'bg-red-50 text-red-600 border border-red-200 shadow-red-100/50 hover:bg-red-100' 
                        : 'bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700'
                    }`}
                  >
                    {rosterLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Users className="w-3.5 h-3.5" />}
                    {showRoster ? 'Hide Students' : 'View Enrolled'}
                  </button>
                </div>
              </div>

              {/* Roster Table */}
              {showRoster && (
                <div className="border border-gray-100 rounded-3xl overflow-hidden shadow-sm flex flex-col max-h-[400px] animate-in slide-in-from-top-2 duration-200">
                  <div className="overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left bg-white relative">
                      <thead className="bg-[#071a4a] text-white text-[10px] font-black uppercase tracking-[2px] sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-4">Registration No</th>
                          <th className="px-6 py-4">Full Name</th>
                          <th className="px-6 py-4">Email</th>
                          <th className="px-6 py-4 text-center">Role</th>
                          <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                      </thead>
                    <tbody className="divide-y divide-gray-50">
                      {studentsRoster.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
                            {rosterLoading ? (
                              <div className="flex flex-col items-center gap-2">
                                <Clock className="w-8 h-8 text-gray-200 animate-spin" />
                                <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Loading roster...</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2 opacity-30">
                                <Users className="w-10 h-10 text-gray-400" />
                                <p className="text-sm font-black text-gray-400">No student record found</p>
                              </div>
                            )}
                          </td>
                        </tr>
                      ) : (
                        studentsRoster.map(student => (
                          <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-black text-[#071a4a]">{student.registrationNo}</td>
                            <td className="px-6 py-4 text-sm font-bold text-gray-700">{student.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-400">{student.email}</td>
                            <td className="px-6 py-4 text-center">
                              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-wider">Student</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex gap-2 justify-end">
                                <button 
                                  onClick={() => { 
                                    setStudentToEdit(student); 
                                    setEditSName(student.name);
                                    setEditSEmail(student.email);
                                    setEditSRegNo(student.registrationNo);
                                    setShowEditStudentModal(true); 
                                  }}
                                  className="p-2.5 bg-blue-50 text-blue-500 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                                  title="Edit Student"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => setStudentToUnenroll(student)}
                                  className="p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                                  title="Remove from class"
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
                  <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">A list of student to assign course</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODERN UNASSIGN CONFIRMATION DIALOG */}
      {showUnassignConfirm && (
        <div className="fixed inset-0 bg-[#071a4a]/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden border border-white/20 animate-in zoom-in duration-300">
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-red-100/50 animate-bounce">
                <UserX className="w-10 h-10 text-red-500" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-[#071a4a]">Unassign Faculty?</h3>
                <p className="text-sm font-bold text-gray-500 leading-relaxed px-4">
                  Are you sure you want to remove <span className="text-red-500 font-black">{teacherToUnassign?.name}</span> from this academic section?
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => { setShowUnassignConfirm(false); setTeacherToUnassign(null); }}
                  className="flex-1 h-14 bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all"
                >
                  Keep Staff
                </button>
                <button 
                  onClick={() => handleAssignTeacher(null)}
                  className="flex-1 h-14 bg-red-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-red-600 shadow-lg shadow-red-200 transition-all"
                >
                  Unassign Now
                </button>
              </div>
            </div>
            <div className="h-4 bg-red-500"></div>
          </div>
        </div>
      )}

      {/* ADD NEW STUDENT OVERLAY CARD */}
      {showNewStudentModal && (
        <div className="fixed inset-0 bg-[#071a4a]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-[#071a4a]">Register Student</h2>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">Enroll and auto-send credentials</p>
                </div>
                <button onClick={() => setShowNewStudentModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Registration No</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 123456"
                    value={manualRegNo}
                    onChange={(e) => setManualRegNo(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isPending && manualRegNo && manualName && manualEmail) handleManualEnroll();
                    }}
                    className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-[#071a4a]/20 focus:ring-4 focus:ring-[#071a4a]/5 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. John Doe"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isPending && manualRegNo && manualName && manualEmail) handleManualEnroll();
                    }}
                    className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-[#071a4a]/20 focus:ring-4 focus:ring-[#071a4a]/5 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="student@domain.edu"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isPending && manualRegNo && manualName && manualEmail) handleManualEnroll();
                    }}
                    className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-[#071a4a]/20 focus:ring-4 focus:ring-[#071a4a]/5 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleManualEnroll}
                  disabled={isPending || !manualRegNo || !manualName || !manualEmail}
                  className="w-full h-14 bg-[#071a4a] text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-blue-900 transition-all shadow-xl shadow-blue-900/20 disabled:opacity-30 flex items-center justify-center gap-2"
                >
                  {isPending ? 'Processing...' : 'Enroll & Email Student'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {showEditStudentModal && studentToEdit && (
        <div className="fixed inset-0 bg-[#071a4a]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 animate-in zoom-in duration-300">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-[#071a4a]">Edit Student</h2>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">Update student record</p>
                </div>
                <button onClick={() => setShowEditStudentModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Registration No</label>
                  <input 
                    type="text" 
                    value={editSRegNo}
                    onChange={(e) => setEditSRegNo(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isPending && editSName && editSEmail && editSRegNo) handleUpdateStudent();
                    }}
                    className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-[#071a4a]/20 focus:ring-4 focus:ring-[#071a4a]/5 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
                  <input 
                    type="text" 
                    value={editSName}
                    onChange={(e) => setEditSName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isPending && editSName && editSEmail && editSRegNo) handleUpdateStudent();
                    }}
                    className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-[#071a4a]/20 focus:ring-4 focus:ring-[#071a4a]/5 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Email</label>
                  <input 
                    type="email" 
                    value={editSEmail}
                    onChange={(e) => setEditSEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isPending && editSName && editSEmail && editSRegNo) handleUpdateStudent();
                    }}
                    className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-[#071a4a]/20 focus:ring-4 focus:ring-[#071a4a]/5 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleUpdateStudent}
                  disabled={isPending || !editSName || !editSEmail || !editSRegNo}
                  className="w-full h-14 bg-[#071a4a] text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-blue-900 transition-all shadow-xl shadow-blue-900/20 disabled:opacity-30 flex items-center justify-center"
                >
                  {isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODERN UNENROLL CONFIRMATION DIALOG */}
      {studentToUnenroll && (
        <div className="fixed inset-0 bg-[#071a4a]/40 backdrop-blur-md z-[120] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-white/20 animate-in zoom-in duration-300">
            <div className="p-6 text-center space-y-5">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto shadow-sm">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-[#071a4a]">Remove Student?</h3>
                <p className="text-xs font-medium text-gray-500 px-4">
                  Are you sure you want to remove <span className="text-red-500 font-bold">{studentToUnenroll.name}</span>?
                </p>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setStudentToUnenroll(null)} className="flex-1 h-10 bg-gray-50 text-gray-400 text-[10px] font-bold uppercase rounded-lg hover:bg-gray-100 transition-all">Cancel</button>
                <button onClick={handleConfirmUnenrollStudent} disabled={isPending} className="flex-1 h-10 bg-red-500 text-white text-[10px] font-bold uppercase rounded-lg hover:bg-red-600 shadow-md transition-all disabled:opacity-30 flex justify-center items-center">{isPending ? 'Removing...' : 'Remove'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PREMIUM UPLOAD RESULT DIALOG */}
      {uploadResult && (
        <div className="fixed inset-0 bg-[#071a4a]/40 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-in fade-in duration-500">
          <div className="bg-white rounded-[32px] shadow-[0_32px_64px_-16px_rgba(7,26,74,0.3)] w-full max-w-sm overflow-hidden border border-white/20 animate-in zoom-in duration-300">
            {/* Header Section */}
            <div className={`p-6 text-center border-b border-gray-50 bg-gradient-to-br ${uploadResult.failed === 0 ? 'from-emerald-500 to-teal-600' : 'from-[#071a4a] to-blue-900'} text-white`}>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl border border-white/10 animate-bounce">
                {uploadResult.failed === 0 ? <CheckCircle2 className="w-9 h-9" /> : <AlertCircle className="w-9 h-9" />}
              </div>
              <h3 className="text-xl font-black tracking-tight">{uploadResult.failed === 0 ? 'Import Successful' : 'Import Partially Failed'}</h3>
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mt-1">Batch Processing Results</p>
            </div>

            <div className="p-8 space-y-6 bg-gray-50/30">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center transform transition-transform hover:scale-105">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Enrolled</p>
                  <p className="text-2xl font-black text-emerald-500">{uploadResult.success}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center transform transition-transform hover:scale-105">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Errors</p>
                  <p className="text-2xl font-black text-red-500">{uploadResult.failed}</p>
                </div>
              </div>

              {/* Error Details if any */}
              {uploadResult.errors.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Error Log</p>
                     <span className="px-2 py-0.5 bg-red-50 text-red-500 rounded-full text-[9px] font-black">{uploadResult.errors.length} Problems</span>
                  </div>
                  <div className="bg-white border border-red-50 rounded-2xl p-4 max-h-[160px] overflow-y-auto custom-scrollbar shadow-inner">
                    <ul className="space-y-2.5">
                      {uploadResult.errors.map((err, i) => (
                        <li key={i} className="flex gap-2.5 text-[11px] leading-relaxed group">
                          <div className="mt-1 w-1 h-1 rounded-full bg-red-300 group-hover:bg-red-500 transition-colors shrink-0"></div>
                          <span className="font-semibold text-gray-500 group-hover:text-red-600 transition-colors">{err}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <button 
                onClick={() => setUploadResult(null)} 
                className={`w-full h-14 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 ${
                  uploadResult.failed === 0 
                  ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' 
                  : 'bg-[#071a4a] hover:bg-blue-900 shadow-blue-900/20'
                }`}
              >
                {uploadResult.failed === 0 ? 'Great, Got it!' : 'Acknowledged'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODERN EDIT CLASS MODAL - EXTREMELY COMPACT */}
      {showEditClassModal && classToEdit && (
        <div className="fixed inset-0 bg-[#071a4a]/20 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm my-auto overflow-hidden border border-gray-100 animate-in zoom-in duration-200 flex flex-col max-h-[85vh]">
            <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#071a4a] rounded-lg items-center justify-center flex shadow-md">
                  <Pencil className="w-4 h-4 text-white" />
                </div>
                <div className="overflow-hidden">
                  <h2 className="text-sm font-bold text-[#071a4a] truncate">Edit Class</h2>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase truncate tracking-wider">{classToEdit.courseId}</p>
                </div>
              </div>
              <button onClick={() => setShowEditClassModal(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 overflow-y-auto custom-scrollbar">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Class Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full h-9 bg-gray-50 border border-gray-100 rounded-lg px-3 text-sm font-bold text-[#071a4a] focus:bg-white outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Level</label>
                  <select value={editLevel} onChange={(e) => setEditLevel(e.target.value)} className="w-full h-9 bg-gray-50 border border-gray-100 rounded-lg px-2 text-sm font-bold text-[#071a4a]">
                    {[1,2,3,4,5,6,7,8].map(l => <option key={l} value={String(l)}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Dept</label>
                  <select value={editDept} onChange={(e) => setEditDept(e.target.value)} className="w-full h-9 bg-gray-50 border border-gray-100 rounded-lg px-2 text-sm font-bold text-[#071a4a]">
                    {['BSCS', 'BSAI', 'BBA', 'BSSE'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Section</label>
                  <select value={editSection} onChange={(e) => setEditSection(e.target.value)} className="w-full h-9 bg-gray-50 border border-gray-100 rounded-lg px-2 text-sm font-bold text-[#071a4a]">
                    {['A', 'B', 'C', 'D', 'E'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Semester</label>
                  <select value={editSemester} onChange={(e) => setEditSemester(e.target.value)} className="w-full h-9 bg-gray-50 border border-gray-100 rounded-lg px-2 text-sm font-bold text-[#071a4a]">
                    {['Spring', 'Fall', 'Summer'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Academic Year</label>
                <select value={editYear} onChange={(e) => setEditYear(e.target.value)} className="w-full h-9 bg-gray-50 border border-gray-100 rounded-lg px-3 text-sm font-bold text-[#071a4a]">
                  {Array.from({ length: 13 }, (_, i) => 2024 + i).map(y => (
                    <option key={y} value={String(y)}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="pt-2">
                <button onClick={handleEditClass} disabled={isPending} className="w-full h-10 bg-[#071a4a] text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-blue-900 transition-all disabled:opacity-50 shadow-md">
                  {isPending ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODERN DELETE CLASS CONFIRMATION DIALOG */}
      {showDeleteClassConfirm && classToDelete && (
        <div className="fixed inset-0 bg-[#071a4a]/20 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[320px] my-auto overflow-hidden border border-gray-100 animate-in zoom-in duration-200">
            <div className="p-6 text-center space-y-5">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto shadow-sm">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-[#071a4a]">Delete Class?</h3>
                <p className="text-xs font-semibold text-[#071a4a] bg-gray-50 py-1.5 rounded-lg px-2 block truncate">{classToDelete.courseName}</p>
                <p className="text-[9px] font-medium text-red-500">This action cannot be undone.</p>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={handleDelete} disabled={isPending} className="w-full h-9 bg-red-500 text-white text-[10px] font-bold uppercase rounded-lg hover:bg-red-600 transition-all disabled:opacity-30">
                  {isPending ? 'Removing...' : 'Confirm Delete'}
                </button>
                <button onClick={() => setShowDeleteClassConfirm(false)} className="w-full h-9 bg-gray-50 text-gray-400 text-[10px] font-bold uppercase rounded-lg hover:bg-gray-100 transition-all">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
