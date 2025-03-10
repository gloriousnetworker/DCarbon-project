import React from "react";
import { FaBars, FaSearch, FaBell, FaHeadset } from "react-icons/fa";

const DashboardNavbar = ({ toggleSidebar }) => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-full px-4 py-3 flex items-center justify-between">
        {/* Left side: Hamburger (mobile) + "Overview" text */}
        <div className="flex items-center space-x-4">
          {/* Hamburger menu: visible only on mobile */}
          <button className="md:hidden" onClick={toggleSidebar}>
            <FaBars className="text-gray-700" size={20} />
          </button>
          {/* Overview text */}
          <h1 className="text-xl font-semibold text-gray-800">Overview</h1>
        </div>

        {/* Middle: Search bar */}
        <div className="flex-1 flex justify-center mx-4">
          <div className="relative w-full max-w-md">
            {/* Green search icon container */}
            <span className="absolute inset-y-0 left-0 flex items-center">
              <div className="bg-[#039994] h-full px-3 flex items-center justify-center rounded-l-md">
                <FaSearch className="text-white" size={14} />
              </div>
            </span>
            {/* Input field */}
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-12 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#039994]"
            />
          </div>
        </div>

        {/* Right side: notification + support icons */}
        <div className="flex items-center space-x-6">
          {/* Notification icon with a red dot for unread notifications */}
          <div className="relative">
            <FaBell className="text-[#039994]" size={20} />
            {/* Red dot - shown if there is an unread notification */}
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500" />
          </div>

          {/* Contact Support icon */}
          <FaHeadset className="text-[#039994]" size={20} />
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
