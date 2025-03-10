'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

export default function UtilityAuthorizationCard() {
  const router = useRouter();

  // Loader
  const [loading, setLoading] = useState(false);

  // Form fields
  const [utilityProvider, setUtilityProvider] = useState('');
  const [utilityEmail, setUtilityEmail] = useState('');
  const [utilityPassword, setUtilityPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Location details
  const [companyName, setCompanyName] = useState('Sopanel Energy');
  const [address, setAddress] = useState('HSE 3,2nd Avenue, Dummy street, Dummy state.');
  const [zipcode, setZipcode] = useState('12345');
  const [meterId, setMeterId] = useState('000-123-XYZ');

  // Editing states
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingZipcode, setIsEditingZipcode] = useState(false);

  // Radio for location question
  const [isSameLocation, setIsSameLocation] = useState(null); // can be 'yes' or 'no'

  const handleSubmit = () => {
    // Simulate an API call
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/register/residence-user-registration/step-three');
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
      <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center py-8 px-4">
        {/* Back Arrow */}
        <div className="relative w-full mb-10">
          <div className="back-arrow absolute left-12 top-0 text-[#039994] cursor-pointer z-60">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              onClick={() => router.back()}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[#039994] mr-40 mb-6">
          Utility Authorization
        </h1>

        {/* Step Bar */}
        <div className="w-full max-w-md flex items-center justify-between mt-4 mb-4">
          <div className="flex-1 h-1 bg-gray-200 rounded-full mr-4">
            {/* Adjust the width here to indicate current step */}
            <div className="h-1 bg-[#039994] w-3/5 rounded-full" />
          </div>
          <span className="text-sm font-medium text-gray-500">03/05</span>
        </div>

        {/* Content Container */}
        <div className="w-full max-w-md space-y-6">

          {/* Utility Provider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Utility provider
            </label>
            <select
              value={utilityProvider}
              onChange={(e) => setUtilityProvider(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
            >
              <option value="">Choose provider</option>
              <option value="provider1">Provider 1</option>
              <option value="provider2">Provider 2</option>
              <option value="provider3">Provider 3</option>
              <option value="provider4">Provider 4</option>
            </select>
          </div>

          {/* Utility Account Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Utility account username
            </label>
            <input
              type="email"
              placeholder="Email address"
              value={utilityEmail}
              onChange={(e) => setUtilityEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
            />
          </div>

          {/* Utility Account Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Utility account password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={utilityPassword}
                onChange={(e) => setUtilityPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
              >
                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
              </span>
            </div>
          </div>

          {/* Horizontal line */}
          <hr className="border-t border-gray-300" />

          {/* Thin Green Border Card */}
          <div className="border border-[#039994] rounded-md p-4 space-y-3">
            {/* Company Name (Static for now) */}
            <p className="font-semibold text-gray-700">{companyName}</p>

            {/* Address with edit functionality */}
            <div className="flex items-start justify-between">
              {isEditingAddress ? (
                <div className="flex-1 flex flex-col">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mb-2 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994]"
                  />
                  <div className="flex space-x-2">
                    {/* Save button */}
                    <button
                      onClick={() => setIsEditingAddress(false)}
                      className="flex items-center px-2 py-1 bg-green-500 text-white rounded-md text-xs hover:bg-green-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Save
                    </button>

                    {/* Cancel button */}
                    <button
                      onClick={() => setIsEditingAddress(false)}
                      className="flex items-center px-2 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{address}</p>
                </div>
              )}

              {!isEditingAddress && (
                <button
                  onClick={() => setIsEditingAddress(true)}
                  className="ml-2 text-[#039994] text-sm hover:underline"
                >
                  Edit
                </button>
              )}
            </div>

            {/* Zipcode with edit functionality */}
            <div className="flex items-start justify-between">
              {isEditingZipcode ? (
                <div className="flex-1 flex flex-col">
                  <input
                    type="text"
                    value={zipcode}
                    onChange={(e) => setZipcode(e.target.value)}
                    className="mb-2 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994]"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setIsEditingZipcode(false)}
                      className="flex items-center px-2 py-1 bg-green-500 text-white rounded-md text-xs hover:bg-green-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingZipcode(false)}
                      className="flex items-center px-2 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Zipcode: {zipcode}</p>
                </div>
              )}

              {!isEditingZipcode && (
                <button
                  onClick={() => setIsEditingZipcode(true)}
                  className="ml-2 text-[#039994] text-sm hover:underline"
                >
                  Edit
                </button>
              )}
            </div>

            {/* Meter ID (static for now; can add editing logic similarly) */}
            <div>
              <p className="text-sm text-gray-600">Meter ID: {meterId}</p>
            </div>
          </div>

          {/* Is this the same solar installation's location? */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Is this the same solar installation’s location?
            </span>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="sameLocation"
                  value="yes"
                  checked={isSameLocation === 'yes'}
                  onChange={() => setIsSameLocation('yes')}
                  className="form-radio custom-radio"
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="sameLocation"
                  value="no"
                  checked={isSameLocation === 'no'}
                  onChange={() => setIsSameLocation('no')}
                  className="form-radio custom-radio"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={handleSubmit}
            className="w-full rounded-md bg-[#039994] text-white font-semibold py-2 mt-6 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994]"
          >
            Next
          </button>

          {/* Terms and Conditions & Privacy Policy */}
          <div className="mt-6 text-center text-xs text-gray-500 leading-tight">
            By clicking on ‘Next’, you agree to our{' '}
            <a href="/terms" className="text-[#039994] hover:underline font-medium">
              Terms and Conditions
            </a>{' '}
            &{' '}
            <a href="/privacy" className="text-[#039994] hover:underline font-medium">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
