import React from 'react';

export default function EmailModal({ closeModal }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-96 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-center text-[#039994]">Confirm Your Email</h2>
        <p className="text-center text-gray-600">
          A confirmation email has been sent to your email address. Please verify it to complete your registration.
        </p>
        <div className="flex justify-center space-x-4 mt-6">
          <button
            className="w-32 py-2 rounded-md bg-[#039994] text-white font-semibold hover:bg-[#02857f]"
            onClick={closeModal}
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
}
