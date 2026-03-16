'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#039994] to-[#056C69] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12 md:py-6">
        <div className="flex items-center space-x-3">
          <img
            src="/auth_images/Login_logo.png"
            alt="DCarbon Logo"
            className="h-8 md:h-10 object-contain"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
        <button
          onClick={() => router.push('/login')}
          className="text-white border border-white/30 px-5 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
        >
          Sign in
        </button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight">
          DCARBON
        </h1>
        <p className="text-lg md:text-xl text-white/80 mb-2 font-medium tracking-widest uppercase">
          Sustainable Innovation
        </p>
        <p className="text-sm md:text-base text-white/60 max-w-lg mb-10 leading-relaxed">
          Empowering renewable energy certificate management for a cleaner future.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => router.push('/register')}
            className="bg-white text-[#039994] px-8 py-3 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors shadow-lg min-w-[180px]"
          >
            Get Started
          </button>
          <button
            onClick={() => router.push('/login')}
            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-sm hover:bg-white/10 transition-colors min-w-[180px]"
          >
            Sign in
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 md:px-12 text-center">
        <p className="text-white/40 text-xs">
          &copy; {new Date().getFullYear()} DCarbon Solutions Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
