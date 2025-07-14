"use client";
import PrivacyCard from '../../components/privacy/Privacy';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#15104D]">
      <div className="w-full md:w-1/2 p-6 flex justify-center items-center">
        <img
          src="/auth_images/Login_image.png"
          alt="Login Image"
          className="w-full h-auto object-cover rounded-lg"
        />
      </div>
      <div className="w-full md:w-1/2 p-6 flex justify-center items-center">
        <PrivacyCard />
      </div>
    </div>
  );
}