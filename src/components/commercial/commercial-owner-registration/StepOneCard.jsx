'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StepOneCard() {
  const [loading, setLoading] = useState(false);
  const [financeType, setFinanceType] = useState('');
  const [financeCompany, setFinanceCompany] = useState('');
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
      router.push('/register/commercial-owner-registration/step-two');
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
          Finance information
        </h1>

        {/* Step Bar */}
        <div className="w-full max-w-md flex items-center justify-between mb-6">
          <div className="flex-1 h-1 bg-gray-200 rounded-full mr-4">
            {/* Adjust width here to reflect how much of the step is complete */}
            <div className="h-1 bg-[#039994] w-2/3 rounded-full" />
          </div>
          <span className="text-sm font-medium text-gray-500">02/03</span>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-md space-y-6">
          {/* Finance Type Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              Finance type
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.228 9a3.77 3.77 0 017.544 0c0 1.668-1.172 2.5-2.178 3.057-.97.53-1.533 1.023-1.533 1.943M12 17h.01"
                />
              </svg>
            </label>
            <select
              value={financeType}
              onChange={(e) => setFinanceType(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
            >
              <option value="">Choose type</option>
              <option value="cash">Cash</option>
              <option value="loan">Loan</option>
              <option value="ppa">PPA</option>
              <option value="lease">Lease</option>
            </select>
          </div>

          {/* Finance Company Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              Finance company
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.228 9a3.77 3.77 0 017.544 0c0 1.668-1.172 2.5-2.178 3.057-.97.53-1.533 1.023-1.533 1.943M12 17h.01"
                />
              </svg>
            </label>
            <select
              value={financeCompany}
              onChange={(e) => setFinanceCompany(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
            >
              <option value="">Choose company</option>
              <option value="company1">Company 1</option>
              <option value="company2">Company 2</option>
              <option value="company3">Company 3</option>
              <option value="others">Others</option>
              <option value="n/a">N/A</option>
            </select>
          </div>

          {/* Upload Finance Agreement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              Upload Finance Agreement (Optional)
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.228 9a3.77 3.77 0 017.544 0c0 1.668-1.172 2.5-2.178 3.057-.97.53-1.533 1.023-1.533 1.943M12 17h.01"
                />
              </svg>
            </label>

            {/* "Choose file..." + pencil icon + Upload button */}
            <div className="flex items-center space-x-3">
              <label className="relative flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-[#039994] cursor-pointer">
                {file ? file.name : 'Choose file...'}
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                {/* Pencil / edit icon on the right */}
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.232 5.232l3.536 3.536m-2.036-6.036a2.5 2.5 0 113.536 3.536L7.5 19.5l-4 1 1-4 11.232-11.232z"
                    />
                  </svg>
                </span>
              </label>
              <button
                type="button"
                className="px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994]"
              >
                Upload
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Note: You will need to upload Finance Agreement to approve any transactions
            </p>
          </div>
        </div>

        {/* Next Button */}
        <div className="w-full max-w-md mt-6">
          <button
            onClick={handleSubmit}
            className="w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994]"
          >
            Next
          </button>
        </div>

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
