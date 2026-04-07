'use client';
import AssessmentManagerClient from '../components/AssessmentManagerClient';

export default function QuizzesPage() {
  return <AssessmentManagerClient title="Quizzes" type="QUIZ" maxItems={4} />;
}
