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
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [partnerType, setPartnerType] = useState('installer');

  const router = useRouter();

  const handleSubmit = async () => {
    if (!partnerName || !phoneNumber || !email || !address1 || !city || !state || !zipCode || !partnerType) {
      toast.error('Please fill all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    const phoneRegex = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast.error('Please enter a valid phone number');
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
      const address = [address1, address2, city, state, zipCode].filter(Boolean).join(', ');

      const payload = {
        name: partnerName,
        email,
        phoneNumber,
        partnerType,
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
        localStorage.setItem('partnerType', partnerType);
        
        switch(partnerType) {
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
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
          <div className="h-12 w-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin"></div>
        </div>
      )}

      <div className="min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white">
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

        <h1 className="mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center">
          Partner Information
        </h1>

        <div className="w-full max-w-md flex items-center justify-between mb-6">
          <div className="flex-1 h-1 bg-gray-200 rounded-full mr-4">
            <div className="h-1 bg-[#039994] w-1/2 rounded-full" />
          </div>
          <span className="text-sm font-medium text-gray-500 font-sfpro">01/02</span>
        </div>

        <div className="w-full max-w-md space-y-6">
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

          <div>
            <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="Company name"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="(123) 456-7890"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]"
              required
            />
          </div>

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

          <div>
            <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              Address 1 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              placeholder="123 Main St"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              Address 2
            </label>
            <input
              type="text"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              placeholder="Apt, suite, unit, etc."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]"
            />
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
              Zip Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="12345"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]"
              required
            />
          </div>
        </div>

        <div className="w-full max-w-md mt-6">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Next'}
          </button>
        </div>

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