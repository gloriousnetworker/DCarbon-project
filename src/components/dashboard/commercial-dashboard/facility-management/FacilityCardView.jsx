import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiChevronRight } from "react-icons/fi";
import toast from "react-hot-toast";
import FilterModal from "./FilterModal";
import FacilityDetails from "./FacilityDetails";

export default function FacilityCardView() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    role: "All",
    entityType: "All",
    utility: "All",
    meterId: "",
    status: "All",
    createdDate: "",
  });
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [facilityProgress, setFacilityProgress] = useState({});
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  const checkStage2Completion = async (userId, authToken) => {
    try {
      const response = await fetch(`https://services.dcarbon.solutions/api/user/get-commercial-user/${userId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const result = await response.json();
      return result.status === 'success' && result.data?.commercialUser?.ownerAddress;
    } catch (error) {
      return false;
    }
  };

  const checkStage3Completion = async (userId, authToken) => {
    try {
      const response = await fetch(`https://services.dcarbon.solutions/api/user/agreement/${userId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const result = await response.json();
      return result.status === 'success' && result.data?.termsAccepted;
    } catch (error) {
      return false;
    }
  };

  const checkStage4Completion = async (userId, authToken) => {
    try {
      const response = await fetch(`https://services.dcarbon.solutions/api/user/financial-info/${userId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const result = await response.json();
      return result.status === 'success' && result.data?.financialInfo;
    } catch (error) {
      return false;
    }
  };

  const checkStage5Completion = async (userId, authToken) => {
    try {
      const response = await fetch(`https://services.dcarbon.solutions/api/auth/user-meters/${userId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const result = await response.json();
      return result.status === 'success' && result.data?.length > 0 && result.data.some(item => item.meters?.meters?.length > 0);
    } catch (error) {
      return false;
    }
  };

  const checkStage6Completion = (facility) => {
    return facility.status && facility.status.toLowerCase() === 'verified';
  };

  const checkUserProgress = async () => {
    try {
      setIsLoadingProgress(true);
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;
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

      const stage5Completed = await checkStage5Completion(userId, authToken);
      if (stage5Completed) {
        newCompletedStages.push(5);
        highestCompletedStage = 5;
      }

      const progressData = {};
      facilities.forEach(facility => {
        const facilityCompletedStages = [...newCompletedStages];
        let facilityCurrentStage = highestCompletedStage;

        const stage6Completed = checkStage6Completion(facility);
        if (stage6Completed) {
          facilityCompletedStages.push(6);
          facilityCurrentStage = 6;
        } else if (facilityCurrentStage === 5) {
          facilityCurrentStage = 6;
        }

        progressData[facility.id] = {
          completedStages: facilityCompletedStages,
          currentStage: facilityCurrentStage
        };
      });

      setFacilityProgress(progressData);
    } catch (error) {
      console.error('Error checking user progress:', error);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  const getCircleProgressSegments = (facilityId) => {
    const progress = facilityProgress[facilityId] || { completedStages: [1], currentStage: 2 };
    const segments = [];
    
    for (let i = 1; i <= 6; i++) {
      segments.push(
        <div
          key={i}
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
            progress.completedStages.includes(i) ? "bg-[#039994] border-[#039994]" : 
            i === progress.currentStage ? "border-[#039994] bg-white" : "border-gray-300 bg-white"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              progress.completedStages.includes(i) ? "bg-white" : "bg-gray-300"
            }`}
          />
        </div>
      );
    }
    return segments;
  };

  const fetchFacilities = async () => {
    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');
    if (!userId || !authToken) {
      toast.error("Authentication required");
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.get(
        `https://services.dcarbon.solutions/api/facility/get-user-facilities-by-userId/${userId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (data.status === "success") setFacilities(data.data.facilities);
      else throw new Error(data.message);
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

  const formatMeterIds = meterIds => {
    if (!meterIds || meterIds.length === 0) return "N/A";
    return meterIds.map(id => id.split('_')[0] || id).join(', ');
  };

  const filteredFacilities = facilities
    .filter(f => {
      if (filters.name && !f.facilityName.toLowerCase().includes(filters.name.toLowerCase())) return false;
      if (filters.role !== "All" && f.commercialRole.toLowerCase() !== filters.role.toLowerCase()) return false;
      if (filters.entityType !== "All" && f.entityType.toLowerCase() !== filters.entityType.toLowerCase()) return false;
      if (filters.utility !== "All" && f.utilityProvider !== filters.utility) return false;
      if (filters.meterId && !f.meterIds?.some(id => id.toLowerCase().includes(filters.meterId.toLowerCase()))) return false;
      if (filters.status !== "All" && f.status.toLowerCase() !== filters.status.toLowerCase()) return false;
      if (filters.createdDate) {
        const d = new Date(f.createdAt).toISOString().slice(0, 10);
        if (d !== filters.createdDate) return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (selectedFacility) {
    return (
      <div className="p-2">
        <FacilityDetails
          facility={selectedFacility}
          onBack={() => setSelectedFacility(null)}
        />
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold" style={{ color: "#039994" }}>
          My Facilities
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
            
            return (
              <div
                key={facility.id}
                onClick={() => setSelectedFacility(facility)}
                className="border border-[#039994] rounded-lg bg-white cursor-pointer hover:shadow transition-shadow flex flex-col justify-between p-2"
              >
                <div>
                  <h3 className="font-semibold text-base text-[#039994] mb-1">
                    {facility.facilityName}
                  </h3>
                  <div className="grid grid-cols-2 gap-y-1 text-xs">
                    <span className="font-medium">Role:</span>
                    <span className="capitalize">{facility.commercialRole}</span>

                    <span className="font-medium">Type:</span>
                    <span className="capitalize">{facility.entityType}</span>

                    <span className="font-medium">Utility:</span>
                    <span>{facility.utilityProvider}</span>

                    <span className="font-medium">Meter ID:</span>
                    <span>{formatMeterIds(facility.meterIds)}</span>

                    <span className="font-medium">Status:</span>
                    <span className="capitalize">{facility.status}</span>

                    <span className="font-medium">Created:</span>
                    <span>{formatDate(facility.createdAt)}</span>
                  </div>
                  
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600">Progress</span>
                      <span className="text-xs font-medium text-[#039994]">
                        Step {progress.currentStage} of 6
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      {getCircleProgressSegments(facility.id)}
                    </div>
                  </div>
                </div>
                <div
                  className="flex items-center justify-between mt-2 px-1 py-1"
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
    </div>
  );
}