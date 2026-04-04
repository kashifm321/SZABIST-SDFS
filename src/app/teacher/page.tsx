import { logoutUser } from '@/app/actions/auth';

export default function TeacherDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Teacher Dashboard</h1>


      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <p className="text-slate-600 text-lg">Welcome to the Teacher Portal. Manage your modules and materials here.</p>
      </div>
    </div>
  );
}
