import prisma from '@/lib/prisma';
import ManageStudentsClient from './ManageStudentsClient';

export default async function ManageStudentsPage() {
  const studentList = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      registrationNumber: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const students = studentList.map((s) => {
    const parts = s.name.split(' ');
    return {
      ...s,
      role: s.role as string,
      registrationNumber: s.registrationNumber ?? undefined,
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
    };
  });

  return <ManageStudentsClient students={students} />;
}
