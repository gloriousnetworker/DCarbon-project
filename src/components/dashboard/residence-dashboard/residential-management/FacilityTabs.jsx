// ===== RESIDENTIAL FACILITY TABS COMPONENT =====
import React, { useState, useEffect } from "react";
import { FiGrid, FiList, FiFilter } from "react-icons/fi";
import AddResidentialFacilityModal from "../overview/modals/AddResidenceModal";
import { buttonPrimary } from "./styles";

export default function ResidentialFacilityTabs({
  viewMode,
  setViewMode,
  onAddFacility,
  onFilter,
  isOpen
}) {
  const [showAddFacilityModal, setShowAddFacilityModal] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [disabledReason, setDisabledReason] = useState("");

  useEffect(() => {
    checkButtonStatus();
  }, []);

  const checkButtonStatus = async () => {
    try {
      const loginResponse = localStorage.getItem("loginResponse");
      
      if (!loginResponse) {
        setIsButtonDisabled(true);
        setDisabledReason("Please log in to continue");
        return;
      }

      const parsedResponse = JSON.parse(loginResponse);
      const user = parsedResponse?.data?.user;

      if (!user) {
        setIsButtonDisabled(true);
        setDisabledReason("User information not found");
        return;
      }

      const userId = user.id;
      const authToken = localStorage.getItem("authToken");

      if (!userId || !authToken) {
        setIsButtonDisabled(true);
        setDisabledReason("User ID or auth token not found");
        return;
      }

      const response = await fetch(`https://services.dcarbon.solutions/api/auth/user-meters/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        setIsButtonDisabled(true);
        setDisabledReason("Failed to fetch user meters");
        return;
      }

      const meterData = await response.json();

      if (meterData.status !== "success") {
        setIsButtonDisabled(true);
        setDisabledReason("Failed to fetch meters");
        return;
      }

      const hasValidMeters = meterData.data && meterData.data.some(item => 
        item.meters && 
        item.meters.meters && 
        Array.isArray(item.meters.meters) && 
        item.meters.meters.length > 0
      );

      if (!hasValidMeters) {
        setIsButtonDisabled(true);
        setDisabledReason("No valid meters found");
        return;
      }

      setIsButtonDisabled(false);
      setDisabledReason("");

    } catch (error) {
      console.error("Error checking button status:", error);
      setIsButtonDisabled(true);
      setDisabledReason("Error verifying account status");
    }
  };

  const handleAddFacilityClick = () => {
    if (isButtonDisabled) {
      return;
    }
    setShowAddFacilityModal(true);
  };

  const handleCloseModal = () => {
    setShowAddFacilityModal(false);
    if (onAddFacility) {
      onAddFacility();
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        {/* Left side: two icons (Grid / List) */}
        <div className="flex items-center space-x-4">
          {/* Grid Icon */}
          <button
            onClick={() => setViewMode("cards")}
            className={`
              p-2 rounded-full flex items-center justify-center transition-colors duration-200
              ${viewMode === "cards" ? "bg-[#039994] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}
            `}
          >
            <FiGrid size={18} />
          </button>
          {/* List Icon */}
          <button
            onClick={() => setViewMode("table")}
            className={`
              p-2 rounded-full flex items-center justify-center transition-colors duration-200
              ${viewMode === "table" ? "bg-[#039994] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}
            `}
          >
            <FiList size={18} />
          </button>
        </div>

        {/* Right side: Filter + Add Facility */}
        <div className="flex items-center space-x-2">
          {/* Add Residential Facility Button */}
          <div className="relative group">
            <button
              onClick={handleAddFacilityClick}
              disabled={isButtonDisabled}
              className={`
                ${buttonPrimary} 
                px-3 py-2 rounded-md text-sm transition-colors duration-200
                ${isButtonDisabled 
                  ? 'opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400' 
                  : 'hover:bg-[#028c8c]'
                }
              `}
              title={isButtonDisabled ? disabledReason : "Add a new residential facility"}
            >
              + Add Residential Facility
            </button>
            
            {/* Tooltip for disabled state */}
            {isButtonDisabled && disabledReason && (
              <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                {disabledReason}
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Residential Facility Modal */}
      <AddResidentialFacilityModal
        isOpen={showAddFacilityModal}
        onClose={handleCloseModal}
      />
    </>
  );
}