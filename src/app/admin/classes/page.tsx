import prisma from '@/lib/prisma';
import dynamic from 'next/dynamic';

// Use dynamic import with ssr: false to prevent hydration crashes
const ManageClassesClient = dynamic(
  () => import('./ManageClassesClient')
);

// Freshness Tag: 2026-04-04T12:35 (Force Cache Purge)
export const revalidate = 0;

export default async function ManageClassesPage() {
  const [modules, courses, teachers] = await Promise.all([
    prisma.module.findMany({
      include: {
        course: true,
        teacher: true,
        _count: {
          select: { enrolledStudents: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.course.findMany({
      orderBy: { code: 'asc' }
    }),
    prisma.user.findMany({
      where: { role: 'TEACHER' },
      orderBy: { name: 'asc' }
    })
  ]);

  const initialClasses = modules.map(m => ({
    id: m.id,
    courseId: m.course?.code || 'N/A',
    courseName: m.course?.name || m.name,
    prerequisite: m.course?.prerequisite || 'None',
    creditHours: m.course?.creditHours || 0,
    department: m.department,
    semesterLevel: String(m.semesterLevel),
    section: m.section,
    instructor: m.teacher?.name || 'TBD',
    status: m.teacherId ? 'ASSIGNED' : 'UNASSIGNED',
    totalEnrolled: m._count.enrolledStudents,
    academicYear: m.academicYear,
    academicSemester: m.academicSemester
  }));

  const availableCourses = courses.map(c => ({
    id: c.id,
    code: c.code,
    name: c.name,
    prerequisite: c.prerequisite || 'None',
    creditHours: c.creditHours
  }));

  const availableTeachers = teachers.map(t => ({
    id: t.id,
    name: t.name,
    email: t.email
  }));

  return (
    <ManageClassesClient 
      initialClasses={initialClasses}
      availableCourses={availableCourses}
      availableTeachers={availableTeachers}
    />
  );
}
