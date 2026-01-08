import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiChevronRight } from "react-icons/fi";
import toast from "react-hot-toast";
import FilterModal from "./FilterModal";
import FacilityDetails from "./FacilityDetails";
import InstapullAuthorizationModal from "./InstapullAuthorizationModal";
import OperatorAgreementModal from "./OperatorAgreementModal";

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
  const [currentFacility, setCurrentFacility] = useState(null);
  const [instapullOpened, setInstapullOpened] = useState(false);
  const [showInstapullAuthModal, setShowInstapullAuthModal] = useState(false);
  const [owners, setOwners] = useState({});
  const [authorizationStatus, setAuthorizationStatus] = useState({});
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [userAgreementStatus, setUserAgreementStatus] = useState(null);

  const greenButtonKeywords = ['green button connect', 'green button', 'san diego gas and electric', 'southern california edison', 'pacific gas and electric', 'pg&e', 'sce', 'sdg&e'];

  const isGreenButtonUtility = (utilityProvider) => {
    const providerLower = utilityProvider?.toLowerCase() || '';
    return greenButtonKeywords.some(keyword => providerLower.includes(keyword));
  };

  const checkUserAgreement = async () => {
    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;
      
      if (!userId || !authToken) return false;

      const response = await axios.get(
        `https://services.dcarbon.solutions/api/user/agreement/${userId}`,
        { headers: { 'Authorization': `Bearer ${authToken}` } }
      );
      
      if (response.data.status === 'success') {
        setUserAgreementStatus(response.data.data?.termsAccepted || false);
        return response.data.data?.termsAccepted || false;
      }
      return false;
    } catch (error) {
      console.error('Error checking user agreement:', error);
      return false;
    }
  };

  const authorizeFacility = async (facility, e) => {
    e.stopPropagation();
    
    const hasAgreed = await checkUserAgreement();
    
    if (!hasAgreed) {
      setCurrentFacility(facility);
      setShowAgreementModal(true);
      return;
    }
    
    setAuthorizingFacility(facility.id);
    setCurrentFacility(facility);
    
    openInstapullTab();
    setShowInstapullAuthModal(true);
    
    setAuthorizingFacility(null);
  };

  const openInstapullTab = () => {
    const newTab = window.open('https://main.instapull.io/authorize/dcarbonsolutions/', '_blank');
    if (newTab) {
      setInstapullOpened(true);
      toast.success('Instapull opened in new tab');
    } else {
      toast.error('Please allow pop-ups for this site to open Instapull');
    }
  };

  const checkAuthorizationStatus = async (ownerId, facilityId) => {
    const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
    const authToken = loginResponse?.data?.token;
    
    if (!ownerId || !authToken) return null;
    
    try {
      const response = await axios.get(
        `https://services.dcarbon.solutions/api/auth/user-meters/${ownerId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      if (response.data.status === "success" && response.data.data && response.data.data.length > 0) {
        const authData = response.data.data[0];
        setAuthorizationStatus(prev => ({
          ...prev,
          [facilityId]: {
            authorized: true,
            metersFetched: authData.meters && authData.meters.length > 0,
            status: authData.status
          }
        }));
        return {
          authorized: true,
          metersFetched: authData.meters && authData.meters.length > 0,
          status: authData.status
        };
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setAuthorizationStatus(prev => ({
          ...prev,
          [facilityId]: {
            authorized: false,
            metersFetched: false,
            status: 'not_authorized'
          }
        }));
        return {
          authorized: false,
          metersFetched: false,
          status: 'not_authorized'
        };
      }
    }
    return null;
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
        headers: { 'Authorization': `Bearer ${authToken}` } }
      );
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
        headers: { 'Authorization': `Bearer ${authToken}` } }
      );
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
        headers: { 'Authorization': `Bearer ${authToken}` } }
      );
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

  const fetchUserInvitations = async () => {
    const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
    const userEmail = loginResponse?.data?.user?.email || loginResponse?.data?.user?.userEmail;
    const authToken = loginResponse?.data?.token;
    
    if (!userEmail || !authToken) {
      toast.error("Authentication required");
      setLoading(false);
      return;
    }
    
    try {
      const { data } = await axios.get(
        `https://services.dcarbon.solutions/api/user/referral/by-invitee-email/${userEmail}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      if (data.status === "success" && data.data && data.data.length > 0) {
        const facilitiesWithOwners = [];
        const ownersMap = {};
        
        for (const invitation of data.data) {
          if (invitation.facilityId && invitation.inviterId && invitation.facility) {
            const facilityData = invitation.facility;
            facilityData.userRole = invitation.role;
            facilityData.invitationStatus = invitation.status;
            facilityData.invitationId = invitation.id;
            facilityData.invitationCreatedAt = invitation.createdAt;
            facilitiesWithOwners.push(facilityData);
            
            if (!ownersMap[invitation.inviterId]) {
              ownersMap[invitation.inviterId] = {
                id: invitation.inviterId,
                firstName: invitation.name?.split(' ')[0] || '',
                lastName: invitation.name?.split(' ').slice(1).join(' ') || '',
                email: invitation.inviteeEmail,
                phoneNumber: invitation.phoneNumber,
                invitationStatus: invitation.status
              };
            }
            
            if (invitation.inviterId) {
              await checkAuthorizationStatus(invitation.inviterId, invitation.facilityId);
            }
          }
        }
        
        setFacilities(facilitiesWithOwners);
        setOwners(ownersMap);
      } else {
        setFacilities([]);
        setOwners({});
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to load facilities");
      setFacilities([]);
      setOwners({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInvitations();
    checkUserAgreement();
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
      if (filters.role !== "All" && f.userRole.toLowerCase() !== filters.role.toLowerCase()) return false;
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

  const handleInstapullAuthModalClose = () => {
    setShowInstapullAuthModal(false);
    setCurrentFacility(null);
    setInstapullOpened(false);
    fetchUserInvitations();
  };

  const handleAgreementAccepted = () => {
    setShowAgreementModal(false);
    if (currentFacility) {
      setAuthorizingFacility(currentFacility.id);
      openInstapullTab();
      setShowInstapullAuthModal(true);
      setAuthorizingFacility(null);
    }
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

  if (showInstapullAuthModal) {
    return (
      <InstapullAuthorizationModal
        isOpen={showInstapullAuthModal}
        onClose={handleInstapullAuthModalClose}
        utilityProvider={currentFacility?.utilityProvider}
        instapullOpened={instapullOpened}
        openInstapullTab={openInstapullTab}
        userId={JSON.parse(localStorage.getItem('loginResponse') || '{}')?.data?.user?.id}
      />
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
            const owner = owners[facility.commercialUserId];
            const progress = facilityProgress[facility.id] || { completedStages: [1], currentStage: 2 };
            const isGreenButton = isGreenButtonUtility(facility.utilityProvider);
            const authStatus = authorizationStatus[facility.id] || { authorized: false, metersFetched: false, status: 'not_authorized' };
            const showAuthorizeButton = !authStatus.authorized;
            
            return (
              <div
                key={facility.id}
                className="rounded-lg cursor-pointer hover:shadow-lg transition-all duration-300 flex flex-col justify-between p-2 relative overflow-hidden border border-gray-300 bg-gray-50"
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
                  <h3 className="font-semibold text-base mb-1 text-gray-800">
                    {facility.facilityName}
                  </h3>
                  
                  {owner && (
                    <div className="mb-2 p-2 bg-blue-50 rounded border border-blue-100">
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-xs font-medium text-blue-700">Authorizing for:</div>
                        <div className={`text-xs px-2 py-1 rounded-full capitalize ${
                          owner.invitationStatus === 'PENDING' 
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                            : 'bg-green-100 text-green-800 border border-green-200'
                        }`}>
                          {owner.invitationStatus || 'PENDING'}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-blue-600 font-medium">Name:</span>
                          <span className="text-blue-800">{owner.firstName} {owner.lastName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600 font-medium">Email:</span>
                          <span className="text-blue-800 truncate">{owner.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600 font-medium">Phone:</span>
                          <span className="text-blue-800">{owner.phoneNumber || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600 font-medium">Invitation Status:</span>
                          <span className={`font-medium ${
                            owner.invitationStatus === 'PENDING' ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {owner.invitationStatus || 'PENDING'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-y-1 text-xs">
                    <span className="font-medium text-gray-700">Your Role:</span>
                    <span className="capitalize text-gray-800">{facility.userRole || 'OPERATOR'}</span>

                    <span className="font-medium text-gray-700">Type:</span>
                    <span className="capitalize text-gray-800">{facility.entityType}</span>

                    <span className="font-medium text-gray-700">Utility:</span>
                    <span className="text-gray-800">
                      {facility.utilityProvider}
                    </span>

                    <span className="font-medium text-gray-700">Meter ID:</span>
                    <span className="text-gray-800">{formatMeterIds(facility.meterIds)}</span>

                    <span className="font-medium text-gray-700">Status:</span>
                    <span className="capitalize text-gray-800">{facility.status}</span>

                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="text-gray-800">{formatDate(facility.createdAt)}</span>
                  </div>
                  
                  {showAuthorizeButton ? (
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <button
                        onClick={(e) => authorizeFacility(facility, e)}
                        disabled={authorizingFacility === facility.id}
                        className="w-full py-2 px-3 rounded text-sm font-medium transition-colors border border-green-500 text-green-500 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {authorizingFacility === facility.id ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500 mr-2"></div>
                            Authorizing...
                          </div>
                        ) : (
                          "AUTHORIZE THIS FACILITY"
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <div className="w-full py-2 px-3 rounded text-sm font-medium text-center bg-green-50 border border-green-200 text-green-700">
                        {authStatus.metersFetched ? (
                          <div className="flex items-center justify-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Authorized
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500 mr-2"></div>
                            Fetching meters...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-3 pt-2 border-t border-gray-200">
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
                  className="flex items-center justify-between mt-2 px-1 py-1 rounded transition-colors bg-[#069B9621] hover:bg-[#069B9633]"
                  onClick={() => setSelectedFacility(facility)}
                >
                  <span className="text-xs font-medium text-[#039994]">
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

      {showAgreementModal && (
        <OperatorAgreementModal
          isOpen={showAgreementModal}
          onClose={() => setShowAgreementModal(false)}
          onAgreementAccepted={handleAgreementAccepted}
          facility={currentFacility}
        />
      )}
    </div>
  );
}