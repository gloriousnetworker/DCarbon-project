'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StepOneCard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Toggles to show/hide edit cards
  const [showFinanceEdit, setShowFinanceEdit] = useState(false);
  const [showUtilityEdit, setShowUtilityEdit] = useState(false);

  // Finance fields
  const [financeType, setFinanceType] = useState('cash');
  const [financeCompany, setFinanceCompany] = useState('n/a');
  const [installer, setInstaller] = useState('installer1');
  const [financeAgreement, setFinanceAgreement] = useState('Doc.1.jpg');
  const [file, setFile] = useState(null);

  // Utility fields
  const [utilityProvider, setUtilityProvider] = useState('Provider 1');
  const [utilityDetails, setUtilityDetails] = useState(
    'Sopanel Energy\nHSE 3, 2nd Avenue, Dummy street, Dummy state.\nZipcode'
  );

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    if (e.target.files[0]) {
      setFinanceAgreement(e.target.files[0].name);
    }
  };

  const handleSubmit = () => {
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
      <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center py-8 px-4">
        {/* Back Arrow */}
        <div className="relative w-full mb-6">
          <div
            className="back-arrow absolute left-12 top-0 text-[#039994] cursor-pointer z-60"
            onClick={() => router.back()}
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
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[#039994] mr-40 mb-6">
          Account Summary
        </h1>

        {/* Step Bar */}
        <div className="w-full max-w-md flex items-center justify-between mt-2 mb-6">
          <div className="flex-1 h-1 bg-gray-200 rounded-full mr-4">
            <div className="h-1 bg-[#039994] w-4/5 rounded-full" />
          </div>
          <span className="text-sm font-medium text-gray-500">04/05</span>
        </div>

        {/* Main Content Container */}
        <div className="w-full max-w-md space-y-6">
          {/* FINANCE INFORMATION SECTION */}
          <div className="border border-gray-200 rounded-md p-4 shadow-sm bg-[#F5F5F5]">
            {/* Section Header with Edit button */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#039994] font-normal">Finance Information</h2>
              <button
                onClick={() => setShowFinanceEdit(!showFinanceEdit)}
                className="text-[#039994] text-sm font-medium hover:underline"
              >
                Edit
              </button>
            </div>

            {/* Read-Only Finance Info (shown when NOT editing) */}
            {!showFinanceEdit && (
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="font-medium">Finance Type:</span>
                  <span className="ml-2 capitalize">{financeType || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Finance Company:</span>
                  <span className="ml-2 uppercase">{financeCompany || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Finance Agreement:</span>
                  <span className="ml-2">{financeAgreement || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Installer:</span>
                  <span className="ml-2 capitalize">{installer || 'N/A'}</span>
                </div>
              </div>
            )}

            {/* Editable Finance Card (shown when editing) */}
            {showFinanceEdit && (
              <div className="space-y-4">
                {/* Finance Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Finance Type
                  </label>
                  <select
                    value={financeType}
                    onChange={(e) => setFinanceType(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994]"
                  >
                    <option value="">Select Finance Type</option>
                    <option value="cash">Cash</option>
                    <option value="loan">Loan</option>
                    <option value="ppa">PPA</option>
                    <option value="lease">Lease</option>
                  </select>
                </div>

                {/* Finance Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Finance Company
                  </label>
                  <select
                    value={financeCompany}
                    onChange={(e) => setFinanceCompany(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994]"
                  >
                    <option value="">Select Finance Company</option>
                    <option value="company1">Company 1</option>
                    <option value="company2">Company 2</option>
                    <option value="company3">Company 3</option>
                    <option value="others">Others</option>
                    <option value="n/a">N/A</option>
                  </select>
                </div>

                {/* Finance Agreement (File Upload) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Finance Agreement
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994]"
                    />
                  </div>
                </div>

                {/* Installer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Installer
                  </label>
                  <select
                    value={installer}
                    onChange={(e) => setInstaller(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994]"
                  >
                    <option value="">Select Installer</option>
                    <option value="installer1">Installer 1</option>
                    <option value="installer2">Installer 2</option>
                    <option value="installer3">Installer 3</option>
                    <option value="others">Others</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* THIN HR LINE */}
          <hr className="border-gray-200" />

          {/* UTILITY AUTHORIZATION SECTION */}
          <div className="border border-gray-200 rounded-md p-4 shadow-sm bg-[#F5F5F5]">
            {/* Section Header with Edit button */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#039994] font-normal">Utility Authorization</h2>
              <button
                onClick={() => setShowUtilityEdit(!showUtilityEdit)}
                className="text-[#039994] text-sm font-medium hover:underline"
              >
                Edit
              </button>
            </div>

            {/* Read-Only Utility Info (shown when NOT editing) */}
            {!showUtilityEdit && (
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="font-medium">Utility Provider:</span>
                  <span className="ml-2">{utilityProvider}</span>
                </div>
                <div>
                  <p className="font-medium">Utility Details:</p>
                  <p className="mt-1 whitespace-pre-line">{utilityDetails}</p>
                </div>
              </div>
            )}

            {/* Editable Utility Card (shown when editing) */}
            {showUtilityEdit && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Utility Provider
                  </label>
                  <select
                    value={utilityProvider}
                    onChange={(e) => setUtilityProvider(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994]"
                  >
                    <option value="Provider 1">Provider 1</option>
                    <option value="Provider 2">Provider 2</option>
                    <option value="Provider 3">Provider 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Utility Details
                  </label>
                  <textarea
                    value={utilityDetails}
                    onChange={(e) => setUtilityDetails(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* NEXT BUTTON */}
          <button
            onClick={handleSubmit}
            className="w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994]"
          >
            Next
          </button>

          {/* Terms and Conditions & Privacy Policy */}
          <div className="mt-2 text-center text-xs text-gray-500 leading-tight">
            By clicking on ‘Next’, you agree to our{' '}
            <a
              href="/terms"
              className="text-[#039994] hover:underline font-medium"
            >
              Terms and Conditions
            </a>{' '}
            &{' '}
            <a
              href="/privacy"
              className="text-[#039994] hover:underline font-medium"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
