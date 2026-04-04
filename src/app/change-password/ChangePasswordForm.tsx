'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { changePassword } from '@/app/actions/auth';
import { Lock, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function ChangePasswordForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (formData: FormData) => {
    setErrorMsg('');
    startTransition(async () => {
      const result = await changePassword(null, formData);
      if (result?.error) {
        setErrorMsg(result.error);
      } else if (result?.success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push('/'); // Redirect to logout or home to refetch session
        }, 1500);
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <div className="flex justify-center mb-4 text-green-500">
          <CheckCircle2 className="w-16 h-16" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Password Updated!</h2>
        <p className="text-gray-600">Your password has been successfully changed. Redirecting to login...</p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {errorMsg && (
        <div className="p-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md">
          {errorMsg}
        </div>
      )}

      <div>
        <label className="block text-[13px] font-semibold text-gray-700 mb-1">New Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#071a4a] focus:border-[#071a4a]"
            placeholder="Min. 6 characters"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-[13px] font-semibold text-gray-700 mb-1">Confirm New Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#071a4a] focus:border-[#071a4a]"
            placeholder="Repeat password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={`w-full flex justify-center py-3 px-4 rounded text-sm font-bold text-white shadow-sm transition-all duration-300
          ${isPending ? 'bg-[#071a4a]/70 cursor-not-allowed' : 'bg-[#071a4a] hover:bg-[#050f2e]'}`}
      >
        {isPending ? (
          <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Updating...</>
        ) : (
          'Update Password'
        )}
      </button>
    </form>
  );
}
