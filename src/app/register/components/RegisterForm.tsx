'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { registerUser } from '@/app/actions/auth';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function RegisterForm({ targetRole }: { targetRole: string }) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (formData: FormData) => {
    setErrorMsg('');
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    formData.append('targetRole', targetRole);
    
    startTransition(async () => {
      // Simulate slight delay for professional feel
      await new Promise(resolve => setTimeout(resolve, 600));
      const result = await registerUser(null, formData);

      if (result?.error) {
        setErrorMsg(result.error);
      } else if (result?.success) {
        setIsRegistered(true);
      }
    });
  };

  if (isRegistered) {
    return (
      <div className="text-center py-8 space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-center">
          <div className="p-4 bg-green-50 rounded-full">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Account Created!</h3>
          <p className="text-gray-500 mt-2 font-medium">Your registration was successful. <br /> You can now sign in to your dashboard.</p>
        </div>
        <div className="pt-4">
          <Link 
            href={`/login?role=${targetRole.toLowerCase()}`}
            className="inline-flex items-center justify-center w-full py-3.5 px-6 rounded-xl bg-[#071a4a] text-white font-bold shadow-xl shadow-[#071a4a]/20 hover:bg-[#050f2e] transition-all active:scale-[0.98]"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {errorMsg && (
        <div className="p-3 text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg animate-in shake duration-300">
          {errorMsg}
        </div>
      )}

      {/* Split Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="firstName" className="block text-[13px] font-semibold text-gray-700">
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            placeholder="John"
            className="w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#071a4a] focus:border-[#071a4a] transition-all"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="lastName" className="block text-[13px] font-semibold text-gray-700">
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            placeholder="Doe"
            className="w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#071a4a] focus:border-[#071a4a] transition-all"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="block text-[13px] font-semibold text-gray-700">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="email@szabist-isb.edu.pk"
          className="w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#071a4a] focus:border-[#071a4a] transition-all"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="block text-[13px] font-semibold text-gray-700">
          New Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            className="w-full px-4 pr-10 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#071a4a] focus:border-[#071a4a] transition-all"
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

      <div className="space-y-1">
        <label htmlFor="confirmPassword" className="block text-[13px] font-semibold text-gray-700">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            className="w-full px-4 pr-10 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#071a4a] focus:border-[#071a4a] transition-all"
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

      <button
        type="submit"
        disabled={isPending}
        className={`w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white shadow-xl shadow-[#071a4a]/10 transition-all duration-300 mt-2 ${
          isPending
            ? 'bg-[#071a4a]/70 cursor-not-allowed'
            : 'bg-[#071a4a] hover:bg-[#050f2e] active:scale-[0.98]'
        }`}
      >
        {isPending ? 'Processing Registration...' : 'Create Account'}
      </button>
    </form>
  );
}
