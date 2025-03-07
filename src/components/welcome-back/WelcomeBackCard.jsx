'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WelcomeBackCard() {
  const [loading, setLoading] = useState(false);
  const [userCategory, setUserCategory] = useState('Resident'); // default category
  const router = useRouter();

  const handleCategorySelect = (category) => {
    setUserCategory(category);

    // Navigate to the correct registration step based on category
    if (category === 'Resident') {
      router.push('/register/residence-user-registration/step-one');
    } else if (category === 'Commercial') {
      router.push('/register/commercial-user-registration/step-one');
    } else if (category === 'Partner') {
      router.push('/register/partner-user-registration/step-one');
    }
  };

  return (
    <>
      {/* Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="h-12 w-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin"></div>
        </div>
      )}

      {/* Full-Screen Background */}
      <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center py-8 px-4">
        {/* Logo */}
        <div className="mb-6">
          <img
            src="/auth_images/Login_logo.png"
            alt="DCarbon Logo"
            className="h-10 object-contain"
          />
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-[#039994]">
          Continue your registration . . .
        </h1>

        {/* User Category Buttons */}
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
          {/* Resident Button */}
          <button
            type="button"
            onClick={() => handleCategorySelect('Resident')}
            className="px-4 py-2 rounded-md text-sm font-medium bg-transparent text-[#039994] border border-[#039994] hover:bg-[#02857f] hover:text-white transition duration-300 ease-in-out"
          >
            Resident
          </button>

          {/* Commercial Button */}
          <button
            type="button"
            onClick={() => handleCategorySelect('Commercial')}
            className="px-4 py-2 rounded-md text-sm font-medium bg-transparent text-[#039994] border border-[#039994] hover:bg-[#02857f] hover:text-white transition duration-300 ease-in-out"
          >
            Commercial
          </button>

          {/* Partner Button */}
          <button
            type="button"
            onClick={() => handleCategorySelect('Partner')}
            className="px-4 py-2 rounded-md text-sm font-medium bg-transparent text-[#039994] border border-[#039994] hover:bg-[#02857f] hover:text-white transition duration-300 ease-in-out"
          >
            Partner
          </button>
        </div>
      </div>
    </>
  );
}
