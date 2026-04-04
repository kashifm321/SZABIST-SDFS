'use client';

import { useState, useEffect } from 'react';
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
  FolderOpen,
  ClipboardList
} from 'lucide-react';
import { DashboardProvider, useDashboard } from './DashboardContext';

type NavItem = {
  label: string;
  icon: any;
  href: string;
  subItems?: { label: string; href: string }[];
};

type UserData = {
  name: string;
  email: string;
};

type DashboardShellProps = {
  user: UserData;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  children?: React.ReactNode;
};

// Helper for ultra-safe icon rendering (prevents 500 error if icon is missing)
const SafeIcon = ({ icon: Icon, className }: { icon: any, className?: string }) => {
  if (!Icon || typeof Icon !== 'function') {
    return <div className={`${className} bg-gray-200/50 rounded-sm flex-shrink-0`} />;
  }
  return <Icon className={className} />;
};

function DashboardShellContent({
  user,
  role,
  children,
}: DashboardShellProps) {
  // Safe use of context
  const dashboardContext = useDashboard();
  const headerExtra = dashboardContext?.headerExtra || null;
  
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Assignments']);

  // Modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ROBUST Initials Extraction: Prevents undefined.toUpperCase() crash
  const safeName = user?.name || 'User';
  const nameParts = safeName.trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || 'User';
  const lastName = nameParts.slice(1).join(' ') || '';

  const initials = nameParts
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => 
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    );
  };

  const getNavItems = (): NavItem[] => {
    switch (role) {
      case 'ADMIN':
        return [
          { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
          { label: 'Manage Faculty', icon: UserCog, href: '/admin/faculty' },
          { label: 'Add Course', icon: BookPlus, href: '/admin/courses/add' },
          { label: 'Classes', icon: BookOpen, href: '/admin/classes' },
          { label: 'Manage Students', icon: GraduationCap, href: '/admin/students' },
        ];
      case 'TEACHER':
        return [
          { label: 'Dashboard', icon: LayoutDashboard, href: '/teacher' },
          { label: 'Course Info', icon: User, href: '/teacher/info' },
          { label: 'Course Outline', icon: BookOpen, href: '/teacher/outline' },
          { label: 'Registered Students', icon: Users, href: '/teacher/students' },
          { label: 'Lecture Progress', icon: BarChart3, href: '/teacher/progress' },
          { label: 'Add Material', icon: BookPlus, href: '/teacher/materials' },
          { 
            label: 'Assignments', 
            icon: FolderOpen, 
            href: '/teacher/assignments',
            subItems: [
              { label: 'Assign Assignments', href: '/teacher/assignments/create' },
              { label: 'View Submissions', href: '/teacher/assignments/submissions' }
            ]
          },
        ];
      case 'STUDENT':
        return [
          { label: 'Dashboard', icon: LayoutDashboard, href: '/student' },
          { label: 'My Courses', icon: BookOpen, href: '/student/courses' },
          { label: 'Digital Folder', icon: FolderOpen, href: '/student/folder' },
          { label: 'Attendance', icon: ClipboardList, href: '/student/attendance' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  const roleLabel = role.charAt(0) + role.slice(1).toLowerCase();

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed z-30 inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}
      >
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

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isExpanded = expandedMenus.includes(item.label);
            const isActive = (item.href === `/${role.toLowerCase()}` ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + '/'));
            const IconComponent = item.icon;

            return (
              <div key={item.label} className="space-y-1">
                <button
                  onClick={() => {
                    if (item.subItems) {
                      toggleMenu(item.label);
                    } else {
                      router.push(item.href);
                      setSidebarOpen(false);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left
                    ${isActive && !item.subItems
                      ? 'bg-[#071a4a] text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                  <SafeIcon icon={IconComponent} className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.subItems && (
                    <SafeIcon icon={Menu} className={`w-3 h-3 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  )}
                </button>

                {item.subItems && isExpanded && (
                  <div className="ml-9 space-y-1">
                    {item.subItems.map((sub) => (
                      <button
                        key={sub.label}
                        onClick={() => { router.push(sub.href); setSidebarOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors
                          ${pathname === sub.href ? 'text-[#071a4a] bg-gray-50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="bg-[#071a4a] p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">User Profile</h3>
                <p className="text-blue-200 text-xs mt-0.5">{roleLabel} Account</p>
              </div>
              <button onClick={() => setShowProfileModal(false)} className="text-white/70 hover:text-white transition-colors">
                <SafeIcon icon={X} className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex flex-col items-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-[#071a4a] text-2xl font-bold border-4 border-[#071a4a]/10 mb-3">
                  {initials}
                </div>
                <span className="inline-block px-3 py-1 bg-[#071a4a]/5 text-[#071a4a] text-[10px] font-black tracking-widest uppercase rounded-full">
                  {roleLabel} Portal
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
                <SafeIcon icon={X} className="w-5 h-5" />
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
                  <SafeIcon icon={Lock} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#071a4a] transition-colors" />
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
                    {showPassword ? <SafeIcon icon={EyeOff} className="w-4 h-4" /> : <SafeIcon icon={Eye} className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Confirm Password</label>
                <div className="relative group">
                  <SafeIcon icon={Lock} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#071a4a] transition-colors" />
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
                    {showConfirmPassword ? <SafeIcon icon={EyeOff} className="w-4 h-4" /> : <SafeIcon icon={Eye} className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-[#071a4a] hover:bg-[#050f2e] text-white py-3 rounded-xl text-sm font-bold shadow-xl shadow-[#071a4a]/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPending ? <><SafeIcon icon={Loader2} className="w-4 h-4 animate-spin" /> Updating...</> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={() => setSidebarOpen(true)}>
              <SafeIcon icon={Menu} className="w-5 h-5" />
            </button>
            <h2 className="hidden sm:block text-sm font-semibold text-gray-500">{roleLabel} Portal</h2>
            {headerExtra}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-9 h-9 rounded-full bg-[#071a4a] text-white text-sm font-semibold flex items-center justify-center hover:bg-[#050f2e] transition-colors"
              >
                {initials}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden animate-in zoom-in-95 duration-100">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                    <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <button 
                    onClick={() => { setDropdownOpen(false); setShowProfileModal(true); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    <SafeIcon icon={User} className="w-4 h-4" /> Profile
                  </button>
                  <button 
                    onClick={() => { setDropdownOpen(false); setShowPasswordModal(true); setPasswordError(''); setPasswordSuccess(''); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    <SafeIcon icon={KeyRound} className="w-4 h-4" /> Password Setting
                  </button>
                  <form action={logoutUser}>
                    <button type="submit"
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100">
                      <SafeIcon icon={LogOut} className="w-4 h-4" /> Logout
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardShell(props: DashboardShellProps) {
  return (
    <DashboardProvider>
      <DashboardShellContent {...props} />
    </DashboardProvider>
  );
}
