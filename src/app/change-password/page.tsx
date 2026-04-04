import { Metadata } from 'next';
import ChangePasswordForm from './ChangePasswordForm';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Update Password | SZABIST SDFS',
  description: 'First-time login password change requirement.',
};

export default function ChangePasswordPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-slate-100">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/bg_image.jpg"
          alt="Campus Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="relative z-10 w-full max-w-[420px] bg-white/95 backdrop-blur-md shadow-2xl rounded-xl p-8 sm:p-10 flex flex-col items-center text-center">
        {/* Brand Logo & Name */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <Image
            src="/images/szabist-logo.png"
            alt="SZABIST Logo"
            width={64}
            height={64}
            className="object-contain"
          />
          <h1 className="text-3xl font-black text-[#071a4a] tracking-tight">SZABIST</h1>
        </div>

        <div className="mb-6 w-full">
          <h2 className="text-xl font-bold text-gray-800">Update Password</h2>
          <p className="text-sm font-medium text-gray-600 mt-2">
            For security reasons, you must change your temporary password before accessing the system.
          </p>
        </div>

        <ChangePasswordForm />

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400">
            Once updated, you will be redirected to the login portal.
          </p>
        </div>
      </div>
    </div>
  );
}
