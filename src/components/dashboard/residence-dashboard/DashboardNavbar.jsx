"use client";
import React, { useEffect, useState } from "react";
import { FaBars, FaSearch, FaBell, FaHeadset, FaComments } from "react-icons/fa";
import FinanceAndInstallerModal from "./overview/modals/createfacility/FinanceAndInstallerModal";
import ResidenceTermsAndAgreementModal from "./overview/modals/createfacility/ResidenceTermsAndAgreementModal";
import UtilityAuthorizationModal from "./overview/modals/createfacility/UtilityAuthorizationModal";
import AddResidenceFacilityModal from "./overview/modals/createfacility/AddResidentialFacilityModal";
import FeedbackModal from "./FeedbackModal";

const DashboardNavbar = ({
  toggleSidebar,
  selectedSection,
  sectionDisplayMap,
  onSectionChange,
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationDot, setShowNotificationDot] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const [nextStage, setNextStage] = useState(2);
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showUtilityModal, setShowUtilityModal] = useState(false);
  const [showResidenceModal, setShowResidenceModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [notificationCheckInterval, setNotificationCheckInterval] = useState(null);

  const fetchNotifications = async () => {
    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;

      if (!userId || !authToken) return;

      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/notifications/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success' && result.data) {
          const unreadNotifications = result.data.filter(notification => !notification.isRead);
          const unreadCount = unreadNotifications.length;
          setUnreadCount(unreadCount);
          setShowNotificationDot(unreadCount > 0);
          localStorage.setItem('notifications', JSON.stringify(result.data));
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const checkStage2Completion = async (userId, authToken) => {
    try {
      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/financial-info/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      const result = await response.json();
      return result.status === 'success' && result.data?.financialInfo;
    } catch (error) {
      return false;
    }
  };

  const checkStage3Completion = async (userId, authToken) => {
    try {
      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/agreement/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      const result = await response.json();
      return result.status === 'success' && result.data?.termsAccepted;
    } catch (error) {
      return false;
    }
  };

  const checkStage4Completion = async (userId, authToken) => {
    try {
      const response = await fetch(
        `https://services.dcarbon.solutions/api/auth/user-meters/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      const result = await response.json();
      return result.status === 'success' && result.data?.length > 0;
    } catch (error) {
      return false;
    }
  };

  const checkUserProgress = async () => {
    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;
      if (!userId || !authToken) return;

      const stageChecks = [
        { stage: 2, check: () => checkStage2Completion(userId, authToken) },
        { stage: 3, check: () => checkStage3Completion(userId, authToken) },
        { stage: 4, check: () => checkStage4Completion(userId, authToken) }
      ];

      let highestCompletedStage = 1;
      for (const { stage, check } of stageChecks) {
        const isCompleted = await check();
        if (isCompleted) {
          highestCompletedStage = stage;
        }
      }

      const newStage = highestCompletedStage === 4 ? 4 : highestCompletedStage;
      const newNextStage = highestCompletedStage === 4 ? 4 : highestCompletedStage + 1;
      
      setCurrentStage(newStage);
      setNextStage(newNextStage);
    } catch (error) {
      console.error('Error checking user progress:', error);
    }
  };

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

  useEffect(() => {
    fetchNotifications();
    checkUserProgress();

    const notificationInterval = setInterval(fetchNotifications, 30000);
    setNotificationCheckInterval(notificationInterval);
    const progressInterval = setInterval(checkUserProgress, 15000);

    const handleStorageChange = (e) => {
      if (e.key === "notifications") {
        const notifications = JSON.parse(e.newValue || '[]');
        const unread = notifications.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
        setShowNotificationDot(unread > 0);
        if (unread > unreadCount) {
          flashNotificationDot();
        }
      } else if (e.key === "loginResponse") {
        checkUserProgress();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (notificationCheckInterval) {
        clearInterval(notificationCheckInterval);
      }
      clearInterval(progressInterval);
    };
  }, []);

  const handleProgressClick = () => {
    if (currentStage === 1) setShowFinanceModal(true);
    else if (currentStage === 2) setShowTermsModal(true);
    else if (currentStage === 3) setShowUtilityModal(true);
    else if (currentStage === 4) setShowResidenceModal(true);
  };

  const handleModalClose = () => {
    setShowFinanceModal(false);
    setShowTermsModal(false);
    setShowUtilityModal(false);
    setShowResidenceModal(false);
    checkUserProgress();
  };

  const handleFeedbackClick = () => {
    setShowFeedbackModal(true);
  };

  const getTooltipText = () => {
    const texts = [
      "Dashboard access completed",
      "Financial information completed",
      "Terms and conditions signed",
      "Utility authorization completed"
    ];
    return texts[currentStage - 1] || `Stage ${currentStage} completed`;
  };

  const getProgressBarSegments = () => {
    const segments = [];
    for (let i = 1; i <= 4; i++) {
      segments.push(
        <div
          key={i}
          className={`h-2 flex-1 mx-[1px] rounded-sm ${
            i < currentStage ? "bg-[#039994]" : 
            i === currentStage ? "bg-[#039994]" : 
            i === nextStage ? "border border-[#039994] bg-white" : "bg-gray-200"
          }`}
        />
      );
    }
    return segments;
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
                onClick={handleProgressClick}
                className="cursor-pointer px-4 py-2 bg-gray-100 rounded-md flex items-center hover:bg-gray-200 transition-colors"
              >
                <div className="w-32 h-2 flex mr-3">
                  {getProgressBarSegments()}
                </div>
                <span className="text-xs font-medium">
                  Step {currentStage} of 4
                </span>
              </div>
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 transform hidden group-hover:block">
                <div className="relative bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                  {getTooltipText()}
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></span>
                </div>
              </div>
            </div>

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

      {showFinanceModal && <FinanceAndInstallerModal isOpen={showFinanceModal} onClose={handleModalClose} />}
      {showTermsModal && <ResidenceTermsAndAgreementModal isOpen={showTermsModal} onClose={handleModalClose} />}
      {showUtilityModal && <UtilityAuthorizationModal isOpen={showUtilityModal} onClose={handleModalClose} />}
      {showResidenceModal && <AddResidenceFacilityModal isOpen={showResidenceModal} onClose={handleModalClose} />}

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </>
  );
};

export default DashboardNavbar;