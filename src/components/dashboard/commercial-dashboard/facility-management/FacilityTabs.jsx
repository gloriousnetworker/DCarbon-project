import React, { useState, useEffect } from "react";
import { FiGrid, FiList, FiFilter } from "react-icons/fi";
import AddCommercialFacilityModal from "./AddFacilityModal";

export default function CommercialFacilityTabs({
  viewMode,
  setViewMode,
  onFilter,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [disableReason, setDisableReason] = useState("");

  useEffect(() => {
    checkButtonStatus();
  }, []);

  const checkButtonStatus = async () => {
    try {
      const loginResponse = localStorage.getItem("loginResponse");
      
      if (!loginResponse) {
        setIsButtonDisabled(true);
        setDisableReason("Not logged in");
        return;
      }

      const parsedResponse = JSON.parse(loginResponse);
      
      if (parsedResponse.status !== "success") {
        setIsButtonDisabled(true);
        setDisableReason("Login not successful");
        return;
      }

      const userData = parsedResponse.data?.user;
      
      if (!userData) {
        setIsButtonDisabled(true);
        setDisableReason("User data not found");
        return;
      }

      const userId = userData.id;
      const authToken = localStorage.getItem("authToken");

      if (!userId || !authToken) {
        setIsButtonDisabled(true);
        setDisableReason("User ID or auth token not found");
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
        setDisableReason("Failed to fetch user meters");
        return;
      }

      const meterData = await response.json();

      if (meterData.status !== "success") {
        setIsButtonDisabled(true);
        setDisableReason("Failed to fetch meters");
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
        setDisableReason("No valid meters found");
        return;
      }

      setIsButtonDisabled(false);
      setDisableReason("");

    } catch (error) {
      console.error("Error checking button status:", error);
      setIsButtonDisabled(true);
      setDisableReason("Error validating user data");
    }
  };

  const handleAddFacility = () => {
    if (!isButtonDisabled) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setViewMode("cards")}
            className={`
              p-2 rounded-full flex items-center justify-center
              ${viewMode === "cards" ? "bg-[#039994] text-white" : "bg-gray-100 text-gray-500"}
            `}
          >
            <FiGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`
              p-2 rounded-full flex items-center justify-center
              ${viewMode === "table" ? "bg-[#039994] text-white" : "bg-gray-100 text-gray-500"}
            `}
          >
            <FiList size={18} />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative group">
            <button
              onClick={handleAddFacility}
              disabled={isButtonDisabled}
              className={`
                px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                ${isButtonDisabled 
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                  : "bg-[#039994] text-white hover:bg-[#028c8c] cursor-pointer"
                }
              `}
              title={isButtonDisabled ? disableReason : "Add a new commercial facility"}
            >
              + Add Commercial Facility
            </button>
            
            {isButtonDisabled && disableReason && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                {disableReason}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddCommercialFacilityModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}