"use client";
import React, { useState, useRef } from "react";
import { FaArrowLeft } from "react-icons/fa";

/**
 * A component replicating the "Two Factor Authentication" flow
 */
const TwoFactorAuth = ({ onBack }) => {
  // We'll store each digit in a 6-character array
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);

  // Focus logic: when user enters a digit, move to next input
  const handleChange = (value, idx) => {
    if (isNaN(value)) return; // only allow digits
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);

    if (value && idx < 5) {
      inputsRef.current[idx + 1].focus();
    }
  };

  // Backspace logic: if user presses backspace on an empty input, go to previous
  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputsRef.current[idx - 1].focus();
    }
  };

  const handleSubmit = () => {
    const code = otp.join("");
    // Handle update action here
    console.log("2FA Code Submitted:", code);
  };

  return (
    <div className="bg-white rounded shadow w-full p-6">
      {/* Header row: back arrow, title */}
      <div className="flex items-center mb-2">
        <button
          onClick={onBack}
          className="flex items-center text-[#039994] hover:text-[#02857f] focus:outline-none"
        >
          <FaArrowLeft className="mr-2" />
          <span className="font-semibold">Back</span>
        </button>
        <h2 className="ml-4 text-xl font-semibold text-[#039994]">
          Two Factor Authentication
        </h2>
      </div>

      {/* Thin divider */}
      <hr className="border-gray-200 mb-4" />

      {/* Info Text */}
      <p className="text-gray-600 mb-6">
        Please scan the QR code with your Google Authenticator app and enter the
        verification code below.
      </p>

      {/* QR Code Container */}
      <div className="border border-[#039994] rounded p-4 mb-6 w-full flex justify-center">
        {/* Replace the src with your actual QR code image link */}
        <img
          src="/dashboard_images/qrcode.png"
          alt="QR Code"
          className="max-w-full h-auto"
          style={{ width: "200px", height: "200px" }}
        />
      </div>

      {/* Verification Code Inputs */}
      <div className="flex flex-col items-center sm:items-start mb-2">
        <label className="block text-gray-700 text-sm font-semibold mb-2">
          Verification Code
        </label>

        <div className="flex items-center space-x-2">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputsRef.current[idx] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="border border-gray-300 rounded w-12 h-12 text-center 
                         focus:outline-none focus:border-[#039994] text-xl"
            />
          ))}
        </div>
      </div>

      {/* Helper row: "Do you need help?" and red timer */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-sm mt-2 mb-6">
        <button className="text-[#039994] hover:underline focus:outline-none mb-2 sm:mb-0">
          Do you need help?
        </button>
        <span className="text-red-500">
          0:30 secs left
        </span>
      </div>

      {/* Another divider */}
      <hr className="border-gray-200 mb-4" />

      {/* Update button */}
      <div className="flex justify-start">
        <button
          onClick={handleSubmit}
          className="inline-block rounded bg-[#039994] px-4 py-2 text-white text-sm font-semibold 
                     hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#02857f]"
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default TwoFactorAuth;
