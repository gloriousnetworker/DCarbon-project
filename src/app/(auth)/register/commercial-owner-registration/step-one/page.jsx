"use client";

import { useState } from "react";
import CommercialOwnerRegistrationCard from '../../../../../components/commercial/commercial-owner-registration/StepOneCard';

export default function CommercialOwnerRegistrationPage() {
  // State to control whether the video is playing or not
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FFFFFF]">
      {/* Left Section - Image or Video */}
      <div className="w-full md:w-1/2 p-6 flex justify-center items-center">
        {isVideoPlaying ? (
          // Render the YouTube video iframe when video is playing
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/oLuhi9B5oxw?autoplay=1"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg"
          ></iframe>
        ) : (
          // Render the image placeholder when the video is not playing
          <img
            src="/auth_images/residence_step1_image.png"
            alt="Description Video Placeholder"
            className="w-full h-auto object-cover rounded-lg cursor-pointer"
            onClick={() => setIsVideoPlaying(true)}
          />
        )}
      </div>

      {/* Right Section - Commercial Owner Registration Card */}
      <div className="w-full md:w-1/2 p-6 flex justify-center items-center">
        <CommercialOwnerRegistrationCard />
      </div>
    </div>
  );
}
