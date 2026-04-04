import prisma from '@/lib/prisma';
import ClassesClientLoader from '@/components/admin/ClassesClientLoader';

export const revalidate = 0;

export default async function ManageClassesPage() {
  try {
    const courseList = await prisma.course.findMany({
      orderBy: { code: 'asc' },
    });

    const moduleList = await prisma.module.findMany({
      include: {
        course: true,
        teacher: true,
        enrolledStudents: {
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const teachers = await prisma.user.findMany({
      where: { role: 'TEACHER' },
      orderBy: { name: 'asc' },
    });

    const courses = (courseList || []).map((c: any) => ({
      id: c.id,
      code: c.code || 'N/A',
      name: c.name || 'Untitled Course',
      prerequisite: c.prerequisite || 'Null',
      creditHours: c.creditHours || 0
    }));

    const initialClasses = (moduleList || []).map((m: any) => ({
      id: m.id,
      courseId: m.course?.code || 'N/A',
      courseName: m.course?.name || 'Unknown',
      prerequisite: m.course?.prerequisite || 'Null',
      creditHours: m.course?.creditHours || 0,
      department: m.department || 'BSCS',
      semesterLevel: String(m.semesterLevel || 1),
      section: m.section || 'A',
      instructor: m.teacher?.name || 'TBD',
      status: m.teacher ? 'ASSIGNED' : 'UNASSIGNED',
      totalEnrolled: m.enrolledStudents?.length || 0,
      academicYear: m.academicYear || 2026,
      academicSemester: m.academicSemester || 'Fall'
    }));

    return <ClassesClientLoader 
      initialClasses={initialClasses} 
      availableCourses={courses} 
      availableTeachers={(teachers || []).map(t => ({ id: t.id, name: t.name, email: t.email }))} 
    />;
  } catch (error: any) {
    console.error('CRITICAL: Classes page load failed:', error);
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800">System Link Error</h2>
        <p className="text-gray-500 max-w-md text-sm leading-relaxed">
          Unable to initialize the management interface. Please check your connection and try again.
        </p>
        <button 
          onClick={() => typeof window !== 'undefined' && window.location.reload()}
          className="px-6 py-2 bg-[#071a4a] text-white rounded-lg text-sm font-bold active:scale-95 transition-all shadow-lg"
        >
          Try Reloading
        </button>
      </div>
    );
  }
}
