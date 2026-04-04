'use client';

import dynamic from 'next/dynamic';

const ClassesClient = dynamic(() => import('@/app/admin/classes/ManageClassesClient'), {
  ssr: false,
  loading: () => (
    <div className="p-10 flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#071a4a]/20 border-t-[#071a4a] rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Initializing Portal...</p>
      </div>
    </div>
  )
});

export default function ClassesClientLoader(props: any) {
  return <ClassesClient {...props} />;
}
