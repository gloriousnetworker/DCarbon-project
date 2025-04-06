'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function OwnersDetailsCard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('+234');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');

  const validateForm = () => {
    if (!fullName.trim()) {
      toast.error('Owner’s full name is required');
      return false;
    }

    if (!phoneNumber.trim()) {
      toast.error('Phone number is required');
      return false;
    }

    if (!address.trim()) {
      toast.error('Address is required');
      return false;
    }

    if (!/^\+?\d{7,}$/.test(phonePrefix + phoneNumber)) {
      toast.error('Invalid phone number format');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('authToken');
      
      if (!userId || !token) {
        throw new Error('Authentication required');
      }

      const payload = {
        entityType: 'individual',
        commercialRole: 'owner',
        ownerFullName: fullName,
        phoneNumber: `${phonePrefix}${phoneNumber}`,
        ownerAddress: address,
        ownerWebsite: website || undefined // Send as undefined if empty
      };

      await axios.put(
        `https://dcarbon-server.onrender.com/api/user/commercial-registration/${userId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      toast.success('Owner details updated successfully');
      router.push('/register/commercial-owner-registration/step-three');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Update failed';
      toast.error(errorMessage);
      console.error('Submission Error:', err);
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

      <div className="min-h-screen w-full bg-white flex flex-col items-center py-8 px-4">
        <div className="relative w-full mb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="absolute left-0 text-[#039994] p-2 focus:outline-none"
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
          </button>
        </div>

        <div className="w-full max-w-md">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#039994] mb-2">
            Owner’s Details
          </h1>
        </div>

        <div className="w-full max-w-md flex items-center justify-between mb-6">
          <div className="flex-1 h-1 bg-gray-200 rounded-full mr-4">
            <div className="h-1 bg-[#039994] w-full rounded-full" />
          </div>
          <span className="text-sm font-medium text-gray-500">03/03</span>
        </div>

        <div className="w-full max-w-md mb-4">
          <h2 className="text-md font-semibold text-[#039994]">
            Individual owner
          </h2>
        </div>

        <div className="w-full max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner’s full name
            </label>
            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-[#039994]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={phonePrefix}
                onChange={(e) => setPhonePrefix(e.target.value)}
                className="w-16 rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-[#039994]"
              />
              <input
                type="text"
                placeholder="e.g. 000-0000-000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-[#039994]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              placeholder="E.g. Street, City, County, State."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-[#039994]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website details
            </label>
            <input
              type="text"
              placeholder="Enter website (e.g. www.example.com)"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-[#039994]"
            />
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
          Terms and Conditions &amp;{' '}
          <a href="/privacy" className="text-[#039994] hover:underline font-medium">
            Privacy Policy
          </a>
        </div>
      </div>
    </>
  );
}