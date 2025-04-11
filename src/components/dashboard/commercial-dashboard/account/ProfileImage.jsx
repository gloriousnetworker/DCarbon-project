"use client";
import React, { useRef, useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const ProfileImage = () => {
  // Default image path from public folder
  const defaultProfilePic = "/dashboard_images/profileImage.png";
  
  // Reference to the hidden file input element
  const fileInputRef = useRef(null);
  // Local state to store the profile image URL
  const [profilePic, setProfilePic] = useState(defaultProfilePic);

  // On component mount, check if there's a stored profile picture URL in localStorage
  useEffect(() => {
    const storedPic = localStorage.getItem("userProfilePicture");
    if (storedPic) {
      setProfilePic(storedPic);
    }
  }, []);

  // Trigger file input when image container is clicked
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection and upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Get userId and authToken from localStorage
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    // Construct form data
    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      // Replace the URL with your backend server URL and the corresponding userId
      const response = await fetch(
        `https://dcarbon-server.onrender.com/api/user/upload-profile-picture/${userId}`,
        {
          method: "POST",
          // Setting the auth token header (adjust header key if needed)
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok && data.status === "success") {
        // Display a success toast notification
        toast.success(data.message);

        // Create an object URL for the file to update the UI immediately.
        // (Alternatively, use a URL returned by your API if available.)
        const newImageUrl = URL.createObjectURL(file);

        // Persist the updated image in localStorage
        localStorage.setItem("userProfilePicture", newImageUrl);

        // Update the state so the new picture is displayed
        setProfilePic(newImageUrl);
      } else {
        toast.error("Failed to upload profile picture");
      }
    } catch (error) {
      toast.error("Error uploading image");
      console.error("Upload error:", error);
    }
  };

  return (
    <div className="w-full md:w-1/3 flex flex-col items-center mb-6 md:mb-0 md:pr-8 border-b md:border-b-0 md:border-r border-gray-200">
      <div
        className="relative w-32 h-32 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center cursor-pointer"
        onClick={handleImageClick}
      >
        <img
          src={profilePic}
          alt="Profile"
          className="object-cover w-full h-full"
          onError={(e) => {
            e.target.onerror = null;
            // If the image fails to load, fallback to the default image
            e.target.src = defaultProfilePic;
          }}
        />
      </div>
      {/* Hidden file input element */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ProfileImage;