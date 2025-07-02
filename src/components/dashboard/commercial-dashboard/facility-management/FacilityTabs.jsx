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

  const checkButtonStatus = () => {
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

      if (userData.registrationStep !== 5) {
        setIsButtonDisabled(true);
        setDisableReason("Registration not complete");
        return;
      }

      const utilityAuth = userData.utilityAuth;
      if (!utilityAuth || !Array.isArray(utilityAuth) || utilityAuth.length === 0) {
        setIsButtonDisabled(true);
        setDisableReason("Utility authorization required");
        return;
      }

      const hasValidUtilityAuth = utilityAuth.some(auth => {
        if (!auth || !auth.status || auth.status.trim() === "") {
          return false;
        }
        
        if (auth.status === "UPDATE_ERROR" || auth.status === "DECLINE") {
          return false;
        }
        
        return true;
      });

      if (!hasValidUtilityAuth) {
        const hasUpdateError = utilityAuth.some(auth => 
          auth && auth.status === "UPDATE_ERROR"
        );
        const hasDecline = utilityAuth.some(auth => 
          auth && auth.status === "DECLINE"
        );
        
        if (hasUpdateError) {
          setIsButtonDisabled(true);
          setDisableReason("Utility authorization update error - please resolve");
          return;
        }
        
        if (hasDecline) {
          setIsButtonDisabled(true);
          setDisableReason("Utility authorization declined - please re-authorize");
          return;
        }
        
        setIsButtonDisabled(true);
        setDisableReason("Valid utility authorization required");
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