import React from 'react';
import { useRouter } from 'next/navigation';

export default function EmailModal({ closeModal }) {
  const router = useRouter();

  const handleNavigate = () => {
    closeModal();
    router.push('/register/email-verification');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-96 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-center text-[#039994]">Email verified</h2>
        <p className="text-center text-gray-600">
         Your email has been verified
        </p>
        <div className="flex justify-center space-x-4 mt-6">
          <button
            className="w-32 py-2 rounded-md bg-[#039994] text-white font-semibold hover:bg-[#02857f]"
            onClick={handleNavigate}
          >
            Continue to Create account
          </button>
        </div>
      </div>
    </div>
  );
}
