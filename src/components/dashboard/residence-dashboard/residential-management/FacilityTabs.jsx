import React, { useState, useEffect } from "react";
import { FiGrid, FiList } from "react-icons/fi";
import AddResidentialFacilityModal from "../overview/modals/AddResidenceModal";
import { buttonPrimary } from "./styles";

export default function ResidentialFacilityTabs({
  viewMode,
  setViewMode,
  onAddFacility
}) {
  const [showAddFacilityModal, setShowAddFacilityModal] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [disabledReason, setDisabledReason] = useState("Checking meters...");

  useEffect(() => {
    checkMeters();
  }, []);

  const checkMeters = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");

      if (!userId || !authToken) {
        setIsButtonDisabled(true);
        setDisabledReason("Authentication required");
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
        setDisabledReason("Failed to fetch meters");
        return;
      }

      const meterData = await response.json();

      if (meterData.status !== "success") {
        setIsButtonDisabled(true);
        setDisabledReason("No meters found");
        return;
      }

      const hasValidMeters = meterData.data?.some(item => 
        item.meters?.meters?.length > 0
      );

      if (hasValidMeters) {
        setIsButtonDisabled(false);
        setDisabledReason("");
      } else {
        setIsButtonDisabled(true);
        setDisabledReason("No valid meters found");
      }

    } catch (error) {
      setIsButtonDisabled(true);
      setDisabledReason("Error checking meters");
    }
  };

  const handleAddFacilityClick = () => {
    if (!isButtonDisabled) {
      setShowAddFacilityModal(true);
    }
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
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setViewMode("cards")}
            className={`
              p-2 rounded-full flex items-center justify-center transition-colors duration-200
              ${viewMode === "cards" ? "bg-[#039994] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}
            `}
          >
            <FiGrid size={18} />
          </button>
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

        <div className="flex items-center space-x-2">
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
            
            {isButtonDisabled && disabledReason && (
              <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                {disabledReason}
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddResidentialFacilityModal
        isOpen={showAddFacilityModal}
        onClose={handleCloseModal}
      />
    </>
  );
}