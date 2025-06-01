import React, { useState, useEffect } from "react";
import { FiGrid, FiList, FiFilter } from "react-icons/fi";
import AddCommercialFacilityModal from "./AddFacilityModal";

export default function FacilityTabs({
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

  const checkButtonStatus = () => {
    try {
      const loginResponse = localStorage.getItem("loginResponse");
      
      if (!loginResponse) {
        setIsButtonDisabled(true);
        setDisableReason("Not logged in");
        return;
      }

      const parsedResponse = JSON.parse(loginResponse);
      
      // Check if login was successful
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

      // Check if agreements exist and are not empty
      const agreements = userData.agreements;
      if (!agreements || Object.keys(agreements).length === 0) {
        setIsButtonDisabled(true);
        setDisableReason("User agreements required");
        return;
      }

      // Check if utilityAuth exists and has valid status
      const utilityAuth = userData.utilityAuth;
      if (!utilityAuth || !Array.isArray(utilityAuth) || utilityAuth.length === 0) {
        setIsButtonDisabled(true);
        setDisableReason("Utility authorization required");
        return;
      }

      // Check if at least one utilityAuth has a status
      const hasValidUtilityAuth = utilityAuth.some(auth => 
        auth && auth.status && auth.status.trim() !== ""
      );

      if (!hasValidUtilityAuth) {
        setIsButtonDisabled(true);
        setDisableReason("Valid utility authorization required");
        return;
      }

      // All checks passed
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
        {/* Left side: two icons (Grid / List) */}
        <div className="flex items-center space-x-4">
          {/* Grid Icon */}
          <button
            onClick={() => setViewMode("cards")}
            className={`
              p-2 rounded-full flex items-center justify-center
              ${viewMode === "cards" ? "bg-[#039994] text-white" : "bg-gray-100 text-gray-500"}
            `}
          >
            <FiGrid size={18} />
          </button>
          {/* List Icon */}
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

        {/* Right side: Filter + Add Facility */}
        <div className="flex items-center space-x-2">
          {/* Uncomment if you want to use the filter button */}
          {/* <button
            onClick={onFilter}
            className="flex items-center space-x-1 border border-gray-300 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
          >
            <FiFilter />
            <span>Filter by</span>
          </button> */}
          
          <div className="relative">
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
            
            {/* Tooltip for disabled state */}
            {isButtonDisabled && disableReason && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                {disableReason}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Commercial Facility Modal */}
      <AddCommercialFacilityModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}