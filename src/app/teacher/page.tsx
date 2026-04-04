import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import TeacherDashboardClient from './components/TeacherDashboardClient';

export default async function TeacherDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  
  let modules: any[] = [];
  
  if (token) {
    try {
      const { verifySession: verifySessionAuth } = await import('@/lib/auth');
      const session = await verifySessionAuth(token);
      
      if (session && session.userId) {
        modules = await prisma.module.findMany({
          where: { teacherId: Number(session.userId) },
          include: {
            course: true
          },
          orderBy: { createdAt: 'desc' }
        });
      }
    } catch (error) {
      console.error('Teacher modules fetch error:', error);
    }
  }

  return <TeacherDashboardClient modules={modules} />;
}
