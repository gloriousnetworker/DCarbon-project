"use client";

import CommercialBothRegistrationCard from '../../../../../components/commercial/commercial-both-registration/step-two-utility-authorization/StepTwoCard';

export default function CommercialBothRegistrationPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FFFFFF]">
      {/* Left Section - Image */}
      <div className="w-full md:w-1/2 p-6 flex justify-center items-center">
        <img
          src="/auth_images/residence_step2_image.png" 
          alt="Login Image"
          className="w-full h-auto object-cover rounded-lg"
        />
      </div>

      {/* Right Section - Login Card */}
      <div className="w-full md:w-1/2 p-6 flex justify-center items-center">
        <CommercialBothRegistrationCard />
      </div>
    </div>
  );
}
