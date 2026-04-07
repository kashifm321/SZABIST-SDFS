'use client';

import { useState, useEffect } from 'react';
import { useDashboard } from '@/components/layout/DashboardContext';
import { getAssessments, createAssessment, deleteAssessment, updateAssessmentSolution, editAssessment } from '@/app/actions/assessment';
import { getModuleSummary } from '@/app/actions/module';
import { Upload, RefreshCw, X, FileText, CheckCircle2, Eye, Trash2, Edit, AlertCircle, Loader2, Plus } from 'lucide-react';
import DocumentViewer from '@/components/ui/DocumentViewer';

type AssessmentManagerProps = {
  title: string;
  type: string;
  maxItems: number;
};

export default function AssessmentManagerClient({ title, type, maxItems }: AssessmentManagerProps) {
  const { selectedModuleId, setHeaderExtra } = useDashboard();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [viewFileUrl, setViewFileUrl] = useState<string | null>(null);
  
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showToStudent, setShowToStudent] = useState<boolean>(true);
  const [solFile, setSolFile] = useState<File | null>(null);
  const [bestFile, setBestFile] = useState<File | null>(null);
  const [avgFile, setAvgFile] = useState<File | null>(null);
  const [worstFile, setWorstFile] = useState<File | null>(null);

  const [solutionModal, setSolutionModal] = useState<{ id: number, type: 'solution' | 'best' | 'avg' | 'worst' } | null>(null);
  const [solPendingFile, setSolPendingFile] = useState<File | null>(null);
  const hasSeq = type === 'ASSIGNMENT' || type === 'QUIZ';
  useEffect(() => {
    if (!selectedModuleId) return;

    async function fetchHeaderInfo() {
      const res = await getModuleSummary(Number(selectedModuleId));
      if (res.success && res.module) {
        const courseName = res.module.courseName || res.module.name || 'Selected Course';
        setHeaderExtra(
          <div className="flex items-center animate-in fade-in slide-in-from-left-2 transition-all">
            <div className="h-4 w-[2px] bg-gray-200 mx-3 hidden sm:block"></div>
            <div className="bg-[#071a4a] text-white px-4 py-1.5 rounded-lg shadow-sm flex items-center gap-2 border border-blue-400/20">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-300/80">Selected Course:</span>
                <span className="text-[13px] font-bold tracking-tight">{courseName}</span>
            </div>
          </div>
        );
      }
    }

    fetchHeaderInfo();
    return () => setHeaderExtra(null);
  }, [selectedModuleId, setHeaderExtra]);

  // Error Message Timeout (5 seconds)
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => {
        setErrorMsg('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const loadData = async () => {
    if (!selectedModuleId) return;
    setLoading(true);
    const res = await getAssessments(Number(selectedModuleId), type);
    if (res.success) setAssessments(res.assessments);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedModuleId]);

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPendingFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedModuleId) return;
    if (!editingId && !pendingFile) {
      setErrorMsg('Please select a file to upload.');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const seqNo = Number(formData.get('sequenceNo'));
    const start = new Date(formData.get('startDate') as string);
    const end = new Date(formData.get('endDate') as string);

    // 1. Date Validation (End >= Start)
    if (end < start) {
      setErrorMsg('End Date cannot be before Start Date.');
      return;
    }

    // 2. Duplicate Sequence Check
    const isDuplicate = assessments.find(a => a.sequenceNo === seqNo && a.id !== editingId);
    if (isDuplicate) {
      setErrorMsg(`${getSingleTitle()} ${seqNo} already exists. Please use a unique number.`);
      return;
    }

    setErrorMsg('');
    setSubmitting(true);

    formData.append('moduleId', String(selectedModuleId));
    formData.append('type', type);
    if (pendingFile) {
      formData.append('fileName', pendingFile.name);
      formData.append('fileData', pendingFile);
    }
    if (solFile) { formData.append('solFile', solFile.name); formData.append('solData', solFile); }
    if (bestFile) { formData.append('bestFile', bestFile.name); formData.append('bestData', bestFile); }
    if (avgFile) { formData.append('avgFile', avgFile.name); formData.append('avgData', avgFile); }
    if (worstFile) { formData.append('worstFile', worstFile.name); formData.append('worstData', worstFile); }

    formData.append('solutionShowToStudent', showToStudent ? 'true' : 'false');

    if (editingId) {
      formData.append('assessmentId', String(editingId));
      const res = await editAssessment(formData);
      if (res.error) {
        setErrorMsg(res.error);
        setSubmitting(false);
      } else { 
        setShowModal(false); 
        setPendingFile(null); 
        setEditingId(null); 
        setSolFile(null); 
        setBestFile(null); 
        setAvgFile(null); 
        setWorstFile(null); 
        loadData(); 
        setSubmitting(false);
      }
    } else {
      const res = await createAssessment(formData);
      if (res.error) setErrorMsg(res.error);
      else { setShowModal(false); setPendingFile(null); loadData(); }
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    setDeleteConfirmId(null);
    await deleteAssessment(id, type);
    loadData();
  };

  const handleSolutionFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSolPendingFile(e.target.files[0]);
    }
  };

  const handleSolutionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!solutionModal) return;
    const typeLabel = solutionModal.type === 'solution' ? 'Solution' : 
                      solutionModal.type === 'best' ? 'Best' : 
                      solutionModal.type === 'avg' ? 'Avg' : 'Worst';

    if (!solPendingFile) {
      setErrorMsg(`Please select ${typeLabel === 'Solution' ? 'a' : 'an'} ${typeLabel} file to upload.`);
      return;
    }
    setErrorMsg('');
    setSubmitting(true);

    const formData = new FormData();
    formData.append('assessmentId', String(solutionModal.id));
    formData.append('solutionType', solutionModal.type);
    formData.append('fileName', solPendingFile.name);
    formData.append('fileData', solPendingFile);
    formData.append('showToStudent', showToStudent ? 'true' : 'false');

    const res = await updateAssessmentSolution(formData);

    if (res.error) {
      const typeLabel = solutionModal.type === 'solution' ? 'Solution' : 
                        solutionModal.type === 'best' ? 'Best' : 
                        solutionModal.type === 'avg' ? 'Avg' : 'Worst';
      setErrorMsg(`Failed to update ${typeLabel} file.`);
    } else {
      setSolutionModal(null);
      setSolPendingFile(null);
      setShowToStudent(true);
      loadData();
    }
    setSubmitting(false);
  };

  if (!selectedModuleId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 font-medium">Please select a course from the Dashboard first.</p>
      </div>
    );
  }

  // Calculate next available sequence number
  const getNextAvailableSeq = () => {
    const existingSeqs = assessments.map(a => a.sequenceNo).sort((a, b) => a - b);
    let next = 1;
    for (const seq of existingSeqs) {
      if (seq === next) next++;
      else if (seq > next) break;
    }
    return next;
  };

  const editingItem = assessments.find(a => a.id === editingId);
  const nextSeq = editingItem ? editingItem.sequenceNo : getNextAvailableSeq();

  const getSingleTitle = () => {
    if (title === 'Quizzes') return 'Quiz';
    if (title === 'Assignments') return 'Assignment';
    return title;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-[#e4e9f2] text-center font-bold text-sm py-4 rounded-md text-[#071a4a] border border-gray-200/60 shadow-sm">
        {title}
      </div>

      <div className="flex items-center gap-4 mt-12 bg-white/50 backdrop-blur-sm p-4 rounded-[2rem] border border-gray-100 shadow-sm w-fit">
        <button 
          onClick={() => {
            if (assessments.length >= maxItems) {
              alert(`Maximum limit of ${maxItems} reached for ${title}.`);
              return;
            }
            setShowModal(true);
            setPendingFile(null);
            setSolFile(null);
            setBestFile(null);
            setAvgFile(null);
            setWorstFile(null);
            setEditingId(null);
            setErrorMsg('');
          }}
          disabled={assessments.length >= maxItems}
          className="bg-gradient-to-r from-[#071a4a] to-[#0a276e] text-white px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-[#071a4a]/20 hover:shadow-[#071a4a]/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale cursor-pointer"
        >
          <Upload className="w-4 h-4" /> Add {getSingleTitle()}
        </button>
        <button 
          onClick={loadData}
          className="bg-white text-[#071a4a] p-3.5 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-all active:scale-95 group"
        >
          <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
        </button>
      </div>

      <hr className="border-gray-200 mt-6" />

      {loading ? (
        <div className="text-center text-sm font-medium text-gray-500 mt-20">Loading data...</div>
      ) : assessments.length === 0 ? (
        <div className="text-center text-sm font-medium text-gray-600 mt-20">
          No {title.toLowerCase()} found
        </div>
      ) : (
        <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-in fade-in">
          <table className="w-full text-sm text-center">
            <thead className="bg-[#f8f9fc] border-b border-gray-200 text-xs text-[#071a4a] uppercase tracking-wider font-extrabold">
              <tr>
                <th className="py-4 px-3 border-r border-gray-200">{type === 'ASSIGNMENT' || type === 'QUIZ' ? 'No' : 'Sr'}</th>
                <th className="py-4 px-3 border-r border-gray-200">Marks</th>
                <th className="py-4 px-3 border-r border-gray-200">Start Date</th>
                <th className="py-4 px-3 border-r border-gray-200">End Date</th>
                <th className="py-4 px-3 border-r border-gray-200">View</th>
                <th className="py-4 px-3 border-r border-gray-200">Solution</th>
                <th className="py-4 px-3 border-r border-gray-200">Best</th>
                <th className="py-4 px-3 border-r border-gray-200">Avg</th>
                <th className="py-4 px-3 border-r border-gray-200">Worst</th>
                <th className="py-4 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {assessments.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-3 border-r border-gray-200 font-bold text-gray-800">{item.sequenceNo || 1}</td>
                  <td className="py-4 px-3 border-r border-gray-200 font-medium text-gray-800">{item.marks}</td>
                  <td className="py-4 px-3 border-r border-gray-200 text-gray-600">{item.startDate}</td>
                  <td className="py-4 px-3 border-r border-gray-200 text-gray-600">{item.endDate}</td>
                  <td className="py-4 px-3 border-r border-gray-200">
                    <button onClick={(e) => { e.preventDefault(); setViewFileUrl(item.fileUrl); }} className="bg-[#071a4a] text-white text-xs px-4 py-1.5 rounded-md hover:bg-[#050f2e] transition shadow-sm font-semibold">View</button>
                  </td>
                  <td className="py-4 px-3 border-r border-gray-200">
                    {item.solutionFileName ? (
                      <button onClick={(e) => { e.preventDefault(); setViewFileUrl(`/uploads/${type.toLowerCase()}s/${item.solutionFileName}`); }} className="bg-[#071a4a] text-white text-xs px-4 py-1.5 rounded-md hover:bg-[#050f2e] transition shadow-sm font-semibold">View</button>
                    ) : (
                      <button onClick={() => { setSolutionModal({ id: item.id, type: 'solution' }); setSolPendingFile(null); setShowToStudent(true); setErrorMsg(''); }} className="bg-[#071a4a] text-white text-xs px-4 py-1.5 rounded-md hover:bg-[#050f2e] transition shadow-sm font-semibold">Add</button>
                    )}
                  </td>
                  <td className="py-4 px-3 border-r border-gray-200">
                    {item.bestFileName ? (
                      <button onClick={(e) => { e.preventDefault(); setViewFileUrl(`/uploads/${type.toLowerCase()}s/${item.bestFileName}`); }} className="bg-[#071a4a] text-white text-xs px-4 py-1.5 rounded-md hover:bg-[#050f2e] transition shadow-sm font-semibold">View</button>
                    ) : (
                      <button onClick={() => { setSolutionModal({ id: item.id, type: 'best' }); setSolPendingFile(null); setErrorMsg(''); }} className="bg-[#071a4a] text-white text-xs px-4 py-1.5 rounded-md hover:bg-[#050f2e] transition shadow-sm font-semibold">Add</button>
                    )}
                  </td>
                  <td className="py-4 px-3 border-r border-gray-200">
                    {item.avgFileName ? (
                      <button onClick={(e) => { e.preventDefault(); setViewFileUrl(`/uploads/${type.toLowerCase()}s/${item.avgFileName}`); }} className="bg-[#071a4a] text-white text-xs px-4 py-1.5 rounded-md hover:bg-[#050f2e] transition shadow-sm font-semibold">View</button>
                    ) : (
                      <button onClick={() => { setSolutionModal({ id: item.id, type: 'avg' }); setSolPendingFile(null); setErrorMsg(''); }} className="bg-[#071a4a] text-white text-xs px-4 py-1.5 rounded-md hover:bg-[#050f2e] transition shadow-sm font-semibold">Add</button>
                    )}
                  </td>
                  <td className="py-4 px-3 border-r border-gray-200">
                    {item.worstFileName ? (
                      <button onClick={(e) => { e.preventDefault(); setViewFileUrl(`/uploads/${type.toLowerCase()}s/${item.worstFileName}`); }} className="bg-[#071a4a] text-white text-xs px-4 py-1.5 rounded-md hover:bg-[#050f2e] transition shadow-sm font-semibold">View</button>
                    ) : (
                      <button onClick={() => { setSolutionModal({ id: item.id, type: 'worst' }); setSolPendingFile(null); setErrorMsg(''); }} className="bg-[#071a4a] text-white text-xs px-4 py-1.5 rounded-md hover:bg-[#050f2e] transition shadow-sm font-semibold">Add</button>
                    )}
                  </td>
                  <td className="py-4 px-3 flex items-center justify-center gap-3">
                    <button onClick={() => { 
                      setEditingId(item.id); 
                      setShowToStudent(item.solutionShowToStudent === true || item.solutionShowToStudent === 1);
                      setShowModal(true); 
                      setPendingFile(null); 
                      setSolFile(null); 
                      setBestFile(null); 
                      setAvgFile(null); 
                      setWorstFile(null); 
                      setErrorMsg(''); 
                    }} className="text-gray-400 hover:text-[#071a4a] transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteConfirmId(item.id)} className="text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bg-[#f8f9fc] py-3 text-center text-xs font-medium text-gray-400">
            A list of {title.toLowerCase()}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-[2px] animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-in zoom-in-95 duration-300">
            
            {/* Modal Header */}
            <div className="px-10 py-6 border-b border-gray-100 flex items-center justify-between bg-white relative">
              <button 
                onClick={() => { setShowModal(false); setEditingId(null); }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-800 border border-gray-100 shadow-sm">
                   <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-[15px] font-black text-gray-800 tracking-tight flex items-center gap-2 uppercase">
                  {editingId ? `Edit ${getSingleTitle()} Record` : `Add ${getSingleTitle()} Details`}
                </h3>
              </div>

              <button 
                form="assessment-form" 
                type="submit" 
                disabled={submitting}
                className="bg-[#071a4a] text-white px-8 py-3 rounded-2xl text-[13px] font-black shadow-xl shadow-[#071a4a]/20 hover:bg-[#051133] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (editingId ? 'Update' : 'Submit')}
              </button>
            </div>

            <div className="p-10 bg-white overflow-y-auto max-h-[85vh] custom-scrollbar">
              {errorMsg && (
                <div className="mb-8 p-4 text-xs bg-red-50 text-red-700 border border-red-100 rounded-2xl font-bold flex items-center gap-3 animate-in shake duration-500">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" /> {errorMsg}
                </div>
              )}

              <form id="assessment-form" onSubmit={handleSubmit} className="space-y-12">
                
                {/* Field Grid: Marks, Dates, Time */}
                <div className="space-y-10">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-gray-400 block uppercase tracking-[2px]">Marks</label>
                      <input 
                        name="marks"
                        type="number"
                        step="0.01"
                        required
                        defaultValue={editingItem?.marks || ''}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm text-center"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-gray-400 block uppercase tracking-[2px]">Start Date</label>
                      <input 
                        name="startDate"
                        type="date"
                        required
                        defaultValue={editingItem?.startDate || ''}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-gray-400 block uppercase tracking-[2px]">End Date</label>
                      <input 
                        name="endDate"
                        type="date"
                        required
                        defaultValue={editingItem?.endDate || ''}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-gray-400 block uppercase tracking-[2px]">Time</label>
                      <input 
                        name="time"
                        type="time"
                        required
                        defaultValue={editingItem?.time || ''}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {hasSeq && (
                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-gray-400 block uppercase tracking-[2px]">Sequence No</label>
                        <input 
                          name="sequenceNo"
                          type="number"
                          defaultValue={editingItem?.sequenceNo || nextSeq}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                        />
                      </div>
                    )}
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-gray-400 block uppercase tracking-[2px]">Show to Students</label>
                      <div className="flex items-center gap-8 py-3.5 px-6 bg-gray-50 border border-gray-100 rounded-2xl shadow-sm h-[56px]">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative flex items-center justify-center">
                            <input 
                              type="radio" 
                              name="show" 
                              checked={showToStudent} 
                              onChange={() => setShowToStudent(true)} 
                              className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-gray-300 transition-all checked:border-[#071a4a] checked:border-4" 
                            />
                            <div className="absolute h-2.5 w-2.5 rounded-full bg-[#071a4a] opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                          </div>
                          <span className="text-[12px] font-black text-gray-700 uppercase tracking-widest group-hover:text-[#071a4a] transition-colors">Yes</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative flex items-center justify-center">
                            <input 
                              type="radio" 
                              name="show" 
                              checked={!showToStudent} 
                              onChange={() => setShowToStudent(false)} 
                              className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-gray-300 transition-all checked:border-[#071a4a] checked:border-4" 
                            />
                            <div className="absolute h-2.5 w-2.5 rounded-full bg-[#071a4a] opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                          </div>
                          <span className="text-[12px] font-black text-gray-700 uppercase tracking-widest group-hover:text-[#071a4a] transition-colors">No</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Upload Section */}
                <div className="space-y-6 pt-4">
                   <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[3px] border-b border-gray-50 pb-4">Update Documents (Optional)</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{getSingleTitle()} File</label>
                        <input id="edit-file-upload" type="file" className="hidden" onChange={handleFileSelection} />
                        <button type="button" onClick={() => document.getElementById('edit-file-upload')?.click()} className="w-full py-5 px-6 border border-gray-100 rounded-3xl bg-white shadow-sm hover:shadow-xl hover:border-blue-200 transition-all flex items-center justify-between group h-[64px]">
                           <div className="flex items-center gap-4">
                             <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                               <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                             </div>
                             <span className="text-[13px] font-black text-gray-700 truncate max-w-[160px]">{pendingFile ? pendingFile.name : `Question Paper`}</span>
                           </div>
                        </button>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Solution Guide</label>
                        <input id="edit-sol-upload" type="file" className="hidden" onChange={(e) => e.target.files && setSolFile(e.target.files[0])} />
                        <button type="button" onClick={() => document.getElementById('edit-sol-upload')?.click()} className="w-full py-5 px-6 border border-gray-100 rounded-3xl bg-white shadow-sm hover:shadow-xl hover:border-blue-200 transition-all flex items-center justify-between group h-[64px]">
                           <div className="flex items-center gap-4">
                             <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                               <Plus className="w-4 h-4" />
                             </div>
                             <span className="text-[13px] font-black text-gray-700 truncate max-w-[160px]">{solFile ? solFile.name : 'Update Solution'}</span>
                           </div>
                           <RefreshCw className={`w-3.5 h-3.5 ${solFile ? 'text-blue-500 animate-spin' : 'text-gray-300'} opacity-0 group-hover:opacity-100 transition-opacity`} />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sample (Best)</label>
                        <input id="edit-best-upload" type="file" className="hidden" onChange={(e) => e.target.files && setBestFile(e.target.files[0])} />
                        <button type="button" onClick={() => document.getElementById('edit-best-upload')?.click()} className="w-full py-5 px-6 border border-gray-100 rounded-3xl bg-white shadow-sm hover:shadow-xl hover:border-blue-200 transition-all flex items-center justify-between group h-[64px]">
                           <div className="flex items-center gap-4">
                             <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                               <Plus className="w-4 h-4" />
                             </div>
                             <span className="text-[13px] font-black text-gray-700 truncate max-w-[160px]">{bestFile ? bestFile.name : 'Best Sample'}</span>
                           </div>
                        </button>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sample (Avg)</label>
                        <input id="edit-avg-upload" type="file" className="hidden" onChange={(e) => e.target.files && setAvgFile(e.target.files[0])} />
                        <button type="button" onClick={() => document.getElementById('edit-avg-upload')?.click()} className="w-full py-5 px-6 border border-gray-100 rounded-3xl bg-white shadow-sm hover:shadow-xl hover:border-blue-200 transition-all flex items-center justify-between group h-[64px]">
                           <div className="flex items-center gap-4">
                             <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                               <Plus className="w-4 h-4" />
                             </div>
                             <span className="text-[13px] font-black text-gray-700 truncate max-w-[160px]">{avgFile ? avgFile.name : 'Average Sample'}</span>
                           </div>
                        </button>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sample (Worst)</label>
                        <input id="edit-worst-upload" type="file" className="hidden" onChange={(e) => e.target.files && setWorstFile(e.target.files[0])} />
                        <button type="button" onClick={() => document.getElementById('edit-worst-upload')?.click()} className="w-full py-5 px-6 border border-gray-100 rounded-3xl bg-white shadow-sm hover:shadow-xl hover:border-blue-200 transition-all flex items-center justify-between group h-[64px]">
                           <div className="flex items-center gap-4">
                             <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                               <Plus className="w-4 h-4" />
                             </div>
                             <span className="text-[13px] font-black text-gray-700 truncate max-w-[160px]">{worstFile ? worstFile.name : 'Worst Sample'}</span>
                           </div>
                        </button>
                      </div>
                   </div>
                </div>
              </form>
            </div>
            
          </div>
        </div>
      )}

      {/* Solution Modal */}
      {solutionModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/90 backdrop-blur-xl w-full max-w-xl rounded-xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
            
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <button onClick={() => setSolutionModal(null)} className="text-gray-400 hover:text-gray-700 transition">
                  <X className="w-5 h-5" />
                </button>
                <FileText className="w-5 h-5 text-gray-800" />
                <h3 className="text-[15px] font-bold text-gray-800">
                  Add {getSingleTitle()} {solutionModal.type === 'solution' ? 'Solution' : solutionModal.type.charAt(0).toUpperCase() + solutionModal.type.slice(1)} File
                </h3>
              </div>
              <button 
                form="solution-form" 
                type="submit" 
                disabled={submitting}
                className="bg-[#071a4a] text-white px-5 py-2 rounded-md text-xs font-bold hover:bg-[#050f2e] transition disabled:opacity-50 shadow-sm"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-gray-50/50">
              {errorMsg && (
                <div className="mb-4 p-3 text-xs bg-red-50 text-red-600 border border-red-100 rounded-lg font-bold">
                  {errorMsg}
                </div>
              )}
              
              <form id="solution-form" onSubmit={handleSolutionSubmit} className="space-y-6">
                
                <div className="bg-white min-h-[100px] border border-gray-100 shadow-sm rounded-lg flex items-center justify-center p-4">
                  {solPendingFile ? (
                    <div className="text-center space-y-2">
                       <button type="button" onClick={() => document.getElementById('sol-file-upload')?.click()} className="flex items-center gap-2 px-6 py-2.5 border-2 border-dashed border-green-400 bg-green-50 rounded-xl hover:bg-green-100 transition cursor-pointer group">
                          <CheckCircle2 className="w-4 h-4 text-green-600 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-bold text-gray-800">{solPendingFile.name}</span>
                       </button>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Click to change file</p>
                    </div>
                  ) : (
                    <button type="button" onClick={() => document.getElementById('sol-file-upload')?.click()} className="flex items-center gap-2 px-6 py-2.5 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 transition cursor-pointer group">
                       <Upload className="w-4 h-4 text-gray-400 group-hover:text-[#071a4a] transition-colors" />
                       <span className="text-sm font-bold text-gray-500 group-hover:text-[#071a4a] transition-colors">Select File</span>
                    </button>
                  )}
                  <input id="sol-file-upload" type="file" className="hidden" onChange={handleSolutionFileSelection} />
                </div>

                {solutionModal.type === 'solution' && (
                  <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex flex-col items-center justify-center space-y-4">
                    <label className="text-[12px] font-black text-gray-600 tracking-wide">Show to Students</label>
                    <div className="flex items-center gap-12">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={showToStudent === true} onChange={() => setShowToStudent(true)} className="w-4 h-4 text-[#071a4a] focus:ring-[#071a4a] cursor-pointer" />
                        <span className="text-sm font-bold text-gray-700">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={showToStudent === false} onChange={() => setShowToStudent(false)} className="w-4 h-4 text-[#071a4a] focus:ring-[#071a4a] cursor-pointer" />
                        <span className="text-sm font-bold text-gray-700">No</span>
                      </label>
                    </div>
                  </div>
                )}
                
              </form>
            </div>
            
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
                <p className="text-sm text-gray-500 mt-1">Are you sure you want to delete this item? This cannot be undone.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setDeleteConfirmId(null)} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20 transition-all flex items-center gap-2">
                Yes, delete it
              </button>
            </div>
          </div>
        </div>
      )}

      <DocumentViewer url={viewFileUrl} onClose={() => setViewFileUrl(null)} />
    </div>
  );
}
