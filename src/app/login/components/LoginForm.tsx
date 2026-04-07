'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/app/actions/auth';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginForm({ targetRole }: { targetRole: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (formData: FormData) => {
    setErrorMsg('');
    formData.append('targetRole', targetRole);

    startTransition(async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const result = await loginUser(null, formData);

      if (result?.error) {
        setErrorMsg(result.error);
      } else if (result?.success) {
        sessionStorage.setItem('is_logged_in', 'true');
        if (result.mustChangePassword) {
          router.push('/change-password');
        } else {
          if (result.role === 'ADMIN') router.push('/admin');
          else if (result.role === 'TEACHER') router.push('/teacher');
          else if (result.role === 'STUDENT') router.push('/student');
        }
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-3">
      {errorMsg && (
        <div className="p-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md">
          {errorMsg}
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="email" className="block text-[13px] font-semibold text-gray-700">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full px-4 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#071a4a] focus:border-[#071a4a] transition-all"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="block text-[13px] font-semibold text-gray-700">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="w-full px-4 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#071a4a] focus:border-[#071a4a] transition-all pr-10"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <div className="text-right pt-1">
          <Link href="#" className="text-[12px] text-gray-500 hover:text-[#071a4a] hover:underline transition-colors mt-1 inline-block">
            Forget Password
          </Link>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={`w-full flex justify-center py-2.5 px-4 rounded text-sm font-semibold text-white shadow-sm transition-all duration-300 mt-1 ${
          isPending
            ? 'bg-[#071a4a]/70 cursor-not-allowed'
            : 'bg-[#071a4a] hover:bg-[#050f2e]'
        }`}
      >
        {isPending ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
