'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Loader from '@/components/loader/Loader';

export default function StepOneCard() {
  const [loading, setLoading] = useState(false);
  const [financeCompany, setFinanceCompany] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Validate required fields
      if (!financeCompany) {
        throw new Error('Please fill all required fields');
      }

      // Map dropdown values to API expected values
      const entityTypeMap = {
        company1: 'individual',
        company2: 'company'
      };

      const payload = {
        entityType: entityTypeMap[financeCompany],
        commercialRole: 'owner' // Fixed value for commercialRole
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80">
          <Loader />
        </div>
      )}
      
      <div className="min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white">
        {/* Back button and header */}
        <div className="relative w-full flex flex-col items-center mb-2">
          <div
            className="absolute left-4 top-0 text-[#039994] cursor-pointer z-10"
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

        <h1 className="mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center">
          Solar Owner's Registration
        </h1>

        {/* Progress indicator */}
        <div className="w-full max-w-md flex items-center justify-between mb-6">
          <div className="flex-1 h-1 bg-gray-200 rounded-full mr-4">
            <div className="h-1 bg-[#039994] w-1/5 rounded-full" />
          </div>
          <span className="text-sm font-medium text-gray-500 font-sfpro">01/05</span>
        </div>

        {/* Form fields */}
        <div className="w-full max-w-md space-y-6">
          {/* Commercial Role field */}
          <div>
            <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              Commercial Role <span className="text-red-500">*</span>
            </label>
            <div className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#626060]">
              Owner
            </div>
          </div>

          {/* Entity Type field */}
          <div>
            <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              Entity Type <span className="text-red-500">*</span>
            </label>
            <select
              value={financeCompany}
              onChange={(e) => setFinanceCompany(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#626060]"
              required
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
            className="w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro"
          >
            Continue
          </button>
        </div>

        {/* Footer links */}
        <div className="mt-6 text-center font-sfpro text-[10px] font-[800] leading-[100%] tracking-[-0.05em] underline text-[#1E1E1E]">
          By continuing, you agree to our {' '}
          <a href="/terms" className="text-[#039994] hover:underline">Terms</a> and {' '}
          <a href="/privacy" className="text-[#039994] hover:underline">Privacy Policy</a>
        </div>
      </div>
    </>
  );
}
