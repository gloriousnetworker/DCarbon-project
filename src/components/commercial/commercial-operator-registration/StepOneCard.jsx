'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// For show/hide password icon, you can use any icon library you prefer.
// Below is a simple inline SVG approach:
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function UtilityAuthorizationCard() {
  const router = useRouter();

  // Loader
  const [loading, setLoading] = useState(false);

  // Form fields
  const [utilityProvider, setUtilityProvider] = useState('');
  const [utilityEmail, setUtilityEmail] = useState('');
  const [utilityPassword, setUtilityPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Location details (hard-coded for now)
  const [companyName] = useState('Sopanel Energy');
  const [address] = useState('HSE 3, 2nd Avenue, Dummy street, Dummy state.');
  const [zipcode] = useState('Zipcode');
  const [meterId] = useState('Meter ID');

  // Radio for location question
  const [isSameLocation, setIsSameLocation] = useState(null); // 'yes' or 'no'

  const handleSubmit = () => {
    // Simulate an API call
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/register/commercial-operator-registration/agreement');
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        {/* Heading */}
        <div className="w-full max-w-md">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#039994] mb-2">
            Utility Authorization
          </h1>
        </div>

        {/* Step Bar */}
        <div className="w-full max-w-md flex items-center justify-between mb-6">
          <div className="flex-1 h-1 bg-gray-200 rounded-full mr-4">
            {/* Full progress bar (03/03) */}
            <div className="h-1 bg-[#039994] w-full rounded-full" />
          </div>
          <span className="text-sm font-medium text-gray-500">03/03</span>
        </div>

        {/* Form Fields */}
        <div className="w-full max-w-md space-y-4">
          {/* Utility Provider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Utility provider
            </label>
            <select
              value={utilityProvider}
              onChange={(e) => setUtilityProvider(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
            >
              <option value="">Choose provider</option>
              <option value="Provider 1">Provider 1</option>
              <option value="Provider 2">Provider 2</option>
              <option value="Provider 3">Provider 3</option>
              <option value="Provider 4">Provider 4</option>
            </select>
          </div>

          {/* Utility account username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Utility account username
            </label>
            <input
              type="email"
              placeholder="Email address"
              value={utilityEmail}
              onChange={(e) => setUtilityEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
            />
          </div>

          {/* Utility account password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Utility account password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={utilityPassword}
                onChange={(e) => setUtilityPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                           placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {/* Thin Card with Company / Address / Zipcode / Meter ID */}
          <div className="border border-[#039994] rounded-md p-4 space-y-2">
            <p className="text-gray-700 font-semibold">{companyName}</p>
            <p className="text-sm text-gray-600">{address}</p>
            <p className="text-sm text-gray-600">{zipcode}</p>
            <p className="text-sm text-gray-600">{meterId}</p>
          </div>

          {/* Is this the solar installation's location? */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Is this the solar installation’s location?
            </span>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="sameLocation"
                  value="yes"
                  checked={isSameLocation === 'yes'}
                  onChange={() => setIsSameLocation('yes')}
                  className="form-radio text-[#039994]"
                />
                <span className="text-sm">Yes</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="sameLocation"
                  value="no"
                  checked={isSameLocation === 'no'}
                  onChange={() => setIsSameLocation('no')}
                  className="form-radio text-[#039994]"
                />
                <span className="text-sm">No</span>
              </label>
            </div>
          </div>

          {/* Next Button */}
          <div className="w-full max-w-md">
            <button
              onClick={handleSubmit}
              className="w-full rounded-md bg-[#039994] text-white font-semibold py-2 mt-2
                         hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994]"
            >
              Next
            </button>
          </div>

          {/* Terms and Conditions & Privacy Policy */}
          <div className="mt-4 text-center text-xs text-gray-500 leading-tight">
            Terms and Conditions &amp;{' '}
            <a href="/privacy" className="text-[#039994] hover:underline font-medium">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
