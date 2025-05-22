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

export default function QuickActions({ authStatus, setAuthStatus }) {
  const [modal, setModal] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    const checkUtilityAuthorization = async () => {
      try {
        setIsLoading(true);
        
        // Get userId and authToken from localStorage
        const userId = typeof window !== 'undefined' ? localStorage.getItem("userId") : null;
        const authToken = typeof window !== 'undefined' ? localStorage.getItem("authToken") : null;
        
        if (!userId || !authToken) {
          console.error("Missing userId or authToken");
          setIsLoading(false);
          return;
        }

        // Make API call to check utility authorization
        const response = await fetch(
          `https://services.dcarbon.solutions/api/user/utility-authorization/${userId}`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${authToken}`,
              "Content-Type": "application/json"
            }
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch authorization status");
        }

        const data = await response.json();
        
        if (data.status === "success" && data.data?.status === "AUTHORIZED") {
          setAuthStatus("AUTHORIZED");
          localStorage.setItem("utilityAuthStatus", "AUTHORIZED");
        } else {
          // Use the status from the API response if available
          const status = data.data?.status || "PENDING";
          setAuthStatus(status);
          localStorage.setItem("utilityAuthStatus", status);
        }
        
        setAuthCheckComplete(true);
      } catch (error) {
        console.error("Error checking utility authorization:", error);
        // Fallback to checking localStorage
        const storedAuthStatus = localStorage.getItem("utilityAuthStatus");
        if (storedAuthStatus) {
          setAuthStatus(storedAuthStatus);
        } else {
          const utilityRequest = typeof window !== 'undefined' ? 
            JSON.parse(localStorage.getItem("utilityProviderRequest") || "null") : 
            null;
          if (utilityRequest) {
            setAuthStatus(utilityRequest.status || "PENDING");
          } else {
            setAuthStatus("PENDING");
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkUtilityAuthorization();
  }, [setAuthStatus]);

  const openModal = (type) => {
    // Prevent opening add facility modal if not authorized
    if (type === "add" && authStatus !== "AUTHORIZED") {
      return;
    }
    setModal(type);
  };

  const closeModal = () => {
    setModal("");
  };

  const isAddDisabled = authStatus !== "AUTHORIZED" || isLoading;

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
          title={isAddDisabled ? `Utility provider authorization status: ${authStatus}` : ""}
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
          {isLoading && !authCheckComplete && (
            <div className="mt-1 text-white text-xs">Checking authorization...</div>
          )}
          {authStatus !== "AUTHORIZED" && authCheckComplete && (
            <div className="mt-1 text-white text-xs">Authorization required</div>
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