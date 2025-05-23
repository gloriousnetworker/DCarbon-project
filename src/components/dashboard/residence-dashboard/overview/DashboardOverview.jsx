import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import components to handle potential SSR issues
const QuickActions = dynamic(() => import("./QuickActions"), { ssr: false });
const Graph = dynamic(() => import("./Graph"), { ssr: false });
const CustomerCard = dynamic(() => import("./CustomerCards"), { ssr: false });
const WelcomeModal = dynamic(() => import("./modals/WelcomeModal"), { ssr: false });

export default function DashboardOverview() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [authStatus, setAuthStatus] = useState(null);
  const [userData, setUserData] = useState({
    userFirstName: "",
    utilityProviderRequest: null
  });
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // Load user data from localStorage
    const loadUserData = () => {
      if (typeof window === 'undefined') return;
      
      const firstName = localStorage.getItem("userFirstName") || "User";
      const utilityRequest = JSON.parse(localStorage.getItem("utilityProviderRequest") || "null");
      
      setUserData({
        userFirstName: firstName,
        utilityProviderRequest: utilityRequest
      });

      // Check if we have auth status in local storage
      const storedAuthStatus = localStorage.getItem("utilityAuthStatus");
      if (storedAuthStatus) {
        setAuthStatus(storedAuthStatus);
        setHasCheckedAuth(true);
      } else if (utilityRequest) {
        setAuthStatus(utilityRequest.status || "PENDING");
        setHasCheckedAuth(true);
      } else {
        setAuthStatus("PENDING");
        setHasCheckedAuth(true);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    // Only show modal if we've checked auth status and it's not AUTHORIZED
    if (hasCheckedAuth && authStatus !== "AUTHORIZED") {
      const timer = setTimeout(() => {
        setShowWelcomeModal(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [authStatus, hasCheckedAuth]);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    // If user closes the modal manually, we can set a flag to prevent it from showing again
    localStorage.setItem("welcomeModalShown", "true");
  };

  const shouldShowWelcomeModal = () => {
    if (authStatus === "AUTHORIZED") return false;
    if (typeof window === 'undefined') return false;
    // Check if user has previously closed the modal
    return localStorage.getItem("welcomeModalShown") !== "true";
  };

  const handleShowWelcomeModal = () => {
    setShowWelcomeModal(true);
  };

  return (
    <div className="w-full min-h-screen space-y-8 p-4">
      {/* Auth Status Banner */}
      {authStatus !== "AUTHORIZED" && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {authStatus === "PENDING" ? (
                  <>
                    Your authorization is pending. <button 
                      onClick={handleShowWelcomeModal}
                      className="font-medium text-yellow-700 underline hover:text-yellow-600"
                    >
                      Click here
                    </button> to learn what this means for your account.
                  </>
                ) : (
                  "Your utility provider authorization is not yet complete. Please complete the verification process."
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <QuickActions authStatus={authStatus} setAuthStatus={setAuthStatus} />

      {/* Separator */}
      <hr className="border-gray-300" />

      {/* Graphs & Side Cards */}
      <Graph />

      {/* Separator */}
      <hr className="border-gray-300" />

      {/* Recent REC Sales Table */}
      <CustomerCard />

      {/* Welcome Modal - Only show if not AUTHORIZED and not previously dismissed */}
      {showWelcomeModal && shouldShowWelcomeModal() && (
        <WelcomeModal 
          isOpen 
          onClose={handleCloseWelcomeModal}
          userData={userData}
        />
      )}
    </div>
  );
}