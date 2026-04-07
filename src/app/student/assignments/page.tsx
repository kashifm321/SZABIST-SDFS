import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import AssessmentStudentClient from '../components/AssessmentStudentClient';
import { redirect } from 'next/navigation';

export default async function AssignmentsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) redirect('/login');

  const session = await verifySession(token);
  if (!session || !session.userId) redirect('/login');

  return <AssessmentStudentClient type="ASSIGNMENT" userId={Number(session.userId)} />;
}
