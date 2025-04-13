'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '@/components/loader/Loader';

export default function WelcomeBackCard() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCommercialRegistration = () => {
    setLoading(true);
    
    // Add a delay before navigation
    setTimeout(() => {
      router.push('/register/commercial-user-registration');
    }, 1000); // 1 second delay
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white">
      {/* Loader Overlay - fixed positioned to cover entire viewport */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80">
          <Loader />
        </div>
      )}

      {/* Content */}
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <img
            src="/auth_images/Login_logo.png"
            alt="DCarbon Logo"
            className="h-10 object-contain"
          />
        </div>

        {/* Heading */}
        <div className="relative w-full flex flex-col items-center mb-2">
          <h1 className="mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center">
            Welcome to DCarbon
          </h1>
        </div>

        {/* Information Text */}
        <div className="w-full text-center mb-8">
          <p className="font-sfpro text-[16px] leading-[140%] tracking-[-0.05em] text-[#1E1E1E] mb-4">
            Thank you for joining DCarbon! Now that you've completed your user registration, 
            it's time to register your solar system.
          </p>
          
          <p className="font-sfpro text-[14px] leading-[140%] tracking-[-0.05em] text-[#626060] mb-6">
            As a <span className="font-semibold">commercial user</span>, you'll be able to register 
            your commercial solar systems and start tracking your carbon offset contributions.
          </p>
          
          <p className="font-sfpro text-[14px] leading-[140%] tracking-[-0.05em] text-[#1E1E1E] font-medium">
            Click the button below to begin your commercial system registration:
          </p>
        </div>

        {/* User Category Button */}
        <div className="w-full flex justify-center">
          <button
            type="button"
            onClick={handleCommercialRegistration}
            className="w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro"
          >
            Register Commercial System
          </button>
        </div>
      </div>
    </div>
  );
}