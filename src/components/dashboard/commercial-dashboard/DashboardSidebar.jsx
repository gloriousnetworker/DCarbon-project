"use client";

import React, { useState, useEffect } from "react";
import { FiHome, FiTrendingUp, FiUser, FiBell, FiHelpCircle, FiHeadphones, FiLogOut, FiZap } from "react-icons/fi";
import Image from "next/image";
import { useProfile } from "../contexts/ProfileContext";

const DashboardSidebar = ({
  onSectionChange,
  selectedSection = "overview",
  toggleSidebar,
  hasPendingActions = false,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { profile } = useProfile();

  useEffect(() => {
    setIsClient(true);
    const storedNotifications = localStorage.getItem("notifications");
    if (storedNotifications) {
      const notifications = JSON.parse(storedNotifications);
      setUnreadCount(notifications.filter((n) => !n.isRead).length);
    }
  }, []);

  const isActive = (section) => section === selectedSection;

  return (
    <aside className="bg-white w-64 min-h-screen flex flex-col border-r border-gray-200 overflow-y-auto hide-scrollbar">
      {toggleSidebar && (
        <div className="md:hidden flex justify-end p-4">
          <button
            onClick={toggleSidebar}
            className="text-gray-700 hover:text-gray-900 text-2xl"
          >
            &times;
          </button>
        </div>
      )}

      <div className="flex justify-center p-4">
        <Image 
          src="/dashboard_images/logo.png"
          alt="Company Logo"
          width={120}
          height={40}
          className="h-8 w-auto"
        />
      </div>

      <div className="px-4 py-2">
        <h3 className="text-xs font-sfpro font-normal tracking-[0.2em] text-[#1E1E1E] uppercase">DASHBOARD</h3>
      </div>

      <nav className="flex-1 flex flex-col space-y-1 px-2">
        <button
          onClick={() => onSectionChange("overview")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md w-full text-left transition-colors text-sm font-sfpro ${
            isActive("overview") ? 'bg-[#039994] text-white' : 'text-[#1E1E1E] hover:bg-gray-100'
          }`}
        >
          <FiHome className="w-4 h-4" color={isActive("overview") ? "#FFFFFF" : "#039994"} />
          <span>Overview</span>
        </button>
        <button
          onClick={() => onSectionChange("generatorManagement")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md w-full text-left transition-colors text-sm font-sfpro ${
            isActive("generatorManagement") ? 'bg-[#039994] text-white' : 'text-[#1E1E1E] hover:bg-gray-100'
          }`}
        >
          <FiZap className="w-4 h-4" color={isActive("generatorManagement") ? "#FFFFFF" : "#039994"} />
          <span>Generator Management</span>
        </button>
        <button
          onClick={() => onSectionChange("report")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md w-full text-left transition-colors text-sm font-sfpro ${
            isActive("report") ? 'bg-[#039994] text-white' : 'text-[#1E1E1E] hover:bg-gray-100'
          }`}
        >
          <FiTrendingUp className="w-4 h-4" color={isActive("report") ? "#FFFFFF" : "#039994"} />
          <span>Report</span>
        </button>
      </nav>

      <hr className="my-2 border-gray-200 mx-4" />

      <div className="px-4 py-2">
        <h3 className="text-xs font-sfpro font-normal tracking-[0.2em] text-[#1E1E1E] uppercase">SETTINGS</h3>
      </div>

      <nav className="flex-1 flex flex-col space-y-1 px-2">
        <button
          onClick={() => onSectionChange("myAccount")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md w-full text-left transition-colors text-sm font-sfpro ${
            isActive("myAccount") ? 'bg-[#039994] text-white' : 'text-[#1E1E1E] hover:bg-gray-100'
          }`}
        >
          <FiUser className="w-4 h-4" color={isActive("myAccount") ? "#FFFFFF" : "#039994"} />
          <span>My Account</span>
        </button>
        <button
          onClick={() => onSectionChange("notifications")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md w-full text-left transition-colors text-sm font-sfpro ${
            isActive("notifications") ? 'bg-[#039994] text-white' : 'text-[#1E1E1E] hover:bg-gray-100'
          }`}
        >
          <div className="relative">
            <FiBell className="w-4 h-4" color={isActive("notifications") ? "#FFFFFF" : "#039994"} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <span>Notification</span>
        </button>
      </nav>

      <hr className="my-2 border-gray-200 mx-4" />

      <div className="px-4 py-2">
        <h3 className="text-xs font-sfpro font-normal tracking-[0.2em] text-[#1E1E1E] uppercase">SUPPORT</h3>
      </div>

      <nav className="flex-1 flex flex-col space-y-1 px-2">
        <button
          onClick={() => onSectionChange("helpCenter")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md w-full text-left transition-colors text-sm font-sfpro ${
            isActive("helpCenter") ? 'bg-[#039994] text-white' : 'text-[#1E1E1E] hover:bg-gray-100'
          }`}
        >
          <FiHelpCircle className="w-4 h-4" color={isActive("helpCenter") ? "#FFFFFF" : "#039994"} />
          <span>Help Centre (FAQs)</span>
        </button>
        <button
          onClick={() => onSectionChange("contactSupport")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md w-full text-left transition-colors text-sm font-sfpro ${
            isActive("contactSupport") ? 'bg-[#039994] text-white' : 'text-[#1E1E1E] hover:bg-gray-100'
          }`}
        >
          <FiHeadphones className="w-4 h-4" color={isActive("contactSupport") ? "#FFFFFF" : "#039994"} />
          <span>Contact Support</span>
        </button>
      </nav>

      <hr className="my-2 border-gray-200 mx-4" />

      <div className="px-4 py-3 flex flex-col items-start">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 rounded-full overflow-hidden relative">
            {profile.picture ? (
              <Image
                src={profile.picture}
                alt="User profile"
                width={32}
                height={32}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/dashboard_images/profile_image.png';
                }}
                unoptimized={true}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <FiUser className="text-gray-500" />
              </div>
            )}
          </div>
          <div className="flex items-center">
            <span className="text-[#1E1E1E] font-sfpro text-sm">Hi, </span>
            <span className="text-[#1E1E1E] font-sfpro text-sm font-semibold">{profile.firstName}</span>
            <span className="w-2 h-2 rounded-full bg-[#039994] ml-2"></span>
          </div>
        </div>
        <button
          onClick={() => onSectionChange("logout")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md w-full text-left transition-colors text-sm font-sfpro ${
            isActive("logout") ? 'bg-[#039994] text-white' : 'text-[#1E1E1E] hover:bg-gray-100'
          }`}
        >
          <FiLogOut className="w-4 h-4" color={isActive("logout") ? "#FFFFFF" : "#039994"} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;