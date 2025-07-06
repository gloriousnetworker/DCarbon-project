"use client";
import React, { useEffect, useState } from "react";
import { FaBars, FaSearch, FaBell, FaHeadset } from "react-icons/fa";
import FinanceAndInstallerModal from "./overview/modals/createfacility/FinanceAndInstallerModal";
import ResidenceTermsAndAgreementModal from "./overview/modals/createfacility/ResidenceTermsAndAgreementModal";
import UtilityAuthorizationModal from "./overview/modals/createfacility/UtilityAuthorizationModal";
import AddResidenceFacilityModal from "./overview/modals/createfacility/AddResidentialFacilityModal";

const DashboardNavbar = ({
  toggleSidebar,
  selectedSection,
  sectionDisplayMap,
  onSectionChange,
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationDot, setShowNotificationDot] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showUtilityModal, setShowUtilityModal] = useState(false);
  const [showResidenceModal, setShowResidenceModal] = useState(false);
  const [meterCheckInterval, setMeterCheckInterval] = useState(null);

  const stages = [
    { id: 1, name: "Financial Info", tooltip: "Complete financial information" },
    { id: 2, name: "Agreements", tooltip: "Sign terms and conditions" },
    { id: 3, name: "Utility Auth", tooltip: "Authorize utility access" },
    { id: 4, name: "Add Facility", tooltip: "Create your residence facility" }
  ];

  const checkStage1Completion = async (userId, authToken) => {
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
    return result.status === 'success' && result.data?.financialInfo !== null;
  };

  const checkStage2Completion = async (userId, authToken) => {
    const response = await fetch(
      `https://services.dcarbon.solutions/api/user/check-agreements/${userId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    const result = await response.json();
    return result.status === 'success' && result.data?.agreementsAccepted;
  };

  const checkStage3Completion = async (userId, authToken) => {
    const response = await fetch(
      `https://services.dcarbon.solutions/api/auth/utility-auth/${userId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    const result = await response.json();
    return result.status === 'success' && result.data?.length > 0;
  };

  const checkStage4Completion = async (userId, authToken) => {
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
    return result.status === 'success' && 
           result.data?.length > 0 && 
           result.data.some(item => item.meters?.meters?.length > 0);
  };

  const checkUserProgress = async () => {
    const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
    const userId = loginResponse?.data?.user?.id;
    const authToken = loginResponse?.data?.token;

    if (!userId || !authToken) return;

    const stage1 = await checkStage1Completion(userId, authToken);
    if (!stage1) {
      setCurrentStage(1);
      return;
    }

    const stage2 = await checkStage2Completion(userId, authToken);
    if (!stage2) {
      setCurrentStage(2);
      return;
    }

    const stage3 = await checkStage3Completion(userId, authToken);
    if (!stage3) {
      setCurrentStage(3);
      return;
    }

    const stage4 = await checkStage4Completion(userId, authToken);
    if (stage4) {
      setCurrentStage(4);
      if (meterCheckInterval) {
        clearInterval(meterCheckInterval);
        setMeterCheckInterval(null);
      }
    } else {
      setCurrentStage(3);
      if (!meterCheckInterval) {
        const interval = setInterval(async () => {
          const hasMeters = await checkStage4Completion(userId, authToken);
          if (hasMeters) {
            setCurrentStage(4);
            clearInterval(interval);
            setMeterCheckInterval(null);
          }
        }, 5000);
        setMeterCheckInterval(interval);
      }
    }
  };

  useEffect(() => {
    const storedNotifications = localStorage.getItem("notifications");
    if (storedNotifications) {
      const notifications = JSON.parse(storedNotifications);
      const unread = notifications.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
      setShowNotificationDot(unread > 0);
    }

    const handleStorageChange = (e) => {
      if (e.key === "notifications") {
        const notifications = JSON.parse(e.newValue);
        const unread = notifications.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
        setShowNotificationDot(unread > 0);
        if (unread > unreadCount) flashNotificationDot();
      }
    };

    checkUserProgress();
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (meterCheckInterval) {
        clearInterval(meterCheckInterval);
      }
    };
  }, []);

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

  const getProgressWidth = () => {
    const currentDisplayStage = currentStage > 4 ? 4 : currentStage;
    return `${(currentDisplayStage / stages.length) * 100}%`;
  };

  const getTooltipText = () => {
    const currentDisplayStage = currentStage > 4 ? 4 : currentStage;
    const stage = stages.find(s => s.id === currentDisplayStage);
    return stage ? stage.tooltip : "Onboarding in progress";
  };

  const handleProgressClick = () => {
    if (currentStage === 1) {
      setShowFinanceModal(true);
    } else if (currentStage === 2) {
      setShowTermsModal(true);
    } else if (currentStage === 3) {
      setShowUtilityModal(true);
    } else if (currentStage === 4) {
      setShowResidenceModal(true);
    }
  };

  const handleModalClose = () => {
    setShowFinanceModal(false);
    setShowTermsModal(false);
    setShowUtilityModal(false);
    setShowResidenceModal(false);
    checkUserProgress();
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
                className="cursor-pointer px-4 py-2 bg-gray-100 rounded-md flex items-center hover:bg-gray-200 transition-colors"
                onClick={handleProgressClick}
              >
                <div className="w-32 h-2 bg-gray-200 rounded-full mr-3">
                  <div
                    className="h-2 rounded-full bg-[#039994]"
                    style={{ width: getProgressWidth() }}
                  ></div>
                </div>
                <span className="text-xs font-medium">
                  Stage {currentStage > 4 ? 4 : currentStage} of {stages.length}
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

      {showFinanceModal && (
        <FinanceAndInstallerModal
          isOpen={showFinanceModal}
          onClose={handleModalClose}
        />
      )}

      {showTermsModal && (
        <ResidenceTermsAndAgreementModal
          isOpen={showTermsModal}
          onClose={handleModalClose}
        />
      )}

      {showUtilityModal && (
        <UtilityAuthorizationModal
          isOpen={showUtilityModal}
          onClose={handleModalClose}
        />
      )}

      {showResidenceModal && (
        <AddResidenceFacilityModal
          isOpen={showResidenceModal}
          onClose={handleModalClose}
        />
      )}
    </>
  );
};

export default DashboardNavbar;