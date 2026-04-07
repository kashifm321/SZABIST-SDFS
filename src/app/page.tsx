import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden font-sans">
      {/* Background Image - Fixed to viewport to guarantee visibility */}
      <div className="fixed inset-0 z-[-1]">
        <Image
          src="/bg_image.jpg"
          alt="Campus Background"
          fill
          className="object-cover"
          priority
        />
        {/* Subtle Gradient Overlay to ensure readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 w-full bg-[#071a4a] text-white py-4 px-8 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-3">
          <Image
            src="/images/szabist-logo.png"
            alt="SZABIST Logo"
            width={32}
            height={32}
            className="object-contain"
          />
          <span className="text-2xl font-black tracking-tighter">SZABIST</span>
        </div>
        <div className="hidden sm:block text-xs font-semibold tracking-widest opacity-80 uppercase">Student Digital Folder System</div>
      </header>

      {/* Main Center Area */}
      <main className="relative z-10 flex-grow flex items-center justify-center p-4">
        {/* White Card Overlay - Size Adjusted */}
        <div className="bg-white/85 backdrop-blur-sm shadow-2xl rounded-lg px-6 py-12 w-full max-w-3xl text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#071a4a] mb-3">
            SZABIST Student Digital Folder System
          </h1>
          <p className="text-gray-600 mb-8 text-lg">
            Continue to Login
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              href="/login?role=admin"
              className="bg-[#071a4a] hover:bg-[#050f2e] text-white px-6 py-3 rounded-md text-sm sm:text-base font-medium transition-colors shadow-md w-full sm:w-auto text-center"
            >
              Login As Admin &rarr;
            </Link>
            <Link 
              href="/login?role=teacher"
              className="bg-[#071a4a] hover:bg-[#050f2e] text-white px-6 py-3 rounded-md text-sm sm:text-base font-medium transition-colors shadow-md w-full sm:w-auto text-center"
            >
              Login As Faculty &rarr;
            </Link>
            <Link 
              href="/login?role=student"
              className="bg-[#071a4a] hover:bg-[#050f2e] text-white px-6 py-3 rounded-md text-sm sm:text-base font-medium transition-colors shadow-md w-full sm:w-auto text-center"
            >
              Login As Student &rarr;
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
