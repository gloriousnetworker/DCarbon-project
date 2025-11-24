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

export default function CommercialRegistrationModal({ isOpen, onClose, currentStep }) {
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
        } else {
          setCurrentModal('ownerOperatorDetails');
        }
      }
    } catch (error) {
      console.error('Error updating commercial role:', error);
    } finally {
      setUpdatingRole(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
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
      
      fetchCommercialData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && currentStep) {
      if (selectedRole === 'Owner') {
        handleOwnerFlow(currentStep);
      } else {
        handleOwnerOperatorFlow(currentStep);
      }
    }
  }, [isOpen, currentStep, selectedRole]);

  const handleCreateNewFacility = () => {
    if (commercialData?.commercialUser?.commercialRole) {
      const currentRole = commercialData.commercialUser.commercialRole;
      const newRole = selectedRole === 'Owner' ? 'owner' : 'both';
      
      if (currentRole !== newRole) {
        updateCommercialRole();
      } else {
        if (selectedRole === 'Owner') {
          setCurrentModal('ownerDetails');
        } else {
          setCurrentModal('ownerOperatorDetails');
        }
      }
    } else {
      updateCommercialRole();
    }
  };

  const handleContinueRegistration = () => {
    if (selectedRole === 'Owner') {
      handleOwnerFlow(nextStage);
    } else {
      handleOwnerOperatorFlow(nextStage);
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
    onClose();
    checkUserProgress();
  };

  const getHeaderTitle = () => {
    return selectedRole === 'Owner' ? "Owner's Registration" : "Owner & Operator Registration";
  };

  const getRoleDescription = (role) => {
    return role === 'Owner' 
      ? "Register as a facility owner only" 
      : "Register as both owner and operator";
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

  if (!isOpen && !currentModal && !showInviteOperatorModal) return null;

  return (
    <>
      {isOpen && !currentModal && !showInviteOperatorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <button
              onClick={onClose}
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
                  <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                    <div className="font-sfpro font-[600] text-[14px] text-blue-700 mb-2">
                      Existing Facilities ({userFacilities.length})
                    </div>
                    <select 
                      value={selectedFacility}
                      onChange={(e) => setSelectedFacility(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm font-sfpro"
                    >
                      <option value="">Select a facility to view details</option>
                      {userFacilities.map((facility) => (
                        <option key={facility.id} value={facility.id}>
                          {facility.nickname || facility.facilityName} - {facility.utilityProvider} ({getFacilityRoleDisplay(facility.commercialRole)})
                        </option>
                      ))}
                    </select>
                    {selectedFacility && (
                      <div className="mt-2 p-2 bg-white rounded border text-xs font-sfpro">
                        {userFacilities.find(f => f.id === selectedFacility)?.status && (
                          <p>Status: <span className="font-semibold">{userFacilities.find(f => f.id === selectedFacility)?.status}</span></p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block mb-3 font-sfpro text-[12px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">
                    Commercial Role for New Facility
                  </label>
                  
                  <div className="mb-3">
                    <label 
                      className={`flex items-start justify-between p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 ${
                        selectedRole === 'Owner' ? 'bg-white' : 'bg-[#F0F0F0]'
                      } relative`}
                      onMouseEnter={() => setShowOwnerTooltip(true)}
                      onMouseLeave={() => setShowOwnerTooltip(false)}
                    >
                      <div className="flex-1 pr-3">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-sfpro font-[600] text-[14px] leading-[100%] tracking-[-0.05em] text-[#1E1E1E]">
                            Owner
                          </div>
                        </div>
                        {selectedRole === 'Owner' && (
                          <div className="font-sfpro text-[12px] leading-[130%] tracking-[-0.02em] font-[400] text-[#626060]">
                            {getRoleDescription('Owner')}
                          </div>
                        )}
                      </div>
                      <input
                        type="radio"
                        name="commercialRole"
                        value="Owner"
                        checked={selectedRole === 'Owner'}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="mt-1 w-4 h-4 text-[#039994] border-gray-300 focus:ring-[#039994] flex-shrink-0"
                      />
                      {showOwnerTooltip && (
                        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-80 p-3 bg-gray-800 text-white text-xs rounded-md shadow-lg z-50">
                          <div className="font-sfpro font-[600] mb-1">Owner Role</div>
                          <div className="font-sfpro">
                            You own a solar generator asset and/or facility, but you do not Operate the asset, or the company which owns the solar asset does not pay the electric utilities billing related to the facility. A third-party tenant or management company pays the utilities accounts.
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                        </div>
                      )}
                    </label>
                  </div>

                  <div className="mb-6">
                    <label 
                      className={`flex items-start justify-between p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 ${
                        selectedRole === 'Owner & Operator' ? 'bg-white' : 'bg-[#F0F0F0]'
                      } relative`}
                      onMouseEnter={() => setShowOwnerOperatorTooltip(true)}
                      onMouseLeave={() => setShowOwnerOperatorTooltip(false)}
                    >
                      <div className="flex-1 pr-3">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-sfpro font-[600] text-[14px] leading-[100%] tracking-[-0.05em] text-[#1E1E1E]">
                            Owner & Operator
                          </div>
                        </div>
                        {selectedRole === 'Owner & Operator' && (
                          <div className="font-sfpro text-[12px] leading-[130%] tracking-[-0.02em] font-[400] text-[#626060]">
                            {getRoleDescription('Owner & Operator')}
                          </div>
                        )}
                      </div>
                      <input
                        type="radio"
                        name="commercialRole"
                        value="Owner & Operator"
                        checked={selectedRole === 'Owner & Operator'}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="mt-1 w-4 h-4 text-[#039994] border-gray-300 focus:ring-[#039994] flex-shrink-0"
                      />
                      {showOwnerOperatorTooltip && (
                        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-80 p-3 bg-gray-800 text-white text-xs rounded-md shadow-lg z-50">
                          <div className="font-sfpro font-[600] mb-1">Owner & Operator Role</div>
                          <div className="font-sfpro">
                            You both own the solar generator asset, and the same owner or company also pays the electric utilities billing related to the facility.
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                        </div>
                      )}
                    </label>
                  </div>

                  <button
                    onClick={handleCreateNewFacility}
                    disabled={loading || isNextButtonDisabled() || updatingRole}
                    className={`w-full rounded-md text-white font-semibold py-3 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] ${
                      loading || isNextButtonDisabled() || updatingRole
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-[#039994] hover:bg-[#02857f]'
                    }`}
                  >
                    {loading ? 'Loading...' : updatingRole ? 'Updating...' : hasFacilities ? `Create New Facility (${userFacilities.length} existing)` : 'Next'}
                  </button>

                  {hasFacilities && (
                    <button
                      onClick={handleContinueRegistration}
                      disabled={loading || updatingRole}
                      className={`w-full mt-3 rounded-md border border-[#039994] text-[#039994] font-semibold py-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] ${
                        loading || updatingRole ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {updatingRole ? 'Updating...' : 'Continue Registration'}
                    </button>
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
        </div>
      )}

      {renderCurrentModal()}

      {showInviteOperatorModal && (
        <InviteOperatorModal 
          isOpen={showInviteOperatorModal} 
          onClose={handleInviteOperatorModalClose}
        />
      )}
    </>
  );
}
