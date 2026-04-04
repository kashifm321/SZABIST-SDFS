import prisma from '@/lib/prisma';
import ManageClassesClient from './ManageClassesClient';

export const dynamic = 'force-dynamic';

export default async function ManageClassesPage() {
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

  // Serialize course data with types
  const courses = courseList.map((c: any) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    prerequisite: c.prerequisite || 'Null',
    creditHours: c.creditHours
  }));

  // Serialize module data with types
  const initialClasses = moduleList.map((m: any) => ({
    id: m.id,
    courseId: m.course?.code || 'N/A',
    courseName: m.course?.name || 'Unknown',
    prerequisite: m.course?.prerequisite || 'Null',
    creditHours: m.course?.creditHours || 0,
    department: m.department,
    semesterLevel: String(m.semesterLevel),
    section: m.section,
    instructor: m.teacher?.name || 'TBD',
    status: m.teacher ? 'ASSIGNED' : 'UNASSIGNED',
    totalEnrolled: m.enrolledStudents?.length || 0,
    academicYear: m.academicYear,
    academicSemester: m.academicSemester
  }));

  const teachers = await prisma.user.findMany({
    where: { role: 'TEACHER' },
    orderBy: { name: 'asc' },
  });

  return <ManageClassesClient 
    initialClasses={initialClasses} 
    availableCourses={courses} 
    availableTeachers={teachers.map(t => ({ id: t.id, name: t.name, email: t.email }))} 
  />;
}

