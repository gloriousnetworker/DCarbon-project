// src/app/login/page.jsx
"use client";

import LoginCard from '../../../components/(auth)/login/LoginCard';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-between bg-[#15104D]">
      {/* Left Section - Image */}
      <div className="hidden lg:block lg:w-1/2 p-6">
        <img
          src="/path-to-your-image/image.png" // Update this to the correct image path
          alt="Login Image"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>

      {/* Right Section - Login Card */}
      <div className="w-full lg:w-1/2 p-6">
        <LoginCard />
      </div>
    </div>
  );
}
