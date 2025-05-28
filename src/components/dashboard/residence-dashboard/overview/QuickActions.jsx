import React, { useState, useEffect } from "react";
import AddResidenceModal from "./modals/AddResidenceModal";
import UploadDocumentsModal from "./modals/UploadDocumentModal";
import RequestRedemptionModal from "./modals/RequestRedemptionModal";
import ReferOwnerModal from "./modals/ReferOwnerModal";
import {
  pageTitle,
  labelClass,
  noteText,
} from "./styles";

export default function QuickActions({ authStatus: propAuthStatus, setAuthStatus }) {
  const [modal, setModal] = useState("");
  const [authStatus, setLocalAuthStatus] = useState("PENDING");
  const [agreementStatus, setAgreementStatus] = useState("PENDING");
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedStatus, setHasCheckedStatus] = useState(false);

  // hard‑coded values; swap out for props or context as needed
  const currentPoints = 20;
  const redemption = { done: 250, total: 3000 };
  const referral = { done: 150, total: 3000 };

  const redemptionPct = Math.round((redemption.done / redemption.total) * 100);
  const referralPct = Math.round((referral.done / referral.total) * 100);

  // Function to check agreement status from multiple sources
  const checkAgreementStatus = () => {
    if (typeof window === 'undefined') return "PENDING";

    // First check the loginResponse
    const loginResponse = JSON.parse(localStorage.getItem("loginResponse") || "null");
    const loginAgreements = loginResponse?.data?.user?.agreements || null;
    
    if (loginAgreements?.termsAccepted === true) {
      return "ACCEPTED";
    }

    // Fallback to temporary storage
    const tempAgreements = JSON.parse(localStorage.getItem("userAgreements") || "null");
    if (tempAgreements?.termsAccepted === true) {
      return "ACCEPTED";
    }

    return "PENDING";
  };

  useEffect(() => {
    const loadUserData = () => {
      if (typeof window === 'undefined') return;
      
      const loginResponse = JSON.parse(localStorage.getItem("loginResponse") || "null");
      
      // Extract user info from login response
      const user = loginResponse?.data?.user || null;
      const utilityAuth = user?.utilityAuth || [];

      // Updated logic: COMPLETED if at least one auth is AUTHORIZED or UPDATED
      let currentAuthStatus = "PENDING";
      if (utilityAuth.length > 0) {
        const hasValidAuth = utilityAuth.some(auth => 
          auth.status === "AUTHORIZED" || auth.status === "UPDATED"
        );
        currentAuthStatus = hasValidAuth ? "COMPLETED" : "PENDING";
      }
      
      // Use prop authStatus if provided, otherwise use computed status
      const finalAuthStatus = propAuthStatus || currentAuthStatus;
      setLocalAuthStatus(finalAuthStatus);
      
      // Update parent component if setAuthStatus is provided
      if (setAuthStatus && !propAuthStatus) {
        setAuthStatus(finalAuthStatus);
      }

      // Check agreement status from multiple sources
      const currentAgreementStatus = checkAgreementStatus();
      setAgreementStatus(currentAgreementStatus);
      
      setHasCheckedStatus(true);
      setIsLoading(false);
    };

    loadUserData();
    
    // Listen for storage changes to update agreement status in real-time
    const handleStorageChange = (e) => {
      if (e.key === "loginResponse" || e.key === "userAgreements") {
        const newAgreementStatus = checkAgreementStatus();
        setAgreementStatus(newAgreementStatus);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [propAuthStatus, setAuthStatus]);

  const openModal = (type) => {
    // Only prevent opening the Add Residence modal if not authorized or agreement not accepted
    if (type === "addResidence" && (!isAuthorized() || !isAgreementAccepted())) {
      return;
    }
    setModal(type);
  };

  const closeModal = () => {
    setModal("");
  };

  const isAuthorized = () => {
    const currentAuthStatus = propAuthStatus || authStatus;
    return currentAuthStatus === "COMPLETED";
  };

  const isAgreementAccepted = () => {
    return agreementStatus === "ACCEPTED";
  };

  const canPerformAction = (actionType) => {
    // Only Add Residence requires auth and agreement
    if (actionType === "addResidence") {
      return isAuthorized() && isAgreementAccepted();
    }
    return true;
  };

  const isActionDisabled = (actionType) => {
    return isLoading || !canPerformAction(actionType);
  };

  const getActionTooltip = (actionType) => {
    if (isLoading) return "Loading...";
    
    // Only show tooltip for "addResidence" action
    if (actionType === "addResidence") {
      if (!isAuthorized() && !isAgreementAccepted()) {
        return "Utility authorization and user agreement required";
      }
      if (!isAuthorized()) {
        const currentAuthStatus = propAuthStatus || authStatus;
        return `Utility provider authorization status: ${currentAuthStatus}`;
      }
      if (!isAgreementAccepted()) {
        return "User agreement acceptance required";
      }
    }
    
    return "";
  };

  const getActionStatusText = (actionType) => {
    if (isLoading) return "Loading...";
    
    // Only show status text for "addResidence" action
    if (actionType === "addResidence") {
      if (!isAuthorized() && !isAgreementAccepted()) {
        return "Auth & agreement required";
      }
      if (!isAuthorized()) {
        return "Authorization required";
      }
      if (!isAgreementAccepted()) {
        return "Agreement required";
      }
    }
    
    return "";
  };

  return (
    <div className="w-full py-4 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* --- Quick Action Column --- */}
        <div className="col-span-1">
          <h2 className={pageTitle}>Quick Action</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Add a Residence */}
            <div
              onClick={() => !isActionDisabled("addResidence") && openModal("addResidence")}
              className={`p-4 rounded-2xl flex flex-col h-full min-h-[120px] ${
                isActionDisabled("addResidence") ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
              style={{
                background:
                  "radial-gradient(100.83% 133.3% at 130.26% -10.83%, #013331 0%, #039994 100%)",
              }}
              title={getActionTooltip("addResidence")}
            >
              <img
                src="/vectors/MapPinPlus.png"
                alt="Add a Residence"
                className="h-6 w-6 mb-2"
              />
              <hr className="border-white mb-2" />
              <p className="text-white text-sm font-bold line-clamp-2">Add a Residence</p>
              {(isLoading || !canPerformAction("addResidence")) && (
                <div className="mt-1 text-white text-xs">
                  {getActionStatusText("addResidence")}
                </div>
              )}
            </div>

            {/* Upload/Manage Documents */}
            <div
              onClick={() => openModal("uploadDocuments")}
              className="cursor-pointer p-4 rounded-2xl flex flex-col h-full min-h-[120px]"
              style={{
                background:
                  "radial-gradient(433.01% 729.42% at 429.68% -283.45%, rgba(6,155,150,0.3) 0%, #FFFFFF 100%)",
              }}
            >
              <img
                src="/vectors/Files.png"
                alt="Upload/Manage Documents"
                className="h-6 w-6 mb-2"
              />
              <hr className="border-[#CCC] mb-2" />
              <p className="text-[#1E1E1E] text-sm font-bold line-clamp-2">
                Upload/Manage Documents
              </p>
            </div>

            {/* Request Redemption */}
            <div
              onClick={() => openModal("requestRedemption")}
              className="cursor-pointer p-4 rounded-2xl flex flex-col h-full min-h-[120px]"
              style={{
                background:
                  "radial-gradient(185.83% 225.47% at 148.19% -135.83%, #D3D3D3 0%, #58595B 100%)",
              }}
            >
              <img
                src="/vectors/HandCoins.png"
                alt="Request Redemption"
                className="h-6 w-6 mb-2"
              />
              <hr className="border-white mb-2" />
              <p className="text-white text-sm font-bold line-clamp-2">Request Redemption</p>
            </div>

            {/* Refer a Solar Panel Owner */}
            <div
              onClick={() => openModal("referOwner")}
              className="cursor-pointer p-4 rounded-2xl flex flex-col h-full min-h-[120px]"
              style={{
                background:
                  "radial-gradient(60% 119.12% at 114.01% -10%, #00B4AE 0%, #004E4B 100%)",
              }}
            >
              <img
                src="/vectors/Share.png"
                alt="Refer a Solar Panel Owner"
                className="h-6 w-6 mb-2"
              />
              <hr className="border-white mb-2" />
              <p className="text-white text-sm font-bold line-clamp-2">
                Refer a Solar Panel Owner
              </p>
            </div>
          </div>
        </div>

        {/* --- Rewards Column --- */}
        <div className="col-span-1 lg:col-span-3">
          <h2 className={pageTitle}>Rewards</h2>
          <div className="bg-white rounded-2xl p-6 space-y-6 shadow min-h-[280px]">
            {/* Current Points */}
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="block w-2 h-2 bg-black rounded-full mr-2"></span>
                <span className={labelClass}>
                  Current Points Balance
                </span>
              </div>
              <span className="text-[#1E1E1E] font-bold">
                {currentPoints}pts
              </span>
            </div>

            {/* Redemption Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="block w-2 h-2 bg-black rounded-full mr-2"></span>
                  <span className={labelClass}>Redemption progress</span>
                </div>
                <span className="text-[#039994] font-semibold">
                  {redemption.done}/{redemption.total}pts
                </span>
              </div>
              <div className="w-full h-2 bg-[#EEEEEE] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: "#039994",
                    width: `${redemptionPct}%`,
                  }}
                />
              </div>
            </div>

            {/* Referral Bonus Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="block w-2 h-2 bg-black rounded-full mr-2"></span>
                  <span className={labelClass}>
                    Referral bonus progress
                  </span>
                </div>
                <span className="text-[#1E1E1E] font-semibold">
                  {referral.done}/{referral.total}pts
                </span>
              </div>
              <div className="w-full h-2 bg-[#D4D4D4] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: "#1E1E1E",
                    width: `${referralPct}%`,
                  }}
                />
              </div>
              
              {/* Tier Legend */}
              <div className="flex items-center space-x-4 pt-2">
                <div className="flex items-center space-x-1">
                  <span className="block w-2 h-2 bg-[#D4D4D4] rounded-full" />
                  <span className={noteText}>Bronze Tier</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="block w-2 h-2 bg-[#A37C50] rounded-full" />
                  <span className={noteText}>Silver Tier</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="block w-2 h-2 bg-[#FFD700] rounded-full" />
                  <span className={noteText}>Gold Tier</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddResidenceModal
        isOpen={modal === "addResidence"}
        onClose={closeModal}
      />
      <UploadDocumentsModal
        isOpen={modal === "uploadDocuments"}
        onClose={closeModal}
      />
      <RequestRedemptionModal
        isOpen={modal === "requestRedemption"}
        onClose={closeModal}
      />
      <ReferOwnerModal
        isOpen={modal === "referOwner"}
        onClose={closeModal}
      />
    </div>
  );
}