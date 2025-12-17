import React, { useState, useEffect } from "react";
import OwnerDetailsModal from "./ownerRegistration/OwnerDetailsModal";
import OwnerAndOperatorDetailsModal from "./ownerAndOperatorRegistration/OwnerDetailsModal";
import OwnerTermsAndAgreementModal from "./ownerRegistration/OwnerTermsAndAgreementModal";
import OwnerAndOperatorTermsAndAgreementModal from "./ownerAndOperatorRegistration/OwnerAndOperatorTermsAndAgreementModal";
import FinanceAndInstallerModal from "./ownerRegistration/FinanceAndInstallerModal";
import OperatorFinanceAndInstallerModal from "./ownerAndOperatorRegistration/FinanceAndInstallerModal";
import AddCommercialFacilityModal from "./ownerAndOperatorRegistration/AddCommercialFacilityModal";
import UtilityAuthorizationModal from "./ownerAndOperatorRegistration/UtilityAuthorizationModal";
import InviteOperatorModal from "./ownerRegistration/InviteOperatorModal";
import { toast } from "react-hot-toast";

export default function ExistingFacilitiesModal({ isOpen, onClose, currentStep }) {
  const [selectedRole, setSelectedRole] = useState('Owner');
  const [currentModal, setCurrentModal] = useState(null);
  const [commercialData, setCommercialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const [nextStage, setNextStage] = useState(2);
  const [showInviteOperatorModal, setShowInviteOperatorModal] = useState(false);
  const [hasFacilities, setHasFacilities] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [showOwnerTooltip, setShowOwnerTooltip] = useState(false);
  const [showOwnerOperatorTooltip, setShowOwnerOperatorTooltip] = useState(false);
  const [userFacilities, setUserFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState('');
  const [showUtilityIframe, setShowUtilityIframe] = useState(false);
  const [selectedUtilityProvider, setSelectedUtilityProvider] = useState(null);
  const [iframeUrl, setIframeUrl] = useState("");
  const [scale, setScale] = useState(1);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [greenButtonEmail, setGreenButtonEmail] = useState('');
  const [submittingGreenButton, setSubmittingGreenButton] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showGreenButtonInfo, setShowGreenButtonInfo] = useState(false);
  const [showMainModal, setShowMainModal] = useState(false);

  const greenButtonUtilities = ['San Diego Gas and Electric', 'Pacific Gas and Electric', 'Southern California Edison', 'PG&E', 'SCE', 'SDG&E'];

  useEffect(() => {
    const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
    const email = loginResponse?.data?.user?.email || loginResponse?.data?.user?.userEmail || '';
    setUserEmail(email);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShowMainModal(true);
      checkUserProgress();
      fetchCommercialData();
    } else {
      setShowMainModal(false);
    }
  }, [isOpen]);

  const fetchCommercialData = async () => {
    setLoading(true);
    try {
      const loginResponse = JSON.parse(localStorage.getItem("loginResponse") || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;
      
      if (userId && authToken) {
        const response = await fetch(`https://services.dcarbon.solutions/api/user/get-commercial-user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setCommercialData(data.data);
          
          if (data.data?.commercialUser?.commercialRole === 'owner') {
            setSelectedRole('Owner');
          } else if (data.data?.commercialUser?.commercialRole === 'both') {
            setSelectedRole('Owner & Operator');
          }
        }
      }
      await checkUserProgress();
    } catch (error) {
      console.error('Error fetching commercial data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const checkUserFacilities = async (userId, authToken) => {
    try {
      const response = await fetch(
        `https://services.dcarbon.solutions/api/facility/get-user-facilities-by-userId/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const data = await response.json();
      const facilities = data.data?.facilities || [];
      setUserFacilities(facilities);
      if (facilities.length > 0) {
        setSelectedFacility(facilities[0].id);
      }
      return facilities.length > 0;
    } catch (error) {
      return false;
    }
  };

  const checkStage2Completion = async (userId, authToken) => {
    try {
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
      return result.status === 'success' && result.data?.commercialUser?.ownerAddress;
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

  const checkStage5Completion = async (userId, authToken) => {
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
      return result.status === 'success' && result.data?.length > 0 && result.data.some(item => item.meters?.meters?.length > 0);
    } catch (error) {
      return false;
    }
  };

  const checkUserProgress = async () => {
    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;

      if (!userId || !authToken) return;

      const hasFacilitiesResult = await checkUserFacilities(userId, authToken);
      setHasFacilities(hasFacilitiesResult);

      const stageChecks = [
        { stage: 2, check: () => checkStage2Completion(userId, authToken) },
        { stage: 3, check: () => checkStage3Completion(userId, authToken) },
        { stage: 4, check: () => checkStage4Completion(userId, authToken) },
        { stage: 5, check: () => checkStage5Completion(userId, authToken) }
      ];

      let highestCompletedStage = 1;

      for (const { stage, check } of stageChecks) {
        const isCompleted = await check();
        if (isCompleted) {
          highestCompletedStage = stage;
        }
      }

      const newStage = highestCompletedStage === 5 ? 5 : highestCompletedStage;
      const newNextStage = highestCompletedStage === 5 ? 5 : highestCompletedStage + 1;
      
      setCurrentStage(newStage);
      setNextStage(newNextStage);
    } catch (error) {
      console.error('Error checking user progress:', error);
    }
  };

  const updateCommercialRole = async () => {
    try {
      setUpdatingRole(true);
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;

      if (!userId || !authToken) return;

      const commercialUserResponse = await fetch(
        `https://services.dcarbon.solutions/api/user/get-commercial-user/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      const commercialUserData = await commercialUserResponse.json();
      const entityType = commercialUserData.data?.commercialUser?.entityType || 'individual';

      const payload = {
        entityType,
        commercialRole: selectedRole === 'Owner' ? 'owner' : 'both'
      };

      const updateResponse = await fetch(
        `https://services.dcarbon.solutions/api/user/commercial-registration/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      const result = await updateResponse.json();
      if (result.status === 'success') {
        if (selectedRole === 'Owner') {
          setCurrentModal('ownerDetails');
          setShowMainModal(false);
        } else {
          setCurrentModal('ownerOperatorDetails');
          setShowMainModal(false);
        }
      }
    } catch (error) {
      console.error('Error updating commercial role:', error);
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleGreenButtonSubmit = async () => {
    if (!greenButtonEmail.trim()) {
      return;
    }

    setSubmittingGreenButton(true);
    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;
      
      const greenButtonPayload = {
        email: userEmail,
        userType: "COMMERCIAL",
        utilityType: selectedUtilityProvider,
        authorizationEmail: greenButtonEmail.trim()
      };

      const greenButtonResponse = await fetch(
        `https://services.dcarbon.solutions/api/utility-auth/green-button`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(greenButtonPayload)
        }
      );

      const greenButtonResult = await greenButtonResponse.json();
      
      if (greenButtonResult.message === "Authorization process enqueued successfully") {
        toast.success("Green Button authorization submitted successfully!");
        
        const submitEmailResponse = await fetch(
          `https://services.dcarbon.solutions/api/user/submit-green-button-email/${userId}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ 
              email: greenButtonEmail.trim(),
              utilityProvider: selectedUtilityProvider
            })
          }
        );
        
        const submitEmailResult = await submitEmailResponse.json();
        
        if (submitEmailResult.status === 'success') {
          setGreenButtonEmail('');
          setShowUtilityIframe(false);
          onClose();
          window.location.reload();
        }
      }
    } catch (err) {
      toast.error("Failed to submit Green Button authorization");
      console.error('Failed to submit Green Button authorization:', err);
    } finally {
      setSubmittingGreenButton(false);
    }
  };

  const initiateUtilityAuth = (facility) => {
    const utilityName = facility.utilityProvider;
    const url = getUtilityUrl(utilityName);
    
    setSelectedUtilityProvider(utilityName);
    
    if (isGreenButtonUtility(utilityName)) {
      setShowGreenButtonInfo(true);
    } else {
      setIframeUrl(url);
      setShowUtilityIframe(true);
      setScale(1);
    }
  };

  const handleGreenButtonStart = async () => {
    try {
      const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
      const userId = loginResponse?.data?.user?.id;
      const authToken = loginResponse?.data?.token;

      const selectedFacilityData = userFacilities.find(f => f.id === selectedFacility);
      
      const payload = {
        userId: userId,
        utilityProvider: selectedUtilityProvider,
        facilityId: selectedFacility
      };

      const response = await fetch(
        `https://services.dcarbon.solutions/api/green-button/start`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(payload)
        }
      );

      const result = await response.json();
      
      if (result.success) {
        window.open(result.redirectUrl, '_blank');
        setShowGreenButtonInfo(false);
        setShowVideoModal(true);
      } else {
        toast.error("Failed to initiate Green Button authorization");
      }
    } catch (error) {
      console.error('Error starting Green Button:', error);
      toast.error("Failed to initiate Green Button authorization");
    }
  };

  const handleVideoComplete = () => {
    setShowVideoModal(false);
    const url = getUtilityUrl(selectedUtilityProvider);
    setIframeUrl(url);
    setShowUtilityIframe(true);
    setScale(1);
  };

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
    setShowUtilityIframe(false);
    setScale(1);
    onClose();
    window.location.reload();
  };

  const handleCreateNewFacility = () => {
    if (commercialData?.commercialUser?.commercialRole) {
      const currentRole = commercialData.commercialUser.commercialRole;
      const newRole = selectedRole === 'Owner' ? 'owner' : 'both';
      
      if (currentRole !== newRole) {
        updateCommercialRole();
      } else {
        if (selectedRole === 'Owner') {
          setCurrentModal('ownerDetails');
          setShowMainModal(false);
        } else {
          setCurrentModal('ownerOperatorDetails');
          setShowMainModal(false);
        }
      }
    } else {
      updateCommercialRole();
    }
  };

  const handleContinueRegistration = () => {
    const selectedFacilityData = userFacilities.find(f => f.id === selectedFacility);
    
    if (selectedFacilityData) {
      const facilityRole = selectedFacilityData.commercialRole;
      
      if (facilityRole === 'owner' || facilityRole === 'Owner') {
        setShowInviteOperatorModal(true);
      } else {
        initiateUtilityAuth(selectedFacilityData);
      }
    }
  };

  const handleOwnerFlow = (stage) => {
    if (stage === 2) {
      setCurrentModal('ownerDetails');
    } else if (stage === 3) {
      setCurrentModal('ownerTerms');
    } else if (stage === 4) {
      setCurrentModal('finance');
    } else if (stage === 5) {
      setCurrentModal('utilityNotice');
    }
  };

  const handleOwnerOperatorFlow = (stage) => {
    if (stage === 2) {
      setCurrentModal('ownerOperatorDetails');
    } else if (stage === 3) {
      setCurrentModal('ownerOperatorTerms');
    } else if (stage === 4) {
      setCurrentModal('operatorFinance');
    } else if (stage === 5) {
      setCurrentModal('utilityAuthorization');
    }
  };

  const closeAllModals = () => {
    setCurrentModal(null);
    setShowMainModal(false);
    setShowGreenButtonInfo(false);
    setShowUtilityIframe(false);
    setShowVideoModal(false);
    setShowInviteOperatorModal(false);
    onClose();
  };

  const getHeaderTitle = () => {
    return "Continue Pending Registrations";
  };

  const isNextButtonDisabled = () => {
    return false;
  };

  const getCurrentRoleDisplay = () => {
    if (!commercialData?.commercialUser?.commercialRole) return '';
    const role = commercialData.commercialUser.commercialRole;
    if (role === 'both') return 'Owner & Operator';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const getFacilityRoleDisplay = (facilityRole) => {
    if (facilityRole === 'both') return 'Owner & Operator';
    return facilityRole.charAt(0).toUpperCase() + facilityRole.slice(1);
  };

  const handleInviteOperator = () => {
    setCurrentModal(null);
    setShowInviteOperatorModal(true);
  };

  const handleInviteOperatorModalClose = () => {
    setShowInviteOperatorModal(false);
    onClose();
  };

  const renderGreenButtonInfoModal = () => {
    const selectedFacilityData = userFacilities.find(f => f.id === selectedFacility);
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="p-6">
            <h2 className="font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro mb-4">
              Green Button Authorization
            </h2>
            
            <div className="mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-start mb-2">
                  <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-green-800 font-semibold text-sm">Green Button Utility Selected</p>
                    <p className="text-green-700 text-sm mt-1">{selectedUtilityProvider}</p>
                  </div>
                </div>
                
                <div className="mt-3 p-3 bg-green-100 rounded border border-green-300">
                  <p className="text-green-800 text-sm">
                    You'll be redirected to {selectedUtilityProvider}'s authorization page. Please complete the authorization process in the new tab, then return here to continue.
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> After clicking "Continue to Green Button", a new tab will open. Complete the authorization there, then watch the instructional video.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowGreenButtonInfo(false)}
                className="flex-1 rounded-md border border-gray-300 text-gray-700 font-semibold py-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 font-sfpro text-[14px]"
              >
                Cancel
              </button>
              <button
                onClick={handleGreenButtonStart}
                className="flex-1 rounded-md bg-green-600 text-white font-semibold py-3 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-sfpro text-[14px]"
              >
                Continue to Green Button
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUtilityIframeModal = () => {
    const isGreenButton = isGreenButtonUtility(selectedUtilityProvider);
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-[#039994]">
              {selectedUtilityProvider} Authorization
            </h3>
            <div className="flex items-center gap-4">
              {!isGreenButton && (
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
              )}
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
              <strong>{selectedUtilityProvider} Authorization:</strong> Follow the steps to securely share your utility data with DCarbon Solutions.
            </p>
            <p className={`text-sm ${isGreenButton ? 'text-green-700' : 'text-yellow-700'} mt-1`}>
              <strong>Selected Utility:</strong> {selectedUtilityProvider}
            </p>
            <p className={`text-sm ${isGreenButton ? 'text-green-700' : 'text-yellow-700'} mt-1`}>
              <strong>Authorization URL:</strong> {iframeUrl}
            </p>
          </div>

          {isGreenButton ? (
            <div className="flex-1 p-6">
              <div className="mt-4 p-4 border-2 border-green-500 rounded-lg bg-green-50">
                <div className="font-semibold text-green-700 mb-2">Enter Authorization Email</div>
                <div className="text-sm text-green-600 mb-3">
                  Please enter the email address you used to authorize Green Button access with {selectedUtilityProvider}:
                </div>
                <input
                  type="email"
                  value={greenButtonEmail}
                  onChange={(e) => setGreenButtonEmail(e.target.value)}
                  placeholder="Enter the email used for Green Button authorization"
                  className="w-full rounded-md border border-green-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-sfpro mb-2"
                />
                <button
                  onClick={handleGreenButtonSubmit}
                  disabled={submittingGreenButton || !greenButtonEmail.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-sfpro"
                >
                  {submittingGreenButton ? 'Submitting...' : 'Submit Authorization Email'}
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> If you haven't completed the authorization yet, please go to the new tab that opened and complete the {selectedUtilityProvider} Green Button authorization process first.
                </p>
              </div>
            </div>
          ) : (
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
                    title={`${selectedUtilityProvider} Authorization`}
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                  />
                </div>
              </div>
            </div>
          )}

          {!isGreenButton && (
            <div className="p-3 border-t bg-gray-50 flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Zoom: {Math.round(scale * 100)}%
              </span>
              <span className="text-sm text-gray-600">
                Use scroll to navigate when zoomed in
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderVideoModal = () => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="flex-shrink-0 p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sans">
                {selectedUtilityProvider} Authorization Instructions
              </h2>
              <button onClick={() => setShowVideoModal(false)} className="text-red-500 hover:text-red-700">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700 mb-4">
                <strong>Important:</strong> Please watch this instructional video to understand how to complete the {selectedUtilityProvider} authorization process.
              </p>
              
              <div className="bg-black rounded-lg aspect-video flex items-center justify-center mb-4">
                <div className="text-white text-center">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <p className="text-lg font-semibold">Instructional Video</p>
                  <p className="text-sm opacity-75">Video demonstration for {selectedUtilityProvider}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Estimated time: 2-3 minutes</span>
                <span>Mandatory viewing</span>
              </div>
            </div>

            <div className="flex justify-between gap-4 mt-8">
              <button
                onClick={() => setShowVideoModal(false)}
                className="flex-1 rounded-md bg-white border border-[#039994] text-[#039994] font-semibold py-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sans text-[14px] transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleVideoComplete}
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

  const renderCurrentModal = () => {
    switch(currentModal) {
      case 'ownerDetails':
        return <OwnerDetailsModal isOpen={true} onClose={closeAllModals} />;
      case 'ownerOperatorDetails':
        return <OwnerAndOperatorDetailsModal isOpen={true} onClose={closeAllModals} />;
      case 'ownerTerms':
        return <OwnerTermsAndAgreementModal isOpen={true} onClose={closeAllModals} />;
      case 'ownerOperatorTerms':
        return <OwnerAndOperatorTermsAndAgreementModal isOpen={true} onClose={closeAllModals} />;
      case 'finance':
        return <FinanceAndInstallerModal isOpen={true} onClose={closeAllModals} />;
      case 'operatorFinance':
        return <OperatorFinanceAndInstallerModal isOpen={true} onClose={closeAllModals} />;
      case 'addFacility':
        return <AddCommercialFacilityModal isOpen={true} onClose={closeAllModals} />;
      case 'utilityAuthorization':
        return <UtilityAuthorizationModal isOpen={true} onClose={closeAllModals} />;
      case 'utilityNotice':
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <button
                onClick={closeAllModals}
                className="absolute top-4 right-4 z-10 w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <div className="p-6">
                <h2 className="font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro mb-4">
                  Owner's Utility Authorization
                </h2>
                <p className="font-sfpro text-[14px] leading-[150%] text-gray-700 mb-6">
                  🎉 Finance information completed! You're one step away from generating your DCarbon facility.
                  <br /><br />
                  Next step: Invite your operator to complete the authorization process. Once they're done, you'll be able to add facilities.
                  <br /><br />
                  Already invited your operator? You can close this and wait for them to complete their part.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={closeAllModals}
                    className="flex-1 rounded-md border border-[#039994] text-[#039994] font-semibold py-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px]"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleInviteOperator}
                    className="flex-1 rounded-md bg-[#039994] text-white font-semibold py-3 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px]"
                  >
                    Invite Operator
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isOpen && !currentModal && !showInviteOperatorModal && !showUtilityIframe && !showVideoModal && !showMainModal && !showGreenButtonInfo) return null;

  return (
    <>
      {showMainModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <button
              onClick={closeAllModals}
              className="absolute top-4 right-4 z-10 w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <h2 className="font-[600] text-[20px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro mb-2">
                  {getHeaderTitle()}
                </h2>

                <div className="w-full h-1 bg-gray-200 rounded-full mb-1">
                  <div className="h-1 bg-[#039994] rounded-full" style={{ width: `${(currentStage-1)*25}%` }}></div>
                </div>
                <div className="text-right mb-6">
                  <span className="text-[12px] font-medium text-gray-500 font-sfpro">{currentStage-1}/4</span>
                </div>

                {loading && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-full"></div>
                    </div>
                  </div>
                )}

                {!loading && commercialData?.commercialUser && (commercialData?.commercialUser?.commercialRole || commercialData?.commercialUser?.ownerAddress) && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div>
                      {commercialData?.commercialUser?.commercialRole && (
                        <p className="font-sfpro font-[600] text-[14px] text-gray-700">
                          Current Role: <span className="capitalize">{getCurrentRoleDisplay()}</span>
                        </p>
                      )}
                      {commercialData?.commercialUser?.ownerAddress && (
                        <p className="font-sfpro text-[12px] text-gray-600 mt-1">
                          Owner Address: {commercialData?.commercialUser?.ownerAddress}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {hasFacilities && userFacilities.length > 0 && (
                  <div className="border border-gray-300 rounded-lg p-4 bg-white mb-4">
                    <div className="font-sfpro font-[600] text-[14px] text-blue-700 mb-2">
                      Existing Facilities ({userFacilities.length})
                    </div>
                    <select 
                      value={selectedFacility}
                      onChange={(e) => setSelectedFacility(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm font-sfpro mb-3"
                    >
                      {userFacilities.map((facility) => {
                        const isGreenButton = isGreenButtonUtility(facility.utilityProvider);
                        return (
                          <option key={facility.id} value={facility.id} className={isGreenButton ? "text-green-600 font-medium" : ""}>
                            {facility.nickname || facility.facilityName} - {facility.utilityProvider}
                            {isGreenButton && " ✓"} ({getFacilityRoleDisplay(facility.commercialRole)})
                          </option>
                        );
                      })}
                    </select>
                    {selectedFacility && (
                      <div className="mt-2 p-2 bg-gray-50 rounded border text-xs font-sfpro mb-3">
                        {userFacilities.find(f => f.id === selectedFacility)?.status && (
                          <p>Status: <span className="font-semibold">{userFacilities.find(f => f.id === selectedFacility)?.status}</span></p>
                        )}
                        {isGreenButtonUtility(userFacilities.find(f => f.id === selectedFacility)?.utilityProvider) && (
                          <div className="flex items-center mt-1">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-1 flex items-center justify-center">
                              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="text-green-600 font-medium">Green Button Utility</span>
                          </div>
                        )}
                      </div>
                    )}
                    <button
                      onClick={handleContinueRegistration}
                      disabled={loading || updatingRole || !selectedFacility}
                      className={`w-full rounded-md border border-green-500 bg-white text-green-500 font-semibold py-3 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 font-sfpro text-[14px] ${
                        loading || updatingRole || !selectedFacility
                          ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' 
                          : ''
                      }`}
                    >
                      {updatingRole ? 'Updating...' : 'Continue Registration'}
                    </button>
                  </div>
                )}

                {!hasFacilities && (
                  <div className="border border-gray-300 rounded-lg p-6 bg-white mb-4 text-center">
                    <div className="text-gray-500 mb-3">
                      <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <p className="font-sfpro text-[14px] font-medium text-gray-600">No pending registrations found.</p>
                      <p className="font-sfpro text-[12px] text-gray-500 mt-1">Click "Add Commercial Facility" to start a new registration.</p>
                    </div>
                    <button
                      onClick={closeAllModals}
                      className="mt-3 rounded-md border border-[#039994] text-[#039994] font-semibold py-2 px-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px]"
                    >
                      Close
                    </button>
                  </div>
                )}

                <div className="mt-4 text-center font-sfpro text-[10px] font-[800] leading-[100%] tracking-[-0.05em] underline text-[#1E1E1E]">
                  <span>Terms and Conditions</span>
                  <span className="mx-2">&</span>
                  <span>Privacy Policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {renderCurrentModal()}

      {showInviteOperatorModal && (
        <InviteOperatorModal 
          isOpen={showInviteOperatorModal} 
          onClose={handleInviteOperatorModalClose}
        />
      )}

      {showGreenButtonInfo && renderGreenButtonInfoModal()}

      {showUtilityIframe && renderUtilityIframeModal()}

      {showVideoModal && renderVideoModal()}
    </>
  );
}