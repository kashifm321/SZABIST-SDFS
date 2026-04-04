import { cookies } from 'next/headers';
import DashboardShell from '@/components/layout/DashboardShell';
import prisma from '@/lib/prisma';
import { verifySession as verifySessionAuth } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let user = { name: 'Admin User', email: 'admin@szabist-isb.edu.pk' };

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (token) {
      const session = await verifySessionAuth(token);
      
      if (session && session.userId) {
        // Safe conversion of userId - handles both string/number payload
        const userId = Number(session.userId);
        
        if (!isNaN(userId)) {
          const dbUser = await prisma.user.findUnique({
            where: { id: userId },
          });

          if (dbUser) {
            user = {
              name: dbUser.name || 'Admin User',
              email: dbUser.email || 'admin@szabist-isb.edu.pk',
            };
          }
        }
      }
    }
  } catch (error) {
    console.error('CRITICAL: AdminLayout session/user fetch error:', error);
    // Continue with default 'Admin User' to prevent 500 crash
  }

  return (
    <DashboardShell user={user} role="ADMIN">
      {children}
    </DashboardShell>
  );
}
