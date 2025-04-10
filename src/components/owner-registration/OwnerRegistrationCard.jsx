'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function StepOneCard() {
  const [loading, setLoading] = useState(false);
  const [financeType, setFinanceType] = useState('');
  const [financeCompany, setFinanceCompany] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Validate required fields
      if (!financeType || !financeCompany) {
        throw new Error('Please fill all required fields');
      }

      // Map dropdown values to API expected values
      const commercialRoleMap = {
        cash: 'owner',
        loan: 'operator',
        ppa: 'both'
      };

      const entityTypeMap = {
        company1: 'individual',
        company2: 'company'
      };

      const payload = {
        entityType: entityTypeMap[financeCompany],
        commercialRole: commercialRoleMap[financeType]
      };

      // Retrieve authentication details
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('authToken');
      
      if (!userId || !token) {
        throw new Error('Authentication required - please login again');
      }

      // Make API call
      const response = await axios.put(
        `https://dcarbon-server.onrender.com/api/user/commercial-registration/${userId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('API Response:', response.data);
      toast.success('Registration details saved successfully');
      router.push('/register/commercial-owner-registration/step-one');
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Operation failed';
      toast.error(errorMessage);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className={spinnerOverlay}>
          <div className={spinner}></div>
        </div>
      )}
      
      <div className={mainContainer}>
        {/* Back button and header */}
        <div className={headingContainer}>
          <div
            className={backArrow}
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

        <h1 className={pageTitle}>
          Solar Owner's Registration
        </h1>

        {/* Progress indicator */}
        <div className={progressContainer}>
          <div className={progressBarWrapper}>
            <div className={`${progressBarActive} w-1/5`} />
          </div>
          <span className={progressStepText}>01/05</span>
        </div>

        {/* Form fields */}
        <div className={formWrapper}>
          <div>
            <label className={labelClass}>
              Commercial Role
            </label>
            <select
              value={financeType}
              onChange={(e) => setFinanceType(e.target.value)}
              className={selectClass}
            >
              <option value="">Select Role</option>
              <option value="cash">Owner</option>
              {/* <option value="loan">Operator</option>
              <option value="ppa">Both</option> */}
            </select>
          </div>

          <div>
            <label className={labelClass}>
              Entity Type
            </label>
            <select
              value={financeCompany}
              onChange={(e) => setFinanceCompany(e.target.value)}
              className={selectClass}
            >
              <option value="">Select Entity Type</option>
              <option value="company1">Individual</option>
              <option value="company2">Company</option>
            </select>
          </div>
        </div>

        {/* Submit button */}
        <div className="w-full max-w-md mt-8">
          <button
            onClick={handleSubmit}
            className={buttonPrimary}
          >
            Continue
          </button>
        </div>

        {/* Footer links */}
        <div className={termsTextContainer}>
          By continuing, you agree to our {' '}
          <a href="/terms" className="text-[#039994] hover:underline">Terms</a> and {' '}
          <a href="/privacy" className="text-[#039994] hover:underline">Privacy Policy</a>
        </div>
      </div>
    </>
  );
}

// Style constants (would normally be imported from styles.js)
const mainContainer = 'min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white';
const headingContainer = 'relative w-full flex flex-col items-center mb-2';
const backArrow = 'absolute left-4 top-0 text-[#039994] cursor-pointer z-10';
const pageTitle = 'mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center';
const progressContainer = 'w-full max-w-md flex items-center justify-between mb-6';
const progressBarWrapper = 'flex-1 h-1 bg-gray-200 rounded-full mr-4';
const progressBarActive = 'h-1 bg-[#039994] rounded-full';
const progressStepText = 'text-sm font-medium text-gray-500 font-sfpro';
const formWrapper = 'w-full max-w-md space-y-6';
const labelClass = 'block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]';
const selectClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#626060]';
const buttonPrimary = 'w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro';
const spinnerOverlay = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20';
const spinner = 'h-12 w-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin';
const termsTextContainer = 'mt-6 text-center font-sfpro text-[10px] font-[800] leading-[100%] tracking-[-0.05em] underline text-[#1E1E1E]';