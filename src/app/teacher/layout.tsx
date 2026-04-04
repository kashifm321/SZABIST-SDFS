import { cookies } from 'next/headers';
import DashboardShell from '@/components/layout/DashboardShell';

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  
  let user = { name: 'Teacher User', email: 'teacher@szabist-isb.edu.pk' };
  
  if (token) {
    try {
      const { verifySession: verifySessionAuth } = await import('@/lib/auth');
      const session = await verifySessionAuth(token);
      
      if (session && session.userId) {
        const prisma = (await import('@/lib/prisma')).default;
        const dbUser = await prisma.user.findUnique({
          where: { id: Number(session.userId) },
        });

        if (dbUser) {
          user = {
            name: dbUser.name,
            email: dbUser.email,
          };
        }
      }
    } catch (error) {
      console.error('Teacher layout user fetch error:', error);
    }
  }

  return (
    <DashboardShell user={user} role="TEACHER">
      {children}
    </DashboardShell>
  );
}
