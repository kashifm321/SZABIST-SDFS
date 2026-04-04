import { logoutUser } from '@/app/actions/auth';

export default function StudentDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 font-sans">Student Dashboard</h1>


      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <p className="text-slate-600 text-lg">Welcome to your Digital Folders.</p>
      </div>
    </div>
  );
}
