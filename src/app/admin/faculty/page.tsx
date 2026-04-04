import prisma from '@/lib/prisma';
import ManageFacultyClient from './ManageFacultyClient';

export default async function ManageFacultyPage() {
  const facultyList = await prisma.user.findMany({
    where: { role: 'TEACHER' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const faculty = facultyList.map((f) => {
    const parts = f.name.split(' ');
    return {
      ...f,
      role: f.role as string,
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
    };
  });

  return <ManageFacultyClient faculty={faculty} />;
}
