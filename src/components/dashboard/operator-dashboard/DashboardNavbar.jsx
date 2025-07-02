"use client";

import React, { useEffect, useState } from "react";
import { FaBars, FaSearch, FaBell, FaHeadset } from "react-icons/fa";
import CommercialRegistrationModal from "./overview/modals/createfacility/CommercialRegistrationModal";

const DashboardNavbar = ({
  toggleSidebar,
  selectedSection,
  sectionDisplayMap,
  onSectionChange,
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationDot, setShowNotificationDot] = useState(false);
  const [isOperator, setIsOperator] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("loginResponse");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setRegistrationStep(userData.data.user.registrationStep || 1);
    }

    const storedNotifications = localStorage.getItem("notifications");
    if (storedNotifications) {
      const notifications = JSON.parse(storedNotifications);
      const unread = notifications.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
      setShowNotificationDot(unread > 0);
    }
    const operatorFlag = JSON.parse(localStorage.getItem("isPartnerOperator") || "false");
    setIsOperator(operatorFlag);
    const handleStorageChange = (e) => {
      if (e.key === "notifications") {
        const notifications = JSON.parse(e.newValue);
        const unread = notifications.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
        setShowNotificationDot(unread > 0);
        if (unread > unreadCount) flashNotificationDot();
      }
      if (e.key === "isPartnerOperator") {
        setIsOperator(JSON.parse(e.newValue));
      }
      if (e.key === "loginResponse") {
        const userData = JSON.parse(e.newValue);
        setRegistrationStep(userData.data.user.registrationStep || 1);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [unreadCount]);

  const flashNotificationDot = () => {
    let flashCount = 0;
    const maxFlashes = 3;
    const interval = setInterval(() => {
      setShowNotificationDot((prev) => !prev);
      flashCount++;
      if (flashCount >= maxFlashes * 2) {
        clearInterval(interval);
        setShowNotificationDot(true);
      }
    }, 300);
  };

  const getProgressWidth = () => `${(registrationStep / 5) * 100}%`;

  const getProgressColor = () => {
    switch(registrationStep) {
      case 1: return "bg-blue-500";
      case 2: return "bg-purple-500";
      case 3: return "bg-yellow-500";
      case 4: return "bg-orange-500";
      case 5: return "bg-green-500";
      default: return "bg-[#039994]";
    }
  };

  const getTooltipText = () => {
    switch(registrationStep) {
      case 1: return "Initial Commercial Registration completed";
      case 2: return "Commercial Owner's details completed";
      case 3: return "Agreements have been completed";
      case 4: return "Finance Information has been completed";
      case 5: return "Utility Authorization completed. You can now generate facilities";
      default: return `Complete registration step ${registrationStep} of 5`;
    }
  };

  const handleProgressClick = () => {
    setShowRegistrationModal(true);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-full px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="md:hidden" onClick={toggleSidebar}>
              <FaBars className="text-gray-700" size={20} />
            </button>
            <h1 className="font-[550] text-[16px] leading-[50%] tracking-[-0.05em] text-[#1E1E1E] font-sfpro text-center">
              {sectionDisplayMap[selectedSection]}
            </h1>
            {isOperator && (
              <span className="ml-2 px-2 py-1 rounded-md text-xs font-semibold bg-[#039994] text-white">
                Operator
              </span>
            )}
          </div>

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

          <div className="flex items-center space-x-6">
            <div className="relative group">
              <div 
                className="cursor-pointer px-4 py-2 bg-gray-100 rounded-md flex items-center hover:bg-gray-200 transition-colors"
                onClick={handleProgressClick}
              >
                <div className="w-32 h-2 bg-gray-200 rounded-full mr-3">
                  <div
                    className={`h-2 rounded-full ${getProgressColor()}`}
                    style={{ width: getProgressWidth() }}
                  ></div>
                </div>
                <span className="text-xs font-medium">
                  Step {registrationStep} of 5
                </span>
              </div>
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 transform hidden group-hover:block">
                <div className="relative bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                  {getTooltipText()}
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></span>
                </div>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => onSectionChange("notifications")}
                className="focus:outline-none relative"
              >
                <FaBell className="text-[#039994]" size={20} />
                {showNotificationDot && unreadCount > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 animate-ping" />
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => onSectionChange("contactSupport")}
              className="focus:outline-none"
            >
              <FaHeadset className="text-[#039994]" size={20} />
            </button>
          </div>
        </div>
      </header>

      <CommercialRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onBack={() => setShowRegistrationModal(false)}
      />
    </>
  );
};

export default DashboardNavbar;