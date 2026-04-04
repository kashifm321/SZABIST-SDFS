import { logoutUser } from '@/app/actions/auth';

export default function TeacherDashboard() {
  return (
    <div className="p-10 font-sans min-h-screen bg-slate-50">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-indigo-600">Teacher Dashboard</h1>
        
        <form action={logoutUser}>
          <button type="submit" className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-sm">
            Logout
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <p className="text-slate-600 text-lg">Welcome to the Teacher Portal. Manage your modules and materials here.</p>
      </div>
    </div>
  );
}
