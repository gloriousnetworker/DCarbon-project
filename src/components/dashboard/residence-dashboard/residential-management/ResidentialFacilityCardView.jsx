import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiChevronRight, FiEdit2, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import FilterModal from "./FilterModal";
import FacilityDetails from "./ResidentialFacilityDetails";
import ConfirmationModal from "./ConfirmationModal";

const ProgressTracker = ({ currentStage, completedStages, onStageClick }) => {
  const stages = [
    { id: 1, name: "Dashboard Access", tooltip: "Welcome to your dashboard" },
    { id: 2, name: "Financial Info", tooltip: "Complete financial information" },
    { id: 3, name: "Agreements", tooltip: "Sign terms and conditions" },
    { id: 4, name: "Utility Auth", tooltip: "Authorize utility access" }
  ];

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Onboarding Progress</h2>
        <span className="text-sm font-medium text-[#039994]">
          Stage {currentStage} of {stages.length}
        </span>
      </div>
      <div className="relative">
        <div className="flex justify-between mb-2">
          {stages.map((stage) => (
            <div 
              key={stage.id} 
              className="flex flex-col items-center group relative"
              onClick={() => completedStages.includes(stage.id) ? onStageClick(stage.id) : null}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 cursor-pointer ${
                  completedStages.includes(stage.id)
                    ? "bg-[#039994] border-[#039994] text-white"
                    : stage.id === currentStage
                    ? "border-[#039994] text-[#039994]"
                    : "border-gray-300 text-gray-400"
                } ${completedStages.includes(stage.id) ? 'hover:bg-[#028882]' : ''}`}
              >
                {stage.id}
              </div>
              <span
                className={`text-xs mt-1 text-center ${
                  completedStages.includes(stage.id) || stage.id === currentStage
                    ? "text-[#039994] font-medium"
                    : "text-gray-500"
                }`}
              >
                {stage.name}
              </span>
              {completedStages.includes(stage.id) && (
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="relative bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                    {stage.tooltip}
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="absolute top-4 left-0 right-0 flex justify-between px-4 -z-10">
          {stages.slice(0, stages.length - 1).map((stage) => (
            <div
              key={stage.id}
              className={`h-1 flex-1 mx-2 ${
                completedStages.includes(stage.id + 1) ? "bg-[#039994]" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default function FacilityCardView() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    utility: "All",
    meterId: "",
    status: "All",
    createdDate: "",
    financeType: "All",
    installer: "All"
  });
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [facilityToDelete, setFacilityToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const [completedStages, setCompletedStages] = useState([]);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  const checkStage2Completion = async (userId, authToken) => {
    try {
      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/financial-info/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      const result = await response.json();
      return result.status === 'success' && result.data?.financialInfo;
    } catch (error) {
      return false;
    }
  };

  const checkStage3Completion = async (userId, authToken) => {
    try {
      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/agreement/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      const result = await response.json();
      return result.status === 'success' && result.data?.termsAccepted;
    } catch (error) {
      return false;
    }
  };

  const checkStage4Completion = async (userId, authToken) => {
    try {
      const response = await fetch(
        `https://services.dcarbon.solutions/api/auth/user-meters/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      const result = await response.json();
      return result.status === 'success' && result.data?.length > 0;
    } catch (error) {
      return false;
    }
  };

  const checkUserProgress = async () => {
    try {
      setIsLoadingProgress(true);
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id || localStorage.getItem("userId");
      const authToken = loginResponse?.data?.token || localStorage.getItem("authToken");

      if (!userId || !authToken) return;

      const newCompletedStages = [1];
      let highestCompletedStage = 1;

      const stage2Completed = await checkStage2Completion(userId, authToken);
      if (stage2Completed) {
        newCompletedStages.push(2);
        highestCompletedStage = 2;
      }

      const stage3Completed = await checkStage3Completion(userId, authToken);
      if (stage3Completed) {
        newCompletedStages.push(3);
        highestCompletedStage = 3;
      }

      const stage4Completed = await checkStage4Completion(userId, authToken);
      if (stage4Completed) {
        newCompletedStages.push(4);
        highestCompletedStage = 4;
      }

      setCompletedStages(newCompletedStages);
      setCurrentStage(highestCompletedStage < 4 ? highestCompletedStage + 1 : 4);
    } catch (error) {
      console.error('Error checking user progress:', error);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  const fetchFacilities = async () => {
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");
    if (!userId || !authToken) {
      toast.error("Authentication required");
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.get(
        `https://services.dcarbon.solutions/api/residential-facility/get-user-facilities/${userId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (data.status === "success") {
        const formattedFacilities = data.data.facilities.map(facility => ({
          ...facility,
          meterId: facility.meterId.split('_')[0] || facility.meterId
        }));
        setFacilities(formattedFacilities);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load facilities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
    checkUserProgress();
  }, []);

  const handleApplyFilter = newFilters => {
    setFilters(newFilters);
    setShowFilterModal(false);
  };

  const formatDate = iso => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDeleteFacility = async () => {
    if (!facilityToDelete) return;
    
    setIsDeleting(true);
    try {
      const authToken = localStorage.getItem("authToken");
      const { data } = await axios.delete(
        `https://services.dcarbon.solutions/api/residential-facility/${facilityToDelete.id}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (data.status === "success") {
        toast.success("Facility deleted successfully");
        setFacilityToDelete(null);
        fetchFacilities();
        if (selectedFacility?.id === facilityToDelete.id) {
          setSelectedFacility(null);
        }
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete facility");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStageClick = (stageId) => {
    console.log(`Stage ${stageId} clicked`);
  };

  const filteredFacilities = facilities
    .filter(f => {
      if (filters.name && !f.facilityName.toLowerCase().includes(filters.name.toLowerCase()) && 
          !f.address.toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.utility !== "All" && f.utilityProvider !== filters.utility) return false;
      if (filters.meterId && !f.meterId.toLowerCase().includes(filters.meterId.toLowerCase())) return false;
      if (filters.status !== "All" && f.status.toLowerCase() !== filters.status.toLowerCase()) return false;
      if (filters.createdDate) {
        const d = new Date(f.createdAt).toISOString().slice(0, 10);
        if (d !== filters.createdDate) return false;
      }
      if (filters.financeType !== "All" && f.financeType.toLowerCase() !== filters.financeType.toLowerCase()) return false;
      if (filters.installer !== "All" && f.installer.toLowerCase() !== filters.installer.toLowerCase()) return false;
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (selectedFacility) {
    return (
      <div className="p-2">
        <FacilityDetails
          facility={selectedFacility}
          onBack={() => setSelectedFacility(null)}
          onFacilityUpdated={(updatedFacility) => {
            setFacilities(prev => prev.map(f => 
              f.id === updatedFacility.id ? updatedFacility : f
            ));
            setSelectedFacility(updatedFacility);
          }}
          onDelete={async () => {
            try {
              const authToken = localStorage.getItem("authToken");
              await axios.delete(
                `https://services.dcarbon.solutions/api/residential-facility/${selectedFacility.id}`,
                { headers: { Authorization: `Bearer ${authToken}` } }
              );
              toast.success("Facility deleted successfully");
              setSelectedFacility(null);
              fetchFacilities();
            } catch (err) {
              toast.error(err.message || "Failed to delete facility");
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-2">      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold" style={{ color: "#039994" }}>
          Residential Facilities
        </h2>
        <button
          onClick={() => setShowFilterModal(true)}
          className="px-3 py-1 border border-[#039994] text-[#039994] text-sm rounded hover:bg-[#03999421]"
        >
          Filter
        </button>
      </div>

      {loading || isLoadingProgress ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#039994]" />
        </div>
      ) : filteredFacilities.length === 0 ? (
        <div className="text-center py-6 text-sm text-gray-500">
          No facilities found
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredFacilities.map(facility => (
            <div
              key={facility.id}
              className="border border-[#039994] rounded-lg bg-white hover:shadow transition-shadow flex flex-col justify-between p-2"
            >
              <div>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-base text-[#039994]">
                    {facility.facilityName || "N/A"}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFacilityToDelete(facility);
                      }}
                      className="text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-1 text-xs">
                  <span className="font-medium">Address:</span>
                  <span>{facility.address || "N/A"}</span>

                  <span className="font-medium">Utility:</span>
                  <span>{facility.utilityProvider || "N/A"}</span>

                  <span className="font-medium">Installer:</span>
                  <span>{facility.installer || "N/A"}</span>

                  <span className="font-medium">Finance Type:</span>
                  <span className="capitalize">{facility.financeType || "N/A"}</span>

                  <span className="font-medium">Finance Company:</span>
                  <span>{facility.financeCompany || "N/A"}</span>

                  <span className="font-medium">Meter ID:</span>
                  <span>{facility.meterId || "N/A"}</span>

                  <span className="font-medium">Zip Code:</span>
                  <span>{facility.zipCode || "N/A"}</span>

                  <span className="font-medium">Status:</span>
                  <span className="capitalize">{facility.status || "N/A"}</span>

                  <span className="font-medium">Created:</span>
                  <span>{formatDate(facility.createdAt)}</span>
                </div>
              </div>
              <div className="mt-2 mb-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-gray-600">Onboarding Progress</span>
                  <span className="text-xs font-medium text-[#039994]">
                    Stage {currentStage} of 4
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  {[1, 2, 3, 4].map((stage) => (
                    <div key={stage} className="flex flex-col items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-xs ${
                          completedStages.includes(stage)
                            ? "bg-[#039994] border-[#039994] text-white"
                            : stage === currentStage
                            ? "border-[#039994] text-[#039994]"
                            : "border-gray-300 text-gray-400"
                        }`}
                      >
                        {stage}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between px-3 -mt-1">
                  {[1, 2, 3].map((stage) => (
                    <div
                      key={stage}
                      className={`h-0.5 flex-1 mx-1 ${
                        completedStages.includes(stage + 1) ? "bg-[#039994]" : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div
                onClick={() => setSelectedFacility(facility)}
                className="flex items-center justify-between mt-2 px-1 py-1 cursor-pointer"
                style={{ backgroundColor: "#069B9621" }}
              >
                <span className="text-[#039994] text-xs font-medium">
                  View details
                </span>
                <FiChevronRight size={16} className="text-[#039994]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {showFilterModal && (
        <FilterModal
          onClose={() => setShowFilterModal(false)}
          onApplyFilter={handleApplyFilter}
        />
      )}

      {facilityToDelete && (
        <ConfirmationModal
          isOpen={!!facilityToDelete}
          onClose={() => setFacilityToDelete(null)}
          onConfirm={handleDeleteFacility}
          title="Confirm Delete"
          message={`Are you sure you want to delete the facility ${facilityToDelete.facilityName || facilityToDelete.address || 'this facility'}?`}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}