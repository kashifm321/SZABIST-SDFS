import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import AssessmentStudentClient from '../components/AssessmentStudentClient';
import { redirect } from 'next/navigation';

export default async function QuizzesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) redirect('/login');

  const session = await verifySession(token);
  if (!session || !session.userId) redirect('/login');

  return <AssessmentStudentClient type="QUIZ" userId={Number(session.userId)} />;
}
