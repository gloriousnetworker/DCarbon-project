'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CommercialRegistrationCard() {
  const [loading, setLoading] = useState(false);
  const [userCategory, setUserCategory] = useState('Owner'); // default category
  const router = useRouter();

  const handleCategorySelect = (category) => {
    setUserCategory(category);

    // Navigate to the correct registration step based on category
    if (category === 'Owner') {
      router.push('/register/owner-registration');
    } else if (category === 'Operator') {
      router.push('/register/operator-registration');
    } else if (category === 'Both') {
      router.push('/register/both-registration');
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
      <div className="min-h-screen w-full bg-[#f4f7fb] flex flex-col items-center justify-center py-8 px-4">
        
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <img
            src="/auth_images/Login_logo.png"
            alt="DCarbon Logo"
            className="h-12 object-contain"
          />
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-semibold text-center text-[#039994] mb-4">
          Select Your Commercial Registration Type
        </h1>

        {/* Description */}
        <p className="text-center text-gray-600 mb-6">
          Choose the category that best describes your role in the commercial registration process.
        </p>

        {/* User Category Buttons */}
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 justify-center">
          
          {/* Owner Button */}
          <button
            type="button"
            onClick={() => handleCategorySelect('Owner')}
            className="w-full sm:w-auto px-6 py-3 rounded-md text-sm font-semibold bg-transparent text-[#039994] border-2 border-[#039994] hover:bg-[#02857f] hover:text-white transition duration-300 ease-in-out"
          >
            Owner
          </button>

          {/* Operator Button */}
          <button
            type="button"
            onClick={() => handleCategorySelect('Operator')}
            className="w-full sm:w-auto px-6 py-3 rounded-md text-sm font-semibold bg-transparent text-[#039994] border-2 border-[#039994] hover:bg-[#02857f] hover:text-white transition duration-300 ease-in-out"
          >
            Operator
          </button>

          {/* Both Button */}
          <button
            type="button"
            onClick={() => handleCategorySelect('Both')}
            className="w-full sm:w-auto px-6 py-3 rounded-md text-sm font-semibold bg-transparent text-[#039994] border-2 border-[#039994] hover:bg-[#02857f] hover:text-white transition duration-300 ease-in-out"
          >
            Both Owner & Operator
          </button>
          
        </div>
      </div>
    </>
  );
}
