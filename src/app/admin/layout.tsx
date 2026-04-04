import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import AdminDashboardClient from './components/AdminDashboardClient';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  
  let user = { name: 'Admin User', email: 'admin@szabist-isb.edu.pk' };
  
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
      console.error('Layout user fetch error:', error);
    }
  }

  return <AdminDashboardClient user={user}>{children}</AdminDashboardClient>;
}
