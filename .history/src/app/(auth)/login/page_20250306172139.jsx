"use client";

import LoginCard from '../../../components/(auth)/login/LoginCard';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0D0A3C]">
      {/* Left Section - Sustainability Image */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 bg-[#009688] rounded-br-[50px] md:rounded-br-[100px]">
        <h1 className="text-white text-4xl md:text-5xl font-bold mb-6 text-left">
          Sustainable Innovation
        </h1>
        <img
          src="/auth_images/Login_image.png" // Ensure the correct image path
          alt="Sustainable Energy"
          className="w-full max-w-lg h-auto object-cover rounded-lg"
        />
      </div>

      {/* Right Section - Login Card */}
      <div className="w-full md:w-1/2 flex justify-center items-center p-8">
        <LoginCard />
      </div>
    </div>
  );
}