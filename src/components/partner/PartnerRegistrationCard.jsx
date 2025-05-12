'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PartnerRegistrationCard() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCategorySelect = (pathSegment) => {
    setLoading(true);
    router.push(`/register/partner-user-registration/${pathSegment}`);
  };

  return (
    <>
      {/* Loader Overlay */}
      {loading && (
        <div className={spinnerOverlay}>
          <div className={spinner}></div>
        </div>
      )}

      {/* Main Container */}
      <div className={mainContainer}>
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <img
            src="/auth_images/Login_logo.png"
            alt="DCarbon Logo"
            className="h-12 object-contain"
          />
        </div>

        {/* Heading */}
        <div className={headingContainer}>
          <h1 className={pageTitle}>
            Select Your Partner Registration Type
          </h1>
        </div>

        {/* Description */}
        <p className="text-center text-[#1E1E1E] mb-6 font-sfpro">
          Choose the category that best describes your role in the partner registration process.
        </p>

        {/* User Category Buttons */}
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 justify-center w-full max-w-md">
          {/* Sales Agent */}
          <button
            type="button"
            onClick={() => handleCategorySelect('sales-agent')}
            className={`px-6 py-3 rounded-md text-sm font-sfpro bg-transparent text-[#039994] border-2 border-[#039994] hover:bg-[#02857f] hover:text-white transition duration-300 ease-in-out ${buttonPrimary}`}
          >
            Sales Agent
          </button>

          {/* Installer */}
          <button
            type="button"
            onClick={() => handleCategorySelect('installer')}
            className={`px-6 py-3 rounded-md text-sm font-sfpro bg-transparent text-[#039994] border-2 border-[#039994] hover:bg-[#02857f] hover:text-white transition duration-300 ease-in-out ${buttonPrimary}`}
          >
            Installer
          </button>

          {/* Finance Company */}
          <button
            type="button"
            onClick={() => handleCategorySelect('finance-company')}
            className={`px-6 py-3 rounded-md text-sm font-sfpro bg-transparent text-[#039994] border-2 border-[#039994] hover:bg-[#02857f] hover:text-white transition duration-300 ease-in-out ${buttonPrimary}`}
          >
            Finance Company
          </button>
        </div>
      </div>
    </>
  );
}

// Imported styles from styles.js
const mainContainer = 'min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white';
const headingContainer = 'relative w-full flex flex-col items-center mb-2';
const pageTitle = 'mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center';
const spinnerOverlay = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20';
const spinner = 'h-12 w-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin';
const buttonPrimary = 'w-full sm:w-auto font-[600] text-[14px] leading-[100%] tracking-[-0.05em]';
