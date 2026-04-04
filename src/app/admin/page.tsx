import prisma from '@/lib/prisma';
import { Users, BookOpen, BarChart3 } from 'lucide-react';

export default async function AdminPage() {
  // Fetch real counts from database
  const [totalFaculty, totalStudents, totalCourses] = await Promise.all([
    prisma.user.count({ where: { role: 'TEACHER' } }),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.course.count(),
  ]);

  const statCards = [
    { label: 'Total Faculty', value: totalFaculty, icon: <Users className="w-8 h-8 text-gray-500" /> },
    { label: 'Total Courses', value: totalCourses, icon: <BookOpen className="w-8 h-8 text-gray-500" /> },
    { label: 'Total Students', value: totalStudents, icon: <BarChart3 className="w-8 h-8 text-gray-500" /> },
  ];

  // Fetch faculty workload for the chart
  const facultyWorkload = await prisma.user.findMany({
    where: { role: 'TEACHER' },
    include: {
      _count: {
        select: { modules: true }
      }
    },
    orderBy: { 
      modules: { _count: 'desc' } 
    },
    take: 10 // Show top 10 busy faculty
  });

  const maxCourses = Math.max(...facultyWorkload.map(f => f._count.modules), 1);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {statCards.map((card) => (
          <div key={card.label}
            className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-gray-100 rounded-lg">{card.icon}</div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{card.label}</p>
              <p className="text-3xl font-bold text-gray-800">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Course Distribution Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-base font-bold text-[#071a4a]">Course Distribution</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Teaching load per faculty member</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-[#071a4a] rounded-full"></div>
              <span className="text-[10px] font-bold text-gray-500 uppercase">Assigned Courses</span>
            </div>
          </div>
        </div>

        <div className="flex items-end gap-3 h-56 px-2">
          {facultyWorkload.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-50 rounded-2xl">
               <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">No faculty assignments found</p>
            </div>
          ) : (
            facultyWorkload.map((faculty) => {
              const height = (faculty._count.modules / maxCourses) * 100;
              return (
                <div key={faculty.id} className="flex-1 flex flex-col items-center gap-3 h-full group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#071a4a] text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-10">
                    {faculty._count.modules} Courses
                  </div>
                  
                  <div className="flex-1 w-full flex flex-col justify-end">
                    <div
                      className="w-full bg-[#071a4a] rounded-t-lg opacity-80 group-hover:opacity-100 transition-all shadow-lg hover:shadow-[#071a4a]/20"
                      style={{ height: `${height}%`, minHeight: faculty._count.modules > 0 ? '4px' : '0' }}
                    />
                  </div>
                  <div className="h-10 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-black text-gray-800 uppercase tracking-tighter leading-none truncate w-full px-1" title={faculty.name}>
                      {faculty.name.trim().split(/\s+/).filter(Boolean).map(n => n[0]).join('')}
                    </span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase mt-0.5">{faculty._count.modules}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="mt-8 pt-6 border-t border-gray-50 flex justify-center">
           <p className="text-[10px] font-black text-gray-300 uppercase tracking-[4px]">Faculty Workload Distribution Portfolio</p>
        </div>
      </div>
    </div>
  );
}
