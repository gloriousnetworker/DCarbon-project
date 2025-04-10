'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
      <ToastContainer />
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="h-12 w-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin"></div>
        </div>
      )}
      
      <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center py-8 px-4">
        {/* Back button and header */}
        <div className="relative w-full mb-10">
          <div
            className="absolute left-12 top-0 text-[#039994] cursor-pointer"
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

        <h1 className="text-2xl sm:text-3xl font-bold text-[#039994] mb-6">
          Solar Owner's Registration
        </h1>

        {/* Progress indicator */}
        <div className="w-full max-w-md mb-8">
          <div className="flex items-center">
            <div className="flex-1 h-1 bg-gray-200 rounded-full">
              <div className="h-1 bg-[#039994] w-1/5 rounded-full" />
            </div>
            <span className="ml-4 text-sm font-medium text-gray-500">01/05</span>
          </div>
        </div>

        {/* Form fields */}
        <div className="w-full max-w-md space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commercial Role
            </label>
            <select
              value={financeType}
              onChange={(e) => setFinanceType(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#039994] focus:outline-none"
            >
              <option value="">Select Role</option>
              <option value="cash">Owner</option>
              {/* <option value="loan">Operator</option>
              <option value="ppa">Both</option> */}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entity Type
            </label>
            <select
              value={financeCompany}
              onChange={(e) => setFinanceCompany(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#039994] focus:outline-none"
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
            className="w-full bg-[#039994] text-white py-2 rounded-md hover:bg-[#02857f] transition-colors"
          >
            Continue
          </button>
        </div>

        {/* Footer links */}
        <div className="mt-8 text-center text-xs text-gray-600">
          By continuing, you agree to our {' '}
          <a href="/terms" className="text-[#039994] hover:underline">Terms</a> and {' '}
          <a href="/privacy" className="text-[#039994] hover:underline">Privacy Policy</a>
        </div>
      </div>
    </>
  );
}