import React from "react";
import { FaBars, FaSearch, FaBell, FaHeadset } from "react-icons/fa";

const DashboardNavbar = ({ toggleSidebar, selectedSection, sectionDisplayMap }) => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-full px-4 py-3 flex items-center justify-between">
        {/* Left side: Hamburger (mobile) + current section title + Operator pending button */}
        <div className="flex items-center space-x-4">
          <button className="md:hidden" onClick={toggleSidebar}>
            <FaBars className="text-gray-700" size={20} />
          </button>
          {/* Updated header text style from pageTitle */}
          <h1 className="font-[550] text-[16px] leading-[50%] tracking-[-0.05em] text-[#1E1E1E] font-sfpro text-center">
            {sectionDisplayMap[selectedSection]}
          </h1>
          {/* Yellow Operator Pending button with consistent font styling */}
          <button className="bg-[#FFC107] text-black px-4 py-1.5 rounded-full text-sm font-medium font-sfpro">
            Operator pending
          </button>
        </div>

        {/* Middle: Search bar */}
        <div className="flex-1 flex justify-center mx-4">
          <div className="relative w-full max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center">
              <div className="bg-[#039994] h-full px-3 flex items-center justify-center rounded-l-md">
                <FaSearch className="text-white" size={14} />
              </div>
            </span>
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-12 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#039994]"
            />
          </div>
        </div>

        {/* Right side: Notification & Support icons */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <FaBell className="text-[#039994]" size={20} />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500" />
          </div>
          <FaHeadset className="text-[#039994]" size={20} />
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
