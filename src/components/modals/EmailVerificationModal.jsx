'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function EmailVerificationModal({ closeModal }) {
  const router = useRouter();

  const handleNavigate = () => {
    closeModal();
    router.push('/login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-all">
      <div
        className="rounded-lg w-96 p-6 space-y-4 animate__animated animate__fadeIn"
        style={{
          backgroundColor: 'white',
          fontFamily: 'SF Pro Display, sans-serif',
        }}
      >
        <h2
          className="text-lg font-semibold text-center"
          style={{
            color: '#039994',
            fontFamily: 'SF Pro Display, sans-serif',
          }}
        >
          Email verified
        </h2>
        <p
          className="text-center"
          style={{
            color: '#4B5563', // Tailwind's gray-600
            fontFamily: 'SF Pro Display, sans-serif',
            fontSize: '14px',
            lineHeight: '20px',
          }}
        >
          Your email has been verified. Please continue to create an account with us.
        </p>
        <div className="flex justify-center mt-6">
          <button
            className="w-full sm:w-auto py-3 px-6 rounded-md text-white font-semibold transition duration-300"
            style={{
              backgroundColor: '#039994',
              fontFamily: 'SF Pro Display, sans-serif',
            }}
            onClick={handleNavigate}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#02857f')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#039994')}
          >
            Continue to Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
