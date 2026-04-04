import prisma from '@/lib/prisma';
import AddCourseClient from './AddCourseClient';

export default async function AddCoursePage() {
  const courseList = await prisma.course.findMany({
    orderBy: { code: 'asc' },
  });

  // Ensure data is serializable (removes non-serializable Prisma Dates)
  const courses = courseList.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    prerequisite: c.prerequisite || 'Null',
    creditHours: c.creditHours,
  }));

  return <AddCourseClient initialCourses={courses} />;
}
