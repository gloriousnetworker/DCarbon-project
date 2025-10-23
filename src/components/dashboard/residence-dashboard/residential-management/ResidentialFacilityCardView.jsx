import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiChevronRight, FiEdit2, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import FilterModal from "./FilterModal";
import FacilityDetails from "./residential-facility-details/ResidentialFacilityDetails";
import ConfirmationModal from "./ConfirmationModal";

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
  const [facilityProgress, setFacilityProgress] = useState({});
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [facilityDetails, setFacilityDetails] = useState({});

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

  const checkStage5Completion = (facility) => {
    return facility.status && facility.status.toLowerCase() === 'verified';
  };

  const checkStage6Completion = (facility) => {
    const requiredFields = [
      facility.commercialOperationDate,
      facility.eiaPlantId,
      facility.energyStorageCapacity,
      facility.hasOnSiteLoad,
      facility.hasNetMetering,
      facility.interconnectedUtilityId,
      facility.rpsId,
      facility.wregisEligibilityDate,
      facility.wregisId
    ];

    return requiredFields.every(field => {
      if (field === null || field === undefined || field === '' || field === 'N/A') {
        return false;
      }
      if (typeof field === 'boolean') return true;
      if (typeof field === 'string') return field.trim() !== '';
      if (typeof field === 'number') return true;
      return true;
    });
  };

  const fetchFacilityDetails = async (facilityId) => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) return null;

    try {
      const response = await axios.get(
        `https://services.dcarbon.solutions/api/residential-facility/get-one-residential-facility/${facilityId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching facility details:", error);
      return null;
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

      const progressData = {};
      const detailsData = {};

      for (const facility of facilities) {
        const facilityDetail = await fetchFacilityDetails(facility.id);
        if (facilityDetail) {
          detailsData[facility.id] = facilityDetail;
        }

        const facilityCompletedStages = [...newCompletedStages];
        let facilityCurrentStage = highestCompletedStage;

        const stage5Completed = checkStage5Completion(facilityDetail || facility);
        if (stage5Completed) {
          facilityCompletedStages.push(5);
          facilityCurrentStage = 5;
        } else if (facilityCurrentStage === 4) {
          facilityCurrentStage = 5;
        }

        const stage6Completed = checkStage6Completion(facilityDetail || facility);
        if (stage6Completed) {
          facilityCompletedStages.push(6);
          facilityCurrentStage = 6;
        } else if (facilityCurrentStage === 5) {
          facilityCurrentStage = 6;
        }

        progressData[facility.id] = {
          completedStages: facilityCompletedStages,
          currentStage: facilityCurrentStage < 6 ? facilityCurrentStage + 1 : 6
        };
      }

      setFacilityProgress(progressData);
      setFacilityDetails(detailsData);
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
  }, []);

  useEffect(() => {
    if (facilities.length > 0) {
      checkUserProgress();
    }
  }, [facilities]);

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

const filteredFacilities = facilities
  .filter(f => {
    if (filters.name && !f.facilityName.toLowerCase().includes(filters.name.toLowerCase()) && 
        !f.address.toLowerCase().includes(filters.name.toLowerCase())) return false;
    if (filters.utility !== "All" && f.utilityProvider !== filters.utility) return false;
    if (filters.meterId && !f.meterId.toLowerCase().includes(filters.meterId.toLowerCase())) return false;
    if (filters.status !== "All" && f.status.toLowerCase() !== filters.status.toLowerCase()) return false;
    if (filters.createdDate) {
      const [start, end] = filters.createdDate.split(',');
      const facilityDate = new Date(f.createdAt).toISOString().slice(0, 10);
      if (start && new Date(facilityDate) < new Date(start)) return false;
      if (end && new Date(facilityDate) > new Date(end)) return false;
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
            checkUserProgress();
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
          Solar System Management
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
          {filteredFacilities.map(facility => {
            const progress = facilityProgress[facility.id] || { completedStages: [1], currentStage: 2 };
            const facilityDetail = facilityDetails[facility.id] || facility;
            
            return (
              <div
                key={facility.id}
                className="border border-[#039994] rounded-lg bg-white hover:shadow transition-shadow flex flex-col justify-between p-2"
              >
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-base text-[#039994]">
                      {facilityDetail.facilityName || "N/A"}
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
                    <span className="font-medium">Facility ID:</span>
                    <span className="font-mono text-xs">{facility.id || "N/A"}</span>

                    <span className="font-medium">Current Tier:</span>
                    <span className="font-semibold">{facilityDetail.currentTier || "N/A"}</span>

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
                      Stage {progress.currentStage} of 6
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2 px-1">
                    {[1, 2, 3, 4, 5, 6].map((stage) => (
                      <div key={stage} className="flex flex-col items-center">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center border-2 text-xs ${
                            progress.completedStages.includes(stage)
                              ? "bg-[#039994] border-[#039994] text-white"
                              : stage === progress.currentStage
                              ? "border-[#039994] text-[#039994]"
                              : "border-gray-300 text-gray-400"
                          }`}
                        >
                          {stage}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between px-1 -mt-1">
                    {[1, 2, 3, 4, 5].map((stage) => (
                      <div
                        key={stage}
                        className={`h-0.5 flex-1 mx-0.5 ${
                          progress.completedStages.includes(stage + 1) ? "bg-[#039994]" : "bg-gray-200"
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
            );
          })}
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