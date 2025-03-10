"use client";

import CommercialOwnerRegistrationCard from '../../../../../components/commercial/commercial-operator-registration/StepThreeCard';

export default function CommercialOwnerRegistrationPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FFFFFF]">
      {/* Left Section - Image */}
      <div className="w-full md:w-1/2 p-6 flex justify-center items-center">
        <img
          src="/auth_images/residence_step3_image.png"
          alt="Login Image"
          className="w-full h-auto object-cover rounded-lg"
        />
      </div>

      {/* Right Section - Login Card */}
      <div className="w-full md:w-1/2 p-6 flex justify-center items-center">
        <CommercialOwnerRegistrationCard />
      </div>
    </div>
  );
}
