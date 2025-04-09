"use client";
import React, { useState, useRef } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import TwoFactorAuth from "./TwoFactorAuth";
import ChangePasswordModal from "./ChangePasswordModal";

/**
 * Custom toggle switch component
 */
const ToggleSwitch = ({ enabled, onChange }) => {
  return (
    <div
      onClick={() => onChange(!enabled)}
      className={`w-11 h-6 rounded-full flex items-center cursor-pointer transition-colors ${
        enabled ? "bg-[#039994]" : "bg-gray-200"
      }`}
    >
      <div
        className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </div>
  );
};

const MyAccount = () => {
  // Collapsible sections
  const [showPersonal, setShowPersonal] = useState(true);
  const [showAccount, setShowAccount] = useState(true);
  const [showPreferences, setShowPreferences] = useState(true);

  // Views / modals
  const [viewTwoFA, setViewTwoFA] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Profile image upload
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);

  // Stripe toggle
  const [stripeEnabled, setStripeEnabled] = useState(false);

  // Profile image handlers
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

  // Show 2FA view if active
  if (viewTwoFA) {
    return <TwoFactorAuth onBack={() => setViewTwoFA(false)} />;
  }

  return (
    <>
      {showChangePasswordModal && (
        <ChangePasswordModal onClose={() => setShowChangePasswordModal(false)} />
      )}

      <div className="min-h-screen bg-gray-100 py-10 px-4">
        <div className="container mx-auto">
          <div className="bg-white rounded shadow p-6 flex flex-col md:flex-row">
            {/* Left: Profile Image Upload */}
            <div className="w-full md:w-1/3 flex flex-col items-center mb-6 md:mb-0 md:pr-8 border-b md:border-b-0 md:border-r border-gray-200">
              <div
                className="relative w-32 h-32 rounded-full bg-gray-200 cursor-pointer overflow-hidden flex items-center justify-center"
                onClick={handleProfileClick}
              >
                {/* Profile Image or Default Icon */}
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

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Teal plus icon overlay (bottom-right) */}
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

            {/* Right: Collapsible Sections */}
            <div className="w-full md:w-2/3 md:pl-8">
              {/* PERSONAL INFORMATION */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setShowPersonal(!showPersonal)}
                >
                  <h2 className="text-lg font-semibold text-[#039994]">
                    Personal Information
                  </h2>
                  {showPersonal ? (
                    <FaChevronUp className="text-gray-500" />
                  ) : (
                    <FaChevronDown className="text-gray-500" />
                  )}
                </div>
                {showPersonal && (
                  <div className="mt-4 space-y-4">
                    {/* Name Fields */}
                    <div className="flex flex-wrap md:flex-nowrap gap-4">
                      {/* First Name */}
                      <div className="w-full md:w-1/2">
                        <label className="text-sm text-gray-700 mb-1 block">
                          First Name
                        </label>
                        <input
                          type="text"
                          className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none"
                          placeholder="First name"
                        />
                      </div>
                      {/* Last Name */}
                      <div className="w-full md:w-1/2">
                        <label className="text-sm text-gray-700 mb-1 block">
                          Last Name
                        </label>
                        <input
                          type="text"
                          className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none"
                          placeholder="Last name"
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="text-sm text-gray-700 mb-1 block">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none"
                        placeholder="e.g. name@domain.com"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="text-sm text-gray-700 mb-1 block">
                        Address
                      </label>
                      <input
                        type="text"
                        className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none"
                        placeholder="e.g. Street, Country, State"
                      />
                    </div>

                    {/* Phone Number (Country Code + Main Input) */}
                    <div>
                      <label className="text-sm text-gray-700 mb-1 block">
                        Phone number
                      </label>
                      <div className="flex flex-wrap md:flex-nowrap gap-2">
                        {/* Country Code (editable) */}
                        <input
                          type="text"
                          defaultValue="+234"
                          className="border border-gray-300 rounded px-3 py-2 focus:outline-none w-full md:w-1/4"
                        />
                        {/* Main phone input */}
                        <input
                          type="tel"
                          className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none"
                          placeholder="000-0000-000"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ACCOUNT INFORMATION */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setShowAccount(!showAccount)}
                >
                  <h2 className="text-lg font-semibold text-[#039994]">
                    Account Information
                  </h2>
                  {showAccount ? (
                    <FaChevronUp className="text-gray-500" />
                  ) : (
                    <FaChevronDown className="text-gray-500" />
                  )}
                </div>
                {showAccount && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm">
                        Connect with Stripe (or Third party payment service)
                      </span>
                      <ToggleSwitch
                        enabled={stripeEnabled}
                        onChange={setStripeEnabled}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* PREFERENCES */}
              <div>
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setShowPreferences(!showPreferences)}
                >
                  <h2 className="text-lg font-semibold text-[#039994]">
                    Preferences
                  </h2>
                  {showPreferences ? (
                    <FaChevronUp className="text-gray-500" />
                  ) : (
                    <FaChevronDown className="text-gray-500" />
                  )}
                </div>
                {showPreferences && (
                  <div className="mt-4 space-y-2">
                    <button
                      className="text-sm text-gray-700 hover:text-[#039994] focus:outline-none block"
                      onClick={() => setViewTwoFA(true)}
                    >
                      2F Authentication
                    </button>
                    <button
                      className="text-sm text-gray-700 hover:text-[#039994] focus:outline-none block"
                      onClick={() => setShowChangePasswordModal(true)}
                    >
                      Change Password
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyAccount;
