import React, { useState, useEffect } from "react";
import { axiosInstance } from "../../../../../lib/config";
import { FiGrid, FiList, FiFilter } from "react-icons/fi";
import AddCommercialFacilityModal from "./AddFacilityModal";

export default function CommercialFacilityTabs({
  viewMode,
  setViewMode,
  onFilter,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [disableReason, setDisableReason] = useState("Checking utility accounts...");

  useEffect(() => {
    checkUtilityAuth();
  }, []);

  const checkUtilityAuth = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");

      if (!userId || !authToken) {
        setIsButtonDisabled(true);
        setDisableReason("Authentication required");
        return;
      }

      const response = await axiosInstance.get(`/api/auth/utility-auth/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      const utilityData = response.data;

      if (utilityData.status !== "success") {
        setIsButtonDisabled(true);
        setDisableReason("No utility accounts found");
        return;
      }

      const hasValidUtilityAccount = utilityData.data?.some(item => 
        item.hasMeter === true && item.utilityAuthEmail && item.meters?.length > 0
      );

      if (hasValidUtilityAccount) {
        setIsButtonDisabled(false);
        setDisableReason("");
      } else {
        setIsButtonDisabled(true);
        setDisableReason("No valid utility accounts found");
      }

    } catch (error) {
      console.error("Error checking utility accounts:", error);
      setIsButtonDisabled(true);
      setDisableReason("Error checking utility accounts");
    }
  };

  const handleAddFacility = () => {
    if (!isButtonDisabled) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    checkUtilityAuth();
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