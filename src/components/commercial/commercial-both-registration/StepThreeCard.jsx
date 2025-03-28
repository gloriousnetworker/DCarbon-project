'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OwnersDetailsCard() {
  const router = useRouter();

  // Loader
  const [loading, setLoading] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('+234');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Navigate to the next step
      router.push('/register/commercial-both-registration/step-four');
    }, 1500);
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
      <div className="min-h-screen w-full bg-white flex flex-col items-center py-8 px-4">
        {/* Back Arrow */}
        <div className="relative w-full mb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="absolute left-0 text-[#039994] p-2 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Heading */}
        <div className="w-full max-w-md">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#039994] mb-2">
            Owner’s Details
          </h1>
        </div>

        {/* Step Bar */}
        <div className="w-full max-w-md flex items-center justify-between mb-6">
          <div className="flex-1 h-1 bg-gray-200 rounded-full mr-4">
            {/* Full progress bar since it's 03/03 */}
            <div className="h-1 bg-[#039994] w-full rounded-full" />
          </div>
          <span className="text-sm font-medium text-gray-500">03/03</span>
        </div>

        {/* Subheading */}
        <div className="w-full max-w-md mb-4">
          <h2 className="text-md font-semibold text-[#039994]">
            Individual owner
          </h2>
        </div>

        {/* Form Fields */}
        <div className="w-full max-w-md space-y-4">

          {/* Owner's full name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner’s full name
            </label>
            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-[#039994]"
            />
          </div>

          {/* Phone Number (split into prefix + number) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={phonePrefix}
                onChange={(e) => setPhonePrefix(e.target.value)}
                className="w-16 rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-[#039994]"
              />
              <input
                type="text"
                placeholder="e.g. 000-0000-000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-[#039994]"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              placeholder="E.g. Street, City, County, State."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-[#039994]"
            />
          </div>

          {/* Website details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website details
            </label>
            <input
              type="text"
              placeholder="http://"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-[#039994]"
            />
          </div>
        </div>

        {/* Next Button */}
        <div className="w-full max-w-md mt-6">
          <button
            onClick={handleSubmit}
            className="w-full rounded-md bg-[#039994] text-white font-semibold py-2
                       hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994]"
          >
            Next
          </button>
        </div>

        {/* Terms and Conditions & Privacy Policy Links */}
        <div className="mt-6 text-center text-xs text-gray-500 leading-tight">
          Terms and Conditions &amp;{' '}
          <a href="/privacy" className="text-[#039994] hover:underline font-medium">
            Privacy Policy
          </a>
        </div>
      </div>
    </>
  );
}




// 