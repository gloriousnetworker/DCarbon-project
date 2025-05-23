import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import components to handle potential SSR issues
const QuickActions = dynamic(() => import("./QuickActions"), { ssr: false });
const Graph = dynamic(() => import("./Graph"), { ssr: false });
const RecentRecSales = dynamic(() => import("./RecentRecSales"), { ssr: false });
const WelcomeModal = dynamic(() => import("./modals/WelcomeModal"), { ssr: false });

export default function DashboardOverview() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [authStatus, setAuthStatus] = useState("PENDING");
  const [agreementStatus, setAgreementStatus] = useState("PENDING");
  const [userData, setUserData] = useState({
    userFirstName: "",
    utilityProviderRequest: null,
    agreements: null
  });
  const [hasCheckedStatus, setHasCheckedStatus] = useState(false);

  useEffect(() => {
    // Load user data from localStorage and check statuses
    const loadUserData = () => {
      if (typeof window === 'undefined') return;
      
      const firstName = localStorage.getItem("userFirstName") || "User";
      const utilityRequest = JSON.parse(localStorage.getItem("utilityProviderRequest") || "null");
      const loginResponse = JSON.parse(localStorage.getItem("loginResponse") || "null");
      
      // Extract agreement info from login response
      const agreements = loginResponse?.data?.user?.agreements || null;
      
      setUserData({
        userFirstName: firstName,
        utilityProviderRequest: utilityRequest,
        agreements: agreements
      });

      // Check utility authorization status
      const storedAuthStatus = localStorage.getItem("utilityAuthStatus");
      let currentAuthStatus = "PENDING";
      
      if (storedAuthStatus) {
        currentAuthStatus = storedAuthStatus;
      } else if (utilityRequest) {
        currentAuthStatus = utilityRequest.status || "PENDING";
      }
      
      setAuthStatus(currentAuthStatus);

      // Check agreement status
      let currentAgreementStatus = "PENDING";
      if (agreements && agreements.termsAccepted === true) {
        currentAgreementStatus = "ACCEPTED";
      }
      
      setAgreementStatus(currentAgreementStatus);
      setHasCheckedStatus(true);
    };

    loadUserData();
  }, []);

  useEffect(() => {
    // Show modal if either authorization is not complete or agreement is not accepted
    if (hasCheckedStatus) {
      const shouldShowModal = 
        (authStatus !== "AUTHORIZED" && authStatus !== "UPDATED") || 
        agreementStatus !== "ACCEPTED";
      
      if (shouldShowModal && shouldShowWelcomeModal()) {
        const timer = setTimeout(() => {
          setShowWelcomeModal(true);
        }, 1000);

        return () => clearTimeout(timer);
      }
    }
  }, [authStatus, agreementStatus, hasCheckedStatus]);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    // If user closes the modal manually, we can set a flag to prevent it from showing again
    localStorage.setItem("welcomeModalShown", "true");
  };

  const handleShowWelcomeModal = () => {
    // Clear the dismissed flag and show the modal
    localStorage.removeItem("welcomeModalShown");
    setShowWelcomeModal(true);
  };

  const shouldShowWelcomeModal = () => {
    if (typeof window === 'undefined') return false;
    // Check if user has previously closed the modal
    return localStorage.getItem("welcomeModalShown") !== "true";
  };

  const getStatusMessage = () => {
    const isAuthComplete = authStatus === "AUTHORIZED" || authStatus === "UPDATED";
    const isAgreementComplete = agreementStatus === "ACCEPTED";

    if (!isAuthComplete && !isAgreementComplete) {
      return {
        type: "warning",
        message: (
          <>
            Your authorization is pending and you need to accept the user agreement. 
            <button 
              onClick={handleShowWelcomeModal}
              className="font-medium text-yellow-700 underline hover:text-yellow-600 ml-1"
            >
              Click here
            </button> to complete these requirements.
          </>
        )
      };
    } else if (!isAuthComplete) {
      return {
        type: "warning",
        message: (
          <>
            Your utility provider authorization is pending. 
            <button 
              onClick={handleShowWelcomeModal}
              className="font-medium text-yellow-700 underline hover:text-yellow-600 ml-1"
            >
              Click here
            </button> to learn what this means for your account.
          </>
        )
      };
    } else if (!isAgreementComplete) {
      return {
        type: "error",
        message: (
          <>
            You need to accept the user agreement to create facilities. 
            <button 
              onClick={handleShowWelcomeModal}
              className="font-medium text-red-700 underline hover:text-red-600 ml-1"
            >
              Click here
            </button> to complete this requirement.
          </>
        )
      };
    }

    return null;
  };

  const statusMessage = getStatusMessage();

  return (
    <div className="w-full min-h-screen space-y-8 p-4">
      {/* Status Banner */}
      {statusMessage && (
        <div className={`${
          statusMessage.type === 'warning' 
            ? 'bg-yellow-50 border-l-4 border-yellow-400' 
            : 'bg-red-50 border-l-4 border-red-400'
        } p-4`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <svg 
                className={`h-5 w-5 ${
                  statusMessage.type === 'warning' ? 'text-yellow-400' : 'text-red-400'
                }`} 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className={`text-sm ${
                statusMessage.type === 'warning' ? 'text-yellow-700' : 'text-red-700'
              }`}>
                {statusMessage.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <QuickActions 
        authStatus={authStatus} 
        setAuthStatus={setAuthStatus}
      />

      {/* Separator */}
      <hr className="border-gray-300" />

      {/* Graphs & Side Cards */}
      <Graph />

      {/* Separator */}
      <hr className="border-gray-300" />

      {/* Recent REC Sales Table */}
      <RecentRecSales />

      {/* Welcome Modal - Show if requirements are not met and not previously dismissed */}
      {showWelcomeModal && shouldShowWelcomeModal() && (
        <WelcomeModal 
          isOpen 
          onClose={handleCloseWelcomeModal}
          userData={userData}
          authStatus={authStatus}
          agreementStatus={agreementStatus}
        />
      )}
    </div>
  );
}