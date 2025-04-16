// app/components/DashboardSidebar.js
'use client';

import React, { useState, useEffect } from "react";
import {
  FiHome,
  FiTrendingUp,
  FiUser,
  FiBell,
  FiHelpCircle,
  FiHeadphones,
  FiLogOut,
} from "react-icons/fi";
import { FiZap } from "react-icons/fi";
import Image from "next/image";
import { useProfile } from "../contexts/ProfileContext";

const DashboardSidebar = ({
  onSectionChange,
  selectedSection = "overview",
  toggleSidebar,
  hasPendingActions = false,
}) => {
  const [isClient, setIsClient] = useState(false);
  const { profile } = useProfile();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isActive = (section) => section === selectedSection;

  // Style constants
  const sidebarContainer = 'bg-white w-64 min-h-screen flex flex-col border-r border-gray-200 overflow-y-auto hide-scrollbar';
  const sidebarSection = 'px-4 py-2';
  const sidebarDivider = 'my-2 border-gray-200 mx-4';
  const sectionHeading = 'text-xs font-sfpro font-normal tracking-[0.2em] text-[#1E1E1E] uppercase';
  
  const menuItemBase = 'flex items-center gap-2 px-4 py-2 rounded-md w-full text-left transition-colors text-sm font-sfpro';
  const menuItemActive = 'bg-[#039994] text-white';
  const menuItemInactive = 'text-[#1E1E1E] hover:bg-gray-100';
  const iconBase = 'w-4 h-4';
  
  const userInfoContainer = 'px-4 py-3 flex flex-col items-start';
  const userProfile = 'flex items-center space-x-3 mb-3';
  const greetingText = 'text-[#1E1E1E] font-sfpro text-sm';
  const userName = 'text-[#1E1E1E] font-sfpro text-sm font-semibold';
  const activeDot = 'w-2 h-2 rounded-full bg-[#039994] ml-2';

  if (!isClient) {
    return (
      <aside className={sidebarContainer}>
        <div className="flex justify-center p-4">
          <div className="h-8 w-[120px] bg-gray-200 rounded"></div>
        </div>
      </aside>
    );
  }

  return (
    <aside className={sidebarContainer}>
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

      <div className={sidebarSection}>
        <h3 className={sectionHeading}>DASHBOARD</h3>
      </div>

      <nav className="flex-1 flex flex-col space-y-1 px-2">
        <button
          onClick={() => onSectionChange("overview")}
          className={`${menuItemBase} ${
            isActive("overview") ? menuItemActive : menuItemInactive
          }`}
        >
          <FiHome className={iconBase} color={isActive("overview") ? "#FFFFFF" : "#039994"} />
          <span>Overview</span>
        </button>
        <button
          onClick={() => onSectionChange("transaction")}
          className={`${menuItemBase} ${
            isActive("transaction") ? menuItemActive : menuItemInactive
          }`}
        >
          <FiZap className={iconBase} color={isActive("transaction") ? "#FFFFFF" : "#039994"} />
          <span>Transaction</span>
        </button>
        <button
          onClick={() => onSectionChange("residentialManagement")}
          className={`${menuItemBase} ${
            isActive("residentialManagement") ? menuItemActive : menuItemInactive
          }`}
        >
          <FiTrendingUp className={iconBase} color={isActive("residentialManagement") ? "#FFFFFF" : "#039994"} />
          <span>Residential Management</span>
        </button>
      </nav>

      <hr className={sidebarDivider} />

      <div className={sidebarSection}>
        <h3 className={sectionHeading}>SETTINGS</h3>
      </div>

      <nav className="flex-1 flex flex-col space-y-1 px-2">
        <button
          onClick={() => onSectionChange("myAccount")}
          className={`${menuItemBase} ${
            isActive("myAccount") ? menuItemActive : menuItemInactive
          }`}
        >
          <FiUser className={iconBase} color={isActive("myAccount") ? "#FFFFFF" : "#039994"} />
          <span>My Account</span>
        </button>
        <button
          onClick={() => onSectionChange("notifications")}
          className={`${menuItemBase} ${
            isActive("notifications") ? menuItemActive : menuItemInactive
          }`}
        >
          <FiBell className={iconBase} color={isActive("notifications") ? "#FFFFFF" : "#039994"} />
          <span>Notification</span>
        </button>
      </nav>

      <hr className={sidebarDivider} />

      <div className={sidebarSection}>
        <h3 className={sectionHeading}>SUPPORT</h3>
      </div>

      <nav className="flex-1 flex flex-col space-y-1 px-2">
        <button
          onClick={() => onSectionChange("helpCenter")}
          className={`${menuItemBase} ${
            isActive("helpCenter") ? menuItemActive : menuItemInactive
          }`}
        >
          <FiHelpCircle className={iconBase} color={isActive("helpCenter") ? "#FFFFFF" : "#039994"} />
          <span>Help Centre (FAQs)</span>
        </button>
        <button
          onClick={() => onSectionChange("contactSupport")}
          className={`${menuItemBase} ${
            isActive("contactSupport") ? menuItemActive : menuItemInactive
          }`}
        >
          <FiHeadphones className={iconBase} color={isActive("contactSupport") ? "#FFFFFF" : "#039994"} />
          <span>Contact Support</span>
        </button>
      </nav>

      <hr className={sidebarDivider} />

      <div className={userInfoContainer}>
        <div className={userProfile}>
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
            <span className={greetingText}>Hi, </span>
            <span className={userName}>{profile.firstName}</span>
            <span className={activeDot}></span>
          </div>
        </div>
        <button
          onClick={() => onSectionChange("logout")}
          className={`${menuItemBase} ${
            isActive("logout") ? menuItemActive : menuItemInactive
          }`}
        >
          <FiLogOut className={iconBase} color={isActive("logout") ? "#FFFFFF" : "#039994"} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;