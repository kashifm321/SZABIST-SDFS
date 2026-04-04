import { Metadata } from 'next';
import RegisterForm from './components/RegisterForm';
import prisma from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata: Metadata = {
  title: 'Sign Up | SZABIST SDFS',
  description: 'Create your Student Digital Folder System account.',
};

export default async function RegisterPage({ searchParams }: Props) {
  const params = await searchParams;
  const roleRaw = typeof params.role === 'string' ? params.role : 'student';
  const displayRole = roleRaw.charAt(0).toUpperCase() + roleRaw.slice(1);
  const targetRoleEnum = roleRaw.toUpperCase(); // e.g. ADMIN, TEACHER, STUDENT

  // Protection Check: Ensure NO admin exists yet if trying to setup Admin
  let isBlocked = false;
  let blockMessage = '';

  if (targetRoleEnum === 'ADMIN') {
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (adminCount > 0) {
      isBlocked = true;
      blockMessage = 'Security Protocol: The system administrator has already been registered. Please proceed to the login portal.';
    }
  }

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

      <div className="relative z-10 w-full max-w-[420px] bg-white/95 backdrop-blur-md shadow-2xl rounded-xl p-8 sm:p-10 flex flex-col items-center">
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

        <div className="mb-6 text-center w-full">
          <h2 className="text-xl font-bold text-gray-800">{displayRole} Signup</h2>
          <p className="text-sm font-medium text-gray-600">
            {isBlocked ? 'Registration Locked' : 'Create your digital account'}
          </p>
        </div>

        {isBlocked ? (
          <div className="text-center bg-gray-50 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-600 text-[13px] mb-6">
              {blockMessage}
            </p>
            <Link 
              href="/login?role=admin"
              className="inline-block bg-[#071a4a] hover:bg-[#050f2e] text-white font-semibold py-2.5 px-6 rounded text-sm transition-colors"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <RegisterForm targetRole={targetRoleEnum} />
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center text-[13px]">
          <span className="text-gray-500 mb-2 sm:mb-0">Already have an account?</span>
          <Link 
            href={`/login?role=${roleRaw}`}
            className="text-gray-700 hover:text-black font-semibold transition-colors"
          >
            Login as {displayRole} &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
