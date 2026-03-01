// app/components/ProfileImage.js
'use client';

import React, { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { useProfile } from "../../contexts/ProfileContext";
import { axiosInstance } from "../../../../../../../../lib/config";

const ProfileImage = () => {
  const defaultProfilePic = "/dashboard_images/profileImage.png";
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const { profile, updateProfile } = useProfile();

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) {
      toast.error("Authentication required");
      return;
    }

    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      setIsLoading(true);
      const response = await axiosInstance({
        method: "POST",
        url: `/api/user/upload-profile-picture/${userId}`,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: formData,
      });

      const data = response.data;

      if (response.status !== 200) {
        throw new Error(data.message || "Upload failed");
      }

      toast.success("Profile picture updated successfully");
      await updateProfile();
    } catch (error) {
      console.error("Upload error:", error);
      if (error.response) {
        toast.error(error.response.data?.message || "Error uploading image");
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error(error.message || "Error uploading image");
      }
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full md:w-1/3 flex flex-col items-center mb-6 md:mb-0 md:pr-8 border-b md:border-b-0 md:border-r border-gray-200">
      <div
        className={`relative w-32 h-32 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center ${
          isLoading ? "opacity-70" : "cursor-pointer"
        }`}
        onClick={!isLoading ? handleImageClick : undefined}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#039994]"></div>
          </div>
        )}
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
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={handleFileChange}
        disabled={isLoading}
      />
      <p className="mt-2 text-sm text-gray-500">
        {isLoading ? "Uploading..." : "Click to change profile picture"}
      </p>
    </div>
  );
};

export default ProfileImage;