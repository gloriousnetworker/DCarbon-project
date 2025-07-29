"use client";

import PartnerCard from '../../../../components/partner/PartnerRegistrationCard';

export default function PartnerPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FFFFFF]">
           <div className="w-full md:w-1/2 p-6 flex justify-center items-center">
        <img
          src="/auth_images/Register_image.png" 
          alt="Login Image"
          className="w-full h-auto object-cover rounded-lg"
        />
      </div>

      <div className="w-full md:w-1/2 p-6 flex justify-center items-center">
        <PartnerCard />
      </div>
    </div>
  );
}
