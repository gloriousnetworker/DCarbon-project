import React from 'react';
import { useRouter } from 'next/navigation';

export default function EmailVerificationModal({ closeModal }) {
  const router = useRouter();

  const handleNavigate = () => {
    closeModal();
    router.push('/dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-96 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-center text-[#039994]">Registration Successful</h2>
        <p className="text-center text-gray-600">
          YWelcome to DCarbon, 
        </p>
        <div className="flex justify-center mt-6">
          <button
            className="w-full sm:w-auto py-3 px-6 rounded-md bg-[#039994] text-white font-semibold hover:bg-[#02857f] transition duration-300"
            onClick={handleNavigate}
          >
            Continue to Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
