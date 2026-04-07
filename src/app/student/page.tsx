import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { getStudentDashboardData } from '@/app/actions/student-portal';
import StudentDashboardClient from './components/StudentDashboardClient';
import { redirect } from 'next/navigation';

export default async function StudentPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) redirect('/login');

  const session = await verifySession(token);
  if (!session || !session.userId) redirect('/login');

  const res = await getStudentDashboardData(Number(session.userId));
  
  if (res.error) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 border border-red-100 p-8 rounded-[32px] text-center max-w-md">
          <p className="text-red-600 font-black uppercase tracking-widest text-xs mb-2">Sync Error</p>
          <p className="text-red-900 font-bold">{res.error}</p>
        </div>
      </div>
    );
  }

  return <StudentDashboardClient courses={res.courses || []} />;
}
