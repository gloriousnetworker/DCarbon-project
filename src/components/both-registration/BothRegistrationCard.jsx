'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function StepOneCard() {
  const [loading, setLoading] = useState(false);
  const [commercialRole, setCommercialRole] = useState('');
  const [entityType, setEntityType] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    if (!commercialRole || !entityType) {
      toast.error('Please select both Commercial Role and Entity Type');
      return;
    }

    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');

    if (!userId || !authToken) {
      toast.error('Authentication required. Please login again.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://dcarbon-server.onrender.com/api/user/commercial-registration/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            entityType,
            commercialRole,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration update failed');
      }

      toast.success('Registration updated successfully!');
      router.push('/register/commercial-both-registration/step-one');
    } catch (error) {
      toast.error(error.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="h-12 w-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin"></div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={5000} />

      <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center py-8 px-4">
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

        <h1 className="text-2xl sm:text-3xl font-bold text-[#039994] mr-40 mb-6">
          Owner & Operator's Registration
        </h1>

        <div className="w-full max-w-md flex items-center justify-between mt-4 mb-4">
          <div className="flex-1 h-1 bg-gray-200 rounded-full mr-4">
            <div className="h-1 bg-[#039994] w-2/5 rounded-full" />
          </div>
          <span className="text-sm font-medium text-gray-500">01/05</span>
        </div>

        <div className="w-full max-w-md space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Commercial Role</label>
            <select
              value={commercialRole}
              onChange={(e) => setCommercialRole(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
            >
              <option value="">Choose role</option>
              <option value="owner">Owner</option>
              <option value="operator">Operator</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Entity Type</label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039994]"
            >
              <option value="">Choose Type</option>
              <option value="individual">Individual</option>
              <option value="company">Company</option>
            </select>
          </div>
        </div>

        <div className="w-full max-w-md mt-6">
          <button
            onClick={handleSubmit}
            className="w-full rounded-md bg-[#039994] text-white font-semibold py-2 
               hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994]"
          >
            Next
          </button>
        </div>

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