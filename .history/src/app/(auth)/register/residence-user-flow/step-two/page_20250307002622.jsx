"use client";

import ResidenceStepOneCard from '../../../../../components/residence/StepOneCard';

export default function ResidenceStepTwoPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FFFFFF]">
      {/* Left Section - Image */}
      <div className="w-full md:w-1/2 p-6 flex justify-center items-center">
        <img
          src="/auth_images/Register_image.png" 
          alt="Login Image"
          className="w-full h-auto object-cover rounded-lg"
        />
      </div>

      {/* Right Section - Login Card */}
      <div className="w-full md:w-1/2 p-6 flex justify-center items-center">
        <ResidenceStepOneCard />
      </div>
    </div>
  );
}
