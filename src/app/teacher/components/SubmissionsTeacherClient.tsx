'use client';

import { useState, useEffect } from 'react';
import { useDashboard } from '@/components/layout/DashboardContext';
import { getSubmissionDetails, gradeSubmission } from '@/app/actions/teacher-submissions';
import { getAssignedAssessments } from '@/app/actions/assessment';
import { 
  Eye, 
  Download, 
  ChevronLeft, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Users,
  FileText,
  UserCheck
} from 'lucide-react';
import DocumentViewer from '@/components/ui/DocumentViewer';

interface SubmissionsTeacherClientProps {
  type: 'ASSIGNMENT' | 'QUIZ';
}

export default function SubmissionsTeacherClient({ type }: SubmissionsTeacherClientProps) {
  const { selectedModuleId } = useDashboard();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [assessmentInfo, setAssessmentInfo] = useState<any>(null);
  
  const [loading, setLoading] = useState(false);
  const [submittingGrade, setSubmittingGrade] = useState<number | null>(null);
  const [marksState, setMarksState] = useState<Record<number, string>>({});
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [viewUrl, setViewUrl] = useState<string | null>(null);

  // Load Assessments for picker
  useEffect(() => {
    if (!selectedModuleId) return;
    async function loadAssessments() {
      setLoading(true);
      const res = await getAssignedAssessments(Number(selectedModuleId), type);
      if (res.success) setAssessments(res.assessments || []);
      setLoading(false);
    }
    loadAssessments();
  }, [selectedModuleId, type]);

  // Load Submissions for selected assessment
  async function loadSubmissions(id: number) {
    setLoading(true);
    setErrorMsg('');
    const res = await getSubmissionDetails(id);
    if (res.success) {
      setSubmissions(res.submissions || []);
      setAssessmentInfo(res.assessment);
      setSelectedAssessmentId(id);
      
      // Initialize marks state
      const initialMarks: Record<number, string> = {};
      res.submissions?.forEach((s: any) => {
        initialMarks[s.studentId] = s.marksObtained !== null ? String(s.marksObtained) : '';
      });
      setMarksState(initialMarks);
    } else {
      setErrorMsg(res.error || 'Failed to load submissions.');
    }
    setLoading(false);
  }

  const handleGrade = async (studentId: number) => {
    if (!selectedAssessmentId) return;
    const marks = parseFloat(marksState[studentId]);
    
    if (isNaN(marks)) {
      setErrorMsg('Please enter valid marks.');
      return;
    }

    if (marks > assessmentInfo.totalMarks) {
      setErrorMsg(`Marks cannot exceed total marks (${assessmentInfo.totalMarks}).`);
      return;
    }

    setSubmittingGrade(studentId);
    setErrorMsg('');
    
    const res = await gradeSubmission({
      studentId,
      assessmentId: selectedAssessmentId,
      marks
    });

    if (res.success) {
      setSuccessMsg(`Marks updated for student.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      // Update local state status to "Submitted" (graded)
      setSubmissions(prev => prev.map(s => s.studentId === studentId ? { ...s, marksObtained: marks, status: 'Submitted' } : s));
    } else {
      setErrorMsg(res.error || 'Failed to save grade.');
    }
    setSubmittingGrade(null);
  };

  if (!selectedModuleId) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[11px]">Select a course from your dashboard first.</p>
      </div>
    );
  }

  // --- RENDERING VIEWS ---

  // 1. Selector View (List of Assessments)
  if (!selectedAssessmentId) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-[#071a4a] p-8 rounded-[32px] text-white flex items-center justify-between border border-blue-400/20 shadow-xl shadow-blue-900/10">
           <div>
             <h2 className="text-2xl font-black italic uppercase tracking-tight">Select {type} <span className="text-blue-400">Submission</span></h2>
             <p className="text-blue-100/50 text-[10px] font-black uppercase tracking-[2px] mt-2">Choose an active resource to begin terminal marking.</p>
           </div>
           <Users className="w-12 h-12 text-blue-400/20" />
        </div>

        {loading ? (
           <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#071a4a]/20" /></div>
        ) : assessments.length === 0 ? (
           <div className="py-20 text-center bg-white border border-dashed rounded-[32px] border-gray-100">
             <p className="text-[11px] font-black uppercase tracking-widest text-gray-300">No assigned {type.toLowerCase()}s found for this course.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {assessments.map(item => (
              <button 
                key={item.id}
                onClick={() => loadSubmissions(item.id)}
                className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#071a4a] group-hover:text-white transition-all">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-[#071a4a] tracking-tight uppercase leading-none">{item.title || `${type} ${item.sequenceNo || ''}`}</h4>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 block">Due: {item.endDate}</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                   <ChevronLeft className="w-4 h-4 text-[#071a4a] rotate-180" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 2. Submissions Table View (Matching Screenshot 2)
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header with Back Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setSelectedAssessmentId(null)}
            className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#071a4a] hover:bg-gray-50 px-4 py-2 rounded-xl transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Back to {type}s
          </button>
          <div className="h-6 w-[1px] bg-gray-200 hidden md:block"></div>
          <div>
            <h2 className="text-xl font-black text-[#071a4a] uppercase tracking-tight italic">Submissions for <span className="text-blue-600">"{assessmentInfo?.title}"</span></h2>
            <div className="flex items-center gap-3 mt-1">
               <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">Live Marking</span>
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Marks: {assessmentInfo?.totalMarks}</span>
            </div>
          </div>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-xl border border-green-100 animate-in slide-in-from-top-2">
             <CheckCircle2 className="w-4 h-4" />
             <span className="text-[10px] font-black uppercase tracking-widest">{successMsg}</span>
          </div>
        )}
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-gray-100 rounded-[32px] shadow-xl shadow-blue-900/5 overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="uppercase tracking-[2px] text-[10px] font-black text-gray-400 bg-gray-50/50">
                <th className="py-6 px-10 border-b border-gray-100">Registration No</th>
                <th className="py-6 px-10 border-b border-gray-100">Full Name</th>
                <th className="py-6 px-10 border-b border-gray-100 text-center">View Submission</th>
                <th className="py-6 px-10 border-b border-gray-100 text-center">Download File</th>
                <th className="py-6 px-10 border-b border-gray-100 text-center">Marks</th>
                <th className="py-6 px-10 border-b border-gray-100 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {submissions.map((sub) => (
                <tr key={sub.studentId} className="group hover:bg-blue-50/20 transition-all duration-300">
                  <td className="py-6 px-10">
                     <span className="text-sm font-black text-[#071a4a] uppercase tracking-tight">{sub.regNo}</span>
                  </td>
                  <td className="py-6 px-10">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 font-black text-[10px] uppercase">
                          {sub.name.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-gray-700">{sub.name}</span>
                     </div>
                  </td>
                  <td className="py-6 px-10 text-center">
                     {sub.fileUrl ? (
                        <button 
                          onClick={() => setViewUrl(sub.fileUrl)}
                          className="w-10 h-10 rounded-xl bg-[#071a4a] text-white flex items-center justify-center shadow-lg shadow-blue-900/20 hover:scale-110 transition-all mx-auto"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                     ) : (
                        <span className="text-[9px] font-black text-gray-300 uppercase italic">No File</span>
                     )}
                  </td>
                  <td className="py-6 px-10 text-center">
                     {sub.fileUrl ? (
                         <a 
                          href={sub.fileUrl} 
                          download
                          className="w-10 h-10 rounded-xl bg-gray-50 text-[#071a4a] hover:bg-green-500 hover:text-white flex items-center justify-center transition-all mx-auto shadow-sm"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                     ) : (
                        <span className="text-[9px] font-black text-gray-300 uppercase italic">—</span>
                     )}
                  </td>
                  <td className="py-6 px-10 text-center">
                     <input 
                      type="number" 
                      step="0.1"
                      placeholder="0.0"
                      value={marksState[sub.studentId] || ''}
                      onChange={(e) => setMarksState(prev => ({ ...prev, [sub.studentId]: e.target.value }))}
                      className="w-24 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-center text-sm font-black text-[#071a4a] outline-none focus:border-blue-400 focus:bg-white transition-all"
                     />
                  </td>
                  <td className="py-6 px-10 text-right">
                     <button 
                      onClick={() => handleGrade(sub.studentId)}
                      disabled={submittingGrade === sub.studentId || marksState[sub.studentId] === ''}
                      className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-30 flex items-center gap-2 ml-auto
                        ${sub.status === 'Submitted' ? 'bg-emerald-500 text-white' : 'bg-[#071a4a] text-white shadow-blue-900/20'}`}
                     >
                       {submittingGrade === sub.studentId ? (
                         <Loader2 className="w-3.5 h-3.5 animate-spin" />
                       ) : sub.status === 'Submitted' ? (
                         <UserCheck className="w-3.5 h-3.5" />
                       ) : (
                         <CheckCircle2 className="w-3.5 h-3.5" />
                       )}
                       <span>{sub.status === 'Submitted' ? 'Graded' : 'Submit'}</span>
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {submissions.length === 0 && !loading && (
           <div className="py-24 flex flex-col items-center justify-center bg-gray-50/50 italic opacity-20">
              <FileText className="w-12 h-12 mb-4" />
              <p className="text-[11px] font-black uppercase tracking-[4px]">No students found in this module</p>
           </div>
        )}
      </div>

      <DocumentViewer url={viewUrl} onClose={() => setViewUrl(null)} />
    </div>
  );
}
