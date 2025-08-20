"use client";
import React, { useEffect, useState } from "react";
import { FaBars, FaSearch, FaBell, FaHeadset, FaComments } from "react-icons/fa";
import FeedbackModal from "./FeedbackModal";

const DashboardNavbar = ({
  toggleSidebar,
  selectedSection,
  sectionDisplayMap,
  onSectionChange,
}) => {
  const [partnerType, setPartnerType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationDot, setShowNotificationDot] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const userId = localStorage.getItem('userId');
        const authToken = localStorage.getItem('authToken');
        
        if (!userId || !authToken) {
          const storedPartnerType = localStorage.getItem('partnerType');
          if (storedPartnerType) {
            setPartnerType(storedPartnerType);
          }
          setIsLoading(false);
          return;
        }
        
        const response = await fetch(
          `https://services.dcarbon.solutions/api/user/partner/user/${userId}`,
          { headers: { 'Authorization': `Bearer ${authToken}` } }
        );
        
        if (!response.ok) throw new Error('Failed to fetch user data');
        
        const responseData = await response.json();
        
        if (responseData.status === 'success' && responseData.data) {
          setPartnerType(responseData.data.partnerType);
          localStorage.setItem('partnerType', responseData.data.partnerType);
        } else {
          const storedPartnerType = localStorage.getItem('partnerType');
          if (storedPartnerType) setPartnerType(storedPartnerType);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        const storedPartnerType = localStorage.getItem('partnerType');
        if (storedPartnerType) setPartnerType(storedPartnerType);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();

    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      const notifications = JSON.parse(storedNotifications);
      const unread = notifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
      setShowNotificationDot(unread > 0);
    }
  }, []);

  const getDisplayPartnerType = (type) => {
    switch(type) {
      case 'sales_agent': return 'Sales Agent';
      case 'finance_company': return 'Finance Company';
      case 'installer': return 'Installer';
      default: return 'Partner';
    }
  };

  const handleFeedbackClick = () => {
    setShowFeedbackModal(true);
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
            {isLoading ? (
              <div className="bg-gray-200 text-gray-500 px-2 py-1.5 rounded-full text-[10px] font-medium font-sfpro">
                Loading...
              </div>
            ) : partnerType ? (
              <button className="bg-[#1E1E1E] text-white px-2 py-1.5 rounded-full text-[10px] font-medium font-sfpro">
                {getDisplayPartnerType(partnerType)}
              </button>
            ) : null}
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
              <button
                onClick={handleFeedbackClick}
                className="focus:outline-none text-[#039994] hover:text-[#02857f] transition-colors"
              >
                <FaComments size={20} />
              </button>
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 transform hidden group-hover:block">
                <div className="relative bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                  Feature Suggestion
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></span>
                </div>
              </div>
            </div>

            <div className="relative group">
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
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 transform hidden group-hover:block">
                <div className="relative bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                  Notifications
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></span>
                </div>
              </div>
            </div>
            
            <div className="relative group">
              <button
                onClick={() => onSectionChange("contactSupport")}
                className="focus:outline-none"
              >
                <FaHeadset className="text-[#039994]" size={20} />
              </button>
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 transform hidden group-hover:block">
                <div className="relative bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                  Contact Support
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </>
  );
};

export default DashboardNavbar;