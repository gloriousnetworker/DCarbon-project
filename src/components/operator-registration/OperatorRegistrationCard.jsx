'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StepOneCard() {
  const [loading, setLoading] = useState(false);
  const [financeType, setFinanceType] = useState('');
  const [financeCompany, setFinanceCompany] = useState('');
  const [installer, setInstaller] = useState('');
  const [file, setFile] = useState(null);
  const router = useRouter();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = () => {
    // Simulate file upload and proceed to the next step
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/register/commercial-operator-registration/step-one');
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[#039994] mr-40 mb-6">
          Operator's Registration
        </h1>

        {/* Step Bar */}
        <div className="w-full max-w-md flex items-center justify-between mt-4 mb-4">
          <div className="flex-1 h-1 bg-gray-200 rounded-full mr-4">
            <div className="h-1 bg-[#039994] w-2/5 rounded-full" />
          </div>
          <span className="text-sm font-medium text-gray-500">01/05</span>
        </div>

        {/* Dropdowns & File Upload */}
        <div className="w-full max-w-md space-y-6">
          {/* Finance Type Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Commercial Role</label>
            <select
              value={financeType}
              onChange={(e) => setFinanceType(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
            >
              <option value="">Choose role</option>
              <option value="cash">Owner</option>
              <option value="loan">Operator</option>
              <option value="ppa">Both</option>
            </select>
          </div>

          {/* Finance Company Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Entity Type</label>
            <select
              value={financeCompany}
              onChange={(e) => setFinanceCompany(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
            >
              <option value="">Choose Type</option>
              <option value="company1">Individual</option>
              <option value="company2">Company</option>
            </select>
          </div>


        </div>

        {/* Next Button */}
        <button
          onClick={handleSubmit}
          className="w-full rounded-md bg-[#039994] text-white font-semibold py-2 mt-6 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994]"
        >
          Next
        </button>

        {/* Terms and Conditions & Privacy Policy Links */}
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
    </>
  );
}
