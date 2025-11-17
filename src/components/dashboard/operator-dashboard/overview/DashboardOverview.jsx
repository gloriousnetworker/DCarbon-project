import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { toast } from 'react-hot-toast';

const QuickActions = dynamic(() => import("./QuickActions"), { ssr: false });
const Graph = dynamic(() => import("./Graph"), { ssr: false });
const RecentRecSales = dynamic(() => import("./RecentRecSales"), { ssr: false });
const WelcomeModal = dynamic(() => import("./modals/WelcomeModal"), { ssr: false });
const AddUtilityProvider = dynamic(() => import("./modals/AddUtilityProvider"), { ssr: false });
const CommercialRegistrationModal = dynamic(() => import("./modals/createfacility/CommercialRegistrationModal"), { ssr: false });

const ProgressTracker = ({ currentStage, completedStages, onStageClick, selectedFacility, facilities, onFacilityChange, onAuthorizeFacility }) => {
  const stages = [
    { id: 1, name: "Registration", tooltip: "Commercial registration completed" },
    { id: 2, name: "Referral", tooltip: "Owner referral code verified" },
    { id: 3, name: "Agreement", tooltip: "Terms and conditions signed" },
    { id: 4, name: "Meters", tooltip: "Utility meters connected" }
  ];

  const greenButtonUtilities = ['San Diego Gas and Electric', 'Pacific Gas and Electric', 'Southern California Edison'];

  const isGreenButtonUtility = (utilityProvider) => {
    return greenButtonUtilities.includes(utilityProvider);
  };

  const handleClick = (stageId) => {
    if (completedStages.includes(stageId) || stageId === currentStage) {
      onStageClick(stageId);
    }
  };

  const isClickable = (stageId) => {
    return completedStages.includes(stageId) || stageId === currentStage;
  };

  const selectedFacilityData = facilities.find(f => f.id === selectedFacility);
  const isGreenButton = selectedFacilityData ? isGreenButtonUtility(selectedFacilityData.utilityProvider) : false;

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Onboarding Progress</h2>
        <span className="text-sm font-medium text-[#039994]">
          Stage {currentStage} of {stages.length}
        </span>
      </div>
      
      {facilities.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Facility
          </label>
          <div className="flex gap-2">
            <select
              value={selectedFacility || ""}
              onChange={(e) => onFacilityChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994] focus:border-transparent"
            >
              <option value="">Select a facility</option>
              {facilities.map((facility) => {
                const isGreenButton = isGreenButtonUtility(facility.utilityProvider);
                return (
                  <option key={facility.id} value={facility.id} className={isGreenButton ? "text-green-600 font-medium" : ""}>
                    {facility.facilityName} - {facility.utilityProvider}
                    {isGreenButton && " ✓"}
                  </option>
                );
              })}
            </select>
            {selectedFacilityData && (
              <button
                onClick={() => onAuthorizeFacility(selectedFacilityData)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isGreenButton 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white' 
                    : 'bg-[#039994] hover:bg-[#028884] text-white'
                }`}
              >
                {isGreenButton ? 'Authorize Green Button' : 'Utility Authorization'}
              </button>
            )}
          </div>
          {selectedFacilityData && (
            <div className="mt-2 flex items-center text-xs text-gray-500">
              {isGreenButton ? (
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-1 flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-green-600 font-medium">Green Button Utility</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full mr-1"></div>
                  <span>Standard Utility</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="relative">
        <div className="flex justify-between mb-2">
          {stages.map((stage) => (
            <div 
              key={stage.id} 
              className={`flex flex-col items-center group relative ${isClickable(stage.id) ? 'cursor-pointer' : 'cursor-default'}`}
              onClick={() => handleClick(stage.id)}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  completedStages.includes(stage.id) ? "bg-[#039994] text-white" : 
                  stage.id === currentStage ? "bg-[#039994] text-white" : 
                  "bg-gray-200 text-gray-600"
                } ${isClickable(stage.id) ? 'hover:bg-[#028a85]' : ''}`}
              >
                {stage.id}
              </div>
              <span
                className={`text-xs mt-1 text-center ${
                  completedStages.includes(stage.id) || stage.id === currentStage ? "text-[#039994] font-medium" : "text-gray-500"
                }`}
              >
                {stage.name}
              </span>
              <div className="absolute top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                {stage.tooltip}
              </div>
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

const VideoModal = ({ isOpen, onClose, facility, onVideoComplete }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9500] flex items-center justify-center bg-black bg-opacity-50 p-4">
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

const AuthorizationModal = ({ isOpen, onClose, facility, onAuthorizationComplete }) => {
  const [scale, setScale] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

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

  const greenButtonUtilities = ['San Diego Gas and Electric', 'Pacific Gas and Electric', 'Southern California Edison'];
  
  const isGreenButtonUtility = (utilityProvider) => {
    return greenButtonUtilities.includes(utilityProvider);
  };

  const isGreenButton = facility ? isGreenButtonUtility(facility.utilityProvider) : false;
  const iframeUrl = facility ? getUtilityUrl(facility.utilityProvider) : 'https://utilityapi.com/authorize/DCarbon_Solutions';

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
    onClose();
    setScale(1);
    if (onAuthorizationComplete) {
      onAuthorizationComplete();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9500] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-[#039994]">
            {facility?.utilityProvider} Authorization
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
            <strong>{facility?.utilityProvider} Authorization:</strong> Follow the steps to securely share your utility data with DCarbon Solutions.
          </p>
          <p className={`text-sm ${isGreenButton ? 'text-green-700' : 'text-yellow-700'} mt-1`}>
            <strong>Selected Utility:</strong> {facility?.utilityProvider}
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
                title={`${facility?.utilityProvider} Authorization`}
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
};

export default function DashboardOverview() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showAddUtilityModal, setShowAddUtilityModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showAuthorizationModal, setShowAuthorizationModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [userData, setUserData] = useState({
    userFirstName: "",
    userId: ""
  });
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [isCheckingCommercialStatus, setIsCheckingCommercialStatus] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const [completedStages, setCompletedStages] = useState([]);
  const [meterCheckInterval, setMeterCheckInterval] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showProgressTracker, setShowProgressTracker] = useState(false);
  const [clickedStage, setClickedStage] = useState(1);
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState("");
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(false);
  const [currentAuthorizationFacility, setCurrentAuthorizationFacility] = useState(null);

  const greenButtonUtilities = ['San Diego Gas and Electric', 'Pacific Gas and Electric', 'Southern California Edison'];

  const isGreenButtonUtility = (utilityProvider) => {
    return greenButtonUtilities.includes(utilityProvider);
  };

  const checkOwnersDetails = () => {
    try {
      const ownersDetails = localStorage.getItem('ownersDetails');
      if (ownersDetails) {
        const parsedDetails = JSON.parse(ownersDetails);
        if (parsedDetails && parsedDetails.id) {
          return parsedDetails;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const fetchUserFacilities = async (userId, authToken) => {
    try {
      setIsLoadingFacilities(true);
      const response = await fetch(
        `https://services.dcarbon.solutions/api/facility/get-user-facilities-by-userId/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      
      const result = await response.json();
      
      if (result.status === 'success' && result.data?.facilities) {
        setFacilities(result.data.facilities);
        if (result.data.facilities.length > 0) {
          setSelectedFacility(result.data.facilities[0].id);
        }
        return result.data.facilities;
      }
      return [];
    } catch (error) {
      console.error('Error fetching facilities:', error);
      return [];
    } finally {
      setIsLoadingFacilities(false);
    }
  };

  const checkStage1Completion = async (userId, authToken) => {
    const response = await fetch(
      `https://services.dcarbon.solutions/api/user/get-commercial-user/${userId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    const result = await response.json();
    return result.status === 'success' && result.data?.commercialUser?.ownerFullName;
  };

  const checkStage2Completion = () => {
    const referralResponse = localStorage.getItem('referralResponse');
    const ownerReferralCode = localStorage.getItem('ownerReferralCode');
    
    if (referralResponse && ownerReferralCode) {
      try {
        const parsedResponse = JSON.parse(referralResponse);
        return parsedResponse.status === 'success' && parsedResponse.data?.inviterId;
      } catch (error) {
        return false;
      }
    }
    return false;
  };

  const checkStage3Completion = async (userId, authToken) => {
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
      
      if (result.status === 'success' && result.data?.length > 0) {
        for (const meterData of result.data) {
          if (meterData.meters?.meters && meterData.meters.meters.length > 0) {
            const hasValidMeters = meterData.meters.meters.some(meter => 
              meter.base?.meter_numbers && 
              meter.base.meter_numbers.length > 0 && 
              meter.base.meter_numbers.some(num => num && num.trim() !== '')
            );
            if (hasValidMeters) {
              return true;
            }
          }
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking stage 4 completion:', error);
      return false;
    }
  };

  const checkUserProgress = async () => {
    try {
      setIsLoading(true);
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;

      if (!userId || !authToken) return;

      const newCompletedStages = [];
      let highestCompletedStage = 1;

      const stage1 = await checkStage1Completion(userId, authToken);
      if (stage1) {
        newCompletedStages.push(1);
        highestCompletedStage = 2;
      }

      const stage2 = checkStage2Completion();
      if (stage2) {
        newCompletedStages.push(2);
        highestCompletedStage = 3;
      }

      const stage3 = await checkStage3Completion(userId, authToken);
      if (stage3) {
        newCompletedStages.push(3);
        highestCompletedStage = 4;
      }

      const stage4 = await checkStage4Completion(userId, authToken);
      if (stage4) {
        newCompletedStages.push(4);
        if (meterCheckInterval) {
          clearInterval(meterCheckInterval);
          setMeterCheckInterval(null);
        }
      } else {
        if (stage3) {
          if (!meterCheckInterval) {
            const interval = setInterval(async () => {
              const hasMeters = await checkStage4Completion(userId, authToken);
              if (hasMeters) {
                setCompletedStages(prev => [...prev, 4]);
                setCurrentStage(4);
                clearInterval(interval);
                setMeterCheckInterval(null);
              }
            }, 5000);
            setMeterCheckInterval(interval);
          }
        }
      }

      setCompletedStages(newCompletedStages);
      setCurrentStage(highestCompletedStage);
    } catch (error) {
      console.error('Error checking user progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStageClick = (stageId) => {
    setClickedStage(stageId);
    if (stageId === 4) {
      setShowAddUtilityModal(true);
    } else {
      setShowRegistrationModal(true);
    }
  };

  const handleFacilityChange = (facilityId) => {
    setSelectedFacility(facilityId);
  };

  const handleAuthorizeFacility = (facility) => {
    setCurrentAuthorizationFacility(facility);
    
    const isGreenButton = isGreenButtonUtility(facility.utilityProvider);
    if (isGreenButton) {
      setShowVideoModal(true);
    } else {
      setShowAuthorizationModal(true);
    }
  };

  const handleVideoComplete = () => {
    setShowVideoModal(false);
    setShowAuthorizationModal(true);
  };

  const handleAuthorizationComplete = () => {
    checkUserProgress();
  };

  const handleCloseAuthorizationModal = () => {
    setShowAuthorizationModal(false);
    setCurrentAuthorizationFacility(null);
  };

  const handleCloseVideoModal = () => {
    setShowVideoModal(false);
    setCurrentAuthorizationFacility(null);
  };

  const handleCloseRegistrationModal = () => {
    setShowRegistrationModal(false);
    checkUserProgress();
  };

  const checkCommercialUserStatus = async (userId) => {
    if (!userId) return;
    
    setIsCheckingCommercialStatus(true);
    
    const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
    const authToken = loginResponse?.data?.token;

    if (!authToken) return;

    const response = await fetch(`https://services.dcarbon.solutions/api/user/get-commercial-user/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const result = await response.json();

    if (result.statusCode === 422 && result.status === 'fail') {
      setShowWelcomeModal(true);
    } else if (result.statusCode !== 200 || result.status !== 'success') {
      setShowWelcomeModal(true);
    }
    
    setIsCheckingCommercialStatus(false);
  };

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    localStorage.setItem("hasVisitedDashboard", "true");
    checkUserProgress();
  };

  const handleOpenAddUtilityModal = () => {
    setShowAddUtilityModal(true);
  };

  const handleCloseAddUtilityModal = () => {
    setShowAddUtilityModal(false);
    checkUserProgress();
  };

  useEffect(() => {
    const loadUserData = async () => {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const firstName = loginResponse?.data?.user?.firstName || "User";
      const userId = loginResponse?.data?.user?.id || "";
      
      setUserData({
        userFirstName: firstName,
        userId: userId
      });

      const ownersDetails = checkOwnersDetails();
      const hasOwnersDetails = !!ownersDetails;
      setShowProgressTracker(hasOwnersDetails);

      const hasVisitedBefore = localStorage.getItem("hasVisitedDashboard");
      if (!hasVisitedBefore) {
        setIsFirstTimeUser(true);
      }

      if (hasOwnersDetails && ownersDetails.id) {
        const authToken = loginResponse?.data?.token;
        if (authToken) {
          await fetchUserFacilities(ownersDetails.id, authToken);
        }
        await checkCommercialUserStatus(userId);
        await checkUserProgress();
      }
    };

    loadUserData();

    const handleStorageChange = (e) => {
      if (e.key === 'referralResponse' || e.key === 'ownerReferralCode' || e.key === 'ownersDetails') {
        if (e.key === 'ownersDetails') {
          const hasOwnersDetails = !!checkOwnersDetails();
          setShowProgressTracker(hasOwnersDetails);
        }
        checkUserProgress();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (meterCheckInterval) {
        clearInterval(meterCheckInterval);
      }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (isCheckingCommercialStatus || isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-[#039994] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen space-y-8 p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="font-[600] text-[16px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro">
            Quick Action
          </h1>
        </div>
      </div>

      {showProgressTracker && (
        <ProgressTracker 
          currentStage={currentStage} 
          completedStages={completedStages} 
          onStageClick={handleStageClick}
          selectedFacility={selectedFacility}
          facilities={facilities}
          onFacilityChange={handleFacilityChange}
          onAuthorizeFacility={handleAuthorizeFacility}
        />
      )}
      
      <QuickActions />

      <hr className="border-gray-300" />

      <Graph />

      <hr className="border-gray-300" />

      <RecentRecSales />

      {showWelcomeModal && (
        <div className="fixed inset-0 z-[9500]">
          <WelcomeModal 
            isOpen 
            onClose={handleCloseWelcomeModal}
            userData={userData}
          />
        </div>
      )}

      {showAddUtilityModal && (
        <div className="fixed inset-0 z-[9500]">
          <AddUtilityProvider 
            isOpen={showAddUtilityModal}
            onClose={handleCloseAddUtilityModal}
          />
        </div>
      )}

      {showRegistrationModal && (
        <div className="fixed inset-0 z-[9500]">
          <CommercialRegistrationModal
            isOpen={showRegistrationModal}
            onClose={handleCloseRegistrationModal}
            currentStep={clickedStage}
          />
        </div>
      )}

      {showVideoModal && (
        <VideoModal
          isOpen={showVideoModal}
          onClose={handleCloseVideoModal}
          facility={currentAuthorizationFacility}
          onVideoComplete={handleVideoComplete}
        />
      )}

      {showAuthorizationModal && (
        <AuthorizationModal
          isOpen={showAuthorizationModal}
          onClose={handleCloseAuthorizationModal}
          facility={currentAuthorizationFacility}
          onAuthorizationComplete={handleAuthorizationComplete}
        />
      )}
    </div>
  );
}