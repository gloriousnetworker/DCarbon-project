"use client";

import { Suspense, use } from 'react';
import VerificationContent from '../../../../../../components/operator-registration/Verification';

// Create a wrapper component that handles the async params
function VerificationWrapper({ paramsPromise }) {
  const params = use(paramsPromise);
  return <VerificationContent token={params.token} />;
}

export default function TokenVerificationPage({ params }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FFFFFF]">
      {/* Left Section - Image */}
      <div className="w-full md:w-1/2 p-6 flex justify-center items-center">
        <img
          src="/auth_images/residence_step1_image.png" 
          alt="Login Image"
          className="w-full h-auto object-cover rounded-lg"
        />
      </div>

      {/* Right Section - Verification Card */}
      <div className="w-full md:w-1/2 p-6 flex justify-center items-center">
        <Suspense fallback={<div>Loading...</div>}>
          <VerificationWrapper paramsPromise={params} />
        </Suspense>
      </div>
    </div>
  );
}