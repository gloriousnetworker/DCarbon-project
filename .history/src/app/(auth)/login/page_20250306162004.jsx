"use client";

import LoginCard from '../../../components/(auth)/login/LoginCard';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-between bg-[#15104D]">
      {/* Left Section - Image */}
      <div className="w-1/2 p-6">
        <img
          src="/auth_images/Login_image.png" // Update this to the correct image path
          alt="Login Image"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>

      {/* Right Section - Login Card */}
      <div className="w-1/2 p-6">
        <LoginCard />
      </div>
    </div>
  );
}
