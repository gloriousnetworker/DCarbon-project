// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';

// export default function PartnerRegistrationCard() {
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   const handleCategorySelect = (pathSegment) => {
//     setLoading(true);
//     router.push(`/register/partner-user-registration/${pathSegment}`);
//   };

//   return (
//     <>
//       {/* Loader Overlay */}
//       {loading && (
//         <div className={spinnerOverlay}>
//           <div className={spinner}></div>
//         </div>
//       )}

//       {/* Main Container */}
//       <div className={mainContainer}>
//         {/* Logo */}
//         <div className="mb-6 flex justify-center">
//           <img
//             src="/auth_images/Login_logo.png"
//             alt="DCarbon Logo"
//             className="h-12 object-contain"
//           />
//         </div>

//         {/* Heading */}
//         <div className={headingContainer}>
//           <h1 className={pageTitle}>
//             Select Your Partner Registration Type
//           </h1>
//         </div>

//         {/* Description */}
//         <p className="text-center text-[#1E1E1E] mb-6 font-sfpro">
//           Choose the category that best describes your role in the partner registration process.
//         </p>

//         {/* User Category Buttons */}
//         <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 justify-center w-full max-w-md">
//           {/* Sales Agent */}
//           <button
//             type="button"
//             onClick={() => handleCategorySelect('sales-agent')}
//             className={`px-6 py-3 rounded-md text-sm font-sfpro bg-transparent text-[#039994] border-2 border-[#039994] hover:bg-[#02857f] hover:text-white transition duration-300 ease-in-out ${buttonPrimary}`}
//           >
//             Sales Agent
//           </button>

//           {/* Installer */}
//           <button
//             type="button"
//             onClick={() => handleCategorySelect('installer')}
//             className={`px-6 py-3 rounded-md text-sm font-sfpro bg-transparent text-[#039994] border-2 border-[#039994] hover:bg-[#02857f] hover:text-white transition duration-300 ease-in-out ${buttonPrimary}`}
//           >
//             Installer
//           </button>

//           {/* Finance Company */}
//           <button
//             type="button"
//             onClick={() => handleCategorySelect('finance-company')}
//             className={`px-6 py-3 rounded-md text-sm font-sfpro bg-transparent text-[#039994] border-2 border-[#039994] hover:bg-[#02857f] hover:text-white transition duration-300 ease-in-out ${buttonPrimary}`}
//           >
//             Finance Company
//           </button>
//         </div>
//       </div>
//     </>
//   );
// }

// // Imported styles from styles.js
// const mainContainer = 'min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white';
// const headingContainer = 'relative w-full flex flex-col items-center mb-2';
// const pageTitle = 'mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center';
// const spinnerOverlay = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20';
// const spinner = 'h-12 w-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin';
// const buttonPrimary = 'w-full sm:w-auto font-[600] text-[14px] leading-[100%] tracking-[-0.05em]';


'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function StepOneCard() {
  const [loading, setLoading] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [partnerType, setPartnerType] = useState('installer');

  const router = useRouter();

  const handleSubmit = async () => {
    // Validate required fields
    if (!partnerName || !phoneNumber || !email || !address || !partnerType) {
      toast.error('Please fill all required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');

    if (!userId || !authToken) {
      toast.error('Authentication required');
      return;
    }

    setLoading(true);

    try {
      // Map dropdown values to API expected values
      const apiPartnerType = partnerType; // No need to map as we're now using correct values in the dropdown

      const payload = {
        name: partnerName,
        email,
        phoneNumber,
        partnerType: apiPartnerType,
        address,
      };

      const response = await axios.post(
        `https://services.dcarbon.solutions/api/user/create-partner/${userId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.data.status === 'success') {
        toast.success('Partner registration successful');
        
        // Store partner type in localStorage for navbar to use
        localStorage.setItem('partnerType', apiPartnerType);
        
        // Route based on partner type
        switch(apiPartnerType) {
          case 'sales_agent':
            router.push('/register/partner-user-registration/sales-agent-agreement');
            break;
          case 'finance_company':
            router.push('/register/partner-user-registration/finance-company-agreement');
            break;
          case 'installer':
          default:
            router.push('/register/partner-user-registration/partner-installer-agreement');
        }
      } else {
        throw new Error(response.data.message || 'Partner registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          'Partner registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
          <div className="h-12 w-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin"></div>
        </div>
      )}

      {/* Full-Screen Background */}
      <div className="min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white">
        {/* Back Arrow */}
        <div className="relative w-full flex flex-col items-center mb-2">
          <div className="absolute left-4 top-0 text-[#039994] cursor-pointer z-10" onClick={() => router.back()}>
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
        <h1 className="mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center">
          Partner Information
        </h1>

        {/* Step Bar */}
        <div className="w-full max-w-md flex items-center justify-between mb-6">
          <div className="flex-1 h-1 bg-gray-200 rounded-full mr-4">
            <div className="h-1 bg-[#039994] w-1/2 rounded-full" />
          </div>
          <span className="text-sm font-medium text-gray-500 font-sfpro">01/02</span>
        </div>

        {/* Form Fields */}
        <div className="w-full max-w-md space-y-6">
          {/* Partner Type Dropdown - Updated with correct values */}
          <div>
            <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              Partner Type <span className="text-red-500">*</span>
            </label>
            <select
              value={partnerType}
              onChange={(e) => setPartnerType(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E] bg-white"
              required
            >
              <option value="installer">Installer</option>
              <option value="sales_agent">Sales Agent</option>
              <option value="finance_company">Finance Company</option>
            </select>
          </div>

          {/* Partner Name */}
          <div>
            <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              Partner Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="Partner name"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]"
              required
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="08123456789"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]"
              required
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]"
              required
            />
          </div>

          {/* Address */}
          <div>
            <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="15 Airport Road, Lagos"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]"
              required
            />
          </div>
        </div>

        {/* Next Button */}
        <div className="w-full max-w-md mt-6">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Next'}
          </button>
        </div>

        {/* Terms and Conditions & Privacy Policy Links */}
        <div className="mt-6 text-center font-sfpro text-[10px] font-[800] leading-[100%] tracking-[-0.05em] underline text-[#1E1E1E]">
          By clicking on 'Next', you agree to our{' '}
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