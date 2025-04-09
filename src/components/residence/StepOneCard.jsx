'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StepOneCard() {
  const [loading, setLoading] = useState(false);
  const [financeType, setFinanceType] = useState('');
  const [financeCompany, setFinanceCompany] = useState('');
  const [installer, setInstaller] = useState('');
  const [customInstaller, setCustomInstaller] = useState('');
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const router = useRouter();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadStatus('idle');
  };

  const handleUpload = () => {
    if (!file) return;
    setUploadStatus('uploading');
    setTimeout(() => {
      setUploadStatus('success');
    }, 1500);
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/register/residence-user-registration/step-two');
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
        <div className="w-full max-w-md flex items-center justify-between mt-4 mb-4">
          <div className="flex-1 h-1 bg-gray-200 rounded-full mr-4">
            <div className="h-1 bg-[#039994] w-2/5 rounded-full" />
          </div>
          <span className="text-sm font-medium text-gray-500">02/05</span>
        </div>

        {/* Dropdowns & File Upload */}
        <div className="w-full max-w-md space-y-6">
          {/* Finance Type Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Finance Type?</label>
            <select
              value={financeType}
              onChange={(e) => setFinanceType(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
            >
              <option value="">Select Finance Type</option>
              <option value="cash">Cash</option>
              <option value="loan">Loan</option>
              <option value="ppa">PPA</option>
              <option value="lease">Lease</option>
            </select>
          </div>

          {/* Finance Company Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Finance Company?</label>
            <select
              value={financeCompany}
              onChange={(e) => setFinanceCompany(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
            >
              <option value="">Select Finance Company</option>
              <option value="company1">Company 1</option>
              <option value="company2">Company 2</option>
              <option value="company3">Company 3</option>
              <option value="others">Others</option>
              <option value="n/a">N/A</option>
            </select>
          </div>

          {/* Upload Finance Agreement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Finance Agreement (Optional)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="fileInput"
                />
                <label
                  htmlFor="fileInput"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994] flex items-center justify-between cursor-pointer"
                >
                  <span className="text-gray-400">
                    {file ? file.name : 'Choose file...'}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                </label>
              </div>
              <button
                onClick={handleUpload}
                disabled={!file || uploadStatus === 'uploading' || uploadStatus === 'success'}
                className="px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] disabled:opacity-50 disabled:cursor-not-allowed w-24 flex items-center justify-center"
              >
                {uploadStatus === 'uploading' ? (
                  <div className="h-5 w-5 border-2 border-t-2 border-white rounded-full animate-spin" />
                ) : uploadStatus === 'success' ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
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
                ) : (
                  'Upload'
                )}
              </button>
            </div>
            <p className="mt-2 text-sm italic text-gray-500">
              Note: You will need to upload Finance Agreement to approve any transactions.
            </p>
          </div>

          {/* Select Installer Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Installer?</label>
            <select
              value={installer}
              onChange={(e) => setInstaller(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
            >
              <option value="">Select Installer</option>
              <option value="installer1">Installer 1</option>
              <option value="installer2">Installer 2</option>
              <option value="installer3">Installer 3</option>
              <option value="others">Others</option>
            </select>
            {installer === 'others' && (
              <input
                type="text"
                value={customInstaller}
                onChange={(e) => setCustomInstaller(e.target.value)}
                placeholder="Enter installer name"
                className="w-full rounded-md border border-gray-300 px-3 py-2 mt-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
              />
            )}
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={handleSubmit}
          className="w-full max-w-md rounded-md bg-[#039994] text-white font-semibold py-2 mt-6 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994]"
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