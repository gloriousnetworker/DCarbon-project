import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const QuickActions = dynamic(() => import("./QuickActions"), { ssr: false });
const Graph = dynamic(() => import("./Graph"), { ssr: false });
const RecentRecSales = dynamic(() => import("./RecentRecSales"), { ssr: false });
const WelcomeModal = dynamic(() => import("./modals/WelcomeModal"), { ssr: false });
const AddUtilityProvider = dynamic(() => import("./modals/AddUtilityProvider"), { ssr: false });

export default function DashboardOverview() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showAddUtilityModal, setShowAddUtilityModal] = useState(false);
  const [authStatus, setAuthStatus] = useState("PENDING");
  const [agreementStatus, setAgreementStatus] = useState("PENDING");
  const [utilityAuthDetails, setUtilityAuthDetails] = useState([]);
  const [utilityAuthEmails, setUtilityAuthEmails] = useState([]);
  const [userData, setUserData] = useState({
    userFirstName: "",
    utilityAuth: null,
    agreements: null
  });
  const [hasCheckedStatus, setHasCheckedStatus] = useState(false);

  useEffect(() => {
    const loadUserData = () => {
      if (typeof window === 'undefined') return;
      
      const firstName = localStorage.getItem("userFirstName") || "User";
      const loginResponse = JSON.parse(localStorage.getItem("loginResponse") || "null");
      
      const user = loginResponse?.data?.user || null;
      const utilityAuth = user?.utilityAuth || [];
      const utilityAuthEmail = user?.utilityAuthEmail || [];
      let agreements = user?.agreements || null;
      
      if (!agreements) {
        const userAgreements = JSON.parse(localStorage.getItem("userAgreements") || "null");
        if (userAgreements) {
          agreements = userAgreements;
        }
      }
      
      setUserData({
        userFirstName: firstName,
        utilityAuth: utilityAuth,
        agreements: agreements
      });

      setUtilityAuthDetails(utilityAuth);
      setUtilityAuthEmails(utilityAuthEmail);

      // Updated logic: COMPLETED if at least one auth is AUTHORIZED or UPDATED
      let currentAuthStatus = "PENDING";
      if (utilityAuth.length > 0) {
        const hasValidAuth = utilityAuth.some(auth => 
          auth.status === "AUTHORIZED" || auth.status === "UPDATED"
        );
        currentAuthStatus = hasValidAuth ? "COMPLETED" : "PENDING";
      }
      setAuthStatus(currentAuthStatus);

      let currentAgreementStatus = "PENDING";
      if (agreements?.termsAccepted === true) {
        currentAgreementStatus = "ACCEPTED";
      }
      setAgreementStatus(currentAgreementStatus);
      
      setHasCheckedStatus(true);
    };

    loadUserData();
  }, []);

  useEffect(() => {
    if (hasCheckedStatus) {
      const shouldShowModal = 
        authStatus !== "COMPLETED" || 
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
    localStorage.setItem("welcomeModalShown", "true");
  };

  const handleShowWelcomeModal = () => {
    localStorage.removeItem("welcomeModalShown");
    setShowWelcomeModal(true);
  };

  const handleOpenAddUtilityModal = () => {
    setShowAddUtilityModal(true);
  };

  const handleCloseAddUtilityModal = () => {
    setShowAddUtilityModal(false);
  };

  const shouldShowWelcomeModal = () => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem("welcomeModalShown") !== "true";
  };

  const getErrorUtilityAuths = () => {
    if (utilityAuthDetails.length === 0 || utilityAuthEmails.length === 0) return [];

    const errorAuths = [];
    utilityAuthDetails.forEach((auth, index) => {
      if (auth.status === "UPDATE_ERROR" || auth.status === "ERROR" || auth.status === "FAILED") {
        errorAuths.push({
          email: utilityAuthEmails[index] || 'Unknown email',
          status: auth.status
        });
      }
    });

    return errorAuths;
  };

  const getUtilityAuthStatusMessage = () => {
    if (utilityAuthDetails.length === 0) return null;

    const hasValidStatus = utilityAuthDetails.some(auth => 
      auth.status === "AUTHORIZED" || auth.status === "UPDATED"
    );

    if (hasValidStatus) return null;

    const hasErrorStatus = utilityAuthDetails.some(auth => 
      auth.status === "UPDATE_ERROR" || 
      auth.status === "ERROR" ||
      auth.status === "FAILED"
    );

    const hasPendingStatus = utilityAuthDetails.some(auth => 
      auth.status === "PENDING" || 
      auth.status === "PROCESSING"
    );

    if (hasErrorStatus) {
      return {
        type: "error",
        message: (
          <>
            There was an issue with your utility provider authorization. Our team has been notified and will resolve this shortly. 
            <button 
              onClick={handleShowWelcomeModal}
              className="font-medium text-red-700 underline hover:text-red-600 ml-1"
            >
              Click here
            </button> for more details.
          </>
        )
      };
    }

    if (hasPendingStatus) {
      return {
        type: "warning",
        message: (
          <>
            Your utility provider authorization is being processed. 
            <button 
              onClick={handleShowWelcomeModal}
              className="font-medium text-yellow-700 underline hover:text-yellow-600 ml-1"
            >
              Click here
            </button> to learn what this means for your account.
          </>
        )
      };
    }

    return null;
  };

  const getAgreementStatusMessage = () => {
    if (agreementStatus !== "ACCEPTED") {
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

  const utilityAuthMessage = getUtilityAuthStatusMessage();
  const agreementMessage = getAgreementStatusMessage();
  const errorAuths = getErrorUtilityAuths();

  return (
    <div className="w-full min-h-screen space-y-8 p-4">
      {/* Major Warning Messages - only show if no valid auth */}
      {utilityAuthMessage && (
        <div className={`${
          utilityAuthMessage.type === 'warning' 
            ? 'bg-yellow-50 border-l-4 border-yellow-400' 
            : 'bg-red-50 border-l-4 border-red-400'
        } p-4`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <svg 
                className={`h-5 w-5 ${
                  utilityAuthMessage.type === 'warning' ? 'text-yellow-400' : 'text-red-400'
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
                utilityAuthMessage.type === 'warning' ? 'text-yellow-700' : 'text-red-700'
              }`}>
                {utilityAuthMessage.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {agreementMessage && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg 
                className="h-5 w-5 text-red-400" 
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
              <p className="text-sm text-red-700">
                {agreementMessage.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Small Error Notifications for Specific Failed Authorizations */}
      {errorAuths.length > 0 && (
        <div className="space-y-2">
          {errorAuths.map((errorAuth, index) => (
            <div key={index} className="bg-orange-50 border-l-4 border-orange-400 p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg 
                    className="h-4 w-4 text-orange-400" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs text-orange-700">
                    <strong>Authorization Issue:</strong> There was an error with the authorization for{' '}
                    <span className="font-medium">{errorAuth.email}</span>. 
                    Please try contacting your Utility Provider or the DCarbon Team for assistance.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header Section */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="font-[600] text-[24px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro">
            Dashboard Overview
          </h1>
        </div>
      </div>

      <QuickActions 
        authStatus={authStatus} 
        setAuthStatus={setAuthStatus}
      />

      <hr className="border-gray-300" />

      <Graph />

      <hr className="border-gray-300" />

      <RecentRecSales />

      {showWelcomeModal && shouldShowWelcomeModal() && (
        <WelcomeModal 
          isOpen 
          onClose={handleCloseWelcomeModal}
          userData={userData}
          authStatus={authStatus}
          agreementStatus={agreementStatus}
          utilityAuthDetails={utilityAuthDetails}
          utilityAuthEmails={utilityAuthEmails}
        />
      )}

      {showAddUtilityModal && (
        <AddUtilityProvider 
          isOpen={showAddUtilityModal}
          onClose={handleCloseAddUtilityModal}
        />
      )}
    </div>
  );
}