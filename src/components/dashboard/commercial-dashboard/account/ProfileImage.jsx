"use client";
import React, { useRef, useState } from "react";

const ProfileImage = () => {
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleProfileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  return (
    <div className="w-full md:w-1/3 flex flex-col items-center mb-6 md:mb-0 md:pr-8 border-b md:border-b-0 md:border-r border-gray-200">
      <div
        className="relative w-32 h-32 rounded-full bg-gray-200 cursor-pointer overflow-hidden flex items-center justify-center"
        onClick={handleProfileClick}
      >
        {profileImage ? (
          <img
            src={profileImage}
            alt="Profile"
            className="object-cover w-full h-full"
          />
        ) : (
          <svg
            className="text-gray-400 w-12 h-12"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5c2.485 0 4.5 2.015 4.5 4.5S14.485 13.5 12 13.5
                  7.5 11.485 7.5 9 9.515 4.5 12 4.5zM6.136 18.364c1.308-1.308
                  3.413-2.364 5.864-2.364 2.45 0 4.556 1.056 5.864 2.364
                  A9.953 9.953 0 0112 21c-2.731 0-5.21-1.106-7.136-2.636z"
            />
          </svg>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="absolute bottom-1 right-1 bg-[#039994] w-8 h-8 flex items-center justify-center rounded-full">
          <svg
            className="text-white w-4 h-4"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              d="M12 5a1 1 0 011 1v5h5a1 1 0
                  110 2h-5v5a1 1 0 11-2 0v-5H6a1 1
                  0 110-2h5V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        Click to upload/change profile picture
      </p>
    </div>
  );
};

export default ProfileImage;