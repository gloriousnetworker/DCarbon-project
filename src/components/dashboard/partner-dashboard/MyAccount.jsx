import React, { useState } from 'react';
import { FaUser, FaCamera } from 'react-icons/fa';
import { HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';

const MyAccount = () => {
  // State to toggle Contact Information accordion
  const [isContactOpen, setIsContactOpen] = useState(false);
  // State for 2FA toggle
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);

  return (
    <div className="bg-white p-6 rounded-lg shadow w-full">
      {/* Top Section: Avatar + (Optional) Title */}
      <div className="flex items-start space-x-6">
        {/* Avatar Container */}
        <div className="relative w-24 h-24">
          {/* Large Circle with user icon */}
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-4xl overflow-hidden">
            <FaUser />
          </div>
          {/* Camera Icon in bottom-right corner */}
          <div className="absolute bottom-0 right-2 bg-white p-1 rounded-full shadow cursor-pointer">
            <FaCamera className="text-[#039994]" />
          </div>
        </div>

        {/* (Optional) Title / Intro text */}
        {/* If you have additional text or headings near the avatar, place them here. */}
      </div>

      {/* Spacing below top section */}
      <div className="mt-6" />

      {/* Company Information Section */}
      <div>
        {/* Heading in green */}
        <div className="flex items-center justify-between cursor-pointer">
          <h2 className="text-lg font-semibold text-[#039994]">
            Company Information
          </h2>
          {/* If you want an arrow or something for expand/collapse, you can put it here.
              For now, let's assume "Company Information" is always open. */}
        </div>
        {/* Horizontal line */}
        <hr className="my-3" />

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Company Name
            </label>
            <input
              type="text"
              placeholder="First name"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-[#039994]"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="e.g name@domain.com"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-[#039994]"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Phone number
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="+234"
                className="w-16 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-[#039994]"
              />
              <input
                type="text"
                placeholder="e.g. 000-0000-000"
                className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-[#039994]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Address
            </label>
            <input
              type="text"
              placeholder="e.g. Company address"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-[#039994]"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Website
            </label>
            <input
              type="text"
              placeholder="e.g. http://"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-[#039994]"
            />
          </div>
        </div>
      </div>

      {/* Contact Information Section (Accordion Style) */}
      <div className="mt-8">
        {/* Header */}
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsContactOpen(!isContactOpen)}
        >
          <h2 className="text-lg font-semibold text-[#039994]">
            Contact information
          </h2>
          {isContactOpen ? (
            <HiOutlineChevronUp className="text-gray-600" />
          ) : (
            <HiOutlineChevronDown className="text-gray-600" />
          )}
        </div>
        {/* Horizontal line */}
        <hr className="my-3" />

        {/* Collapsible Content */}
        {isContactOpen && (
          <div className="space-y-4">
            {/* Insert any contact info fields or text you want here */}
            <p className="text-sm text-gray-600">
              {/* Example placeholder content */}
              You can place additional contact details here, such as an alternate phone,
              fax number, or email. This collapses when the arrow is toggled.
            </p>
          </div>
        )}
      </div>

      {/* Preferences Section */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-[#039994]">Preferences</h2>
        <hr className="my-3" />

        {/* 2F Authentication Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">2F Authentication</span>
          {/* Toggle Switch */}
          <button
            type="button"
            onClick={() => setIs2FAEnabled(!is2FAEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              is2FAEnabled ? 'bg-[#039994]' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                is2FAEnabled ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
