'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { logoutUser, changePassword } from '@/app/actions/auth';
import {
  LayoutDashboard,
  Users,
  BookPlus,
  GraduationCap,
  UserCog,
  Settings,
  LogOut,
  Menu,
  BarChart3,
  BookOpen,
  User,
  KeyRound,
  X,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { label: 'Manage Faculty', icon: UserCog, href: '/admin/faculty' },
  { label: 'Add Course', icon: BookPlus, href: '/admin/courses/add' },
  { label: 'Classes', icon: BookOpen, href: '/admin/classes' },
  { label: 'Manage Students', icon: GraduationCap, href: '/admin/students' },
];

export default function AdminDashboardClient({
  user,
  stats,
  children,
}: {
  user: { name: string; email: string };
  stats?: { totalFaculty: number; totalStudents: number; totalCourses: number };
  children?: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Split Name for Profile Display
  const nameParts = user.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const statCards = stats
    ? [
        { label: 'Total Faculty', value: stats.totalFaculty, icon: <Users className="w-8 h-8 text-gray-500" /> },
        { label: 'Total Courses', value: stats.totalCourses, icon: <BookOpen className="w-8 h-8 text-gray-500" /> },
        { label: 'Total Students', value: stats.totalStudents, icon: <BarChart3 className="w-8 h-8 text-gray-500" /> },
      ]
    : [];

  const isHome = pathname === '/admin';

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed z-30 inset-y-0 left-0 w-56 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-200">
          <div className="relative w-10 h-10 flex-shrink-0">
            <Image
              src="/images/szabist-logo.png"
              alt="SZABIST Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <span className="font-extrabold text-[#071a4a] text-xl tracking-tight leading-none">SZABIST</span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => { router.push(item.href); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left
                ${(item.href === '/admin' ? pathname === '/admin' : pathname === item.href || pathname.startsWith(item.href + '/'))
                  ? 'bg-[#071a4a] text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="bg-[#071a4a] p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">User Profile</h3>
                <p className="text-blue-200 text-xs mt-0.5">Your personal credentials</p>
              </div>
              <button onClick={() => setShowProfileModal(false)} className="text-white/70 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex flex-col items-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-[#071a4a] text-2xl font-bold border-4 border-[#071a4a]/10 mb-3">
                  {initials}
                </div>
                <span className="inline-block px-3 py-1 bg-[#071a4a]/5 text-[#071a4a] text-[10px] font-black tracking-widest uppercase rounded-full">
                  Administrative Account
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">First Name</label>
                  <p className="text-sm font-bold text-gray-800">{firstName}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Last Name</label>
                  <p className="text-sm font-bold text-gray-800">{lastName}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email Address</label>
                <p className="text-sm font-bold text-gray-800">{user.email}</p>
              </div>

              <div className="pt-6">
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className="w-full bg-[#071a4a] hover:bg-[#050f2e] text-white py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-[#071a4a]/20 transition-all active:scale-[0.98]"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Setting Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="bg-[#071a4a] p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Privacy Settings</h3>
                <p className="text-blue-200 text-xs mt-0.5">Update your account password</p>
              </div>
              <button onClick={() => setShowPasswordModal(false)} className="text-white/70 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                setPasswordError('');
                setPasswordSuccess('');
                setIsPending(true);
                const formData = new FormData(e.currentTarget);
                const result = await changePassword(null, formData);
                setIsPending(false);
                if (result?.error) setPasswordError(result.error);
                else if (result?.success) {
                  setPasswordSuccess('Password updated successfully!');
                  setTimeout(() => setShowPasswordModal(false), 1500);
                }
              }}
              className="p-8 space-y-5"
            >
              {passwordError && <div className="p-3 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg">{passwordError}</div>}
              {passwordSuccess && <div className="p-3 text-xs font-bold text-green-600 bg-green-50 border border-green-100 rounded-lg">{passwordSuccess}</div>}

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#071a4a] transition-colors" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#071a4a]/10 focus:border-[#071a4a] transition-all"
                    placeholder="Min 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#071a4a] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#071a4a] transition-colors" />
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#071a4a]/10 focus:border-[#071a4a] transition-all"
                    placeholder="Repeat password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#071a4a] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-[#071a4a] hover:bg-[#050f2e] text-white py-3 rounded-xl text-sm font-bold shadow-xl shadow-[#071a4a]/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3 ml-auto">

            {/* Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-9 h-9 rounded-full bg-[#071a4a] text-white text-sm font-semibold flex items-center justify-center hover:bg-[#050f2e] transition-colors"
              >
                {initials}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <button 
                    onClick={() => { setDropdownOpen(false); setShowProfileModal(true); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    <User className="w-4 h-4" /> Profile
                  </button>
                  <button 
                    onClick={() => { setDropdownOpen(false); setShowPasswordModal(true); setPasswordError(''); setPasswordSuccess(''); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    <KeyRound className="w-4 h-4" /> Password Setting
                  </button>
                  <form action={logoutUser}>
                    <button type="submit"
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {/* If children provided (sub-pages), show them. Otherwise show Dashboard home */}
          {children ?? (
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-6 font-sans">Dashboard</h1>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                {statCards.map((card) => (
                  <div key={card.label}
                    className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-3 bg-gray-100 rounded-lg">{card.icon}</div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">{card.label}</p>
                      <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-base font-semibold text-gray-700 mb-6 font-sans">Course Distribution by Faculty</h2>
                <div className="flex items-end gap-4 h-48 px-4">
                  {[0.9, 0.4, 0.7, 0.3, 0.85, 0.55, 0.65].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-[#071a4a] rounded-t-sm opacity-75 hover:opacity-100 transition-all"
                        style={{ height: `${h * 100}%` }} />
                      <span className="text-[10px] text-gray-400">{i + 1}</span>
                    </div>
                  ))}
                </div>
                <p className="text-center text-xs text-gray-400 mt-2 font-sans">Courses per Faculty</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
