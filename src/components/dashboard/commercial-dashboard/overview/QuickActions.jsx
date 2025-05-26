import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import modals to handle potential SSR issues
const AddCommercialFacilityModal = dynamic(
  () => import("./modals/AddCommercialFacilityModal"),
  { ssr: false }
);
const ResolvePendingActionsModal = dynamic(
  () => import("./modals/ResolvePendingActionsModal"),
  { ssr: false }
);
const CurrentStatementModal = dynamic(
  () => import("./modals/CurrentStatementModal"),
  { ssr: false }
);
const InviteCollaboratorModal = dynamic(
  () => import("./modals/InviteCollaboratorModal"),
  { ssr: false }
);

export default function QuickActions({ authStatus: propAuthStatus, setAuthStatus }) {
  const [modal, setModal] = useState("");
  const [authStatus, setLocalAuthStatus] = useState("PENDING");
  const [agreementStatus, setAgreementStatus] = useState("PENDING");
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedStatus, setHasCheckedStatus] = useState(false);

  useEffect(() => {
    const loadUserData = () => {
      if (typeof window === 'undefined') return;
      
      const loginResponse = JSON.parse(localStorage.getItem("loginResponse") || "null");
      
      // Extract user info from login response
      const user = loginResponse?.data?.user || null;
      const utilityAuth = user?.utilityAuth || null;
      const agreements = user?.agreements || null;

      // Set auth status based on utilityAuth
      let currentAuthStatus = "PENDING";
      if (utilityAuth?.status === "UPDATED" || utilityAuth?.status === "AUTHORIZED") {
        currentAuthStatus = "COMPLETED";
      }
      
      // Use prop authStatus if provided, otherwise use computed status
      const finalAuthStatus = propAuthStatus || currentAuthStatus;
      setLocalAuthStatus(finalAuthStatus);
      
      // Update parent component if setAuthStatus is provided
      if (setAuthStatus && !propAuthStatus) {
        setAuthStatus(finalAuthStatus);
      }

      // Set agreement status
      let currentAgreementStatus = "PENDING";
      if (agreements?.termsAccepted === true) {
        currentAgreementStatus = "ACCEPTED";
      }
      setAgreementStatus(currentAgreementStatus);
      
      setHasCheckedStatus(true);
      setIsLoading(false);
    };

    loadUserData();
  }, [propAuthStatus, setAuthStatus]);

  const openModal = (type) => {
    // Prevent opening add facility modal if not authorized or agreement not accepted
    if (type === "add" && (!isAuthorized() || !isAgreementAccepted())) {
      return;
    }
    setModal(type);
  };

  const closeModal = () => {
    setModal("");
  };

  const isAuthorized = () => {
    const currentAuthStatus = propAuthStatus || authStatus;
    return currentAuthStatus === "AUTHORIZED" || currentAuthStatus === "UPDATED" || currentAuthStatus === "COMPLETED";
  };

  const isAgreementAccepted = () => {
    return agreementStatus === "ACCEPTED";
  };

  const canAddFacility = () => {
    return isAuthorized() && isAgreementAccepted();
  };

  const isAddDisabled = isLoading || !canAddFacility();

  const getAddFacilityTooltip = () => {
    if (isLoading) return "Loading...";
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
    return "";
  };

  const getAddFacilityStatusText = () => {
    if (isLoading) return "Loading...";
    if (!isAuthorized() && !isAgreementAccepted()) {
      return "Auth & agreement required";
    }
    if (!isAuthorized()) {
      return "Authorization required";
    }
    if (!isAgreementAccepted()) {
      return "Agreement required";
    }
    return "";
  };

  return (
    <div className="w-full py-4 px-4">
      {/* Heading Section */}
      <div className="flex flex-col items-start mb-2">
        <h2 className="font-[600] text-[16px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-left">
          Quick Action
        </h2>
      </div>

      {/* Cards Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Add Commercial Facility */}
        <div
          className={`p-4 min-h-[100px] rounded-2xl flex flex-col items-start justify-start ${
            isAddDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
          style={{
            background:
              "radial-gradient(100.83% 133.3% at 130.26% -10.83%, #013331 0%, #039994 100%)",
          }}
          onClick={() => !isAddDisabled && openModal("add")}
          title={getAddFacilityTooltip()}
        >
          <img
            src="/vectors/MapPinPlus.png"
            alt="Map Pin Plus"
            className="mb-2 h-8 w-8 object-contain"
          />
          <hr className="border-white w-full mb-2" />
          <p className="text-white font-bold text-sm leading-tight">
            Add <br />
            Commercial Facility
          </p>
          {(isLoading || !canAddFacility()) && (
            <div className="mt-1 text-white text-xs">
              {getAddFacilityStatusText()}
            </div>
          )}
        </div>

        {/* Card 2: Resolve Pending Actions */}
        <div
          className="p-4 min-h-[100px] rounded-2xl flex flex-col items-start justify-start cursor-pointer"
          style={{
            background:
              "radial-gradient(433.01% 729.42% at 429.68% -283.45%, rgba(6, 155, 150, 0.3) 0%, #FFFFFF 100%)",
          }}
          onClick={() => openModal("resolve")}
        >
          <img
            src="/vectors/Files.png"
            alt="Files"
            className="mb-2 h-8 w-8 object-contain"
          />
          <hr className="border-[1px] border-green-500 w-full mb-2" />
          <p className="text-black text-sm leading-tight">
            Resolve <br />
            <span className="font-bold">Pending Actions</span>
          </p>
        </div>

        {/* Card 3: Current Statement */}
        <div
          className="p-4 min-h-[100px] rounded-2xl flex flex-col items-start justify-start cursor-pointer"
          style={{
            background:
              "radial-gradient(185.83% 225.47% at 148.19% -135.83%, #D3D3D3 0%, #1E1E1E 100%)",
          }}
          onClick={() => openModal("statement")}
        >
          <img
            src="/vectors/HandCoins.png"
            alt="Hand Coins"
            className="mb-2 h-8 w-8 object-contain"
          />
          <hr className="border-white w-full mb-2" />
          <p className="text-white text-sm leading-tight">
            Current <br />
            Statement
          </p>
        </div>

        {/* Card 4: Invite Collaborator */}
        <div
          className="p-4 min-h-[100px] rounded-2xl flex flex-col items-start justify-start cursor-pointer"
          style={{
            background:
              "radial-gradient(60% 119.12% at 114.01% -10%, #00B4AE 0%, #004E4B 100%)",
          }}
          onClick={() => openModal("invite")}
        >
          <img
            src="/vectors/Share.png"
            alt="Share"
            className="mb-2 h-8 w-8 object-contain"
          />
          <hr className="border-white w-full mb-2" />
          <p className="text-white text-sm leading-tight">
            Invite <br />
            <span className="font-bold">Collaborator</span>
          </p>
        </div>
      </div>

      {/* Render the modals */}
      {modal === "add" && (
        <AddCommercialFacilityModal isOpen onClose={closeModal} />
      )}
      {modal === "resolve" && (
        <ResolvePendingActionsModal isOpen onClose={closeModal} />
      )}
      {modal === "statement" && (
        <CurrentStatementModal isOpen onClose={closeModal} />
      )}
      {modal === "invite" && (
        <InviteCollaboratorModal isOpen onClose={closeModal} />
      )}
    </div>
  );
}