import { Metadata } from 'next';
import LoginForm from './components/LoginForm';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata: Metadata = {
  title: 'Sign In | SZABIST SDFS',
  description: 'Log in to your Student Digital Folder System account.',
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  
  if (!params.role) {
    redirect('/');
  }

  const roleRaw = typeof params.role === 'string' ? params.role : 'admin';
  const displayRole = roleRaw.charAt(0).toUpperCase() + roleRaw.slice(1);
  const targetRoleEnum = roleRaw.toUpperCase(); // e.g. ADMIN, TEACHER, STUDENT

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-gray-100 font-sans">
      {/* Background Image - Clear & Full Visibility */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/bg_image.jpg"
          alt="Campus Background"
          fill
          className="object-cover"
          priority
        />
        {/* Subtle Gradient Overlay to ensure readability while keeping image clear */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Login Card - Compact & Professional Size */}
      <div className="relative z-10 w-full max-w-[420px] bg-white shadow-2xl rounded-xl p-6 sm:p-8">
        {/* Brand Logo & Name */}
        <div className="mb-4 flex flex-col items-center gap-1">
          <Image
            src="/images/szabist-logo.png"
            alt="SZABIST Logo"
            width={52}
            height={52}
            className="object-contain mb-1"
          />
          <div className="text-center">
            <h1 className="text-2xl font-black text-[#071a4a] tracking-tight uppercase">SZABIST</h1>
            <p className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">Interactive Digital Portal</p>
          </div>
        </div>

        <div className="mb-4 text-center w-full">
          <h2 className="text-lg font-bold text-gray-800 leading-tight">{displayRole} Login</h2>
          <p className="text-[13px] font-medium text-gray-500">Authorized Access Only</p>
        </div>

        <LoginForm targetRole={targetRoleEnum} />

        {/* Show sign up link ONLY for Admin */}
        {targetRoleEnum === 'ADMIN' && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-[12px]">
            <span className="text-gray-500 mb-0.5 sm:mb-0 italic italic">New here?</span>
            <Link 
              href={`/register?role=${roleRaw}`}
              className="text-[#071a4a] hover:underline font-bold transition-all"
            >
              Sign Up &rarr;
            </Link>
          </div>
        )}
        
        <div className="mt-4 text-center text-[10px] font-bold text-gray-400 tracking-widest uppercase">
           © 2026 — SZABIST Digital
        </div>
      </div>
    </div>
  );
}
