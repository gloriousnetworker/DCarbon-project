"use client";

import React from 'react';
import { FiArrowLeft, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

const DashboardContactSupport = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white">
      <div className="relative w-full flex flex-col items-center mb-2">
        <button onClick={() => router.back()} className="absolute left-4 top-0 text-[#039994] cursor-pointer z-10" aria-label="Back">
          <FiArrowLeft size={24} />
        </button>
        <h1 className="mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center">
          Contact Support
        </h1>
      </div>

      <div className="w-full max-w-3xl bg-white p-8 rounded-lg shadow-md">
        <h2 className="mb-2 font-sfpro text-[24px] leading-[100%] tracking-[-0.05em] font-[600] text-[#1E1E1E]">
          We're here to help
        </h2>
        <p className="text-[#626060] text-sm mb-8 font-sfpro">
          Reach out to us through any of the channels below and we'll get back to you as soon as possible.
        </p>

        <div className="space-y-5">
          <div className="flex items-start space-x-4 p-5 rounded-xl border border-gray-100 bg-gray-50">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#039994]/10 flex items-center justify-center">
              <FiMail className="text-[#039994]" size={18} />
            </div>
            <div>
              <p className="text-xs font-[500] text-[#626060] uppercase tracking-widest mb-1">Email</p>
              <a href="mailto:support@dcarbon.solutions" className="text-[#039994] font-[600] text-[16px] hover:underline font-sfpro">
                support@dcarbon.solutions
              </a>
              <p className="text-xs text-[#626060] mt-1">We typically respond within 1–2 business days.</p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-5 rounded-xl border border-gray-100 bg-gray-50">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#039994]/10 flex items-center justify-center">
              <FiMapPin className="text-[#039994]" size={18} />
            </div>
            <div>
              <p className="text-xs font-[500] text-[#626060] uppercase tracking-widest mb-1">Address</p>
              <p className="text-[#1E1E1E] font-[600] text-[16px] font-sfpro">DCarbon Solutions, Inc.</p>
              <p className="text-[#626060] text-sm mt-0.5">8 The Green, STE A, Dover DE, 19901</p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 rounded-xl bg-[#039994]/5 border border-[#039994]/20">
          <p className="text-sm text-[#626060] font-sfpro text-center">
            For urgent matters, please email us directly at{' '}
            <a href="mailto:support@dcarbon.solutions" className="text-[#039994] font-semibold hover:underline">
              support@dcarbon.solutions
            </a>{' '}
            with a clear subject line describing your issue.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardContactSupport;