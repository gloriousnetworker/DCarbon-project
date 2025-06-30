"use client";

import React, { useEffect, useState } from "react";
import { FaBars, FaSearch, FaBell, FaHeadset } from "react-icons/fa";

const DashboardNavbar = ({
  toggleSidebar,
  selectedSection,
  sectionDisplayMap,
  onSectionChange,
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationDot, setShowNotificationDot] = useState(false);
  const [isOperator, setIsOperator] = useState(false);

  useEffect(() => {
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

  return (
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
  );
};

export default DashboardNavbar;
