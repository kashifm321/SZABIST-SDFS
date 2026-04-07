'use client';

import { useState } from 'react';
import { useDashboard } from '@/components/layout/DashboardContext';
import { getDownloadableFiles } from '@/app/actions/module';
import { 
  Download, 
  CheckCircle2, 
  Circle, 
  Loader2, 
  FileArchive, 
  AlertCircle
} from 'lucide-react';
import Script from 'next/script';

const CATEGORIES = [
  { id: 'outline', label: 'Course Outline' },
  { id: 'students', label: 'Registered Students' },
  { id: 'progress', label: 'Lecture Progress' },
  { id: 'materials', label: 'Lecture Material' },
  { id: 'assignments', label: 'Assignment' },
  { id: 'quizzes', label: 'Quiz' },
  { id: 'midterm', label: 'Midterm' },
  { id: 'finalterm', label: 'Final Term' },
  { id: 'recap', label: 'Recap Sheet' },
  { id: 'fcar', label: 'Fcar' },
];

export default function DownloadPage() {
  const { selectedModuleId } = useDashboard();
  const [selected, setSelected] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const toggleAll = () => {
    if (selected.length === CATEGORIES.length) {
      setSelected([]);
    } else {
      setSelected(CATEGORIES.map(c => c.id));
    }
  };

  const toggleOne = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDownload = async () => {
    if (!selectedModuleId || selected.length === 0) return;
    setDownloading(true);
    setError('');

    try {
      const res = await getDownloadableFiles(Number(selectedModuleId));
      if (!res.success || !res.files) {
        throw new Error(res.error || 'Failed to fetch files');
      }

      // @ts-ignore
      const JSZip = window.JSZip;
      if (!JSZip) throw new Error('JSZip library not loaded');

      const zip = new JSZip();
      const root = zip.folder("Course_Files");
      const files = res.files;

      const addFileByUrl = async (folder: any, fileInfo: { name: string, url: string }) => {
        try {
          const resp = await fetch(fileInfo.url);
          const blob = await resp.blob();
          folder.file(fileInfo.name, blob);
        } catch (e) {
          console.error(`Failed to download ${fileInfo.name}`, e);
        }
      };

      // Process selections
      if (selected.includes('outline') && files.outline) await addFileByUrl(root.folder("Course Outlines"), files.outline);
      if (selected.includes('students') && files.students) await addFileByUrl(root.folder("Registered Student"), files.students);
      if (selected.includes('progress') && files.progress) await addFileByUrl(root.folder("Lecture Progress"), files.progress);
      if (selected.includes('recap') && files.recap) await addFileByUrl(root.folder("Recap Sheet"), files.recap);
      if (selected.includes('fcar') && files.fcar) await addFileByUrl(root.folder("FCAR"), files.fcar);

      if (selected.includes('materials')) {
        const matFolder = root.folder("Lecture Material");
        for (const m of files.materials) await addFileByUrl(matFolder, m);
      }

      if (selected.includes('assignments')) {
        const assFolder = root.folder("Assignments");
        for (const a of files.assessments.filter(x => (x as any).type === 'ASSIGNMENT' && !(x as any).isAssigned)) {
          const sub = assFolder.folder(a.title || `Assignment_${(a as any).sequenceNo || 'unnamed'}`);
          await addFileByUrl(sub, { name: a.name, url: a.url });
          if (a.sol) await addFileByUrl(sub, a.sol);
          if (a.best) await addFileByUrl(sub, a.best);
          if (a.avg) await addFileByUrl(sub, a.avg);
          if (a.worst) await addFileByUrl(sub, a.worst);
        }
      }

      if (selected.includes('quizzes')) {
        const qzFolder = root.folder("Quizzes");
        for (const a of files.assessments.filter(x => (x as any).type === 'QUIZ' && !(x as any).isAssigned)) {
          const sub = qzFolder.folder(a.title || `Quiz_${(a as any).sequenceNo || 'unnamed'}`);
          await addFileByUrl(sub, { name: a.name, url: a.url });
          if (a.sol) await addFileByUrl(sub, a.sol);
          if (a.best) await addFileByUrl(sub, a.best);
          if (a.avg) await addFileByUrl(sub, a.avg);
          if (a.worst) await addFileByUrl(sub, a.worst);
        }
      }

      if (selected.includes('midterm')) {
        const midFolder = root.folder("Midterm");
        for (const a of files.assessments.filter(x => x.type === 'MID_TERM')) {
          const sub = midFolder.folder("Midterm_Exam");
          await addFileByUrl(sub, { name: a.name, url: a.url });
          if (a.sol) await addFileByUrl(sub, a.sol);
          if (a.best) await addFileByUrl(sub, a.best);
          if (a.avg) await addFileByUrl(sub, a.avg);
          if (a.worst) await addFileByUrl(sub, a.worst);
        }
      }

      if (selected.includes('finalterm')) {
        const finFolder = root.folder("Final Term");
        for (const a of files.assessments.filter(x => x.type === 'FINAL_TERM')) {
          const sub = finFolder.folder("Final_Exam");
          await addFileByUrl(sub, { name: a.name, url: a.url });
          if (a.sol) await addFileByUrl(sub, a.sol);
          if (a.best) await addFileByUrl(sub, a.best);
          if (a.avg) await addFileByUrl(sub, a.avg);
          if (a.worst) await addFileByUrl(sub, a.worst);
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      const filesMeta = res.files as any;
      const coursePrefix = filesMeta.courseCode || filesMeta.courseName || 'Course';
      link.download = `${coursePrefix}-course folder.zip`;
      link.click();
      
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  if (!selectedModuleId) {
    return <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">Please select a course to download files.</div>;
  }

  return (
    <div className="p-4 md:p-12 w-full max-w-[1250px] mx-auto space-y-8 animate-in fade-in duration-500">
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js" strategy="lazyOnload" />

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-2xl p-6 md:p-10 space-y-8">
         <div className="flex items-center gap-4 border-b border-gray-50 pb-8">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <FileArchive className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-[#071a4a] tracking-tight">Download Course Files</h2>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Select All */}
            <button 
              onClick={toggleAll}
              className={`flex items-center gap-3 p-5 rounded-2xl border transition-all text-left ${
                selected.length === CATEGORIES.length 
                ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' 
                : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-300'
              }`}
            >
              {selected.length === CATEGORIES.length ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
              <span className="text-sm font-bold uppercase tracking-widest">Select All</span>
            </button>

            {CATEGORIES.map((cat) => (
              <button 
                key={cat.id}
                onClick={() => toggleOne(cat.id)}
                className={`flex items-center gap-3 p-5 rounded-2xl border transition-all text-left ${
                  selected.includes(cat.id) 
                  ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' 
                  : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-300'
                }`}
              >
                {selected.includes(cat.id) ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                <span className="text-sm font-bold tracking-tight">{cat.label}</span>
              </button>
            ))}
         </div>

         {error && (
           <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-3">
             <AlertCircle className="w-4 h-4" /> {error}
           </div>
         )}

         <div className="pt-4">
           <button 
             onClick={handleDownload}
             disabled={downloading || selected.length === 0}
             className="w-full bg-[#071a4a] hover:bg-[#051133] text-white py-5 rounded-2xl font-black text-sm shadow-xl shadow-blue-900/20 transition-all active:scale-95 disabled:grayscale disabled:opacity-50 flex items-center justify-center gap-3"
           >
             {downloading ? (
               <><Loader2 className="w-5 h-5 animate-spin" /> Preparing Archive...</>
             ) : (
               <><Download className="w-5 h-5" /> Download</>
             )}
           </button>
         </div>
      </div>
    </div>
  );
}
