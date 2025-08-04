'use client';

import React from "react";
import Image from "next/image";
import { useProfile } from "../../contexts/ProfileContext";

const ProfileImage = () => {
  const defaultProfilePic = "/dashboard_images/profileImage.png";
  const { profile } = useProfile();

  return (
    <div className="w-full md:w-1/3 flex flex-col items-center mb-6 md:mb-0 md:pr-8 border-b md:border-b-0 md:border-r border-gray-200">
      <div className="relative w-32 h-32 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
        <Image
          src={profile.picture || defaultProfilePic}
          alt="Profile"
          width={128}
          height={128}
          className="object-cover w-full h-full"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultProfilePic;
          }}
        />
      </div>
      <p className="mt-2 text-sm text-gray-500">Your Owner's Image</p>
    </div>
  );
};

export default ProfileImage;