'use client';

import { useState, useEffect } from 'react';
import { useDashboard } from '@/components/layout/DashboardContext';
import { getModuleSummary } from '@/app/actions/module';
import { Loader2, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SummaryPage() {
  const { selectedModuleId, setHeaderExtra } = useDashboard();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedModuleId) {
      setLoading(false);
      return;
    }

    async function loadSummary() {
      setLoading(true);
      const res = await getModuleSummary(Number(selectedModuleId));
      if (res.success) {
        setData(res);
        // Set dynamic header
        const courseName = res.module?.courseName || res.module?.name || 'Selected Course';
        setHeaderExtra(
          <div className="flex items-center animate-in fade-in slide-in-from-left-2 transition-all">
            <div className="h-4 w-[2px] bg-gray-200 mx-3 hidden sm:block"></div>
            <div className="bg-[#071a4a] text-white px-4 py-1.5 rounded-lg shadow-sm flex items-center gap-2 border border-blue-400/20">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-300/80">Selected Course:</span>
                <span className="text-[13px] font-bold tracking-tight">{courseName}</span>
            </div>
          </div>
        );
      } else {
        setError(res.error || 'Failed to load summary');
      }
      setLoading(false);
    }

    loadSummary();
    return () => setHeaderExtra(null);
  }, [selectedModuleId, setHeaderExtra]);

  if (!selectedModuleId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <FileText className="w-16 h-16 text-gray-200 mb-4" />
        <h2 className="text-xl font-bold text-gray-800">No Course Selected</h2>
        <p className="text-gray-500">Please select a course from the Dashboard to view the summary.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#071a4a]" />
      </div>
    );
  }

  const module = data?.module;
  const assessments = data?.assessments || [];

  const StatusLabel = ({ completed }: { completed: boolean }) => (
    <span className={`font-bold ${completed ? 'text-green-600' : 'text-red-500'}`}>
      {completed ? 'Completed' : 'Pending'}
    </span>
  );

  const renderAssessmentTable = (title: string, type: string, count: number) => {
    const items = Array.from({ length: count }, (_, i) => i + 1);
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#071a4a] text-center mt-12 mb-6">{title}</h3>
        <div className="overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm">
          <table className="w-full text-sm text-center border-collapse">
            <thead>
              <tr className="bg-white text-gray-500 font-bold uppercase text-[10px] tracking-widest border-b border-gray-100">
                <th className="py-4 px-3 border-r border-gray-100">{title.slice(0, -1)} No</th>
                <th className="py-4 px-3 border-r border-gray-100">{title.slice(0, -1)} File</th>
                <th className="py-4 px-3 border-r border-gray-100">Solution File</th>
                <th className="py-4 px-3 border-r border-gray-100">Best Solution</th>
                <th className="py-4 px-3 border-r border-gray-100">Avg Solution</th>
                <th className="py-4 px-3">Worst Solution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(no => {
                const assessment = assessments.find((a: any) => a.type === type && a.sequenceNo === no);
                return (
                  <tr key={no} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-3 border-r border-gray-100 font-bold text-gray-700">{no}</td>
                    <td className="py-4 px-3 border-r border-gray-100"><StatusLabel completed={!!assessment?.fileName} /></td>
                    <td className="py-4 px-3 border-r border-gray-100"><StatusLabel completed={!!assessment?.solutionFileName} /></td>
                    <td className="py-4 px-3 border-r border-gray-100"><StatusLabel completed={!!assessment?.bestFileName} /></td>
                    <td className="py-4 px-3 border-r border-gray-100"><StatusLabel completed={!!assessment?.avgFileName} /></td>
                    <td className="py-4 px-3"><StatusLabel completed={!!assessment?.worstFileName} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSingleAssessmentTable = (title: string, type: string) => {
    const assessment = assessments.find((a: any) => a.type === type);
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#071a4a] text-center mt-12 mb-6">{title}</h3>
        <div className="overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm">
          <table className="w-full text-sm text-center border-collapse">
            <thead>
              <tr className="bg-white text-gray-500 font-bold uppercase text-[10px] tracking-widest border-b border-gray-100">
                <th className="py-4 px-3 border-r border-gray-100">File Type</th>
                <th className="py-4 px-3 border-r border-gray-100">Question Paper</th>
                <th className="py-4 px-3 border-r border-gray-100">Solution File</th>
                <th className="py-4 px-3 border-r border-gray-100">Best Sample</th>
                <th className="py-4 px-3 border-r border-gray-100">Avg Sample</th>
                <th className="py-4 px-3">Worst Sample</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-3 border-r border-gray-100 font-bold text-gray-700">{title}</td>
                <td className="py-4 px-3 border-r border-gray-100"><StatusLabel completed={!!assessment?.fileName} /></td>
                <td className="py-4 px-3 border-r border-gray-100"><StatusLabel completed={!!assessment?.solutionFileName} /></td>
                <td className="py-4 px-3 border-r border-gray-100"><StatusLabel completed={!!assessment?.bestFileName} /></td>
                <td className="py-4 px-3 border-r border-gray-100"><StatusLabel completed={!!assessment?.avgFileName} /></td>
                <td className="py-4 px-3"><StatusLabel completed={!!assessment?.worstFileName} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      
      {/* Top Level Module Files */}
      <div className="overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm">
        <table className="w-full text-sm text-center border-collapse">
          <thead>
            <tr className="bg-white text-gray-500 font-bold uppercase text-[10px] tracking-widest border-b border-gray-100">
              <th className="py-4 px-3 border-r border-gray-100 w-1/5">Course Outline</th>
              <th className="py-4 px-3 border-r border-gray-100 w-1/5">Registered Students</th>
              <th className="py-4 px-3 border-r border-gray-100 w-1/5">Lecture Progress</th>
              <th className="py-4 px-3 border-r border-gray-100 w-1/5">Recap Sheet</th>
              <th className="py-4 px-3 w-1/5">FCAR</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-6 px-3 border-r border-gray-100"><StatusLabel completed={!!module?.outlineUrl} /></td>
              <td className="py-6 px-3 border-r border-gray-100"><StatusLabel completed={!!module?.registeredStudentsUrl} /></td>
              <td className="py-6 px-3 border-r border-gray-100"><StatusLabel completed={!!module?.lectureProgressUrl} /></td>
              <td className="py-6 px-3 border-r border-gray-100"><StatusLabel completed={!!module?.recapSheetUrl} /></td>
              <td className="py-6 px-3"><StatusLabel completed={!!module?.fcarUrl} /></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Assessments Section */}
      <div className="space-y-4">
        {renderAssessmentTable('Assignments', 'ASSIGNMENT', 4)}
        {renderAssessmentTable('Quizzes', 'QUIZ', 4)}
        {renderSingleAssessmentTable('Mid Term', 'MID_TERM')}
        {renderSingleAssessmentTable('Final Term', 'FINAL_TERM')}
      </div>

      <div className="pt-12 text-center text-[10px] font-black text-gray-300 uppercase tracking-[8px]">
        Official Academic Status Dashboard
      </div>
    </div>
  );
}
