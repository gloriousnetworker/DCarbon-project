import React, { useState, useEffect } from "react";
import {
  FiHome,
  FiTrendingUp,
  FiLayers,
  FiUser,
  FiBell,
  FiHelpCircle,
  FiHeadphones,
  FiLogOut,
} from "react-icons/fi";
import { FiZap, FiSend } from "react-icons/fi"; // Updated icons
import Image from "next/image";

const DashboardSidebar = ({
  onSectionChange,
  selectedSection = "overview",
  toggleSidebar,
  hasPendingActions = false, // New prop to control the indicator
}) => {
  const [isClient, setIsClient] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [firstName, setFirstName] = useState('User');

  useEffect(() => {
    setIsClient(true);
    // Load from localStorage only on client side
    const storedFirstName = localStorage.getItem('userFirstName');
    const storedProfilePicture = localStorage.getItem('userProfilePicture');
    
    if (storedFirstName) {
      try {
        setFirstName(JSON.parse(storedFirstName));
      } catch {
        setFirstName(storedFirstName);
      }
    }
    
    if (storedProfilePicture) {
      try {
        setProfilePicture(JSON.parse(storedProfilePicture));
      } catch {
        setProfilePicture(storedProfilePicture);
      }
    }
  }, []);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'userFirstName') {
        try {
          setFirstName(e.newValue ? JSON.parse(e.newValue) : 'User');
        } catch {
          setFirstName(e.newValue || 'User');
        }
      }
      if (e.key === 'userProfilePicture') {
        try {
          setProfilePicture(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {
          setProfilePicture(e.newValue || null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Helper to check if a section is active
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
  const pendingDot = 'w-2 h-2 rounded-full bg-[#FF0000] ml-2';

  if (!isClient) {
    // Return a skeleton loader during SSR
    return (
      <aside className={sidebarContainer}>
        {/* Skeleton content that matches the layout */}
        <div className="flex justify-center p-4">
          <div className="h-8 w-[120px] bg-gray-200 rounded"></div>
        </div>
        {/* Add more skeleton elements as needed */}
      </aside>
    );
  }

  return (
    <aside className={sidebarContainer}>
      {/* Mobile Close Button */}
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

      {/* Logo at the top */}
      <div className="flex justify-center p-4">
        <Image 
          src="/dashboard_images/logo.png"
          alt="Company Logo"
          width={120}
          height={40}
          className="h-8 w-auto"
        />
      </div>

      {/* DASHBOARD heading */}
      <div className={sidebarSection}>
        <h3 className={sectionHeading}>
          DASHBOARD
        </h3>
      </div>

      {/* Dashboard Menu Items */}
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
          onClick={() => onSectionChange("generatorManagement")}
          className={`${menuItemBase} ${
            isActive("generatorManagement") ? menuItemActive : menuItemInactive
          }`}
        >
          <FiZap className={iconBase} color={isActive("generatorManagement") ? "#FFFFFF" : "#039994"} />
          <span>Generator Management</span>
        </button>
        <button
          onClick={() => onSectionChange("report")}
          className={`${menuItemBase} ${
            isActive("report") ? menuItemActive : menuItemInactive
          }`}
        >
          <FiTrendingUp className={iconBase} color={isActive("report") ? "#FFFFFF" : "#039994"} />
          <span>Report</span>
        </button>
        <button
          onClick={() => onSectionChange("pendingActions")}
          className={`${menuItemBase} ${
            isActive("pendingActions") ? menuItemActive : menuItemInactive
          }`}
        >
          <FiSend className={iconBase} color={isActive("pendingActions") ? "#FFFFFF" : "#039994"} />
          <span className="flex items-center">
            Pending Actions
            {hasPendingActions && <span className={pendingDot}></span>}
          </span>
        </button>
      </nav>

      {/* Divider */}
      <hr className={sidebarDivider} />

      {/* SETTINGS heading */}
      <div className={sidebarSection}>
        <h3 className={sectionHeading}>
          SETTINGS
        </h3>
      </div>

      {/* Settings Items */}
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

      {/* Divider */}
      <hr className={sidebarDivider} />

      {/* SUPPORT heading */}
      <div className={sidebarSection}>
        <h3 className={sectionHeading}>
          SUPPORT
        </h3>
      </div>

      {/* Support Items */}
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

      {/* Divider */}
      <hr className={sidebarDivider} />

      {/* Bottom User Info & Logout */}
      <div className={userInfoContainer}>
        <div className={userProfile}>
          <div className="w-8 h-8 rounded-full overflow-hidden relative">
            {profilePicture ? (
              <Image
                src={profilePicture}
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
            <span className={userName}>{firstName}</span>
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