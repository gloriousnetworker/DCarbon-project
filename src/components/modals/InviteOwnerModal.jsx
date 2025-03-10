import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EmailVerificationModal({ closeModal }) {
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSubmit = () => {
    // Handle form submission logic here
    closeModal(); // Close the modal when the button is clicked
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-4xl sm:w-96 md:w-1/2 lg:w-1/3 xl:w-1/4 p-6 space-y-6">
        <h2 className="text-xl font-semibold text-center text-[#039994]">Invite Owner</h2>
        
        {/* Owner Name Input */}
        <div>
          <label htmlFor="ownerName" className="block text-gray-700">Owner's Name</label>
          <input
            type="text"
            id="ownerName"
            name="ownerName"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="Full name"
            className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994] focus:border-[#039994] transition"
          />
        </div>

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-gray-700">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E.g. name@domain.com"
            className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994] focus:border-[#039994] transition"
          />
        </div>

        {/* Horizontal Line */}
        <hr className="my-4 border-t-2 border-gray-200" />

        {/* Send Invitation Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            className="w-full py-3 px-6 rounded-md bg-[#039994] text-white font-semibold hover:bg-[#02857f] transition duration-300"
          >
            Send Email Invitation
          </button>
        </div>
      </div>
    </div>
  );
}
