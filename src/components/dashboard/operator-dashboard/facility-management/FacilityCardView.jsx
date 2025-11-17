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
  const [authorizingFacility, setAuthorizingFacility] = useState(null);
  const [showIframe, setShowIframe] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [iframeUrl, setIframeUrl] = useState("");
  const [scale, setScale] = useState(1);
  const [currentFacility, setCurrentFacility] = useState(null);

  const greenButtonUtilities = ['San Diego Gas and Electric', 'Pacific Gas and Electric', 'Southern California Edison'];

  const isGreenButtonUtility = (utilityProvider) => {
    return greenButtonUtilities.includes(utilityProvider);
  };

  const getUtilityUrl = (utilityName) => {
    const utilityUrls = {
      'PG&E': 'https://myaccount.pge.com/myaccount/s/login/?language=en_US',
      'Pacific Gas and Electric': 'https://myaccount.pge.com/myaccount/s/login/?language=en_US',
      'San Diego Gas and Electric': 'https://myenergycenter.com/portal/PreLogin/Validate',
      'SDG&E': 'https://myenergycenter.com/portal/PreLogin/Validate',
      'SCE': 'https://myaccount.sce.com/myaccount/s/login/?language=en_US',
      'Southern California Edison': 'https://myaccount.sce.com/myaccount/s/login/?language=en_US'
    };
    
    return utilityUrls[utilityName] || 'https://utilityapi.com/authorize/DCarbon_Solutions';
  };

  const authorizeFacility = async (facility, e) => {
    e.stopPropagation();
    setAuthorizingFacility(facility.id);
    setCurrentFacility(facility);
    
    const isGreenButton = isGreenButtonUtility(facility.utilityProvider);
    
    if (isGreenButton) {
      setShowVideoModal(true);
    } else {
      const url = getUtilityUrl(facility.utilityProvider);
      setIframeUrl(url);
      setShowIframe(true);
      setScale(1);
    }
    
    setAuthorizingFacility(null);
  };

  const handleVideoComplete = () => {
    setShowVideoModal(false);
    if (currentFacility) {
      const url = getUtilityUrl(currentFacility.utilityProvider);
      setIframeUrl(url);
      setShowIframe(true);
      setScale(1);
    }
  };

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

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setScale(1);
  };

  const handleIframeClose = () => {
    setShowIframe(false);
    setScale(1);
    fetchFacilities();
  };

  const handleVideoModalClose = () => {
    setShowVideoModal(false);
    setCurrentFacility(null);
  };

  const VideoModal = ({ isOpen, onClose, facility, onVideoComplete }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="flex-shrink-0 p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sans">
                {facility?.utilityProvider} Authorization Instructions
              </h2>
              <button onClick={onClose} className="text-red-500 hover:text-red-700">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700 mb-4">
                <strong>Important:</strong> Please watch this instructional video to understand how to complete the {facility?.utilityProvider} authorization process.
              </p>
              
              <div className="bg-black rounded-lg aspect-video flex items-center justify-center mb-4">
                <div className="text-white text-center">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <p className="text-lg font-semibold">Instructional Video</p>
                  <p className="text-sm opacity-75">Video demonstration for {facility?.utilityProvider}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Estimated time: 2-3 minutes</span>
                <span>Mandatory viewing</span>
              </div>
            </div>

            <div className="flex justify-between gap-4 mt-8">
              <button
                onClick={onClose}
                className="flex-1 rounded-md bg-white border border-[#039994] text-[#039994] font-semibold py-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sans text-[14px] transition-colors"
              >
                Back
              </button>
              <button
                onClick={onVideoComplete}
                className="flex-1 rounded-md text-white font-semibold py-3 bg-[#039994] hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sans text-[14px] transition-colors"
              >
                I've Watched the Video - Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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

  if (showVideoModal) {
    return (
      <VideoModal
        isOpen={showVideoModal}
        onClose={handleVideoModalClose}
        facility={currentFacility}
        onVideoComplete={handleVideoComplete}
      />
    );
  }

  if (showIframe) {
    const isGreenButton = currentFacility && isGreenButtonUtility(currentFacility.utilityProvider);
    
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="relative w-full max-w-5xl h-[85vh] bg-white rounded-2xl overflow-hidden flex flex-col ml-16">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-[#039994]">
              {currentFacility?.utilityProvider} Authorization
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={zoomOut}
                  className="bg-gray-500 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-600 flex items-center gap-1"
                  disabled={scale <= 0.5}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Zoom Out
                </button>
                <button
                  onClick={resetZoom}
                  className="bg-gray-500 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-600 flex items-center gap-1"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 3H21V9M21 3L15 9M9 21H3V15M3 21L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Reset
                </button>
                <button
                  onClick={zoomIn}
                  className="bg-gray-500 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-600 flex items-center gap-1"
                  disabled={scale >= 3}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Zoom In
                </button>
              </div>
              <button
                onClick={handleIframeClose}
                className="text-red-500 hover:text-red-700"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div className={`p-4 border-b ${isGreenButton ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <p className={`text-sm ${isGreenButton ? 'text-green-700' : 'text-yellow-700'}`}>
              <strong>{currentFacility?.utilityProvider} Authorization:</strong> Follow the steps to securely share your utility data with DCarbon Solutions.
            </p>
            <p className={`text-sm ${isGreenButton ? 'text-green-700' : 'text-yellow-700'} mt-1`}>
              <strong>Selected Utility:</strong> {currentFacility?.utilityProvider}
            </p>
            <p className={`text-sm ${isGreenButton ? 'text-green-700' : 'text-yellow-700'} mt-1`}>
              <strong>Authorization URL:</strong> {iframeUrl}
            </p>
          </div>

          <div className="flex-1 p-4 bg-gray-100 overflow-hidden">
            <div className="w-full h-full bg-white rounded-lg overflow-auto">
              <div 
                className="w-full h-full origin-top-left"
                style={{ 
                  transform: `scale(${scale})`,
                  width: `${100/scale}%`,
                  height: `${100/scale}%`
                }}
              >
                <iframe
                  src={iframeUrl}
                  className="w-full h-full border-0"
                  title={`${currentFacility?.utilityProvider} Authorization`}
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />
              </div>
            </div>
          </div>

          <div className="p-3 border-t bg-gray-50 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Zoom: {Math.round(scale * 100)}%
            </span>
            <span className="text-sm text-gray-600">
              Use scroll to navigate when zoomed in
            </span>
          </div>
        </div>
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
            const isGreenButton = isGreenButtonUtility(facility.utilityProvider);
            const hasNoMeterIds = !facility.meterIds || facility.meterIds.length === 0;
            const isPendingStatus = facility.status && facility.status.toLowerCase() === 'pending';
            const showAuthorizeButton = hasNoMeterIds && isPendingStatus;
            
            return (
              <div
                key={facility.id}
                className={`rounded-lg cursor-pointer hover:shadow-lg transition-all duration-300 flex flex-col justify-between p-2 relative overflow-hidden ${
                  isGreenButton 
                    ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 shadow-md' 
                    : 'border border-[#039994] bg-white'
                }`}
              >
                {isGreenButton && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center shadow-sm">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Green Button
                    </div>
                  </div>
                )}
                
                <div onClick={() => setSelectedFacility(facility)}>
                  <h3 className={`font-semibold text-base mb-1 ${
                    isGreenButton ? 'text-green-800' : 'text-[#039994]'
                  }`}>
                    {facility.facilityName}
                  </h3>
                  <div className="grid grid-cols-2 gap-y-1 text-xs">
                    <span className={`font-medium ${isGreenButton ? 'text-green-700' : 'text-gray-700'}`}>Role:</span>
                    <span className="capitalize">{facility.commercialRole}</span>

                    <span className={`font-medium ${isGreenButton ? 'text-green-700' : 'text-gray-700'}`}>Type:</span>
                    <span className="capitalize">{facility.entityType}</span>

                    <span className={`font-medium ${isGreenButton ? 'text-green-700' : 'text-gray-700'}`}>Utility:</span>
                    <span className={isGreenButton ? 'text-green-600 font-semibold' : ''}>
                      {facility.utilityProvider}
                      {isGreenButton && (
                        <svg className="w-3 h-3 ml-1 inline text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>

                    <span className={`font-medium ${isGreenButton ? 'text-green-700' : 'text-gray-700'}`}>Meter ID:</span>
                    <span>{formatMeterIds(facility.meterIds)}</span>

                    <span className={`font-medium ${isGreenButton ? 'text-green-700' : 'text-gray-700'}`}>Status:</span>
                    <span className="capitalize">{facility.status}</span>

                    <span className={`font-medium ${isGreenButton ? 'text-green-700' : 'text-gray-700'}`}>Created:</span>
                    <span>{formatDate(facility.createdAt)}</span>
                  </div>
                  
                  {showAuthorizeButton && (
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <button
                        onClick={(e) => authorizeFacility(facility, e)}
                        disabled={authorizingFacility === facility.id}
                        className={`w-full py-2 px-3 rounded text-sm font-medium transition-colors ${
                          isGreenButton 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white' 
                            : 'bg-[#039994] hover:bg-[#028884] text-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {authorizingFacility === facility.id ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                            Authorizing...
                          </div>
                        ) : (
                          "AUTHORIZE THIS FACILITY"
                        )}
                      </button>
                    </div>
                  )}
                  
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-medium ${isGreenButton ? 'text-green-700' : 'text-gray-600'}`}>Progress</span>
                      <span className={`text-xs font-medium ${isGreenButton ? 'text-green-700' : 'text-[#039994]'}`}>
                        Step {progress.currentStage} of 6
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      {getCircleProgressSegments(facility.id)}
                    </div>
                  </div>
                </div>
                
                <div
                  className={`flex items-center justify-between mt-2 px-1 py-1 rounded transition-colors ${
                    isGreenButton 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' 
                      : 'bg-[#069B9621] hover:bg-[#069B9633]'
                  }`}
                  onClick={() => setSelectedFacility(facility)}
                >
                  <span className={`text-xs font-medium ${
                    isGreenButton ? 'text-white' : 'text-[#039994]'
                  }`}>
                    View details
                  </span>
                  <FiChevronRight size={16} className={isGreenButton ? "text-white" : "text-[#039994]"} />
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