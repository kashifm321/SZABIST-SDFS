'use client';

import { X, FileText } from 'lucide-react';

interface DocumentViewerProps {
  url: string | null;
  onClose: () => void;
}

export default function DocumentViewer({ url, onClose }: DocumentViewerProps) {
  if (!url) return null;


  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-[#071a4a]/95 backdrop-blur-md animate-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between px-6 py-3 bg-black/40 text-white shadow-xl backdrop-blur-xl border-b border-white/10">
        <h3 className="font-black text-sm flex items-center gap-2 uppercase tracking-widest opacity-80">
          <FileText className="w-4 h-4 text-blue-400" /> Document Viewer
        </h3>
        <div className="flex gap-4 items-center">
          <button
            onClick={onClose}
            className="text-white hover:text-red-400 p-1.5 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10 flex items-center justify-center group"
          >
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      </div>
      <div className="flex-1 w-full p-4 overflow-hidden flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 flex items-center justify-center -z-10">
          <span className="text-white/20 font-bold tracking-widest uppercase">
            Loading Document...
          </span>
        </div>
        <iframe
          id="doc-iframe"
          src={url}
          className="w-full h-full bg-white rounded-lg shadow-2xl border border-white/10 z-10 block"
        />
      </div>
    </div>
  );
}
